import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useChallengeManager } from "@/lib/hooks/useChallengeManager";
import { InfoIcon, NotebookPen } from "lucide-react";
import { useWhiteboard } from "../ReactflowCustomNodes/APIsNode";
import { WithMarkdownDetails } from "../SystemComponents/Wrappers/WithMarkdownDetails";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { Hints } from "./RequirementsDefinition";

export const CapacityEstimationDefinition = () => {
  const { capacity, setCapacity } = useWhiteboard();
  const { stage } = useChallengeManager();

  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <Button variant="outline" size="sm" className="w-full mt-1">
          <NotebookPen size={15} className="mr-2" />
          Capacity Estimations
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-scroll">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-4">Capacity Estimation</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="traffic" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="traffic">Traffic</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="bandwidth">Bandwidth</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
          </TabsList>
          <TabsContent value="traffic">
            <CapacitySection
              value={capacity.Traffic}
              onChange={(value) => setCapacity({ ...capacity, Traffic: value })}
              placeholder="Example: URL Shortening Service traffic estimation..."
              infoContent={trafficEstimation}
              infoButtonText="How to estimate traffic"
            />
          </TabsContent>
          <TabsContent value="storage">
            <CapacitySection
              value={capacity.Storage}
              onChange={(value) => setCapacity({ ...capacity, Storage: value })}
              placeholder="Example: URL Shortening Service storage estimation..."
              infoContent={storageEstimation}
              infoButtonText="How to estimate storage"
            />
          </TabsContent>
          <TabsContent value="bandwidth">
            <CapacitySection
              value={capacity.Bandwidth}
              onChange={(value) => setCapacity({ ...capacity, Bandwidth: value })}
              placeholder="Example: URL Shortening Service bandwidth estimation..."
              infoContent={bandwidthEstimation}
              infoButtonText="How to estimate bandwidth"
            />
          </TabsContent>
          <TabsContent value="memory">
            <CapacitySection
              value={capacity.Memory}
              onChange={(value) => setCapacity({ ...capacity, Memory: value })}
              placeholder="Example: URL Shortening Service memory estimation..."
              infoContent={memoryEstimation}
              infoButtonText="How to estimate memory"
            />
          </TabsContent>
        </Tabs>
        <Hints hints={stage?.hintsPerArea.capacityEstimations} />
      </DialogContent>
    </Dialog>
  );
};

interface CapacitySectionProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  infoContent: string;
  infoButtonText: string;
}

const CapacitySection: React.FC<CapacitySectionProps> = ({
  value,
  onChange,
  placeholder,
  infoContent,
  infoButtonText
}) => (
  <div className="space-y-4">
    <Textarea
      rows={15}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="text-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:border-gray-400 dark:focus:border-gray-600"
    />
    <WithMarkdownDetails
      Icon={InfoIcon}
      trigger={
        <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
          <InfoIcon className="mr-2" size={16} />
          {infoButtonText}
        </Button>
      }
      content={infoContent}
    />
  </div>
);

const trafficEstimation = `# Traffic Estimation

## Introduction
Traffic estimation is a crucial part of capacity planning for any system. It involves predicting the volume of requests or interactions that a system will need to handle. Accurate traffic estimation helps in designing a system that can efficiently handle the expected load without over-provisioning resources.

## Key Factors in Traffic Estimation

1. **Daily Active Users (DAU)**: The number of unique users interacting with the system daily.
2. **Requests per User**: The average number of requests or interactions each user makes per day.
3. **Peak-to-Average Ratio**: The ratio of peak traffic to average traffic, often used to account for traffic spikes.
4. **Growth Rate**: The expected increase in traffic over time.

## Example: URL Shortening Service Traffic Estimation

Assume we have the following requirements:
- 1 million daily active users
- Each user creates 2 short URLs per day on average
- Each short URL is accessed 10 times per day on average
- Expected 20% year-over-year growth

Calculations:
1. **URL Creation Requests**:
   - 1,000,000 users * 2 URLs/user/day = 2,000,000 URL creations per day
   - 2,000,000 / 24 hours / 3600 seconds ≈ 23 URL creations per second

2. **URL Redirection Requests**:
   - 2,000,000 URLs * 10 accesses/URL/day = 20,000,000 redirections per day
   - 20,000,000 / 24 hours / 3600 seconds ≈ 231 URL redirections per second

3. **Peak Traffic Estimation**:
   - Assuming a peak-to-average ratio of 2:1
   - Peak URL creations: 23 * 2 = 46 per second
   - Peak URL redirections: 231 * 2 = 462 per second

4. **Growth Projection**:
   - After 1 year: 23 * 1.2 ≈ 28 URL creations per second, 231 * 1.2 ≈ 277 redirections per second
   - After 3 years: 23 * (1.2^3) ≈ 40 URL creations per second, 231 * (1.2^3) ≈ 400 redirections per second

## Conclusion
Traffic estimation provides a foundation for capacity planning and system design. It helps in determining the required resources, such as servers, databases, and network capacity. Regular monitoring and adjustment of these estimates are crucial as actual usage patterns emerge and evolve.
`;

const storageEstimation = `# Storage Estimation

## Introduction
Storage estimation is the process of calculating the amount of data storage capacity a system will require. This is crucial for choosing appropriate storage solutions, planning for data growth, and ensuring that the system can efficiently handle and retrieve data.

## Key Factors in Storage Estimation

1. **Data Size**: The size of individual data items or records.
2. **Data Volume**: The number of data items or records to be stored.
3. **Data Growth Rate**: The expected increase in data volume over time.
4. **Redundancy Factor**: Additional storage needed for data replication and backups.
5. **Overhead**: Extra storage required for indexing, metadata, and system operations.

## Example: URL Shortening Service Storage Estimation

Assume we have the following requirements:
- Store 2 million new URLs per day
- Each URL entry consists of:
  - Original URL (average 100 characters): 100 bytes
  - Short URL (7 characters): 7 bytes
  - Creation timestamp: 8 bytes
  - User ID (8 bytes for a 64-bit ID): 8 bytes
- Data needs to be stored for 5 years
- 20% additional space for indexing and metadata

Calculations:
1. **Storage per URL Entry**:
   - Total bytes per entry: 100 + 7 + 8 + 8 = 123 bytes
   - With 20% overhead: 123 * 1.2 ≈ 148 bytes

2. **Daily Storage Requirement**:
   - 2,000,000 new URLs * 148 bytes ≈ 296 MB per day

3. **5-Year Storage Requirement**:
   - 296 MB * 365 days * 5 years ≈ 540 GB

4. **With Redundancy**:
   - Assuming 3x replication for high availability
   - 540 GB * 3 = 1.62 TB

## Conclusion
Storage estimation helps in choosing appropriate storage solutions and planning for future growth. It's important to regularly review and adjust these estimates based on actual usage patterns and data growth rates. Additionally, consider factors like data compression, which can significantly reduce storage requirements, and the need for
`;

const bandwidthEstimation = `# Bandwidth Estimation

## Introduction
Bandwidth estimation is the process of calculating the amount of network bandwidth required to support the expected data transfer rates in a system. Accurate bandwidth estimation is crucial for designing efficient and scalable network architectures, ensuring that the system can handle the anticipated data traffic without bottlenecks.

## Key Factors in Bandwidth Estimation

1. **Data Transfer Rates**: The rate at which data is transmitted between clients and servers.
2. **Peak Traffic**: The maximum data transfer rate expected during peak usage periods.
3. **Compression**: The use of data compression techniques to reduce the amount of data transferred.
4. **Caching**: The use of caching mechanisms to minimize data transfer between clients and servers.

## Example: URL Shortening Service Bandwidth Estimation

Assume we have the following requirements:
- 23 URL creations per second
- 231 URL redirections per second
- Each URL creation request is 100 bytes
- Each URL redirection response is 500 bytes
- 20% of URL redirection traffic is cached

Calculations:
1. **URL Creation Bandwidth**:
   - 23 requests/second * 100 bytes/request = 2.3 kilobytes/second

2. **URL Redirection Bandwidth**:
   - 231 requests/second * 500 bytes/request = 115.5 kilobytes/second
   - With 20% caching: 115.5 kilobytes/second * 0.8 = 92.4 kilobytes/second

3. **Total Bandwidth**:
   - 2.3 kilobytes/second (URL creation) + 92.4 kilobytes/second (URL redirection) = 94.7 kilobytes/second

## Conclusion
Bandwidth estimation is essential for designing efficient and scalable network architectures. It helps in determining the required network capacity to handle the anticipated data traffic, ensuring that the system can operate smoothly without bottlenecks. Regular monitoring and adjustment of bandwidth estimates are crucial as actual usage patterns emerge and evolve.
`;

const memoryEstimation = `# Memory Estimation

## Introduction
Memory estimation is the process of calculating the amount of memory required to support the expected workload of a system. Accurate memory estimation is crucial for designing efficient and scalable systems, ensuring that the system can handle the anticipated memory requirements without running out of resources.

## Key Factors in Memory Estimation

1. **Memory Usage**: The amount of memory used by various components of the system, such as caching, processing, and temporary data storage.
2. **Peak Memory Usage**: The maximum amount of memory required during peak usage periods.
3. **Caching**: The use of caching mechanisms to minimize memory usage and improve performance.
4. **Compression**: The use of data compression techniques to reduce the amount of memory required for data storage.

## Example: URL Shortening Service Memory Estimation

Assume we have the following requirements:
- 231 URL redirections per second
- Each URL redirection response is 500 bytes
- 20% of URL redirection traffic is cached
- 10% of the cached data is evicted daily

Calculations:
1. **Cached Data**:
   - 231 requests/second * 500 bytes/request * 20% = 23.1 kilobytes/second
   - Daily cached data: 23.1 kilobytes/second * 3600 seconds/hour * 24 hours/day = 21.7 megabytes/day
   - With 10% eviction: 21.7 megabytes/day * 0.9 = 19.5 megabytes/day

2. **Peak Memory Usage**:
   - Assuming a peak-to-average ratio of 2:1
   - Peak cached data: 19.5 megabytes/day * 2 = 39 megabytes/day

## Conclusion
Memory estimation is essential for designing efficient and scalable systems. It helps in determining the required memory capacity to handle the anticipated workload, ensuring that the system can operate smoothly without running out of resources. Regular monitoring and adjustment of memory estimates are crucial as actual usage patterns emerge and evolve.
`;
