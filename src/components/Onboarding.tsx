import { useEffect, useState, useRef } from "react";
import { driver, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { Button } from "./ui/button";
import { HelpCircle } from "lucide-react";
import { WelcomeDialog } from "./WelcomeDialog";
import { type LucideIcon } from "lucide-react";

interface OnboardingProps {
  isFirstVisit?: boolean;
  className?: string;
  buttonClassName?: string;
  icon?: LucideIcon;
}

// Local storage key for tour preference
export const TOUR_PREFERENCE_KEY = "system-design-tour-preference";

export function Onboarding({
  isFirstVisit = false,
  className = "fixed right-4 bottom-4 z-50",
  buttonClassName = "rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md",
  icon: Icon = HelpCircle,
}: OnboardingProps) {
  const [driverObj, setDriverObj] = useState<Driver | null>(null);
  const driverRef = useRef<Driver | null>(null);
  const [showTourButton, setShowTourButton] = useState(true);

  useEffect(() => {
    // Check if user has opted out of the tour
    const tourPreference = localStorage.getItem(TOUR_PREFERENCE_KEY);
    if (tourPreference === "never-show") {
      setShowTourButton(false);
    }

    // Initialize driver.js
    const driverInstance = driver({
      showProgress: true,
      animate: true,
      showButtons: ["close", "next", "previous"],
      nextBtnText: "Next",
      prevBtnText: "Previous",
      doneBtnText: "Done",
      allowClose: true, // Ensure the tour can be closed
      steps: [
        // Overview of main sections
        {
          element: "#challenge-content",
          popover: {
            title: "Challenge Information",
            description:
              "This panel contains the challenge description, requirements, and learning objectives.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "#system-designer",
          popover: {
            title: "System Designer",
            description:
              "Use this canvas to design your system. Drag and drop components from the sidebar to build your solution.",
            side: "left",
            align: "center",
          },
        },

        // Components Gallery
        {
          element: ".component-gallery",
          popover: {
            title: "Components Gallery",
            description:
              "Browse through these components and drag them onto the canvas to build your system design.",
            side: "right",
            align: "start",
          },
        },
        {
          element: ".component-item",
          popover: {
            title: "Drag & Drop Components",
            description:
              "Click and drag a component onto the canvas. You can then connect components by dragging from one node to another.",
            side: "right",
            align: "start",
          },
        },

        // Canvas Interactions
        {
          element: ".react-flow__pane",
          popover: {
            title: "Canvas Interactions",
            description:
              "Use trackpad to pan the canvas. Use the trackpad pinch to zoom in and out.",
            side: "left",
            align: "center",
          },
        },

        // Solution Manager
        {
          element: "#flow-manager",
          popover: {
            title: "Solution Manager",
            description:
              "Check your solution and see feedback here. You can move to the next stage when you score at least 80%.",
            side: "top",
            align: "start",
          },
        },
        {
          element: ".check-solution-button",
          popover: {
            title: "Evaluate Solution using AI",
            description:
              "Click this button to submit your design for evaluation. You'll receive feedback and a score based on your solution.",
            side: "top",
            align: "start",
          },
        },
        {
          element: ".feedback-section",
          popover: {
            title: "Feedback Section",
            description:
              "After checking your solution, you'll see feedback here, including strengths, areas for improvement, and recommendations.",
            side: "top",
            align: "start",
          },
        },

        {
          element: ".stage-progress",
          popover: {
            title: "Stage Progress",
            description:
              "This shows your progress through the challenge stages. Each stage builds on the previous one.",
            side: "bottom",
            align: "center",
          },
        },

        {
          element: ".stage-badge",
          popover: {
            title: "Current Stage",
            description:
              "This shows which stage you're currently working on and how many stages are in the challenge.",
            side: "left",
            align: "center",
          },
        },

        // Help and Resources
        {
          element: ".references-section",
          popover: {
            title: "References & Resources",
            description:
              "Access learning resources and key system design components to help you build better solutions.",
            side: "right",
            align: "start",
          },
        },
        {
          element: ".ai-chat-container",
          popover: {
            title: "AI Chat Assistant",
            description:
              "Get help with your system design by chatting with our AI assistant. Ask questions about design patterns, best practices, or specific implementation details.",
            side: "left",
            align: "center",
          },
        },
        {
          element: "#help-button",
          popover: {
            title: "Need Help?",
            description: "Click this button anytime to restart the tour.",
            side: "bottom",
            align: "center",
          },
        },
      ],
      onDestroyed: () => {
        // This will be called after the tour is destroyed
        console.log("Tour was destroyed");
      },
    });

    // Store the driver instance in both state and ref
    setDriverObj(driverInstance);
    driverRef.current = driverInstance;

    // Add custom event listeners to handle the Done and X buttons
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close the tour on Escape key
      if (e.key === "Escape" && driverRef.current) {
        driverRef.current.destroy();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      // Clean up on unmount
      document.removeEventListener("keydown", handleKeyDown);
      if (driverRef.current) {
        driverRef.current.destroy();
      }
    };
  }, []);

  const startTour = () => {
    if (driverObj) {
      // Drive the tour
      driverObj.drive();

      // Wait for the tour to be fully initialized
      setTimeout(() => {
        // Handle close button
        handleCloseButton();
      }, 500);
    }
  };

  const handleCloseButton = () => {
    const closeBtn = document.querySelector(".driver-close-btn");
    if (closeBtn) {
      // Remove existing click listeners by cloning
      const newCloseBtn = closeBtn.cloneNode(true);
      closeBtn.parentNode?.replaceChild(newCloseBtn, closeBtn);

      // Add new click listener
      newCloseBtn.addEventListener("click", () => {
        // Show the dialog but ensure tour is destroyed if dialog is dismissed
        if (driverObj) {
          showNeverShowAgainPrompt();
        }
      });
    }

    // Also handle dynamically created close buttons for each step
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          const closeButton = document.querySelector(".driver-close-btn");
          if (
            closeButton &&
            !closeButton.hasAttribute("data-listener-attached")
          ) {
            closeButton.setAttribute("data-listener-attached", "true");
            closeButton.addEventListener("click", () => {
              if (driverObj) {
                showNeverShowAgainPrompt();
              }
            });
          }
        }
      }
    });

    const popoverWrapper = document.querySelector(".driver-popover-wrapper");
    if (popoverWrapper) {
      observer.observe(popoverWrapper, { childList: true, subtree: true });
    }
  };

  // Simplified prompt that ensures tour is destroyed if confirmed
  const showNeverShowAgainPrompt = () => {
    if (!driverObj) return;

    // Ask if user wants to end tour
    const wantToEnd = window.confirm("Do you want to end the tour?");

    if (wantToEnd) {
      // Ask if they want to never show it again
      const neverShowAgain = window.confirm(
        "Would you like to never show this tour again?",
      );

      if (neverShowAgain) {
        localStorage.setItem(TOUR_PREFERENCE_KEY, "never-show");
        setShowTourButton(false);
      }

      // Always destroy the tour if they confirmed ending it
      driverObj.destroy();
    }
  };

  return (
    <>
      <WelcomeDialog
        startTour={startTour}
        isFirstVisit={isFirstVisit && showTourButton}
      />


        <div id="help-button" className={className}>
          <Button
            variant="ghost"
            size="icon"
            onClick={startTour}
            title="Start Tour"
            className={buttonClassName}
          >
            <Icon className="h-5 w-5" />
            <span className="sr-only">Start Tour</span>
          </Button>
        </div>
    </>
  );
}
