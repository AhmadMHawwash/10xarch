import { type Challenge } from "./types";

const blogPlatformChallenge: Challenge = {
  slug: "blogging-platform",
  title: "Blogging Platform System Design",
  description:
    "Design a scalable blogging platform focusing on content delivery, user engagement, and performance optimization. Learn key concepts in distributed systems and content management.",
  difficulty: "Medium",
  isFree: false,
  stages: [
    {
      problem:
        "Users need a platform to write and publish blog posts with basic formatting capabilities",
      requirements: [
        "Support creating, reading, updating, and deleting blog posts with rich text formatting for 10,000 daily active users",
      ],
      metaRequirements: [
        "Support creating, reading, updating, and deleting blog posts with rich text formatting for 10,000 daily active users",
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider how to store formatted text data efficiently",
            "Think about post metadata structure (title, author, timestamp)",
            "Plan for draft saves and publishing workflow",
          ],
          nonFunctional: [
            "Posts should load within 2 seconds",
            "System should handle multiple concurrent editors",
            "Consider data consistency requirements for editing",
          ],
        },
        systemAPI: [
          "RESTful endpoints for CRUD operations",
          "Authentication headers structure",
          "Pagination parameters for post listings",
        ],
        capacityEstimations: {
          traffic: [
            "Calculate read vs. write ratio for blog posts",
            "Factor in concurrent users during peak hours",
          ],
          storage: [
            "Average post size including formatting",
            "Metadata storage requirements",
            "Draft version storage impact",
          ],
          memory: [
            "Session data size per user",
            "Caching requirements for popular posts",
          ],
          bandwidth: [
            "Data transfer for post creation/updates",
            "Bandwidth needs for serving posts to readers",
          ],
        },
        highLevelDesign: [
          "Consider separation of read and write paths",
          "Think about where to store post content vs metadata",
          "Plan for user authentication service placement",
        ],
      },
      criteria: [
        "System can handle CRUD operations for blog posts",
        "Rich text formatting data is properly stored and retrieved",
        "Basic user authentication is implemented",
        "Posts are served within 2 seconds",
      ],
      learningsInMD: `
## Key Learnings from Stage 1

### Data Modeling
- Structuring blog post content and metadata
- Handling rich text storage efficiently
- Managing relationships between posts and users

### API Design
- RESTful API principles for content management
- Authentication and authorization basics
- Pagination and filtering strategies

### Storage Considerations
- Choosing between SQL and NoSQL for post storage
- Metadata indexing strategies
- Draft version management
      `,
      resources: {
        documentation: [
          {
            title: "Database Schemas for Blog Platforms",
            url: "https://docs.mongodb.com/manual/core/data-modeling-introduction/",
            description:
              "Learn about effective schema design for content management systems",
          },
        ],
        realWorldCases: [
          {
            name: "Medium's Technical Architecture",
            url: "https://medium.engineering/",
            description:
              "How Medium handles content storage and delivery at scale",
          },
        ],
        bestPractices: [
          {
            title: "Content Storage Optimization",
            description:
              "Store metadata and content separately for better performance",
            example: "Use a document store for content and RDBMS for metadata",
          },
        ],
      },
    },
    {
      problem:
        "Users are experiencing slow load times for blog posts with high traffic",
      requirements: [
        "Reduce post load time to under 500ms for 100,000 daily active users",
      ],
      metaRequirements: [
        "Support creating, reading, updating, and deleting blog posts with rich text formatting for 100,000 daily active users",
        "Reduce post load time to under 500ms for 100,000 daily active users",
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Implement content caching strategy",
            "Consider CDN integration for static content",
            "Plan cache invalidation approach",
          ],
          nonFunctional: [
            "Maintain consistency across caching layers",
            "Handle cache misses gracefully",
            "Consider regional performance differences",
          ],
        },
        systemAPI: [
          "Cache-Control header usage",
          "ETags for content validation",
          "CDN configuration endpoints",
        ],
        capacityEstimations: {
          traffic: [
            "Cache hit ratio expectations",
            "Traffic distribution across regions",
          ],
          storage: ["Cache size requirements", "CDN storage needs"],
          memory: [
            "Memory requirements for caching layer",
            "Cache eviction policy impact",
          ],
          bandwidth: [
            "CDN bandwidth calculations",
            "Origin server bandwidth requirements",
          ],
        },
        highLevelDesign: [
          "Placement of caching layers",
          "CDN integration points",
          "Cache update flow",
        ],
      },
      criteria: [
        "Posts load in under 500ms for 95th percentile",
        "Cache hit ratio > 80%",
        "System handles 100,000 daily active users",
        "Cache consistency maintained during updates",
      ],
      learningsInMD: `
## Key Learnings from Stage 2

### Caching Strategies
- Multi-layer caching architecture
- Cache invalidation patterns
- Content delivery optimization

### Performance Optimization
- CDN integration and configuration
- Regional performance considerations
- Load time optimization techniques

### Scalability
- Horizontal scaling approaches
- Traffic management
- Resource optimization
      `,
      resources: {
        documentation: [
          {
            title: "CDN Best Practices",
            url: "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/best-practices.html",
            description: "Learn about CDN configuration and optimization",
          },
        ],
        realWorldCases: [
          {
            name: "WordPress.com Architecture",
            url: "https://wordpress.com/tech/",
            description: "How WordPress.com handles global content delivery",
          },
        ],
        bestPractices: [
          {
            title: "Cache Strategy",
            description:
              "Implement multiple caching layers with appropriate TTLs",
            example:
              "Browser cache -> CDN -> Application cache -> Database cache",
          },
        ],
      },
    },
    {
      problem:
        "Users want to interact with blog posts through comments and reactions",
      requirements: [
        "Support real-time comments and reactions for posts with 500,000 daily active users",
      ],
      metaRequirements: [
        "Support creating, reading, updating, and deleting blog posts with rich text formatting for 500,000 daily active users",
        "Reduce post load time to under 500ms for 500,000 daily active users",
        "Support real-time comments and reactions for posts with 500,000 daily active users",
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design real-time comment system",
            "Plan reaction types and storage",
            "Consider notification system for responses",
          ],
          nonFunctional: [
            "Ensure real-time updates under 100ms",
            "Handle comment threading efficiently",
            "Maintain comment order consistency",
          ],
        },
        systemAPI: [
          "WebSocket endpoints for real-time updates",
          "Comment pagination and threading API",
          "Reaction aggregation endpoints",
        ],
        capacityEstimations: {
          traffic: [
            "WebSocket connection overhead",
            "Comment rate during peak times",
          ],
          storage: ["Comment data structure size", "Reaction counter storage"],
          memory: [
            "Active WebSocket connection state",
            "Real-time update buffers",
          ],
          bandwidth: [
            "WebSocket message frequency",
            "Real-time update payload size",
          ],
        },
        highLevelDesign: [
          "WebSocket server architecture",
          "Comment storage and indexing",
          "Real-time update propagation",
        ],
      },
      criteria: [
        "Comments appear in real-time (<100ms)",
        "System handles 500k daily active users",
        "Comment threading supports up to 5 levels",
        "Reactions update instantly for all viewers",
      ],
      learningsInMD: `
## Key Learnings from Stage 3

### Real-time Systems
- WebSocket implementation
- Real-time data propagation
- Connection management

### Data Consistency
- Eventual consistency patterns
- Real-time update ordering
- Conflict resolution

### Engagement Features
- Comment system architecture
- Reaction system design
- Notification system integration
      `,
      resources: {
        documentation: [
          {
            title: "WebSocket Best Practices",
            url: "https://docs.aws.amazon.com/apigateway/latest/developerguide/websocket-api.html",
            description: "Learn about WebSocket implementation patterns",
          },
        ],
        realWorldCases: [
          {
            name: "Disqus Architecture",
            url: "https://disqus.com/engineering/",
            description: "How Disqus handles millions of comments",
          },
        ],
        bestPractices: [
          {
            title: "Real-time Updates",
            description:
              "Use WebSocket for real-time features with fallback to long polling",
            example: "WebSocket for comments, REST for historical data",
          },
        ],
      },
    },
    {
      problem: "Users need to search through blog content efficiently",
      requirements: [
        "Implement full-text search with results returned in under 200ms for 1 million blog posts",
      ],
      metaRequirements: [
        "Support creating, reading, updating, and deleting blog posts with rich text formatting for 500,000 daily active users",
        "Reduce post load time to under 500ms for 500,000 daily active users",
        "Support real-time comments and reactions for posts with 500,000 daily active users",
        "Implement full-text search with results returned in under 200ms for 1 million blog posts",
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design full-text search capability",
            "Plan for search result ranking",
            "Consider faceted search features",
          ],
          nonFunctional: [
            "Search results in under 200ms",
            "Support fuzzy matching",
            "Handle partial word matches",
          ],
        },
        systemAPI: [
          "Search query API structure",
          "Filter and facet parameters",
          "Search result pagination",
        ],
        capacityEstimations: {
          traffic: ["Search queries per second", "Index update frequency"],
          storage: ["Search index size", "Index replication needs"],
          memory: ["Search index memory requirements", "Query cache size"],
          bandwidth: ["Search result payload size", "Index update bandwidth"],
        },
        highLevelDesign: [
          "Search service architecture",
          "Index update pipeline",
          "Results ranking system",
        ],
      },
      criteria: [
        "Search results return in <200ms",
        "System handles 1M indexed posts",
        "Search supports fuzzy matching",
        "Results are properly ranked",
      ],
      learningsInMD: `
## Key Learnings from Stage 4

### Search Systems
- Full-text search implementation
- Search index design
- Query optimization

### Information Retrieval
- Text analysis and tokenization
- Ranking algorithms
- Faceted search implementation

### Performance Optimization
- Search index optimization
- Query caching strategies
- Result ranking efficiency
      `,
      resources: {
        documentation: [
          {
            title: "Elasticsearch Guide",
            url: "https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html",
            description: "Learn about implementing full-text search",
          },
        ],
        realWorldCases: [
          {
            name: "Algolia Architecture",
            url: "https://www.algolia.com/blog/engineering/",
            description: "How Algolia implements fast search",
          },
        ],
        bestPractices: [
          {
            title: "Search Implementation",
            description: "Use dedicated search service with proper indexing",
            example: "Elasticsearch with custom analyzers and mapping",
          },
        ],
      },
    },
    {
      problem: "System needs to handle content moderation and spam prevention",
      requirements: [
        "Implement automated content moderation with 99.9% spam detection rate for 1 million daily posts/comments",
      ],
      metaRequirements: [
        "Support creating, reading, updating, and deleting blog posts with rich text formatting for 500,000 daily active users",
        "Reduce post load time to under 500ms for 500,000 daily active users",
        "Support real-time comments and reactions for posts with 500,000 daily active users",
        "Implement full-text search with results returned in under 200ms for 1 million blog posts",
        "Implement automated content moderation with 99.9% spam detection rate for 1 million daily posts/comments",
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design content moderation pipeline",
            "Plan spam detection system",
            "Consider user reporting mechanism",
          ],
          nonFunctional: [
            "Process content in under 1 second",
            "Maintain false positive rate < 0.1%",
            "Support multiple moderation rules",
          ],
        },
        systemAPI: [
          "Content moderation webhook",
          "User reporting endpoints",
          "Moderation status updates",
        ],
        capacityEstimations: {
          traffic: [
            "Content moderation requests/second",
            "User reports volume",
          ],
          storage: ["Moderation rules storage", "Flagged content history"],
          memory: ["Active moderation rules cache", "Processing queue size"],
          bandwidth: [
            "Content analysis payload size",
            "Moderation result updates",
          ],
        },
        highLevelDesign: [
          "Moderation service architecture",
          "Machine learning pipeline",
          "User reporting flow",
        ],
      },
      criteria: [
        "99.9% spam detection rate",
        "Content moderation < 1 second",
        "False positive rate < 0.1%",
        "User reports handled within 5 minutes",
      ],
      learningsInMD: `
## Key Learnings from Stage 5

### Content Moderation
- Automated moderation systems
- Machine learning integration
- User reporting workflows

### Risk Management
- Spam prevention strategies
- Content filtering techniques
- Abuse prevention measures

### Processing Pipeline
- Real-time content analysis
- Moderation workflow design
- Scalable processing systems
      `,
      resources: {
        documentation: [
          {
            title: "Content Moderation Best Practices",
            url: "https://aws.amazon.com/rekognition/content-moderation/",
            description: "Learn about implementing content moderation",
          },
        ],
        realWorldCases: [
          {
            name: "Reddit's Spam Prevention",
            url: "https://www.reddit.com/wiki/contentpolicy/",
            description: "How Reddit handles content moderation",
          },
        ],
        bestPractices: [
          {
            title: "Moderation Pipeline",
            description:
              "Implement multi-layer moderation with ML and human review",
            example:
              "Automated ML screening -> Rule-based filtering -> Human review for edge cases",
          },
        ],
      },
    },
    {
      problem:
        "Platform needs personalized content recommendations and analytics for writers",
      requirements: [
        "Implement real-time analytics and personalized content recommendations for 1 million monthly active users",
      ],
      metaRequirements: [
        "Support creating, reading, updating, and deleting blog posts with rich text formatting for 500,000 daily active users",
        "Reduce post load time to under 500ms for 500,000 daily active users",
        "Support real-time comments and reactions for posts with 500,000 daily active users",
        "Implement full-text search with results returned in under 200ms for 1 million blog posts",
        "Implement automated content moderation with 99.9% spam detection rate for 1 million daily posts/comments",
        "Implement real-time analytics and personalized content recommendations for 1 million monthly active users",
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design real-time analytics pipeline",
            "Plan recommendation engine",
            "Consider A/B testing system",
          ],
          nonFunctional: [
            "Analytics updates within 30 seconds",
            "Recommendation generation under 100ms",
            "Support multiple recommendation algorithms",
          ],
        },
        systemAPI: [
          "Analytics data collection endpoints",
          "Recommendation API structure",
          "A/B test configuration API",
        ],
        capacityEstimations: {
          traffic: [
            "User activity events per second",
            "Recommendation requests rate",
          ],
          storage: ["User behavior data size", "Analytics data retention"],
          memory: [
            "Active user preferences cache",
            "Recommendation model size",
          ],
          bandwidth: [
            "Analytics event stream size",
            "Recommendation response payload",
          ],
        },
        highLevelDesign: [
          "Analytics processing pipeline",
          "Recommendation system architecture",
          "A/B testing framework",
        ],
      },
      criteria: [
        "Analytics updated within 30 seconds",
        "Recommendations generated in <100ms",
        "System handles 1M monthly active users",
        "A/B testing framework operational",
      ],
      learningsInMD: `
## Key Learnings from Stage 6

### Analytics Systems
- Real-time analytics pipeline
- Event processing architecture
- Data aggregation patterns

### Recommendation Systems
- Content recommendation algorithms
- Personalization techniques
- User preference modeling

### A/B Testing
- Test framework design
- Statistical analysis systems
- Feature flagging implementation

### Data Processing
- Stream processing patterns
- Batch processing systems
- Real-time aggregation techniques
      `,
      resources: {
        documentation: [
          {
            title: "Real-time Analytics",
            url: "https://docs.aws.amazon.com/kinesis/latest/dev/introduction.html",
            description:
              "Learn about implementing real-time analytics pipelines",
          },
        ],
        realWorldCases: [
          {
            name: "Netflix Recommendations",
            url: "https://netflixtechblog.com/",
            description: "How Netflix implements personalized recommendations",
          },
        ],
        bestPractices: [
          {
            title: "Analytics Pipeline",
            description:
              "Use stream processing for real-time analytics with batch processing backup",
            example:
              "Kafka -> Spark Streaming -> Redis (real-time) + Hadoop (batch)",
          },
        ],
      },
    },
  ],
  generalLearnings: [
    "Content management system architecture patterns",
    "Scalable content delivery strategies",
    "Caching architecture and optimization",
    "Performance optimization techniques",
    "Database design for content management",
    "API design for content platforms",
    "Load balancing and traffic management",
    "Real-time system implementation",
    "Search system architecture",
    "Content moderation and safety",
    "Data consistency patterns",
    "Distributed system scalability",
    "Security and authentication practices",
  ],
};

export default blogPlatformChallenge;
