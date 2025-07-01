import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Loader2 } from "lucide-react";
import type { ExpertStatus } from "./AnalysisExpertCard";

interface CurrentAnalysisCardProps {
  experts: ExpertStatus[];
  overallProgress: number;
}

export function CurrentAnalysisCard({ experts, overallProgress }: CurrentAnalysisCardProps) {
  const currentExpert = experts.find(e => e.status === 'analyzing');
  const isComplete = overallProgress >= 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        {currentExpert ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <span className="font-medium">
                {currentExpert.name} is working...
              </span>
            </div>
            {currentExpert.currentTask && (
              <p className="text-sm text-muted-foreground">
                {currentExpert.currentTask}
              </p>
            )}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{currentExpert.progress}%</span>
              </div>
              <Progress value={currentExpert.progress} />
            </div>
          </div>
        ) : isComplete ? (
          <div className="text-center py-4">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-green-600 font-medium">Analysis Complete!</p>
            <p className="text-sm text-muted-foreground mt-1">
              All experts have finished analyzing the repository
            </p>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <div className="animate-pulse">
              <div className="h-4 w-4 bg-gray-300 rounded-full mx-auto mb-2"></div>
              <p>Preparing analysis...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 