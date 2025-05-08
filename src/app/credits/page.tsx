import { type Metadata } from "next";
import { auth } from "@/lib/clerk/server";
import { redirect } from "next/navigation";
import { CreditManagement } from "@/components/credits/CreditManagement";

export const metadata: Metadata = {
  title: "AI Credits",
  description: "Manage your AI credits",
};

export default async function CreditsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold">AI Credits</h1>
          <p className="text-muted-foreground">
            Purchase and manage your AI credits
          </p>
        </div>
        <CreditManagement />
      </div>
    </div>
  );
}
