import { type Challenge } from "./types";

export const RealTimeVotingChallenge: Challenge = {
  slug: "real-time-voting",
  title: "Real-Time Voting System Design",
  description:
    "Design a scalable real-time voting system that can handle millions of concurrent votes while maintaining consistency and providing instant results updates.",
  difficulty: "Medium",
  isFree: false,
  generalLearnings: [
    "Real-time data processing and propagation techniques",
    "Consistency patterns in distributed systems",
    "Scalable vote counting and aggregation strategies",
    "WebSocket and real-time communication protocols",
    "Race condition handling in distributed systems",
    "Message queue patterns for real-time updates",
  ],
  stages: [
    // Stage 1: Basic Voting
    {
      problem: "Users need to cast votes and see results for a single poll",
      requirements: [
        "System should handle 100 votes per second for a single poll with results updated within 1 second",
      ],
      metaRequirements: [
        "System should handle 100 votes per second for a single poll with results updated within 1 second",
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider vote validation rules",
            "Think about results calculation approach",
          ],
          nonFunctional: [
            "Results must update within 1 second",
            "Consider vote durability guarantees",
          ],
        },
        systemAPI: [
          "What endpoints needed for voting?",
          "How to structure real-time updates?",
        ],
        capacityEstimations: {
          traffic: [
            "Calculate votes per second",
            "Estimate result update frequency",
          ],
          storage: [
            "Calculate vote storage size",
            "Consider results storage approach",
          ],
          memory: [
            "Estimate active poll data size",
            "Consider caching strategy",
          ],
          bandwidth: [
            "Calculate vote submission size",
            "Estimate results update size",
          ],
        },
        highLevelDesign: [
          "Consider WebSocket for real-time updates",
          "Think about vote storage design",
        ],
      },
      criteria: [
        "Can process votes correctly",
        "Updates results within 1 second",
        "Maintains vote integrity",
      ],
      learningsInMD: `
## Key Learnings
- Real-time update patterns
- Basic vote processing
- WebSocket implementation
- Simple data consistency

## Technical Concepts
- WebSocket vs HTTP polling
- Vote aggregation methods
- Basic race condition handling
      `,
      resources: {
        documentation: [
          {
            title: "WebSocket Protocol",
            url: "https://developer.mozilla.org/en-US/docs/Web/API/WebSocket",
            description: "Understanding WebSocket for real-time communication",
          },
        ],
        realWorldCases: [
          {
            name: "Twitter Polls",
            url: "https://blog.twitter.com/engineering",
            description: "Real-world implementation of real-time voting",
          },
        ],
        bestPractices: [
          {
            title: "Vote Processing",
            description:
              "Implement atomic vote counting to prevent race conditions",
            example: "Using Redis INCR for atomic counters",
          },
        ],
      },
    },
    // Stage 2: Multiple Concurrent Polls
    {
      problem:
        "System needs to handle multiple concurrent polls with high vote volume",
      requirements: [
        "System should handle 1000 concurrent polls with 10,000 total votes per second while maintaining real-time updates",
      ],
      metaRequirements: [
        "System should handle 100 votes per second for a single poll with results updated within 1 second",
        "System should handle 1000 concurrent polls with 10,000 total votes per second while maintaining real-time updates",
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider vote distribution across polls",
            "Think about result aggregation strategy",
          ],
          nonFunctional: [
            "Maintain update latency under load",
            "Consider system scalability",
          ],
        },
        systemAPI: [
          "How to handle poll creation/management?",
          "What batch operations might help?",
        ],
        capacityEstimations: {
          traffic: [
            "Calculate peak vote rates",
            "Estimate WebSocket connections",
          ],
          storage: [
            "Calculate multi-poll storage needs",
            "Consider result history storage",
          ],
          memory: [
            "Estimate active polls memory usage",
            "Calculate connection state size",
          ],
          bandwidth: [
            "Calculate total update bandwidth",
            "Consider connection overhead",
          ],
        },
        highLevelDesign: [
          "Consider message queue integration",
          "Think about connection management",
        ],
      },
      criteria: [
        "Handles multiple concurrent polls",
        "Maintains performance under load",
        "Scales horizontally",
      ],
      learningsInMD: `
## Key Learnings
- Horizontal scaling patterns
- Connection pooling
- Message queue usage
- Load distribution

## Technical Concepts
- WebSocket clustering
- Vote aggregation at scale
- Message queue patterns
      `,
      resources: {
        documentation: [
          {
            title: "Scaling WebSocket",
            url: "https://www.nginx.com/blog/websocket-nginx",
            description: "Strategies for scaling WebSocket connections",
          },
        ],
        realWorldCases: [
          {
            name: "Reddit Live Voting",
            url: "https://www.reddit.com/r/engineering",
            description: "Large-scale voting system implementation",
          },
        ],
        bestPractices: [
          {
            title: "Connection Management",
            description:
              "Implement connection pooling and heartbeat mechanisms",
            example: "Using Socket.IO with Redis adapter",
          },
        ],
      },
    },
    // Stage 3: Vote Security and Integrity
    {
      problem:
        "System needs to prevent vote manipulation and ensure one vote per user",
      requirements: [
        "Implement secure voting with deduplication while maintaining system performance",
      ],
      metaRequirements: [
        "System should handle 100 votes per second for a single poll with results updated within 1 second",
        "System should handle 1000 concurrent polls with 10,000 total votes per second while maintaining real-time updates",
        "Implement secure voting with deduplication while maintaining system performance",
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider user authentication method",
            "Think about vote verification process",
          ],
          nonFunctional: [
            "Maintain vote integrity",
            "Consider security overhead",
          ],
        },
        systemAPI: [
          "How to handle user authentication?",
          "What verification endpoints needed?",
        ],
        capacityEstimations: {
          traffic: [
            "Calculate verification overhead",
            "Estimate authentication rate",
          ],
          storage: [
            "Calculate user tracking storage",
            "Consider audit log size",
          ],
          memory: [
            "Estimate session data size",
            "Calculate verification cache size",
          ],
          bandwidth: [
            "Calculate authentication overhead",
            "Estimate verification traffic",
          ],
        },
        highLevelDesign: [
          "Consider authentication service",
          "Think about vote verification flow",
        ],
      },
      criteria: [
        "Prevents duplicate votes",
        "Ensures vote authenticity",
        "Maintains system performance",
      ],
      learningsInMD: `
## Key Learnings
- Authentication patterns
- Vote verification strategies
- Security in distributed systems
- Rate limiting approaches

## Technical Concepts
- Distributed session management
- Vote deduplication techniques
- Rate limiting algorithms
      `,
      resources: {
        documentation: [
          {
            title: "Distributed Rate Limiting",
            url: "https://redis.io/commands/incr",
            description: "Implementation of distributed rate limiting",
          },
        ],
        realWorldCases: [
          {
            name: "Facebook Polls Security",
            url: "https://engineering.fb.com",
            description: "Security measures in large-scale voting",
          },
        ],
        bestPractices: [
          {
            title: "Vote Verification",
            description: "Implement token-based voting with rate limiting",
            example: "Using JWT tokens with Redis rate limiting",
          },
        ],
      },
    },
    // Stage 4: Global Distribution
    {
      problem:
        "System needs to handle voters from multiple geographic regions with low latency",
      requirements: [
        "Support global voting with regional latency under 100ms while maintaining vote consistency",
      ],
      metaRequirements: [
        "System should handle 100 votes per second for a single poll with results updated within 1 second",
        "System should handle 1000 concurrent polls with 10,000 total votes per second while maintaining real-time updates",
        "Implement secure voting with deduplication while maintaining system performance",
        "Support global voting with regional latency under 100ms while maintaining vote consistency",
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider regional vote processing",
            "Think about global result aggregation",
          ],
          nonFunctional: [
            "Maintain global consistency",
            "Consider regional failures",
          ],
        },
        systemAPI: [
          "How to handle regional endpoints?",
          "What changes for global aggregation?",
        ],
        capacityEstimations: {
          traffic: [
            "Calculate regional vote distribution",
            "Estimate cross-region traffic",
          ],
          storage: [
            "Consider regional storage needs",
            "Calculate replication overhead",
          ],
          memory: [
            "Estimate regional cache sizes",
            "Consider global state size",
          ],
          bandwidth: [
            "Calculate cross-region bandwidth",
            "Estimate replication traffic",
          ],
        },
        highLevelDesign: [
          "Consider global load balancing",
          "Think about regional processing",
        ],
      },
      criteria: [
        "Provides low-latency global access",
        "Maintains vote consistency",
        "Handles regional failures",
      ],
      learningsInMD: `
## Key Learnings
- Global system design
- Consistency patterns
- Regional processing
- Failure handling

## Technical Concepts
- Global load balancing
- Regional data processing
- Cross-region replication
- CAP theorem implications
      `,
      resources: {
        documentation: [
          {
            title: "Global Application Architecture",
            url: "https://aws.amazon.com/global-accelerator",
            description: "Building globally distributed applications",
          },
        ],
        realWorldCases: [
          {
            name: "Instagram Polls",
            url: "https://instagram-engineering.com",
            description: "Global voting system implementation",
          },
        ],
        bestPractices: [
          {
            title: "Global Distribution",
            description:
              "Implement regional processing with global aggregation",
            example: "Using AWS Global Accelerator with regional processing",
          },
        ],
      },
    },
  ],
};

export default RealTimeVotingChallenge;
