import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLevelManager } from "@/lib/hooks/useLevelManager";
import { InfoIcon, NotebookPen } from "lucide-react";
import { z } from "zod";
import { WithMarkdownDetails } from "../SystemComponents/Wrappers/WithMarkdownDetails";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";

const capacityEstimationDefinitionSchema = z.object({
  capacityEstimations: z.string(),
  constraints: z.string(),
});

export const CapacityEstimationDefinition = ({
  name: id,
}: {
  name: string;
}) => {
  const { useSystemComponentConfigSlice } = useLevelManager();

  const [capacity, setCapacity] = useSystemComponentConfigSlice<string>(
    id,
    "Capacity estimations",
  );
  // const [constraints, setConstraints] = useSystemComponentConfigSlice<string>(
  //   id,
  //   "Constraints",
  // );

  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <Button variant="outline" size="xs" className="mt-1 w-full">
          <NotebookPen size={15} className="mr-1" />
          Capacity Estimations
        </Button>
      </DialogTrigger>
      <DialogContent className="!h-[95vh] w-[70vw] max-w-5xl">
        <DialogHeader>
          <DialogTitle>Capacity estimation</DialogTitle>
          <DialogDescription>
            <Separator className="mb-4 mt-2" />
            {/* <Tabs defaultValue="capacityEstimations" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="capacityEstimations">
                    Capacity estimations
                  </TabsTrigger>
                  <TabsTrigger value="constraints">Constraints</TabsTrigger>
                </TabsList>
                <TabsContent value="capacityEstimations"> */}
            <Textarea
              rows={25}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder={`Example: URL Shortening Service
  1. Traffic Estimates
    // Assume we expect 500 million new URL shortenings per month with a 100:1 read/write ratio.

    - New URLs per second: 500 million divided by 1 Month of Seconds is approximately 193 new shortend URLs per second.
    - URL redirections/reads per second: 100 times 193 equals 19,300 requests per second.

  2. Storage Estimates
    // Assume each URL shortening request (including metadata) takes 500 bytes of storage.
    - Total storage for 5 years: 500 million * 12 months/year * 5 years * 500 bytes equals 15 terabytes.

  3. Bandwidth Estimates
    // Estimate the data transfer rates for both incoming (URL creation) and outgoing (URL redirection) traffic.
    
    - Incoming data: 193 URLs per second * 500 bytes equals 96.5 kilobytes per second.
    - Outgoing data: 19,300 requests per second * 500 bytes equals 9.65 megabytes per second.

  4. Memory Estimates
    // Estimate the memory required to cache frequently accessed URLs.
    - Caching 20% of daily traffic: 20% * (19,300 requests/second * 3600 seconds/hour * 24 hours/day) * 500 bytes equals approximately 170 gigabytes.
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
                  Defining syetem load and capacity
                </Button>
              }
              content={capacityEstimations}
            />
            {/* </TabsContent> */}

            {/* <TabsContent value="constraints">
                  <Textarea
                    rows={10}
                    value={constraints}
                    onChange={(e) => setConstraints(e.target.value)}
                    placeholder="Constraints of the system"
                  />
                  <WithMarkdownDetails
                    Icon={InfoIcon}
                    trigger={
                      <Button
                        variant="link"
                        className="pl-0 pt-0 opacity-50 transition-all hover:opacity-100"
                      >
                        <InfoIcon className="mr-1" size={16} />
                        Constraints of the system
                      </Button>
                    }
                    content={constraintsContent}
                  />
                </TabsContent>
              </Tabs> */}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

const capacityEstimations = `# Capacity Estimation and Constraints

## Introduction
Capacity estimation is a crucial step in system design. It involves predicting the resources required to handle the expected load on the system. This includes estimating the number of requests, storage requirements, bandwidth, and memory usage. Understanding these factors helps in designing a scalable and efficient system that can handle the anticipated traffic and data volume.

## Why Capacity Estimation is Important
1. **Scalability**: Ensures the system can scale to meet future growth without performance degradation.
2. **Performance**: Helps in maintaining optimal performance by allocating adequate resources.
3. **Cost Management**: Aids in budgeting and resource planning by predicting hardware and infrastructure needs.
4. **Reliability**: Prevents system failures by ensuring that the system can handle peak loads.

## Key Elements of Capacity Estimation
When estimating capacity, consider the following elements:

### 1. Traffic Estimates
Estimate the number of requests the system will handle per unit time (e.g., per second, per day).

### 2. Storage Estimates
Estimate the amount of data the system will store, including databases, logs, and backups.

### 3. Bandwidth Estimates
Estimate the network bandwidth required for data transfer between clients and servers.

### 4. Memory Estimates
Estimate the memory needed for caching, processing, and temporary data storage.

## Example: URL Shortening Service

### Traffic Estimates
Assume we expect 500 million new URL shortenings per month with a 100:1 read/write ratio.
- **New URLs per second**:
  500 million divided by 1 Month of Seconds is approximately 193 new shortend URLs per second.
- **URL redirections/reads per second**:
  100 times 193 equals 19,300 requests per second.

### Storage Estimates
Assume each URL shortening request (including metadata) takes 500 bytes of storage.
- **Total storage for 5 years**:
  500 million * 12 months/year * 5 years * 500 bytes equals 15 terabytes.

### Bandwidth Estimates
Estimate the data transfer rates for both incoming (URL creation) and outgoing (URL redirection) traffic.
- **Incoming data**:
  193 URLs per second * 500 bytes equals 96.5 kilobytes per second.
- **Outgoing data**:
  19,300 requests per second * 500 bytes equals 9.65 megabytes per second.

### Memory Estimates
Estimate the memory required to cache frequently accessed URLs.
- **Caching 20% of daily traffic**:
  20% * (19,300 requests/second * 3600 seconds/hour * 24 hours/day) * 500 bytes equals approximately 170 gigabytes.

## Conclusion
Capacity estimation and understanding constraints are essential steps in system design. They ensure that the system is scalable, performs well under load, and remains within budget. By accurately estimating traffic, storage, bandwidth, and memory requirements, and considering constraints like latency, throughput, availability, consistency, and cost, you can design a robust and efficient system.
`;

const constraintsContent = `# Constraints in System Design

## Introduction
In system design, constraints are limitations or restrictions that must be considered when building a system. They can come from various sources, including technical limitations, business requirements, regulatory guidelines, and environmental factors. Understanding and managing these constraints is crucial for designing a robust, scalable, and maintainable system.

## Types of Constraints

### 1. Technical Constraints
Technical constraints are limitations related to the technology stack, hardware, software, and architecture. These can include:
- **Performance**: Limitations on how fast the system must respond to user requests (latency) and how many requests it can handle (throughput).
- **Scalability**: Restrictions on the system's ability to scale horizontally (adding more machines) or vertically (upgrading machine capacity).
- **Reliability**: Requirements to ensure the system remains operational and can recover from failures (fault tolerance, redundancy).
- **Consistency**: The need to maintain data consistency across distributed systems (eventual consistency vs. strong consistency).

### 2. Business Constraints
Business constraints are requirements and limitations imposed by the organization's goals and priorities. These can include:
- **Budget**: Financial limitations on the cost of development, infrastructure, and maintenance.
- **Time**: Deadlines for delivering features or complete systems.
- **Compliance**: Adherence to industry standards, legal regulations, and internal policies.
- **Market Demand**: Need to meet customer expectations and competitive pressures.

### 3. Environmental Constraints
Environmental constraints are external factors that can impact the system. These can include:
- **Geographic Distribution**: The need to serve users across different geographic locations, which can affect latency and data residency requirements.
- **Network Conditions**: Variability in network performance, such as bandwidth limitations and latency.
- **Hardware Availability**: Limitations based on the availability and capability of hardware resources.

### 4. Security Constraints
Security constraints involve requirements to protect the system and data from unauthorized access, breaches, and other security threats. These can include:
- **Authentication and Authorization**: Ensuring only authorized users can access the system and perform actions.
- **Data Encryption**: Protecting data in transit and at rest through encryption.
- **Compliance**: Meeting security standards and regulations such as GDPR, HIPAA, or PCI-DSS.

## Managing Constraints

### Identifying Constraints
- **Requirement Analysis**: Gather and analyze requirements from stakeholders to identify constraints early in the design process.
- **Technical Assessment**: Evaluate the technical environment, including existing systems and technology stack, to uncover technical limitations.
- **Risk Assessment**: Identify potential risks and constraints related to security, compliance, and external factors.

### Addressing Constraints
- **Prioritization**: Prioritize constraints based on their impact on the system and the feasibility of addressing them.
- **Trade-offs**: Make informed trade-offs between competing constraints. For example, balancing performance with cost.
- **Design Patterns**: Use design patterns and best practices to address common constraints. For instance, using caching to improve performance or sharding to enhance scalability.
- **Prototyping and Testing**: Build prototypes and conduct performance tests to validate assumptions and understand the impact of constraints.

## Example: URL Shortening Service

### Constraints
- **Performance**: The system must handle high read and write throughput efficiently.
- **Scalability**: The system should scale to accommodate increasing numbers of users and URLs.
- **Reliability**: Ensure high availability and fault tolerance to prevent downtime.
- **Security**: Protect against unauthorized access and data breaches.
- **Cost**: Keep infrastructure and operational costs within budget.

### Solutions
- **Load Balancer**: Distribute traffic across multiple servers to handle high throughput.
- **Database Partitioning**: Use sharding to distribute data across multiple database instances for scalability.
- **Caching**: Implement caching to reduce database load and improve read performance.
- **Replication**: Use database replication to ensure high availability and data redundancy.
- **HTTPS**: Secure data in transit by using HTTPS for all communications.
- **Monitoring**: Implement monitoring and logging to track system performance and detect issues.

## Conclusion
Constraints are an integral part of system design, influencing decisions at every stage of development. By identifying and managing constraints effectively, designers can build systems that meet performance, scalability, reliability, and security requirements while staying within budget and time constraints. Understanding constraints helps in making informed trade-offs and designing systems that are robust and resilient.


`;
