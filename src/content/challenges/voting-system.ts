import { type Challenge } from "./types";

const votingChallenge: Challenge = {
  slug: "simple-polling-service",
  title: "Basic Voting System Design",
  description:
    "Design a simple voting system for creating polls and collecting responses",
  difficulty: "Easy",
  isFree: false,
  stages: [
    {
      problem: "Users want to create simple yes/no polls",
      requirements: [
        "Create polls with questions",
        "Vote submission system",
        "Display real-time results",
        "Handle 500 concurrent users",
      ],
      metaRequirements: [
        "Poll creation and management",
        "Real-time vote counting",
        "Anonymous voting",
        "500 concurrent users",
      ],
      hintsPerArea: {
        requirements: {
          functional: ["Simple voting mechanism", "Results calculation"],
          nonFunctional: ["Immediate results update", "Concurrency handling"],
        },
        systemAPI: [
          "POST /polls {question}",
          "POST /polls/{id}/vote {choice}",
          "GET /polls/{id}/results",
        ],
        capacityEstimations: {
          traffic: ["1 vote/sec peak", "100 new polls/day"],
          storage: ["In-memory storage initially"],
          memory: ["Store polls and vote counts"],
          bandwidth: ["Small JSON payloads"],
        },
        highLevelDesign: [
          "REST API service",
          "In-memory data store",
          "Atomic counters for votes",
        ],
      },
      criteria: [
        "Poll creation implemented",
        "Vote submission working",
        "Real-time results display",
      ],
      learningsInMD: `
- Basic REST API design
- Atomic operations for concurrency
- Simple data modeling
- In-memory storage tradeoffs`,
    },
    {
      problem: "Polls reset when server restarts",
      requirements: [
        "Persist polls and votes",
        "Support 10,000 active polls",
        "Ensure vote integrity",
        "Maintain <1s response time",
      ],
      metaRequirements: [
        "Persistent poll storage",
        "10,000 active polls capacity",
        "Vote integrity guarantees",
        "<1s response time",
      ],
      hintsPerArea: {
        requirements: {
          functional: ["Database selection", "ACID transactions"],
          nonFunctional: ["Durability requirements", "Read performance"],
        },
        systemAPI: ["Database schema design", "Batch vote processing"],
        capacityEstimations: {
          traffic: ["10 votes/sec sustained"],
          storage: ["10KB per poll = 100MB total"],
          memory: ["Cache popular polls"],
          bandwidth: ["Small JSON payloads"],
        },
        highLevelDesign: [
          "Relational database",
          "Connection pooling",
          "Cache-aside pattern",
        ],
      },
      criteria: [
        "Data persistence implemented",
        "Vote counts preserved",
        "Response time maintained",
      ],
      learningsInMD: `
- Database normalization basics
- ACID transactions
- Caching strategies
- Connection management`,
    },
    {
      problem: "Users want multiple-choice polls",
      requirements: [
        "Support 2-5 options per poll",
        "Prevent duplicate votes",
        "Handle 1000 votes/minute",
        "Visualize vote distribution",
      ],
      metaRequirements: [
        "Multiple-choice polls",
        "Duplicate vote prevention",
        "1000 votes/minute capacity",
        "Results visualization",
      ],
      hintsPerArea: {
        requirements: {
          functional: ["IP-based tracking", "Options validation"],
          nonFunctional: ["Storage optimization", "UI rendering"],
        },
        systemAPI: ["PUT /polls/{id} (add options)", "GET /polls/{id}/chart"],
        capacityEstimations: {
          traffic: ["16 votes/sec"],
          storage: ["Option-based vote counting"],
          memory: ["IP address tracking store"],
          bandwidth: ["Small JSON payloads"],
        },
        highLevelDesign: [
          "Redis for IP tracking",
          "Chart generation service",
          "Vertical scaling strategy",
        ],
      },
      criteria: [
        "Multiple-choice support",
        "Duplicate voting prevention",
        "Visualization endpoint",
      ],
      learningsInMD: `
- IP tracking limitations
- Server-side chart generation
- Vertical scaling concepts
- Data structure optimization`,
    },
    {
      problem: "Need basic user authentication",
      requirements: [
        "Email-based signup",
        "User-owned polls",
        "Vote history tracking",
        "Handle 10k registered users",
      ],
      metaRequirements: [
        "User authentication",
        "Poll ownership",
        "Vote history",
        "10k user capacity",
      ],
      hintsPerArea: {
        requirements: {
          functional: ["Session management", "Ownership mapping"],
          nonFunctional: ["Privacy requirements", "Data isolation"],
        },
        systemAPI: ["POST /signup", "GET /users/{id}/polls"],
        capacityEstimations: {
          traffic: ["Add 5% auth-related requests"],
          storage: ["User credentials storage"],
          memory: ["Session storage"],
          bandwidth: ["Small JSON payloads"],
        },
        highLevelDesign: [
          "Password hashing",
          "Relationship mapping in DB",
          "Index optimization",
        ],
      },
      criteria: [
        "User registration implemented",
        "Poll ownership tracking",
        "Vote history storage",
      ],
      learningsInMD: `
- Basic auth implementation
- Password security
- Database relationships
- Ownership patterns`,
    },
  ],
  generalLearnings: [
    "CRUD operations design",
    "Database schema modeling",
    "Basic authentication flows",
    "Concurrency control basics",
    "Simple visualization techniques",
    "Capacity planning fundamentals",
    "API versioning basics",
    "Data integrity patterns",
    "Vertical scaling approaches",
    "Basic monitoring setup",
  ],
};

export default votingChallenge;
