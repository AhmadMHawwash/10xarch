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

  return (
    <WithSettings name={id}>
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
                <SelectItem value="web">Web Browser</SelectItem>
                <SelectItem value="mobile">Mobile App</SelectItem>
                <SelectItem value="desktop">Desktop App</SelectItem>
                <SelectItem value="api">API Client</SelectItem>
              </SelectContent>
            </Select>
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
                    <p>Expected number of concurrent users</p>
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
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="location" className="text-gray-700 dark:text-gray-300">
              Geographic Distribution
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
              <SelectValue placeholder="Select location distribution" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">Global</SelectItem>
              <SelectItem value="regional">Regional</SelectItem>
              <SelectItem value="single">Single Location</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="client-details" className="text-gray-700 dark:text-gray-300">
              Additional Requirements
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Specify any additional client requirements, constraints, or behaviors</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Textarea
            name="client-details"
            id="client-details"
            rows={6}
            placeholder="Example: 
- Client needs offline support
- Requires real-time updates
- Has specific security requirements
- Network constraints"
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
