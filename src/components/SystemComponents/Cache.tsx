import { useChallengeManager } from "@/lib/hooks/useChallengeManager";
import { type ComponentNodeProps } from "../ReactflowCustomNodes/SystemComponentNode";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Small } from "../ui/typography";
import { WithSettings } from "./Wrappers/WithSettings";

export const Cache = ({ name, Icon }: ComponentNodeProps) => {
  return (
    <div className="relative flex flex-col items-center text-gray-200">
      {Icon && <Icon size={20} className="text-gray-300" />}
      <Small>{name}</Small>
      <CacheSettings name={name} />
    </div>
  );
};

// type CachePurpose = "Database Read/Write" | "User Session";

const CacheSettings = ({ name: id }: { name: string }) => {
  const { useSystemComponentConfigSlice } = useChallengeManager();

  // const [cacheType, setCacheType] = useSystemComponentConfigSlice<CachePurpose>(
  //   id,
  //   "type",
  // );
  const [purpose, setPurpose] = useSystemComponentConfigSlice<string>(
    id,
    "purpose",
  );

  return (
    <WithSettings name={id}>
      <div className="grid w-full grid-flow-row grid-cols-1 gap-2 text-gray-200">
        {/* <div className="grid grid-flow-col grid-cols-2">
          <Label htmlFor="cache-purpose" className=" col-span-1 my-auto">
            Cache purpose
          </Label>
          <div className="col-span-1">
            <Select
              value={cacheType}
              onValueChange={(x: CachePurpose) => setCacheType(x)}
              name="cache-purpose"
            >
              <SelectTrigger className="w-fit">
                <SelectValue placeholder="Cache purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Database Read/Write">
                  Database Read/Write
                </SelectItem>
                <SelectItem value="User Session">User Session</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div> */}
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
