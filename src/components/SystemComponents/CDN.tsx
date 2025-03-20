import { useSystemDesigner } from "@/lib/hooks/_useSystemDesigner";
import { cn } from "@/lib/utils";
import { type NodeSettingsRefObject } from "@/types/system";
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
      "Toggle between detailed configuration and free-form text input. Free-form text allows you to describe your CDN configuration in a more natural way.",
    learnMoreUrl: "https://docs.example.com/cdn-configuration",
  },
  "CDN Type": {
    name: "CDN Type",
    description:
      "The type of CDN service to use. Different types are optimized for different content delivery needs.",
    learnMoreUrl: "https://docs.example.com/cdn-types",
  },
  Storage: {
    name: "Storage",
    description:
      "Total storage capacity for cached content across all edge locations.",
    learnMoreUrl: "https://docs.example.com/cdn-storage",
  },
  Bandwidth: {
    name: "Bandwidth",
    description:
      "Total bandwidth capacity for content delivery across the CDN network.",
    learnMoreUrl: "https://docs.example.com/cdn-bandwidth",
  },
  "Edge Locations": {
    name: "Edge Locations",
    description:
      "Number of geographic locations where content is cached for faster delivery.",
    learnMoreUrl: "https://docs.example.com/cdn-edge-locations",
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

export const CDN = ({ name, Icon, nodeSettingsRef, subtitle }: ComponentNodeProps) => {
  return (
    <div className="group flex flex-col items-center text-gray-800 dark:text-gray-200">
      <div className="flex flex-col items-center gap-1">
        {Icon && (
          <Icon size={20} className="text-gray-700 dark:text-gray-300" />
        )}
        <Small>{name}</Small>
        {subtitle && <Muted>{subtitle}</Muted>}
      </div>
      <CDNSettings name={name} nodeSettingsRef={nodeSettingsRef} />
    </div>
  );
};

const CDNSettings = ({
  name: id,
  nodeSettingsRef,
}: {
  name: string;
  nodeSettingsRef: NodeSettingsRefObject;
}) => {
  const { useSystemComponentConfigSlice } = useSystemDesigner();
  const [isFreeText, setIsFreeText] = useState<boolean>(true);

  const [cdnType, setCdnType] = useSystemComponentConfigSlice<string>(
    id,
    "cdn_type",
    "public",
  );

  const [capacity, setCapacity] = useSystemComponentConfigSlice<{
    storage: number;
    bandwidth: number;
    edgeLocations: number;
  }>(id, "capacity", {
    storage: 1000,
    bandwidth: 1000,
    edgeLocations: 10,
  });

  const [details, setDetails] = useSystemComponentConfigSlice<string>(
    id,
    "details",
    "",
  );

  const [freeFormText, setFreeFormText] = useSystemComponentConfigSlice<string>(
    id,
    "free_form_text",
    "",
  );

  return (
    <WithSettings name={id} nodeSettingsRef={nodeSettingsRef}>
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
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="cdn-type"
                  className="text-gray-700 dark:text-gray-300"
                >
                  CDN Type
                </Label>
                {configInfoMap["CDN Type"] && (
                  <InfoPopup feature={configInfoMap["CDN Type"]} />
                )}
              </div>
              <Select value={cdnType} onValueChange={setCdnType}>
                <SelectTrigger
                  className={cn(
                    "w-full border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800",
                    "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                  )}
                >
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
                  <Label
                    htmlFor="storage"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Storage (TB)
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
                  min={100}
                  step={100}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="bandwidth"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Bandwidth (Gbps)
                  </Label>
                  {configInfoMap.Bandwidth && (
                    <InfoPopup feature={configInfoMap.Bandwidth} />
                  )}
                </div>
                <Input
                  type="number"
                  id="bandwidth"
                  value={capacity.bandwidth}
                  onChange={(e) =>
                    setCapacity({
                      ...capacity,
                      bandwidth: Number(e.target.value),
                    })
                  }
                  className={cn(
                    "border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800",
                    "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                  )}
                  min={100}
                  step={100}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="edge-locations"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Edge Locations
                  </Label>
                  {configInfoMap["Edge Locations"] && (
                    <InfoPopup feature={configInfoMap["Edge Locations"]} />
                  )}
                </div>
                <Input
                  type="number"
                  id="edge-locations"
                  value={capacity.edgeLocations}
                  onChange={(e) =>
                    setCapacity({
                      ...capacity,
                      edgeLocations: Number(e.target.value),
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
                  htmlFor="cdn-details"
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
