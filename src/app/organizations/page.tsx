"use client";

import { useAuth, OrganizationList } from "@clerk/nextjs";
import { Loader2, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OrganizationsPage() {
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
        <h1 className="mb-8 text-center text-3xl font-bold">Organizations</h1>
        <p className="text-center text-muted-foreground">
          Please sign in to view and manage your organizations.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Organizations</h1>
        <Button asChild className="flex items-center gap-2">
          <Link href="/create-organization">
            <PlusCircle className="h-4 w-4" />
            Create Organization
          </Link>
        </Button>
      </div>

      <div className="flex w-full justify-center">
        <div>
          <OrganizationList
            hidePersonal={false}
            afterSelectOrganizationUrl="/"
            afterCreateOrganizationUrl="/"
            appearance={{
              elements: {
                rootBox: {
                  boxShadow: "none",
                  width: "100%",
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
