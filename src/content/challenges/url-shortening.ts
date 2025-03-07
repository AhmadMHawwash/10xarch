import { type Challenge } from "./types";

const urlShortenerChallenge: Challenge = {
  slug: "url-shortener",
  title: "URL Shortener System Design",
  description: "Design a scalable URL shortening service that converts long URLs into short, unique identifiers while handling scaling challenges and ensuring reliability.",
  difficulty: "Easy",
  isFree: true,
  stages: [
    {
      problem: "Users need a way to convert their long URLs into shorter, more manageable versions that can be easily shared across platforms and social media.",
      requirements: [
        "Create a core service that lets users convert long URLs into short ones and redirect users to original URLs when they access the shortened links"
      ],
      metaRequirements: [
        "Create a core service that lets users convert long URLs into short ones and redirect users to original URLs when they access the shortened links"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider what characters should be allowed in the short URL (alphanumeric is common)",
            "Think about URL validation to ensure you're only shortening valid URLs",
            "Decide on how to generate unique codes (random vs. sequential)",
            "Consider whether shortened URLs should expire or remain valid indefinitely"
          ],
          nonFunctional: [
            "Consider the length of the shortened URL (shorter is better, but impacts the total number of URLs you can support)",
            "Think about URL readability and usability",
            "Consider collision handling when generating short codes"
          ]
        },
        systemAPI: [
          "Design REST endpoints for URL creation (POST) and redirection (GET)",
          "Consider what response codes and formats to use for different scenarios",
          "Think about input validation and error handling in your API",
          "Consider rate limiting to prevent abuse"
        ],
        capacityEstimations: {
          traffic: [
            "Estimate new URLs created per day (e.g., 100,000 new URLs)",
            "Estimate the read-to-write ratio (e.g., 10:1 or higher - redirection is more common than creation)",
            "Calculate requests per second for both creation and redirection"
          ],
          storage: [
            "Calculate storage needed per URL mapping (URL + short code + metadata)",
            "Project storage growth over time (1 year, 5 years)",
            "Consider database scaling requirements based on data volume"
          ],
          memory: [
            "Determine what data should be cached for performance (frequently accessed URLs)",
            "Estimate memory requirements for caching based on traffic patterns",
            "Consider in-memory data structures for URL validation and generation"
          ],
          bandwidth: [
            "Calculate bandwidth for URL creation requests",
            "Calculate bandwidth for redirection requests",
            "Consider network bottlenecks under load"
          ]
        },
        highLevelDesign: [
          "Start with a simple client-server architecture",
          "Decide on a database for storing URL mappings (relational vs. NoSQL)",
          "Consider the core components: web server, application logic, database",
          "Think about how URL redirection flow will work"
        ]
      },
      criteria: [
        "System can accept a long URL and return a shortened version",
        "System validates input URLs before shortening",
        "System generates unique short codes for each URL",
        "System redirects users from shortened URL to the original URL"
      ],
      learningsInMD: `
## Key Learnings

### System Design Fundamentals
- **Client-Server Architecture**: Understanding the basic interaction between clients (web browsers, mobile apps) and servers in a web service
- **RESTful API Design**: Designing clean, intuitive endpoints for URL shortening operations
- **Data Storage Fundamentals**: Choosing appropriate data structures and databases for URL mappings
- **URL Processing**: Techniques for validation, normalization, and handling of URLs

### Technical Concepts
- **Hash Functions vs. Counters**: Trade-offs between different methods of generating unique short codes
- **Database Schema Design**: Creating efficient schemas for URL storage and retrieval
- **HTTP Redirects**: Understanding how 301 vs 302 redirects impact SEO and caching
- **Input Validation**: Techniques for preventing invalid URLs and potential security issues

### Common Pitfalls
- **Collision Handling**: How to handle the case when two URLs generate the same short code
- **Database Indexing**: Ensuring efficient lookups by properly indexing URL mappings
- **URL Normalization**: Handling variations in URL formats (http vs https, www vs non-www)
      `,
      resources: {
        documentation: [
          {
            title: "RESTful API Design Best Practices",
            url: "https://docs.microsoft.com/en-us/azure/architecture/best-practices/api-design",
            description: "Comprehensive guide to designing effective RESTful APIs"
          },
          {
            title: "URL Standards and Specifications",
            url: "https://url.spec.whatwg.org/",
            description: "Official URL standard and parsing guidelines"
          }
        ],
        realWorldCases: [
          {
            name: "Bitly",
            url: "https://bitly.com/",
            description: "Popular URL shortening service with enterprise features and analytics"
          },
          {
            name: "TinyURL",
            url: "https://tinyurl.com/",
            description: "One of the original URL shorteners with simple interface"
          }
        ],
        bestPractices: [
          {
            title: "URL Validation",
            description: "Always validate URLs before shortening to prevent abuse and ensure functionality",
            example: "Check URL format, verify reachability (optionally), and scan for potential malicious links"
          },
          {
            title: "Short Code Generation",
            description: "Use a consistent method for generating short codes that balances uniqueness and length",
            example: "Base62 encoding of incremental IDs or MD5/SHA1 hashing with collision detection"
          }
        ]
      }
    },
    {
      problem: "As the service grows in popularity, users are reporting slow response times when accessing popular shortened URLs, affecting user experience.",
      requirements: [
        "Reduce access time to frequently accessed URLs"
      ],
      metaRequirements: [
        "Create a core service that lets users convert long URLs into short ones and redirect users to original URLs when they access the shortened links",
        "Reduce access time to frequently accessed URLs"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Implement a caching layer for frequently accessed URLs",
            "Consider tracking URL access patterns to optimize caching",
            "Add a mechanism to preload popular URLs into cache"
          ],
          nonFunctional: [
            "Set a target for redirect response time (e.g., < 100ms)",
            "Consider cache hit rate targets (e.g., > 90% for popular URLs)",
            "Think about cache freshness and consistency requirements"
          ]
        },
        systemAPI: [
          "Consider whether to expose cache status in API responses",
          "Think about how to handle cache misses efficiently",
          "Consider adding cache control headers for browsers"
        ],
        capacityEstimations: {
          traffic: [
            "Analyze what percentage of traffic goes to the most popular URLs (often follows Pareto principle - 80/20 rule)",
            "Estimate cache hit rates based on traffic patterns",
            "Calculate the peak traffic that can be served from cache"
          ],
          storage: [
            "Determine optimal cache size based on traffic analysis",
            "Calculate memory-to-disk ratio for caching different tiers of popularity",
            "Consider storage requirements for URL access analytics"
          ],
          memory: [
            "Calculate memory needed for in-memory caching tier",
            "Consider memory overhead of caching metadata (TTLs, access counts)",
            "Estimate memory requirements for cache eviction algorithms"
          ],
          bandwidth: [
            "Calculate reduced database load due to caching",
            "Estimate bandwidth savings from cache hits",
            "Consider network traffic between cache and database layers"
          ]
        },
        highLevelDesign: [
          "Add a caching layer between application and database",
          "Decide on appropriate caching solution (Redis, Memcached, in-memory)",
          "Consider cache eviction policies (LRU, LFU, FIFO)",
          "Design cache update/invalidation strategy"
        ]
      },
      criteria: [
        "System can accept a long URL and return a shortened version",
        "System validates input URLs before shortening",
        "System generates unique short codes for each URL",
        "System redirects users from shortened URL to the original URL",
        "Popular URLs are served from cache with significantly reduced latency",
        "System implements an appropriate cache eviction policy"
      ],
      learningsInMD: `
## Key Learnings

### Caching Fundamentals
- **Cache Placement**: Understanding where to place caches in the system architecture
- **Cache Eviction Policies**: Learning the trade-offs between LRU, LFU, FIFO and when to use each
- **Cache Consistency Models**: Balancing performance with data freshness
- **Tiered Caching**: Implementing multiple cache layers for different access patterns

### Performance Optimization
- **Read-Heavy Workload Optimization**: Techniques specific to read-dominated systems
- **Memory vs. Disk Trade-offs**: Understanding when to use in-memory vs. persistent caching
- **Hot Spot Identification**: Techniques for identifying and optimizing for access patterns
- **Response Time Analysis**: Methods for measuring and optimizing latency

### Cache Implementation
- **Cache Key Design**: Creating effective cache keys for URL data
- **Time-To-Live (TTL) Strategies**: Setting appropriate expiration times
- **Write-Through vs. Write-Behind Caching**: Understanding different cache update patterns
- **Cache Warming**: Techniques for preloading caches to prevent cold starts
      `,
      resources: {
        documentation: [
          {
            title: "Caching Best Practices",
            url: "https://aws.amazon.com/caching/best-practices/",
            description: "Comprehensive guide to implementing effective caching strategies"
          },
          {
            title: "Redis Documentation",
            url: "https://redis.io/documentation",
            description: "Official documentation for Redis, a popular in-memory data store"
          }
        ],
        realWorldCases: [
          {
            name: "Cloudflare",
            url: "https://www.cloudflare.com/",
            description: "Global CDN that implements advanced caching techniques for web content"
          },
          {
            name: "Pinterest",
            url: "https://medium.com/pinterest-engineering/how-we-scaled-pinterest-from-0-to-10s-of-billions-of-page-views-a-month-and-more-3f96eb4393a5",
            description: "Case study on how Pinterest scaled their systems with effective caching"
          }
        ],
        bestPractices: [
          {
            title: "Cache Hit Ratio Monitoring",
            description: "Continuously monitor cache hit rates to optimize caching strategy",
            example: "Set up metrics to track hit/miss ratios and adjust TTLs or cache size based on data"
          },
          {
            title: "Intelligent Caching",
            description: "Implement predictive caching based on usage patterns",
            example: "Cache URLs that show rapidly increasing popularity, not just currently popular ones"
          }
        ]
      }
    },
    {
      problem: "The service is experiencing downtime during traffic spikes, especially when popular content gets shared widely, causing frustrated users and lost traffic.",
      requirements: [
        "Ensure system availability during high traffic periods"
      ],
      metaRequirements: [
        "Create a core service that lets users convert long URLs into short ones and redirect users to original URLs when they access the shortened links",
        "Reduce access time to frequently accessed URLs",
        "Ensure system availability during high traffic periods"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Implement horizontal scaling for web servers",
            "Add load balancing to distribute traffic evenly",
            "Consider stateless architecture for easy scaling"
          ],
          nonFunctional: [
            "Set an availability target (e.g., 99.9% uptime)",
            "Define maximum acceptable latency during traffic spikes",
            "Consider graceful degradation strategies"
          ]
        },
        systemAPI: [
          "Design APIs to be resilient to partial system failures",
          "Implement appropriate status codes for service degradation",
          "Consider rate limiting and throttling mechanisms"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate normal vs. peak traffic ratios",
            "Estimate viral coefficient for traffic spikes",
            "Determine scale factor needed for peak handling"
          ],
          storage: [
            "Consider read replicas for database scaling",
            "Calculate storage needs across multiple instances",
            "Think about data partitioning strategies"
          ],
          memory: [
            "Estimate memory requirements across scaled instances",
            "Consider shared vs. local caching strategies",
            "Calculate cache synchronization overhead"
          ],
          bandwidth: [
            "Estimate inter-service communication bandwidth",
            "Calculate load balancer bandwidth requirements",
            "Consider network capacity between components"
          ]
        },
        highLevelDesign: [
          "Add load balancers in front of application servers",
          "Design for horizontal scaling of web and application tiers",
          "Consider database replication and sharding",
          "Implement health checking and automatic recovery"
        ]
      },
      criteria: [
        "System can accept a long URL and return a shortened version",
        "System validates input URLs before shortening",
        "System generates unique short codes for each URL",
        "System redirects users from shortened URL to the original URL",
        "Popular URLs are served from cache with significantly reduced latency",
        "System implements an appropriate cache eviction policy",
        "System maintains availability during traffic spikes",
        "System distributes load effectively across multiple instances"
      ],
      learningsInMD: `
## Key Learnings

### High Availability Architecture
- **Horizontal Scaling**: Techniques for scaling out instead of up
- **Load Balancing Strategies**: Round-robin, least connections, and dynamic algorithms
- **Stateless Design**: Benefits of stateless architecture for scalability
- **Failure Domains**: Isolating failures to prevent system-wide outages

### Resilience Patterns
- **Circuit Breaker Pattern**: Preventing cascading failures in distributed systems
- **Bulkhead Pattern**: Isolating system components to contain failures
- **Retry and Backoff Strategies**: Gracefully handling transient failures
- **Health Checking**: Implementing effective monitoring and auto-recovery

### Scalability Techniques
- **Autoscaling**: Dynamically adjusting resources based on load
- **Database Read Replicas**: Scaling read operations across multiple databases
- **Connection Pooling**: Efficiently managing database connections
- **Microservices vs. Monolith**: Trade-offs in system architecture for scalability
      `,
      resources: {
        documentation: [
          {
            title: "Scalability Patterns",
            url: "https://docs.microsoft.com/en-us/azure/architecture/patterns/category/performance-scalability",
            description: "Common architecture patterns for building scalable systems"
          },
          {
            title: "Load Balancing Fundamentals",
            url: "https://www.nginx.com/resources/glossary/load-balancing/",
            description: "Comprehensive guide to load balancing concepts and implementation"
          }
        ],
        realWorldCases: [
          {
            name: "Netflix",
            url: "https://netflixtechblog.com/netflix-chaos-monkey-upgraded-1d679429be5d",
            description: "How Netflix ensures high availability through chaos engineering"
          },
          {
            name: "GitHub",
            url: "https://github.blog/2017-10-20-building-resilience-in-spokes/",
            description: "GitHub's approach to building resilient distributed systems"
          }
        ],
        bestPractices: [
          {
            title: "Auto-scaling Configuration",
            description: "Set up auto-scaling with appropriate thresholds and cool-down periods",
            example: "Scale out when CPU utilization exceeds 70% for 3 minutes, scale in when below 30% for 10 minutes"
          },
          {
            title: "Failover Testing",
            description: "Regularly test system behavior during component failures",
            example: "Implement chaos engineering principles by randomly shutting down instances"
          }
        ]
      }
    },
    {
      problem: "Analytics team needs data on URL usage patterns, but collecting this data is causing performance issues and additional load on the core system.",
      requirements: [
        "Implement analytics without impacting core service performance"
      ],
      metaRequirements: [
        "Create a core service that lets users convert long URLs into short ones and redirect users to original URLs when they access the shortened links",
        "Reduce access time to frequently accessed URLs",
        "Ensure system availability during high traffic periods",
        "Implement analytics without impacting core service performance"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Collect data on URL access patterns (click counts, geographic distribution, time patterns)",
            "Implement asynchronous processing for analytics data",
            "Consider event-driven architecture for analytics"
          ],
          nonFunctional: [
            "Ensure analytics processing doesn't affect redirect latency",
            "Consider eventual consistency for analytics data",
            "Set SLAs for analytics data freshness"
          ]
        },
        systemAPI: [
          "Design endpoints for retrieving analytics data",
          "Consider batch vs. real-time analytics APIs",
          "Think about analytics data granularity and aggregation"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate analytics event volume (potentially 1:1 with redirects)",
            "Estimate query patterns for analytics data",
            "Consider peak analytics processing requirements"
          ],
          storage: [
            "Calculate storage for raw analytics events",
            "Estimate storage for aggregated analytics data",
            "Consider data retention policies and growth"
          ],
          memory: [
            "Estimate memory needs for analytics processing",
            "Consider caching requirements for common analytics queries",
            "Think about in-memory processing vs. disk-based analytics"
          ],
          bandwidth: [
            "Calculate bandwidth for analytics event streaming",
            "Estimate network load for analytics queries",
            "Consider data transfer between analytics and core systems"
          ]
        },
        highLevelDesign: [
          "Implement message queue for decoupling analytics collection from processing",
          "Consider stream processing for real-time analytics",
          "Design separate data stores for analytics and URL mapping",
          "Think about data ETL processes for analytics aggregation"
        ]
      },
      criteria: [
        "System can accept a long URL and return a shortened version",
        "System validates input URLs before shortening",
        "System generates unique short codes for each URL",
        "System redirects users from shortened URL to the original URL",
        "Popular URLs are served from cache with significantly reduced latency",
        "System implements an appropriate cache eviction policy",
        "System maintains availability during traffic spikes",
        "System distributes load effectively across multiple instances",
        "System collects analytics data without impacting core service performance",
        "Analytics data is accessible through dedicated APIs"
      ],
      learningsInMD: `
## Key Learnings

### Event-Driven Architecture
- **Message Queues**: Using queues to decouple system components
- **Event Sourcing**: Recording all state changes as a sequence of events
- **Pub/Sub Patterns**: Implementing publisher-subscriber models for data distribution
- **Stream Processing**: Handling continuous data streams for real-time analytics

### Analytics System Design
- **Data Warehousing vs. Data Lakes**: Choosing appropriate analytics storage
- **OLTP vs. OLAP**: Understanding transactional vs. analytical processing
- **ETL Processes**: Extracting, transforming, and loading data for analytics
- **Data Partitioning Strategies**: Organizing analytics data for efficient queries

### System Decoupling
- **Service Boundaries**: Defining clear interfaces between components
- **Eventual Consistency**: Understanding when real-time consistency isn't required
- **Backpressure Handling**: Managing overload in distributed systems
- **Asynchronous Processing**: Benefits and challenges of async architectures
      `,
      resources: {
        documentation: [
          {
            title: "Event-Driven Architecture",
            url: "https://docs.microsoft.com/en-us/azure/architecture/guide/architecture-styles/event-driven",
            description: "Guide to implementing event-driven architectures"
          },
          {
            title: "Stream Processing with Apache Kafka",
            url: "https://kafka.apache.org/documentation/streams/",
            description: "Documentation for implementing stream processing"
          }
        ],
        realWorldCases: [
          {
            name: "Segment",
            url: "https://segment.com/blog/rebuilding-our-infrastructure/",
            description: "How Segment rebuilt their analytics infrastructure for scale"
          },
          {
            name: "LinkedIn",
            url: "https://engineering.linkedin.com/blog/2016/12/apache-kafka-at-scale-at-linkedin",
            description: "LinkedIn's implementation of Kafka for analytics at scale"
          }
        ],
        bestPractices: [
          {
            title: "Analytics Data Modeling",
            description: "Design analytics schemas for query efficiency rather than storage efficiency",
            example: "Use star or snowflake schema designs for dimensional analytics data"
          },
          {
            title: "Asynchronous Processing",
            description: "Implement reliable async processing with appropriate failure handling",
            example: "Use dead-letter queues and retry mechanisms for failed analytics events"
          }
        ]
      }
    },
    {
      problem: "Some users are creating shortened URLs for malicious websites, and the service is being used to spread phishing attacks and malware.",
      requirements: [
        "Implement security measures to detect and prevent abuse"
      ],
      metaRequirements: [
        "Create a core service that lets users convert long URLs into short ones and redirect users to original URLs when they access the shortened links",
        "Reduce access time to frequently accessed URLs",
        "Ensure system availability during high traffic periods",
        "Implement analytics without impacting core service performance",
        "Implement security measures to detect and prevent abuse"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Implement URL scanning and reputation checking",
            "Add rate limiting and abuse detection",
            "Consider user verification for URL creation"
          ],
          nonFunctional: [
            "Balance security measures with performance",
            "Set acceptable false positive/negative rates",
            "Consider privacy implications of URL scanning"
          ]
        },
        systemAPI: [
          "Design API for reporting malicious URLs",
          "Implement rate limit headers and response codes",
          "Consider APIs for checking URL status before redirection"
        ],
        capacityEstimations: {
          traffic: [
            "Estimate percentage of malicious URL attempts",
            "Calculate overhead of security scanning",
            "Consider impact of rate limiting on legitimate traffic"
          ],
          storage: [
            "Calculate storage for URL reputation data",
            "Estimate space needed for security audit logs",
            "Consider blocklist/allowlist storage requirements"
          ],
          memory: [
            "Estimate memory for rate limiting counters",
            "Calculate cache requirements for reputation data",
            "Consider in-memory blocklist for known malicious URLs"
          ],
          bandwidth: [
            "Calculate bandwidth for external security service calls",
            "Estimate network overhead for security checks",
            "Consider impact on overall system bandwidth"
          ]
        },
        highLevelDesign: [
          "Add security scanning service in the URL creation flow",
          "Implement rate limiters at API gateway level",
          "Consider integration with external threat intelligence services",
          "Design security logging and monitoring components"
        ]
      },
      criteria: [
        "System can accept a long URL and return a shortened version",
        "System validates input URLs before shortening",
        "System generates unique short codes for each URL",
        "System redirects users from shortened URL to the original URL",
        "Popular URLs are served from cache with significantly reduced latency",
        "System implements an appropriate cache eviction policy",
        "System maintains availability during traffic spikes",
        "System distributes load effectively across multiple instances",
        "System collects analytics data without impacting core service performance",
        "Analytics data is accessible through dedicated APIs",
        "System detects and prevents creation of malicious shortened URLs",
        "System implements rate limiting to prevent abuse"
      ],
      learningsInMD: `
## Key Learnings

### Security in Distributed Systems
- **Defense in Depth**: Implementing multiple layers of security controls
- **Rate Limiting Algorithms**: Token bucket, leaky bucket, and fixed window algorithms
- **Threat Detection**: Techniques for identifying malicious activity
- **Security vs. Performance**: Balancing security measures with user experience

### Abuse Prevention
- **URL Reputation Systems**: Using threat intelligence to identify malicious URLs
- **CAPTCHA and Challenge Systems**: Preventing automated abuse
- **Progressive Security Measures**: Escalating security based on risk levels
- **IP and User-Agent Analysis**: Detecting suspicious patterns

### Web Security Fundamentals
- **Phishing Prevention**: Techniques for preventing abuse for phishing
- **Content Security Policies**: Implementing CSP headers for redirection
- **Safe Browsing Integration**: Using services like Google Safe Browsing
- **Real-time Threat Intelligence**: Maintaining up-to-date security information
      `,
      resources: {
        documentation: [
          {
            title: "OWASP Security Practices",
            url: "https://owasp.org/www-project-top-ten/",
            description: "Top web application security risks and preventions"
          },
          {
            title: "Rate Limiting Patterns",
            url: "https://cloud.google.com/architecture/rate-limiting-strategies-techniques",
            description: "Strategies and techniques for implementing rate limiting"
          }
        ],
        realWorldCases: [
          {
            name: "Google Safe Browsing",
            url: "https://safebrowsing.google.com/",
            description: "How Google detects and warns users about malicious websites"
          },
          {
            name: "Cloudflare",
            url: "https://blog.cloudflare.com/the-csam-scanning-system/",
            description: "Cloudflare's approach to detecting and preventing malicious content"
          }
        ],
        bestPractices: [
          {
            title: "Multi-layer Security",
            description: "Implement security at multiple layers of the system",
            example: "Combine URL reputation checking, rate limiting, and user verification"
          },
          {
            title: "Progressive Security",
            description: "Increase security measures based on risk assessment",
            example: "Start with basic checks for all users, add more verification for suspicious patterns"
          }
        ]
      }
    }
  ],
  generalLearnings: [
    "Fundamentals of client-server architecture and RESTful API design",
    "Data storage and retrieval optimization techniques",
    "Caching strategies and implementation for performance improvement",
    "Horizontal scaling and load balancing for high availability",
    "Event-driven architecture for system decoupling",
    "Analytics systems design and integration",
    "Security measures and abuse prevention in web services",
    "Performance optimization and monitoring practices",
    "Database selection and scaling considerations",
    "Capacity planning and estimation techniques"
  ]
};

export default urlShortenerChallenge;
