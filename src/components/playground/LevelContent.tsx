"use client";

import { PanelChat } from "@/components/ai-chat/PanelChat";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { H5, List, Muted, P } from "@/components/ui/typography";
import { useChallengeManager } from "@/lib/hooks/useChallengeManager";
import { useSystemDesigner } from "@/lib/hooks/_useSystemDesigner";
import { ComponentSettings } from "@/components/playground/ComponentSettings";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Database,
  ExternalLink,
  FileJson,
  FileText,
  Gauge,
  Globe,
  HelpCircle,
  InfoIcon,
  LayoutPanelTop,
  Link2,
  MessageSquareHeart,
  Server,
} from "lucide-react";
import { useParams } from "next/navigation";
import { type ReactNode } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { EdgeSettings } from "@/components/playground/EdgeSettings";
import { Onboarding } from "../Onboarding";

// Custom collapsible component that can handle React elements
interface CollapsibleSectionProps {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  trigger: React.ReactNode;
  content: React.ReactNode;
  className?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  Icon,
  trigger,
  content,
  className,
}) => {
  return (
    <Dialog>
      <DialogTrigger>
        <span className={className}>{trigger}</span>
      </DialogTrigger>
      <DialogContent className="min-h-95 w-[70vw] max-w-5xl border bg-gray-200 dark:border-gray-700 dark:bg-gray-800">
        <DialogHeader className="relative">
          <span className="absolute -left-[104px] -top-0 rounded-md bg-gray-200 p-4 dark:bg-gray-700">
            <Icon className="stroke-gray-600 text-gray-300 dark:stroke-gray-100 dark:text-gray-600" />
          </span>
          <div className="h-[90vh] overflow-scroll px-8 text-gray-200">
            {content}
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

interface SectionProps {
  title: string;
  content: ReactNode;
}

// Enhanced Section component for Challenge Context
const EnhancedSection: React.FC<SectionProps> = ({ title, content }) => (
  <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-5 shadow-lg dark:border-blue-300 dark:bg-blue-900/30">
    <Muted className="mb-2 text-lg font-semibold text-blue-700 dark:text-blue-300">
      {title}
    </Muted>
    <div className="mt-0 text-gray-800 dark:text-gray-100">
      {typeof content === "string" ? (
        <P className="!mt-0">{content}</P>
      ) : (
        content
      )}
    </div>
  </div>
);

// Regular Section component for other sections
const Section: React.FC<SectionProps> = ({ title, content }) => (
  <div className="rounded-lg bg-gray-50 p-4 shadow-md dark:bg-gray-800/50">
    <Muted className="mb-2 text-gray-600 dark:text-gray-400">{title}</Muted>
    <div className="mt-0 text-gray-700 dark:text-gray-300">
      {typeof content === "string" ? (
        <P className="!mt-0">{content}</P>
      ) : (
        content
      )}
    </div>
  </div>
);

// Enhanced Key System Design Component with Accordions
const EnhancedKeySystemDesign = () => (
  <div className="p-6 text-gray-700 dark:text-gray-300">
    <div className="mb-6">
      <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
        Key System Design Components
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        A comprehensive system design should address these critical areas:
      </p>
    </div>

    <Accordion type="multiple" className="space-y-3">
      {/* Requirements Analysis */}
      <AccordionItem
        value="requirements"
        className="overflow-hidden rounded-lg border border-indigo-200 shadow-sm dark:border-indigo-900"
      >
        <AccordionTrigger className="flex items-center px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
          <div className="flex flex-1 items-center">
            <FileJson className="mr-2 h-5 w-5 text-indigo-500" />
            <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Requirements Analysis
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="border-t border-gray-100 bg-white px-5 py-3 dark:border-gray-700 dark:bg-gray-800">
          <ul className="list-disc space-y-2 pl-8">
            <li>Core functionality definition</li>
            <li>System constraints & limitations</li>
            <li>Scalability requirements</li>
            <li>Security & compliance needs</li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      {/* API Design */}
      <AccordionItem
        value="api"
        className="overflow-hidden rounded-lg border border-green-200 shadow-sm dark:border-green-900"
      >
        <AccordionTrigger className="flex items-center px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
          <div className="flex flex-1 items-center">
            <Server className="mr-2 h-5 w-5 text-green-500" />
            <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
              API Design
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="border-t border-gray-100 bg-white px-5 py-3 dark:border-gray-700 dark:bg-gray-800">
          <ul className="list-disc space-y-2 pl-8">
            <li>Endpoints & interface definitions</li>
            <li>Request/response formats</li>
            <li>Error handling patterns</li>
            <li>Authentication & authorization</li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      {/* System Calculations */}
      <AccordionItem
        value="calculations"
        className="overflow-hidden rounded-lg border border-amber-200 shadow-sm dark:border-amber-900"
      >
        <AccordionTrigger className="flex items-center px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
          <div className="flex flex-1 items-center">
            <Gauge className="mr-2 h-5 w-5 text-amber-500" />
            <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
              System Calculations
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="border-t border-gray-100 bg-white px-5 py-3 dark:border-gray-700 dark:bg-gray-800">
          <ul className="list-disc space-y-2 pl-8">
            <li>Traffic patterns & load estimates</li>
            <li>Resource requirements (CPU, memory)</li>
            <li>Performance metrics & SLAs</li>
            <li>Throughput & latency considerations</li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      {/* Architecture Overview */}
      <AccordionItem
        value="architecture"
        className="overflow-hidden rounded-lg border border-blue-200 shadow-sm dark:border-blue-900"
      >
        <AccordionTrigger className="flex items-center px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
          <div className="flex flex-1 items-center">
            <LayoutPanelTop className="mr-2 h-5 w-5 text-blue-500" />
            <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Architecture Overview
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="border-t border-gray-100 bg-white px-5 py-3 dark:border-gray-700 dark:bg-gray-800">
          <ul className="list-disc space-y-2 pl-8">
            <li>Component interactions & dependencies</li>
            <li>System boundaries & interfaces</li>
            <li>Scalability patterns (horizontal/vertical)</li>
            <li>Fault tolerance & redundancy</li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      {/* Data Layer */}
      <AccordionItem
        value="data"
        className="overflow-hidden rounded-lg border border-purple-200 shadow-sm dark:border-purple-900"
      >
        <AccordionTrigger className="flex items-center px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
          <div className="flex flex-1 items-center">
            <Database className="mr-2 h-5 w-5 text-purple-500" />
            <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Data Layer
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="border-t border-gray-100 bg-white px-5 py-3 dark:border-gray-700 dark:bg-gray-800">
          <div className="space-y-4">
            <ul className="list-disc space-y-2 pl-8">
              <li>Schema design & data modeling</li>
              <li>Storage solution selection</li>
              <li>Data access patterns</li>
              <li>Caching strategies</li>
              <li>Data consistency & integrity</li>
              <li>Backup & recovery plans</li>
            </ul>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
);

// Enhanced Learning Resources Component with Accordions
interface EnhancedLearningResourcesProps {
  documentation: Array<{
    title: string;
    url: string;
    description: string;
  }>;
  realWorldCases: Array<{
    name: string;
    url: string;
    description: string;
  }>;
  bestPractices: Array<{
    title: string;
    description: string;
    example?: string;
  }>;
}

const EnhancedLearningResources: React.FC<EnhancedLearningResourcesProps> = ({
  documentation,
  realWorldCases,
  bestPractices,
}) => (
  <div className="p-6 text-gray-700 dark:text-gray-300">
    <div className="mb-6">
      <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
        Learning Resources
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        Resources to help you master system design concepts and apply best
        practices.
      </p>
    </div>

    <Accordion type="multiple" className="space-y-3">
      {/* Documentation Section */}
      <AccordionItem
        value="documentation"
        className="overflow-hidden rounded-lg border border-blue-200 shadow-sm dark:border-blue-900"
      >
        <AccordionTrigger className="flex items-center px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
          <div className="flex flex-1 items-center">
            <FileText className="mr-2 h-5 w-5 text-blue-500" />
            <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Technical Documentation ({documentation.length})
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="border-t border-gray-100 bg-white px-5 py-3 dark:border-gray-700 dark:bg-gray-800">
          <div className="space-y-4">
            {documentation.map((doc, index) => (
              <div
                key={index}
                className="border-b border-gray-100 pb-3 last:border-0 last:pb-0 dark:border-gray-700"
              >
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  <ExternalLink className="h-4 w-4" />
                  {doc.title}
                </a>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {doc.description}
                </p>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Real World Examples Section */}
      <AccordionItem
        value="examples"
        className="overflow-hidden rounded-lg border border-green-200 shadow-sm dark:border-green-900"
      >
        <AccordionTrigger className="flex items-center px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
          <div className="flex flex-1 items-center">
            <Globe className="mr-2 h-5 w-5 text-green-500" />
            <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Real-World Examples ({realWorldCases.length})
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="border-t border-gray-100 bg-white px-5 py-3 dark:border-gray-700 dark:bg-gray-800">
          <div className="space-y-4">
            {realWorldCases.map((example, index) => (
              <div
                key={index}
                className="border-b border-gray-100 pb-3 last:border-0 last:pb-0 dark:border-gray-700"
              >
                <a
                  href={example.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-medium text-green-600 hover:underline dark:text-green-400"
                >
                  <Link2 className="h-4 w-4" />
                  {example.name}
                </a>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {example.description}
                </p>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Best Practices Section */}
      <AccordionItem
        value="practices"
        className="overflow-hidden rounded-lg border border-amber-200 shadow-sm dark:border-amber-900"
      >
        <AccordionTrigger className="flex items-center px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
          <div className="flex flex-1 items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-amber-500" />
            <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Best Practices ({bestPractices.length})
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="border-t border-gray-100 bg-white px-5 py-3 dark:border-gray-700 dark:bg-gray-800">
          <div className="space-y-4">
            {bestPractices.map((practice, index) => (
              <div
                key={index}
                className="border-b border-gray-100 pb-4 last:border-0 last:pb-0 dark:border-gray-700"
              >
                <h5 className="font-medium text-gray-900 dark:text-gray-100">
                  {practice.title}
                </h5>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {practice.description}
                </p>
                {practice.example && (
                  <div className="mt-2 rounded-md bg-gray-100 p-3 text-xs dark:bg-gray-700">
                    <code className="whitespace-pre-wrap text-gray-800 dark:text-gray-300">
                      {practice.example}
                    </code>
                  </div>
                )}
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
);

export const LevelContent = () => {
  const { stage, toNextStage, toPreviousStage, challenge, currentStageIndex } =
    useChallengeManager();
  const { selectedNode, selectedEdge, useSystemComponentConfigSlice } = useSystemDesigner();
  const params = useParams<{ id: string }>();

  const nodeId = selectedNode?.data.id ?? "";
  const [title, setTitle] = useSystemComponentConfigSlice<string>(
    nodeId,
    "title",
    selectedNode?.data.title ?? "",
  );

  const [subtitle, setSubtitle] = useSystemComponentConfigSlice<string>(
    nodeId,
    "subtitle",
    selectedNode?.data.subtitle ?? "",
  );

  const oldRequirements = challenge.stages
    .slice(0, currentStageIndex)
    .reduce<string[]>((acc, stage) => acc.concat(stage.requirements), []);

  // Check if the selected node is a whiteboard or if nothing is selected
  const isWhiteboardOrNoSelection =
    !selectedNode || selectedNode.type === "Whiteboard";

  return (
    <div
      id="challenge-content"
      className="flex h-full max-h-[100vh] flex-col justify-between bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    >
      <div className="overflow-y-auto p-4 pb-8 pt-0">
        <div className="min-w-[17vw]">
          <div className="sticky z-10 w-full bg-white pt-[17px] dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <H5 className="text-gray-900 dark:text-gray-100">
                {selectedEdge
                  ? "Connection Settings"
                  : isWhiteboardOrNoSelection
                  ? challenge.title
                  : `Configuring ${selectedNode.data.name}`}
              </H5>
              {isWhiteboardOrNoSelection && !selectedEdge && (
                <Badge
                  variant="outline"
                  className="stage-badge border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                >
                  Stage {currentStageIndex + 1} of {challenge.stages.length}
                </Badge>
              )}
            </div>
            <Separator className="mb-5 mt-4 bg-gray-300 dark:bg-gray-700" />
          </div>

          {selectedEdge ? (
            // Render edge settings when an edge is selected
            <div className="p-0">
              <EdgeSettings edge={selectedEdge} />
            </div>
          ) : isWhiteboardOrNoSelection ? (
            // Show the regular challenge content if whiteboard is selected or nothing is selected
            <div className="flex flex-col gap-6">
              {/* Main challenge context (remains at the top) */}
              <EnhancedSection
                title="Challenge Context"
                content={
                  <div className="challenge-description space-y-4">
                    <div className="space-y-2">
                      <P className="!mt-0 font-medium">{stage?.problem}</P>
                      <div className="border-l-2 border-blue-500 pl-4 dark:border-blue-400">
                        <P className="!mt-0 text-sm italic text-gray-600 dark:text-gray-400">
                          As the Technical Lead, you&apos;ve been tasked with
                          addressing this challenge. The CTO and CPO have
                          outlined the following requirements:
                        </P>
                        <List className="!ml-2">
                          {oldRequirements.map((requirement, index) => (
                            <P
                              key={index}
                              className="!mt-0 ml-4 list-item list-decimal text-gray-600 line-through opacity-50 dark:text-gray-400"
                            >
                              {requirement}
                            </P>
                          ))}
                          {stage?.requirements.map((requirement, index) => (
                            <P
                              key={index}
                              className="!mt-0 ml-4 list-item list-decimal font-medium text-gray-700 dark:text-gray-300"
                            >
                              {requirement}
                            </P>
                          ))}
                        </List>
                      </div>
                    </div>
                  </div>
                }
              />

              {/* Add a spacer */}
              <div className="my-4"></div>

              {/* Reference sections moved to the bottom */}
              <Section
                title="References & Resources"
                content={
                  <div className="references-section mt-2 space-y-4">
                    {/* Resources section - collapsible */}
                    {stage?.resources && (
                      <CollapsibleSection
                        Icon={BookOpen}
                        trigger={
                          <div className="flex cursor-pointer items-center gap-2 rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
                            <BookOpen size="18" />
                            <span className="font-medium">
                              Learning Resources
                            </span>
                          </div>
                        }
                        content={
                          <EnhancedLearningResources
                            documentation={stage.resources.documentation}
                            realWorldCases={stage.resources.realWorldCases}
                            bestPractices={stage.resources.bestPractices}
                          />
                        }
                      />
                    )}

                    {/* Key System Design Components - collapsible with better content */}
                    <CollapsibleSection
                      Icon={InfoIcon}
                      trigger={
                        <div className="flex cursor-pointer items-center gap-2 rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
                          <InfoIcon size="18" />
                          <span className="font-medium">
                            Key System Design Components
                          </span>
                        </div>
                      }
                      content={<EnhancedKeySystemDesign />}
                    />
                  </div>
                }
              />
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {nodeId !== "Custom Component" && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter component title"
                  />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Enter a subtitle"
                />
              </div>
              <ComponentSettings node={selectedNode} className="w-full" />
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="stage-progress border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
          <StageProgress
            currentStage={currentStageIndex}
            totalStages={challenge.stages.length}
            onPrevious={toPreviousStage}
            onNext={toNextStage}
          />
        </div>
        <div className="navigation-controls border-t border-gray-200 bg-white px-4 py-2 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://tenxarch.userjot.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      aria-label="Give Feedback"
                    >
                      <MessageSquareHeart className="h-5 w-5" />
                      <span className="sr-only">Give Feedback</span>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="border-0 bg-gray-900/75 text-white backdrop-blur-sm"
                  >
                    Give Feedback
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Add the help button here */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Onboarding
                        isFirstVisit={true}
                        className="inline-block"
                        buttonClassName="flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        icon={HelpCircle}
                      /> 
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="border-0 bg-gray-900/75 text-white backdrop-blur-sm"
                  >
                    Start Tour
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

            </div>
          </div>
        </div>
      </div>

      <div className="ai-chat-container fixed bottom-4 right-4 z-50">
        <PanelChat
          isPlayground={true}
          playgroundId={params.id}
          playgroundTitle={challenge.title}
        />
      </div>
    </div>
  );
};

interface StageProgressProps {
  currentStage: number;
  totalStages: number;
  onPrevious: () => void;
  onNext: () => void;
}

const StageProgress: React.FC<StageProgressProps> = ({
  currentStage,
  totalStages,
  onPrevious,
  onNext,
}) => (
  <div className="stage-navigation flex items-center justify-between gap-4">
    <Button
      disabled={currentStage === 0}
      size="sm"
      variant="ghost"
      onClick={onPrevious}
      className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
    >
      <ArrowLeft className="mr-2 h-4 w-4" /> Previous
    </Button>
    <div className="relative flex-grow">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="w-full">
            <Progress
              value={((currentStage + 1) / totalStages) * 100}
              className="h-2 w-full bg-gray-200 dark:bg-gray-700"
            />
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="bg-white text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
          >
            <p>
              Stage {currentStage + 1} of {totalStages}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    <Button
      disabled={currentStage === totalStages - 1}
      size="sm"
      variant="ghost"
      onClick={onNext}
      className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
    >
      Next <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  </div>
);
