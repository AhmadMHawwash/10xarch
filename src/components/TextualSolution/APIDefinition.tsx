import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLevelManager } from "@/lib/hooks/useLevelManager";
import { CableIcon, InfoIcon } from "lucide-react";
import { WithMarkdownDetails } from "../SystemComponents/Wrappers/WithMarkdownDetails";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";

export const APIDefinition = ({ name: id }: { name: string }) => {
  const { useSystemComponentConfigSlice } = useLevelManager();

  const [apiDef, setApiDef] = useSystemComponentConfigSlice<string>(
    id,
    "api definition",
  );
  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <Button variant="outline" size="xs" className="mt-1 w-full">
          <CableIcon size={15} className="mr-1" />
          System API
        </Button>
      </DialogTrigger>
      <DialogContent className="!h-[95vh] w-[70vw] max-w-5xl">
        <DialogHeader>
          <DialogTitle>System API definition</DialogTitle>
          <DialogDescription>
            <Separator className="mb-4 mt-2" />
            <Textarea
              rows={25}
              value={apiDef}
              onChange={(e) => setApiDef(e.target.value)}
              placeholder={`Example:
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
              className="text-md !text-black"
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
