"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { Star } from "lucide-react";

export function AccountContext() {
  const { userId, orgId } = useAuth();
  const { user } = useUser();

  if (!userId) return null;

  const getCurrentContext = () => {
    if (orgId) {
      const orgName = user?.organizationMemberships?.find(
        (membership) => membership.organization.id === orgId
      )?.organization.name ?? "Organization";
      return { type: "Organization", name: orgName };
    }
    return { type: "Personal", name: "Personal Account" };
  };

  const context = getCurrentContext();

  return (
    <div className="rounded-lg border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100 p-6 shadow-md dark:border-blue-600 dark:from-blue-900/40 dark:to-blue-800/40 mb-8">
      <div className="flex items-center justify-center">
        <Star className="mr-3 h-6 w-6 text-blue-600 dark:text-blue-400" />
        <div className="text-center">
          <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
            Managing Credits For
          </div>
          <div className="text-xl font-extrabold text-blue-900 dark:text-white mt-1">
            {context.name} ({context.type})
          </div>
        </div>
      </div>
    </div>
  );
} 