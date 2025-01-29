import { type Challenge } from "./types";

const rideShareChallenge: Challenge = {
  slug: "ride-sharing-service",
  title: "Ride-Sharing Service System Design",
  description: "Design a scalable ride-sharing platform focusing on real-time matching, location tracking, and payment processing. Learn key concepts in distributed systems and real-time processing.",
  difficulty: "Hard",
  isFree: true,
  stages: [
    {
      problem: "Users need to request rides and be matched with nearby drivers in real-time",
      requirements: [
        "Support real-time ride matching for 10,000 concurrent users with matching time under 3 seconds"
      ],
      metaRequirements: [
        "Support real-time ride matching for 10,000 concurrent users with matching time under 3 seconds"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider geospatial indexing for location searches",
            "Plan driver availability status management",
            "Think about matching algorithm criteria"
          ],
          nonFunctional: [
            "Matching response time under 3 seconds",
            "Support concurrent user requests",
            "Consider location data accuracy"
          ]
        },
        systemAPI: [
          "Ride request endpoint structure",
          "Driver location update API",
          "Match confirmation endpoints"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate requests per second during peak hours",
            "Consider driver location update frequency"
          ],
          storage: [
            "User and driver profile data size",
            "Active ride session data",
            "Location history requirements"
          ],
          memory: [
            "Active driver location cache size",
            "Matching queue requirements"
          ],
          bandwidth: [
            "Location update frequency and size",
            "Matching request/response payload"
          ]
        },
        highLevelDesign: [
          "Location service architecture",
          "Matching service placement",
          "Real-time update system"
        ]
      },
      criteria: [
        "Match riders with drivers in <3 seconds",
        "Handle 10k concurrent users",
        "Support location updates every 5 seconds",
        "Maintain driver availability status"
      ],
      learningsInMD: `
## Key Learnings from Stage 1

### Geospatial Systems
- Location data management
- Geospatial indexing
- Proximity search algorithms

### Real-time Processing
- Event-driven architecture
- Location update handling
- Matching algorithm design

### Data Modeling
- User and driver profiles
- Location data structures
- Ride session management
      `,
      resources: {
        documentation: [
          {
            title: "Geospatial Indexing",
            url: "https://docs.mongodb.com/manual/geospatial-queries/",
            description: "Learn about implementing location-based queries"
          }
        ],
        realWorldCases: [
          {
            name: "Uber's Matching System",
            url: "https://eng.uber.com/engineering/",
            description: "How Uber matches riders with drivers"
          }
        ],
        bestPractices: [
          {
            title: "Location Data Management",
            description: "Use specialized geospatial databases for location queries",
            example: "MongoDB with 2dsphere index for location data"
          }
        ]
      }
    },
    {
      problem: "System needs to handle real-time location tracking and ETA updates",
      requirements: [
        "Provide real-time location tracking and ETA updates every 3 seconds for 50,000 concurrent rides"
      ],
      metaRequirements: [
        "Support real-time ride matching for 10,000 concurrent users with matching time under 3 seconds",
        "Provide real-time location tracking and ETA updates every 3 seconds for 50,000 concurrent rides"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design real-time tracking system",
            "Plan ETA calculation service",
            "Consider route optimization"
          ],
          nonFunctional: [
            "Location updates under 3 seconds",
            "Maintain connection stability",
            "Handle network fluctuations"
          ]
        },
        systemAPI: [
          "WebSocket connection endpoints",
          "Location update protocol",
          "ETA calculation API"
        ],
        capacityEstimations: {
          traffic: [
            "WebSocket connections per second",
            "Location update frequency"
          ],
          storage: [
            "Trip tracking data size",
            "Route history requirements"
          ],
          memory: [
            "Active connection state size",
            "Route calculation cache"
          ],
          bandwidth: [
            "Location update message size",
            "Connection overhead"
          ]
        },
        highLevelDesign: [
          "WebSocket server architecture",
          "Location processing pipeline",
          "ETA service integration"
        ]
      },
      criteria: [
        "Location updates every 3 seconds",
        "Handle 50k concurrent rides",
        "ETA accuracy within 2 minutes",
        "Reliable connection handling"
      ],
      learningsInMD: `
## Key Learnings from Stage 2

### Real-time Communication
- WebSocket implementation
- Connection management
- Message protocol design

### Location Processing
- GPS data handling
- ETA calculation
- Route optimization

### Scalability
- WebSocket server scaling
- Connection pooling
- Load distribution
      `,
      resources: {
        documentation: [
          {
            title: "WebSocket Best Practices",
            url: "https://developer.mozilla.org/en-US/docs/Web/API/WebSocket",
            description: "Learn about implementing WebSocket connections"
          }
        ],
        realWorldCases: [
          {
            name: "Lyft's Real-time Platform",
            url: "https://eng.lyft.com/",
            description: "How Lyft handles real-time tracking"
          }
        ],
        bestPractices: [
          {
            title: "Location Updates",
            description: "Use WebSocket for real-time updates with fallback mechanisms",
            example: "WebSocket for tracking, REST for fallback"
          }
        ]
      }
    },
    {
      problem: "Platform needs to handle secure payment processing and fare calculation",
      requirements: [
        "Process payments for 100,000 daily rides with 99.99% success rate and fare calculation accuracy"
      ],
      metaRequirements: [
        "Support real-time ride matching for 10,000 concurrent users with matching time under 3 seconds",
        "Provide real-time location tracking and ETA updates every 3 seconds for 50,000 concurrent rides",
        "Process payments for 100,000 daily rides with 99.99% success rate and fare calculation accuracy"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design payment processing flow",
            "Plan fare calculation system",
            "Consider multiple payment methods"
          ],
          nonFunctional: [
            "Payment processing under 5 seconds",
            "Ensure transaction consistency",
            "Maintain payment security"
          ]
        },
        systemAPI: [
          "Payment processing endpoints",
          "Fare calculation API",
          "Payment status webhooks"
        ],
        capacityEstimations: {
          traffic: [
            "Payment transactions per second",
            "Fare calculation requests"
          ],
          storage: [
            "Transaction history size",
            "Payment method data"
          ],
          memory: [
            "Active transaction state",
            "Fare calculation cache"
          ],
          bandwidth: [
            "Payment gateway communication",
            "Transaction payload size"
          ]
        },
        highLevelDesign: [
          "Payment service architecture",
          "Transaction processing pipeline",
          "Payment gateway integration"
        ]
      },
      criteria: [
        "99.99% payment success rate",
        "Process payments in <5 seconds",
        "Support multiple payment methods",
        "Accurate fare calculation"
      ],
      learningsInMD: `
## Key Learnings from Stage 3

### Payment Processing
- Payment gateway integration
- Transaction consistency
- Security best practices

### Fare Calculation
- Dynamic pricing logic
- Distance-based calculation
- Time factor integration

### Financial Data
- Transaction management
- Payment reconciliation
- Financial reporting
      `,
      resources: {
        documentation: [
          {
            title: "Payment Processing Security",
            url: "https://stripe.com/docs/security",
            description: "Learn about secure payment processing"
          }
        ],
        realWorldCases: [
          {
            name: "Stripe Payment System",
            url: "https://stripe.com/blog/engineering",
            description: "How Stripe handles payments at scale"
          }
        ],
        bestPractices: [
          {
            title: "Payment Processing",
            description: "Implement idempotency and transaction consistency",
            example: "Use unique transaction IDs and status tracking"
          }
        ]
      }
    },
    {
      problem: "System needs to implement dynamic pricing based on demand and supply",
      requirements: [
        "Implement real-time surge pricing updates every minute for 200 geographic zones with 95% accuracy"
      ],
      metaRequirements: [
        "Support real-time ride matching for 10,000 concurrent users with matching time under 3 seconds",
        "Provide real-time location tracking and ETA updates every 3 seconds for 50,000 concurrent rides",
        "Process payments for 100,000 daily rides with 99.99% success rate and fare calculation accuracy",
        "Implement real-time surge pricing updates every minute for 200 geographic zones with 95% accuracy"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design surge pricing algorithm",
            "Plan zone management system",
            "Consider historical data analysis"
          ],
          nonFunctional: [
            "Price updates under 1 minute",
            "Handle concurrent zone updates",
            "Maintain price consistency"
          ]
        },
        systemAPI: [
          "Surge calculation endpoints",
          "Zone management API",
          "Price update propagation"
        ],
        capacityEstimations: {
          traffic: [
            "Zone update frequency",
            "Price check requests"
          ],
          storage: [
            "Historical pricing data",
            "Zone definition data"
          ],
          memory: [
            "Active zone prices cache",
            "Calculation model size"
          ],
          bandwidth: [
            "Price update broadcasts",
            "Zone status updates"
          ]
        },
        highLevelDesign: [
          "Pricing service architecture",
          "Zone management system",
          "Price propagation mechanism"
        ]
      },
      criteria: [
        "Update prices every minute",
        "Handle 200 geographic zones",
        "95% pricing accuracy",
        "Real-time price propagation"
      ],
      learningsInMD: `
## Key Learnings from Stage 4

### Dynamic Pricing
- Surge pricing algorithms
- Supply-demand balancing
- Price propagation systems

### Geographic Zoning
- Zone management
- Data partitioning
- Load distribution

### Real-time Updates
- Price calculation
- Update broadcasting
- Consistency management
      `,
      resources: {
        documentation: [
          {
            title: "Real-time Pricing Systems",
            url: "https://aws.amazon.com/kinesis/data-analytics/",
            description: "Learn about real-time data processing for pricing"
          }
        ],
        realWorldCases: [
          {
            name: "Uber Surge Pricing",
            url: "https://eng.uber.com/",
            description: "How Uber implements dynamic pricing"
          }
        ],
        bestPractices: [
          {
            title: "Dynamic Pricing",
            description: "Implement gradual price changes with proper notifications",
            example: "Use sliding window for demand calculation"
          }
        ]
      }
    },
    {
      problem: "Platform needs robust safety and trust features",
      requirements: [
        "Implement real-time safety monitoring and incident response system for 1 million daily rides with <30 second response time"
      ],
      metaRequirements: [
        "Support real-time ride matching for 10,000 concurrent users with matching time under 3 seconds",
        "Provide real-time location tracking and ETA updates every 3 seconds for 50,000 concurrent rides",
        "Process payments for 100,000 daily rides with 99.99% success rate and fare calculation accuracy",
        "Implement real-time surge pricing updates every minute for 200 geographic zones with 95% accuracy",
        "Implement real-time safety monitoring and incident response system for 1 million daily rides with <30 second response time"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design safety monitoring system",
            "Plan emergency response flow",
            "Consider user verification system"
          ],
          nonFunctional: [
            "Incident response under 30 seconds",
            "High availability requirement",
            "System reliability targets"
          ]
        },
        systemAPI: [
          "Emergency alert endpoints",
          "User verification API",
          "Incident management system"
        ],
        capacityEstimations: {
          traffic: [
            "Safety check frequency",
            "Incident report rate"
          ],
          storage: [
            "User verification data",
            "Incident history size"
          ],
          memory: [
            "Active ride monitoring",
            "Emergency response cache"
          ],
          bandwidth: [
            "Alert notification size",
            "Monitoring data volume"
          ]
        },
        highLevelDesign: [
          "Safety service architecture",
          "Emergency response system",
          "Monitoring pipeline"
        ]
      },
      criteria: [
        "30-second incident response",
        "Handle 1M daily rides",
        "Real-time route monitoring",
        "Emergency service integration"
      ],
      learningsInMD: `
## Key Learnings from Stage 5

### Safety Systems
- Real-time monitoring
- Incident detection
- Emergency response

### Trust & Security
- User verification
- Fraud detection
- Safety protocols

### System Reliability
- High availability design
- Incident management
- Emergency handling
      `,
      resources: {
        documentation: [
          {
            title: "Real-time Safety Systems",
            url: "https://aws.amazon.com/security/",
            description: "Learn about building secure, real-time monitoring systems"
          }
        ],
        realWorldCases: [
          {
            name: "Lyft Safety Features",
            url: "https://safety.lyft.com/",
            description: "How Lyft implements safety features"
          }
        ],
        bestPractices: [
          {
            title: "Safety Monitoring",
            description: "Implement multi-layer safety checks with rapid response",
            example: "Route monitoring + Emergency detection + Alert system"
          }
        ]
      }
    },
    {
      problem: "Platform needs analytics and reporting for business intelligence",
      requirements: [
        "Build real-time analytics pipeline processing 10TB daily data with insights available within 5 minutes"
      ],
      metaRequirements: [
        "Support real-time ride matching for 10,000 concurrent users with matching time under 3 seconds",
        "Provide real-time location tracking and ETA updates every 3 seconds for 50,000 concurrent rides",
        "Process payments for 100,000 daily rides with 99.99% success rate and fare calculation accuracy",
        "Implement real-time surge pricing updates every minute for 200 geographic zones with 95% accuracy",
        "Implement real-time safety monitoring and incident response system for 1 million daily rides with <30 second response time",
        "Build real-time analytics pipeline processing 10TB daily data with insights available within 5 minutes"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design analytics pipeline",
            "Plan reporting system",
            "Consider data aggregation"
          ],
          nonFunctional: [
            "Process data within 5 minutes",
            "Handle 10TB daily data",
            "Maintain data accuracy"
          ]
        },
        systemAPI: [
          "Analytics data ingestion",
          "Report generation API",
          "Data aggregation endpoints"
        ],
        capacityEstimations: {
          traffic: [
            "Event ingestion rate",
            "Report generation frequency"
          ],
          storage: [
            "Raw data volume",
            "Aggregated data size"
          ],
          memory: [
            "Processing pipeline memory",
            "Aggregation cache size"
          ],
          bandwidth: [
            "Data ingestion volume",
            "Report delivery size"
          ]
        },
        highLevelDesign: [
          "Analytics pipeline architecture",
          "Data warehouse design",
          "Reporting system"
        ]
      },
      criteria: [
        "Process 10TB daily data",
        "5-minute insight availability",
        "Support multiple report types",
        "Maintain data accuracy"
      ],
      learningsInMD: `
## Key Learnings from Stage 6

### Data Processing
- Stream processing
- Batch processing
- Data warehousing

### Analytics Pipeline
- Data ingestion
- Real-time processing
- Insight generation

### Business Intelligence
- Reporting systems
- Data visualization
- Metric tracking
      `,
      resources: {
        documentation: [
          {
            title: "Real-time Analytics",
            url: "https://docs.aws.amazon.com/kinesis/",
            description: "Learn about building real-time analytics pipelines"
          }
        ],
        realWorldCases: [
          {
            name: "Uber Analytics",
            url: "https://eng.uber.com/tech-stack/",
            description: "How Uber processes analytics data"
          }
        ],
        bestPractices: [
          {
            title: "Analytics Pipeline",
            description: "Combine stream and batch processing for complete analytics",
            example: "Real-time processing + Batch aggregation"
          }
        ]
      }
    }
  ],
  generalLearnings: [
    "Real-time system architecture",
    "Geospatial data management",
    "Location-based service design",
    "Payment processing systems",
    "Dynamic pricing implementation",
    "Safety system design",
    "Analytics pipeline architecture",
    "High-availability patterns",
    "Data consistency models",
    "Scalability techniques",
    "System monitoring and reliability",
    "Business intelligence systems"
  ]
};

export default rideShareChallenge;