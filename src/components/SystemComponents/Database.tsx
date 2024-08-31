import { useChallengeManager } from "@/lib/hooks/useChallengeManager";
import { type ComponentNodeProps } from "../ReactflowCustomNodes/SystemComponentNode";
import { ListAndDetails } from "../TextualSolution/APIDefinition";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Small } from "../ui/typography";
import { WithSettings } from "./Wrappers/WithSettings";

export const Database = ({ name, Icon }: ComponentNodeProps) => {
  return (
    <div className="relative flex flex-col items-center text-gray-200">
      {Icon && <Icon size={20} className="text-gray-300" />}
      <Small>{name}</Small>
      <DatabaseSettings name={name} />
    </div>
  );
};

const DatabaseSettings = ({ name: id }: { name: string }) => {
  const { useSystemComponentConfigSlice } = useChallengeManager();

  const [purpose, setPurpose] = useSystemComponentConfigSlice<string>(
    id,
    "Database purpose",
  );

  const [models, setModels] = useSystemComponentConfigSlice<[string, string][]>(
    id,
    "Database models",
    [["new model", ""]],
  );

  return (
    <WithSettings name={id}>
      <div className="grid w-full grid-flow-row grid-cols-1 gap-2 text-gray-200">
        <div className="flex flex-col gap-4">
          <Label htmlFor="database-design" className="text-gray-300">Database design</Label>
          <ListAndDetails
            textareaRowsCount={10}
            items={models}
            onChange={setModels}
            onDelete={(index) => {
              const newModels = models.filter((_, i) => i !== index);
              setModels(newModels);
            }}
            onAdd={() => setModels([...models, ["new model", ""]])}
            textareaPlaceholder={`Example: URL Shortening Service
Urls table
- id (Primary Key)
- alias
- original_url
- created_at
- expiration_date
`}
          />
        </div>
        <div className="flex flex-col gap-4">
          <Label htmlFor="database-purpose" className="text-gray-300">Database purpose</Label>
          <Textarea
            name="database-purpose"
            id="database-purpose"
            rows={10}
            className="text-md bg-gray-700 text-gray-200 border-gray-600"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
        </div>
      </div>
    </WithSettings>
  );
};
