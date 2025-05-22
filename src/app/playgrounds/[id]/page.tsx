import { type Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const { playground } = await api.playgrounds.getById(params.id);
    return {
      title: `${playground.title} - System Design Playground`,
      description:
        playground.description ?? "View and edit your system design playground",
    };
  } catch (error) {
    return {
      title: "Playground - System Design Playground",
      description: "View and edit your system design playground",
    };
  }
}

export default async function PlaygroundPage({
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

    // This is just a placeholder for now - you'll want to integrate with your actual
    // playground component here
    return (
      <div className="container mx-auto py-8">
        <h1 className="mb-6 text-3xl font-bold">{playground.title}</h1>

        {playground.description && (
          <p className="mb-6 text-muted-foreground">{playground.description}</p>
        )}

        <div className="rounded-lg border p-4">
          <pre className="text-sm">
            {JSON.stringify(playground.jsonBlob, null, 2)}
          </pre>
        </div>
      </div>
    );
  } catch (error) {
    // If the playground isn't found, show a 404 page
    notFound();
  }
}
