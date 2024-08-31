import { Input } from "@/components/ui/input";
import { useChallengeManager } from "@/lib/hooks/useChallengeManager";
import { type ComponentNodeProps } from "../../ReactflowCustomNodes/SystemComponentNode";
import { Label } from "../../ui/label";
import { Small } from "../../ui/typography";
import { WithSettings } from "../Wrappers/WithSettings";
import { Textarea } from "@/components/ui/textarea";
import { ListAndDetails } from "@/components/TextualSolution/APIDefinition";

export const DatabaseCluster = ({ name, Icon }: ComponentNodeProps) => {
  return (
    <div className="relative flex flex-col items-center text-gray-200">
      {Icon && <Icon size={20} className="text-gray-300" />}
      <Small className="text-gray-300">{name}</Small>
      <DatabaseClusterSettings name={name} />
    </div>
  );
};

const DatabaseClusterSettings = ({ name: id }: { name: string }) => {
  const { useSystemComponentConfigSlice } = useChallengeManager();

  const [primaryInstancesCount, setPrimaryInstancesCount] =
    useSystemComponentConfigSlice<number>(id, "Number of Primary instances");
  const [replicaInstancesCount, setReplicaInstancesCount] =
    useSystemComponentConfigSlice<number>(id, "Number of Replica instances");
  const [purpose, setPurpose] = useSystemComponentConfigSlice<string>(
    id,
    "Database Cluster purpose",
  );
  const [models, setModels] = useSystemComponentConfigSlice<[string, string][]>(
    id,
    "Database Cluster models",
    [["new model", ""]],
  );

  return (
    <WithSettings name={id}>
      <div className="grid w-full grid-flow-row grid-cols-1 gap-4 text-gray-200">
        <div className="grid grid-flow-col grid-cols-2 gap-2">
          <Label
            htmlFor="primary-instances-count"
            className="col-span-1 my-auto text-gray-300"
          >
            Read/Write
          </Label>
          <Input
            value={primaryInstancesCount}
            onChange={(e) => setPrimaryInstancesCount(parseInt(e.target.value))}
            name="primary-instances-count"
            id="primary-instances-count"
            className="col-span-1 bg-gray-700 text-gray-200 border-gray-600"
            placeholder="# of instances"
            type="number"
          />
        </div>
        <div className="grid grid-flow-col grid-cols-2 gap-2">
          <Label
            htmlFor="replica-instances-count"
            className="col-span-1 my-auto text-gray-300"
          >
            Replica (Read only)
          </Label>
          <Input
            value={replicaInstancesCount}
            onChange={(e) => setReplicaInstancesCount(parseInt(e.target.value))}
            name="replica-instances-count"
            id="replica-instances-count"
            className="col-span-1 bg-gray-700 text-gray-200 border-gray-600"
            placeholder="# of instances"
            type="number"
          />
        </div>
        <div className="flex flex-col gap-4">
          <Label htmlFor="database-cluster-design" className="text-gray-300">Database Cluster design</Label>
          <ListAndDetails
            textareaRowsCount={10}
            items={models}
            onChange={setModels}
            onDelete={(index) => {
              const newModels = models.filter((_, i) => i !== index);
              setModels(newModels);
            }}
            onAdd={() => setModels([...models, ["new model", ""]])}
            textareaPlaceholder={`Example: URL Shortening Service Cluster
Urls table (Sharded by id)
- id (Primary Key)
- alias
- original_url
- created_at
- expiration_date
`}
          />
        </div>
        <div className="flex flex-col gap-4">
          <Label htmlFor="database-cluster-purpose" className="text-gray-300">Database Cluster purpose</Label>
          <Textarea
            name="database-cluster-purpose"
            id="database-cluster-purpose"
            rows={10}
            className="text-md bg-gray-700 text-gray-200 border-gray-600 focus:border-gray-500"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
        </div>
      </div>
    </WithSettings>
  );
};
