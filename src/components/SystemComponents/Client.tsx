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

export const Client = ({ name, Icon }: ComponentNodeProps) => {
  return (
    <div className="relative flex flex-col items-center text-gray-800 dark:text-gray-200 group">
      <div className="relative flex items-center gap-1">
        {Icon && <Icon size={20} className="text-gray-700 dark:text-gray-300" />}
        <Small>{name}</Small>
      </div>
      <ClientSettings name={name} />
    </div>
  );
};

const ClientSettings = ({ name: id }: { name: string }) => {
  const { useSystemComponentConfigSlice } = useSystemDesigner();
  const [isDetailedMode, setIsDetailedMode] = useState<boolean>(false);

  const [clientType, setClientType] = useSystemComponentConfigSlice<string>(
    id,
    "client_type",
    "web"
  );

  const [concurrentUsers, setConcurrentUsers] = useSystemComponentConfigSlice<number>(
    id,
    "concurrent_users",
    1000
  );

  const [location, setLocation] = useSystemComponentConfigSlice<string>(
    id,
    "location",
    "global"
  );

  const [details, setDetails] = useSystemComponentConfigSlice<string>(
    id,
    "details",
    ""
  );

  const [features, setFeatures] = useSystemComponentConfigSlice<string[]>(
    id,
    "features",
    []
  );

  const [freeFormText, setFreeFormText] = useSystemComponentConfigSlice<string>(
    id,
    "free_form_text",
    ""
  );

  const getAvailableFeatures = (type: string): string[] => {
    const commonFeatures = [
      "Error Handling",
      "Request Retries",
      "Request Timeout",
      "Response Caching"
    ];

    switch (type) {
      case "web":
        return [
          ...commonFeatures,
          "Service Workers",
          "Progressive Loading",
          "Offline Support",
          "State Management"
        ];
      case "mobile":
        return [
          ...commonFeatures,
          "Background Sync",
          "Push Notifications",
          "Data Persistence",
          "Network Detection"
        ];
      case "iot":
        return [
          ...commonFeatures,
          "Device Management",
          "Data Buffering",
          "Power Management",
          "Secure Boot"
        ];
      case "desktop":
        return [
          ...commonFeatures,
          "Auto Updates",
          "Native Integration",
          "Cross Platform",
          "Resource Management"
        ];
      default:
        return commonFeatures;
    }
  };

  const availableFeatures = getAvailableFeatures(clientType);

  return (
    <WithSettings name={id}>
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor="detailed-mode" className="text-gray-700 dark:text-gray-300">
              Detailed Configuration
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
            id="detailed-mode"
            checked={isDetailedMode}
            onCheckedChange={setIsDetailedMode}
          />
        </div>

        {isDetailedMode ? (
          <div className="grid w-full grid-flow-row grid-cols-1 gap-4 text-gray-800 dark:text-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="client-type" className="text-gray-700 dark:text-gray-300">
                    Client Type
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Select the type of client that will interact with the system</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select value={clientType} onValueChange={setClientType}>
                  <SelectTrigger className={cn(
                    "w-full bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700",
                    "text-gray-900 dark:text-gray-100 focus:ring-gray-400 dark:focus:ring-gray-600"
                  )}>
                    <SelectValue placeholder="Select client type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">Web Client</SelectItem>
                    <SelectItem value="mobile">Mobile Client</SelectItem>
                    <SelectItem value="iot">IoT Device</SelectItem>
                    <SelectItem value="desktop">Desktop Application</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="location" className="text-gray-700 dark:text-gray-300">
                    Client Location
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Geographic distribution of clients</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className={cn(
                    "w-full bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700",
                    "text-gray-900 dark:text-gray-100 focus:ring-gray-400 dark:focus:ring-gray-600"
                  )}>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="regional">Regional</SelectItem>
                    <SelectItem value="local">Local</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="concurrent-users" className="text-gray-700 dark:text-gray-300">
                  Concurrent Users
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Expected number of simultaneous users</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                type="number"
                id="concurrent-users"
                value={concurrentUsers}
                onChange={(e) => setConcurrentUsers(Number(e.target.value))}
                className={cn(
                  "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700",
                  "text-gray-900 dark:text-gray-100 focus:ring-gray-400 dark:focus:ring-gray-600"
                )}
                min={1}
              />
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
                      <p>Client capabilities and features</p>
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
                <Label htmlFor="client-details" className="text-gray-700 dark:text-gray-300">
                  Additional Configuration
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Additional client configuration, requirements, or constraints</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Textarea
                name="client-details"
                id="client-details"
                rows={6}
                placeholder={`Example:
- Client-side requirements
- Network constraints
- Security requirements
- Performance targets`}
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
              Client Configuration
            </Label>
            <Textarea
              id="free-form"
              rows={20}
              placeholder={`Describe your client configuration here. Example:

Client Type: Web Client
Location: Global
Concurrent Users: 1,000

Features:
- Error Handling
- Request Retries
- Request Timeout
- Response Caching
- Service Workers
- Progressive Loading
- Offline Support
- State Management

Additional Requirements:
- Client-side requirements
- Network constraints
- Security requirements
- Performance targets`}
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
