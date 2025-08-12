"use client";

import { useParams, useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FolderGit2 } from "lucide-react";

export default function AnalysisOwnerIndexPage() {
  const params = useParams();
  const router = useRouter();
  const owner = decodeURIComponent(params.owner as string);

  const { data, isLoading, error } = api.github.listReposByOwner.useQuery({ owner });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Analyses for {owner}</h1>
          <p className="text-muted-foreground">Repositories that have at least one analysis.</p>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading repositories...
          </div>
        )}

        {error && (
          <div className="text-red-600">Failed to load repositories: {String(error.message ?? error)}</div>
        )}

        {data && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.repos.map((r) => (
              <Card key={r.repo} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FolderGit2 className="h-4 w-4" /> {owner}/{r.repo}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">{r.count} analys{r.count === 1 ? "is" : "es"}</div>
                  <Button size="sm" onClick={() => router.push(`/analysis/${encodeURIComponent(owner)}/${encodeURIComponent(r.repo)}`)}>
                    View
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


