import { useSystemDesigner } from "@/lib/hooks/_useSystemDesigner";
import { type ComponentNodeProps } from "../ReactflowCustomNodes/SystemComponentNode";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Small } from "../ui/typography";
import { WithSettings } from "./Wrappers/WithSettings";
import { useState } from "react";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { HelpCircle, ExternalLink } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { cn } from "@/lib/utils";
import { Checkbox } from "../ui/checkbox";
import { Switch } from "../ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

interface FeatureInfo {
  name: string;
  description: string;
  learnMoreUrl?: string;
}

const featureInfoMap: Record<string, FeatureInfo> = {
  "Data Eviction": {
    name: "Data Eviction",
    description:
      "Automatically remove least used data when cache is full using configurable policies.",
    learnMoreUrl: "https://docs.example.com/cache/eviction",
  },
  "Data Persistence": {
    name: "Data Persistence",
    description:
      "Save cache data to disk to prevent data loss on restart and enable recovery.",
    learnMoreUrl: "https://docs.example.com/cache/persistence",
  },
  "Data Encryption": {
    name: "Data Encryption",
    description:
      "Encrypt cached data at rest and in transit for enhanced security.",
    learnMoreUrl: "https://docs.example.com/cache/encryption",
  },
  "Data Compression": {
    name: "Data Compression",
    description:
      "Compress cached data to optimize memory usage and improve performance.",
    learnMoreUrl: "https://docs.example.com/cache/compression",
  },
  "Data Replication": {
    name: "Data Replication",
    description:
      "Replicate data across multiple nodes for high availability and fault tolerance.",
    learnMoreUrl: "https://docs.example.com/cache/replication",
  },
  "Data Partitioning": {
    name: "Data Partitioning",
    description:
      "Distribute data across multiple nodes for better scalability and performance.",
    learnMoreUrl: "https://docs.example.com/cache/partitioning",
  },
  "Data Migration": {
    name: "Data Migration",
    description:
      "Move data between nodes during scaling operations or maintenance.",
    learnMoreUrl: "https://docs.example.com/cache/migration",
  },
  "Data Monitoring": {
    name: "Data Monitoring",
    description:
      "Monitor cache usage, hit rates, and performance metrics in real-time.",
    learnMoreUrl: "https://docs.example.com/cache/monitoring",
  },
  "TTL Support": {
    name: "TTL Support",
    description:
      "Set expiration times for cached items to automatically manage data lifecycle.",
    learnMoreUrl: "https://docs.example.com/cache/ttl",
  },
  "Cache Invalidation": {
    name: "Cache Invalidation",
    description:
      "Manually or automatically invalidate cached items based on specific events or patterns.",
    learnMoreUrl: "https://docs.example.com/cache/invalidation",
  },
  "Cache Preloading": {
    name: "Cache Preloading",
    description:
      "Proactively load frequently accessed data into cache to improve hit rates.",
    learnMoreUrl: "https://docs.example.com/cache/preloading",
  },
  "Write-Through": {
    name: "Write-Through",
    description:
      "Simultaneously update both cache and backing store to ensure consistency.",
    learnMoreUrl: "https://docs.example.com/cache/write-through",
  },
  "Write-Behind": {
    name: "Write-Behind",
    description:
      "Asynchronously update backing store after cache update for better performance.",
    learnMoreUrl: "https://docs.example.com/cache/write-behind",
  },
};

const configInfoMap: Record<string, FeatureInfo> = {
  "Free-form Text Mode": {
    name: "Free-form Text Mode",
    description:
      "Toggle between detailed configuration and free-form text input. Free-form text allows you to describe your cache configuration in a more natural way.",
    learnMoreUrl: "https://docs.example.com/cache-configuration",
  },
  "Cache Type": {
    name: "Cache Type",
    description:
      "The type of caching system to use. Different cache types are optimized for different use cases and requirements.",
    learnMoreUrl: "https://docs.example.com/cache-types",
  },
  "Eviction Policy": {
    name: "Eviction Policy",
    description:
      "Strategy used to remove items when the cache reaches capacity. Choose based on your access patterns and requirements.",
    learnMoreUrl: "https://docs.example.com/cache-eviction",
  },
  "Distribution Configuration": {
    name: "Distribution Configuration",
    description:
      "Configure how your cache is distributed across multiple nodes for scalability and reliability.",
    learnMoreUrl: "https://docs.example.com/cache-distribution",
  },
  Memory: {
    name: "Memory",
    description:
      "Total memory allocated for cache storage. Consider your working set size and access patterns.",
    learnMoreUrl: "https://docs.example.com/cache-memory",
  },
  "Max Items": {
    name: "Max Items",
    description:
      "Maximum number of items that can be stored in the cache. Helps control memory usage.",
    learnMoreUrl: "https://docs.example.com/cache-limits#max-items",
  },
  "Max Item Size": {
    name: "Max Item Size",
    description:
      "Maximum size allowed for individual cache entries. Prevents single items from consuming too much memory.",
    learnMoreUrl: "https://docs.example.com/cache-limits#max-size",
  },
  Features: {
    name: "Features",
    description:
      "Additional capabilities and features that can be enabled for this cache. These may include eviction policies, persistence, encryption, and more.",
    learnMoreUrl: "https://docs.example.com/cache/features",
  },
  "Number of Nodes": {
    name: "Number of Nodes",
    description:
      "The number of cache nodes in the cluster. More nodes provide better scalability and availability.",
    learnMoreUrl: "https://docs.example.com/cache/nodes",
  },
  "Replication Factor": {
    name: "Replication Factor",
    description:
      "The number of copies of each data item stored across different nodes. Higher replication factor improves availability but uses more storage.",
    learnMoreUrl: "https://docs.example.com/cache/replication-factor",
  },
  "Partitioning Strategy": {
    name: "Partitioning Strategy",
    description:
      "How data is distributed across cache nodes. Different strategies optimize for different access patterns.",
    learnMoreUrl: "https://docs.example.com/cache/partitioning-strategy",
  },
  "Consistency Level": {
    name: "Consistency Level",
    description:
      "The level of data consistency required across replicated nodes. Stronger consistency trades off against availability and latency.",
    learnMoreUrl: "https://docs.example.com/cache/consistency",
  },
  "Additional Configuration": {
    name: "Additional Configuration",
    description:
      "Additional cache configuration, requirements, or constraints specific to your use case.",
    learnMoreUrl: "https://docs.example.com/cache/additional-config",
  },
};

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

export const Cache = ({ name, Icon }: ComponentNodeProps) => {
  return (
    <div className="group flex flex-col items-center text-gray-800 dark:text-gray-200">
      <div className="flex items-center gap-1">
        {Icon && (
          <Icon size={20} className="text-gray-700 dark:text-gray-300" />
        )}
        <Small>{name}</Small>
      </div>
      <CacheSettings name={name} />
    </div>
  );
};

const CacheSettings = ({ name: id }: { name: string }) => {
  const { useSystemComponentConfigSlice } = useSystemDesigner();
  const [isFreeText, setIsFreeText] = useState<boolean>(true);

  const [cacheType, setCacheType] = useSystemComponentConfigSlice<string>(
    id,
    "cache_type",
    "in-memory",
  );

  const [capacity, setCapacity] = useSystemComponentConfigSlice<{
    memory: number;
    maxItems: number;
    maxItemSize: number;
  }>(id, "capacity", {
    memory: 1,
    maxItems: 1000000,
    maxItemSize: 1,
  });

  const [policy, setPolicy] = useSystemComponentConfigSlice<string>(
    id,
    "eviction_policy",
    "lru",
  );

  const [features, setFeatures] = useSystemComponentConfigSlice<string[]>(
    id,
    "features",
    [],
  );

  const [details, setDetails] = useSystemComponentConfigSlice<string>(
    id,
    "details",
    "",
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
    consistencyLevel: "quorum",
  });

  const [freeFormText, setFreeFormText] = useSystemComponentConfigSlice<string>(
    id,
    "free_form_text",
    "",
  );

  const getAvailableFeatures = (type: string): string[] => {
    const commonFeatures = [
      "Data Eviction",
      "Data Compression",
      "Data Encryption",
      "Data Monitoring",
      "TTL Support",
      "Cache Invalidation",
    ];

    switch (type) {
      case "in-memory":
        return [
          ...commonFeatures,
          "Write-Through",
          "Write-Behind",
          "Cache Preloading",
          "Data Persistence",
        ];
      case "distributed":
        return [
          ...commonFeatures,
          "Data Replication",
          "Data Partitioning",
          "Data Migration",
          "Write-Through",
        ];
      case "cdn":
        return [
          ...commonFeatures,
          "Data Replication",
          "Data Partitioning",
          "Cache Preloading",
          "Write-Behind",
        ];
      case "browser":
        return [
          ...commonFeatures,
          "Data Persistence",
          "Cache Preloading",
          "Write-Through",
          "Write-Behind",
        ];
      default:
        return commonFeatures;
    }
  };

  const availableFeatures = getAvailableFeatures(cacheType);

  return (
    <WithSettings name={id}>
      <div className="flex w-full flex-col gap-4">
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
                Note: Detailed configuration options are still a work in progress. Options might get added or deleted.
                </Small>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="cache-type"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Cache Type
                  </Label>
                  {configInfoMap["Cache Type"] && (
                    <InfoPopup feature={configInfoMap["Cache Type"]} />
                  )}
                </div>
                <Select value={cacheType} onValueChange={setCacheType}>
                  <SelectTrigger
                    className={cn(
                      "w-full border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800",
                      "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                    )}
                  >
                    <SelectValue placeholder="Select cache type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-memory">In-Memory Cache</SelectItem>
                    <SelectItem value="distributed">
                      Distributed Cache
                    </SelectItem>
                    <SelectItem value="cdn">CDN Cache</SelectItem>
                    <SelectItem value="browser">Browser Cache</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="eviction-policy"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Eviction Policy
                  </Label>
                  {configInfoMap["Eviction Policy"] && (
                    <InfoPopup feature={configInfoMap["Eviction Policy"]} />
                  )}
                </div>
                <Select value={policy} onValueChange={setPolicy}>
                  <SelectTrigger
                    className={cn(
                      "w-full border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800",
                      "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                    )}
                  >
                    <SelectValue placeholder="Select eviction policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lru">
                      LRU (Least Recently Used)
                    </SelectItem>
                    <SelectItem value="lfu">
                      LFU (Least Frequently Used)
                    </SelectItem>
                    <SelectItem value="fifo">
                      FIFO (First In First Out)
                    </SelectItem>
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
                {configInfoMap["Distribution Configuration"] && (
                  <InfoPopup
                    feature={configInfoMap["Distribution Configuration"]}
                  />
                )}
              </div>

              <div className="mb-2 flex items-center gap-2">
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
                      <Label
                        htmlFor="nodes"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        Number of Nodes
                      </Label>
                      {configInfoMap["Number of Nodes"] && (
                        <InfoPopup feature={configInfoMap["Number of Nodes"]} />
                      )}
                    </div>
                    <Input
                      type="number"
                      id="nodes"
                      value={distribution.nodes}
                      onChange={(e) =>
                        setDistribution({
                          ...distribution,
                          nodes: Number(e.target.value),
                        })
                      }
                      className={cn(
                        "border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800",
                        "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                      )}
                      min={1}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="replication-factor"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        Replication Factor
                      </Label>
                      {configInfoMap["Replication Factor"] && (
                        <InfoPopup
                          feature={configInfoMap["Replication Factor"]}
                        />
                      )}
                    </div>
                    <Input
                      type="number"
                      id="replication-factor"
                      value={distribution.replicationFactor}
                      onChange={(e) =>
                        setDistribution({
                          ...distribution,
                          replicationFactor: Number(e.target.value),
                        })
                      }
                      className={cn(
                        "border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800",
                        "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                      )}
                      min={1}
                      max={distribution.nodes}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="partitioning-strategy"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        Partitioning Strategy
                      </Label>
                      {configInfoMap["Partitioning Strategy"] && (
                        <InfoPopup
                          feature={configInfoMap["Partitioning Strategy"]}
                        />
                      )}
                    </div>
                    <Select
                      value={distribution.partitioningStrategy}
                      onValueChange={(value) =>
                        setDistribution({
                          ...distribution,
                          partitioningStrategy: value,
                        })
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          "w-full border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800",
                          "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                        )}
                      >
                        <SelectValue placeholder="Select partitioning strategy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consistent-hashing">
                          Consistent Hashing
                        </SelectItem>
                        <SelectItem value="range">Range Based</SelectItem>
                        <SelectItem value="modulo">Modulo Based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="consistency-level"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        Consistency Level
                      </Label>
                      {configInfoMap["Consistency Level"] && (
                        <InfoPopup
                          feature={configInfoMap["Consistency Level"]}
                        />
                      )}
                    </div>
                    <Select
                      value={distribution.consistencyLevel}
                      onValueChange={(value) =>
                        setDistribution({
                          ...distribution,
                          consistencyLevel: value,
                        })
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          "w-full border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800",
                          "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                        )}
                      >
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
                  <Label
                    htmlFor="memory"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Memory (GB)
                  </Label>
                  {configInfoMap.Memory && (
                    <InfoPopup feature={configInfoMap.Memory} />
                  )}
                </div>
                <Input
                  type="number"
                  id="memory"
                  value={capacity.memory}
                  onChange={(e) =>
                    setCapacity({ ...capacity, memory: Number(e.target.value) })
                  }
                  className={cn(
                    "border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800",
                    "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                  )}
                  min={1}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="max-items"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Max Items
                  </Label>
                  {configInfoMap["Max Items"] && (
                    <InfoPopup feature={configInfoMap["Max Items"]} />
                  )}
                </div>
                <Input
                  type="number"
                  id="max-items"
                  value={capacity.maxItems}
                  onChange={(e) =>
                    setCapacity({
                      ...capacity,
                      maxItems: Number(e.target.value),
                    })
                  }
                  className={cn(
                    "border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800",
                    "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                  )}
                  min={1000}
                  step={1000}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="max-item-size"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Max Item Size (MB)
                  </Label>
                  {configInfoMap["Max Item Size"] && (
                    <InfoPopup feature={configInfoMap["Max Item Size"]} />
                  )}
                </div>
                <Input
                  type="number"
                  id="max-item-size"
                  value={capacity.maxItemSize}
                  onChange={(e) =>
                    setCapacity({
                      ...capacity,
                      maxItemSize: Number(e.target.value),
                    })
                  }
                  className={cn(
                    "border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800",
                    "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                  )}
                  min={1}
                />
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
                    {featureInfoMap[feature] && (
                      <InfoPopup feature={featureInfoMap[feature]} />
                    )}
                  </div>
                ))}
              </div>
            </div>
               */}

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="cache-details"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Additional Configuration
                </Label>
                {configInfoMap["Additional Configuration"] && (
                  <InfoPopup
                    feature={configInfoMap["Additional Configuration"]}
                  />
                )}
              </div>
              <Textarea
                name="cache-details"
                id="cache-details"
                rows={6}
                placeholder={`Example:
- Cache invalidation strategy
- TTL configuration
- Replication settings
- Backup policies
- Monitoring requirements`}
                className={cn(
                  "text-md border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800",
                  "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                  "placeholder:text-gray-500 dark:placeholder:text-gray-400",
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
              Cache Configuration
            </Label>
            <Textarea
              id="free-form"
              rows={20}
              placeholder={`Describe your cache configuration here. Example:

Cache Type: In-Memory Cache
Capacity:
- Memory: 4GB
- Max Items: 1,000,000
- Max Item Size: 1MB

Features:
- Data Compression
- TTL Support
- Write-Through
- Cache Invalidation

Distribution:
- 3 cache nodes
- Consistent hashing
- Replication factor: 2
- Quorum consistency

Additional Requirements:
- Monitoring and alerts
- Eviction policy: LRU
- Backup strategy
- Security configurations`}
              className={cn(
                "text-md border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800",
                "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                "placeholder:text-gray-500 dark:placeholder:text-gray-400",
              )}
              value={freeFormText}
              onChange={(e) => setFreeFormText(e.target.value)}
            />
          </div>
        )}
      </div>
    </WithSettings>
  );
};
