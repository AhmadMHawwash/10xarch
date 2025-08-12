"use client";

import { useParams } from "next/navigation";
import RepositoryAnalysisView from "@/app/analysis/repo/RepositoryAnalysisView";

export default function AnalysisOwnerRepoPage() {
  const params = useParams();
  const owner = decodeURIComponent(params.owner as string);
  const repo = decodeURIComponent(params.repo as string);
  return <RepositoryAnalysisView owner={owner} repo={repo} />;
}


