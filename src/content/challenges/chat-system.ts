import { type Challenge } from "./types";

const challenge: Challenge = {
  slug: "real-time-chat-application",
  title: "Real-Time Chat",
  description:
    "Design a chat application that allows users to send and receive messages in real-time.",
  difficulty: "Medium",
  isFree: false,
  stages: [
    {
      problem: "Users want to send and receive messages in real-time.",
      requirements: [
        "Build a chat application that allows users to send and receive messages in real-time.",
      ],
      metaRequirements: [
        "The application allows users to send and receive messages in real-time.",
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Allow users to send messages.",
            "Allow users to receive messages in real-time.",
          ],
          nonFunctional: [
            "Ensure low latency in message delivery.",
            "Support a small number of concurrent users (e.g., 100 users).",
          ],
        },
        systemAPI: [
          "Design an API that supports real-time messaging.",
          "Consider using WebSocket protocols.",
        ],
        capacityEstimations: {
          traffic: [
            "Estimate messages per second (e.g., 10 messages per second).",
          ],
          storage: ["No message storage needed at this stage."],
          memory: ["Estimate memory required for handling active connections."],
          bandwidth: [
            "Calculate bandwidth per user for sending and receiving messages.",
          ],
        },
        highLevelDesign: [
          "Use a client-server model.",
          "Implement real-time communication using WebSockets.",
        ],
      },
      criteria: [
        "Users can send messages.",
        "Users can receive messages in real-time.",
        "The system handles the estimated load.",
      ],
      learningsInMD: `### Key Learnings
  
  - Understanding client-server architecture.
  - Implementing real-time communication using WebSockets.
  - Basics of capacity estimation for network applications.`,
      resources: {
        documentation: [
          {
            title: "WebSocket API",
            url: "https://developer.mozilla.org/en-US/docs/Web/API/WebSocket",
            description: "Official MDN documentation for WebSocket API implementation"
          },
          {
            title: "Socket.IO Documentation",
            url: "https://socket.io/docs/v4/",
            description: "Comprehensive guide for real-time bidirectional event-based communication"
          }
        ],
        realWorldCases: [
          {
            name: "WhatsApp Architecture",
            url: "https://www.youtube.com/watch?v=vvhC64hQZMk",
            description: "Deep dive into WhatsApp's real-time messaging architecture"
          }
        ],
        bestPractices: [
          {
            title: "WebSocket Connection Management",
            description: "Implement heartbeat mechanism to detect connection drops",
            example: "Send ping frames every 30 seconds and expect pong responses"
          },
          {
            title: "Message Queue Implementation",
            description: "Use message queues to handle high message volumes",
            example: "Implement Redis pub/sub for message broadcasting"
          }
        ]
      }
    },
    // Stage 2
    {
      problem:
        "Users want to have unique identities and only authorized users should access the system.",
      requirements: [
        "Implement user authentication to ensure that only registered users can send and receive messages.",
      ],
      metaRequirements: [
        "The application allows users to send and receive messages in real-time.",
        "Users must authenticate before accessing the chat functionality.",
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Provide user registration and login features.",
            "Authenticate users before allowing access to messaging.",
          ],
          nonFunctional: [
            "Securely store user credentials.",
            "Ensure the authentication system can scale with the number of users.",
          ],
        },
        systemAPI: [
          "Design APIs for user registration and authentication.",
          "Consider token-based authentication mechanisms.",
        ],
        capacityEstimations: {
          traffic: [
            "Estimate the number of authentication requests per second.",
          ],
          storage: [
            "Estimate storage needed for user credentials (e.g., 1,000 users).",
          ],
          memory: ["Consider memory impact of maintaining user sessions."],
          bandwidth: ["Include bandwidth for authentication data."],
        },
        highLevelDesign: [
          "Implement secure password storage using hashing algorithms.",
          "Use session tokens or JWT for maintaining user sessions.",
        ],
      },
      criteria: [
        "Users can register and log in.",
        "Only authenticated users can send and receive messages.",
        "User credentials are stored securely.",
      ],
      learningsInMD: `### Key Learnings
  
  - Understanding authentication flows.
  - Implementing secure password storage.
  - Integrating authentication into existing systems.`,
      resources: {
        documentation: [
          {
            title: "JWT Authentication",
            url: "https://jwt.io/introduction",
            description: "Comprehensive guide to JSON Web Tokens"
          },
          {
            title: "OAuth 2.0",
            url: "https://oauth.net/2/",
            description: "Industry-standard protocol for authorization"
          }
        ],
        realWorldCases: [
          {
            name: "Discord Authentication System",
            url: "https://discord.com/developers/docs/topics/oauth2",
            description: "Discord's implementation of OAuth2 for chat authentication"
          }
        ],
        bestPractices: [
          {
            title: "Password Storage",
            description: "Use strong hashing algorithms with salt for password storage",
            example: "bcrypt.hash(password, 10) with unique salt per user"
          },
          {
            title: "Token Management",
            description: "Implement token refresh mechanism and proper expiration",
            example: "Use short-lived access tokens (15min) with longer refresh tokens (7days)"
          }
        ]
      }
    },
    // Stage 3
    {
      problem:
        "Users want to create and join chat rooms to communicate with groups.",
      requirements: [
        "Implement chat rooms where multiple users can join and chat together.",
      ],
      metaRequirements: [
        "The application allows users to send and receive messages in real-time.",
        "Users must authenticate before accessing the chat functionality.",
        "Users can create, join, and leave chat rooms.",
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Allow users to create new chat rooms.",
            "Enable users to join existing chat rooms.",
            "Support multiple users in a single chat room.",
          ],
          nonFunctional: [
            "Ensure real-time message delivery within chat rooms.",
            "Manage chat room scalability for up to 50 concurrent users per room.",
          ],
        },
        systemAPI: [
          "Design APIs for creating, joining, and leaving chat rooms.",
          "Consider how to route messages to the correct chat room.",
        ],
        capacityEstimations: {
          traffic: ["Estimate the number of chat rooms and messages per room."],
          storage: ["Still minimal storage as messages are not persisted."],
          memory: ["Account for memory usage per chat room."],
          bandwidth: ["Calculate bandwidth for multiple users in chat rooms."],
        },
        highLevelDesign: [
          "Use room identifiers to manage message broadcasting.",
          "Consider data structures for managing chat rooms and user memberships.",
        ],
      },
      criteria: [
        "Users can create chat rooms.",
        "Users can join and leave chat rooms.",
        "Messages are delivered in real-time within chat rooms.",
      ],
      learningsInMD: `### Key Learnings
  
  - Implementing persistent storage.
  - Managing data relationships.
  - Designing efficient data retrieval mechanisms.`,
      resources: {
        documentation: [
          {
            title: "MongoDB Documentation",
            url: "https://docs.mongodb.com/",
            description: "Official MongoDB documentation for NoSQL database implementation"
          },
          {
            title: "Redis Documentation",
            url: "https://redis.io/documentation",
            description: "Redis guide for message caching and real-time features"
          }
        ],
        realWorldCases: [
          {
            name: "Slack's Database Architecture",
            url: "https://slack.engineering/flannel-an-application-level-edge-cache-to-make-slack-scale/",
            description: "How Slack handles message storage and retrieval at scale"
          }
        ],
        bestPractices: [
          {
            title: "Message Storage Schema",
            description: "Design efficient schema for quick message retrieval",
            example: "Use compound indexes on (chatRoom, timestamp) for range queries"
          },
          {
            title: "Caching Strategy",
            description: "Implement multi-level caching for frequent message access",
            example: "Cache last 100 messages per chat room in Redis"
          }
        ]
      }
    },
    // Stage 4
    {
      problem:
        "Users want their messages to be saved so they can view past conversations.",
      requirements: [
        "Implement message persistence so that messages are stored and can be retrieved later.",
      ],
      metaRequirements: [
        "The application allows users to send and receive messages in real-time.",
        "Users must authenticate before accessing the chat functionality.",
        "Users can create, join, and leave chat rooms.",
        "Messages are stored persistently and can be retrieved later.",
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Store messages in a database.",
            "Retrieve and display past messages when a user joins a chat room.",
          ],
          nonFunctional: [
            "Ensure message retrieval is fast.",
            "Handle increasing data volume efficiently.",
          ],
        },
        systemAPI: [
          "Update APIs to include message retrieval.",
          "Consider pagination or limits on message history retrieval.",
        ],
        capacityEstimations: {
          traffic: ["Estimate read and write operations per second."],
          storage: [
            "Estimate storage needs based on message volume over time.",
          ],
          memory: ["Consider caching recent messages in memory."],
          bandwidth: ["Include bandwidth for message history retrieval."],
        },
        highLevelDesign: [
          "Choose an appropriate database (SQL vs. NoSQL).",
          "Design data models for storing messages.",
        ],
      },
      criteria: [
        "Messages are stored in a database.",
        "Users can retrieve past messages when joining a chat room.",
        "Message retrieval performance meets user expectations.",
      ],
      learningsInMD: `### Key Learnings
  
  - Understanding load balancing concepts.
  - Implementing horizontal scaling.
  - Managing distributed systems.`,
      resources: {
        documentation: [
          {
            title: "HAProxy Documentation",
            url: "http://www.haproxy.org/#docs",
            description: "Load balancing and proxy server implementation guide"
          },
          {
            title: "Kubernetes Documentation",
            url: "https://kubernetes.io/docs/home/",
            description: "Container orchestration for scaling chat applications"
          }
        ],
        realWorldCases: [
          {
            name: "Facebook Messenger Architecture",
            url: "https://engineering.fb.com/2018/06/26/core-data/migrating-messenger-storage-to-optimize-performance/",
            description: "How Facebook Messenger handles billions of messages"
          }
        ],
        bestPractices: [
          {
            title: "WebSocket Load Balancing",
            description: "Use sticky sessions for WebSocket connections",
            example: "Configure HAProxy with sticky sessions based on client IP"
          },
          {
            title: "Service Discovery",
            description: "Implement service discovery for chat server instances",
            example: "Use Consul for service registration and health checks"
          }
        ]
      }
    },
    // Stage 5
    {
      problem:
        "The application needs to handle increased load as the user base grows.",
      requirements: [
        "Design the system to be scalable to support up to 10,000 concurrent users.",
      ],
      metaRequirements: [
        "The application allows users to send and receive messages in real-time.",
        "Users must authenticate before accessing the chat functionality.",
        "Users can create, join, and leave chat rooms.",
        "Messages are stored persistently and can be retrieved later.",
        "The system supports up to 10,000 concurrent users.",
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Maintain all existing functionalities under increased load.",
          ],
          nonFunctional: [
            "Ensure system scalability and high availability.",
            "Optimize for performance under heavy traffic.",
          ],
        },
        systemAPI: [
          "APIs should handle increased traffic efficiently.",
          "Consider rate limiting or throttling mechanisms.",
        ],
        capacityEstimations: {
          traffic: ["Re-estimate message throughput for 10,000 users."],
          storage: ["Plan for increased data storage needs."],
          memory: ["Assess memory requirements for more connections."],
          bandwidth: ["Calculate total bandwidth required for 10,000 users."],
        },
        highLevelDesign: [
          "Implement load balancing across multiple servers.",
          "Consider stateless server design or session management strategies.",
          "Use caching to reduce database load.",
        ],
      },
      criteria: [
        "The system can handle 10,000 concurrent users.",
        "Performance remains acceptable under increased load.",
        "System components scale horizontally as needed.",
      ],
      learningsInMD: `### Key Learnings
  
  - Managing group chat dynamics.
  - Implementing presence detection.
  - Handling concurrent updates.`,
      resources: {
        documentation: [
          {
            title: "Firebase Realtime Database",
            url: "https://firebase.google.com/docs/database",
            description: "Real-time database for managing group chat state"
          },
          {
            title: "Redis PubSub",
            url: "https://redis.io/topics/pubsub",
            description: "Redis PubSub for real-time message broadcasting"
          }
        ],
        realWorldCases: [
          {
            name: "Telegram Group Chat System",
            url: "https://telegram.org/blog/shared-files",
            description: "How Telegram implements large group chats"
          }
        ],
        bestPractices: [
          {
            title: "Group Chat Management",
            description: "Implement efficient message fan-out for group chats",
            example: "Use Redis pub/sub for real-time group message delivery"
          },
          {
            title: "Presence System",
            description: "Design efficient online/offline status tracking",
            example: "Heartbeat system with Redis TTL for presence detection"
          }
        ]
      }
    },
  ],
  generalLearnings: [
    "Understanding the fundamentals of designing a scalable, real-time chat application.",
    "Applying system design principles to handle authentication, data persistence, and scalability.",
    "Learning how to incrementally add features while considering performance and user experience.",
  ],
};

export default challenge;
