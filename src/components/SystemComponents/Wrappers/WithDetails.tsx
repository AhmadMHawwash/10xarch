import { MDContent } from "@/components/MDContent";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Large, List, P } from "@/components/ui/typography";
import { type KeyPoint } from "@/lib/levels/content/2-load-balancing";
import { cn } from "@/lib/utils";
import { InfoIcon } from "lucide-react";
import { Separator } from "../../ui/separator";

export const WithDetails = ({
  name,
  url,
  className,
  children,
}: {
  name: string;
  url: string;
  className: string;
  children?: React.ReactNode;
}) => {
  return (
    <Dialog>
      <DialogTrigger>
        <span
          className={cn(
            "absolute left-0 top-[-17px] rounded-full bg-gray-100",
            className,
          )}
        >
          <InfoIcon size={16} className="stroke-gray-500" />
        </span>
      </DialogTrigger>
      <DialogContent className="min-h-96 w-[90vw] max-w-4xl">
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
          <Separator className="mb-4 mt-2" />
          <div className="flex items-center hmax-[80vh]">
            <MDContent name={url} />
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

const Details = ({ name }: { name: string }) => {
  return (
    <div className="flex max-w-[1000px]">
      <Tabs defaultValue="account" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="what">What</TabsTrigger>
          <TabsTrigger value="why">Why</TabsTrigger>
          <TabsTrigger value="how">How</TabsTrigger>
          <TabsTrigger value="when">When</TabsTrigger>
        </TabsList>
        <TabsContent value="what">
          Make changes to your account here.
        </TabsContent>
        <TabsContent value="why">Change your password here.</TabsContent>
        <TabsContent value="how">Change your password here.</TabsContent>
        <TabsContent value="when">Change your password here.</TabsContent>
      </Tabs>
      {/* <div className="flex flex-col">
        <List className="ml-0 mt-1 w-fit list-none">
          {["What", "Why", "How", "When"].map((item) => (
            <li key={item}>
              <Small className="cursor-pointer rounded-md p-2 hover:bg-slate-100">
                {item}
              </Small>
            </li>
          ))}
        </List>
      </div> */}
    </div>
  );
};

const LoadbalancerDetails = () => {
  return (
    <div className="flex max-w-[1000px]">
      {/* <Tabs defaultValue="Overview" className="flex w-full flex-col">
        <TabsList className="flex">
          {keyPointsKeys.map((key) => (
            <TabsTrigger key={key} value={key}>
              {key}
            </TabsTrigger>
          ))}
        </TabsList>
        {loadbalancerInfo.keyPoints.map((item) => (
          <TabsContent key={item.key} value={item.key}>
            <Renderer data={item} key={item.key} />
          </TabsContent>
        ))} */}
      {/* <Large className="mt-6">Overview</Large>
          <P>
            Load balancers distribute incoming network traffic across multiple
            servers to ensure no single server becomes overwhelmed, improving
            the availability and reliability of your application.
            </P> 
        <TabsContent value="Purpose">
          <Large className="mt-6">Purpose</Large>
          <P>
            Distribute network traffic evenly across multiple servers to
            optimize resource use, maximize throughput, minimize response time,
            and avoid overloading any single server.
          </P>
        </TabsContent>
        <TabsContent value="Types">
          <List>
            {[
              {
                type: "Hardware Load Balancers",
                description:
                  "Physical devices that distribute network and application traffic across a number of servers.",
              },
              {
                type: "Software Load Balancers",
                description:
                  "Programs that perform load balancing using software, running on standard server hardware.",
              },
              {
                type: "Cloud Load Balancers",
                description:
                  "Load balancing services provided by cloud providers, such as AWS Elastic Load Balancing, Google Cloud Load Balancing, and Azure Load Balancer.",
              },
            ].map((item) => (
              <li key={item.type}>
                <Large className="mt-6">{item.type}</Large>
                <P>{item.description}</P>
              </li>
            ))}
          </List>
        </TabsContent>
        <TabsContent value="Benefits">
          {[
            "Improved application availability and reliability by rerouting traffic from failing servers to operational servers.",
            "Enhanced application security by protecting against distributed denial-of-service (DDoS) attacks.",
            "Scalability by distributing traffic among a pool of servers, allowing for the addition or removal of servers as needed.",
            "Optimized resource use by ensuring that no single server is overwhelmed with too much traffic.",
          ].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </TabsContent>
        <TabsContent value="Algorithms">
          <List>
            {[
              {
                algorithm: "Round Robin",
                description:
                  "Distributes client requests in a circular order across the server pool.",
              },
              {
                algorithm: "Least Connections",
                description:
                  "Directs traffic to the server with the fewest active connections at the time of the request.",
              },
              {
                algorithm: "IP Hash",
                description:
                  "Routes traffic based on the IP address of the client, ensuring that requests from the same client are always directed to the same server.",
              },
              {
                algorithm: "Weighted Round Robin",
                description:
                  "Assigns a weight to each server based on their capacity and directs more traffic to higher-capacity servers.",
              },
            ].map((item) => (
              <li key={item.algorithm}>
                <Large className="mt-6">{item.algorithm}</Large>
                <P>{item.description}</P>
              </li>
            ))}
          </List>
        </TabsContent>
        <TabsContent value="Use Cases">
          <List>
            {[
              "Web Servers: Distributing HTTP requests across multiple web servers.",
              "Database Servers: Distributing queries across a database cluster.",
              "Application Servers: Balancing the load of application processing tasks.",
            ].map((item) => (
              <li key={item}>
                <Large className="mt-6">{item}</Large>
              </li>
            ))}
          </List>
        </TabsContent>*/}
      {/* </Tabs> */}
    </div>
  );
};

const Renderer = ({ data }: { data: KeyPoint }) => {
  return data.type === "list" ? (
    <List>
      {data.value.map((item) => (
        <li key={item}>
          <Large className="mt-6">{item}</Large>
        </li>
      ))}
    </List>
  ) : data.type === "list-of-key-description" ? (
    <List>
      {data.value.map((item) => (
        <li key={item.key}>
          <Large className="mt-6">{item.description}</Large>
          <P>{item.description}</P>
        </li>
      ))}
    </List>
  ) : data.type === "text" ? (
    <P>{data.value}</P>
  ) : null;
};
