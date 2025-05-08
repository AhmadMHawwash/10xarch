import { useUser } from "@/lib/clerk/client";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { type User, users } from "@/server/db/schema";

export function useCurrentUser() {
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useUser();

  // const { data: dbUser, isLoading: isDbLoading } = useQuery<User | null>({
  //   queryKey: ["currentUser", clerkUser?.id],
  //   queryFn: async () => {
  //     if (!clerkUser?.id) return null;
  //     const result = await db
  //       .select()
  //       .from(users)
  //       .where(eq(users.id, clerkUser.id));
  //     return result[0] ?? null;
  //   },
  //   enabled: isClerkLoaded && !!clerkUser?.id,
  // });

  return {
    clerkUser,
    // user: dbUser,
    isSignedIn,
    isLoading: !isClerkLoaded,
  };
}
