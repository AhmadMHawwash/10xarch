import { useSystemDesigner } from "@/lib/hooks/_useSystemDesigner";
import { cn } from "@/lib/utils";
import { ExternalLink, HelpCircle } from "lucide-react";
import { useState } from "react";
import { type ComponentNodeProps } from "../ReactflowCustomNodes/SystemComponentNode";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { Small } from "../ui/typography";
import { WithSettings } from "./Wrappers/WithSettings";

interface FeatureInfo {
  name: string;
  description: string;
  learnMoreUrl?: string;
}

const configInfoMap: Record<string, FeatureInfo> = {
  "Free-form Text Mode": {
    name: "Free-form Text Mode",
    description: "Toggle between detailed configuration and free-form text input. Free-form text allows you to describe your load balancer configuration in a more natural way.",
    learnMoreUrl: "https://docs.example.com/lb-configuration"
  },
  "Load Balancing Algorithm": {
    name: "Load Balancing Algorithm",
    description: "The method used to distribute traffic across backend servers. Different algorithms are suited for different workload patterns.",
    learnMoreUrl: "https://docs.example.com/lb-algorithms"
  },
  "Max Connections": {
    name: "Max Connections",
    description: "Maximum number of concurrent connections the load balancer can handle.",
    learnMoreUrl: "https://docs.example.com/lb-connections"
  },
  "Throughput": {
    name: "Throughput",
    description: "Maximum number of requests per second the load balancer can process.",
    learnMoreUrl: "https://docs.example.com/lb-throughput"
  },
  "Features": {
    name: "Features",
    description: "Additional capabilities and features that can be enabled for this load balancer. These may include SSL termination, session persistence, health checks, and more.",
    learnMoreUrl: "https://docs.example.com/load-balancer/features"
  },
  "Additional Configuration": {
    name: "Additional Configuration",
    description: "Additional load balancer configuration, requirements, or constraints specific to your use case.",
    learnMoreUrl: "https://docs.example.com/load-balancer/additional-config"
  }
};

const InfoPopup = ({ feature }: { feature: FeatureInfo }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 cursor-help">
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

export const LoadBalancer = ({ name, Icon }: ComponentNodeProps) => {
  return (
    <div className="flex flex-col items-center text-gray-800 dark:text-gray-200 group">
      <div className="flex items-center gap-1">
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
                <Small>Note: Detailed configuration options are still a work in progress. Options might get added or deleted.</Small>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="algorithm" className="text-gray-700 dark:text-gray-300">
                  Load Balancing Algorithm
                </Label>
                {configInfoMap["Load Balancing Algorithm"] && (
                  <InfoPopup feature={configInfoMap["Load Balancing Algorithm"]} />
                )}
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
                  {configInfoMap["Max Connections"] && (
                    <InfoPopup feature={configInfoMap["Max Connections"]} />
                  )}
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
                  {configInfoMap.Throughput && (
                    <InfoPopup feature={configInfoMap.Throughput} />
                  )}
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
                <Label htmlFor="loadbalancer-details" className="text-gray-700 dark:text-gray-300">
                  Additional Configuration
                </Label>
                {configInfoMap["Additional Configuration"] && (
                  <InfoPopup feature={configInfoMap["Additional Configuration"]} />
                )}
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
