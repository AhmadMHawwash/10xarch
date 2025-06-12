import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import PlaygroundClient from "./client";

export const dynamic = "force-dynamic";

export default async function PlaygroundPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  try {
    return <PlaygroundClient />;
  } catch (error) {
    // If the playground isn't found, show a 404 page
    notFound();
  }
}
