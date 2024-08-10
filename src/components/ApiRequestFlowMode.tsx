import { useSystemDesigner } from "@/lib/hooks/useSystemDesigner";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

export const ApiRequestFlowModeMode = () => {
  const { toggleApiRequestFlowModeMode, isApiRequestFlowMode } = useSystemDesigner();
  return (
    <div className="mr-6 flex items-center space-x-2 w-max-20 flex-wrap">
      <Switch
        checked={isApiRequestFlowMode}
        onCheckedChange={() => toggleApiRequestFlowModeMode()}
        id="data-flow"
      />
      <Label htmlFor="data-flow">API Request Flow Mode</Label>
    </div>
  );
};
