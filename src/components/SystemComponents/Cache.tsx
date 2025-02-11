import { useSystemDesigner } from "@/lib/hooks/_useSystemDesigner";
import { type ComponentNodeProps } from "../ReactflowCustomNodes/SystemComponentNode";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Small } from "../ui/typography";
import { WithSettings } from "./Wrappers/WithSettings";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { cn } from "@/lib/utils";
import { Checkbox } from "../ui/checkbox";

export const Cache = ({ name, Icon }: ComponentNodeProps) => {
  return (
    <div className="relative flex flex-col items-center text-gray-800 dark:text-gray-200 group">
      <div className="relative flex items-center gap-1">
        {Icon && <Icon size={20} className="text-gray-700 dark:text-gray-300" />}
        <Small>{name}</Small>
      </div>
      <CacheSettings name={name} />
    </div>
  );
};

const CacheSettings = ({ name: id }: { name: string }) => {
  const { useSystemComponentConfigSlice } = useSystemDesigner();

  const [cacheType, setCacheType] = useSystemComponentConfigSlice<string>(
    id,
    "cache_type",
    "in-memory"
  );

  const [capacity, setCapacity] = useSystemComponentConfigSlice<{
    memory: number;
    maxItems: number;
    maxItemSize: number;
  }>(id, "capacity", {
    memory: 1,
    maxItems: 1000000,
    maxItemSize: 1
  });

  const [policy, setPolicy] = useSystemComponentConfigSlice<string>(
    id,
    "eviction_policy",
    "lru"
  );

  const [features, setFeatures] = useSystemComponentConfigSlice<string[]>(
    id,
    "features",
    []
  );

  const [details, setDetails] = useSystemComponentConfigSlice<string>(
    id,
    "details",
    ""
  );

  const [distribution, setDistribution] = useSystemComponentConfigSlice<{
    enabled: boolean;
    nodes: number;
    replicationFactor: number;
    partitioningStrategy: string;
    consistencyLevel: string;
  }>(id, "distribution", {
    enabled: false,
    nodes: 3,
    replicationFactor: 2,
    partitioningStrategy: "consistent-hashing",
    consistencyLevel: "quorum"
  });

  const availableFeatures = [
    "Persistence",
    "Data Compression",
    "Encryption at rest",
    "TTL Support",
    "Cache Invalidation",
    "Cache Preloading",
    "Event Notifications",
    "Access Control"
  ];

  return (
    <WithSettings name={id}>
      <div className="grid w-full grid-flow-row grid-cols-1 gap-4 text-gray-800 dark:text-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="cache-type" className="text-gray-700 dark:text-gray-300">
                Cache Type
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The type of caching system to use</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select value={cacheType} onValueChange={setCacheType}>
              <SelectTrigger className={cn(
                "w-full bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700",
                "text-gray-900 dark:text-gray-100 focus:ring-gray-400 dark:focus:ring-gray-600"
              )}>
                <SelectValue placeholder="Select cache type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-memory">In-Memory Cache</SelectItem>
                <SelectItem value="distributed">Distributed Cache</SelectItem>
                <SelectItem value="cdn">CDN Cache</SelectItem>
                <SelectItem value="browser">Browser Cache</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="eviction-policy" className="text-gray-700 dark:text-gray-300">
                Eviction Policy
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Policy for removing items when cache is full</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select value={policy} onValueChange={setPolicy}>
              <SelectTrigger className={cn(
                "w-full bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700",
                "text-gray-900 dark:text-gray-100 focus:ring-gray-400 dark:focus:ring-gray-600"
              )}>
                <SelectValue placeholder="Select eviction policy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lru">LRU (Least Recently Used)</SelectItem>
                <SelectItem value="lfu">LFU (Least Frequently Used)</SelectItem>
                <SelectItem value="fifo">FIFO (First In First Out)</SelectItem>
                <SelectItem value="random">Random Replacement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Label className="text-gray-700 dark:text-gray-300">
              Distribution Configuration
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cache distribution and replication settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <Checkbox
              id="distribution-enabled"
              checked={distribution.enabled}
              onCheckedChange={(checked) => {
                setDistribution({ ...distribution, enabled: !!checked });
              }}
              className="border-gray-400 dark:border-gray-600"
            />
            <Label
              htmlFor="distribution-enabled"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              Enable Distributed Cache
            </Label>
          </div>

          {distribution.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="nodes" className="text-gray-700 dark:text-gray-300">
                    Number of Nodes
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total number of cache nodes in the cluster</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  type="number"
                  id="nodes"
                  value={distribution.nodes}
                  onChange={(e) => setDistribution({ ...distribution, nodes: Number(e.target.value) })}
                  className={cn(
                    "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700",
                    "text-gray-900 dark:text-gray-100 focus:ring-gray-400 dark:focus:ring-gray-600"
                  )}
                  min={1}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="replication-factor" className="text-gray-700 dark:text-gray-300">
                    Replication Factor
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Number of copies for each data item</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  type="number"
                  id="replication-factor"
                  value={distribution.replicationFactor}
                  onChange={(e) => setDistribution({ ...distribution, replicationFactor: Number(e.target.value) })}
                  className={cn(
                    "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700",
                    "text-gray-900 dark:text-gray-100 focus:ring-gray-400 dark:focus:ring-gray-600"
                  )}
                  min={1}
                  max={distribution.nodes}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="partitioning-strategy" className="text-gray-700 dark:text-gray-300">
                    Partitioning Strategy
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Method used to distribute data across nodes</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select 
                  value={distribution.partitioningStrategy} 
                  onValueChange={(value) => setDistribution({ ...distribution, partitioningStrategy: value })}
                >
                  <SelectTrigger className={cn(
                    "w-full bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700",
                    "text-gray-900 dark:text-gray-100 focus:ring-gray-400 dark:focus:ring-gray-600"
                  )}>
                    <SelectValue placeholder="Select partitioning strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consistent-hashing">Consistent Hashing</SelectItem>
                    <SelectItem value="range">Range Based</SelectItem>
                    <SelectItem value="modulo">Modulo Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="consistency-level" className="text-gray-700 dark:text-gray-300">
                    Consistency Level
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Required consistency level for read/write operations</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select 
                  value={distribution.consistencyLevel} 
                  onValueChange={(value) => setDistribution({ ...distribution, consistencyLevel: value })}
                >
                  <SelectTrigger className={cn(
                    "w-full bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700",
                    "text-gray-900 dark:text-gray-100 focus:ring-gray-400 dark:focus:ring-gray-600"
                  )}>
                    <SelectValue placeholder="Select consistency level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one">ONE</SelectItem>
                    <SelectItem value="quorum">QUORUM</SelectItem>
                    <SelectItem value="all">ALL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="memory" className="text-gray-700 dark:text-gray-300">
                Memory (GB)
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Maximum memory allocation in gigabytes</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              type="number"
              id="memory"
              value={capacity.memory}
              onChange={(e) => setCapacity({ ...capacity, memory: Number(e.target.value) })}
              className={cn(
                "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700",
                "text-gray-900 dark:text-gray-100 focus:ring-gray-400 dark:focus:ring-gray-600"
              )}
              min={1}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="max-items" className="text-gray-700 dark:text-gray-300">
                Max Items
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Maximum number of items in cache</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              type="number"
              id="max-items"
              value={capacity.maxItems}
              onChange={(e) => setCapacity({ ...capacity, maxItems: Number(e.target.value) })}
              className={cn(
                "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700",
                "text-gray-900 dark:text-gray-100 focus:ring-gray-400 dark:focus:ring-gray-600"
              )}
              min={1000}
              step={1000}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="max-item-size" className="text-gray-700 dark:text-gray-300">
                Max Item Size (MB)
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Maximum size per item in megabytes</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              type="number"
              id="max-item-size"
              value={capacity.maxItemSize}
              onChange={(e) => setCapacity({ ...capacity, maxItemSize: Number(e.target.value) })}
              className={cn(
                "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700",
                "text-gray-900 dark:text-gray-100 focus:ring-gray-400 dark:focus:ring-gray-600"
              )}
              min={1}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Label className="text-gray-700 dark:text-gray-300">
              Features
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cache capabilities and features</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="cache-details" className="text-gray-700 dark:text-gray-300">
              Additional Configuration
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Additional cache configuration, policies, or requirements</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Textarea
            name="cache-details"
            id="cache-details"
            rows={6}
            placeholder="Example:
- Cache invalidation strategy
- TTL configuration
- Replication settings
- Backup policies
- Monitoring requirements"
            className={cn(
              "text-md bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700",
              "text-gray-900 dark:text-gray-100 focus:ring-gray-400 dark:focus:ring-gray-600",
              "placeholder:text-gray-500 dark:placeholder:text-gray-400"
            )}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        </div>
      </div>
    </WithSettings>
  );
};
