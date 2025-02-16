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

export const CDN = ({ name, Icon }: ComponentNodeProps) => {
  return (
    <div className="relative flex flex-col items-center text-gray-800 dark:text-gray-200 group">
      <div className="relative flex items-center gap-1">
        {Icon && <Icon size={20} className="text-gray-700 dark:text-gray-300" />}
        <Small>{name}</Small>
      </div>
      <CDNSettings name={name} />
    </div>
  );
};

const CDNSettings = ({ name: id }: { name: string }) => {
  const { useSystemComponentConfigSlice } = useSystemDesigner();
  const [isFreeText, setIsFreeText] = useState<boolean>(true);

  const [cdnType, setCdnType] = useSystemComponentConfigSlice<string>(
    id,
    "cdn_type",
    "public"
  );

  const [capacity, setCapacity] = useSystemComponentConfigSlice<{
    storage: number;
    bandwidth: number;
    edgeLocations: number;
  }>(id, "capacity", {
    storage: 1000,
    bandwidth: 1000,
    edgeLocations: 10
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
    "Edge Caching",
    "Origin Shield",
    "Dynamic Compression",
    "HTTP/3 Support",
    "Smart Purging",
    "Geo-routing",
    "Media Optimization",
    "Access Control"
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
                  <div className="rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 cursor-help">
                    <HelpCircle className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
                  </div>
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
                <Label htmlFor="cdn-type" className="text-gray-700 dark:text-gray-300">
                  CDN Type
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 cursor-help">
                        <HelpCircle className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The type of CDN service to use</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select value={cdnType} onValueChange={setCdnType}>
                <SelectTrigger className={cn(
                  "w-full bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700",
                  "text-gray-900 dark:text-gray-100 focus:ring-gray-400 dark:focus:ring-gray-600"
                )}>
                  <SelectValue placeholder="Select CDN type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public CDN</SelectItem>
                  <SelectItem value="private">Private CDN</SelectItem>
                  <SelectItem value="hybrid">Hybrid CDN</SelectItem>
                  <SelectItem value="p2p">P2P CDN</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="storage" className="text-gray-700 dark:text-gray-300">
                    Storage (TB)
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 cursor-help">
                          <HelpCircle className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total storage capacity in terabytes</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  type="number"
                  id="storage"
                  value={capacity.storage}
                  onChange={(e) => setCapacity({ ...capacity, storage: Number(e.target.value) })}
                  className={cn(
                    "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700",
                    "text-gray-900 dark:text-gray-100 focus:ring-gray-400 dark:focus:ring-gray-600"
                  )}
                  min={100}
                  step={100}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="bandwidth" className="text-gray-700 dark:text-gray-300">
                    Bandwidth (Gbps)
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 cursor-help">
                          <HelpCircle className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total bandwidth capacity in gigabits per second</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  type="number"
                  id="bandwidth"
                  value={capacity.bandwidth}
                  onChange={(e) => setCapacity({ ...capacity, bandwidth: Number(e.target.value) })}
                  className={cn(
                    "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700",
                    "text-gray-900 dark:text-gray-100 focus:ring-gray-400 dark:focus:ring-gray-600"
                  )}
                  min={100}
                  step={100}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="edge-locations" className="text-gray-700 dark:text-gray-300">
                    Edge Locations
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 cursor-help">
                          <HelpCircle className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Number of edge locations/Points of Presence (PoP)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  type="number"
                  id="edge-locations"
                  value={capacity.edgeLocations}
                  onChange={(e) => setCapacity({ ...capacity, edgeLocations: Number(e.target.value) })}
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
                      <div className="rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 cursor-help">
                        <HelpCircle className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>CDN capabilities and features</p>
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
                <Label htmlFor="cdn-details" className="text-gray-700 dark:text-gray-300">
                  Additional Configuration
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 cursor-help">
                        <HelpCircle className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Additional CDN configuration, policies, or requirements</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Textarea
                name="cdn-details"
                id="cdn-details"
                rows={6}
                placeholder={`Example:
- Cache control policies
- Origin server settings
- Security configurations
- Custom routing rules
- Content optimization settings
- Geographic restrictions`}
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
              CDN Configuration
            </Label>
            <Textarea
              id="free-form"
              rows={20}
              placeholder={`Describe your CDN configuration here. Example:

CDN Type: Public CDN

Capacity:
- Storage: 1000TB
- Bandwidth: 1000Gbps
- Edge Locations: 10

Features:
- Edge Caching
- Origin Shield
- Dynamic Compression
- HTTP/3 Support
- Smart Purging
- Geo-routing
- Media Optimization
- Access Control

Additional Requirements:
- Cache control policies
- Origin server settings
- Security configurations
- Custom routing rules
- Content optimization settings
- Geographic restrictions`}
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
