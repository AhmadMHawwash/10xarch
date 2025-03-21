import { useSystemDesigner } from "@/lib/hooks/_useSystemDesigner";
import { cn } from "@/lib/utils";
import { type NodeSettingsRefObject } from "@/types/system";
import { ExternalLink, HelpCircle } from "lucide-react";
import { useState } from "react";
import { type ComponentNodeProps } from "../ReactflowCustomNodes/SystemComponentNode";
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
import { Textarea } from "../ui/textarea";
import { Muted, Small } from "../ui/typography";
import { WithSettings } from "./Wrappers/WithSettings";

interface FeatureInfo {
  name: string;
  description: string;
  learnMoreUrl?: string;
}

const configInfoMap: Record<string, FeatureInfo> = {
  "Free-form Text Mode": {
    name: "Free-form Text Mode",
    description:
      "Toggle between detailed configuration and free-form text input. Free-form text allows you to describe your server configuration in a more natural way, while detailed configuration provides structured input fields.",
    learnMoreUrl: "https://docs.example.com/server-configuration",
  },
  "Server Type": {
    name: "Server Type",
    description:
      "The primary purpose and role of this server in your system architecture. Different server types are optimized for different workloads and use cases.",
    learnMoreUrl: "https://docs.example.com/server-types",
  },
  "Compute Type": {
    name: "Compute Type",
    description:
      "The type of compute resources optimized for this server. Choose based on your workload requirements: general purpose for balanced performance, compute optimized for CPU-intensive tasks, memory optimized for large datasets, or storage optimized for I/O operations.",
    learnMoreUrl: "https://docs.example.com/compute-types",
  },
  "Scaling Configuration": {
    name: "Scaling Configuration",
    description:
      "Configure how your server scales to handle varying workloads. Set up high availability with multiple instances and define auto-scaling rules based on metrics like CPU utilization or request count.",
    learnMoreUrl: "https://docs.example.com/server-scaling",
  },
  CPU: {
    name: "CPU",
    description:
      "The number of CPU cores available for this server. More cores generally mean better performance for multi-threaded applications.",
    learnMoreUrl: "https://docs.example.com/server-configuration#cpu",
  },
  Memory: {
    name: "Memory",
    description:
      "The amount of RAM available for this server. More memory generally means better performance for applications that require a lot of random access memory (RAM).",
    learnMoreUrl: "https://docs.example.com/server-configuration#memory",
  },
  Storage: {
    name: "Storage",
    description:
      "The total amount of storage available for this server. Storage is used for data, logs, and other server files. More storage generally means you can store more data and files.",
    learnMoreUrl: "https://docs.example.com/server-configuration#storage",
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

export const Server = ({
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
      <ServerSettings name={name} nodeSettingsRef={nodeSettingsRef} />
    </div>
  );
};

const ServerSettings = ({
  name: id,
  nodeSettingsRef,
}: {
  name: string;
  nodeSettingsRef: NodeSettingsRefObject;
}) => {
  const { useSystemComponentConfigSlice } = useSystemDesigner();
  const [isFreeText, setIsFreeText] = useState<boolean>(true);

  const [serverType, setServerType] = useSystemComponentConfigSlice<string>(
    id,
    "server_type",
    "application",
  );

  const [computeType, setComputeType] = useSystemComponentConfigSlice<string>(
    id,
    "compute_type",
    "general",
  );

  const [capacity, setCapacity] = useSystemComponentConfigSlice<{
    cpu: number;
    memory: number;
    storage: number;
  }>(id, "capacity", {
    cpu: 2,
    memory: 4,
    storage: 100,
  });

  const [details, setDetails] = useSystemComponentConfigSlice<string>(
    id,
    "details",
    "",
  );

  const [scaling, setScaling] = useSystemComponentConfigSlice<{
    enabled: boolean;
    minInstances: number;
    maxInstances: number;
    autoScalingEnabled: boolean;
    scalingMetric: string;
    scalingThreshold: number;
  }>(id, "scaling", {
    enabled: false,
    minInstances: 1,
    maxInstances: 5,
    autoScalingEnabled: true,
    scalingMetric: "cpu",
    scalingThreshold: 70,
  });

  const [freeFormText, setFreeFormText] = useSystemComponentConfigSlice<string>(
    id,
    "free_form_text",
    "",
  );

  return (
    <WithSettings id={id} name={id} nodeSettingsRef={nodeSettingsRef}>
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
                  Note: Detailed configuration options are still a work in
                  progress. Options might get added or deleted.
                </Small>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="server-type"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Server Type
                  </Label>
                  {configInfoMap["Server Type"] && (
                    <InfoPopup feature={configInfoMap["Server Type"]} />
                  )}
                </div>
                <Select value={serverType} onValueChange={setServerType}>
                  <SelectTrigger
                    className={cn(
                      "w-full border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800",
                      "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                    )}
                  >
                    <SelectValue placeholder="Select server type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="application">
                      Application Server
                    </SelectItem>
                    <SelectItem value="api">API Server</SelectItem>
                    <SelectItem value="web">Web Server</SelectItem>
                    <SelectItem value="processing">
                      Processing Server
                    </SelectItem>
                    <SelectItem value="caching">Caching Server</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="compute-type"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Compute Type
                  </Label>
                  {configInfoMap["Compute Type"] && (
                    <InfoPopup feature={configInfoMap["Compute Type"]} />
                  )}
                </div>
                <Select value={computeType} onValueChange={setComputeType}>
                  <SelectTrigger
                    className={cn(
                      "w-full border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800",
                      "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                    )}
                  >
                    <SelectValue placeholder="Select compute type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Purpose</SelectItem>
                    <SelectItem value="compute">Compute Optimized</SelectItem>
                    <SelectItem value="memory">Memory Optimized</SelectItem>
                    <SelectItem value="storage">Storage Optimized</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Label className="text-gray-700 dark:text-gray-300">
                  Scaling Configuration
                </Label>
                {configInfoMap["Scaling Configuration"] && (
                  <InfoPopup feature={configInfoMap["Scaling Configuration"]} />
                )}
              </div>

              <div className="mb-2 flex items-center gap-2">
                <Checkbox
                  id="scaling-enabled"
                  checked={scaling.enabled}
                  onCheckedChange={(checked) => {
                    setScaling({ ...scaling, enabled: !!checked });
                  }}
                  className="border-gray-400 dark:border-gray-600"
                />
                <Label
                  htmlFor="scaling-enabled"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  Enable High Availability
                </Label>
              </div>

              {scaling.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="min-instances"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        Min Instances
                      </Label>
                      <InfoPopup
                        feature={{
                          name: "Minimum Instances",
                          description:
                            "The minimum number of server instances that should be running at all times. This ensures baseline availability and performance even during low traffic periods.",
                          learnMoreUrl:
                            "https://docs.example.com/server-scaling#min-instances",
                        }}
                      />
                    </div>
                    <Input
                      type="number"
                      id="min-instances"
                      value={scaling.minInstances}
                      onChange={(e) =>
                        setScaling({
                          ...scaling,
                          minInstances: Number(e.target.value),
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
                        htmlFor="max-instances"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        Max Instances
                      </Label>
                      <InfoPopup
                        feature={{
                          name: "Maximum Instances",
                          description:
                            "The maximum number of server instances that can be running at any time. This helps control costs while ensuring your system can handle peak loads.",
                          learnMoreUrl:
                            "https://docs.example.com/server-scaling#max-instances",
                        }}
                      />
                    </div>
                    <Input
                      type="number"
                      id="max-instances"
                      value={scaling.maxInstances}
                      onChange={(e) =>
                        setScaling({
                          ...scaling,
                          maxInstances: Number(e.target.value),
                        })
                      }
                      className={cn(
                        "border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800",
                        "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                      )}
                      min={scaling.minInstances}
                    />
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="auto-scaling"
                        checked={scaling.autoScalingEnabled}
                        onCheckedChange={(checked) => {
                          setScaling({
                            ...scaling,
                            autoScalingEnabled: !!checked,
                          });
                        }}
                        className="border-gray-400 dark:border-gray-600"
                      />
                      <Label
                        htmlFor="auto-scaling"
                        className="text-sm text-gray-700 dark:text-gray-300"
                      >
                        Enable Auto-scaling
                      </Label>
                      <InfoPopup
                        feature={{
                          name: "Auto-scaling",
                          description:
                            "Automatically adjust the number of server instances based on defined metrics and thresholds. This ensures optimal resource utilization and cost efficiency.",
                          learnMoreUrl:
                            "https://docs.example.com/server-scaling#auto-scaling",
                        }}
                      />
                    </div>
                  </div>

                  {scaling.autoScalingEnabled && (
                    <>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor="scaling-metric"
                            className="text-gray-700 dark:text-gray-300"
                          >
                            Scaling Metric
                          </Label>
                          <InfoPopup
                            feature={{
                              name: "Scaling Metric",
                              description:
                                "The metric used to determine when to scale your server instances. Common metrics include CPU utilization, memory usage, request count, and response latency.",
                              learnMoreUrl:
                                "https://docs.example.com/server-scaling#metrics",
                            }}
                          />
                        </div>
                        <Select
                          value={scaling.scalingMetric}
                          onValueChange={(value) =>
                            setScaling({ ...scaling, scalingMetric: value })
                          }
                        >
                          <SelectTrigger
                            className={cn(
                              "w-full border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800",
                              "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                            )}
                          >
                            <SelectValue placeholder="Select scaling metric" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cpu">CPU Utilization</SelectItem>
                            <SelectItem value="memory">Memory Usage</SelectItem>
                            <SelectItem value="requests">
                              Request Count
                            </SelectItem>
                            <SelectItem value="latency">
                              Response Latency
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor="scaling-threshold"
                            className="text-gray-700 dark:text-gray-300"
                          >
                            Scaling Threshold (%)
                          </Label>
                          <InfoPopup
                            feature={{
                              name: "Scaling Threshold",
                              description:
                                "The threshold value that triggers auto-scaling actions. When the chosen metric exceeds this threshold, the system will automatically scale up the number of instances.",
                              learnMoreUrl:
                                "https://docs.example.com/server-scaling#thresholds",
                            }}
                          />
                        </div>
                        <Input
                          type="number"
                          id="scaling-threshold"
                          value={scaling.scalingThreshold}
                          onChange={(e) =>
                            setScaling({
                              ...scaling,
                              scalingThreshold: Number(e.target.value),
                            })
                          }
                          className={cn(
                            "border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800",
                            "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                          )}
                          min={1}
                          max={100}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="cpu"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    CPU (cores)
                  </Label>
                  {configInfoMap.CPU && (
                    <InfoPopup feature={configInfoMap.CPU} />
                  )}
                </div>
                <Input
                  type="number"
                  id="cpu"
                  value={capacity.cpu}
                  onChange={(e) =>
                    setCapacity({ ...capacity, cpu: Number(e.target.value) })
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
                    htmlFor="storage"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Storage (GB)
                  </Label>
                  {configInfoMap.Storage && (
                    <InfoPopup feature={configInfoMap.Storage} />
                  )}
                </div>
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
                    "border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800",
                    "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                  )}
                  min={1}
                />
              </div>
            </div>

            {/* <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Label className="text-gray-700 dark:text-gray-300">
                  Features
                </Label>
                <InfoPopup
                  feature={{
                    name: "Server Features",
                    description: "Additional capabilities and features that can be enabled for this server. These may include monitoring, security features, performance optimizations, and more.",
                    learnMoreUrl: "https://docs.example.com/server-features"
                  }}
                />
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
            </div> */}

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="server-details"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Additional Configuration
                </Label>
                <InfoPopup
                  feature={{
                    name: "Additional Configuration",
                    description:
                      "Specify any additional server configuration details, requirements, or constraints. This can include specific middleware requirements, security configurations, performance requirements, or deployment constraints.",
                    learnMoreUrl:
                      "https://docs.example.com/server-configuration#additional",
                  }}
                />
              </div>
              <Textarea
                name="server-details"
                id="server-details"
                rows={6}
                placeholder={`Example:
- Specific middleware requirements
- Security configurations
- Performance requirements
- Deployment constraints`}
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
              Server Configuration
            </Label>
            <Textarea
              id="free-form"
              rows={20}
              placeholder={`Describe your server configuration here. Example:

Server Type: Application Server
Compute Type: General Purpose

Capacity:
- CPU: 4 cores
- Memory: 16GB
- Storage: 100GB

Scaling Configuration:
- Min Instances: 2
- Max Instances: 8
- Auto-scaling enabled
- Scale on CPU utilization > 70%

Features:
- Health monitoring
- Request rate limiting
- Database connection pooling
- Session management

Additional Requirements:
- Load balancing configuration
- Security settings
- Monitoring requirements
- Deployment constraints`}
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
