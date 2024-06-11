import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLevelManager } from "@/lib/hooks/useLevelManager";
import { type ComponentNodeProps } from "../SystemComponentNode";
import { Label } from "../ui/label";
import { Small } from "../ui/typography";
import { WithSettings } from "./WithSettings";
import { useMemo } from "react";
import { useSystemDesigner } from "@/lib/hooks/useSystemDesigner";

export const Database = ({ name, Icon }: ComponentNodeProps) => {
  return (
    <div className="relative flex flex-col items-center">
      {Icon && <Icon size={20} />}
      <Small>{name}</Small>
      <DatabaseSettings name={name} />
    </div>
  );
};

type Primary = "Primary (Write)";
type Replica = "Replica (Read only)" | `Replica (Read only) of ${string}`;
type ReadWrite = "Read/Write";

type DatabaseType = Primary | Replica | ReadWrite;

const DatabaseSettings = ({ name: id }: { name: string }) => {
  const { nodes } = useSystemDesigner();
  const { makeComponentConfigSlice } = useLevelManager();

  const databaseNodes = nodes
    .filter((node) => node.data.name === "Database")
    .filter((node) => node.id !== id);

  const { get, set } = useMemo(
    () => makeComponentConfigSlice<DatabaseType>(id, "type"),
    [id, makeComponentConfigSlice],
  );
  let databaseType = get();
  let databaseId: string | undefined = undefined;

  if (databaseType?.startsWith("Replica")) {
    const [x, y] = (databaseType as Replica).split(" of ");
    databaseType = x as Replica;
    databaseId = y!;
  }

  return (
    <WithSettings name={id}>
      <div className="grid w-full grid-flow-row grid-cols-1 gap-2">
        <div className="grid grid-flow-col grid-cols-2">
          <Label htmlFor="database-type" className=" col-span-1 my-auto">
            Database type
          </Label>
          <div className="col-span-1">
            <Select
              value={databaseType}
              onValueChange={(x: DatabaseType) => set(x)}
              name="database-type"
            >
              <SelectTrigger className="w-fit">
                <SelectValue placeholder="Database type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Primary (Write)">Primary (Write)</SelectItem>
                <SelectItem value="Replica (Read only)">
                  Replica (Read only)
                </SelectItem>
                <SelectItem value="Read/Write">Read/Write</SelectItem>
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
                  set(`${databaseType} of ${dbId}` as Replica)
                }
                name="replica-of"
              >
                <SelectTrigger className="w-fit">
                  <SelectValue placeholder="Replica of" />
                </SelectTrigger>
                <SelectContent>
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
      </div>
    </WithSettings>
  );
};
