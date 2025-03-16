import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from './ui/dialog';
import { Play, SkipForward, X } from 'lucide-react';
import Image from 'next/image';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

// Local storage key for tour preference (same as in Onboarding.tsx)
const TOUR_PREFERENCE_KEY = "system-design-tour-preference";

interface WelcomeDialogProps {
  startTour: () => void;
  isFirstVisit?: boolean;
}

export function WelcomeDialog({ startTour, isFirstVisit = false }: WelcomeDialogProps) {
  const [isOpen, setIsOpen] = useState(isFirstVisit);
  const [neverShowAgain, setNeverShowAgain] = useState(false);

  // Only show dialog if it's the first visit and user hasn't opted out
  useEffect(() => {
    const tourPreference = localStorage.getItem(TOUR_PREFERENCE_KEY);
    if (tourPreference === "never-show") {
      setIsOpen(false);
    } else {
      setIsOpen(isFirstVisit);
    }
  }, [isFirstVisit]);

  const handleStartTour = () => {
    setIsOpen(false);
    
    // If user checked "Never show again", save preference
    if (neverShowAgain) {
      localStorage.setItem(TOUR_PREFERENCE_KEY, "never-show");
    }
    
    // Small delay to ensure dialog is closed before tour starts
    setTimeout(() => {
      startTour();
    }, 300);
  };

  const handleSkipTour = () => {
    setIsOpen(false);
    
    // If user checked "Never show again", save preference
    if (neverShowAgain) {
      localStorage.setItem(TOUR_PREFERENCE_KEY, "never-show");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <DialogHeader className="relative">
          <DialogTitle className="text-2xl font-bold text-center">Welcome to System Design Playground!</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Learn system design through interactive challenges
          </DialogDescription>
          <DialogClose className="absolute right-0 top-0">
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="flex flex-col items-center py-6">
          <div className="relative w-64 h-48 mb-6 rounded-lg overflow-hidden border-2 border-primary/20 shadow-md">
            {/* You can replace this with an actual screenshot or illustration */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300">System Design Canvas</span>
            </div>
          </div>
          
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 max-w-md">
            This challenge interface allows you to design systems by dragging components onto the canvas 
            and connecting them. Complete challenges to improve your system design skills.
          </p>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <Checkbox 
            id="never-show" 
            checked={neverShowAgain} 
            onCheckedChange={(checked) => setNeverShowAgain(checked as boolean)}
          />
          <Label 
            htmlFor="never-show" 
            className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
          >
            Never show this again
          </Label>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={handleSkipTour}
          >
            <SkipForward className="mr-2 h-4 w-4" />
            Skip Tour
          </Button>
          <Button 
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" 
            onClick={handleStartTour}
          >
            <Play className="mr-2 h-4 w-4" />
            Start Tour
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 