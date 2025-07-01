import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface AnalysisLogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  expert?: string;
}

interface AnalysisLogCardProps {
  entries: AnalysisLogEntry[];
  maxHeight?: number;
}

const getMessageIcon = (type: AnalysisLogEntry['type']) => {
  switch (type) {
    case 'success': return '✓';
    case 'warning': return '⚠️';
    case 'error': return '❌';
    default: return '🔍';
  }
};

const getMessageColor = (type: AnalysisLogEntry['type']) => {
  switch (type) {
    case 'success': return 'text-green-600 dark:text-green-400';
    case 'warning': return 'text-yellow-600 dark:text-yellow-400';
    case 'error': return 'text-red-600 dark:text-red-400';
    default: return 'text-blue-600 dark:text-blue-400';
  }
};

export function AnalysisLogCard({ entries, maxHeight = 200 }: AnalysisLogCardProps) {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Analysis Log
          {entries.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {entries.length} entries
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea style={{ height: `${maxHeight}px` }}>
          {entries.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Analysis log will appear here...
            </p>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start space-x-2 text-sm border-l-2 border-gray-200 dark:border-gray-700 pl-3 py-1"
                >
                  <span className="text-xs mt-0.5">
                    {getMessageIcon(entry.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className={`font-mono text-xs ${getMessageColor(entry.type)}`}>
                        {formatTime(entry.timestamp)}
                      </span>
                      {entry.expert && (
                        <Badge variant="outline" className="text-xs">
                          {entry.expert}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm mt-0.5 break-words">
                      {entry.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 