import { type Challenge } from "./types";

const rideShareChallenge: Challenge = {
  slug: "ride-sharing-system",
  title: "Ride Sharing System Design",
  description: "Design a scalable ride-sharing platform focusing on real-time matching, geo-distribution, and reliability. Progress from basic ride matching to advanced features handling millions of concurrent users.",
  difficulty: "Hard",
  isFree: false,
  stages: [
    {
      problem: "Users need to request rides and get matched with nearby drivers in real-time",
      requirements: [
        "Users should be able to request rides and get matched with available drivers within their vicinity"
      ],
      metaRequirements: [
        "Users should be able to request rides and get matched with available drivers within their vicinity"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider how to store and query driver locations efficiently",
            "Think about the matching algorithm's criteria (distance, rating, etc.)",
            "Consider real-time location updates from drivers"
          ],
          nonFunctional: [
            "Response time is critical for user experience",
            "System needs to handle location data with precision",
            "Consider data consistency with real-time updates"
          ]
        },
        systemAPI: [
          "Design APIs for ride requests",
          "Consider WebSocket connections for real-time updates",
          "Think about location update frequency and format"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate requests per second based on active users",
            "Consider peak hours vs normal operation"
          ],
          storage: [
            "Estimate size of user and driver profiles",
            "Consider location history retention requirements"
          ],
          memory: [
            "Calculate active driver location cache size",
            "Consider session data requirements"
          ],
          bandwidth: [
            "Calculate size of location update packets",
            "Consider frequency of location updates"
          ]
        },
        highLevelDesign: [
          "Consider using a geo-spatial database for location queries",
          "Think about real-time messaging system for updates",
          "Consider request/response flow for ride matching"
        ]
      },
      criteria: [
        "System can store and update driver locations",
        "System can match riders with nearby drivers",
        "System maintains real-time location tracking",
        "API endpoints handle basic ride requests"
      ],
      learningsInMD: `
## Key Learnings
- Geo-spatial data storage and querying
- Real-time system design principles
- Basic matching algorithms
- Location data handling
- WebSocket vs HTTP for real-time updates

### System Design Patterns
- Publisher/Subscriber for real-time updates
- Geohashing for location queries
- Event-driven architecture basics`,
      resources: {
        documentation: [
          {
            title: "Geohashing",
            url: "https://en.wikipedia.org/wiki/Geohash",
            description: "Understanding geohashing for location-based queries"
          }
        ],
        realWorldCases: [
          {
            name: "Uber's Marketplace",
            url: "https://eng.uber.com/marketplace-real-time-pricing/",
            description: "How Uber handles real-time matching and pricing"
          }
        ],
        bestPractices: [
          {
            title: "Location Data Storage",
            description: "Store location data in a format optimized for range queries",
            example: "Using geohash prefixes for quick area searches"
          }
        ]
      }
    },
    {
      problem: "System is experiencing slow response times during peak hours",
      requirements: [
        "Reduce ride matching response time to handle increased load during rush hours"
      ],
      metaRequirements: [
        "Users should be able to request rides and get matched with available drivers within their vicinity",
        "Reduce ride matching response time to handle increased load during rush hours"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider caching frequently accessed areas",
            "Think about batch processing vs real-time updates",
            "Consider pre-computing some matching data"
          ],
          nonFunctional: [
            "System should handle sudden traffic spikes",
            "Consider availability requirements",
            "Think about data consistency requirements"
          ]
        },
        systemAPI: [
          "Consider API rate limiting strategies",
          "Think about batch APIs for location updates",
          "Consider API versioning for updates"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate peak hour request patterns",
            "Estimate traffic growth patterns"
          ],
          storage: [
            "Calculate cache size requirements",
            "Estimate data growth rate"
          ],
          memory: [
            "Calculate memory requirements for caching",
            "Consider cache eviction policies"
          ],
          bandwidth: [
            "Estimate peak bandwidth requirements",
            "Calculate data transfer costs"
          ]
        },
        highLevelDesign: [
          "Consider implementing a caching layer",
          "Think about load balancing strategies",
          "Consider service discovery mechanisms"
        ]
      },
      criteria: [
        "System maintains performance during peak hours",
        "Cache hit rate meets target metrics",
        "Load balancer effectively distributes traffic",
        "Response times meet SLA requirements"
      ],
      learningsInMD: `
## Key Learnings
- Caching strategies for location data
- Load balancing techniques
- Service discovery patterns
- Performance optimization techniques
- Handling peak traffic scenarios

### System Design Patterns
- Cache-aside pattern
- Load balancer algorithms
- Service registry pattern`,
      resources: {
        documentation: [
          {
            title: "Caching Strategies",
            url: "https://docs.aws.amazon.com/whitepapers/latest/database-caching-strategies/caching-patterns.html",
            description: "Different caching patterns and their use cases"
          }
        ],
        realWorldCases: [
          {
            name: "Lyft's Scaling Story",
            url: "https://eng.lyft.com/how-lyft-scaled-their-business-intelligence-infrastructure-16d743e31897",
            description: "How Lyft handled their scaling challenges"
          }
        ],
        bestPractices: [
          {
            title: "Cache Design",
            description: "Implement appropriate cache eviction policies",
            example: "Using LRU for driver location caches"
          }
        ]
      }
    },
    {
      problem: "Users are experiencing inconsistent pricing and availability information",
      requirements: [
        "Implement consistent pricing and real-time availability across all regions"
      ],
      metaRequirements: [
        "Users should be able to request rides and get matched with available drivers within their vicinity",
        "Reduce ride matching response time to handle increased load during rush hours",
        "Implement consistent pricing and real-time availability across all regions"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider consistency models for pricing",
            "Think about regional pricing variations",
            "Consider surge pricing mechanisms"
          ],
          nonFunctional: [
            "System should maintain price consistency",
            "Consider regional data consistency",
            "Think about failover scenarios"
          ]
        },
        systemAPI: [
          "Design APIs for price calculation",
          "Consider versioning for pricing changes",
          "Think about regional API routing"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate pricing update frequency",
            "Estimate regional traffic distribution"
          ],
          storage: [
            "Calculate pricing rules storage needs",
            "Estimate regional data storage requirements"
          ],
          memory: [
            "Calculate cache size for pricing rules",
            "Consider regional cache requirements"
          ],
          bandwidth: [
            "Estimate cross-region communication needs",
            "Calculate pricing update broadcast size"
          ]
        },
        highLevelDesign: [
          "Consider distributed consensus mechanisms",
          "Think about regional data centers",
          "Consider event sourcing for pricing history"
        ]
      },
      criteria: [
        "Pricing is consistent across regions",
        "System handles regional failures gracefully",
        "Pricing updates propagate within SLA",
        "System maintains availability during updates"
      ],
      learningsInMD: `
## Key Learnings
- Distributed systems consistency
- Regional deployment strategies
- Event sourcing patterns
- Pricing system design
- Failure handling in distributed systems

### System Design Patterns
- Event sourcing
- CQRS for pricing updates
- Regional failover patterns`,
      resources: {
        documentation: [
          {
            title: "Distributed Systems",
            url: "https://martinfowler.com/articles/distributed-systems-intro.html",
            description: "Introduction to distributed systems concepts"
          }
        ],
        realWorldCases: [
          {
            name: "Uber's Surge Pricing",
            url: "https://eng.uber.com/engineering-surge-pricing/",
            description: "How Uber implements surge pricing"
          }
        ],
        bestPractices: [
          {
            title: "Pricing Consistency",
            description: "Implement eventual consistency with clear boundaries",
            example: "Using event sourcing for price changes"
          }
        ]
      }
    },
    {
      problem: "System needs to handle multiple regions with different regulations and payment methods",
      requirements: [
        "Support region-specific regulations and multiple payment systems while maintaining system consistency"
      ],
      metaRequirements: [
        "Users should be able to request rides and get matched with available drivers within their vicinity",
        "Reduce ride matching response time to handle increased load during rush hours",
        "Implement consistent pricing and real-time availability across all regions",
        "Support region-specific regulations and multiple payment systems while maintaining system consistency"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider different payment integrations",
            "Think about regulatory compliance",
            "Consider regional business rules"
          ],
          nonFunctional: [
            "System should maintain payment security",
            "Consider regulatory compliance requirements",
            "Think about payment processing SLAs"
          ]
        },
        systemAPI: [
          "Design payment gateway interfaces",
          "Consider regulatory reporting APIs",
          "Think about payment method validation"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate payment transaction volume",
            "Estimate regulatory reporting frequency"
          ],
          storage: [
            "Calculate payment data retention needs",
            "Estimate compliance data storage"
          ],
          memory: [
            "Calculate payment processing cache needs",
            "Consider session token requirements"
          ],
          bandwidth: [
            "Estimate payment gateway traffic",
            "Calculate regulatory data transfer needs"
          ]
        },
        highLevelDesign: [
          "Consider payment service architecture",
          "Think about compliance monitoring",
          "Consider audit logging system"
        ]
      },
      criteria: [
        "System supports multiple payment methods",
        "Regulatory compliance is maintained",
        "Payment processing meets SLA",
        "Audit trails are maintained"
      ],
      learningsInMD: `
## Key Learnings
- Payment system integration
- Regulatory compliance in distributed systems
- Multi-region deployment strategies
- Audit logging and monitoring
- Security in payment processing

### System Design Patterns
- Gateway pattern for payments
- Audit logging patterns
- Compliance monitoring patterns`,
      resources: {
        documentation: [
          {
            title: "Payment Gateway Integration",
            url: "https://stripe.com/docs/payments/design",
            description: "Best practices for payment system design"
          }
        ],
        realWorldCases: [
          {
            name: "Grab's Payment Platform",
            url: "https://engineering.grab.com/building-grab-pay",
            description: "How Grab built their payment platform"
          }
        ],
        bestPractices: [
          {
            title: "Payment Processing",
            description: "Implement idempotency for payment transactions",
            example: "Using unique transaction IDs for retry handling"
          }
        ]
      }
    },
    {
      problem: "Need to implement advanced safety features and fraud detection",
      requirements: [
        "Implement real-time safety monitoring and fraud detection systems"
      ],
      metaRequirements: [
        "Users should be able to request rides and get matched with available drivers within their vicinity",
        "Reduce ride matching response time to handle increased load during rush hours",
        "Implement consistent pricing and real-time availability across all regions",
        "Support region-specific regulations and multiple payment systems while maintaining system consistency",
        "Implement real-time safety monitoring and fraud detection systems"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider real-time route monitoring",
            "Think about fraud detection rules",
            "Consider emergency response system"
          ],
          nonFunctional: [
            "System should process safety alerts quickly",
            "Consider false positive rates",
            "Think about emergency response time"
          ]
        },
        systemAPI: [
          "Design safety monitoring APIs",
          "Consider emergency notification system",
          "Think about fraud alert APIs"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate safety check frequency",
            "Estimate fraud detection throughput"
          ],
          storage: [
            "Calculate safety log storage needs",
            "Estimate fraud pattern storage"
          ],
          memory: [
            "Calculate real-time monitoring needs",
            "Consider pattern matching requirements"
          ],
          bandwidth: [
            "Estimate safety alert bandwidth",
            "Calculate monitoring data volume"
          ]
        },
        highLevelDesign: [
          "Consider real-time monitoring architecture",
          "Think about machine learning pipeline",
          "Consider emergency response system"
        ]
      },
      criteria: [
        "Safety monitoring system is operational",
        "Fraud detection meets accuracy targets",
        "Emergency response system meets SLA",
        "False positive rate is within limits"
      ],
      learningsInMD: `
## Key Learnings
- Real-time monitoring systems
- Fraud detection patterns
- Emergency response systems
- Machine learning pipeline design
- Safety system architecture

### System Design Patterns
- Stream processing
- Real-time analytics
- Emergency notification patterns`,
      resources: {
        documentation: [
          {
            title: "Real-time Processing",
            url: "https://docs.confluent.io/platform/current/streams/concepts.html",
            description: "Stream processing concepts and patterns"
          }
        ],
        realWorldCases: [
          {
            name: "Uber's Safety System",
            url: "https://eng.uber.com/real-time-safety",
            description: "How Uber implements safety features"
          }
        ],
        bestPractices: [
          {
            title: "Safety Monitoring",
            description: "Implement real-time alerts with fallback mechanisms",
            example: "Using redundant notification systems"
          }
        ]
      }
    }
  ],
  generalLearnings: [
    "Designing scalable real-time systems",
    "Handling geo-distributed data",
    "Implementing consistent pricing in distributed systems",
    "Managing multi-region deployments",
    "Building reliable payment processing systems",
    "Implementing safety and fraud detection systems",
    "Handling regulatory compliance in global systems",
    "Designing for high availability and fault tolerance",
    "Implementing caching strategies for performance",
    "Building event-driven architectures"
  ]
};

export default rideShareChallenge;