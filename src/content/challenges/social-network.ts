import { type Challenge } from "./types";

const socialNetworkChallenge: Challenge = {
  slug: "distributed-social-network",
  title: "Distributed Social Network System Design",
  description: "Design a highly scalable distributed social network focusing on feed generation, content delivery, and real-time interactions. Learn advanced concepts in distributed systems, data consistency, and large-scale data processing.",
  difficulty: "Hard",
  isFree: false,
  stages: [
    {
      problem: "Users need to post content and view personalized feeds in real-time",
      requirements: [
        "Build a feed system handling 100 million daily active users with feed generation latency < 500ms and 99.99% availability"
      ],
      metaRequirements: [
        "Build a feed system handling 100 million daily active users with feed generation latency < 500ms and 99.99% availability"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design post creation and storage",
            "Plan feed generation algorithm",
            "Consider content ranking system"
          ],
          nonFunctional: [
            "Feed generation under 500ms",
            "Handle massive concurrent reads",
            "Ensure high availability"
          ]
        },
        systemAPI: [
          "Post creation endpoints",
          "Feed generation API",
          "Content ranking endpoints"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate posts per second",
            "Estimate feed request rate",
            "Project data growth rate"
          ],
          storage: [
            "Post data volume",
            "User graph storage",
            "Feed cache requirements"
          ],
          memory: [
            "Feed cache size",
            "User graph cache",
            "Ranking model cache"
          ],
          bandwidth: [
            "Post ingestion bandwidth",
            "Feed delivery size",
            "Cache sync traffic"
          ]
        },
        highLevelDesign: [
          "Feed service architecture",
          "Storage sharding strategy",
          "Caching hierarchy design"
        ]
      },
      criteria: [
        "System handles 100M daily active users",
        "Feed generation under 500ms",
        "Maintains 99.99% availability"
      ],
      learningsInMD: "Learn about feed generation algorithms, content ranking systems, and handling massive read workloads in distributed systems.",
      resources: {
        documentation: [
          {
            title: "Feed Generation",
            url: "https://instagram-engineering.com/building-instagram-feed-performance-and-scalability-b05c762023ca",
            description: "Understanding feed generation and optimization techniques"
          }
        ],
        realWorldCases: [
          {
            name: "Twitter",
            url: "https://blog.twitter.com/engineering/en_us/topics/infrastructure/2017/the-infrastructure-behind-twitter-scale",
            description: "How Twitter handles feed generation at scale"
          }
        ],
        bestPractices: [
          {
            title: "Feed Architecture",
            description: "Implement hybrid push/pull model for feed generation",
            example: "Push updates to active users, pull for inactive users to optimize resources"
          }
        ]
      }
    },
    {
      problem: "System needs to handle real-time interactions and notifications across global regions",
      requirements: [
        "Support 1 million concurrent real-time connections per region across 10 global regions with < 100ms notification latency"
      ],
      metaRequirements: [
        "Build a feed system handling 100 million daily active users with feed generation latency < 500ms and 99.99% availability",
        "Support 1 million concurrent real-time connections per region across 10 global regions with < 100ms notification latency"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design global presence system",
            "Plan notification routing",
            "Consider consistency model"
          ],
          nonFunctional: [
            "Notification latency < 100ms",
            "Handle regional failures",
            "Ensure message ordering"
          ]
        },
        systemAPI: [
          "Presence management API",
          "Real-time event system",
          "Cross-region sync API"
        ],
        capacityEstimations: {
          traffic: [
            "Concurrent connections per region",
            "Event rate per connection",
            "Cross-region sync volume"
          ],
          storage: [
            "Presence data size",
            "Event buffer storage",
            "Connection state data"
          ],
          memory: [
            "Connection state cache",
            "Event routing tables",
            "Presence information"
          ],
          bandwidth: [
            "Event propagation traffic",
            "Cross-region replication",
            "Client connection overhead"
          ]
        },
        highLevelDesign: [
          "Global presence architecture",
          "Event routing system",
          "Regional failover design"
        ]
      },
      criteria: [
        "Handles 1M concurrent connections per region",
        "Notification latency under 100ms",
        "Correct message ordering"
      ],
      learningsInMD: "Learn about global distributed systems, real-time event processing, and handling cross-region consistency.",
      resources: {
        documentation: [
          {
            title: "WebSocket at Scale",
            url: "https://www.nginx.com/blog/websocket-nginx/",
            description: "Understanding WebSocket scaling challenges"
          }
        ],
        realWorldCases: [
          {
            name: "Discord",
            url: "https://discord.com/blog/how-discord-handles-millions-of-concurrent-voice-users",
            description: "Discord's approach to real-time communication"
          }
        ],
        bestPractices: [
          {
            title: "Global Distribution",
            description: "Implement regional presence with eventual consistency",
            example: "Use regional event hubs with cross-region replication for global state"
          }
        ]
      }
    },
    {
      problem: "Platform needs to handle media processing and global content delivery",
      requirements: [
        "Process and deliver 500TB of new media daily with 99.999% durability and global access latency < 200ms"
      ],
      metaRequirements: [
        "Build a feed system handling 100 million daily active users with feed generation latency < 500ms and 99.99% availability",
        "Support 1 million concurrent real-time connections per region across 10 global regions with < 100ms notification latency",
        "Process and deliver 500TB of new media daily with 99.999% durability and global access latency < 200ms"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design media processing pipeline",
            "Plan CDN integration",
            "Consider transcoding system"
          ],
          nonFunctional: [
            "Global access latency < 200ms",
            "99.999% data durability",
            "Optimize storage costs"
          ]
        },
        systemAPI: [
          "Media upload endpoints",
          "Processing pipeline API",
          "CDN management system"
        ],
        capacityEstimations: {
          traffic: [
            "Media upload rate",
            "Processing pipeline throughput",
            "CDN request volume"
          ],
          storage: [
            "Raw media storage",
            "Processed formats size",
            "Metadata volume"
          ],
          memory: [
            "Processing pipeline buffers",
            "CDN cache size",
            "Metadata cache"
          ],
          bandwidth: [
            "Upload ingestion capacity",
            "CDN distribution traffic",
            "Processing pipeline throughput"
          ]
        },
        highLevelDesign: [
          "Media processing architecture",
          "Global CDN design",
          "Storage tiering strategy"
        ]
      },
      criteria: [
        "Handles 500TB daily media processing",
        "Maintains 99.999% durability",
        "Global access under 200ms"
      ],
      learningsInMD: "Learn about large-scale media processing, content delivery networks, and distributed storage systems.",
      resources: {
        documentation: [
          {
            title: "Media Processing",
            url: "https://aws.amazon.com/media/",
            description: "Understanding media processing and delivery"
          }
        ],
        realWorldCases: [
          {
            name: "Netflix",
            url: "https://netflixtechblog.com/high-quality-video-encoding-at-scale-d159db052746",
            description: "Netflix's media processing pipeline"
          }
        ],
        bestPractices: [
          {
            title: "Media Delivery",
            description: "Implement multi-tier storage with CDN integration",
            example: "Use hot storage for recent content, cold storage for archives, and CDN for popular content"
          }
        ]
      }
    },
    {
      problem: "System needs advanced analytics and recommendation engine",
      requirements: [
        "Build real-time analytics and recommendation system processing 1PB daily data with recommendation latency < 50ms"
      ],
      metaRequirements: [
        "Build a feed system handling 100 million daily active users with feed generation latency < 500ms and 99.99% availability",
        "Support 1 million concurrent real-time connections per region across 10 global regions with < 100ms notification latency",
        "Process and deliver 500TB of new media daily with 99.999% durability and global access latency < 200ms",
        "Build real-time analytics and recommendation system processing 1PB daily data with recommendation latency < 50ms"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design analytics pipeline",
            "Plan recommendation system",
            "Consider ML model serving"
          ],
          nonFunctional: [
            "Recommendation latency < 50ms",
            "Process 1PB daily data",
            "Real-time analytics updates"
          ]
        },
        systemAPI: [
          "Analytics ingestion API",
          "Recommendation endpoints",
          "Model serving system"
        ],
        capacityEstimations: {
          traffic: [
            "Event ingestion rate",
            "Recommendation request rate",
            "Model inference load"
          ],
          storage: [
            "Raw event data size",
            "Processed features volume",
            "Model storage requirements"
          ],
          memory: [
            "Feature store cache",
            "Model serving memory",
            "Analytics aggregations"
          ],
          bandwidth: [
            "Event ingestion bandwidth",
            "Feature update traffic",
            "Model distribution size"
          ]
        },
        highLevelDesign: [
          "Analytics pipeline architecture",
          "Recommendation system design",
          "Model serving infrastructure"
        ]
      },
      criteria: [
        "Processes 1PB daily data",
        "Recommendation latency under 50ms",
        "Real-time analytics updates"
      ],
      learningsInMD: "Learn about large-scale data processing, recommendation systems, and real-time analytics in distributed systems.",
      resources: {
        documentation: [
          {
            title: "Real-time Analytics",
            url: "https://spark.apache.org/docs/latest/structured-streaming-programming-guide.html",
            description: "Understanding real-time data processing"
          }
        ],
        realWorldCases: [
          {
            name: "LinkedIn",
            url: "https://engineering.linkedin.com/blog/2020/scaling-machine-learning-productivity",
            description: "LinkedIn's recommendation system"
          }
        ],
        bestPractices: [
          {
            title: "Recommendation Architecture",
            description: "Implement multi-stage recommendation pipeline",
            example: "Use candidate generation followed by ranking, with feature store for real-time serving"
          }
        ]
      }
    }
  ],
  generalLearnings: [
    "Designing highly scalable distributed systems",
    "Handling global real-time communications",
    "Managing large-scale data processing",
    "Implementing recommendation systems",
    "Optimizing for global content delivery",
    "Building real-time analytics pipelines"
  ]
};

export default socialNetworkChallenge; 