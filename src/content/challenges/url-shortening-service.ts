import { type Challenge } from "./types";

// export const urlShorteningService: Challenge = {
//   slug: "url-shortening-service",
//   title: "URL Shortening Service",
//   diffcutly: "Easy",
//   description: `Design a URL shortening service like bit.ly, tinyurl.com, etc.`,
//   // Requirements: `- The system should be able to generate a short URL for a given long URL.
//   // - When a user accesses a short URL, the system should redirect the user to the original URL.
//   // - Users should be able to specify a custom short URL.
//   // - The system should provide analytics on the number of times a short URL is accessed.
//   // - The system should be highly available and scalable.`,
//   stages: [
//     {
//       objective:
//         "Create a basic URL shortening service that can generate a short URL for a given long URL and retrieve the original URL using the short URL.",
//     },
//     {
//       objective: "Improve the system's availability and scalability",
//       problem:
//         "The basic system can't handle high traffic efficiently, leading to slow responses and potential downtime.",
//     },
//     {
//       objective: "Reduce the latency of URL redirections",
//       problem:
//         "Frequent reads are causing high latency and putting a heavy load on the database",
//     },
//     {
//       objective: "Enhance data durability and system availability",
//       problem:
//         "The single database instance is a single point of failure, risking data loss and downtime.",
//     },
//     {
//       problem:
//         "Accumulation of expired URLs is wasting storage and affecting database performance.",
//       objective:
//         "Implement URL expiration and cleanup mechanisms to handle expired URLs and periodically clean up the database.",
//     },
//     {
//       problem:
//         "There is no visibility into system performance or user activity, making it hard to detect and diagnose issues.",
//       objective:
//         "Monitor the system's performance and usage by adding telemetry and monitoring tools.",
//     },
//     {
//       problem:
//         "The current setup may not support rapid growth in traffic and data volume.",
//       objective:
//         "Ensure the system can scale to handle growing traffic and data",
//     },
//     {
//       problem:
//         "The database is becoming a bottleneck due to large volumes of data",
//       objective: "Efficiently manage large volumes of data using partitioning",
//     },
//     {
//       problem:
//         "The system needs to be resilient to disasters and recover quickly to maintain availability.",
//       objective:
//         "Implement disaster recovery strategies to ensure high availability",
//     },
//   ],
// };

export const urlShorteningService: Challenge = {
  slug: "url-shortening-service",
  title: "URL Shortening Service",
  description:
    "Design and implement a scalable, high-performance URL shortening service.",
  difficulty: "Medium",
  stages: [
    {
      problem:
        "Create a basic URL shortening service that can generate a short URL for a given long URL and retrieve the original URL using the short URL.",
      assumptions: [
        "Assume 500,000 new URL shortenings per month.",
        "100:1 read/write ratio.",
      ],
      hintsPerArea: {
        functionalAndNonFunctionalRequirements: [
          "Focus on implementing the core functionality first.",
          "Ensure you have a way to store the mappings between short and long URLs.",
        ],
        systemAPI: [
          "Define clear and concise endpoints.",
          "Start with a simple POST request for creating short URLs and a GET request for retrieving them.",
        ],
        capacityEstimations: [
          "Calculate the estimated load and storage needs based on the given assumptions to ensure your initial setup can handle the expected traffic.",
        ],
        highLevelDesign: [
          "Start with a simple client-server-database architecture to handle basic requests.",
        ],
      },
      criteria: [
        "There's at least 1 client component",
        "There's at least 1 server component",
        "There's at least 1 database component",
      ],
    },
    {
      problem:
        "Improve the system's availability and scalability by adding a load balancer to handle increased traffic.",
      assumptions: [
        "Assume the number of requests per second increases to 1000.",
      ],
      hintsPerArea: {
        functionalAndNonFunctionalRequirements: [
          "Consider using a load balancer to evenly distribute incoming requests across multiple servers.",
        ],
        systemAPI: [
          "The existing APIs should work seamlessly with a load balancer. Focus on improving the infrastructure.",
        ],
        capacityEstimations: [
          "Calculate how much additional traffic each server can handle and ensure the load balancer can manage the distribution.",
        ],
        highLevelDesign: [
          "Introduce redundancy by adding multiple servers to the architecture and connect them through a load balancer.",
        ],
      },
      criteria: [
        "Load balancer distributes traffic evenly",
        "System handles 1000 requests per second",
        "No single point of failure in the server layer",
      ],
    },
    {
      problem:
        "Reduce the latency of URL redirections by adding a caching layer.",
      assumptions: [
        "Assume 70% of the traffic consists of repeated requests for the same URLs.",
      ],
      hintsPerArea: {
        functionalAndNonFunctionalRequirements: [
          "Use an in-memory caching solution like Redis or Memcached to store frequently accessed data.",
        ],
        systemAPI: [
          "Ensure your server checks the cache before querying the database to improve response times.",
        ],
        capacityEstimations: [
          "Determine the size of the cache based on the most frequently accessed URLs and the available memory.",
        ],
        highLevelDesign: [
          "Place the cache between the servers and the database to speed up read operations.",
        ],
      },
      criteria: [
        "Caching layer is implemented",
        "70% of repeated requests are served from cache",
        "Significant reduction in average response time",
      ],
    },
    {
      problem:
        "Enhance data durability and system availability by implementing database replication.",
      assumptions: [
        "Assume the database needs to handle 200 writes per second and 20,000 reads per second.",
        "The data must be available even if one database instance fails.",
      ],
      hintsPerArea: {
        functionalAndNonFunctionalRequirements: [
          "Use database replication to create copies of your data across multiple instances to prevent data loss.",
        ],
        systemAPI: [
          "Ensure that write operations are directed to the primary database, while read operations can be handled by replicas.",
        ],
        capacityEstimations: [
          "Consider the increased storage needs due to data replication and plan accordingly.",
        ],
        highLevelDesign: [
          "Designate one database as the primary for writes and others as replicas for reads to improve availability and durability.",
        ],
      },
      criteria: [
        "Database replication is implemented",
        "System handles 200 writes and 20,000 reads per second",
        "Data remains available if one database instance fails",
      ],
    },
    {
      problem:
        "Implement URL expiration and cleanup mechanisms to handle expired URLs and periodically clean up the database.",
      assumptions: ["Assume that 10% of URLs will expire each month."],
      hintsPerArea: {
        functionalAndNonFunctionalRequirements: [
          "Implement a mechanism to set expiration dates for URLs and periodically clean up expired entries.",
        ],
        systemAPI: [
          "Provide an endpoint to trigger the cleanup process and manage expired URLs.",
        ],
        capacityEstimations: [
          "Calculate the expected number of expired URLs based on usage patterns and determine the cleanup schedule.",
        ],
        highLevelDesign: [
          "Integrate a cleanup service to periodically remove expired URLs from the database and cache.",
        ],
      },
      criteria: [
        "URL expiration mechanism is in place",
        "Periodic cleanup of expired URLs is implemented",
        "10% of URLs are successfully expired each month",
      ],
    },
    {
      problem:
        "Secure the system and manage user permissions to control access to URLs.",
      assumptions: [
        "Assume 10,000 active users, each making 10 API requests per day.",
      ],
      hintsPerArea: {
        functionalAndNonFunctionalRequirements: [
          "Implement user authentication to verify identities and control access to the service.",
        ],
        systemAPI: [
          "Define endpoints for user login and permission management to secure the service.",
        ],
        capacityEstimations: [
          "Consider the storage needs for user data and permissions based on the number of users.",
        ],
        highLevelDesign: [
          "Introduce an authentication service to handle user login and manage permissions securely.",
        ],
      },
      criteria: [
        "User authentication system is implemented",
        "Access control for URL management is in place",
        "System handles 10,000 active users with 10 API requests per day each",
      ],
    },
    {
      problem:
        "Monitor the system's performance and usage by adding telemetry and monitoring tools.",
      assumptions: [
        "Assume the system needs to track usage metrics such as the number of requests per second, average response time, and error rates.",
      ],
      hintsPerArea: {
        functionalAndNonFunctionalRequirements: [
          "Use telemetry to collect data on system usage and performance metrics.",
        ],
        systemAPI: [
          "Define an endpoint to retrieve usage statistics and performance metrics.",
        ],
        capacityEstimations: [
          "Estimate the amount of telemetry data generated and stored.",
        ],
        highLevelDesign: [
          "Integrate monitoring tools to track system performance and detect issues.",
        ],
      },
      criteria: [
        "Telemetry and monitoring tools are integrated",
        "System tracks key metrics (requests per second, response time, error rates)",
        "Performance data is accessible through an API",
      ],
    },
    {
      problem:
        "Ensure the system can scale to handle growing traffic and data.",
      assumptions: [
        "Assume the number of users and requests doubles every six months.",
      ],
      hintsPerArea: {
        functionalAndNonFunctionalRequirements: [
          "Implement horizontal scaling by adding more servers and databases.",
        ],
        systemAPI: ["No changes needed to the API."],
        capacityEstimations: [
          "Estimate the increased capacity needs and plan for scaling.",
        ],
        highLevelDesign: [
          "Add additional servers and databases to handle increased load.",
        ],
      },
      criteria: [
        "System scales to handle doubling of users and requests every six months",
        "Performance remains stable under increased load",
        "No significant increase in response times as system scales",
      ],
    },
    {
      problem: "Efficiently manage large volumes of data using partitioning.",
      assumptions: [
        "Assume the database will grow to handle billions of records.",
      ],
      hintsPerArea: {
        functionalAndNonFunctionalRequirements: [
          "Partition your database to distribute data efficiently and reduce bottlenecks.",
        ],
        systemAPI: ["No changes needed to the API."],
        capacityEstimations: [
          "Estimate the number of partitions and how data will be distributed.",
        ],
        highLevelDesign: [
          "Implement data partitioning to handle large datasets efficiently.",
        ],
      },
      criteria: [
        "Database partitioning is implemented",
        "System efficiently handles billions of records",
        "Query performance remains stable with large data volumes",
      ],
    },
    {
      problem:
        "Implement disaster recovery strategies to ensure high availability.",
      assumptions: [
        "Assume the need for daily backups and the ability to recover from a disaster within an hour.",
      ],
      hintsPerArea: {
        functionalAndNonFunctionalRequirements: [
          "Set up regular backups and disaster recovery plans to ensure data integrity and availability.",
        ],
        systemAPI: ["No changes needed to the API."],
        capacityEstimations: [
          "Estimate the storage requirements for backups and recovery timelines.",
        ],
        highLevelDesign: [
          "Integrate a disaster recovery service to handle backups and data restoration.",
        ],
      },
      criteria: [
        "Daily backups are performed successfully",
        "System can recover from a disaster within one hour",
        "Data integrity is maintained during recovery process",
      ],
    },
  ],
};
