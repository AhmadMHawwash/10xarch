import { type Challenge } from "./types";

const bloggingPlatformChallenge: Challenge = {
  slug: "blogging-platform",
  title: "Medium-Scale Blogging Platform Design",
  description: "Design a scalable blogging platform that supports content creation, distribution, and engagement while ensuring good performance and reliability.",
  difficulty: "Medium",
  isFree: false,
  stages: [
    {
      problem: "Writers need a platform to create, edit, and publish blog posts with rich text formatting and image support.",
      requirements: [
        "Create a service that handles blog post creation and storage with rich media support"
      ],
      metaRequirements: [
        "Create a service that handles blog post creation and storage with rich media support"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider content format and storage structure",
            "Think about media upload and processing needs"
          ],
          nonFunctional: [
            "Consider draft autosave frequency",
            "Think about editor responsiveness"
          ]
        },
        systemAPI: [
          "What endpoints are needed for CRUD operations?",
          "How to handle draft vs published states?",
          "How to structure the content API?"
        ],
        capacityEstimations: {
          traffic: [
            "How many concurrent writers might be editing?",
            "What's the expected post creation rate?"
          ],
          storage: [
            "Calculate average post size with media",
            "Consider metadata storage needs"
          ],
          memory: [
            "Estimate draft state caching needs",
            "Consider session data requirements"
          ],
          bandwidth: [
            "Calculate media upload bandwidth",
            "Estimate content delivery needs"
          ]
        },
        highLevelDesign: [
          "Consider separation of content and media services",
          "Think about draft state management"
        ]
      },
      criteria: [
        "Writers can create and edit posts with rich text",
        "System supports image uploads",
        "Posts can be saved as drafts or published",
        "Content is persistently stored"
      ],
      learningsInMD: `
## Key Learnings
- Content management system design
- BLOB storage patterns
- Draft state management
- Rich text data modeling
      `,
      resources: {
        documentation: [
          {
            title: "Content Management Systems",
            url: "https://docs.microsoft.com/en-us/azure/architecture/guide/architecture-styles/web-queue-worker",
            description: "Architecture patterns for content management"
          }
        ],
        realWorldCases: [
          {
            name: "Ghost",
            url: "https://ghost.org/",
            description: "Open source publishing platform architecture"
          }
        ],
        bestPractices: [
          {
            title: "Content Storage",
            description: "Separate content and media storage",
            example: "Use document DB for content, object storage for media"
          }
        ]
      }
    },
    {
      problem: "Readers are experiencing slow page loads, especially for posts with many images.",
      requirements: [
        "Optimize content delivery speed across regions"
      ],
      metaRequirements: [
        "Create a service that handles blog post creation and storage with rich media support",
        "Optimize content delivery speed across regions"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider image optimization and resizing",
            "Think about content caching strategy"
          ],
          nonFunctional: [
            "Consider target page load times",
            "Think about image quality vs size trade-offs"
          ]
        },
        systemAPI: [
          "How to handle image variants?",
          "What cache control headers to use?",
          "How to structure CDN paths?"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate read-to-write ratio",
            "Estimate peak reading times"
          ],
          storage: [
            "Calculate storage for image variants",
            "Estimate CDN storage needs"
          ],
          memory: [
            "Calculate cache size requirements",
            "Consider hot content patterns"
          ],
          bandwidth: [
            "Estimate CDN bandwidth needs",
            "Calculate origin server traffic"
          ]
        },
        highLevelDesign: [
          "Consider CDN placement",
          "Think about image processing pipeline"
        ]
      },
      criteria: [
        "Writers can create and edit posts with rich text",
        "System supports image uploads",
        "Posts can be saved as drafts or published",
        "Content is persistently stored",
        "Content loads quickly across regions",
        "Images are optimized for delivery"
      ],
      learningsInMD: `
## Key Learnings
- CDN architecture and configuration
- Image optimization pipelines
- Cache strategy design
- Performance optimization techniques
      `,
      resources: {
        documentation: [
          {
            title: "CDN Best Practices",
            url: "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/best-practices.html",
            description: "AWS CDN implementation patterns"
          }
        ],
        realWorldCases: [
          {
            name: "Medium",
            url: "https://medium.com/",
            description: "Content delivery architecture for large scale blogging"
          }
        ],
        bestPractices: [
          {
            title: "Media Optimization",
            description: "Implement automated image processing",
            example: "Use serverless functions for image resizing and optimization"
          }
        ]
      }
    },
    {
      problem: "The platform is experiencing database bottlenecks as user engagement (comments, likes) grows rapidly.",
      requirements: [
        "Scale user engagement handling"
      ],
      metaRequirements: [
        "Create a service that handles blog post creation and storage with rich media support",
        "Optimize content delivery speed across regions",
        "Scale user engagement handling"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider comment threading structure",
            "Think about engagement analytics"
          ],
          nonFunctional: [
            "Consider engagement data consistency",
            "Think about real-time update needs"
          ]
        },
        systemAPI: [
          "How to structure engagement endpoints?",
          "What real-time protocols to use?",
          "How to paginate comments?"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate engagement actions per post",
            "Estimate comment volume"
          ],
          storage: [
            "Calculate engagement data size",
            "Estimate analytics storage needs"
          ],
          memory: [
            "Consider hot post engagement caching",
            "Calculate real-time data needs"
          ],
          bandwidth: [
            "Estimate WebSocket traffic",
            "Calculate analytics event volume"
          ]
        },
        highLevelDesign: [
          "Consider database sharding strategy",
          "Think about event processing pipeline"
        ]
      },
      criteria: [
        "Writers can create and edit posts with rich text",
        "System supports image uploads",
        "Posts can be saved as drafts or published",
        "Content is persistently stored",
        "Content loads quickly across regions",
        "Images are optimized for delivery",
        "System handles high engagement volume",
        "Engagement updates are real-time"
      ],
      learningsInMD: `
## Key Learnings
- Database sharding strategies
- Real-time update systems
- Event processing patterns
- Analytics pipeline design
      `,
      resources: {
        documentation: [
          {
            title: "Database Sharding",
            url: "https://docs.mongodb.com/manual/sharding/",
            description: "MongoDB sharding patterns and practices"
          }
        ],
        realWorldCases: [
          {
            name: "Reddit",
            url: "https://reddit.com/",
            description: "Large-scale comment and engagement system"
          }
        ],
        bestPractices: [
          {
            title: "Engagement Processing",
            description: "Use event-driven architecture for engagement",
            example: "Implement message queues for async processing"
          }
        ]
      }
    },
    {
      problem: "Writers are requesting better analytics about their content performance and reader behavior.",
      requirements: [
        "Implement comprehensive analytics system"
      ],
      metaRequirements: [
        "Create a service that handles blog post creation and storage with rich media support",
        "Optimize content delivery speed across regions",
        "Scale user engagement handling",
        "Implement comprehensive analytics system"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider metrics to track",
            "Think about analytics aggregation"
          ],
          nonFunctional: [
            "Consider analytics query performance",
            "Think about data retention periods"
          ]
        },
        systemAPI: [
          "How to structure analytics APIs?",
          "What aggregation endpoints needed?",
          "How to handle custom queries?"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate events per page view",
            "Estimate analytics query volume"
          ],
          storage: [
            "Calculate raw event storage",
            "Estimate aggregation storage"
          ],
          memory: [
            "Consider query cache requirements",
            "Calculate aggregation memory needs"
          ],
          bandwidth: [
            "Estimate event ingestion bandwidth",
            "Calculate query response size"
          ]
        },
        highLevelDesign: [
          "Consider analytics pipeline architecture",
          "Think about data warehouse design"
        ]
      },
      criteria: [
        "Writers can create and edit posts with rich text",
        "System supports image uploads",
        "Posts can be saved as drafts or published",
        "Content is persistently stored",
        "Content loads quickly across regions",
        "Images are optimized for delivery",
        "System handles high engagement volume",
        "Engagement updates are real-time",
        "Writers can access detailed analytics",
        "Analytics queries perform well"
      ],
      learningsInMD: `
## Key Learnings
- Analytics system design
- Data warehouse architecture
- ETL pipeline patterns
- Query optimization techniques
      `,
      resources: {
        documentation: [
          {
            title: "Analytics Architecture",
            url: "https://docs.aws.amazon.com/quicksight/latest/user/creating-data-sets.html",
            description: "AWS analytics and data warehouse patterns"
          }
        ],
        realWorldCases: [
          {
            name: "Substack",
            url: "https://substack.com/",
            description: "Writer analytics platform architecture"
          }
        ],
        bestPractices: [
          {
            title: "Analytics Processing",
            description: "Implement real-time and batch processing",
            example: "Use Lambda for real-time and Spark for batch"
          }
        ]
      }
    },
    {
      problem: "Recent security audit revealed vulnerabilities in content access control and user authentication.",
      requirements: [
        "Implement robust security measures"
      ],
      metaRequirements: [
        "Create a service that handles blog post creation and storage with rich media support",
        "Optimize content delivery speed across regions",
        "Scale user engagement handling",
        "Implement comprehensive analytics system",
        "Implement robust security measures"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider access control model",
            "Think about authentication flows"
          ],
          nonFunctional: [
            "Consider security response times",
            "Think about audit requirements"
          ]
        },
        systemAPI: [
          "How to structure auth endpoints?",
          "What security headers needed?",
          "How to handle tokens?"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate auth requests volume",
            "Estimate audit log volume"
          ],
          storage: [
            "Calculate user security metadata",
            "Estimate audit log storage"
          ],
          memory: [
            "Consider session cache size",
            "Calculate token cache needs"
          ],
          bandwidth: [
            "Estimate auth service traffic",
            "Calculate security event volume"
          ]
        },
        highLevelDesign: [
          "Consider auth service architecture",
          "Think about security monitoring"
        ]
      },
      criteria: [
        "Writers can create and edit posts with rich text",
        "System supports image uploads",
        "Posts can be saved as drafts or published",
        "Content is persistently stored",
        "Content loads quickly across regions",
        "Images are optimized for delivery",
        "System handles high engagement volume",
        "Engagement updates are real-time",
        "Writers can access detailed analytics",
        "Analytics queries perform well",
        "System has robust access control",
        "Security monitoring is in place"
      ],
      learningsInMD: `
## Key Learnings
- Authentication system design
- Authorization patterns
- Security monitoring
- Audit logging architecture
      `,
      resources: {
        documentation: [
          {
            title: "Security Best Practices",
            url: "https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html",
            description: "AWS security architecture patterns"
          }
        ],
        realWorldCases: [
          {
            name: "WordPress.com",
            url: "https://wordpress.com/",
            description: "Large-scale blogging platform security"
          }
        ],
        bestPractices: [
          {
            title: "Security Architecture",
            description: "Implement defense in depth",
            example: "Use WAF, IAM, and encryption at rest/transit"
          }
        ]
      }
    }
  ],
  generalLearnings: [
    "Content management system architecture",
    "Media processing and delivery optimization",
    "Database scaling and sharding strategies",
    "Real-time update systems",
    "Analytics pipeline design",
    "Security and access control patterns",
    "Performance optimization techniques",
    "Distributed system monitoring",
    "Event-driven architecture patterns",
    "Data consistency models"
  ]
};

export default bloggingPlatformChallenge;
