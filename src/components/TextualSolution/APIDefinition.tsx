import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useChallengeManager } from "@/lib/hooks/useChallengeManager";
import { InfoIcon } from "lucide-react";
import { WithMarkdownDetails } from "../SystemComponents/Wrappers/WithMarkdownDetails";
import { Separator } from "../ui/separator";
import { Hints } from "./RequirementsDefinition";

export const APIDefinition = () => {
  const { stage } = useChallengeManager();

  return (
    <Dialog>
      <DialogTrigger className="mt-1 flex w-full items-center rounded-md border border-gray-400 bg-gray-50 p-1 px-2 text-sm font-medium text-gray-800 transition-all hover:border-gray-500 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-gray-500 dark:hover:bg-gray-700">
        <>
          <InfoIcon size={15} className="mr-2" />
          System API Documentation
        </>
      </DialogTrigger>
      <DialogContent className="h-[90vh] max-w-4xl overflow-scroll bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">
            System API Documentation
          </DialogTitle>
          <DialogDescription className="text-gray-700 dark:text-gray-300">
            <Separator className="mb-4 mt-2 bg-gray-300 dark:bg-gray-600" />

            <WithMarkdownDetails
              Icon={InfoIcon}
              trigger={
                <div className="text-gray-600 dark:text-gray-300">
                  <InfoIcon className="mr-1 inline-block" size={16} />
                  How to define APIs in your system
                </div>
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

const apiDefinition = `# System API Documentation

## How to Define APIs in Your System

In this system design tool, APIs are defined directly on the connections (edges) between components. This approach makes it clear which components are communicating and what APIs they use to do so.

### Defining an API

1. **Create a Connection**: Connect two components by dragging from one component's handle to another's.

2. **Name the API**: 
   - Double-click on the connection label
   - Type a descriptive name for the API
   - Press Enter or click away to save

3. **Define API Details**:
   - Hover over the connection label to reveal the settings (⚙️) icon
   - Click the icon to open the API definition dialog
   - Fill in the API details including:
     - Endpoint
     - Description
     - Parameters
     - Response format
     - Example requests and responses

### API Flow Documentation

When designing APIs in a distributed system, it's crucial to understand and document how requests flow through different components. A good API flow documentation should include:

1. **Request Journey**:
   - Starting point (usually the client)
   - Each component the request passes through
   - Transformations or processing at each step
   - Final destination and response path

2. **Component Interactions**:
   - How components communicate
   - What data is passed between them
   - Any caching or optimization strategies

3. **Error Scenarios**:
   - What happens when components fail
   - Fallback mechanisms
   - Retry strategies

### Example API Flow

\`\`\`
API: Create User Account
Flow:
1. Client sends POST request to /api/users
2. Load Balancer receives request and routes to available API server
3. API Server:
   - Validates request payload
   - Checks if username/email already exists in cache
   - If not in cache, checks database
   - Hashes password
   - Generates user ID
4. Database:
   - Stores new user record
   - Returns success/failure
5. Cache:
   - Updates user cache with new record
6. API Server:
   - Formats response
   - Sends confirmation email via Message Queue
7. Message Queue:
   - Queues email sending task
   - Email service processes queue
8. Response returns to client via Load Balancer

Error Handling:
- If database is down: Return 503 Service Unavailable
- If cache fails: Log error, continue with database
- If email queue fails: Log error, return success (async operation)
\`\`\`

### Best Practices

1. **Clear Naming**: Give your APIs clear, descriptive names that indicate their purpose.

2. **Complete Documentation**: Include all necessary information in the API definition:
   - HTTP method (GET, POST, etc.)
   - Complete endpoint path
   - All required and optional parameters
   - Expected response format
   - Example usage

3. **RESTful Design**: Follow RESTful principles when designing your APIs:
   - Use appropriate HTTP methods
   - Use nouns for resources
   - Keep endpoints consistent
   - Use proper status codes

4. **Error Handling**: Document possible error responses and status codes.

### Example API Definition

\`\`\`
Endpoint: POST /api/users
Description: Creates a new user account.

Parameters:
- username (string, required): The desired username
- email (string, required): User's email address
- password (string, required): User's password

Response:
- id (string): Unique identifier for the created user
- username (string): The user's username
- email (string): The user's email
- created_at (string): ISO timestamp of account creation

Example Request:
POST /api/users
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure_password123"
}

Example Response:
{
  "id": "usr_123abc",
  "username": "john_doe",
  "email": "john@example.com",
  "created_at": "2024-03-21T10:30:00Z"
}

Error Responses:
- 400: Invalid parameters
- 409: Username already exists
- 500: Internal server error
\`\`\`
`;
