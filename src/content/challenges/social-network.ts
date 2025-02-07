import { type Challenge } from "./types";

const socialNetworkChallenge: Challenge = {
  slug: "social-network-system",
  title: "Social Network System Design",
  description: "Design a scalable social network platform focusing on news feed generation, content delivery, and real-time interactions. Progress from basic social features to advanced recommendation systems.",
  difficulty: "Hard",
  isFree: false,
  stages: [
    {
      problem: "Users need to connect with friends and share posts on their timeline",
      requirements: [
        "Users should be able to create profiles, connect with friends, and share posts that appear on their timeline"
      ],
      metaRequirements: [
        "Users should be able to create profiles, connect with friends, and share posts that appear on their timeline"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider how to store user relationships",
            "Think about post storage and retrieval",
            "Consider timeline sorting and display"
          ],
          nonFunctional: [
            "Timeline loading speed is critical",
            "System should handle text and media content",
            "Consider data consistency for friend connections"
          ]
        },
        systemAPI: [
          "Design APIs for user relationships",
          "Consider post creation endpoints",
          "Think about timeline retrieval API"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate posts per user ratio",
            "Consider friend connection frequency"
          ],
          storage: [
            "Estimate user profile data size",
            "Calculate post storage requirements"
          ],
          memory: [
            "Consider timeline caching needs",
            "Calculate active user session data"
          ],
          bandwidth: [
            "Estimate post creation traffic",
            "Calculate timeline loading size"
          ]
        },
        highLevelDesign: [
          "Consider using a graph database for relationships",
          "Think about content storage system",
          "Consider feed aggregation service"
        ]
      },
      criteria: [
        "System can store user profiles and relationships",
        "Users can create and retrieve posts",
        "Timeline displays posts chronologically",
        "Basic friend connections work"
      ],
      learningsInMD: `
## Key Learnings
- Social graph data modeling
- Content storage systems
- Basic feed generation
- Friend relationship modeling
- Timeline sorting algorithms

### System Design Patterns
- Graph database usage
- Content delivery patterns
- Feed aggregation basics`,
      resources: {
        documentation: [
          {
            title: "Graph Databases",
            url: "https://neo4j.com/developer/graph-database/",
            description: "Understanding graph databases for social networks"
          }
        ],
        realWorldCases: [
          {
            name: "Facebook's TAO",
            url: "https://www.usenix.org/system/files/conference/atc13/atc13-bronson.pdf",
            description: "How Facebook stores social graph data"
          }
        ],
        bestPractices: [
          {
            title: "Social Graph Storage",
            description: "Use specialized graph databases for relationship queries",
            example: "Using Neo4j for friend-of-friend queries"
          }
        ]
      }
    },
    {
      problem: "News feed is loading slowly and users are experiencing high latency",
      requirements: [
        "Optimize news feed generation and delivery to reduce loading times"
      ],
      metaRequirements: [
        "Users should be able to create profiles, connect with friends, and share posts that appear on their timeline",
        "Optimize news feed generation and delivery to reduce loading times"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider feed pre-computation",
            "Think about pagination strategies",
            "Consider caching frequently accessed content"
          ],
          nonFunctional: [
            "Feed loading time should be minimal",
            "System should handle concurrent feed requests",
            "Consider cache invalidation strategies"
          ]
        },
        systemAPI: [
          "Design feed pagination APIs",
          "Consider cache warming endpoints",
          "Think about delta updates"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate feed request patterns",
            "Estimate cache hit ratios"
          ],
          storage: [
            "Calculate cache storage needs",
            "Estimate feed materialization size"
          ],
          memory: [
            "Calculate feed cache requirements",
            "Consider hot user data size"
          ],
          bandwidth: [
            "Estimate feed delivery size",
            "Calculate cache synchronization needs"
          ]
        },
        highLevelDesign: [
          "Consider implementing feed cache",
          "Think about CDN integration",
          "Consider fan-out service design"
        ]
      },
      criteria: [
        "Feed loading meets performance targets",
        "Cache hit rate meets requirements",
        "System handles concurrent requests efficiently",
        "Pagination works smoothly"
      ],
      learningsInMD: `
## Key Learnings
- Feed optimization techniques
- Caching strategies
- Content delivery networks
- Fan-out processing
- Pagination implementation

### System Design Patterns
- Read-aside cache
- CDN integration
- Fan-out on write vs read`,
      resources: {
        documentation: [
          {
            title: "Feed Algorithms",
            url: "https://instagram-engineering.com/building-instagram-feed-ranking-system-b99d40cf52e7",
            description: "How Instagram builds their feed system"
          }
        ],
        realWorldCases: [
          {
            name: "Twitter's Timeline",
            url: "https://blog.twitter.com/engineering/en_us/topics/infrastructure/2017/the-infrastructure-behind-twitter-timeline",
            description: "Twitter's timeline architecture"
          }
        ],
        bestPractices: [
          {
            title: "Feed Caching",
            description: "Implement smart caching with materialized views",
            example: "Pre-computing feeds for active users"
          }
        ]
      }
    },
    {
      problem: "System needs to support real-time features like notifications and instant messaging",
      requirements: [
        "Implement real-time notifications and messaging capabilities while maintaining system performance"
      ],
      metaRequirements: [
        "Users should be able to create profiles, connect with friends, and share posts that appear on their timeline",
        "Optimize news feed generation and delivery to reduce loading times",
        "Implement real-time notifications and messaging capabilities while maintaining system performance"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider WebSocket connections",
            "Think about message persistence",
            "Consider notification delivery"
          ],
          nonFunctional: [
            "Message delivery should be real-time",
            "System should handle connection scaling",
            "Consider message ordering"
          ]
        },
        systemAPI: [
          "Design WebSocket endpoints",
          "Consider message delivery APIs",
          "Think about presence system"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate message throughput",
            "Estimate concurrent connections"
          ],
          storage: [
            "Calculate message history size",
            "Estimate presence data size"
          ],
          memory: [
            "Calculate active connection needs",
            "Consider message queue size"
          ],
          bandwidth: [
            "Estimate WebSocket traffic",
            "Calculate notification size"
          ]
        },
        highLevelDesign: [
          "Consider WebSocket servers",
          "Think about message queue system",
          "Consider presence service"
        ]
      },
      criteria: [
        "Real-time messaging works",
        "Notifications deliver promptly",
        "System handles connection scaling",
        "Message ordering is maintained"
      ],
      learningsInMD: `
## Key Learnings
- Real-time system design
- WebSocket implementation
- Message queue systems
- Presence management
- Connection handling

### System Design Patterns
- Publisher/Subscriber
- WebSocket architecture
- Message queue patterns`,
      resources: {
        documentation: [
          {
            title: "WebSocket Architecture",
            url: "https://www.nginx.com/blog/websocket-nginx/",
            description: "Understanding WebSocket implementation"
          }
        ],
        realWorldCases: [
          {
            name: "WhatsApp Architecture",
            url: "https://engineering.whatsapp.com/",
            description: "WhatsApp's messaging system"
          }
        ],
        bestPractices: [
          {
            title: "Real-time Messaging",
            description: "Implement proper connection management",
            example: "Using heartbeat mechanisms for connections"
          }
        ]
      }
    },
    {
      problem: "Content discovery is limited and users are missing relevant posts",
      requirements: [
        "Implement a content recommendation system to improve post discovery and user engagement"
      ],
      metaRequirements: [
        "Users should be able to create profiles, connect with friends, and share posts that appear on their timeline",
        "Optimize news feed generation and delivery to reduce loading times",
        "Implement real-time notifications and messaging capabilities while maintaining system performance",
        "Implement a content recommendation system to improve post discovery and user engagement"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider user interest tracking",
            "Think about content categorization",
            "Consider engagement metrics"
          ],
          nonFunctional: [
            "Recommendations should be relevant",
            "System should handle computation load",
            "Consider recommendation freshness"
          ]
        },
        systemAPI: [
          "Design recommendation APIs",
          "Consider feedback endpoints",
          "Think about content categorization"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate recommendation requests",
            "Estimate feedback volume"
          ],
          storage: [
            "Calculate user behavior data size",
            "Estimate model storage needs"
          ],
          memory: [
            "Consider model serving requirements",
            "Calculate feature cache size"
          ],
          bandwidth: [
            "Estimate recommendation response size",
            "Calculate model update size"
          ]
        },
        highLevelDesign: [
          "Consider recommendation service",
          "Think about feature extraction",
          "Consider model serving system"
        ]
      },
      criteria: [
        "Recommendations are relevant",
        "System handles computation load",
        "Content discovery improves",
        "User engagement increases"
      ],
      learningsInMD: `
## Key Learnings
- Recommendation systems
- Feature engineering
- Model serving architecture
- Content categorization
- Engagement metrics

### System Design Patterns
- Feature extraction pipeline
- Model serving architecture
- A/B testing system`,
      resources: {
        documentation: [
          {
            title: "Recommendation Systems",
            url: "https://developers.google.com/machine-learning/recommendation",
            description: "Google's guide to recommendation systems"
          }
        ],
        realWorldCases: [
          {
            name: "Netflix Recommendations",
            url: "https://netflixtechblog.com/system-architectures-for-personalization-and-recommendation-e081aa94b5d8",
            description: "Netflix's recommendation architecture"
          }
        ],
        bestPractices: [
          {
            title: "Content Recommendation",
            description: "Implement proper feature engineering",
            example: "Using collaborative filtering with content-based features"
          }
        ]
      }
    },
    {
      problem: "System needs to handle user privacy and content moderation at scale",
      requirements: [
        "Implement privacy controls and content moderation systems while maintaining performance"
      ],
      metaRequirements: [
        "Users should be able to create profiles, connect with friends, and share posts that appear on their timeline",
        "Optimize news feed generation and delivery to reduce loading times",
        "Implement real-time notifications and messaging capabilities while maintaining system performance",
        "Implement a content recommendation system to improve post discovery and user engagement",
        "Implement privacy controls and content moderation systems while maintaining performance"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider privacy settings hierarchy",
            "Think about content filtering",
            "Consider moderation workflow"
          ],
          nonFunctional: [
            "Privacy checks should be fast",
            "System should handle reported content",
            "Consider moderation response time"
          ]
        },
        systemAPI: [
          "Design privacy control APIs",
          "Consider moderation endpoints",
          "Think about reporting system"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate privacy check frequency",
            "Estimate moderation volume"
          ],
          storage: [
            "Calculate privacy settings size",
            "Estimate moderation queue size"
          ],
          memory: [
            "Consider privacy cache needs",
            "Calculate moderation state"
          ],
          bandwidth: [
            "Estimate moderation request size",
            "Calculate privacy check volume"
          ]
        },
        highLevelDesign: [
          "Consider privacy service",
          "Think about moderation queue",
          "Consider content filtering system"
        ]
      },
      criteria: [
        "Privacy controls work effectively",
        "Content moderation is timely",
        "System maintains performance",
        "Reporting system works"
      ],
      learningsInMD: `
## Key Learnings
- Privacy system design
- Content moderation systems
- Queue processing
- Access control patterns
- Reporting systems

### System Design Patterns
- Role-based access control
- Content filtering pipeline
- Moderation workflow`,
      resources: {
        documentation: [
          {
            title: "Content Moderation",
            url: "https://aws.amazon.com/solutions/implementations/content-moderation-api/",
            description: "AWS content moderation architecture"
          }
        ],
        realWorldCases: [
          {
            name: "Facebook's Content Moderation",
            url: "https://engineering.fb.com/2020/11/13/ml-applications/hate-speech-detection/",
            description: "Facebook's moderation system"
          }
        ],
        bestPractices: [
          {
            title: "Privacy Controls",
            description: "Implement hierarchical privacy settings",
            example: "Using permission inheritance for nested groups"
          }
        ]
      }
    }
  ],
  generalLearnings: [
    "Designing social graph databases",
    "Implementing feed generation systems",
    "Building real-time communication systems",
    "Creating recommendation engines",
    "Handling privacy and moderation",
    "Scaling distributed systems",
    "Implementing caching strategies",
    "Building content delivery systems",
    "Managing user relationships",
    "Designing for user engagement"
  ]
};

export default socialNetworkChallenge; 