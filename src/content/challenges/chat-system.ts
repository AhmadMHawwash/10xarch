import { type Challenge } from "./types";

const chatSystemChallenge: Challenge = {
  slug: "basic-chat-system",
  title: "Real-time Chat System Design",
  description: "Design a real-time chat system focusing on message delivery, scaling, and reliability. Learn fundamental distributed systems concepts through practical chat features.",
  difficulty: "Easy",
  isFree: false,
  stages: [
    {
      problem: "Users need to send and receive text messages to each other",
      requirements: [
        "Implement basic 1-on-1 text messaging functionality"
      ],
      metaRequirements: [
        "Implement basic 1-on-1 text messaging functionality"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Think about basic message operations (send/receive)",
            "Consider message states (sent/delivered)"
          ],
          nonFunctional: [
            "Consider message delivery guarantees",
            "Think about basic response time expectations"
          ]
        },
        systemAPI: [
          "What endpoints would you need for messaging?",
          "How would you structure the message data?",
          "Consider WebSocket vs HTTP for real-time updates"
        ],
        capacityEstimations: {
          traffic: [
            "How many messages might be sent per user?",
            "What's your expected user base?"
          ],
          storage: [
            "How long should messages be stored?",
            "What message metadata needs storing?"
          ],
          memory: [
            "What data needs to be cached?",
            "Consider active chat sessions"
          ],
          bandwidth: [
            "What's the typical message size?",
            "Consider protocol overhead"
          ]
        },
        highLevelDesign: [
          "How will you maintain user connections?",
          "Where will messages be stored?",
          "How will you deliver messages?"
        ]
      },
      criteria: [
        "Users can send and receive messages",
        "Messages show basic delivery status",
        "Real-time message delivery works"
      ],
      learningsInMD: `
## Key Learnings

### Basic Real-time Systems
- Real-time communication protocols
- Message delivery patterns
- Basic connection management

### Data Modeling
- Message structure design
- User session handling
- Basic storage patterns
      `,
      resources: {
        documentation: [
          {
            title: "WebSocket API",
            url: "https://developer.mozilla.org/en-US/docs/Web/API/WebSocket",
            description: "Understanding WebSocket for real-time chat"
          }
        ],
        realWorldCases: [
          {
            name: "Discord Architecture",
            url: "https://discord.com/blog/how-discord-stores-billions-of-messages",
            description: "Basic message storage and delivery patterns"
          }
        ],
        bestPractices: [
          {
            title: "Message Structure",
            description: "Include necessary metadata with each message",
            example: "timestamp, sender, recipient, status flags"
          }
        ]
      }
    },
    {
      problem: "Messages are getting lost when users have poor internet connections",
      requirements: [
        "Implement reliable message delivery with offline support"
      ],
      metaRequirements: [
        "Implement basic 1-on-1 text messaging functionality",
        "Implement reliable message delivery with offline support"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider message persistence",
            "Think about message ordering"
          ],
          nonFunctional: [
            "Consider network reliability",
            "Think about message consistency"
          ]
        },
        systemAPI: [
          "How will you handle message retries?",
          "Consider offline message queueing",
          "Think about sync protocols"
        ],
        capacityEstimations: {
          traffic: [
            "How many offline messages might accumulate?",
            "Consider retry patterns"
          ],
          storage: [
            "How to store pending messages?",
            "Consider queue size limits"
          ],
          memory: [
            "What needs to be cached for offline users?",
            "Think about message buffers"
          ],
          bandwidth: [
            "Consider reconnection data transfer",
            "Think about batch vs real-time sync"
          ]
        },
        highLevelDesign: [
          "Where will you queue offline messages?",
          "How will you handle reconnection?",
          "Consider message persistence strategy"
        ]
      },
      criteria: [
        "Messages persist across connection drops",
        "Messages are delivered in order",
        "Offline messages are received on reconnection"
      ],
      learningsInMD: `
## Key Learnings

### Message Reliability
- Offline message handling
- Message ordering guarantees
- Reconnection strategies

### Queue Systems
- Message persistence
- Basic queue patterns
- Delivery guarantees
      `,
      resources: {
        documentation: [
          {
            title: "RabbitMQ Reliability Guide",
            url: "https://www.rabbitmq.com/reliability.html",
            description: "Understanding message queue reliability"
          }
        ],
        realWorldCases: [
          {
            name: "WhatsApp Message Reliability",
            url: "https://engineering.whatsapp.com/reliability",
            description: "How WhatsApp handles offline messages"
          }
        ],
        bestPractices: [
          {
            title: "Message Persistence",
            description: "Store messages until confirmed delivery",
            example: "Use message queue with persistence enabled"
          }
        ]
      }
    },
    {
      problem: "Users are experiencing slow message delivery during peak hours",
      requirements: [
        "Optimize system to handle increasing user load"
      ],
      metaRequirements: [
        "Implement basic 1-on-1 text messaging functionality",
        "Implement reliable message delivery with offline support",
        "Optimize system to handle increasing user load"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider connection distribution",
            "Think about load patterns"
          ],
          nonFunctional: [
            "Consider response time goals",
            "Think about system capacity"
          ]
        },
        systemAPI: [
          "How will you distribute connections?",
          "Consider connection pooling",
          "Think about load balancing"
        ],
        capacityEstimations: {
          traffic: [
            "What's your peak message rate?",
            "Consider connection limits"
          ],
          storage: [
            "How will storage scale?",
            "Think about data distribution"
          ],
          memory: [
            "Consider cache scaling",
            "Think about session distribution"
          ],
          bandwidth: [
            "Calculate peak bandwidth needs",
            "Consider network optimization"
          ]
        },
        highLevelDesign: [
          "How will you scale horizontally?",
          "Consider cache strategy",
          "Think about load distribution"
        ]
      },
      criteria: [
        "System handles peak load efficiently",
        "Message delivery remains fast",
        "Resources scale with demand"
      ],
      learningsInMD: `
## Key Learnings

### Basic Scaling
- Horizontal scaling patterns
- Load balancing
- Resource distribution

### Performance
- Connection pooling
- Caching strategies
- Load distribution
      `,
      resources: {
        documentation: [
          {
            title: "HAProxy Configuration",
            url: "http://docs.haproxy.org/2.8/configuration.html",
            description: "Load balancing for WebSocket connections"
          }
        ],
        realWorldCases: [
          {
            name: "Slack's Scaling Journey",
            url: "https://slack.engineering/scaling-slack",
            description: "How Slack handled growing pains"
          }
        ],
        bestPractices: [
          {
            title: "Connection Distribution",
            description: "Use consistent hashing for connection distribution",
            example: "Implement sticky sessions with Redis"
          }
        ]
      }
    },
    {
      problem: "Users report messages appearing out of order or duplicated",
      requirements: [
        "Ensure consistent message ordering and delivery"
      ],
      metaRequirements: [
        "Implement basic 1-on-1 text messaging functionality",
        "Implement reliable message delivery with offline support",
        "Optimize system to handle increasing user load",
        "Ensure consistent message ordering and delivery"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider message sequence numbers",
            "Think about deduplication"
          ],
          nonFunctional: [
            "Consider consistency requirements",
            "Think about ordering guarantees"
          ]
        },
        systemAPI: [
          "How will you track message order?",
          "Consider message identifiers",
          "Think about acknowledgment system"
        ],
        capacityEstimations: {
          traffic: [
            "How many concurrent conversations?",
            "Consider ordering overhead"
          ],
          storage: [
            "Think about sequence storage",
            "Consider deduplication data"
          ],
          memory: [
            "What ordering data to cache?",
            "Consider sequence buffers"
          ],
          bandwidth: [
            "Consider acknowledgment overhead",
            "Think about ordering metadata"
          ]
        },
        highLevelDesign: [
          "How will you maintain order?",
          "Consider deduplication strategy",
          "Think about consistency patterns"
        ]
      },
      criteria: [
        "Messages appear in correct order",
        "No message duplication",
        "Consistent delivery across devices"
      ],
      learningsInMD: `
## Key Learnings

### Data Consistency
- Message ordering patterns
- Deduplication strategies
- Consistency models

### Distributed Systems
- Sequence numbers
- Message acknowledgments
- Consistency guarantees
      `,
      resources: {
        documentation: [
          {
            title: "Apache Kafka Ordering",
            url: "https://kafka.apache.org/documentation/#semantics",
            description: "Understanding message ordering in distributed systems"
          }
        ],
        realWorldCases: [
          {
            name: "Facebook Messenger Ordering",
            url: "https://engineering.fb.com/2014/10/09/production-engineering/messenger-ordering",
            description: "How Facebook handles message ordering"
          }
        ],
        bestPractices: [
          {
            title: "Message Ordering",
            description: "Use lamport timestamps for message ordering",
            example: "Implement vector clocks for causality tracking"
          }
        ]
      }
    },
    {
      problem: "System becomes unstable when server components fail",
      requirements: [
        "Implement basic fault tolerance and recovery"
      ],
      metaRequirements: [
        "Implement basic 1-on-1 text messaging functionality",
        "Implement reliable message delivery with offline support",
        "Optimize system to handle increasing user load",
        "Ensure consistent message ordering and delivery",
        "Implement basic fault tolerance and recovery"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider failover scenarios",
            "Think about recovery processes"
          ],
          nonFunctional: [
            "Consider availability goals",
            "Think about recovery time"
          ]
        },
        systemAPI: [
          "How will you handle failed nodes?",
          "Consider service discovery",
          "Think about health checks"
        ],
        capacityEstimations: {
          traffic: [
            "What's your failover capacity?",
            "Consider recovery load"
          ],
          storage: [
            "Think about backup needs",
            "Consider replication factor"
          ],
          memory: [
            "Consider failover state",
            "Think about session recovery"
          ],
          bandwidth: [
            "Consider replication traffic",
            "Think about recovery data"
          ]
        },
        highLevelDesign: [
          "How will you detect failures?",
          "Consider replication strategy",
          "Think about recovery process"
        ]
      },
      criteria: [
        "System survives component failures",
        "Messages persist through failures",
        "Service recovers automatically"
      ],
      learningsInMD: `
## Key Learnings

### Fault Tolerance
- Failure detection
- Failover strategies
- Recovery patterns

### High Availability
- Service redundancy
- Data replication
- Automated recovery
      `,
      resources: {
        documentation: [
          {
            title: "Redis Sentinel",
            url: "https://redis.io/topics/sentinel",
            description: "High availability for Redis"
          }
        ],
        realWorldCases: [
          {
            name: "LINE Messenger Reliability",
            url: "https://engineering.linecorp.com/en/blog/messaging-reliability",
            description: "How LINE handles system failures"
          }
        ],
        bestPractices: [
          {
            title: "Failure Detection",
            description: "Implement heartbeat monitoring",
            example: "Use distributed consensus for leader election"
          }
        ]
      }
    }
  ],
  generalLearnings: [
    "Real-time system design fundamentals",
    "Message delivery patterns and guarantees",
    "Basic scaling and performance optimization",
    "Data consistency in distributed systems",
    "Fault tolerance and high availability",
    "Queue-based architecture patterns",
    "Connection management at scale",
    "Basic monitoring and recovery strategies"
  ]
};

export default chatSystemChallenge;
