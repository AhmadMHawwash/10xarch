"use client";

import { useParams } from "next/navigation";
import RepositoryAnalysisView from "../../RepositoryAnalysisView";

export default function RepositoryAnalysisWithIdPage() {
  const params = useParams();
  const repoRoute = params["repo-route"] as string;
  const analysisId = params.analysisId as string;
  return <RepositoryAnalysisView repoRoute={repoRoute} analysisId={analysisId} />;
}


