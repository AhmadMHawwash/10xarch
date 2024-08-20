import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useChallengeManager } from "@/lib/hooks/useChallengeManager";
import { cn } from "@/lib/utils";
import { CableIcon, InfoIcon, PlusIcon, X } from "lucide-react";
import { useState } from "react";
import { WithMarkdownDetails } from "../SystemComponents/Wrappers/WithMarkdownDetails";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { H6, Small } from "../ui/typography";
import { Hints } from "./RequirementsDefinition";
import { useWhiteboard } from "../ReactflowCustomNodes/APIsNode";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export const APIDefinition = () => {
  const { stage } = useChallengeManager();
  const { apis, setApis } = useWhiteboard();

  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <Button variant="outline" size="xs" className="mt-1 w-full">
          <CableIcon size={15} className="mr-1" />
          System API
        </Button>
      </DialogTrigger>
      <DialogContent className="!h-[95vh] w-[70vw] max-w-5xl overflow-scroll">
        <DialogHeader>
          <DialogTitle>System API definition</DialogTitle>
          <DialogDescription className="!text-black">
            <Separator className="mb-4 mt-2" />

            <ListAndMultiDetails
              apis={apis}
              onChangeApi={setApis}
              onDeleteApi={(index) => {
                const newApis = apis.filter((_, i) => i !== index);
                setApis(newApis);
              }}
              onAddApi={() => setApis([...apis, ["new api", "", ""]])}
              apiPlaceholder={`Example: URL Shortening Service
1.  Create Short URL

Endpoint: POST /shorten
Description: This API generates a short URL for a given long URL.
Parameters:
- original_url (string): The original long URL that needs to be shortened.
Response:
- short_url (string): The generated short URL.

Example Request:
POST /shorten {
"original_url": "http://example.com/some/very/long/url",
}
Example Response:
JSON: {
"short_url": "http://short.url/xyz"
}

2.  ...
    `}
              flowPlaceholder={`
How the API flows in the system...
Example: URL Shortening Service
1. The client sends a POST request to /shorten with the original_url to the server.
2. The server generates a short_url for the original_url and saves it to the database.
3. The server responds with the generated short_url to the client
    `}
            />

            <WithMarkdownDetails
              Icon={InfoIcon}
              trigger={
                <Button
                  variant="link"
                  className="pl-0 pt-0 opacity-50 transition-all hover:opacity-100"
                >
                  <InfoIcon className="mr-1" size={16} />
                  How clients interact with the system
                </Button>
              }
              content={apiDefinition}
            />
            <Hints hints={stage?.hintsPerArea.systemAPI} />
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

const apiDefinition = `# System API Definition

## Introduction
In system design, defining the APIs (Application Programming Interfaces) is a crucial step. APIs act as the contract between different parts of the system and external clients. They specify how different components of the system communicate with each other and with external systems or users. A well-defined API helps in ensuring that all interactions are clear, consistent, and maintainable.

## Why API Definition is Important
1. **Clear Communication**: APIs define how different parts of the system will interact. This ensures that all components can communicate effectively without ambiguity.
2. **Separation of Concerns**: By defining clear interfaces, APIs help in separating different concerns within the system. Each component can be developed, tested, and maintained independently.
3. **Scalability**: With well-defined APIs, different parts of the system can be scaled independently. For example, the front-end can scale separately from the back-end services.
4. **Interoperability**: APIs allow different systems and services to interact with each other. This is especially important in a microservices architecture or when integrating with third-party services.
5. **Documentation**: API definitions serve as documentation for developers, helping them understand how to use the system's functionality.

## Key Elements of API Definition
When defining an API, you should consider the following elements:

### 1. Endpoints
Endpoints are the URLs through which the API can be accessed. Each endpoint corresponds to a specific functionality or resource in the system.

### 2. Methods
HTTP methods such as GET, POST, PUT, DELETE, etc., define the type of operation that can be performed on the resource. For example, GET is used to retrieve data, while POST is used to create new data.

### 3. Parameters
Parameters are inputs that the API requires to perform its function. These can be passed in the URL path, query string, headers, or request body.

### 4. Responses
Responses define the output returned by the API after processing the request. This includes the status code, headers, and the body of the response, typically in JSON or XML format.

### Example: URL Shortening Service APIs
Let's define the APIs for a URL shortening service as an example.

### Create Short URL API
- **Endpoint**: \`POST /shorten\`
- **Description**: This API generates a short URL for a given long URL.
- **Parameters**:
  - \`original_url\` (string): The original long URL that needs to be shortened.
- **Response**:
  - \`short_url\` (string): The generated short URL.

**Example Request**:

\`\`\` json 
POST /shorten {
  "original_url": "http://example.com/some/very/long/url",
}
\`\`\`
`;

export const ListAndDetails = ({
  items,
  onChange,
  onDelete,
  onAdd,
  textareaPlaceholder,
  textareaRowsCount = 25,
}: {
  items: [string, string][];
  onChange: (items: [string, string][]) => void;
  onDelete: (index: number) => void;
  onAdd: () => void;
  textareaPlaceholder?: string;
  textareaRowsCount?: number;
}) => {
  const [selectedKeyIndex, setSelectedKeyIndex] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>(
    items[selectedKeyIndex]?.[0] ?? "",
  );
  const [textareaValue, setTextareaValue] = useState<string>(
    items[selectedKeyIndex]?.[1] ?? "",
  );

  return (
    <div className="flex w-full flex-row">
      <div className="mr-2 flex w-36 flex-col rounded-sm border">
        {items.map(([key, value], index) => (
          <div
            className={cn(
              "group relative flex border-b transition-all hover:cursor-pointer hover:bg-slate-200",
              { [`bg-slate-100`]: selectedKeyIndex === index },
            )}
            onClick={() => {
              setSelectedKeyIndex(index);
              setInputValue(key);
              setTextareaValue(value);
            }}
            key={key + index}
          >
            <Small className="mr-2 overflow-hidden p-2">{key}</Small>
            <span className="absolute right-2 top-2 rounded-full bg-slate-300 opacity-0 hover:cursor-pointer group-hover:opacity-100">
              <X
                size={16}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(index);
                  // const newApis = items.filter((_, i) => i !== index);
                  // setApis(newApis);
                }}
              />
            </span>
          </div>
        ))}
        <Button
          size="xs"
          variant="ghost"
          onClick={() => {
            onAdd();
            // setApis([...items, ["new api", ""]]);
          }}
        >
          <PlusIcon size="16" />
        </Button>
      </div>
      {!isNaN(selectedKeyIndex) ? (
        <div className="flex w-full flex-col">
          <Input
            type="text"
            className="mb-2 h-8"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
            onBlur={() => {
              const newApis = items.map(
                ([name, value], i) =>
                  (i === selectedKeyIndex
                    ? [inputValue, value]
                    : [name, value]) as [string, string],
              );
              onChange(newApis);
            }}
          />
          <Textarea
            rows={textareaRowsCount}
            value={textareaValue}
            onBlur={() => {
              const newApis = items.map(
                ([name, value], i) =>
                  (i === selectedKeyIndex
                    ? [name, textareaValue]
                    : [name, value]) as [string, string],
              );
              onChange(newApis);
            }}
            onChange={(e) => setTextareaValue(e.target.value)}
            placeholder={textareaPlaceholder}
            className="text-md"
          />
        </div>
      ) : (
        <H6 className="text-center">Select an API to view or add a new one</H6>
      )}
    </div>
  );
};

export const ListAndMultiDetails = ({
  apis,
  onChangeApi,
  onDeleteApi,
  onAddApi,
  apiPlaceholder,
  flowPlaceholder,
  textareaRowsCount = 25,
}: {
  apis: [string, string, string][];
  onChangeApi: (items: [string, string, string][]) => void;
  onDeleteApi: (index: number) => void;
  onAddApi: () => void;
  apiPlaceholder?: string;
  flowPlaceholder?: string;
  textareaRowsCount?: number;
}) => {
  const [selectedKeyIndex, setSelectedKeyIndex] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>(
    apis[selectedKeyIndex]?.[0] ?? "",
  );
  const [apiDefinition, setApiDefinition] = useState<string>(
    apis[selectedKeyIndex]?.[1] ?? "",
  );
  const [apiFlow, setApiFlow] = useState<string>(
    apis[selectedKeyIndex]?.[2] ?? "",
  );

  return (
    <div className="flex w-full flex-row">
      <div className="mr-2 flex w-36 flex-col rounded-sm border">
        {apis.map(([key, def, flow], index) => (
          <div
            className={cn(
              "group relative flex border-b transition-all hover:cursor-pointer hover:bg-slate-200",
              { [`bg-slate-100`]: selectedKeyIndex === index },
            )}
            onClick={() => {
              setSelectedKeyIndex(index);
              setInputValue(key);
              setApiDefinition(def);
              setApiFlow(flow);
            }}
            key={key + index}
          >
            <Small className="mr-2 overflow-hidden p-2">{key}</Small>
            <span className="absolute right-2 top-2 rounded-full bg-slate-300 opacity-0 hover:cursor-pointer group-hover:opacity-100">
              <X
                size={16}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteApi(index);
                  // const newApis = items.filter((_, i) => i !== index);
                  // setApis(newApis);
                }}
              />
            </span>
          </div>
        ))}
        <Button
          size="xs"
          variant="ghost"
          onClick={() => {
            onAddApi();
            // setApis([...items, ["new api", ""]]);
          }}
        >
          <PlusIcon size="16" />
        </Button>
      </div>
      <div className="flex w-full flex-col">
        <Input
          type="text"
          className="mb-2 h-8"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
          onBlur={() => {
            const newApis = apis.map<[string, string, string]>(
              ([name, oldDefinition, oldFlow], i) =>
                i === selectedKeyIndex
                  ? [inputValue, oldDefinition, oldFlow]
                  : [name, oldDefinition, oldFlow],
            );
            onChangeApi(newApis);
          }}
        />
        <Tabs defaultValue="api-definition" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="api-definition" className="w-full">
              Definition
            </TabsTrigger>
            <TabsTrigger value="api-flow" className="w-full">
              Request flow
            </TabsTrigger>
          </TabsList>
          <TabsContent value="api-definition">
            <Textarea
              rows={textareaRowsCount}
              value={apiDefinition}
              onBlur={() => {
                const newApis = apis.map<[string, string, string]>(
                  ([name, oldDefinition, oldFlow], i) =>
                    i === selectedKeyIndex
                      ? [name, apiDefinition, oldFlow]
                      : [name, oldDefinition, oldFlow],
                );
                onChangeApi(newApis);
              }}
              onChange={(e) => setApiDefinition(e.target.value)}
              placeholder={apiPlaceholder}
              className="text-md"
            />
          </TabsContent>
          <TabsContent value="api-flow">
            <Textarea
              rows={textareaRowsCount}
              value={apiFlow}
              onBlur={() => {
                const newFlows = apis.map<[string, string, string]>(
                  ([name, oldDefinition, oldFlow], i) =>
                    i === selectedKeyIndex
                      ? [name, oldDefinition, apiFlow]
                      : [name, oldDefinition, oldFlow],
                );
                onChangeApi(newFlows);
              }}
              onChange={(e) => setApiFlow(e.target.value)}
              placeholder={flowPlaceholder}
              className="text-md"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
