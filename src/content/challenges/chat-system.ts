import { type Challenge } from "./types";

const challenge: Challenge = {
  slug: "real-time-chat-application",
  title: "Real-Time Chat",
  description:
    "Design a chat application that allows users to send and receive messages in real-time.",
  difficulty: "Easy",
  stages: [
    {
      problem: "Users need a way to send and receive messages in real-time.",
      requirements: [
        "Implement a real-time messaging feature that allows users to send and receive messages instantly.",
        "Support up to 100 concurrent users.",
      ],
      metaRequirements: [
        "Implement a real-time messaging feature that allows users to send and receive messages instantly.",
        "Support up to 100 concurrent users.",
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Users should be able to send and receive text messages.",
            "Messages should be delivered instantly to all connected users.",
          ],
          nonFunctional: [
            "The system should handle up to 100 concurrent users without significant delays.",
            "Ensure low latency in message delivery.",
          ],
        },
        systemAPI: [
          "Consider using WebSocket connections for real-time communication.",
          "Design simple APIs for sending and receiving messages.",
        ],
        capacityEstimations: {
          traffic: [
            "Estimate the number of messages per second based on 100 concurrent users.",
            "Assume each user sends a message every 10 seconds on average.",
          ],
          storage: [
            "Since messages are not persisted yet, storage requirements are minimal.",
          ],
          memory: [
            "Estimate the memory needed to maintain open connections for 100 users.",
          ],
          bandwidth: [
            "Calculate the inbound and outbound bandwidth based on message size and frequency.",
          ],
        },
        highLevelDesign: [
          "Use a central server to manage connections and message routing.",
          "Consider technologies like WebSockets for real-time communication.",
        ],
      },
      criteria: [
        "Real-time messaging feature is implemented.",
        "Supports up to 100 concurrent users.",
        "Messages are delivered instantly to all connected users.",
      ],
      learningsInMD:
        "### Key Learnings\n- Understanding real-time communication protocols like WebSockets.\n- Designing for low latency and handling concurrent connections.\n- Estimating capacity for basic traffic scenarios.",
    },
    {
      problem:
        "Users are requesting the ability to have private conversations.",
      requirements: [
        "Implement user authentication so users can log in.",
        "Allow users to have one-on-one private chats.",
      ],
      metaRequirements: [
        "Implement a real-time messaging feature that allows users to send and receive messages instantly.",
        "Support up to 100 concurrent users.",
        "Implement user authentication so users can log in.",
        "Allow users to have one-on-one private chats.",
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Users should be able to create accounts and log in.",
            "Authenticated users can initiate private chats with other users.",
          ],
          nonFunctional: [
            "Ensure user data is securely stored.",
            "Authentication process should be quick and reliable.",
          ],
        },
        systemAPI: [
          "Design APIs for user registration and authentication.",
          "Update messaging APIs to handle private messages between two users.",
        ],
        capacityEstimations: {
          traffic: [
            "Consider the increase in API calls due to authentication processes.",
            "Estimate private message traffic.",
          ],
          storage: [
            "Account for storage needed for user credentials.",
            "Messages are still not persisted.",
          ],
          memory: ["Slight increase due to session management."],
          bandwidth: [
            "Bandwidth usage may increase slightly due to authentication and private messages.",
          ],
        },
        highLevelDesign: [
          "Introduce an authentication service to handle user login.",
          "Update the messaging component to handle private channels.",
        ],
      },
      criteria: [
        "Users can create accounts and log in.",
        "Users can have one-on-one private chats.",
        "All previous criteria are still met.",
      ],
      learningsInMD:
        "### Key Learnings\n- Implementing user authentication securely.\n- Managing user sessions and maintaining state.\n- Extending the messaging system to support private communication.",
    },
    {
      problem: "Users want to be able to form groups and chat together.",
      requirements: [
        "Implement chat rooms where multiple users can join and chat.",
        "Allow users to create and manage their own chat rooms.",
      ],
      metaRequirements: [
        "Implement a real-time messaging feature that allows users to send and receive messages instantly.",
        "Support up to 100 concurrent users.",
        "Implement user authentication so users can log in.",
        "Allow users to have one-on-one private chats.",
        "Implement chat rooms where multiple users can join and chat.",
        "Allow users to create and manage their own chat rooms.",
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Users can create chat rooms with unique names.",
            "Users can join existing chat rooms and participate in group chats.",
          ],
          nonFunctional: [
            "Ensure chat rooms can handle up to 50 users without performance degradation.",
            "Manage resource allocation efficiently for multiple chat rooms.",
          ],
        },
        systemAPI: [
          "Design APIs for creating, joining, and leaving chat rooms.",
          "Modify messaging APIs to handle messages within chat rooms.",
        ],
        capacityEstimations: {
          traffic: [
            "Estimate increased message traffic due to group chats.",
            "Consider peak times when multiple chat rooms are active.",
          ],
          storage: [
            "Minimal increase for storing chat room metadata.",
            "Messages are still not persisted.",
          ],
          memory: [
            "Memory usage will increase with the number of active chat rooms.",
          ],
          bandwidth: [
            "Bandwidth requirements will increase due to group messaging.",
          ],
        },
        highLevelDesign: [
          "Implement a chat room management component.",
          "Use publish-subscribe patterns to handle messages in chat rooms.",
        ],
      },
      criteria: [
        "Users can create and manage chat rooms.",
        "Multiple users can join and chat in a room.",
        "All previous criteria are still met.",
      ],
      learningsInMD:
        "### Key Learnings\n- Designing systems for group communication.\n- Managing resources for scalable chat rooms.\n- Implementing publish-subscribe patterns.",
    },
    {
      problem: "Users are losing their messages when they disconnect.",
      requirements: [
        "Implement message persistence so users can see past messages when they reconnect.",
        "Store messages for up to 7 days.",
      ],
      metaRequirements: [
        "Implement a real-time messaging feature that allows users to send and receive messages instantly.",
        "Support up to 100 concurrent users.",
        "Implement user authentication so users can log in.",
        "Allow users to have one-on-one private chats.",
        "Implement chat rooms where multiple users can join and chat.",
        "Allow users to create and manage their own chat rooms.",
        "Implement message persistence so users can see past messages when they reconnect.",
        "Store messages for up to 7 days.",
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Messages should be stored in a database.",
            "Users can see the last 7 days of messages when they join a chat.",
          ],
          nonFunctional: [
            "Ensure message retrieval is fast.",
            "Manage storage efficiently to handle message data.",
          ],
        },
        systemAPI: [
          "Update APIs to fetch historical messages upon joining a chat.",
          "Design data models for storing messages.",
        ],
        capacityEstimations: {
          traffic: [
            "Increased read operations to fetch historical messages.",
            "Write operations to store messages.",
          ],
          storage: [
            "Calculate storage needs based on message volume over 7 days.",
            "Estimate message size and frequency.",
          ],
          memory: ["Potential caching of recent messages."],
          bandwidth: [
            "Bandwidth will increase due to message history being sent to users.",
          ],
        },
        highLevelDesign: [
          "Integrate a database to store messages.",
          "Implement efficient querying for message retrieval.",
        ],
      },
      criteria: [
        "Messages are persisted and retrievable for up to 7 days.",
        "Users can see past messages when they join a chat.",
        "All previous criteria are still met.",
      ],
      learningsInMD:
        "### Key Learnings\n- Implementing data persistence.\n- Designing databases for storing time-series data.\n- Balancing storage costs with data retention policies.",
    },
    {
      problem: "Inappropriate content is being shared in chat rooms.",
      requirements: [
        "Implement basic moderation features.",
        "Allow users to report messages or users for inappropriate content.",
      ],
      metaRequirements: [
        "Implement a real-time messaging feature that allows users to send and receive messages instantly.",
        "Support up to 100 concurrent users.",
        "Implement user authentication so users can log in.",
        "Allow users to have one-on-one private chats.",
        "Implement chat rooms where multiple users can join and chat.",
        "Allow users to create and manage their own chat rooms.",
        "Implement message persistence so users can see past messages when they reconnect.",
        "Store messages for up to 7 days.",
        "Implement basic moderation features.",
        "Allow users to report messages or users for inappropriate content.",
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Users can report messages or users.",
            "Moderators can review reports and take action.",
          ],
          nonFunctional: [
            "Ensure the reporting process is simple and quick.",
            "Protect against abuse of the reporting system.",
          ],
        },
        systemAPI: [
          "Design APIs for reporting messages and users.",
          "Create admin interfaces for moderators.",
        ],
        capacityEstimations: {
          traffic: [
            "Estimate the number of reports per day.",
            "Consider additional load on the system.",
          ],
          storage: ["Store reports and moderation actions."],
          memory: [
            "Minimal impact unless real-time moderation notifications are used.",
          ],
          bandwidth: ["Slight increase due to reporting data."],
        },
        highLevelDesign: [
          "Implement a moderation service.",
          "Design workflows for report handling.",
        ],
      },
      criteria: [
        "Users can report messages or users.",
        "Moderators can review and act on reports.",
        "All previous criteria are still met.",
      ],
      learningsInMD:
        "### Key Learnings\n- Implementing moderation workflows.\n- Designing systems to handle user-generated reports.\n- Ensuring compliance with content policies.",
    },
  ],
  generalLearnings: [
    "Real-time communication protocols and technologies.",
    "User authentication and session management.",
    "Designing scalable systems for group communication.",
    "Data persistence and database design for message storage.",
    "Implementing moderation and content management systems.",
  ],
};

export default challenge;
