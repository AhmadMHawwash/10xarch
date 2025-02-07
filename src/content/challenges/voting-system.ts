import { type Challenge } from "./types";

const challenge: Challenge = {
  slug: "real-time-voting-system",
  title: "Real-Time Voting System Design",
  description: "Design a scalable real-time voting system that allows users to create polls, cast votes, and see live results. Focus on real-time updates, data consistency, and handling concurrent votes.",
  difficulty: "Medium",
  isFree: true,
  stages: [
    {
      problem: "Users need to create polls and collect votes, but currently, voters have to refresh the page to see results.",
      requirements: [
        "Create a system that allows real-time vote updates without page refresh"
      ],
      metaRequirements: [
        "Create a system that allows real-time vote updates without page refresh"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider how to push updates to clients when votes change",
            "Think about maintaining vote count accuracy during concurrent voting"
          ],
          nonFunctional: [
            "Consider the latency between vote casting and result updates",
            "Think about consistency requirements for vote counts"
          ]
        },
        systemAPI: [
          "Consider WebSocket vs Server-Sent Events for real-time updates",
          "Think about REST endpoints for creating polls and casting votes"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate peak voting rates during high-traffic events",
            "Consider number of concurrent poll viewers"
          ],
          storage: [
            "Calculate storage needed for active polls and vote history",
            "Consider data retention requirements"
          ],
          memory: [
            "Estimate memory needed for active poll data",
            "Consider caching strategies for popular polls"
          ],
          bandwidth: [
            "Calculate bandwidth for vote broadcasting",
            "Consider payload size for real-time updates"
          ]
        },
        highLevelDesign: [
          "Consider pub/sub pattern for vote distribution",
          "Think about separating vote processing from result broadcasting"
        ]
      },
      criteria: [
        "System updates vote counts in real-time",
        "Updates are received within 2 seconds of votes being cast",
        "Vote counts remain accurate under concurrent voting"
      ],
      learningsInMD: `
# Key Learnings

## Real-Time Communication
- Understanding WebSocket vs SSE tradeoffs
- Managing persistent connections at scale
- Implementing pub/sub patterns

## Data Consistency
- Handling concurrent vote operations
- Maintaining accurate vote counts
- Managing eventual consistency in distributed systems

## Performance
- Efficient real-time broadcast patterns
- Connection pooling strategies
- Optimizing update payload size
      `,
      resources: {
        documentation: [
          {
            title: "WebSocket API",
            url: "https://developer.mozilla.org/en-US/docs/Web/API/WebSocket",
            description: "Understanding WebSocket protocol for real-time communication"
          },
          {
            title: "Server-Sent Events",
            url: "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events",
            description: "Alternative to WebSocket for server-to-client updates"
          }
        ],
        realWorldCases: [
          {
            name: "Twitter Polls",
            url: "https://blog.twitter.com/engineering/en_us/topics/infrastructure/2019/real-time-polling",
            description: "How Twitter handles real-time poll updates at scale"
          }
        ],
        bestPractices: [
          {
            title: "Connection Management",
            description: "Implement heartbeat mechanisms to detect stale connections",
            example: "Send ping frame every 30 seconds, close connection if no pong received"
          }
        ]
      }
    },
    {
      problem: "During popular events, the system becomes slow and sometimes shows incorrect vote counts.",
      requirements: [
        "Scale the system to handle high-concurrent voting while maintaining consistency"
      ],
      metaRequirements: [
        "Create a system that allows real-time updates without page refresh",
        "Scale the system to handle high-concurrent voting while maintaining consistency"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider how to handle vote counting across multiple servers",
            "Think about vote validation and deduplication"
          ],
          nonFunctional: [
            "Consider consistency vs availability tradeoffs",
            "Think about system behavior during network partitions"
          ]
        },
        systemAPI: [
          "Consider batch vote processing APIs",
          "Think about rate limiting strategies"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate votes per second during viral events",
            "Consider fan-out ratio for popular polls"
          ],
          storage: [
            "Estimate storage growth during peak events",
            "Consider sharding strategies"
          ],
          memory: [
            "Calculate memory needed for vote counting",
            "Consider distributed caching requirements"
          ],
          bandwidth: [
            "Calculate broadcast bandwidth during peak times",
            "Consider update batching strategies"
          ]
        },
        highLevelDesign: [
          "Consider message queue for vote processing",
          "Think about data partitioning strategies"
        ]
      },
      criteria: [
        "System maintains accurate counts under high load",
        "Vote processing latency remains under 5 seconds during peak",
        "System recovers gracefully from node failures"
      ],
      learningsInMD: `
# Key Learnings

## Distributed Systems
- Handling data consistency across nodes
- Implementing distributed counters
- Managing system partitions

## Scalability Patterns
- Message queue architectures
- Data sharding strategies
- Load balancing approaches

## Performance Optimization
- Batch processing patterns
- Caching strategies
- Connection pooling
      `,
      resources: {
        documentation: [
          {
            title: "Distributed Systems",
            url: "https://martinfowler.com/articles/patterns-of-distributed-systems/",
            description: "Patterns for building reliable distributed systems"
          }
        ],
        realWorldCases: [
          {
            name: "Reddit's Voting System",
            url: "https://www.reddit.com/r/programming/comments/voting-system-architecture",
            description: "How Reddit handles millions of votes"
          }
        ],
        bestPractices: [
          {
            title: "Vote Processing",
            description: "Use atomic operations for vote counting",
            example: "Implement distributed counters using Redis INCR"
          }
        ]
      }
    },
    {
      problem: "Users complain about duplicate votes and some votes not being counted.",
      requirements: [
        "Implement vote validation and deduplication while maintaining performance"
      ],
      metaRequirements: [
        "Create a system that allows real-time updates without page refresh",
        "Scale the system to handle high-concurrent voting while maintaining consistency",
        "Implement vote validation and deduplication while maintaining performance"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider user authentication methods",
            "Think about vote tampering prevention"
          ],
          nonFunctional: [
            "Consider validation latency impact",
            "Think about storage requirements for vote history"
          ]
        },
        systemAPI: [
          "Consider validation middleware design",
          "Think about audit trail APIs"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate validation overhead per vote",
            "Consider impact on vote processing time"
          ],
          storage: [
            "Estimate storage for vote history",
            "Consider cleanup strategies"
          ],
          memory: [
            "Calculate cache size for active voter sessions",
            "Consider bloom filter size for deduplication"
          ],
          bandwidth: [
            "Calculate increased payload size with validation",
            "Consider compressed history transfer"
          ]
        },
        highLevelDesign: [
          "Consider bloom filters for quick duplication check",
          "Think about session management architecture"
        ]
      },
      criteria: [
        "System prevents duplicate votes effectively",
        "Vote validation adds less than 100ms latency",
        "System maintains audit trail of all votes"
      ],
      learningsInMD: `
# Key Learnings

## Data Integrity
- Implementing efficient deduplication
- Managing user sessions
- Building audit trails

## Security
- Vote validation strategies
- Rate limiting approaches
- Authentication patterns

## Performance Optimization
- Bloom filter usage
- Efficient validation pipelines
- Storage optimization
      `,
      resources: {
        documentation: [
          {
            title: "Bloom Filters",
            url: "https://llimllib.github.io/bloomfilter-tutorial/",
            description: "Understanding Bloom filters for deduplication"
          }
        ],
        realWorldCases: [
          {
            name: "Facebook's Voting System",
            url: "https://engineering.fb.com/2021/07/27/security/voting-integrity",
            description: "How Facebook prevents vote manipulation"
          }
        ],
        bestPractices: [
          {
            title: "Deduplication",
            description: "Use Bloom filters for first-pass duplicate detection",
            example: "Implement two-stage validation: Bloom filter then database check"
          }
        ]
      }
    },
    {
      problem: "International users experience high latency when voting.",
      requirements: [
        "Optimize the system for global access and reduce latency for international users"
      ],
      metaRequirements: [
        "Create a system that allows real-time updates without page refresh",
        "Scale the system to handle high-concurrent voting while maintaining consistency",
        "Implement vote validation and deduplication while maintaining performance",
        "Optimize the system for global access and reduce latency for international users"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider regional vote processing",
            "Think about data synchronization across regions"
          ],
          nonFunctional: [
            "Consider regional latency requirements",
            "Think about consistency across regions"
          ]
        },
        systemAPI: [
          "Consider region-aware routing",
          "Think about global aggregation APIs"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate traffic distribution by region",
            "Consider peak times across time zones"
          ],
          storage: [
            "Estimate regional storage requirements",
            "Consider replication overhead"
          ],
          memory: [
            "Calculate cache size per region",
            "Consider cache synchronization overhead"
          ],
          bandwidth: [
            "Calculate cross-region synchronization bandwidth",
            "Consider CDN requirements"
          ]
        },
        highLevelDesign: [
          "Consider multi-region architecture",
          "Think about eventual consistency patterns"
        ]
      },
      criteria: [
        "Vote latency under 200ms for 95% of users",
        "System maintains consistency across regions",
        "Graceful handling of region failures"
      ],
      learningsInMD: `
# Key Learnings

## Global Distribution
- Multi-region architecture
- Data replication strategies
- CDN utilization

## Consistency Patterns
- CAP theorem in practice
- Eventual consistency implementation
- Conflict resolution

## Performance
- Regional routing optimization
- Cache synchronization
- Cross-region communication
      `,
      resources: {
        documentation: [
          {
            title: "Multi-Region Architecture",
            url: "https://aws.amazon.com/blogs/architecture/tag/multi-region/",
            description: "Best practices for multi-region applications"
          }
        ],
        realWorldCases: [
          {
            name: "Discord's Global Infrastructure",
            url: "https://blog.discord.com/how-discord-handles-two-and-half-million-concurrent-voice-users-using-webrtc-ce01c3187429",
            description: "How Discord handles global real-time communication"
          }
        ],
        bestPractices: [
          {
            title: "Regional Routing",
            description: "Use GeoDNS for routing to nearest region",
            example: "Implement Route53 latency-based routing"
          }
        ]
      }
    },
    {
      problem: "Some polls require advanced voting rules and result calculations.",
      requirements: [
        "Implement support for multiple voting systems while maintaining performance"
      ],
      metaRequirements: [
        "Create a system that allows real-time updates without page refresh",
        "Scale the system to handle high-concurrent voting while maintaining consistency",
        "Implement vote validation and deduplication while maintaining performance",
        "Optimize the system for global access and reduce latency for international users",
        "Implement support for multiple voting systems while maintaining performance"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider different voting algorithm support",
            "Think about custom result calculation rules"
          ],
          nonFunctional: [
            "Consider computation overhead",
            "Think about result accuracy requirements"
          ]
        },
        systemAPI: [
          "Consider voting rule configuration APIs",
          "Think about result calculation endpoints"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate processing overhead for complex rules",
            "Consider impact on real-time updates"
          ],
          storage: [
            "Estimate storage for voting rules",
            "Consider vote data structure flexibility"
          ],
          memory: [
            "Calculate memory for active calculations",
            "Consider caching intermediate results"
          ],
          bandwidth: [
            "Calculate payload size for complex results",
            "Consider optimization strategies"
          ]
        },
        highLevelDesign: [
          "Consider plugin architecture for voting rules",
          "Think about computation optimization patterns"
        ]
      },
      criteria: [
        "System supports multiple voting algorithms",
        "Complex calculations complete within 5 seconds",
        "Results remain accurate for all voting methods"
      ],
      learningsInMD: `
# Key Learnings

## System Extensibility
- Plugin architecture patterns
- Rule engine implementation
- API versioning

## Performance Optimization
- Computation distribution
- Result caching strategies
- Incremental calculation

## Architecture Patterns
- Strategy pattern implementation
- Service composition
- Event sourcing
      `,
      resources: {
        documentation: [
          {
            title: "Voting Systems",
            url: "https://en.wikipedia.org/wiki/Electoral_system",
            description: "Understanding different voting systems and algorithms"
          }
        ],
        realWorldCases: [
          {
            name: "Stack Overflow Reputation System",
            url: "https://stackoverflow.blog/2009/08/18/new-reputation-rule-calculations/",
            description: "How Stack Overflow handles complex voting rules"
          }
        ],
        bestPractices: [
          {
            title: "Rule Engine",
            description: "Implement pluggable voting rule engine",
            example: "Use strategy pattern for different voting algorithms"
          }
        ]
      }
    }
  ],
  generalLearnings: [
    "Understanding real-time system architecture",
    "Implementing distributed vote counting",
    "Managing global system deployment",
    "Handling data consistency in distributed systems",
    "Building extensible voting systems",
    "Optimizing for scale and performance",
    "Implementing security and validation",
    "Managing eventual consistency"
  ]
};

export default challenge;
