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

type DatabaseType = "Master (Write)" | "Replica (Read)" | "Read/Write";

export const SQLDatabase = ({ name, Icon }: ComponentNodeProps) => {
  return (
    <div className="relative flex flex-col items-center">
      {Icon && <Icon height="20px" width="20px" />}
      <Small>{name}</Small>
      <SQLDatabaseSettings name={name} />
    </div>
  );
};

const SQLDatabaseSettings = ({ name }: { name: string }) => {
  const { makeComponentConfigSlice } = useLevelManager();

  const { get, set } = useMemo(
    () => makeComponentConfigSlice<DatabaseType>(name, "databaseType"),
    [name, makeComponentConfigSlice],
  );
  const databaseType = get();

  return (
    <WithSettings name={name}>
      <Label htmlFor="database-type" className="mr-2">
        Database type
      </Label>
      <Select
        value={databaseType}
        onValueChange={(x: DatabaseType) => set(x)}
        name="database-type"
        defaultValue="Read/Write"
      >
        <SelectTrigger className="w-fit">
          <SelectValue placeholder="Database type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Master (Write)">Master (Write)</SelectItem>
          <SelectItem value="Replica (Read)">Replica (Read)</SelectItem>
          <SelectItem value="Read/Write">Read/Write</SelectItem>
        </SelectContent>
      </Select>
    </WithSettings>
  );
};
