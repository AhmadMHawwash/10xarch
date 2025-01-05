import { Waitlist } from "@clerk/nextjs";
import { Hourglass } from "lucide-react";

export default function WaitlistPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <Hourglass className="h-12 w-12" />
          <h2 className="mt-6 flex items-center text-3xl font-bold tracking-tight">
            Join our Waitlist
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            We are currently at capacity. Sign up to be notified when spots open
            up!
          </p>
        </div>
        <div className="flex items-center justify-center">
          <Waitlist />
        </div>
      </div>
    </div>
  );
}
