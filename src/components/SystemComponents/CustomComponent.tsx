import { useSystemDesigner } from "@/lib/hooks/_useSystemDesigner";
import { type ComponentNodeProps } from "../ReactflowCustomNodes/SystemComponentNode";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Muted, Small } from "../ui/typography";
import { WithSettings } from "./Wrappers/WithSettings";

export function CustomComponent({
  name,
  nodeId,
  Icon,
  nodeSettingsRef,
}: ComponentNodeProps) {
  const { useSystemComponentConfigSlice } = useSystemDesigner();
  // Use the provided hook for config slices instead of custom implementation
  const [displayName, setDisplayName] = useSystemComponentConfigSlice<string>(
    nodeId!,
    "display name",
    "Custom Component",
  );

  const [subtitle, setSubtitle] = useSystemComponentConfigSlice<string>(
    nodeId!,
    "subtitle",
    "",
  );

  const [freeFormText, setFreeFormText] = useSystemComponentConfigSlice<string>(
    nodeId ?? name,
    "free-form text",
    "",
  );

  return (
    <div className="flex flex-col items-center text-gray-800 dark:text-gray-200">
      <div className="flex flex-col items-center gap-1">
        {Icon && (
          <Icon size={20} className="text-gray-700 dark:text-gray-300" />
        )}
        <Small>{displayName || "Custom Component"}</Small>
        {subtitle && <Muted>{subtitle}</Muted>}
      </div>
      {/* Settings dialog */}
      <WithSettings
        id={nodeId ?? name}
        name={displayName || "Custom Component"}
        nodeSettingsRef={nodeSettingsRef}
      >
        <div className="flex h-full w-full flex-col gap-4">
          <div className="h-full w-full space-y-4">
            <div className="w-full space-y-2">
              <Label
                htmlFor="display-name"
                className="text-black dark:text-white"
              >
                Display Name
              </Label>

              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter component name"
                className="w-full text-black placeholder:text-gray-500 dark:text-white dark:placeholder:text-gray-400"
              />
            </div>
            <div className="w-full space-y-2">
              <Label htmlFor="subtitle" className="text-black dark:text-white">
                Subtitle
              </Label>
              <Input
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Enter component subtitle"
                className="w-full text-black placeholder:text-gray-500 dark:text-white dark:placeholder:text-gray-400"
              />
            </div>
            <div className="flex h-full w-full flex-grow flex-col space-y-2">
              <Label
                htmlFor="free-form-text"
                className="text-black dark:text-white"
              >
                Component Description
              </Label>
              <Textarea
                id="free-form-text"
                value={freeFormText}
                onChange={(e) => setFreeFormText(e.target.value)}
                placeholder="Describe your component in detail..."
                className="min-h-[300px] w-full flex-grow text-black placeholder:text-gray-500 dark:text-white dark:placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>
      </WithSettings>
    </div>
  );
}
