import { type Challenge } from "./types";

const inventoryManagementChallenge: Challenge = {
  slug: "inventory-management",
  title: "Real-Time Inventory Management System",
  description: "Design a scalable inventory management system that tracks product levels across multiple warehouses in real-time, handles high-volume transactions, and maintains consistency.",
  difficulty: "Medium",
  isFree: false,
  stages: [
    {
      problem: "An e-commerce company needs a system to track product inventory levels across their warehouses to avoid overselling and provide accurate availability information to customers.",
      requirements: [
        "Create a core system that tracks product quantities and updates inventory levels as products are added or sold"
      ],
      metaRequirements: [
        "Create a core system that tracks product quantities and updates inventory levels as products are added or sold"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider what inventory data needs to be tracked (product IDs, quantities, locations, etc.)",
            "Think about operations that modify inventory (sales, returns, transfers, adjustments)",
            "Design inventory reservation mechanism for items in customer carts",
            "Consider how to handle product variants (sizes, colors, etc.)"
          ],
          nonFunctional: [
            "Consider read vs. write access patterns for inventory data",
            "Think about data consistency requirements (strong vs. eventual)",
            "Consider response time for inventory checks during checkout",
            "Think about audit requirements for inventory changes"
          ]
        },
        systemAPI: [
          "Design endpoints for inventory CRUD operations",
          "Consider batch vs. individual update APIs",
          "Think about query parameters for filtering inventory data",
          "Consider API versioning strategy"
        ],
        capacityEstimations: {
          traffic: [
            "Estimate transactions per second during peak shopping periods",
            "Calculate ratio of inventory checks vs. actual purchase conversions",
            "Consider traffic patterns (daily, seasonal spikes)",
            "Estimate number of concurrent inventory operations"
          ],
          storage: [
            "Calculate storage needed per inventory record",
            "Estimate total products and variants in the system",
            "Consider storage for inventory history and audit logs",
            "Project storage growth over time"
          ],
          memory: [
            "Identify frequently accessed inventory data for caching",
            "Estimate cache size requirements for hot products",
            "Consider memory needs for inventory operations in progress"
          ],
          bandwidth: [
            "Calculate bandwidth for inventory check requests",
            "Estimate bandwidth for inventory update operations",
            "Consider bandwidth needs for inventory synchronization"
          ]
        },
        highLevelDesign: [
          "Design core inventory database structure",
          "Consider service-based architecture with inventory as a microservice",
          "Think about inventory read/write separation",
          "Design basic inventory update flow"
        ]
      },
      criteria: [
        "System can track quantity of products across multiple warehouses",
        "System can update inventory levels when products are sold or added",
        "System provides accurate inventory counts for product listings",
        "System prevents selling products that are out of stock"
      ],
      learningsInMD: `
## Key Learnings

### Inventory Data Modeling
- **Product Hierarchy Modeling**: Designing efficient schemas for products, variants, and SKUs
- **Inventory Record Design**: Balancing normalization and query performance
- **Stock Keeping Units (SKUs)**: Using unique identifiers for inventory management
- **Location Modeling**: Representing warehouses, zones, and bin locations

### Transaction Management
- **Atomic Inventory Updates**: Ensuring consistency during inventory changes
- **Optimistic vs. Pessimistic Locking**: Handling concurrent inventory modifications
- **Idempotent Operations**: Designing APIs that handle duplicate requests safely
- **Inventory Reservations**: Temporarily holding inventory during checkout process

### Database Considerations
- **RDBMS vs. NoSQL Tradeoffs**: Choosing appropriate storage systems for inventory data
- **Indexing Strategies**: Optimizing queries for inventory lookups
- **Normalization vs. Denormalization**: Finding the right balance for inventory data
- **Constraints and Validations**: Enforcing data integrity in the database layer
      `,
      resources: {
        documentation: [
          {
            title: "Database Indexing Strategies",
            url: "https://use-the-index-luke.com/",
            description: "Comprehensive guide to database indexing for performance"
          },
          {
            title: "Data Consistency Models",
            url: "https://jepsen.io/consistency",
            description: "Overview of different data consistency models and their trade-offs"
          }
        ],
        realWorldCases: [
          {
            name: "Amazon Inventory System",
            url: "https://aws.amazon.com/solutions/case-studies/amazon-fulfillment-system/",
            description: "How Amazon manages inventory across global fulfillment centers"
          },
          {
            name: "Shopify Inventory",
            url: "https://shopify.engineering/building-shopify-inventory-buying-tech-stack",
            description: "How Shopify built their inventory management system"
          }
        ],
        bestPractices: [
          {
            title: "Inventory Data Modeling",
            description: "Model inventory at the SKU level rather than the product level",
            example: "Track inventory for 'Blue XL T-shirt' rather than just 'T-shirt'"
          },
          {
            title: "Inventory Transactions",
            description: "Record all inventory changes as transactions with audit trail",
            example: "Log who changed inventory, when, and why for every modification"
          }
        ]
      }
    },
    {
      problem: "The company is experiencing inventory inconsistencies during high-traffic sales events, where the same items are occasionally oversold or reserved multiple times.",
      requirements: [
        "Ensure inventory consistency during high-concurrent operations"
      ],
      metaRequirements: [
        "Create a core system that tracks product quantities and updates inventory levels as products are added or sold",
        "Ensure inventory consistency during high-concurrent operations"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Implement transactional updates for inventory changes",
            "Design concurrency control for inventory operations",
            "Consider inventory reservation with timeouts",
            "Think about conflict resolution strategies"
          ],
          nonFunctional: [
            "Define acceptable latency for inventory operations during peak load",
            "Consider throughput requirements during flash sales",
            "Think about consistency vs availability tradeoffs",
            "Define recovery procedures for inconsistent state"
          ]
        },
        systemAPI: [
          "Design APIs with idempotency keys for safe retries",
          "Consider adding conditional operations (If-Match headers)",
          "Think about bulk operation APIs for efficiency",
          "Design clear error responses for concurrency conflicts"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate peak concurrent inventory operations during flash sales",
            "Estimate inventory contention on popular items",
            "Model traffic patterns during promotional events",
            "Calculate transaction rate growth projections"
          ],
          storage: [
            "Estimate storage for inventory locks or reservations",
            "Calculate space needed for transaction logs",
            "Consider storage needs for conflict resolution data"
          ],
          memory: [
            "Estimate memory requirements for active transactions",
            "Calculate cache size for hot inventory items",
            "Consider memory for lock management"
          ],
          bandwidth: [
            "Calculate bandwidth for increased transaction volume",
            "Estimate network overhead for distributed transactions",
            "Consider bandwidth for replication or synchronization"
          ]
        },
        highLevelDesign: [
          "Implement database transactions for atomic updates",
          "Consider distributed lock managers for inventory items",
          "Design optimistic or pessimistic concurrency control",
          "Think about event sourcing for inventory changes"
        ]
      },
      criteria: [
        "System can track quantity of products across multiple warehouses",
        "System can update inventory levels when products are sold or added",
        "System provides accurate inventory counts for product listings",
        "System prevents selling products that are out of stock",
        "System handles concurrent inventory operations without inconsistencies",
        "System maintains data integrity during high traffic periods"
      ],
      learningsInMD: `
## Key Learnings

### Concurrency Control
- **Distributed Locks**: Implementing locks across multiple services
- **Optimistic Concurrency Control**: Using version numbers or timestamps to detect conflicts
- **Pessimistic Concurrency Control**: Locking resources before modifications
- **Two-Phase Commit**: Ensuring consistency across distributed systems

### Transaction Design Patterns
- **Saga Pattern**: Managing long-lived transactions across services
- **Outbox Pattern**: Ensuring reliable message publishing with database transactions
- **Compensating Transactions**: Reversing operations when part of a transaction fails
- **Read-After-Write Consistency**: Ensuring users see their own updates immediately

### Scalable Consistency Models
- **ACID vs. BASE**: Understanding transaction models for different scenarios
- **Eventual Consistency**: When and how to safely use eventually consistent models
- **Causal Consistency**: Maintaining order of related operations
- **Conflict-Free Replicated Data Types (CRDTs)**: Self-resolving data structures
      `,
      resources: {
        documentation: [
          {
            title: "Distributed Transactions",
            url: "https://developers.redhat.com/articles/2021/09/21/distributed-transaction-patterns-microservices-compared",
            description: "Comparison of patterns for handling distributed transactions"
          },
          {
            title: "Concurrency Control Techniques",
            url: "https://docs.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling",
            description: "Patterns for managing concurrency in distributed systems"
          }
        ],
        realWorldCases: [
          {
            name: "Uber's Distributed Systems",
            url: "https://eng.uber.com/distributed-tracing/",
            description: "How Uber manages consistency across their distributed systems"
          },
          {
            name: "Zalando's Distributed Locks",
            url: "https://engineering.zalando.com/posts/2019/04/distributed-locks.html",
            description: "Zalando's approach to distributed locking for inventory"
          }
        ],
        bestPractices: [
          {
            title: "Optimistic Locking",
            description: "Use version numbers to detect and manage concurrent modifications",
            example: "Include 'version' field that increments with each update, reject updates with stale versions"
          },
          {
            title: "Idempotent APIs",
            description: "Design inventory operations to be safely retryable",
            example: "Accept client-generated operation IDs to detect and ignore duplicate requests"
          }
        ]
      }
    },
    {
      problem: "The inventory system needs to integrate with multiple sales channels (website, mobile app, in-store POS), and latency is affecting the customer checkout experience.",
      requirements: [
        "Reduce inventory check latency across multiple sales channels"
      ],
      metaRequirements: [
        "Create a core system that tracks product quantities and updates inventory levels as products are added or sold",
        "Ensure inventory consistency during high-concurrent operations",
        "Reduce inventory check latency across multiple sales channels"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Implement caching layer for inventory read operations",
            "Design cache invalidation strategy for inventory updates",
            "Consider asynchronous inventory updates for non-critical operations",
            "Think about read replicas for inventory queries"
          ],
          nonFunctional: [
            "Set target latency for inventory checks (e.g., < 100ms)",
            "Consider cache hit rate targets (e.g., > 95%)",
            "Define acceptable staleness window for inventory data",
            "Think about regional performance requirements"
          ]
        },
        systemAPI: [
          "Design cache-friendly API patterns",
          "Consider exposing inventory thresholds rather than exact counts",
          "Think about bulk operation APIs to reduce network overhead",
          "Design APIs with appropriate caching headers"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate read vs. write ratio for inventory operations",
            "Estimate cache hit rates based on product popularity",
            "Model traffic distribution across sales channels",
            "Estimate peak query rates during promotional events"
          ],
          storage: [
            "Calculate storage requirements for cache layers",
            "Estimate size of inventory data across replicas",
            "Consider storage for denormalized views"
          ],
          memory: [
            "Estimate memory needed for caching hot inventory items",
            "Calculate memory requirements for read replicas",
            "Consider in-memory data grid sizing"
          ],
          bandwidth: [
            "Calculate reduced database load due to caching",
            "Estimate bandwidth between application tiers and cache",
            "Consider replication bandwidth between data centers"
          ]
        },
        highLevelDesign: [
          "Add caching layer between application and database",
          "Consider read replicas for inventory database",
          "Design CDN integration for static inventory data",
          "Implement regional deployment for reduced latency"
        ]
      },
      criteria: [
        "System can track quantity of products across multiple warehouses",
        "System can update inventory levels when products are sold or added",
        "System provides accurate inventory counts for product listings",
        "System prevents selling products that are out of stock",
        "System handles concurrent inventory operations without inconsistencies",
        "System maintains data integrity during high traffic periods",
        "System delivers inventory data with low latency across all sales channels",
        "System properly invalidates cached inventory data when updates occur"
      ],
      learningsInMD: `
## Key Learnings

### Multi-Layer Caching
- **Cache Placement Strategies**: Determining optimal cache locations in the architecture
- **Cache Update Patterns**: Cache-aside, read-through, write-through, and write-behind
- **Tiered Caching Architecture**: Combining memory, distributed, and CDN caching
- **Cache Coherence**: Maintaining consistency across distributed cache nodes

### Read Optimization
- **Read Replicas**: Scaling read operations with database replicas
- **Command Query Responsibility Segregation (CQRS)**: Separating read and write models
- **Materialized Views**: Pre-computing common inventory queries
- **Denormalization Strategies**: Trading normalization for query performance

### Distributed Systems Optimizations
- **Edge Computing**: Moving inventory data closer to users
- **Data Locality**: Placing data near the services that use it most
- **Sharding Strategies**: Distributing inventory data for parallel processing
- **Global Distribution**: Techniques for worldwide inventory access
      `,
      resources: {
        documentation: [
          {
            title: "Caching Patterns",
            url: "https://docs.microsoft.com/en-us/azure/architecture/patterns/cache-aside",
            description: "Implementation patterns for effective caching"
          },
          {
            title: "CQRS Pattern",
            url: "https://martinfowler.com/bliki/CQRS.html",
            description: "Martin Fowler's explanation of Command Query Responsibility Segregation"
          }
        ],
        realWorldCases: [
          {
            name: "Walmart's Inventory System",
            url: "https://medium.com/walmartglobaltech/how-walmart-runs-its-digital-inventory-system-at-scale-526ee4431c56",
            description: "How Walmart optimized their inventory system for performance"
          },
          {
            name: "Wayfair's Caching Strategy",
            url: "https://www.wayfair.com/tech-blog/wayfair-tech-blog-the-evolution-of-caching-at-wayfair-1",
            description: "Evolution of caching strategies at Wayfair"
          }
        ],
        bestPractices: [
          {
            title: "Intelligent Caching",
            description: "Cache inventory data based on access patterns and product lifecycle",
            example: "More aggressive caching for popular products, less for rarely accessed items"
          },
          {
            title: "Cache Invalidation",
            description: "Implement precise cache invalidation to maintain consistency",
            example: "Use event-based invalidation rather than time-based expiration for inventory updates"
          }
        ]
      }
    },
    {
      problem: "The business has expanded to multiple geographic regions, and maintaining a consistent view of inventory across regions is causing delays and occasionally leading to fulfillment issues.",
      requirements: [
        "Support multi-region inventory with consistent global view"
      ],
      metaRequirements: [
        "Create a core system that tracks product quantities and updates inventory levels as products are added or sold",
        "Ensure inventory consistency during high-concurrent operations",
        "Reduce inventory check latency across multiple sales channels",
        "Support multi-region inventory with consistent global view"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design multi-region inventory synchronization",
            "Implement inventory allocation strategy across regions",
            "Consider regional vs. global inventory reservations",
            "Think about inventory transfer between regions"
          ],
          nonFunctional: [
            "Define acceptable synchronization delay between regions",
            "Set consistency requirements for cross-region operations",
            "Consider regional autonomy during network partitions",
            "Think about disaster recovery across regions"
          ]
        },
        systemAPI: [
          "Design APIs that expose inventory by region",
          "Consider how to handle cross-region operations",
          "Think about API versioning for regional compatibility",
          "Design bulk synchronization APIs"
        ],
        capacityEstimations: {
          traffic: [
            "Estimate cross-region synchronization volume",
            "Calculate region-specific traffic patterns",
            "Model global vs. regional inventory queries",
            "Consider traffic during regional failovers"
          ],
          storage: [
            "Calculate storage needs for multi-region replication",
            "Estimate size of conflict resolution data",
            "Consider storage for region-specific data"
          ],
          memory: [
            "Estimate memory needed for global inventory cache",
            "Calculate regional cache requirements",
            "Consider memory for cross-region synchronization state"
          ],
          bandwidth: [
            "Calculate inter-region synchronization bandwidth",
            "Estimate bandwidth for global vs. regional traffic",
            "Consider WAN optimization requirements"
          ]
        },
        highLevelDesign: [
          "Design multi-region database architecture",
          "Consider global and regional caching layers",
          "Implement inventory synchronization service",
          "Design conflict detection and resolution mechanisms"
        ]
      },
      criteria: [
        "System can track quantity of products across multiple warehouses",
        "System can update inventory levels when products are sold or added",
        "System provides accurate inventory counts for product listings",
        "System prevents selling products that are out of stock",
        "System handles concurrent inventory operations without inconsistencies",
        "System maintains data integrity during high traffic periods",
        "System delivers inventory data with low latency across all sales channels",
        "System properly invalidates cached inventory data when updates occur",
        "System maintains a consistent view of inventory across multiple regions",
        "System allows for regional inventory autonomy when needed"
      ],
      learningsInMD: `
## Key Learnings

### Multi-Region Data Architecture
- **Global vs. Regional Data**: Strategies for splitting and replicating inventory data
- **Multi-Master Replication**: Handling updates from multiple regions simultaneously
- **Conflict Resolution Strategies**: Vector clocks, last-writer-wins, custom resolution
- **Regional Autonomy**: Allowing regions to function during global outages

### Distributed Consistency Models
- **CAP Theorem in Practice**: Real-world trade-offs between consistency, availability, and partition tolerance
- **Quorum-Based Systems**: Ensuring consistency with read/write quorums
- **Anti-Entropy Processes**: Background reconciliation of inventory discrepancies
- **Consistent Hashing**: Distributing inventory data across a global system

### Global Systems Design
- **Follow-the-Sun Operations**: Handling 24/7 global inventory management
- **Data Sovereignty Considerations**: Complying with regional data regulations
- **Global Load Balancing**: Directing users to appropriate regional instances
- **Disaster Recovery Across Regions**: Planning for regional outages
      `,
      resources: {
        documentation: [
          {
            title: "Multi-Region Architectures",
            url: "https://aws.amazon.com/blogs/architecture/disaster-recovery-dr-architecture-on-aws-part-iii-pilot-light-and-warm-standby/",
            description: "Patterns for building resilient multi-region systems"
          },
          {
            title: "Distributed Data Consistency",
            url: "https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html",
            description: "Martin Kleppmann's article on distributed consistency challenges"
          }
        ],
        realWorldCases: [
          {
            name: "Airbnb's Multi-Region Strategy",
            url: "https://medium.com/airbnb-engineering/avoiding-double-payments-in-a-distributed-payments-system-2981f6b070bb",
            description: "How Airbnb maintains consistency across global regions"
          },
          {
            name: "Netflix's Global Architecture",
            url: "https://netflixtechblog.com/active-active-for-multi-regional-resiliency-c47719f6685b",
            description: "Netflix's approach to active-active multi-region architecture"
          }
        ],
        bestPractices: [
          {
            title: "Regional Data Ownership",
            description: "Assign primary ownership of inventory data to specific regions",
            example: "Each region owns its local warehouse inventory, with global coordination for transfers"
          },
          {
            title: "Conflict Resolution Policy",
            description: "Define clear business rules for resolving inventory conflicts",
            example: "Implement business-specific resolution that favors customer experience (e.g., honor orders even if inventory reconciliation is needed)"
          }
        ]
      }
    },
    {
      problem: "The management team needs real-time analytics and forecasting to optimize inventory levels, but the current system struggles to provide timely insights without impacting core operations.",
      requirements: [
        "Add real-time analytics without affecting core inventory operations"
      ],
      metaRequirements: [
        "Create a core system that tracks product quantities and updates inventory levels as products are added or sold",
        "Ensure inventory consistency during high-concurrent operations",
        "Reduce inventory check latency across multiple sales channels",
        "Support multi-region inventory with consistent global view",
        "Add real-time analytics without affecting core inventory operations"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Implement event streaming for inventory changes",
            "Design real-time analytics processing pipeline",
            "Consider predictive modeling for inventory forecasting",
            "Think about anomaly detection for inventory movements"
          ],
          nonFunctional: [
            "Define analytics data freshness requirements",
            "Set performance isolation between operational and analytical workloads",
            "Consider analytics query performance targets",
            "Think about historical data retention policies"
          ]
        },
        systemAPI: [
          "Design analytics query APIs with appropriate filtering",
          "Consider streaming APIs for real-time dashboards",
          "Think about data export APIs for external analysis",
          "Design APIs for forecast consumption"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate analytics query volume and patterns",
            "Estimate event stream throughput for inventory changes",
            "Model concurrent analytics users and dashboards",
            "Consider batch vs. real-time analytics processing"
          ],
          storage: [
            "Calculate storage for historical inventory data",
            "Estimate analytics data warehouse sizing",
            "Consider storage for time-series inventory data",
            "Think about storage for forecast models"
          ],
          memory: [
            "Estimate memory needed for analytics processing",
            "Calculate cache requirements for common analytics queries",
            "Consider in-memory analytics processing requirements"
          ],
          bandwidth: [
            "Calculate bandwidth for event streaming",
            "Estimate data transfer between operational and analytical systems",
            "Consider ETL process bandwidth requirements"
          ]
        },
        highLevelDesign: [
          "Implement Change Data Capture (CDC) from inventory database",
          "Design event-driven architecture for analytics processing",
          "Consider Lambda architecture for real-time and batch processing",
          "Implement separate data warehouse for analytics queries"
        ]
      },
      criteria: [
        "System can track quantity of products across multiple warehouses",
        "System can update inventory levels when products are sold or added",
        "System provides accurate inventory counts for product listings",
        "System prevents selling products that are out of stock",
        "System handles concurrent inventory operations without inconsistencies",
        "System maintains data integrity during high traffic periods",
        "System delivers inventory data with low latency across all sales channels",
        "System properly invalidates cached inventory data when updates occur",
        "System maintains a consistent view of inventory across multiple regions",
        "System allows for regional inventory autonomy when needed",
        "System provides real-time analytics on inventory movements and trends",
        "Analytics processing does not impact core inventory operations"
      ],
      learningsInMD: `
## Key Learnings

### Event-Driven Analytics
- **Change Data Capture**: Capturing inventory changes for analytical processing
- **Event Sourcing**: Using the event log as the system of record for inventory
- **Stream Processing**: Real-time analysis of inventory event streams
- **Complex Event Processing**: Detecting patterns in inventory movements

### Analytical Data Processing
- **OLTP vs. OLAP**: Separating transactional and analytical processing
- **Data Warehousing**: Structuring data for analytical queries
- **Dimensional Modeling**: Star and snowflake schemas for inventory analytics
- **Time-Series Analysis**: Tracking inventory changes over time

### Predictive Inventory Management
- **Demand Forecasting**: Using historical data to predict future inventory needs
- **Anomaly Detection**: Identifying unusual inventory patterns
- **Machine Learning for Inventory**: Optimizing stock levels automatically
- **Feedback Loops**: Using analytics insights to improve operational decisions
      `,
      resources: {
        documentation: [
          {
            title: "Change Data Capture Patterns",
            url: "https://debezium.io/documentation/reference/1.6/",
            description: "Implementing CDC for real-time data integration"
          },
          {
            title: "Real-time Analytics Architecture",
            url: "https://docs.microsoft.com/en-us/azure/architecture/solution-ideas/articles/real-time-analytics",
            description: "Architectural patterns for real-time analytics systems"
          }
        ],
        realWorldCases: [
          {
            name: "Target's Inventory Analytics",
            url: "https://tech.target.com/2020/01/21/it-all-adds-up.html",
            description: "How Target uses data analytics to optimize inventory management"
          },
          {
            name: "Alibaba's Real-time Inventory",
            url: "https://www.alibabacloud.com/blog/real-time-inventory-management-system-through-alibaba-cloud-iot-and-database-solutions_594741",
            description: "Alibaba's approach to real-time inventory analytics"
          }
        ],
        bestPractices: [
          {
            title: "Data Segregation",
            description: "Maintain separate storage for operational and analytical data",
            example: "Use CDC to replicate inventory changes to a dedicated analytics data store"
          },
          {
            title: "Analytical Views",
            description: "Pre-compute common analytical views of inventory data",
            example: "Maintain materialized views for inventory aging, turnover rates, and stockout frequency"
          }
        ]
      }
    }
  ],
  generalLearnings: [
    "Inventory data modeling and database schema design",
    "Concurrency control in distributed systems",
    "Transaction management and data consistency patterns",
    "Caching strategies for read-heavy workloads",
    "Multi-region data architecture and global consistency",
    "Event-driven architecture for real-time analytics",
    "Scalability patterns for high-volume transaction processing",
    "Performance optimization techniques for inventory operations",
    "Predictive analytics and forecasting for inventory management",
    "System integration patterns across sales channels"
  ]
};

export default inventoryManagementChallenge; 