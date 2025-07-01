import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSystemComponent } from "@/components/Gallery";
import { type SystemComponentType } from "@/lib/levels/type";

export interface IdentifiedComponent {
  id: string;
  name: string;
  type: 'confirmed' | 'suspected' | 'custom';
  componentType: SystemComponentType;
  confidence: number;
  details: string;
  customDescription?: string; // For custom components that don't match gallery
}

interface IdentifiedComponentsCardProps {
  components: IdentifiedComponent[];
}

const getComponentStatusColor = (type: IdentifiedComponent['type']) => {
  switch (type) {
    case 'confirmed': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700';
    case 'suspected': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700';
    case 'custom': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700';
  }
};

const getStatusIcon = (type: IdentifiedComponent['type']) => {
  switch (type) {
    case 'confirmed': return '✅';
    case 'suspected': return '⚠️';
    case 'custom': return '❓';
  }
};

export function IdentifiedComponentsCard({ components }: IdentifiedComponentsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Identified Components</CardTitle>
      </CardHeader>
      <CardContent>
        {components.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Components will appear here as they are identified...
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {components.map((component) => {
              const systemComponent = getSystemComponent(component.componentType);
              const IconComponent = systemComponent?.icon;
              
              return (
                <div
                  key={component.id}
                  className={`border rounded-lg p-3 ${getComponentStatusColor(component.type)}`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm">{getStatusIcon(component.type)}</span>
                    {IconComponent && <IconComponent className="h-4 w-4" />}
                    <span className="font-medium text-sm">{component.name}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {component.componentType}
                      </Badge>
                      <span className="text-xs">
                        {component.confidence}% confidence
                      </span>
                    </div>
                    {component.customDescription && (
                      <p className="text-xs text-muted-foreground">
                        {component.customDescription}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 