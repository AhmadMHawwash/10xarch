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
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { cn } from "@/lib/utils";
import { Checkbox } from "../ui/checkbox";
import { Switch } from "../ui/switch";

export const Server = ({ name, Icon }: ComponentNodeProps) => {
  return (
    <div className="group relative flex flex-col items-center text-gray-800 dark:text-gray-200">
      <div className="relative flex items-center gap-1">
        {Icon && (
          <Icon size={20} className="text-gray-700 dark:text-gray-300" />
        )}
        <Small>{name}</Small>
      </div>
      <ServerSettings name={name} />
    </div>
  );
};

const ServerSettings = ({ name: id }: { name: string }) => {
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

  const getAvailableFeatures = (type: string): string[] => {
    const commonFeatures = [
      "Health monitoring",
      "Fault tolerance",
      "Logging & Monitoring",
      "Backup & Restore",
    ];

    switch (type) {
      case "application":
        return [
          ...commonFeatures,
          "Request rate limiting",
          "Database connection pooling",
          "Session management",
          "Application caching",
        ];
      case "api":
        return [
          ...commonFeatures,
          "API Gateway",
          "Request validation",
          "Rate limiting",
          "API versioning",
        ];
      case "web":
        return [
          ...commonFeatures,
          "Static file serving",
          "Compression",
          "URL rewriting",
          "Virtual hosting",
        ];
      case "processing":
        return [
          ...commonFeatures,
          "Job scheduling",
          "Queue processing",
          "Resource isolation",
          "Batch processing",
        ];
      case "caching":
        return [
          ...commonFeatures,
          "Cache coherence",
          "Cache partitioning",
          "Eviction policies",
          "Cache statistics",
        ];
      default:
        return commonFeatures;
    }
  };

  const availableFeatures = getAvailableFeatures(serverType);

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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle between detailed configuration and free-form text input</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Switch
            id="free-text-mode"
            checked={isFreeText}
            onCheckedChange={setIsFreeText}
          />
        </div>

        {!isFreeText ? (
          <div className="grid w-full grid-flow-row grid-cols-1 gap-4 text-gray-800 dark:text-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="server-type"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Server Type
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>The primary purpose of this server in the system</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          The type of compute resources optimized for this
                          server
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Server scaling and high availability settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-gray-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Minimum number of server instances</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-gray-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Maximum number of server instances</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-gray-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Automatically adjust instance count based on load
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-4 w-4 text-gray-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Metric used for auto-scaling decisions</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-4 w-4 text-gray-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Threshold that triggers auto-scaling</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Number of CPU cores</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>RAM in gigabytes</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Storage capacity in gigabytes</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
                      <p>Server capabilities and features</p>
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
                <Label
                  htmlFor="server-details"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Additional Configuration
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Additional server configuration details, requirements,
                        or constraints
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
