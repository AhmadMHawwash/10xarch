import { useSystemDesigner } from "@/lib/hooks/useSystemDesigner";
import { type ComponentNodeProps } from "../ReactflowCustomNodes/SystemComponentNode";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Small } from "../ui/typography";
import { WithSettings } from "./Wrappers/WithSettings";

export const LoadBalancer = ({ name, Icon }: ComponentNodeProps) => {
  return (
    <div className="relative flex flex-col items-center text-gray-800 dark:text-gray-200">
      {Icon && <Icon size={20} className="text-gray-700 dark:text-gray-300" />}
      <Small>{name}</Small>
      <LoadBalancerSettings name={name} />
    </div>
  );
};

const LoadBalancerSettings = ({ name: id }: { name: string }) => {
  const { useSystemComponentConfigSlice } = useSystemDesigner();

  const [configs, setConfigs] = useSystemComponentConfigSlice<string>(
    id,
    "details",
  );

  return (
    <WithSettings name={id}>
      <div className="grid w-full grid-flow-row grid-cols-1 gap-2 text-gray-800 dark:text-gray-200">
        <div className="flex flex-col gap-4">
          <Label
            htmlFor="loadbalancer-details"
            className="text-gray-700 dark:text-gray-300"
          >
            Load balancer details
          </Label>
          <Textarea
            name="loadbalancer-details"
            id="loadbalancer-details"
            rows={10}
            className="text-md border-gray-300 bg-gray-100 text-gray-900 focus:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-gray-600"
            value={configs}
            onChange={(e) => setConfigs(e.target.value)}
          />
        </div>
      </div>
    </WithSettings>
  );
};
