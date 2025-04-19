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
      "Toggle between detailed configuration and free-form text input. Free-form text allows you to describe your message queue configuration in a more natural way.",
    learnMoreUrl: "https://docs.example.com/mq-configuration",
  },
  "Queue Type": {
    name: "Queue Type",
    description:
      "The type of message queue to use. Different types provide different delivery guarantees and features.",
    learnMoreUrl: "https://docs.example.com/mq-types",
  },
  "Delivery Guarantee": {
    name: "Delivery Guarantee",
    description:
      "The level of guarantee for message delivery. Choose based on your reliability requirements.",
    learnMoreUrl: "https://docs.example.com/mq-delivery",
  },
  "Max Message Size": {
    name: "Max Message Size",
    description: "Maximum size allowed for individual messages in the queue.",
    learnMoreUrl: "https://docs.example.com/mq-limits#size",
  },
  Throughput: {
    name: "Throughput",
    description: "Number of messages that can be processed per second.",
    learnMoreUrl: "https://docs.example.com/mq-throughput",
  },
  Retention: {
    name: "Retention",
    description:
      "How long messages are kept in the queue before being automatically deleted.",
    learnMoreUrl: "https://docs.example.com/mq-retention",
  },
  Features: {
    name: "Features",
    description:
      "Additional capabilities and features that can be enabled for this message queue. These may include persistence, routing, filtering, and more.",
    learnMoreUrl: "https://docs.example.com/message-queue/features",
  },
  "Additional Configuration": {
    name: "Additional Configuration",
    description:
      "Additional message queue configuration, requirements, or constraints specific to your use case.",
    learnMoreUrl: "https://docs.example.com/message-queue/additional-config",
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

export const MessageQueue = ({
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
      {/* <MessageQueueSettings name={name} nodeSettingsRef={nodeSettingsRef} /> */}
    </div>
  );
};

const MessageQueueSettings = ({
  name: id,
  nodeSettingsRef,
}: {
  name: string;
  nodeSettingsRef?: NodeSettingsRefObject;
}) => {
  const { useSystemComponentConfigSlice } = useSystemDesigner();
  const [isFreeText, setIsFreeText] = useState<boolean>(true);

  const [queueType, setQueueType] = useSystemComponentConfigSlice<string>(
    id,
    "queue_type",
    "standard",
  );

  const [deliveryType, setDeliveryType] = useSystemComponentConfigSlice<string>(
    id,
    "delivery_type",
    "at-least-once",
  );

  const [capacity, setCapacity] = useSystemComponentConfigSlice<{
    messageSize: number;
    throughput: number;
    retention: number;
  }>(id, "capacity", {
    messageSize: 256,
    throughput: 1000,
    retention: 7,
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
                  htmlFor="queue-type"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Queue Type
                </Label>
                {configInfoMap["Queue Type"] && (
                  <InfoPopup feature={configInfoMap["Queue Type"]} />
                )}
              </div>
              <Select value={queueType} onValueChange={setQueueType}>
                <SelectTrigger
                  className={cn(
                    "w-full border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800",
                    "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                  )}
                >
                  <SelectValue placeholder="Select queue type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Queue</SelectItem>
                  <SelectItem value="fifo">FIFO Queue</SelectItem>
                  <SelectItem value="priority">Priority Queue</SelectItem>
                  <SelectItem value="topic">Topic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="delivery-type"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Delivery Guarantee
                </Label>
                {configInfoMap["Delivery Guarantee"] && (
                  <InfoPopup feature={configInfoMap["Delivery Guarantee"]} />
                )}
              </div>
              <Select value={deliveryType} onValueChange={setDeliveryType}>
                <SelectTrigger
                  className={cn(
                    "w-full border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800",
                    "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                  )}
                >
                  <SelectValue placeholder="Select delivery type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="at-least-once">At Least Once</SelectItem>
                  <SelectItem value="exactly-once">Exactly Once</SelectItem>
                  <SelectItem value="at-most-once">At Most Once</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="message-size"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Max Message Size (KB)
                </Label>
                {configInfoMap["Max Message Size"] && (
                  <InfoPopup feature={configInfoMap["Max Message Size"]} />
                )}
              </div>
              <Input
                type="number"
                id="message-size"
                value={capacity.messageSize}
                onChange={(e) =>
                  setCapacity({
                    ...capacity,
                    messageSize: Number(e.target.value),
                  })
                }
                className={cn(
                  "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800",
                  "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                )}
                min={1}
                step={64}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="throughput"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Throughput (msg/s)
                </Label>
                {configInfoMap.Throughput && (
                  <InfoPopup feature={configInfoMap.Throughput} />
                )}
              </div>
              <Input
                type="number"
                id="throughput"
                value={capacity.throughput}
                onChange={(e) =>
                  setCapacity({
                    ...capacity,
                    throughput: Number(e.target.value),
                  })
                }
                className={cn(
                  "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800",
                  "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                )}
                min={100}
                step={100}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="retention"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Retention (days)
                </Label>
                {configInfoMap.Retention && (
                  <InfoPopup feature={configInfoMap.Retention} />
                )}
              </div>
              <Input
                type="number"
                id="retention"
                value={capacity.retention}
                onChange={(e) =>
                  setCapacity({
                    ...capacity,
                    retention: Number(e.target.value),
                  })
                }
                className={cn(
                  "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800",
                  "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                )}
                min={1}
                max={14}
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
                htmlFor="queue-details"
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
              name="queue-details"
              id="queue-details"
              rows={6}
              placeholder={`Example:
- Consumer group configuration
- Dead letter queue settings
- Message routing rules
- Retry policies
- Monitoring requirements
- Security settings`}
              className={cn(
                "text-md border-gray-300 dark:border-gray-700",
                "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
                "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                "bg-gray-50 dark:bg-gray-800"
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
            Message Queue Configuration
          </Label>
          <Textarea
            id="free-form"
            rows={20}
            placeholder={`Describe your message queue configuration here. Example:

Queue Type: Standard Queue
Delivery Guarantee: At Least Once

Capacity:
- Max Message Size: 256KB
- Throughput: 1000 msg/s
- Message Retention: 7 days

Features:
- Message Persistence
- Dead Letter Queue
- Message Filtering
- Message Routing
- Message Batching
- Message Compression

Additional Requirements:
- Consumer group configuration
- Dead letter queue settings
- Message routing rules
- Retry policies
- Monitoring requirements
- Security settings`}
            className={cn(
              "text-md border-gray-300 dark:border-gray-700",
              "text-gray-900 focus:ring-gray-400 dark:text-gray-100 dark:focus:ring-gray-600",
              "placeholder:text-gray-500 dark:placeholder:text-gray-400",
              "bg-gray-50 dark:bg-gray-800"
            )}
            value={freeFormText}
            onChange={(e) => setFreeFormText(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

export { MessageQueueSettings };
