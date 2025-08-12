import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Clock, ExternalLink, Key, Zap } from 'lucide-react';

interface RateLimitWarningProps {
  error: string;
  onDismiss?: () => void;
  showTokenHelp?: boolean;
}

export function RateLimitWarning({ error, onDismiss, showTokenHelp = true }: RateLimitWarningProps) {
  const resetTimeMatch = error.match(/resets at (\d{1,2}:\d{2}:\d{2})/);
  const resetTime = resetTimeMatch ? resetTimeMatch[1] : null;

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
          <AlertTriangle className="h-5 w-5" />
          GitHub API Rate Limit Reached
        </CardTitle>
        <CardDescription className="text-orange-700 dark:text-orange-300">
          {error}
        </CardDescription>
      </CardHeader>
      
      {showTokenHelp && (
        <CardContent className="space-y-4">
          <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg dark:border-blue-800 dark:bg-blue-950">
            <div className="flex items-center gap-2 mb-2">
              <Key className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Boost Your Rate Limit
              </h4>
            </div>
            <div className="text-blue-800 dark:text-blue-200">
              <p className="mb-2">
                Unauthenticated requests are limited to <strong>60 per hour</strong>. 
                With a GitHub Personal Access Token, you get <strong>5,000 requests per hour</strong>!
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href="https://github.com/settings/tokens?type=beta" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    <Key className="h-3 w-3" />
                    Create Token
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href="https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    Learn More
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-medium text-orange-900 dark:text-orange-100">
                <Zap className="h-4 w-4" />
                Quick Solutions
              </div>
              <ul className="space-y-1 text-orange-800 dark:text-orange-200 pl-6">
                <li>• Provide a GitHub Personal Access Token above</li>
                <li>• Try again in a few minutes</li>
                <li>• Use a different network connection</li>
              </ul>
            </div>

            {resetTime && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium text-orange-900 dark:text-orange-100">
                  <Clock className="h-4 w-4" />
                  Rate Limit Reset
                </div>
                <div className="text-orange-800 dark:text-orange-200 pl-6">
                  Your rate limit will reset at <strong>{resetTime}</strong>
                </div>
              </div>
            )}
          </div>

          {onDismiss && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={onDismiss}>
                Dismiss
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
} 