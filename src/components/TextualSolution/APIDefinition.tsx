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
import { useCallback, useState } from "react";
import { type API, useWhiteboard } from "../ReactflowCustomNodes/APIsNode";
import { WithMarkdownDetails } from "../SystemComponents/Wrappers/WithMarkdownDetails";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { Small } from "../ui/typography";
import { Hints } from "./RequirementsDefinition";

export const APIDefinition = () => {
  const { stage } = useChallengeManager();
  const { apis, setApis } = useWhiteboard();

  const handleApiChange = useCallback((newApis: API[]) => {
    setApis(newApis);
  }, [setApis]);

  return (
    <Dialog>
      <DialogTrigger className="mt-1 flex w-full items-center rounded-md border border-gray-400 bg-gray-50 p-1 px-2 text-sm font-medium text-gray-800 transition-all hover:border-gray-500 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-gray-500 dark:hover:bg-gray-700">
        <>
          <CableIcon size={15} className="mr-2" />
          System API
        </>
      </DialogTrigger>
      <DialogContent className="h-[90vh] max-w-4xl overflow-scroll bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">
            System API definition
          </DialogTitle>
          <DialogDescription className="text-gray-700 dark:text-gray-300">
            <Separator className="mb-4 mt-2 bg-gray-300 dark:bg-gray-600" />

            <ListAndMultiDetails
              apis={apis}
              onChangeApi={handleApiChange}
              onDeleteApi={(index) => {
                const newApis = apis.filter((_, i) => i !== index);
                setApis(newApis);
              }}
              onAddApi={() =>
                setApis([
                  ...apis,
                  { name: "new api", definition: "", flow: "" },
                ])
              }
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
                  className="pl-0 pt-0 text-gray-600 opacity-50 transition-all hover:opacity-100 dark:text-gray-300"
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

export const ListAndMultiDetails = ({
  apis,
  onChangeApi,
  onDeleteApi,
  onAddApi,
  apiPlaceholder,
  flowPlaceholder,
  textareaRowsCount = 25,
}: {
  apis: API[];
  onChangeApi: (items: API[]) => void;
  onDeleteApi: (index: number) => void;
  onAddApi: () => void;
  apiPlaceholder?: string;
  flowPlaceholder?: string;
  textareaRowsCount?: number;
}) => {
  const [selectedKeyIndex, setSelectedKeyIndex] = useState<number>(0);

  const handleInputChange = useCallback((index: number, field: keyof API, value: string) => {
    const newApis = apis.map((api, i) =>
      i === index ? { ...api, [field]: value } : api
    );
    onChangeApi(newApis);
  }, [apis, onChangeApi]);

  return (
    <div className="flex w-full flex-row">
      <div className="mr-2 flex w-36 flex-col rounded-sm border border-gray-300 dark:border-gray-600">
        {apis.map(({ name: key }, index) => (
          <div
            className={cn(
              "group relative flex border-b border-gray-300 transition-all hover:cursor-pointer hover:bg-gray-200 dark:border-gray-600 dark:hover:bg-gray-700",
              { [`bg-gray-200 dark:bg-gray-700`]: selectedKeyIndex === index },
            )}
            onClick={() => {
              setSelectedKeyIndex(index);
            }}
            key={key + index}
          >
            <Small className="mr-2 overflow-hidden p-2 text-gray-700 dark:text-gray-300">
              {key}
            </Small>
            <span className="absolute right-2 top-2 rounded-full bg-gray-300 opacity-0 hover:cursor-pointer group-hover:opacity-100 dark:bg-gray-600">
              <X
                size={16}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteApi(index);
                }}
                className="text-gray-700 dark:text-gray-300"
              />
            </span>
          </div>
        ))}
        <Button
          size="xs"
          variant="ghost"
          onClick={onAddApi}
          className="text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <PlusIcon size="16" />
        </Button>
      </div>
      <div className="flex w-full flex-col">
        <Input
          type="text"
          className="mb-2 h-8 border-gray-300 bg-gray-100 text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
          value={apis[selectedKeyIndex]?.name ?? ""}
          onChange={(e) => handleInputChange(selectedKeyIndex, "name", e.target.value)}
        />
        <Tabs defaultValue="api-definition" className="w-full">
          <TabsList className="w-full bg-gray-200 dark:bg-gray-700">
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
              value={apis[selectedKeyIndex]?.definition ?? ""}
              onChange={(e) => handleInputChange(selectedKeyIndex, "definition", e.target.value)}
              placeholder={apiPlaceholder}
              className="text-md border-gray-300 bg-gray-100 text-gray-900 focus:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-gray-600"
            />
          </TabsContent>
          <TabsContent value="api-flow">
            <Textarea
              rows={textareaRowsCount}
              value={apis[selectedKeyIndex]?.flow ?? ""}
              onChange={(e) => handleInputChange(selectedKeyIndex, "flow", e.target.value)}
              placeholder={flowPlaceholder}
              className="text-md border-gray-300 bg-gray-100 text-gray-900 focus:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-gray-600"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
