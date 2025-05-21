"use client";

import { OrganizationProfile } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function OrganizationSettingsPage() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="container flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="container mx-auto flex min-h-[80vh] flex-col items-center justify-center">
        <h1 className="mb-8 text-center text-3xl font-bold">
          Organization Settings
        </h1>
        <p className="text-center text-muted-foreground">
          Please sign in to manage your organization settings.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-10 text-3xl font-bold">Organization Settings</h1>

      <div className="flex justify-center w-full">
        <div>
          <OrganizationProfile
            appearance={{
              elements: {
                rootBox: {
                  borderRadius: "0.5rem",
                  boxShadow: "none",
                },
                card: {
                  border: "none",
                  boxShadow: "none",
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
