import { Textarea } from "@/components/ui/textarea";
import { useChallengeManager } from "@/lib/hooks/useChallengeManager";
import { type ComponentNodeProps } from "../../ReactflowCustomNodes/SystemComponentNode";
import { Label } from "../../ui/label";
import { Small } from "../../ui/typography";
import { WithSettings } from "../Wrappers/WithSettings";

export const CacheCluster = ({ name, Icon }: ComponentNodeProps) => {
  return (
    <div className="relative flex flex-col items-center text-gray-200">
      {Icon && <Icon size={20} className="text-gray-300" />}
      <Small>{name}</Small>
      <CacheSettings name={name} />
    </div>
  );
};

const CacheSettings = ({ name: id }: { name: string }) => {
  const { useSystemComponentConfigSlice } = useChallengeManager();

  const [purpose, setPurpose] = useSystemComponentConfigSlice<string>(
    id,
    "Cache purpose",
  );
  return (
    <WithSettings name={id}>
      <div className="grid w-full grid-flow-row grid-cols-1 gap-2 text-gray-200">
        <div className="flex flex-col gap-4">
          <Label htmlFor="cache-purpose" className="text-gray-300">Cache purpose</Label>
          <Textarea
            name="cache-purpose"
            id="cache-purpose"
            rows={10}
            className="text-md bg-gray-800 text-gray-100 border-gray-700 focus:border-gray-600"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
        </div>
      </div>
    </WithSettings>
  );
};
