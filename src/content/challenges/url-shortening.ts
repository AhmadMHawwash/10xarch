import { type Challenge } from "./types";
export const URLShortenerChallenge: Challenge = {
  slug: "url-shortener",
  title: "URL Shortener System Design",
  description:
    "Design a scalable URL shortening service like bit.ly that converts long URLs into short, unique aliases and handles redirects efficiently.",
  difficulty: "Easy",
  isFree: true,
  generalLearnings: [
    "Understand trade-offs between different hashing algorithms and ID generation strategies",
    "Learn about caching strategies and their impact on system performance",
    "Experience designing for horizontal scalability",
    "Practice capacity estimation and back-of-envelope calculations",
    "Learn about database selection and data modeling for high-throughput systems",
    "Understand monitoring and analytics in distributed systems",
    "Experience with high availability and fault tolerance design",
  ],
  stages: [
    // Stage 1: Basic URL Shortening
    {
      problem:
        "Users need to convert long URLs into shorter, shareable versions",
      requirements: [
        "System should generate a unique short URL for any given long URL",
      ],
      metaRequirements: [
        "System should generate a unique short URL for any given long URL",
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider using base62 encoding for URL-safe characters",
            "Think about URL length constraints",
          ],
          nonFunctional: [
            "Short URLs should be reasonably short (e.g., 6-8 characters)",
            "Generation should be quick (<100ms)",
          ],
        },
        systemAPI: [
          "What HTTP methods would be appropriate for URL creation?",
          "What response format would be most useful for clients?",
        ],
        capacityEstimations: {
          traffic: [
            "Start with 100 URL creations per second",
            "Consider read:write ratio for URL accesses",
          ],
          storage: [
            "Calculate storage needed for URLs and metadata",
            "Consider URL retention period",
          ],
          memory: [
            "Would caching benefit the system at this stage?",
            "What cache size would be appropriate?",
          ],
          bandwidth: [
            "Calculate incoming traffic for URL creation",
            "Calculate outgoing traffic for redirects",
          ],
        },
        highLevelDesign: [
          "Start with a simple client-server architecture",
          "Consider separation of URL generation and storage",
        ],
      },
      criteria: [
        "Can create short URLs",
        "Short URLs are unique",
        "System handles basic redirects",
      ],
      learningsInMD: `
## Key Learnings
- URL shortening algorithms and their trade-offs
- Basic API design principles
- Simple data modeling for URL mapping
- Basic capacity estimation techniques

## Technical Concepts
- HTTP redirects (301 vs 302)
- Hash function properties
- Database indexing basics
      `,
      resources: {
        documentation: [
          {
            title: "Base62 Encoding",
            url: "https://www.rfc-editor.org/rfc/rfc4648",
            description: "Understanding base encoding for URLs",
          },
        ],
        realWorldCases: [
          {
            name: "Bitly's Architecture",
            url: "https://bitly.com/blog/architecture",
            description: "Overview of a production URL shortener",
          },
        ],
        bestPractices: [
          {
            title: "URL Length Considerations",
            description:
              "Keep generated URLs between 6-8 characters for balance between uniqueness and usability",
            example: "bit.ly/2mP8oK9",
          },
        ],
      },
    },
    // Stage 2: Handling Scale
    {
      problem: "System is experiencing high load with 1000 requests per second",
      requirements: [
        "System should handle 1000 requests per second with latency under 100ms",
      ],
      metaRequirements: [
        "System should generate a unique short URL for any given long URL",
        "System should handle 1000 requests per second with latency under 100ms",
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider distributed URL generation",
            "Think about collision handling",
          ],
          nonFunctional: [
            "Maintain latency under 100ms at scale",
            "Consider availability requirements",
          ],
        },
        systemAPI: [
          "How would you handle bulk URL creation?",
          "What rate limiting might be needed?",
        ],
        capacityEstimations: {
          traffic: ["Calculate peak vs average load", "Estimate growth rate"],
          storage: [
            "Project storage needs for 1 year",
            "Consider cleanup policies",
          ],
          memory: [
            "Calculate hit rate improvements with caching",
            "Estimate memory needs for hot URLs",
          ],
          bandwidth: [
            "Calculate bandwidth needs at peak load",
            "Consider CDN benefits",
          ],
        },
        highLevelDesign: [
          "Consider adding load balancer",
          "Think about caching layer placement",
        ],
      },
      criteria: [
        "Handles 1000 RPS",
        "Maintains latency under 100ms",
        "No single points of failure",
      ],
      learningsInMD: `
## Key Learnings
- Horizontal scaling principles
- Load balancing strategies
- Caching architecture
- Performance optimization techniques

## Technical Concepts
- Cache eviction policies
- Load balancer algorithms
- Database replication basics
      `,
      resources: {
        documentation: [
          {
            title: "System Design Primer - Scaling",
            url: "https://github.com/donnemartin/system-design-primer#scaling",
            description: "Comprehensive guide on scaling distributed systems",
          },
        ],
        realWorldCases: [
          {
            name: "TinyURL Architecture",
            url: "https://medium.com/@narengowda/system-design-url-shortening-service-like-tinyurl-106f30f23a82",
            description: "Real-world scaling challenges and solutions",
          },
        ],
        bestPractices: [
          {
            title: "Caching Strategy",
            description: "Implement LRU caching for frequently accessed URLs",
            example: "Using Redis with LRU eviction",
          },
        ],
      },
    },
    {
      problem:
        "Users want custom short URLs, and the system is experiencing data consistency issues across distributed components",
      requirements: [
        "Allow custom URL aliases while preventing conflicts and maintaining consistency across the distributed system",
      ],
      metaRequirements: [
        "System should generate a unique short URL for any given long URL",
        "System should handle 1000 requests per second with latency under 100ms",
        "Allow custom URL aliases while preventing conflicts and maintaining consistency across the distributed system",
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider custom URL validation rules",
            "Think about URL ownership and conflicts",
          ],
          nonFunctional: [
            "Ensure consistent URL mappings across all servers",
            "Handle race conditions in custom URL creation",
          ],
        },
        systemAPI: [
          "How to handle custom URL requests?",
          "What conflict resolution strategy to use?",
        ],
        capacityEstimations: {
          traffic: [
            "Estimate custom URL creation rate",
            "Calculate conflict check overhead",
          ],
          storage: [
            "Consider additional metadata for custom URLs",
            "Estimate storage for URL ownership data",
          ],
          memory: [
            "Calculate cache needs for consistency checking",
            "Consider distributed lock overhead",
          ],
          bandwidth: [
            "Estimate consistency protocol overhead",
            "Calculate replication traffic",
          ],
        },
        highLevelDesign: [
          "Consider distributed locking mechanisms",
          "Think about consistency protocol design",
        ],
      },
      criteria: [
        "Supports custom URL creation",
        "Prevents URL conflicts",
        "Maintains consistency across system",
      ],
      learningsInMD: `
## Key Learnings
- Distributed consistency patterns
- Race condition handling
- Custom resource allocation
- Conflict resolution strategies

## Technical Concepts
- Distributed locks
- Consistency protocols
- Database isolation levels
- Optimistic vs pessimistic locking
      `,
      resources: {
        documentation: [
          {
            title: "Distributed Locking Patterns",
            url: "https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html",
            description: "Understanding distributed locking mechanisms",
          },
        ],
        realWorldCases: [
          {
            name: "Bitly Custom Links",
            url: "https://bitly.com/pages/features/custom-links",
            description: "Real-world implementation of custom URL shortening",
          },
        ],
        bestPractices: [
          {
            title: "Custom URL Management",
            description:
              "Implement optimistic locking with retry mechanism for custom URL creation",
            example: "Using Redis SETNX for distributed locking",
          },
        ],
      },
    },
    // Stage 4: High Availability and Disaster Recovery
    {
      problem:
        "System needs to maintain 99.99% availability and handle regional failures",
      requirements: [
        "Implement multi-region failover with data consistency guarantees",
      ],
      metaRequirements: [
        "System should generate a unique short URL for any given long URL",
        "System should handle 1000 requests per second with latency under 100ms",
        "Track URL access patterns and provide basic analytics while maintaining system performance",
        "Implement multi-region failover with data consistency guarantees",
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider data replication strategies",
            "Think about failover mechanisms",
          ],
          nonFunctional: [
            "Define acceptable RPO and RTO",
            "Consider consistency models",
          ],
        },
        systemAPI: [
          "How to handle region-specific endpoints?",
          "What changes for disaster recovery?",
        ],
        capacityEstimations: {
          traffic: [
            "Calculate cross-region traffic",
            "Estimate failover capacity needs",
          ],
          storage: [
            "Calculate replication storage overhead",
            "Consider backup storage needs",
          ],
          memory: [
            "Estimate cache synchronization needs",
            "Calculate failover cache requirements",
          ],
          bandwidth: [
            "Calculate replication bandwidth",
            "Estimate recovery bandwidth needs",
          ],
        },
        highLevelDesign: [
          "Consider active-active vs active-passive setup",
          "Think about global load balancing",
        ],
      },
      criteria: [
        "Achieves 99.99% availability",
        "Handles regional failures",
        "Maintains data consistency",
      ],
      learningsInMD: `
## Key Learnings
- High availability design patterns
- Disaster recovery planning
- Multi-region architecture
- Data consistency models

## Technical Concepts
- Global load balancing
- Data replication strategies
- Failover mechanisms
- CAP theorem implications
      `,
      resources: {
        documentation: [
          {
            title: "Multi-Region Architecture",
            url: "https://aws.amazon.com/architecture/well-architected",
            description: "Best practices for multi-region design",
          },
        ],
        realWorldCases: [
          {
            name: "Netflix Multi-Region Design",
            url: "https://netflixtechblog.com/active-active-for-multi-regional-resiliency-c47719f6685b",
            description: "Real-world multi-region implementation",
          },
        ],
        bestPractices: [
          {
            title: "Disaster Recovery",
            description: "Implement automated failover with regular testing",
            example: "Using Route 53 health checks for DNS failover",
          },
        ],
      },
    },
  ],
};

export default URLShortenerChallenge;
