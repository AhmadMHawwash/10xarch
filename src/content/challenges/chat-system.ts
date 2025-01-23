import { type Challenge } from "./types";

const chatChallenge: Challenge = {
  slug: "real-time-chat-app",
  title: "Real-Time Chat Application Design",
  description: "Design a scalable chat application supporting real-time messaging with progressive complexity",
  difficulty: "Medium",
  isFree: true,
  stages: [
    {
      problem: "Users need basic real-time text communication",
      requirements: [
        "Instant message delivery between users",
        "Support 10k concurrent connections",
        "Text-only messages (max 280 chars)",
        "No persistence required"
      ],
      metaRequirements: [
        "Instant message delivery between users",
        "Support 10k concurrent connections",
        "Text-only messages (max 280 chars)",
        "No persistence required"
      ],
      hintsPerArea: {
        requirements: {
          functional: ["WebSocket connections", "Message broadcasting"],
          nonFunctional: ["Low latency (<100ms)", "Connection management"]
        },
        systemAPI: [
          "POST /send-message {text, sender}",
          "WS /listen-messages"
        ],
        capacityEstimations: {
          traffic: ["10k users sending 1 msg/10s = 1k msg/s"],
          storage: ["No persistent storage needed"],
          memory: ["In-memory message queues"],
          bandwidth: ["280 chars * 1k msg/s = ~280KB/s"]
        },
        highLevelDesign: [
          "WebSocket server cluster",
          "Pub/Sub architecture",
          "Load balancer for connections"
        ]
      },
      criteria: [
        "Real-time delivery demonstrated",
        "Handles 10k concurrent connections",
        "No message persistence"
      ],
      learningsInMD: `
- WebSocket protocol fundamentals
- Pub/Sub pattern implementation
- Connection pooling strategies
- Basic load balancing concepts`
    },
    {
      problem: "Unauthorized access to chat features",
      requirements: [
        "Add JWT-based authentication",
        "Associate messages with user IDs",
        "Maintain <200ms latency",
        "Support 100k user accounts"
      ],
      metaRequirements: [
        "Authenticated message delivery",
        "Support 100k user accounts",
        "Text-only messages (max 280 chars)",
        "<200ms end-to-end latency",
        "JWT-based authentication"
      ],
      hintsPerArea: {
        requirements: {
          functional: ["Auth service separation", "Token validation"],
          nonFunctional: ["Security compliance", "Session management"]
        },
        systemAPI: [
          "POST /login {username, password}",
          "Auth middleware for WebSocket upgrade"
        ],
        capacityEstimations: {
          traffic: ["Add 10% auth-related requests"],
          storage: ["User credentials database"],
          memory: ["Token blacklist caching"],
          bandwidth: ["Add JWT header overhead"]
        },
        highLevelDesign: [
          "Stateless auth service",
          "Redis session cache",
          "HTTPS encryption"
        ]
      },
      criteria: [
        "All messages require valid JWT",
        "User context in messages",
        "Latency under 200ms"
      ],
      learningsInMD: `
- Token-based authentication flows
- Security best practices
- Stateless vs stateful services
- Session caching patterns`
    },
    {
      problem: "Users want organized group conversations",
      requirements: [
        "Create/join chat rooms",
        "Room-specific messaging",
        "List active rooms",
        "Support 1k rooms concurrently"
      ],
      metaRequirements: [
        "Authenticated message delivery",
        "Support 100k user accounts",
        "Text-only messages (max 280 chars)",
        "<200ms end-to-end latency",
        "Room-based communication",
        "1k concurrent active rooms"
      ],
      hintsPerArea: {
        requirements: {
          functional: ["Room management API", "Namespace separation"],
          nonFunctional: ["Group messaging efficiency", "Discovery features"]
        },
        systemAPI: [
          "POST /rooms {name, creator}",
          "WS /rooms/{id}/listen"
        ],
        capacityEstimations: {
          traffic: ["10 messages/sec per room average"],
          storage: ["Room metadata storage"],
          memory: ["Room state management"],
          bandwidth: ["Multiply by active rooms"]
        },
        highLevelDesign: [
          "Topic-based pub/sub",
          "Room metadata service",
          "Distributed state management"
        ]
      },
      criteria: [
        "Room creation/joining implemented",
        "Messages scoped to rooms",
        "Active room listing"
      ],
      learningsInMD: `
- Namespace management in pub/sub
- Group communication patterns
- Distributed state synchronization
- Service discovery mechanisms`
    },
    {
      problem: "Users request message history access",
      requirements: [
        "Store messages for 30 days",
        "Message retrieval API",
        "Search within chat history",
        "Handle 1TB message storage"
      ],
      metaRequirements: [
        "Authenticated message delivery",
        "30-day message persistence",
        "Text message search",
        "1TB storage capacity",
        "Room-based communication"
      ],
      hintsPerArea: {
        requirements: {
          functional: ["Message archiving", "Historical queries"],
          nonFunctional: ["Storage optimization", "Search performance"]
        },
        systemAPI: [
          "GET /messages?room=X&search=Y",
          "Message archival scheduler"
        ],
        capacityEstimations: {
          traffic: ["Add 20% read requests"],
          storage: ["1TB = 1B msgs * 1KB each"],
          memory: ["Cache frequent queries"],
          bandwidth: ["History download traffic"]
        },
        highLevelDesign: [
          "Time-series database",
          "Message archive service",
          "Cache-aside pattern"
        ]
      },
      criteria: [
        "Message persistence implemented",
        "Searchable history",
        "Storage scaling plan"
      ],
      learningsInMD: `
- Database sharding techniques
- Time-series data management
- Cache-aside pattern
- Search index optimization`
    },
    {
      problem: "Need content moderation capabilities",
      requirements: [
        "Real-time profanity filtering",
        "Message reporting system",
        "Moderator dashboard",
        "<50ms filtering overhead"
      ],
      metaRequirements: [
        "Authenticated message delivery",
        "Real-time content filtering",
        "User reporting system",
        "Moderation dashboard",
        "30-day message persistence"
      ],
      hintsPerArea: {
        requirements: {
          functional: ["Message pipeline processing", "Moderator workflows"],
          nonFunctional: ["Low-latency filtering", "Audit logging"]
        },
        systemAPI: [
          "POST /report {messageId}",
          "Moderator ban endpoint"
        ],
        capacityEstimations: {
          traffic: ["Add 5% moderation-related"],
          storage: ["Audit logs storage"],
          memory: ["Filter pattern caching"],
          bandwidth: ["Filtering service overhead"]
        },
        highLevelDesign: [
          "Message processing pipeline",
          "Bloom filter for banned words",
          "Moderation event queue"
        ]
      },
      criteria: [
        "Real-time content filtering",
        "User reporting system",
        "Moderation interface"
      ],
      learningsInMD: `
- Real-time stream processing
- Pattern matching algorithms
- Privilege separation
- Audit logging best practices`
    }
  ],
  generalLearnings: [
    "WebSocket connection lifecycle management",
    "Horizontal scaling strategies for real-time systems",
    "Database sharding and replication patterns",
    "Security tradeoffs in distributed systems",
    "Event-driven architecture design",
    "Content delivery network integration",
    "Load testing and capacity planning",
    "Graceful degradation strategies",
    "Monitoring and observability in real-time systems",
    "CI/CD pipelines for high-availability services"
  ]
};

export default chatChallenge;
