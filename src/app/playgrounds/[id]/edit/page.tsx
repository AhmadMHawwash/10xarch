import { type Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";
import EditPlaygroundClient from "./client";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const { playground } = await api.playgrounds.getById(params.id);
    return {
      title: `Edit ${playground.title} - System Design Playground`,
      description: "Edit your system design playground",
    };
  } catch (error) {
    return {
      title: "Edit Playground - System Design Playground",
      description: "Edit your system design playground",
    };
  }
}

export default async function EditPlaygroundPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/signin");
  }

  try {
    const { playground } = await api.playgrounds.getById(params.id);

    // Check if user has edit access (owner or editor)
    const hasEditAccess =
      (playground.ownerType === "user" && playground.ownerId === userId) ||
      playground.editorIds?.includes(userId);

    if (!hasEditAccess) {
      // Redirect to view page if user doesn't have edit access
      redirect(`/playgrounds/${params.id}`);
    }

    return <EditPlaygroundClient playground={playground} />;
  } catch (error) {
    // If the playground isn't found, show a 404 page
    notFound();
  }
}
