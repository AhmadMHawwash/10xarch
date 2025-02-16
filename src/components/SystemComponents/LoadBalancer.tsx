import { useSystemDesigner } from "@/lib/hooks/_useSystemDesigner";
import { type ComponentNodeProps } from "../ReactflowCustomNodes/SystemComponentNode";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Small } from "../ui/typography";
import { WithSettings } from "./Wrappers/WithSettings";
import { useState } from "react";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { cn } from "@/lib/utils";
import { Checkbox } from "../ui/checkbox";
import { Switch } from "../ui/switch";

export const LoadBalancer = ({ name, Icon }: ComponentNodeProps) => {
  return (
    <div className="relative flex flex-col items-center text-gray-800 dark:text-gray-200 group">
      <div className="relative flex items-center gap-1">
        {Icon && <Icon size={20} className="text-gray-700 dark:text-gray-300" />}
        <Small>{name}</Small>
      </div>
      <LoadBalancerSettings name={name} />
    </div>
  );
};

const LoadBalancerSettings = ({ name: id }: { name: string }) => {
  const { useSystemComponentConfigSlice } = useSystemDesigner();
  const [isFreeText, setIsFreeText] = useState<boolean>(true);

  const [algorithm, setAlgorithm] = useSystemComponentConfigSlice<string>(
    id,
    "algorithm",
    "round-robin"
  );

  const [capacity, setCapacity] = useSystemComponentConfigSlice<{
    maxConnections: number;
    throughput: number;
  }>(id, "capacity", {
    maxConnections: 10000,
    throughput: 1000
  });

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

  const [freeFormText, setFreeFormText] = useSystemComponentConfigSlice<string>(
    id,
    "free_form_text",
    ""
  );

  const availableFeatures = [
    "SSL Termination",
    "Session Persistence",
    "Health Checks",
    "Rate Limiting",
    "DDoS Protection",
    "HTTP/2 Support"
  ];

  return (
    <WithSettings name={id}>
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor="free-text-mode" className="text-gray-700 dark:text-gray-300">
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
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="algorithm" className="text-gray-700 dark:text-gray-300">
                  Load Balancing Algorithm
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The algorithm used to distribute traffic across servers</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select value={algorithm} onValueChange={setAlgorithm}>
                <SelectTrigger className={cn(
                  "w-full bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700",
                  "text-gray-900 dark:text-gray-100 focus:ring-gray-400 dark:focus:ring-gray-600"
                )}>
                  <SelectValue placeholder="Select algorithm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="round-robin">Round Robin</SelectItem>
                  <SelectItem value="least-connections">Least Connections</SelectItem>
                  <SelectItem value="weighted-round-robin">Weighted Round Robin</SelectItem>
                  <SelectItem value="ip-hash">IP Hash</SelectItem>
                  <SelectItem value="url-hash">URL Hash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="max-connections" className="text-gray-700 dark:text-gray-300">
                    Max Connections
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Maximum number of concurrent connections</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  type="number"
                  id="max-connections"
                  value={capacity.maxConnections}
                  onChange={(e) => setCapacity({ ...capacity, maxConnections: Number(e.target.value) })}
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
                  <Label htmlFor="throughput" className="text-gray-700 dark:text-gray-300">
                    Throughput (req/s)
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Requests per second the load balancer can handle</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  type="number"
                  id="throughput"
                  value={capacity.throughput}
                  onChange={(e) => setCapacity({ ...capacity, throughput: Number(e.target.value) })}
                  className={cn(
                    "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700",
                    "text-gray-900 dark:text-gray-100 focus:ring-gray-400 dark:focus:ring-gray-600"
                  )}
                  min={100}
                  step={100}
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
                      <p>Load balancer capabilities and features</p>
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
                <Label htmlFor="loadbalancer-details" className="text-gray-700 dark:text-gray-300">
                  Additional Configuration
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Additional load balancer configuration, policies, or requirements</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Textarea
                name="loadbalancer-details"
                id="loadbalancer-details"
                rows={6}
                placeholder={`Example:
- Health check configuration
- SSL/TLS settings
- Session persistence rules
- Custom routing policies
- Monitoring requirements`}
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
        ) : (
          <div className="flex flex-col gap-2">
            <Label htmlFor="free-form" className="text-gray-700 dark:text-gray-300">
              Load Balancer Configuration
            </Label>
            <Textarea
              id="free-form"
              rows={20}
              placeholder={`Describe your load balancer configuration here. Example:

Load Balancing Algorithm: Round Robin

Capacity:
- Max Connections: 10,000
- Throughput: 1,000 req/s

Features:
- SSL Termination
- Session Persistence
- Health Checks
- Rate Limiting
- DDoS Protection
- HTTP/2 Support

Additional Requirements:
- Health check configuration
- SSL/TLS settings
- Session persistence rules
- Custom routing policies
- Monitoring requirements`}
              className={cn(
                "text-md bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700",
                "text-gray-900 dark:text-gray-100 focus:ring-gray-400 dark:focus:ring-gray-600",
                "placeholder:text-gray-500 dark:placeholder:text-gray-400"
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
