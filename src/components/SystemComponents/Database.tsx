import { useSystemDesigner } from "@/lib/hooks/_useSystemDesigner";
import { cn } from "@/lib/utils";
import { type NodeSettingsRefObject } from "@/types/system";
import { ExternalLink, HelpCircle, PlusIcon, X } from "lucide-react";
import { useState } from "react";
import { type ComponentNodeProps } from "../ReactflowCustomNodes/SystemComponentNode";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { H6, Muted, Small } from "../ui/typography";

export const Database = ({
  name,
  Icon,
  nodeSettingsRef,
  subtitle,
}: ComponentNodeProps) => {
  return (
    <div className="group flex flex-col items-center text-gray-800 dark:text-gray-200">
      <div className="flex flex-col items-center gap-1">
        {Icon && (
          <Icon size={20} className="text-gray-700 dark:text-gray-300" />
        )}
        <Small>{name}</Small>
        {subtitle && <Muted>{subtitle}</Muted>}
      </div>
      {/* <DatabaseSettings name={name} nodeSettingsRef={nodeSettingsRef} /> */}
    </div>
  );
};

type DbType = "relational" | "document" | "keyvalue" | "graph" | "search";
type EngineOption = { value: string; label: string };
type EngineOptions = Record<DbType, EngineOption[]>;

const isValidDbType = (value: string): value is DbType => {
  return ["relational", "document", "keyvalue", "graph", "search"].includes(
    value,
  );
};

type DbConfig = {
  type: DbType;
  engine: string;
};

const configInfoMap: Record<string, FeatureInfo> = {
  "Free-form Text Mode": {
    name: "Free-form Text Mode",
    description:
      "Toggle between detailed configuration and free-form text input. Free-form text allows you to describe your database configuration in a more natural way.",
    learnMoreUrl: "https://docs.example.com/db-configuration",
  },
  "Database Type": {
    name: "Database Type",
    description:
      "The type of database system to use. Different types have different capabilities and use cases.",
    learnMoreUrl: "https://docs.example.com/db-types",
  },
  "Database Engine": {
    name: "Database Engine",
    description:
      "Specific database engine/implementation to use based on your requirements.",
    learnMoreUrl: "https://docs.example.com/db-engines",
  },
  Clustering: {
    name: "Clustering",
    description:
      "Database clustering and replication settings for high availability and scalability.",
    learnMoreUrl: "https://docs.example.com/db-clustering",
  },
  "Replication Strategy": {
    name: "Replication Strategy",
    description: "How data is replicated across nodes in the database cluster.",
    learnMoreUrl: "https://docs.example.com/db-replication",
  },
  "Primary Nodes": {
    name: "Primary Nodes",
    description: "Number of primary/read-write nodes in the database cluster.",
    learnMoreUrl: "https://docs.example.com/db-nodes#primary",
  },
  "Replica Nodes": {
    name: "Replica Nodes",
    description: "Number of replica/read-only nodes in the database cluster.",
    learnMoreUrl: "https://docs.example.com/db-nodes#replica",
  },
  IOPS: {
    name: "IOPS",
    description:
      "Input/Output Operations per Second - a measure of database performance.",
    learnMoreUrl: "https://docs.example.com/db-performance#iops",
  },
  Features: {
    name: "Features",
    description:
      "Database capabilities and features that enhance functionality and performance.",
    learnMoreUrl: "https://docs.example.com/db-features",
  },
  "Additional Configuration": {
    name: "Additional Configuration",
    description:
      "Additional database configuration, requirements, or constraints specific to your use case.",
    learnMoreUrl: "https://docs.example.com/db-config",
  },
  "Schema Design": {
    name: "Schema Design",
    description:
      "Define your database schema, models, or collections. For relational databases, define tables and their columns. For document databases, define collections and their structure.",
    learnMoreUrl: "https://docs.example.com/db-schema",
  },
};

const DatabaseSettings = ({
  name: id,
  nodeSettingsRef,
}: {
  name: string;
  nodeSettingsRef?: NodeSettingsRefObject;
}) => {
  const { useSystemComponentConfigSlice } = useSystemDesigner();
  const [isFreeText, setIsFreeText] = useState<boolean>(true);

  const [dbConfig, setDbConfig] = useSystemComponentConfigSlice<DbConfig>(
    id,
    "database_type_and_engine",
    {
      type: "relational",
      engine: "postgresql",
    },
  );

  const [capacity, setCapacity] = useSystemComponentConfigSlice<{
    storage: number;
    iops: number;
    connections: number;
  }>(id, "capacity", {
    storage: 100,
    iops: 1000,
    connections: 100,
  });

  const [details, setDetails] = useSystemComponentConfigSlice<string>(
    id,
    "Database details",
    "",
  );

  const [models, setModels] = useSystemComponentConfigSlice<[string, string][]>(
    id,
    "Database models",
    [["new model", ""]],
  );

  const [clustering, setClustering] = useSystemComponentConfigSlice<{
    enabled: boolean;
    primaryNodes: number;
    replicaNodes: number;
    shardingEnabled: boolean;
    replicationStrategy: string;
  }>(id, "clustering", {
    enabled: false,
    primaryNodes: 1,
    replicaNodes: 2,
    shardingEnabled: false,
    replicationStrategy: "async",
  });

  const [freeFormText, setFreeFormText] = useSystemComponentConfigSlice<string>(
    id,
    "free_form_text",
    "",
  );

  const engineOptions: EngineOptions = {
    relational: [
      { value: "postgresql", label: "PostgreSQL" },
      { value: "mysql", label: "MySQL" },
      { value: "aurora", label: "Aurora" },
    ],
    document: [
      { value: "mongodb", label: "MongoDB" },
      { value: "couchdb", label: "CouchDB" },
      { value: "documentdb", label: "DocumentDB" },
    ],
    keyvalue: [
      { value: "redis", label: "Redis" },
      { value: "memcached", label: "Memcached" },
      { value: "dynamodb", label: "DynamoDB" },
    ],
    graph: [
      { value: "neo4j", label: "Neo4j" },
      { value: "neptune", label: "Neptune" },
    ],
    search: [
      { value: "elasticsearch", label: "Elasticsearch" },
      { value: "opensearch", label: "OpenSearch" },
    ],
  };

  const handleDbTypeChange = (value: string) => {
    if (!isValidDbType(value)) return;
    const options = engineOptions[value];
    if (!options || options.length === 0) return;
    setDbConfig({
      type: value,
      engine: options[0]?.value ?? "",
    });
  };

  const handleEngineChange = (value: string) => {
    setDbConfig({
      ...dbConfig,
      engine: value,
    });
  };

  // Get available engine options for current type
  const currentEngineOptions = engineOptions[dbConfig.type] ?? [];

  return (
    <div className="flex w-full flex-col gap-4">
      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="schema">Schema Design</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="mt-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="free-text-mode"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Free-form Text
                </Label>
                {configInfoMap["Free-form Text Mode"] && (
                  <InfoPopup feature={configInfoMap["Free-form Text Mode"]} />
                )}
              </div>
              <Switch
                id="free-text-mode"
                checked={isFreeText}
                onCheckedChange={setIsFreeText}
              />
            </div>

            {!isFreeText ? (
              <div className="grid w-full grid-flow-row grid-cols-1 gap-4 text-gray-800 dark:text-gray-200">
                <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900/50 dark:bg-yellow-900/20">
                  <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                    <Small>
                      Note: Detailed configuration options are still a work in
                      progress. Options might get added or deleted.
                    </Small>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="db-type"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        {configInfoMap["Database Type"] && (
                          <InfoPopup feature={configInfoMap["Database Type"]} />
                        )}
                      </Label>
                      <Select
                        value={dbConfig.type}
                        onValueChange={handleDbTypeChange}
                      >
                        <SelectTrigger
                          className={cn(
                            "w-full border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800",
                            "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                          )}
                        >
                          <SelectValue placeholder="Select database type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="relational">Relational</SelectItem>
                          <SelectItem value="document">Document</SelectItem>
                          <SelectItem value="keyvalue">Key-Value</SelectItem>
                          <SelectItem value="graph">Graph</SelectItem>
                          <SelectItem value="search">Search</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="engine"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        {configInfoMap["Database Engine"] && (
                          <InfoPopup
                            feature={configInfoMap["Database Engine"]}
                          />
                        )}
                      </Label>
                      <Select
                        value={dbConfig.engine}
                        onValueChange={handleEngineChange}
                      >
                        <SelectTrigger
                          className={cn(
                            "w-full border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800",
                            "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                          )}
                        >
                          <SelectValue placeholder="Select database engine" />
                        </SelectTrigger>
                        <SelectContent>
                          {currentEngineOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-gray-700 dark:text-gray-300">
                      Clustering
                    </Label>
                    {configInfoMap.Clustering && (
                      <InfoPopup feature={configInfoMap.Clustering} />
                    )}
                  </div>

                  <div className="mb-2 flex items-center gap-2">
                    <Checkbox
                      id="clustering-enabled"
                      checked={clustering.enabled}
                      onCheckedChange={(checked) => {
                        setClustering({ ...clustering, enabled: !!checked });
                      }}
                      className="border-gray-400 dark:border-gray-600"
                    />
                    <Label
                      htmlFor="clustering-enabled"
                      className="text-sm text-gray-700 dark:text-gray-300"
                    >
                      Enable High Availability Cluster
                    </Label>
                  </div>

                  {clustering.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor="replication-strategy"
                            className="text-gray-700 dark:text-gray-300"
                          >
                            {configInfoMap["Replication Strategy"] && (
                              <InfoPopup
                                feature={configInfoMap["Replication Strategy"]}
                              />
                            )}
                          </Label>
                          <Select
                            value={clustering.replicationStrategy}
                            onValueChange={(value) =>
                              setClustering({
                                ...clustering,
                                replicationStrategy: value,
                              })
                            }
                          >
                            <SelectTrigger
                              className={cn(
                                "w-full border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800",
                                "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                              )}
                            >
                              <SelectValue placeholder="Select replication strategy" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="async">
                                Asynchronous
                              </SelectItem>
                              <SelectItem value="sync">Synchronous</SelectItem>
                              <SelectItem value="semi-sync">
                                Semi-Synchronous
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div className="cursor-help rounded-full p-1 transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                            <Checkbox
                              id="sharding-enabled"
                              checked={clustering.shardingEnabled}
                              onCheckedChange={(checked) => {
                                setClustering({
                                  ...clustering,
                                  shardingEnabled: !!checked,
                                });
                              }}
                              className="border-gray-400 dark:border-gray-600"
                            />
                          </div>
                          <Label
                            htmlFor="sharding-enabled"
                            className="text-sm text-gray-700 dark:text-gray-300"
                          >
                            Enable Sharding
                          </Label>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor="primary-nodes"
                            className="text-gray-700 dark:text-gray-300"
                          >
                            {configInfoMap["Primary Nodes"] && (
                              <InfoPopup
                                feature={configInfoMap["Primary Nodes"]}
                              />
                            )}
                          </Label>
                          <Input
                            type="number"
                            id="primary-nodes"
                            value={clustering.primaryNodes}
                            onChange={(e) =>
                              setClustering({
                                ...clustering,
                                primaryNodes: Number(e.target.value),
                              })
                            }
                            className={cn(
                              "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800",
                              "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                            )}
                            min={1}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor="replica-nodes"
                            className="text-gray-700 dark:text-gray-300"
                          >
                            {configInfoMap["Replica Nodes"] && (
                              <InfoPopup
                                feature={configInfoMap["Replica Nodes"]}
                              />
                            )}
                          </Label>
                          <Input
                            type="number"
                            id="replica-nodes"
                            value={clustering.replicaNodes}
                            onChange={(e) =>
                              setClustering({
                                ...clustering,
                                replicaNodes: Number(e.target.value),
                              })
                            }
                            className={cn(
                              "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800",
                              "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                            )}
                            min={0}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="storage"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        {configInfoMap["Storage (GB)"] && (
                          <InfoPopup feature={configInfoMap["Storage (GB)"]} />
                        )}
                      </Label>
                      <Input
                        type="number"
                        id="storage"
                        value={capacity.storage}
                        onChange={(e) =>
                          setCapacity({
                            ...capacity,
                            storage: Number(e.target.value),
                          })
                        }
                        className={cn(
                          "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800",
                          "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                        )}
                        min={1}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="iops"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        IOPS
                      </Label>
                      {configInfoMap.IOPS && (
                        <InfoPopup feature={configInfoMap.IOPS} />
                      )}
                      <Input
                        type="number"
                        id="iops"
                        value={capacity.iops}
                        onChange={(e) =>
                          setCapacity({
                            ...capacity,
                            iops: Number(e.target.value),
                          })
                        }
                        className={cn(
                          "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800",
                          "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                        )}
                        min={100}
                        step={100}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="connections"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        {configInfoMap["Max Connections"] && (
                          <InfoPopup
                            feature={configInfoMap["Max Connections"]}
                          />
                        )}
                      </Label>
                      <Input
                        type="number"
                        id="connections"
                        value={capacity.connections}
                        onChange={(e) =>
                          setCapacity({
                            ...capacity,
                            connections: Number(e.target.value),
                          })
                        }
                        className={cn(
                          "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800",
                          "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                        )}
                        min={1}
                      />
                    </div>
                  </div>
                </div>

                {/* 
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-gray-700 dark:text-gray-300">
                        Features
                      </Label>
                      {configInfoMap.Features && (
                        <InfoPopup feature={configInfoMap.Features} />
                      )}
                    </div> 
                    <div className="grid grid-cols-2 gap-2">
                      {availableFeatures.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <Checkbox
                            id={feature}
                            checked={features.includes(feature)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFeatures([...features, feature]);
                              } else {
                                setFeatures(features.filter((f) => f !== feature));
                              }
                            }}
                            className="border-gray-400 dark:border-gray-600"
                          />
                          <Label
                            htmlFor={feature}
                            className="text-sm text-gray-700 dark:text-gray-300"
                          >
                            {feature}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div> 
                    */}

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="database-details"
                      className="text-gray-700 dark:text-gray-300"
                    >
                      {configInfoMap["Additional Configuration"] && (
                        <InfoPopup
                          feature={configInfoMap["Additional Configuration"]}
                        />
                      )}
                    </Label>
                  </div>
                  <Textarea
                    name="database-details"
                    id="database-details"
                    rows={6}
                    placeholder={`Example:
- Specific configuration parameters
- Security requirements
- Backup strategy
- Performance requirements`}
                    className={cn(
                      "text-md border-gray-300 dark:border-gray-700",
                      "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                      "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                      "bg-gray-50 dark:bg-gray-800"
                    )}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="free-form"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Database Configuration
                </Label>
                <Textarea
                  id="free-form"
                  rows={20}
                  placeholder={`Describe your database configuration here. Example:

Database Type: PostgreSQL
Capacity: 100GB storage, 1000 IOPS
Features:
- High Availability with 3 nodes
- Automatic backups
- Point-in-time recovery
- Row-level security

Additional Requirements:
- Daily backup retention: 7 days
- Monthly backup retention: 1 year
- Monitoring requirements
- Security configurations`}
                  className={cn(
                    "text-md border-gray-300 dark:border-gray-700",
                    "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                    "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                    "bg-gray-50 dark:bg-gray-800"
                  )}
                  value={freeFormText}
                  onChange={(e) => setFreeFormText(e.target.value)}
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="schema" className="mt-4">
          <div className="flex w-full flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="database-design"
                  className="text-lg font-semibold text-gray-700 dark:text-gray-300"
                >
                  {configInfoMap["Schema Design"] && (
                    <InfoPopup feature={configInfoMap["Schema Design"]} />
                  )}
                </Label>
              </div>
              <Small className="text-gray-500 dark:text-gray-400">
                {dbConfig.type === "relational"
                  ? "Tables"
                  : dbConfig.type === "document"
                    ? "Collections"
                    : "Models"}
              </Small>
            </div>
            <div className="rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <ListAndDetails
                textareaRowsCount={25}
                items={models}
                onChange={setModels}
                onDelete={(index: number) => {
                  const newModels = models.filter((_, i) => i !== index);
                  setModels(newModels);
                }}
                onAdd={() => setModels([...models, ["new model", ""]])}
                textareaPlaceholder={
                  dbConfig.type === "relational"
                    ? `Example: Users Table
- id (Primary Key, UUID)
- username (Unique, VARCHAR(50))
- email (Unique, VARCHAR(255))
- password_hash (VARCHAR(60))
- created_at (TIMESTAMP)
- last_login (TIMESTAMP)

Constraints:
- username: NOT NULL
- email: NOT NULL
- password_hash: NOT NULL`
                    : dbConfig.type === "document"
                      ? `Example: Users Collection
{
  _id: ObjectId,
  username: string,
  email: string,
  profile: {
    firstName: string,
    lastName: string,
    avatar: string
  },
  settings: {
    theme: "light" | "dark",
    notifications: boolean
  },
  createdAt: Date,
  lastLogin: Date
}`
                      : `Example: Model Structure
Name: User
Type: Entity
Properties:
- id: unique identifier
- name: string
- attributes: key-value pairs
- metadata: object`
                }
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export { DatabaseSettings };

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
            className="mb-2 h-8 border-gray-300 bg-gray-50 text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
            onBlur={() => {
              const newModels = items.map(
                ([name, value], i) =>
                  (i === selectedKeyIndex
                    ? [inputValue, value]
                    : [name, value]) as [string, string],
              );
              onChange(newModels);
            }}
          />
          <Textarea
            rows={textareaRowsCount}
            value={textareaValue}
            onBlur={() => {
              const newModels = items.map(
                ([name, value], i) =>
                  (i === selectedKeyIndex
                    ? [name, textareaValue]
                    : [name, value]) as [string, string],
              );
              onChange(newModels);
            }}
            onChange={(e) => setTextareaValue(e.target.value)}
            placeholder={textareaPlaceholder}
            className={cn(
              "text-md border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800",
              "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
              "placeholder:text-gray-500 dark:placeholder:text-gray-400",
            )}
          />
        </div>
      ) : (
        <H6 className="text-center text-gray-700 dark:text-gray-300">
          Select a model to view or add a new one
        </H6>
      )}
    </div>
  );
};

interface FeatureInfo {
  name: string;
  description: string;
  learnMoreUrl?: string;
}

const InfoPopup = ({ feature }: { feature: FeatureInfo }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-help rounded-full p-1 transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700">
          <HelpCircle className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{feature.name}</DialogTitle>
          <DialogDescription className="space-y-4">
            <p>{feature.description}</p>
            {feature.learnMoreUrl && (
              <a
                href={feature.learnMoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Learn more <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
