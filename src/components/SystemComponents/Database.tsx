import { useSystemDesigner } from "@/lib/hooks/useSystemDesigner";
import { type ComponentNodeProps } from "../ReactflowCustomNodes/SystemComponentNode";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { H6, Small } from "../ui/typography";
import { WithSettings } from "./Wrappers/WithSettings";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { PlusIcon, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export const Database = ({ name, Icon }: ComponentNodeProps) => {
  return (
    <div className="relative flex flex-col items-center text-gray-800 dark:text-gray-200">
      {Icon && <Icon size={20} className="text-gray-700 dark:text-gray-300" />}
      <Small className="text-gray-700 dark:text-gray-300">{name}</Small>
      <DatabaseSettings name={name} />
    </div>
  );
};

const DatabaseSettings = ({ name: id }: { name: string }) => {
  const { useSystemComponentConfigSlice } = useSystemDesigner();

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
      <div className="grid w-full grid-flow-row grid-cols-1 gap-4 text-gray-800 dark:text-gray-200">
        <div className="flex flex-col gap-4">
          <Label htmlFor="database-design" className="text-gray-700 dark:text-gray-300">Database design</Label>
          <ListAndDetails
            textareaRowsCount={10}
            items={models}
            onChange={setModels}
            onDelete={(index: number) => {
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
          <Label htmlFor="database-purpose" className="text-gray-700 dark:text-gray-300">Database purpose</Label>
          <Textarea
            name="database-purpose"
            id="database-purpose"
            rows={10}
            className="text-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:border-gray-400 dark:focus:border-gray-600"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
        </div>
      </div>
    </WithSettings>
  );
};

export const ListAndDetails = ({
  items,
  onChange,
  onDelete,
  onAdd,
  textareaPlaceholder,
  textareaRowsCount = 25,
}: {
  items: [string, string][];
  onChange: (items: [string, string][]) => void;
  onDelete: (index: number) => void;
  onAdd: () => void;
  textareaPlaceholder?: string;
  textareaRowsCount?: number;
}) => {
  const [selectedKeyIndex, setSelectedKeyIndex] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>(
    items[selectedKeyIndex]?.[0] ?? "",
  );
  const [textareaValue, setTextareaValue] = useState<string>(
    items[selectedKeyIndex]?.[1] ?? "",
  );

  return (
    <div className="flex w-full flex-row">
      <div className="mr-2 flex w-36 flex-col rounded-sm border border-gray-300 dark:border-gray-600">
        {items.map(([key, value], index) => (
          <div
            className={cn(
              "group relative flex border-b border-gray-300 transition-all hover:cursor-pointer hover:bg-gray-200 dark:border-gray-600 dark:hover:bg-gray-700",
              { [`bg-gray-200 dark:bg-gray-700`]: selectedKeyIndex === index },
            )}
            onClick={() => {
              setSelectedKeyIndex(index);
              setInputValue(key);
              setTextareaValue(value);
            }}
            key={key + index}
          >
            <Small className="mr-2 overflow-hidden p-2 text-gray-700 dark:text-gray-300">
              {key}
            </Small>
            <span className="absolute right-2 top-2 rounded-full bg-gray-300 opacity-0 hover:cursor-pointer group-hover:opacity-100 dark:bg-gray-600">
              <X
                size={16}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(index);
                }}
                className="text-gray-700 dark:text-gray-300"
              />
            </span>
          </div>
        ))}
        <Button
          size="xs"
          variant="ghost"
          onClick={onAdd}
          className="text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <PlusIcon size="16" />
        </Button>
      </div>
      {!isNaN(selectedKeyIndex) ? (
        <div className="flex w-full flex-col">
          <Input
            type="text"
            className="mb-2 h-8 border-gray-300 bg-gray-100 text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
            onBlur={() => {
              const newApis = items.map(
                ([name, value], i) =>
                  (i === selectedKeyIndex
                    ? [inputValue, value]
                    : [name, value]) as [string, string],
              );
              onChange(newApis);
            }}
          />
          <Textarea
            rows={textareaRowsCount}
            value={textareaValue}
            onBlur={() => {
              const newApis = items.map(
                ([name, value], i) =>
                  (i === selectedKeyIndex
                    ? [name, textareaValue]
                    : [name, value]) as [string, string],
              );
              onChange(newApis);
            }}
            onChange={(e) => setTextareaValue(e.target.value)}
            placeholder={textareaPlaceholder}
            className="text-md border-gray-300 bg-gray-100 text-gray-900 focus:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-gray-600"
          />
        </div>
      ) : (
        <H6 className="text-center text-gray-700 dark:text-gray-300">
          Select an API to view or add a new one
        </H6>
      )}
    </div>
  );
};
