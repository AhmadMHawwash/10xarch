import { Textarea } from "@/components/ui/textarea";
import { useSystemDesigner } from "@/lib/hooks/useSystemDesigner";
import { type ComponentNodeProps } from "../../ReactflowCustomNodes/SystemComponentNode";
import { Label } from "../../ui/label";
import { Small } from "../../ui/typography";
import { WithSettings } from "../Wrappers/WithSettings";

export const CacheCluster = ({ name, Icon }: ComponentNodeProps) => {
  return (
    <div className="relative flex flex-col items-center text-gray-800 dark:text-gray-200">
      {Icon && <Icon size={20} className="text-gray-700 dark:text-gray-300" />}
      <Small>{name}</Small>
      <CacheSettings name={name} />
    </div>
  );
};

const CacheSettings = ({ name: id }: { name: string }) => {
  const { useSystemComponentConfigSlice } = useSystemDesigner();

  const [details, setDetails] = useSystemComponentConfigSlice<string>(
    id,
    "Cache details",
  );
  return (
    <WithSettings name={id}>
      <div className="grid w-full grid-flow-row grid-cols-1 gap-2 text-gray-800 dark:text-gray-200">
        <div className="flex flex-col gap-4">
          <Label
            htmlFor="cache-details"
            className="text-gray-700 dark:text-gray-300"
          >
            Cache details
          </Label>
          <Textarea
            name="cache-details"
            id="cache-details"
            rows={10}
            className="text-md border-gray-300 bg-gray-100 text-gray-900 focus:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-gray-600"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        </div>
      </div>
    </WithSettings>
  );
};
