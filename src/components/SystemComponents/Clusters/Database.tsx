import { Input } from "@/components/ui/input";
import { useLevelManager } from "@/lib/hooks/useLevelManager";
import { type ComponentNodeProps } from "../../SystemComponentNode";
import { Label } from "../../ui/label";
import { Small } from "../../ui/typography";
import { WithSettings } from "../Wrappers/WithSettings";
import { Textarea } from "@/components/ui/textarea";

export const DatabaseCluster = ({ name, Icon }: ComponentNodeProps) => {
  return (
    <div className="relative flex flex-col items-center">
      {Icon && <Icon size={20} />}
      <Small>{name}</Small>
      <DatabaseClusterSettings name={name} />
    </div>
  );
};

const DatabaseClusterSettings = ({ name: id }: { name: string }) => {
  const { useSystemComponentConfigSlice } = useLevelManager();

  const [primaryInstancesCount, setPrimaryInstancesCount] =
    useSystemComponentConfigSlice<number>(id, "Number of Primary instances");
  const [replicaInstancesCount, setReplicaInstancesCount] =
    useSystemComponentConfigSlice<number>(id, "Number of Replica instances");
  const [databaseDesign, setDatabaseDesign] =
    useSystemComponentConfigSlice<string>(id, "database design");
  const [purpose, setPurpose] =
    useSystemComponentConfigSlice<string>(id, "Database purpose");

  return (
    <WithSettings name={id}>
      <div className="grid w-full grid-flow-row grid-cols-1 gap-2 !text-black">
        <div className="grid grid-flow-col grid-cols-2">
          <Label
            htmlFor="primary-instances-count"
            className=" col-span-1 my-auto"
          >
            Read/Write
          </Label>
          <Input
            value={primaryInstancesCount}
            onChange={(e) => setPrimaryInstancesCount(parseInt(e.target.value))}
            name="primary-instances-count"
            id="primary-instances-count"
            className="col-span-1"
            placeholder="# of instances"
            type="number"
          />
        </div>
        <div className="grid grid-flow-col grid-cols-2">
          <Label
            htmlFor="replica-instances-count"
            className=" col-span-1 my-auto"
          >
            Replica (Read only)
          </Label>
          <Input
            value={replicaInstancesCount}
            onChange={(e) => setReplicaInstancesCount(parseInt(e.target.value))}
            name="replica-instances-count"
            id="replica-instances-count"
            className="col-span-1"
            placeholder="# of instances"
            type="number"
          />
        </div>
        <div className="flex flex-col gap-4">
          <Label htmlFor="database-design">Database design</Label>
          <div>
            <Textarea
              id="database-design"
              rows={10}
              value={databaseDesign}
              onChange={(e) => setDatabaseDesign(e.target.value)}
              placeholder={`Example: URL Shortening Service
              Urls table
              - id (Primary Key)
              - alias
              - original_url
              - created_at
              - expiration_date
              
              
              User table
              - user_id (Primary Key)
              - name
              - email
              - password
              - Created_at
              `}
              className="text-md"
            />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Label htmlFor="database-purpose">Database purpose</Label>
          <Textarea
            name="database-purpose"
            id="database-purpose"
            rows={10}
            className="text-md"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
        </div>
      </div>
    </WithSettings>
  );
};
