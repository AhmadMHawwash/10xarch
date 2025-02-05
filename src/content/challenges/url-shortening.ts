import { type Challenge } from "./types";

const urlShortenerChallenge: Challenge = {
  slug: "url-shortener",
  title: "URL Shortener System Design",
  description: "Design a scalable URL shortening service that converts long URLs into short, unique identifiers while ensuring high availability and quick access.",
  difficulty: "Easy",
  isFree: true,
  stages: [
    {
      problem: "Users need a way to convert their long URLs into shorter, more manageable versions that can be easily shared.",
      requirements: [
        "Create a service that can convert long URLs into short ones"
      ],
      metaRequirements: [
        "Create a service that can convert long URLs into short ones"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider what characters should be allowed in the short URL",
            "Think about URL validation before shortening"
          ],
          nonFunctional: [
            "Consider the length of the shortened URL",
            "Think about URL readability"
          ]
        },
        systemAPI: [
          "What HTTP method is appropriate for URL creation?",
          "What should the response format look like?"
        ],
        capacityEstimations: {
          traffic: [
            "How many new URLs might be shortened per day?",
            "What's the read-to-write ratio for URL access?"
          ],
          storage: [
            "How much space does each URL mapping need?",
            "How long should we keep URLs?"
          ],
          memory: [
            "Which data should we keep in memory?",
            "How much memory would caching require?"
          ],
          bandwidth: [
            "Calculate incoming traffic for URL creation",
            "Calculate outgoing traffic for URL redirection"
          ]
        },
        highLevelDesign: [
          "Start with a simple client-server architecture",
          "Consider where to store URL mappings"
        ]
      },
      criteria: [
        "System can accept a long URL and return a shortened version",
        "System can redirect users from short URL to original URL"
      ],
      learningsInMD: `
## Key Learnings
- Basic client-server architecture design
- RESTful API design principles
- Data storage considerations
- URL validation and processing
      `,
      resources: {
        documentation: [
          {
            title: "RESTful API Design",
            url: "https://docs.microsoft.com/en-us/azure/architecture/best-practices/api-design",
            description: "Best practices for designing RESTful APIs"
          }
        ],
        realWorldCases: [
          {
            name: "Bitly",
            url: "https://bitly.com/",
            description: "Popular URL shortening service with enterprise features"
          }
        ],
        bestPractices: [
          {
            title: "URL Validation",
            description: "Always validate URLs before shortening",
            example: "Check URL format, accessibility, and potential security risks"
          }
        ]
      }
    },
    {
      problem: "Users are reporting slow response times when accessing shortened URLs.",
      requirements: [
        "Reduce access time to shortened URLs"
      ],
      metaRequirements: [
        "Create a service that can convert long URLs into short ones",
        "Reduce access time to shortened URLs"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider caching frequently accessed URLs",
            "Think about cache eviction policies"
          ],
          nonFunctional: [
            "Consider response time requirements",
            "Think about cache hit ratio targets"
          ]
        },
        systemAPI: [
          "How will you handle cache misses?",
          "Should the API indicate if response is cached?"
        ],
        capacityEstimations: {
          traffic: [
            "What percentage of URLs are frequently accessed?",
            "How much traffic can be served from cache?"
          ],
          storage: [
            "How much cache storage is needed?",
            "What's the optimal cache size?"
          ],
          memory: [
            "Calculate memory needed for caching",
            "Consider memory constraints"
          ],
          bandwidth: [
            "How does caching affect bandwidth usage?",
            "Calculate cache update traffic"
          ]
        },
        highLevelDesign: [
          "Where should the cache be placed?",
          "Consider distributed caching options"
        ]
      },
      criteria: [
        "System can accept a long URL and return a shortened version",
        "System can redirect users from short URL to original URL",
        "Frequently accessed URLs are served faster"
      ],
      learningsInMD: `
## Key Learnings
- Caching strategies and patterns
- Cache placement in architecture
- Memory vs disk storage trade-offs
- Cache eviction policies
      `,
      resources: {
        documentation: [
          {
            title: "Caching Best Practices",
            url: "https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/BestPractices.html",
            description: "AWS caching best practices and patterns"
          }
        ],
        realWorldCases: [
          {
            name: "TinyURL",
            url: "https://tinyurl.com/",
            description: "URL shortener with caching implementation"
          }
        ],
        bestPractices: [
          {
            title: "Cache Strategy",
            description: "Implement LRU caching for frequently accessed URLs",
            example: "Use Redis or Memcached with LRU eviction policy"
          }
        ]
      }
    },
    {
      problem: "The service is experiencing downtime during peak usage periods.",
      requirements: [
        "Ensure system availability during high traffic"
      ],
      metaRequirements: [
        "Create a service that can convert long URLs into short ones",
        "Reduce access time to shortened URLs",
        "Ensure system availability during high traffic"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider how to handle traffic spikes",
            "Think about load distribution"
          ],
          nonFunctional: [
            "Consider availability targets",
            "Think about load balancing strategies"
          ]
        },
        systemAPI: [
          "How should the API handle overload?",
          "What status codes for service degradation?"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate peak traffic patterns",
            "Estimate traffic distribution"
          ],
          storage: [
            "How does data replication affect storage?",
            "Calculate storage for multiple instances"
          ],
          memory: [
            "Memory needs for multiple instances",
            "Cache distribution across instances"
          ],
          bandwidth: [
            "Inter-instance communication overhead",
            "Load balancer bandwidth requirements"
          ]
        },
        highLevelDesign: [
          "Consider load balancer placement",
          "Think about service discovery"
        ]
      },
      criteria: [
        "System can accept a long URL and return a shortened version",
        "System can redirect users from short URL to original URL",
        "Frequently accessed URLs are served faster",
        "System remains available during traffic spikes"
      ],
      learningsInMD: `
## Key Learnings
- Load balancing techniques
- High availability patterns
- Horizontal scaling strategies
- Service discovery principles
      `,
      resources: {
        documentation: [
          {
            title: "High Availability Patterns",
            url: "https://docs.microsoft.com/en-us/azure/architecture/patterns/category/availability",
            description: "Patterns for building highly available services"
          }
        ],
        realWorldCases: [
          {
            name: "Google URL Shortener (Historical)",
            url: "https://goo.gl/",
            description: "Example of highly available URL shortening service"
          }
        ],
        bestPractices: [
          {
            title: "Load Balancing",
            description: "Implement round-robin load balancing with health checks",
            example: "Use nginx or HAProxy with active health monitoring"
          }
        ]
      }
    },
    {
      problem: "Users are reporting that some shortened URLs are not working consistently across different regions.",
      requirements: [
        "Ensure consistent URL access across regions"
      ],
      metaRequirements: [
        "Create a service that can convert long URLs into short ones",
        "Reduce access time to shortened URLs",
        "Ensure system availability during high traffic",
        "Ensure consistent URL access across regions"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider data replication strategy",
            "Think about consistency models"
          ],
          nonFunctional: [
            "Consider replication lag",
            "Think about regional latency"
          ]
        },
        systemAPI: [
          "How to handle write conflicts?",
          "Consider consistency headers"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate cross-region traffic",
            "Estimate replication traffic"
          ],
          storage: [
            "Storage needs per region",
            "Replication overhead"
          ],
          memory: [
            "Cache requirements per region",
            "Replication state memory needs"
          ],
          bandwidth: [
            "Inter-region bandwidth requirements",
            "Replication bandwidth needs"
          ]
        },
        highLevelDesign: [
          "Consider multi-region architecture",
          "Think about replication topology"
        ]
      },
      criteria: [
        "System can accept a long URL and return a shortened version",
        "System can redirect users from short URL to original URL",
        "Frequently accessed URLs are served faster",
        "System remains available during traffic spikes",
        "URLs work consistently across all regions"
      ],
      learningsInMD: `
## Key Learnings
- Multi-region architecture
- Data replication strategies
- Consistency models
- Global load balancing
      `,
      resources: {
        documentation: [
          {
            title: "Multi-Region Architecture",
            url: "https://aws.amazon.com/blogs/architecture/category/database/",
            description: "Best practices for multi-region architectures"
          }
        ],
        realWorldCases: [
          {
            name: "Cloudflare Workers",
            url: "https://workers.cloudflare.com/",
            description: "Example of global edge computing platform"
          }
        ],
        bestPractices: [
          {
            title: "Global Distribution",
            description: "Use DNS-based global load balancing",
            example: "Implement Route53 or Cloudflare DNS with latency-based routing"
          }
        ]
      }
    },
    {
      problem: "Security team has identified potential abuse of the service for malicious URL spreading.",
      requirements: [
        "Implement security measures against URL abuse"
      ],
      metaRequirements: [
        "Create a service that can convert long URLs into short ones",
        "Reduce access time to shortened URLs",
        "Ensure system availability during high traffic",
        "Ensure consistent URL access across regions",
        "Implement security measures against URL abuse"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider URL scanning mechanism",
            "Think about rate limiting"
          ],
          nonFunctional: [
            "Consider scanning latency impact",
            "Think about false positive rates"
          ]
        },
        systemAPI: [
          "How to handle suspicious URLs?",
          "What rate limit headers to use?"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate scanning overhead",
            "Estimate blocked request ratio"
          ],
          storage: [
            "Storage for URL metadata",
            "Blocklist storage needs"
          ],
          memory: [
            "Rate limiting data structures",
            "Security check caching"
          ],
          bandwidth: [
            "URL scanning service bandwidth",
            "Security update propagation"
          ]
        },
        highLevelDesign: [
          "Where to place security checks",
          "Consider rate limiter design"
        ]
      },
      criteria: [
        "System can accept a long URL and return a shortened version",
        "System can redirect users from short URL to original URL",
        "Frequently accessed URLs are served faster",
        "System remains available during traffic spikes",
        "URLs work consistently across all regions",
        "System prevents abuse and malicious URL spreading"
      ],
      learningsInMD: `
## Key Learnings
- Security in distributed systems
- Rate limiting strategies
- URL scanning and validation
- Abuse prevention techniques
      `,
      resources: {
        documentation: [
          {
            title: "Web Application Security",
            url: "https://owasp.org/www-project-top-ten/",
            description: "OWASP security best practices"
          }
        ],
        realWorldCases: [
          {
            name: "Firebase Dynamic Links",
            url: "https://firebase.google.com/products/dynamic-links",
            description: "Secure URL shortening with abuse prevention"
          }
        ],
        bestPractices: [
          {
            title: "Security Measures",
            description: "Implement rate limiting and URL scanning",
            example: "Use token bucket algorithm and VirusTotal API for URL scanning"
          }
        ]
      }
    }
  ],
  generalLearnings: [
    "Basic system design principles and client-server architecture",
    "Caching strategies and their implementation",
    "Load balancing and high availability patterns",
    "Multi-region architecture and data consistency",
    "Security considerations in distributed systems",
    "API design and REST principles",
    "Capacity planning and estimation",
    "Performance optimization techniques"
  ]
};

export default urlShortenerChallenge;
