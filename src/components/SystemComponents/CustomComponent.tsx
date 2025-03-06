import { useSystemDesigner } from "@/lib/hooks/_useSystemDesigner";
import { type ComponentNodeProps } from "../ReactflowCustomNodes/SystemComponentNode";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Small } from "../ui/typography";
import { WithSettings } from "./Wrappers/WithSettings";
import { Input } from "../ui/input";
import React from "react";

export function CustomComponent({
  name,
  nodeId,
  Icon,
  nodeSettingsRef,
}: ComponentNodeProps) {
  const { useSystemComponentConfigSlice } = useSystemDesigner();

  // Use the provided hook for config slices instead of custom implementation
  const [displayName, setDisplayName] = useSystemComponentConfigSlice<string>(
    nodeId ?? name,
    "display name",
    "Custom Component",
  );

  const [freeFormText, setFreeFormText] = useSystemComponentConfigSlice<string>(
    nodeId ?? name,
    "free-form text",
    "",
  );

  return (
    <>
      {/* Display the icon and name on the node itself */}
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon
            height="20px"
            width="20px"
            className="text-gray-700 dark:text-gray-300"
          />
        )}
        <Small className="text-gray-700 dark:text-gray-300">
          {displayName || "Custom Component"}
        </Small>
      </div>
      {/* Settings dialog */}
      <WithSettings
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
    </>
  );
}
