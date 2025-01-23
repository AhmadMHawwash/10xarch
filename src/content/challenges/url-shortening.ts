import { type Challenge } from "./types";

const urlShortenerChallenge: Challenge = {
  slug: "basic-url-shortener",
  title: "Basic URL Shortener Service",
  description: "Design a simple URL shortening service that teaches fundamental system design principles",
  difficulty: "Easy",
  isFree: true,
  stages: [
    {
      problem: "Users need to convert long URLs into short, shareable links",
      requirements: [
        "Generate short aliases for long URLs",
        "Redirect to original URL when short link is accessed",
        "Handle 1000 requests/minute",
        "No persistence required initially"
      ],
      metaRequirements: [
        "Generate short URLs",
        "Immediate redirection",
        "Handle 1000 RPM",
        "No persistence needed"
      ],
      hintsPerArea: {
        requirements: {
          functional: ["Hash-based shortening", "Redirect mechanism"],
          nonFunctional: ["Low latency redirects", "High availability"]
        },
        systemAPI: [
          "POST /api/v1/shorten {longUrl} → {shortUrl}",
          "GET /{shortCode} → 301 redirect"
        ],
        capacityEstimations: {
          traffic: ["1000 requests/min = ~17 RPS"],
          storage: ["In-memory key-value store"],
          memory: ["Estimate 1KB per URL mapping"],
          bandwidth: ["Small redirect responses"]
        },
        highLevelDesign: [
          "Stateless web service",
          "Hash function selection",
          "Load balancer setup"
        ]
      },
      criteria: [
        "Valid short URL generation",
        "Successful redirects",
        "Handles 1000 RPM"
      ],
      learningsInMD: `
- Basic hashing techniques
- HTTP status codes (301 vs 302)
- Load balancing fundamentals
- Stateless architecture benefits`
    },
    {
      problem: "Links disappear after server restart",
      requirements: [
        "Persist URL mappings",
        "Ensure 200ms max redirect time",
        "Support 1 million stored URLs",
        "Handle 5000 RPM"
      ],
      metaRequirements: [
        "Persistent URL storage",
        "200ms max redirect time",
        "Support 1M URLs",
        "Handle 5000 RPM"
      ],
      hintsPerArea: {
        requirements: {
          functional: ["Database choice", "Cache integration"],
          nonFunctional: ["Durability requirements", "Read optimization"]
        },
        systemAPI: [
          "Database connection management",
          "Cache GET endpoints"
        ],
        capacityEstimations: {
          traffic: ["5000 RPM = ~83 RPS"],
          storage: ["1M URLs * 1KB = 1GB"],
          memory: ["Cache 20% frequent URLs"],
          bandwidth: ["Consider database traffic"]
        },
        highLevelDesign: [
          "Relational vs NoSQL choice",
          "Cache-aside pattern",
          "Database indexing"
        ]
      },
      criteria: [
        "Data persistence across restarts",
        "Redirects under 200ms",
        "Supports 1M URL storage"
      ],
      learningsInMD: `
- Database selection criteria
- Caching strategies
- Index optimization
- ACID vs BASE tradeoffs`
    },
    {
      problem: "Users want basic click analytics",
      requirements: [
        "Track click counts",
        "Show stats via API",
        "Handle 10k RPM",
        "Keep data for 30 days"
      ],
      metaRequirements: [
        "Persistent URL storage",
        "Click analytics tracking",
        "30-day data retention",
        "Handle 10k RPM"
      ],
      hintsPerArea: {
        requirements: {
          functional: ["Asynchronous logging", "Analytics aggregation"],
          nonFunctional: ["Write optimization", "Data retention"]
        },
        systemAPI: [
          "GET /api/v1/stats/{shortCode}",
          "Async click tracking endpoint"
        ],
        capacityEstimations: {
          traffic: ["10k RPM = ~166 RPS"],
          storage: ["1M URLs * 100 clicks/day = 3GB/month"],
          memory: ["Batching writes"],
          bandwidth: ["Analytics data overhead"]
        },
        highLevelDesign: [
          "Write-ahead logging",
          "Analytics pipeline",
          "Time-series database"
        ]
      },
      criteria: [
        "Click tracking implemented",
        "Stats retrieval API",
        "Handles 10k RPM"
      ],
      learningsInMD: `
- Write-optimized databases
- Batching techniques
- Analytics pipeline design
- Time-series data management`
    },
    {
      problem: "Users request custom short links",
      requirements: [
        "Allow custom slugs",
        "Validate slug availability",
        "Prevent abuse",
        "Maintain <300ms response"
      ],
      metaRequirements: [
        "Custom slug support",
        "Slug validation",
        "Anti-abuse measures",
        "<300ms response time"
      ],
      hintsPerArea: {
        requirements: {
          functional: ["Slug reservation", "Conflict resolution"],
          nonFunctional: ["Atomic operations", "Rate limiting"]
        },
        systemAPI: [
          "POST /api/v1/custom {longUrl, customSlug}",
          "GET /api/v1/check/{slug}"
        ],
        capacityEstimations: {
          traffic: ["Add 20% check requests"],
          storage: ["Slug reservation system"],
          memory: ["Bloom filter for checks"],
          bandwidth: ["Additional API calls"]
        },
        highLevelDesign: [
          "Distributed locking",
          "Bloom filter cache",
          "Rate limiting"
        ]
      },
      criteria: [
        "Custom slug support",
        "Collision prevention",
        "Abuse protection"
      ],
      learningsInMD: `
- Distributed locking
- Bloom filter applications
- Rate limiting patterns
- Conflict resolution strategies`
    }
  ],
  generalLearnings: [
    "Hash function selection tradeoffs",
    "Cache invalidation strategies",
    "Read vs write optimization",
    "Database indexing fundamentals",
    "Basic analytics pipeline design",
    "Concurrency control basics",
    "Rate limiting implementation",
    "Capacity planning essentials",
    "ASCII encoding considerations",
    "Basic monitoring metrics"
  ]
};

export default urlShortenerChallenge;