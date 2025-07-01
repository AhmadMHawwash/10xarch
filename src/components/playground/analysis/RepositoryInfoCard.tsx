import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface RepositoryInfo {
  language: string;
  architecture: string;
  framework: string;
  dependencies: number;
  packageManager?: string;
  estimatedTokens?: number;
}

interface RepositoryInfoCardProps {
  repositoryInfo: RepositoryInfo;
  repositoryUrl?: string;
}

export function RepositoryInfoCard({ repositoryInfo, repositoryUrl }: RepositoryInfoCardProps) {
  const getLanguageBadgeColor = (language: string) => {
    switch (language.toLowerCase()) {
      case 'node.js':
      case 'javascript':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'python':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'typescript':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatRepositoryName = (url: string) => {
    try {
      const parts = url.split('/');
      return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
    } catch {
      return url;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Repository Info</CardTitle>
        {repositoryUrl && (
          <p className="text-sm text-muted-foreground">
            {formatRepositoryName(repositoryUrl)}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span>Language:</span>
            <Badge className={getLanguageBadgeColor(repositoryInfo.language)}>
              {repositoryInfo.language}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Architecture:</span>
            <span className="font-medium">{repositoryInfo.architecture}</span>
          </div>
          <div className="flex justify-between">
            <span>Framework:</span>
            <span className="font-medium">{repositoryInfo.framework}</span>
          </div>
          <div className="flex justify-between">
            <span>Dependencies:</span>
            <span className="font-medium">{repositoryInfo.dependencies}</span>
          </div>
          {repositoryInfo.packageManager && (
            <div className="flex justify-between">
              <span>Package Manager:</span>
              <span className="font-medium">{repositoryInfo.packageManager}</span>
            </div>
          )}
          {repositoryInfo.estimatedTokens && (
            <div className="flex justify-between">
              <span>Est. Tokens:</span>
              <span className="font-medium">~{repositoryInfo.estimatedTokens.toLocaleString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 