import { useSystemDesigner } from "@/lib/hooks/_useSystemDesigner";
import { type ComponentNodeProps } from "../ReactflowCustomNodes/SystemComponentNode";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Muted, Small } from "../ui/typography";
import { WithSettings } from "./Wrappers/WithSettings";

export function CustomComponent({
  name,
  subtitle,
  nodeId,
  Icon,
  nodeSettingsRef,
}: ComponentNodeProps) {
  return (
    <div className="flex flex-col items-center text-gray-800 dark:text-gray-200">
      <div className="flex flex-col items-center gap-1">
        {Icon && (
          <Icon size={20} className="text-gray-700 dark:text-gray-300" />
        )}
        <Small>{name || "Custom Component"}</Small>
        {subtitle && subtitle !== name && <Muted>{subtitle}</Muted>}
      </div>
    </div>
  );
}

export const CustomComponentSettings = ({
  name,
}: ComponentNodeProps) => {
  const { useSystemComponentConfigSlice } = useSystemDesigner();

  const [freeFormText, setFreeFormText] = useSystemComponentConfigSlice<string>(
    name,
    "free-form text",
    "",
  );

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex h-full w-full flex-grow flex-col space-y-2">
        <Label htmlFor="free-form-text" className="text-black dark:text-white">
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
  );
};
