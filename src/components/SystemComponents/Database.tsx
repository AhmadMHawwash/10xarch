import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLevelManager } from "@/lib/hooks/useLevelManager";
import { useSystemDesigner } from "@/lib/hooks/useSystemDesigner";
import { type ComponentNodeProps } from "../SystemComponentNode";
import { Label } from "../ui/label";
import { Small } from "../ui/typography";
import { WithSettings } from "./Wrappers/WithSettings";
import { Textarea } from "../ui/textarea";

export const Database = ({ name, Icon }: ComponentNodeProps) => {
  return (
    <div className="relative flex flex-col items-center">
      {Icon && <Icon size={20} />}
      <Small>{name}</Small>
      <DatabaseSettings name={name} />
    </div>
  );
};

type Replica = "Replica (Read only)" | `Replica (Read only) of ${string}`;
type ReadWrite = "Read/Write";

type DatabaseType = ReadWrite | Replica;

const DatabaseSettings = ({ name: id }: { name: string }) => {
  const { nodes } = useSystemDesigner();
  const { useSystemComponentConfigSlice } = useLevelManager();

  const [databaseDesign, setDatabaseDesign] =
    useSystemComponentConfigSlice<string>(id, "Database design");
  const [purpose, setPurpose] = useSystemComponentConfigSlice<string>(
    id,
    "Database purpose",
  );

  const databaseNodes = nodes
    .filter((node) => node.data.name === "Database")
    .filter((node) => node.id !== id);

  // eslint-disable-next-line prefer-const
  let [databaseType, setDatabaseType] =
    useSystemComponentConfigSlice<DatabaseType>(id, "type");

  let databaseId: string | undefined = undefined;

  if (databaseType?.startsWith("Replica")) {
    const [x, y] = (databaseType as Replica).split(" of ");
    databaseType = x as Replica;
    databaseId = y!;
  }

  return (
    <WithSettings name={id}>
      <div className="grid w-full grid-flow-row grid-cols-1 gap-2 !text-black">
        <div className="grid grid-flow-col grid-cols-2">
          <Label htmlFor="database-type" className=" col-span-1 my-auto">
            Database type
          </Label>
          <div className="col-span-1">
            <Select
              value={databaseType}
              onValueChange={(x: DatabaseType) => setDatabaseType(x)}
              name="database-type"
            >
              <SelectTrigger id="database-type" className="w-fit">
                <SelectValue placeholder="Database type" />
              </SelectTrigger>
              <SelectContent id="database-type">
                <SelectItem value="Read/Write">Read/Write</SelectItem>
                <SelectItem value="Replica (Read only)">
                  Replica (Read only)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {databaseType?.startsWith("Replica") && (
          <div className="grid grid-flow-col grid-cols-2">
            <Label htmlFor="replica-of" className="col-span-1 my-auto">
              Replica of
            </Label>
            <div className="col-span-1">
              <Select
                value={databaseId}
                onValueChange={(dbId: string) =>
                  setDatabaseType(`${databaseType} of ${dbId}` as Replica)
                }
                name="replica-of"
              >
                <SelectTrigger id="replica-of" className="w-fit">
                  <SelectValue placeholder="Replica of" />
                </SelectTrigger>
                <SelectContent id="replica-of">
                  {databaseNodes.map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.data.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        {databaseType === "Read/Write" && (
          <div className="flex flex-col gap-4">
            <Label htmlFor="database-design">Database design</Label>
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
        )}
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
