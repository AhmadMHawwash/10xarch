"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useUser, useOrganization, useAuth, useClerk } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Building,
  ChevronDown,
  LogOut,
  PlusCircle,
  RefreshCw,
  Settings,
  User,
  Coins,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useCredits } from "@/hooks/useCredits";
import Link from "next/link";

export default function UserMenu() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut } = useAuth();
  const { organization, isLoaded: isOrgLoaded } = useOrganization();
  const clerk = useClerk();
  const { openOrganizationProfile, openUserProfile } = clerk;
  const pathname = usePathname();
  const isPricingPage = pathname.includes("/pricing");
  const isCreditsPage = pathname.includes("/credits");
  const {
    expiringTokens,
    expiringTokensExpiry,
    nonexpiringTokens,
    totalUsableTokens: totalTokens,
    isLoading: isLoadingCredits,
    hasValidData,
  } = useCredits();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [orgs, setOrgs] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(false);
  const [isSwitchingOrg, setIsSwitchingOrg] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const initialized = useRef(false);
  const lastFocusTime = useRef<number>(Date.now());

  // Get the current organization display info
  const currentOrgInfo = useMemo(() => {
    if (selectedOrgId === "personal" || !selectedOrgId) {
      return {
        id: "personal",
        name: "Personal Account",
        icon: <User className="mr-2 h-4 w-4 text-primary" />,
      };
    }

    const selectedOrg = orgs.find((org) => org.id === selectedOrgId);
    return {
      id: selectedOrgId,
      name: selectedOrg?.name ?? organization?.name ?? "Organization",
      icon: <Building className="mr-2 h-4 w-4 text-primary" />,
    };
  }, [selectedOrgId, orgs, organization?.name]);

  // Sync the selectedOrgId with the current organization
  useEffect(() => {
    if (organization?.id) {
      setSelectedOrgId(organization.id);
    } else {
      setSelectedOrgId("personal");
    }
  }, [organization?.id]);

  // Fetch organizations manually using the Clerk client
  const fetchOrganizations = async () => {
    if (!clerk.session) return;

    try {
      setIsLoadingOrgs(true);

      // Get user's organizations directly from the Clerk client
      const userOrgs = await clerk.user?.getOrganizationMemberships();

      if (userOrgs?.data) {
        const organizationList = userOrgs.data.map((membership) => ({
          id: membership.organization.id,
          name: membership.organization.name,
        }));

        setOrgs(organizationList);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
    } finally {
      setIsLoadingOrgs(false);
    }
  };

  // Load organizations when component mounts
  useEffect(() => {
    if (!initialized.current && clerk.session) {
      initialized.current = true;
      void fetchOrganizations();
    }
  }, [clerk.session]);

  // Listen for organization changes from Clerk
  useEffect(() => {
    if (!clerk.session) return;

    // Function to check for organization updates
    const handleOrganizationUpdate = async () => {
      await fetchOrganizations();
    };

    // Set up listeners for Clerk organization events
    const unsubscribe = clerk.addListener((event) => {
      // Refresh organizations list on any Clerk event
      // This is a simpler approach than trying to filter specific events
      void handleOrganizationUpdate();
    });

    return () => {
      unsubscribe();
    };
  }, [clerk.session]);

  // Listen for window focus/blur to update organizations when user returns to the app
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const now = Date.now();
        // Only refresh if it's been more than 5 seconds since the last refresh
        // This prevents unnecessary refreshes when quickly switching tabs
        if (now - lastFocusTime.current > 5000) {
          void fetchOrganizations();
          lastFocusTime.current = now;
        }
      }
    };

    const handleFocus = () => {
      const now = Date.now();
      if (now - lastFocusTime.current > 5000) {
        void fetchOrganizations();
        lastFocusTime.current = now;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  if (!isUserLoaded || !isOrgLoaded) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 animate-pulse rounded-full"
      >
        <Avatar className="h-8 w-8 ring-2 ring-primary/20">
          <AvatarFallback className="bg-secondary">...</AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  // Get initial letters for avatar fallback
  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`
      : user?.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase();

  // Handle organization related actions
  const handleOrganizationAction = async (action: string, orgId?: string) => {
    try {
      setIsDropdownOpen(false);
      setIsSwitchingOrg(true);

      switch (action) {
        case "personal":
          await clerk.setActive({ organization: null });
          setSelectedOrgId("personal");
          break;
        case "create":
          clerk.openCreateOrganization({
            afterCreateOrganizationUrl: window.location.href,
          });
          // Will refresh organizations on focus/visibility change when returning from modal
          break;
        case "refresh":
          await fetchOrganizations();
          break;
        case "switch":
          if (orgId) {
            await clerk.setActive({ organization: orgId });
            if (isPricingPage || isCreditsPage) {
              // because of a bug, quickest way to refresh the page is to reload to show the correct context for subscription pricing table
              window.location.reload();
            }
            setSelectedOrgId(orgId);
          }
          break;
        case "manage":
          // Open the appropriate settings panel based on what's selected
          if (selectedOrgId === "personal") {
            openUserProfile();
          } else {
            openOrganizationProfile();
          }
          // Will refresh organizations on focus/visibility change when returning from modal
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error performing organization action:", error);
    } finally {
      setIsSwitchingOrg(false);
    }
  };

  // Handle organization selection from dropdown
  const handleOrganizationSwitch = async (value: string) => {
    // Prevent changing during an ongoing operation
    if (isSwitchingOrg) return;

    if (value === "personal") {
      await handleOrganizationAction("personal");
    } else if (value === "create-new") {
      await handleOrganizationAction("create");
    } else if (
      value !== "info" &&
      value !== "separator" &&
      value !== "loading"
    ) {
      await handleOrganizationAction("switch", value);
    }
  };

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-2 rounded-full p-1 pr-3 transition-all duration-200 hover:bg-primary/10",
            isDropdownOpen && "bg-primary/10 ring-2 ring-primary/20",
          )}
        >
          <Avatar
            className={cn(
              "h-8 w-8 border border-transparent transition-all duration-300",
              isDropdownOpen
                ? "ring-2 ring-primary/30"
                : "hover:border-primary/30",
            )}
          >
            <AvatarImage src={user?.imageUrl} alt={user?.fullName ?? "User"} />
            <AvatarFallback className="bg-primary/10 font-medium text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-gray-900 dark:text-white max-w-32 truncate">
              {currentOrgInfo.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {currentOrgInfo.id === "personal" ? "Personal" : "Organization"}
            </span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              isDropdownOpen && "rotate-180 transform text-primary",
            )}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 rounded-xl border border-primary/10 bg-gradient-to-b from-background to-background/95 p-2 shadow-lg backdrop-blur-sm"
      >
        {/* User Identity Section */}
        <DropdownMenuLabel className="rounded-lg bg-primary/5 px-4 py-3 font-normal">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarImage
                src={user?.imageUrl}
                alt={user?.fullName ?? "User"}
              />
              <AvatarFallback className="bg-primary/10 font-medium text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-sm font-medium text-foreground">
                {user?.fullName ?? "User"}
              </p>
              <p className="max-w-[180px] truncate text-xs text-muted-foreground">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>


        <DropdownMenuSeparator className="my-1 opacity-20" />

        {/* Account Selection with Settings Button */}
        <DropdownMenuGroup>
          <div className="p-1">
            <div className="flex items-center justify-between">
              <Select
                value={selectedOrgId ?? organization?.id ?? "personal"}
                onValueChange={handleOrganizationSwitch}
                disabled={isSwitchingOrg}
              >
                <SelectTrigger
                  className={cn(
                    "relative h-10 rounded-lg border-0 text-sm",
                    "bg-secondary/50 ring-offset-0 focus:ring-2 focus:ring-primary/20",
                    "transition-all duration-200 hover:bg-secondary",
                    isSwitchingOrg && "animate-pulse",
                  )}
                >
                  {isSwitchingOrg ? (
                    <div className="flex items-center gap-2 text-primary/70">
                      <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />
                      <span>Switching...</span>
                    </div>
                  ) : (
                    <div className="flex w-full items-center overflow-hidden">
                      {currentOrgInfo.icon}
                      <span className="truncate font-medium">
                        {currentOrgInfo.name}
                      </span>
                    </div>
                  )}
                </SelectTrigger>

                <SelectContent className="max-h-80 overflow-y-auto rounded-lg border border-primary/10 bg-gradient-to-b from-background to-background/95 shadow-xl backdrop-blur-sm">
                  {/* Personal Account Option */}
                  <SelectItem
                    value="personal"
                    className={cn(
                      "my-0.5 cursor-pointer rounded-md py-2.5 text-sm transition-colors duration-200",
                      "focus:bg-primary/10 focus:text-primary",
                      selectedOrgId === "personal" &&
                        "bg-primary/10 text-primary",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <User
                        className={cn(
                          "h-3.5 w-3.5",
                          selectedOrgId === "personal"
                            ? "text-primary"
                            : "text-primary/70",
                        )}
                      />
                      <span className="font-medium">Personal Account</span>
                    </div>
                  </SelectItem>

                  {/* Organizations List Separator */}
                  {orgs.length > 0 && (
                    <div className="mx-auto my-2 h-px w-full bg-primary/10"></div>
                  )}

                  {/* Organizations List */}
                  {isLoadingOrgs ? (
                    <div className="flex items-center justify-center py-3 text-xs text-muted-foreground">
                      <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin text-primary/70" />
                      <span>Loading organizations...</span>
                    </div>
                  ) : (
                    orgs.map((org) => (
                      <SelectItem
                        key={org.id}
                        value={org.id}
                        className={cn(
                          "my-0.5 cursor-pointer rounded-md py-2.5 text-sm transition-colors duration-200",
                          "focus:bg-primary/10 focus:text-primary",
                          selectedOrgId === org.id &&
                            "bg-primary/10 text-primary",
                        )}
                      >
                        <div className="flex w-full items-center gap-2 overflow-hidden">
                          <Building
                            className={cn(
                              "h-3.5 w-3.5 flex-shrink-0",
                              selectedOrgId === org.id
                                ? "text-primary"
                                : "text-primary/70",
                            )}
                          />
                          <span className="truncate font-medium">
                            {org.name}
                          </span>
                          {selectedOrgId === org.id && (
                            <span className="ml-auto flex-shrink-0 text-primary">
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3.5 w-3.5"
                              >
                                <path
                                  d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                                  fill="currentColor"
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                ></path>
                              </svg>
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}

                  {/* Create New Organization Option */}
                  <div className="mx-auto my-2 h-px w-full bg-primary/10"></div>
                  <SelectItem
                    value="create-new"
                    className="my-0.5 cursor-pointer rounded-md py-2.5 text-sm text-primary transition-colors duration-200 focus:bg-primary/10"
                  >
                    <div className="flex items-center gap-2">
                      <PlusCircle className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium">
                        Create New Organization
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 w-7 rounded-full p-0 transition-all duration-200",
                  "hover:bg-primary/10 hover:text-primary",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20",
                  "ml-2",
                )}
                onClick={() => handleOrganizationAction("manage")}
                disabled={isSwitchingOrg}
                title={`Manage ${currentOrgInfo.id === "personal" ? "profile" : "organization"} settings`}
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </DropdownMenuGroup>

        {/* Token Balance Section */}
        <DropdownMenuGroup>
          <div className="p-1">
            <Link 
              href="/balance"
              className="block rounded-lg bg-gradient-to-br from-blue-50/80 to-blue-100/80 dark:from-blue-900/20 dark:to-blue-800/20 p-3 transition-all duration-200 hover:from-blue-100/90 hover:to-blue-200/90 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30"
              onClick={() => setIsDropdownOpen(false)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Token Balance
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 -rotate-90 text-blue-600 dark:text-blue-400" />
              </div>
              
              {isLoadingCredits || !hasValidData ? (
                <div className="mt-2 flex items-center gap-2">
                  <RefreshCw className="h-3 w-3 animate-spin text-blue-600/70 dark:text-blue-400/70" />
                  <span className="text-xs text-blue-700/70 dark:text-blue-300/70">Loading...</span>
                </div>
              ) : (
                <div className="mt-2 space-y-1">
                  <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                    {totalTokens.toLocaleString()} tokens
                  </div>
                  
                  {(expiringTokens > 0 || nonexpiringTokens > 0) && (
                    <div className="space-y-0.5 text-xs">
                      {expiringTokens > 0 && (
                        <div className="flex justify-between text-amber-700 dark:text-amber-300">
                          <span>Expiring:</span>
                          <span className="font-medium">
                            {expiringTokens.toLocaleString()}
                            {expiringTokensExpiry && (
                              <span className="ml-1 text-amber-600 dark:text-amber-400">
                                ({new Date(expiringTokensExpiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                      
                      {nonexpiringTokens > 0 && (
                        <div className="flex justify-between text-green-700 dark:text-green-300">
                          <span>Permanent:</span>
                          <span className="font-medium">{nonexpiringTokens.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Link>
          </div>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1 opacity-20" />

        {/* Sign Out Button */}
        <DropdownMenuItem
          className={cn(
            "mx-1 cursor-pointer rounded-md p-2.5 text-sm transition-colors duration-200",
            "text-white/80 bg-destructive/40",
            "border border-destructive/20 shadow-sm",
            "hover:!bg-destructive/60 hover:border-destructive/30 hover:shadow-md",
            "focus:outline-none focus:ring-2 focus:ring-destructive/30",
            "font-medium",
          )}
          onClick={() => void signOut()}
          disabled={isSwitchingOrg}
        >
          <div className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            <span className="font-medium">Sign out</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
