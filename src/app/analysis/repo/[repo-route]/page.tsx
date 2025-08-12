"use client";

import { useParams } from "next/navigation";
import RepositoryAnalysisView from "../RepositoryAnalysisView";

export default function RepositoryAnalysisPage() {
  const params = useParams();
  const repoRoute = params["repo-route"] as string;
  return <RepositoryAnalysisView repoRoute={repoRoute} />;
}


