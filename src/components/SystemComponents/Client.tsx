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
  "Error Handling": {
    name: "Error Handling",
    description:
      "Implement robust error handling mechanisms to gracefully handle and recover from various types of errors, including network failures, API errors, and client-side exceptions.",
    learnMoreUrl:
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling",
  },
  "Request Retries": {
    name: "Request Retries",
    description:
      "Automatically retry failed network requests with configurable backoff strategies to improve reliability and handle temporary network issues.",
    learnMoreUrl:
      "https://developers.google.com/analytics/devguides/reporting/core/v4/errors#exponential_backoff",
  },
  "Request Timeout": {
    name: "Request Timeout",
    description:
      "Set appropriate timeout limits for network requests to prevent hanging operations and provide better user feedback.",
    learnMoreUrl:
      "https://developer.mozilla.org/en-US/docs/Web/API/AbortController",
  },
  "Response Caching": {
    name: "Response Caching",
    description:
      "Cache API responses locally to improve performance and enable offline functionality.",
    learnMoreUrl: "https://web.dev/cache-api-quick-guide/",
  },
  "Service Workers": {
    name: "Service Workers",
    description:
      "Use Service Workers to enable offline functionality, background sync, and push notifications in web applications.",
    learnMoreUrl:
      "https://developers.google.com/web/fundamentals/primers/service-workers",
  },
  "Progressive Loading": {
    name: "Progressive Loading",
    description:
      "Implement progressive loading techniques to improve perceived performance and user experience.",
    learnMoreUrl: "https://web.dev/progressive-loading/",
  },
  "Offline Support": {
    name: "Offline Support",
    description:
      "Enable the application to function without an internet connection using service workers and local storage.",
    learnMoreUrl: "https://web.dev/offline-cookbook/",
  },
  "State Management": {
    name: "State Management",
    description:
      "Implement robust state management to handle complex application state and data flow.",
    learnMoreUrl: "https://redux.js.org/introduction/getting-started",
  },
};

const configInfoMap: Record<string, FeatureInfo> = {
  "Client Type": {
    name: "Client Type",
    description:
      "The type of client application that will interact with your system. Different client types have different capabilities, requirements, and considerations for implementation.",
    learnMoreUrl: "https://www.patterns.dev/posts/client-side-architecture",
  },
  "Client Location": {
    name: "Client Location",
    description:
      "Geographic distribution of your clients. This affects latency, data residency requirements, and CDN strategy. Global distribution requires more edge locations and careful consideration of regional requirements.",
    learnMoreUrl:
      "https://aws.amazon.com/blogs/architecture/what-to-consider-when-selecting-a-region-for-your-workloads/",
  },
  "Concurrent Users": {
    name: "Concurrent Users",
    description:
      "The number of users simultaneously accessing your application. This metric is crucial for capacity planning, scaling decisions, and performance requirements.",
    learnMoreUrl: "https://www.nginx.com/blog/capacity-planning/",
  },
  "Free-form Text Mode": {
    name: "Free-form Text Mode",
    description:
      "Toggle between detailed configuration and free-form text input",
    learnMoreUrl: "",
  },
  "Additional Configuration": {
    name: "Additional Configuration",
    description:
      "Additional client configuration, requirements, or constraints",
    learnMoreUrl: "",
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

export const Client = ({ name, Icon }: ComponentNodeProps) => {
  return (
    <div className="group flex flex-col items-center text-gray-800 dark:text-gray-200">
      <div className="flex items-center gap-1">
        {Icon && (
          <Icon size={20} className="text-gray-700 dark:text-gray-300" />
        )}
        <Small>{name}</Small>
      </div>
      <ClientSettings name={name} />
    </div>
  );
};

const ClientSettings = ({ name: id }: { name: string }) => {
  const { useSystemComponentConfigSlice } = useSystemDesigner();
  const [isFreeText, setIsFreeText] = useState<boolean>(true);

  const [clientType, setClientType] = useSystemComponentConfigSlice<string>(
    id,
    "client_type",
    "web",
  );

  const [concurrentUsers, setConcurrentUsers] =
    useSystemComponentConfigSlice<number>(id, "concurrent_users", 1000);

  const [location, setLocation] = useSystemComponentConfigSlice<string>(
    id,
    "location",
    "global",
  );

  const [details, setDetails] = useSystemComponentConfigSlice<string>(
    id,
    "details",
    "",
  );

  const [features, setFeatures] = useSystemComponentConfigSlice<string[]>(
    id,
    "features",
    [],
  );

  const [freeFormText, setFreeFormText] = useSystemComponentConfigSlice<string>(
    id,
    "free_form_text",
    "",
  );

  const getAvailableFeatures = (type: string): string[] => {
    const commonFeatures = [
      "Error Handling",
      "Request Retries",
      "Request Timeout",
      "Response Caching",
    ];

    switch (type) {
      case "web":
        return [
          ...commonFeatures,
          "Service Workers",
          "Progressive Loading",
          "Offline Support",
          "State Management",
        ];
      case "mobile":
        return [
          ...commonFeatures,
          "Background Sync",
          "Push Notifications",
          "Data Persistence",
          "Network Detection",
        ];
      case "iot":
        return [
          ...commonFeatures,
          "Device Management",
          "Data Buffering",
          "Power Management",
          "Secure Boot",
        ];
      case "desktop":
        return [
          ...commonFeatures,
          "Auto Updates",
          "Native Integration",
          "Cross Platform",
          "Resource Management",
        ];
      default:
        return commonFeatures;
    }
  };

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
                  Note: Detailed configuration options are still a work in
                  progress. Options might get added or deleted.
                </Small>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="client-type"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Client Type
                  </Label>
                  {configInfoMap["Client Type"] && (
                    <InfoPopup feature={configInfoMap["Client Type"]} />
                  )}
                </div>
                <Select value={clientType} onValueChange={setClientType}>
                  <SelectTrigger
                    className={cn(
                      "w-full border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800",
                      "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                    )}
                  >
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
                  <Label
                    htmlFor="location"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Client Location
                  </Label>
                  {configInfoMap["Client Location"] && (
                    <InfoPopup feature={configInfoMap["Client Location"]} />
                  )}
                </div>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger
                    className={cn(
                      "w-full border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800",
                      "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                    )}
                  >
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
                <Label
                  htmlFor="concurrent-users"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Concurrent Users
                </Label>
                {configInfoMap["Concurrent Users"] && (
                  <InfoPopup feature={configInfoMap["Concurrent Users"]} />
                )}
              </div>
              <Input
                type="number"
                id="concurrent-users"
                value={concurrentUsers}
                onChange={(e) => setConcurrentUsers(Number(e.target.value))}
                className={cn(
                  "border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800",
                  "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                )}
                min={1}
              />
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
                  htmlFor="client-details"
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
                name="client-details"
                id="client-details"
                rows={6}
                placeholder={`Example:
- Client-side requirements
- Network constraints
- Security requirements
- Performance targets`}
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
