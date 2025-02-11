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

  const availableFeatures = [
    "HTTPS/SSL",
    "DDoS Protection",
    "WAF",
    "Image Optimization",
    "Video Streaming",
    "Geo-blocking",
    "Custom Domain",
    "Real-time Analytics"
  ];

  return (
    <WithSettings name={id}>
      <div className="grid w-full grid-flow-row grid-cols-1 gap-4 text-gray-800 dark:text-gray-200">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="cdn-type" className="text-gray-700 dark:text-gray-300">
              CDN Type
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-500" />
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
                    <HelpCircle className="h-4 w-4 text-gray-500" />
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
                    <HelpCircle className="h-4 w-4 text-gray-500" />
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
                    <HelpCircle className="h-4 w-4 text-gray-500" />
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
                  <HelpCircle className="h-4 w-4 text-gray-500" />
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
                  <HelpCircle className="h-4 w-4 text-gray-500" />
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
            placeholder="Example:
- Cache control policies
- Origin server settings
- Security configurations
- Custom routing rules
- Content optimization settings
- Geographic restrictions"
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
