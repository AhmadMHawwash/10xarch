import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";

export interface ExpertStatus {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  progress: number;
  currentTask?: string;
  findings?: number;
}

interface AnalysisExpertCardProps {
  experts: ExpertStatus[];
  overallProgress: number;
}

const getStatusIcon = (status: ExpertStatus['status']) => {
  switch (status) {
    case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'analyzing': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
    default: return <Clock className="h-4 w-4 text-gray-400" />;
  }
};

export function AnalysisExpertCard({ experts, overallProgress }: AnalysisExpertCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Progress Overview
          <Badge variant="outline">{Math.round(overallProgress)}%</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={overallProgress} className="mb-4" />
        <div className="space-y-3">
          {experts.map((expert) => (
            <div key={expert.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(expert.status)}
                <span className="text-sm">{expert.name}</span>
                {expert.findings && (
                  <Badge variant="secondary" className="text-xs">
                    {expert.findings} found
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {expert.progress}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 