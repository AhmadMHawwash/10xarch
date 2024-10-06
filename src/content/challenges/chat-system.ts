import { type Challenge } from "./types";

const challenge: Challenge = {
  slug: "real-time-chat-application",
  title: "Real-Time Chat",
  description:
    "Design a chat application that allows users to send and receive messages in real-time.",
  difficulty: "Easy",
  stages: [
    // Stage 1
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
  
  - Implementing user authentication and authorization.
  - Securely storing user credentials.
  - Integrating authentication into existing systems.`,
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
  
  - Designing systems to handle group communication.
  - Managing state for multiple chat rooms and user memberships.
  - Routing messages to specific groups of users.`,
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
  
  - Implementing data persistence in applications.
  - Choosing appropriate databases for storing message data.
  - Designing efficient data retrieval mechanisms.`,
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
  
  - Designing systems for scalability.
  - Implementing load balancing and horizontal scaling.
  - Optimizing system performance under heavy load.`,
    },
  ],
  generalLearnings: [
    "Understanding the fundamentals of designing a scalable, real-time chat application.",
    "Applying system design principles to handle authentication, data persistence, and scalability.",
    "Learning how to incrementally add features while considering performance and user experience.",
  ],
};

export default challenge;
