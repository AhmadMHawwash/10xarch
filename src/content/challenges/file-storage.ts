import { type Challenge } from "./types";

const fileStorageChallenge: Challenge = {
  slug: "file-storage-system",
  title: "File Storage System Design",
  description: "Design a highly scalable, reliable, and secure cloud file storage system that enables users to upload, download, share, and manage files with version control. This challenge covers fundamental concepts in distributed storage, access control, data consistency, and optimization techniques for handling large files across a global infrastructure.",
  difficulty: "Medium",
  isFree: false,
  stages: [
    {
      problem: "A startup is building a cloud file storage service to compete with established players. The initial version needs to allow users to securely upload their personal files to the cloud and access them from anywhere. The system must handle files up to 100MB in size, support concurrent uploads and downloads, and ensure file integrity throughout the process. User experience during slow network conditions and interruptions is critical for adoption.",
      requirements: [
        "Design a system that allows users to upload files up to 100MB in size"
      ],
      metaRequirements: [
        "Design a system that allows users to upload files up to 100MB in size"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design chunked file upload system with 5-10MB chunks",
            "Implement MD5/SHA checksum verification for file integrity",
            "Create resumable upload protocol with chunk tracking",
            "Design efficient file retrieval mechanism with appropriate authentication",
            "Implement upload status tracking and progress reporting"
          ],
          nonFunctional: [
            "Ensure upload speeds of at least 10MB/s under good network conditions",
            "Support at least 1,000 concurrent uploads/downloads",
            "Achieve 99.9% upload success rate, even with network interruptions",
            "Limit retrieval latency to under 200ms for recently uploaded files",
            "Design for reliable operation across various network conditions"
          ]
        },
        systemAPI: [
          "Design RESTful API endpoints for file operations (upload, download)",
          "Create chunked upload API with initialization, chunk upload, and finalization endpoints",
          "Implement progress tracking and resumption token endpoints",
          "Design file metadata API for basic file information",
          "Create authentication endpoints for secure file access"
        ],
        capacityEstimations: {
          traffic: [
            "Estimate 100,000 daily active users with 5 file operations per user per day",
            "Calculate peak upload rate during business hours (3x average rate)",
            "Estimate 30% of users uploading simultaneously during peak hours",
            "Model traffic patterns based on file sizes (distribution of small vs large files)",
            "Consider upload retry traffic due to network interruptions"
          ],
          storage: [
            "Estimate 1GB average storage per user with 10M users in year one",
            "Calculate storage growth rate based on user acquisition and usage patterns",
            "Determine metadata storage requirements (approximately 1KB per file)",
            "Plan temporary storage for in-progress uploads and chunks",
            "Consider redundant storage needs for reliability"
          ],
          memory: [
            "Calculate memory needs for tracking active upload sessions",
            "Estimate memory requirements for caching recently uploaded files",
            "Determine cache size for frequently accessed metadata",
            "Calculate memory needs for authentication tokens and sessions",
            "Consider buffer requirements for upload/download operations"
          ],
          bandwidth: [
            "Calculate inbound bandwidth for peak upload times",
            "Estimate outbound bandwidth for download operations",
            "Consider internal bandwidth between storage and application tiers",
            "Estimate bandwidth overhead for chunked upload protocol",
            "Calculate bandwidth needs for upload status updates"
          ]
        },
        highLevelDesign: [
          "Design upload service with chunk management and session tracking",
          "Implement download service with efficient retrieval mechanism",
          "Create blob storage system for raw file data",
          "Design metadata service for file information",
          "Implement authentication service for secure file access"
        ]
      },
      criteria: [
        "System successfully handles uploads and downloads of files up to 100MB",
        "Upload operations can be paused and resumed after network interruptions",
        "Files maintain integrity with verification during all transfer operations",
        "System can handle multiple concurrent uploads efficiently",
        "Upload mechanism works reliably across various network conditions"
      ],
      learningsInMD: `
# Key Learnings

## Large File Transfer Architecture
- **Chunked Upload Design**: Implementing efficient chunked upload protocols for large files
- **Resumable Transfers**: Creating stateful upload sessions with pause/resume capabilities
- **Integrity Verification**: Implementing checksum-based file verification to ensure data integrity
- **Transfer State Management**: Tracking the state of multi-part uploads across distributed systems
- **Upload Optimization**: Techniques for improving upload performance and reliability

## Storage System Architecture
- **Metadata/Data Separation**: Designing systems that separate file metadata from content storage
- **Object Storage Fundamentals**: Understanding blob/object storage patterns and implementation
- **Storage Tiering**: Implementing hot/warm/cold storage tiers for cost optimization
- **Content Addressing**: Using content-based addressing for efficient file storage and retrieval
- **Data Distribution**: Techniques for distributing file data across storage nodes

## Data Integrity and Security
- **End-to-End Verification**: Implementing checksums and verification throughout the storage pipeline
- **Authentication Models**: Designing secure authentication for file access
- **Authorization Patterns**: Implementing file-level access controls
- **Secure Transfer**: Ensuring data security during transit
- **Storage Encryption**: Implementing encryption for data at rest

## Metadata Management
- **Indexing Strategies**: Designing efficient indexes for file metadata
- **Search Optimization**: Implementing fast file search and retrieval
- **Metadata Schema Design**: Creating extensible schemas for file metadata
- **Consistency Models**: Maintaining consistency between metadata and file data
- **Caching Patterns**: Implementing effective metadata caching
      `,
      resources: {
        documentation: [
          {
            title: "AWS S3 Design Patterns",
            url: "https://aws.amazon.com/s3/",
            description: "Understanding industry-standard object storage architecture patterns"
          },
          {
            title: "TUS Resumable Upload Protocol",
            url: "https://tus.io/protocols/resumable-upload",
            description: "Open protocol for resumable file uploads"
          },
          {
            title: "Content-Addressable Storage",
            url: "https://en.wikipedia.org/wiki/Content-addressable_storage",
            description: "Storage architecture based on content hashing"
          },
          {
            title: "Azure Blob Storage",
            url: "https://docs.microsoft.com/en-us/azure/storage/blobs/",
            description: "Microsoft's approach to scalable object storage"
          }
        ],
        realWorldCases: [
          {
            name: "Dropbox Architecture",
            url: "https://dropbox.tech/infrastructure/magic-pocket-infrastructure",
            description: "How Dropbox built their own exabyte-scale storage system"
          },
          {
            name: "Vimeo's Approach to Large Video Uploads",
            url: "https://medium.com/vimeo-engineering-blog/vimeos-approach-to-video-uploads-20f1f124e8f5",
            description: "Vimeo's implementation of large file upload system"
          }
        ],
        bestPractices: [
          {
            title: "Chunked Upload Implementation",
            description: "Break large files into smaller chunks with independent tracking",
            example: "Use 8MB chunks with MD5 checksums, store upload state in database with JSON session objects"
          },
          {
            title: "File Integrity Verification",
            description: "Implement end-to-end checksums for file integrity",
            example: "Generate MD5 hash client-side, verify after each chunk upload, confirm full file hash after completion"
          },
          {
            title: "Metadata Optimization",
            description: "Keep hot metadata in memory for fast access",
            example: "Cache recently accessed file metadata in Redis with appropriate TTL"
          }
        ]
      }
    },
    {
      problem: "As the service grows, users are demanding the ability to collaborate on files. The startup needs to implement a comprehensive sharing system that allows users to share files with specific people, control access permissions, and manage shared content effectively. The system must ensure proper access control while maintaining good performance and user experience for both file owners and recipients.",
      requirements: [
        "Design a sharing system with granular permission controls (viewer, editor, owner)"
      ],
      metaRequirements: [
        "Design a system that allows users to upload files up to 100MB in size",
        "Design a sharing system with granular permission controls (viewer, editor, owner)"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design permission model with different access levels (viewer, editor, owner)",
            "Implement sharing via email and secure links with customizable settings",
            "Create folder-level permissions with inheritance options",
            "Design revocation mechanisms for access rights",
            "Implement permission validation at all access points"
          ],
          nonFunctional: [
            "Ensure permission checks add less than 50ms latency to file operations",
            "Support efficient permission propagation for folder hierarchies",
            "Design for consistent permission enforcement across all access paths",
            "Ensure sharing operations are atomic and consistent",
            "Support at least 100K permission checks per second"
          ]
        },
        systemAPI: [
          "Design permission management API (grant, revoke, modify, check)",
          "Create sharing invitation endpoints with customization options",
          "Implement shared content discovery and navigation APIs",
          "Design secure link generation and validation endpoints",
          "Create permission inheritance and propagation APIs"
        ],
        capacityEstimations: {
          traffic: [
            "Estimate 10 sharing operations per user per day",
            "Calculate permission checks per file access (minimum 1 check per operation)",
            "Model sharing patterns (average number of users a file is shared with)",
            "Estimate peak permission modification times",
            "Calculate traffic patterns for shared content access"
          ],
          storage: [
            "Calculate ACL storage requirements (permissions per file × total files)",
            "Estimate sharing invitation and link storage",
            "Determine audit log storage for permission changes",
            "Plan for denormalized permission data for quick access",
            "Consider storage for sharing analytics"
          ],
          memory: [
            "Estimate cache size for active permission sets",
            "Calculate memory for permission verification service",
            "Determine caching needs for frequently accessed shared content",
            "Plan memory for active sharing links",
            "Consider memory requirements for permission inheritance calculation"
          ],
          bandwidth: [
            "Calculate bandwidth for permission synchronization",
            "Estimate notification delivery bandwidth for sharing events",
            "Consider additional traffic from shared file access",
            "Calculate bandwidth for permission propagation in hierarchies",
            "Estimate permission validation traffic"
          ]
        },
        highLevelDesign: [
          "Design access control service with caching and efficient lookups",
          "Create permission propagation system for hierarchical structures",
          "Implement sharing management service with invitation handling",
          "Design secure link generation with cryptographic verification",
          "Create comprehensive permission enforcement layer"
        ]
      },
      criteria: [
        "System correctly implements and enforces viewer, editor, and owner permission roles",
        "Permission checks add minimal latency to file operations",
        "Permission changes propagate correctly and consistently",
        "Access control system scales efficiently with large numbers of shared files",
        "System prevents unauthorized access through proper permission validation"
      ],
      learningsInMD: `
# Key Learnings

## Access Control System Design
- **Permission Models**: Designing role-based and attribute-based access control systems
- **ACL Implementation**: Efficient storage and retrieval of access control lists
- **Permission Evaluation**: Algorithms for fast permission checking at scale
- **Inheritance Hierarchies**: Managing permissions across nested folders and structures
- **Permission Caching**: Optimizing access control validation with appropriate caching

## Secure Sharing Architecture
- **Link-Based Sharing**: Implementing cryptographically secure sharing links
- **Expiration Mechanisms**: Designing time-bound access with automated expiration
- **Revocation Strategies**: Implementing immediate and efficient access revocation
- **Invitation Flow**: Creating secure invitation and acceptance workflows
- **Delegated Access**: Implementing secure delegation of sharing permissions

## Collaboration Infrastructure
- **Notification Systems**: Designing real-time and asynchronous notification delivery
- **Activity Tracking**: Monitoring and surfacing file activity for collaborators
- **Shared Space Management**: Organizing and presenting shared content effectively
- **Collaboration Analytics**: Measuring and optimizing collaboration patterns
- **Conflict Prevention**: Avoiding editing conflicts in shared environments

## Security and Compliance
- **Audit Trail Design**: Creating comprehensive, tamper-evident audit logging
- **Privacy Controls**: Implementing data boundaries and privacy protections
- **Regulatory Compliance**: Designing for GDPR, HIPAA, and other regulatory requirements
- **Security Analysis**: Detecting and preventing sharing-related security risks
- **Data Governance**: Implementing controls for sensitive data in shared environments
      `,
      resources: {
        documentation: [
          {
            title: "Google Drive Sharing Model",
            url: "https://developers.google.com/drive/api/guides/about-sharing",
            description: "Understanding Google's implementation of sharing permissions"
          },
          {
            title: "Role-Based Access Control (RBAC)",
            url: "https://csrc.nist.gov/projects/role-based-access-control",
            description: "NIST standards for role-based access control"
          },
          {
            title: "OAuth 2.0 Authorization Framework",
            url: "https://oauth.net/2/",
            description: "Standard protocol for authorization"
          },
          {
            title: "Content Security Policies",
            url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP",
            description: "Web security standard for controlling resource access"
          }
        ],
        realWorldCases: [
          {
            name: "Box Enterprise Sharing",
            url: "https://www.box.com/security/access-controls",
            description: "How Box implements enterprise-grade sharing and permissions"
          },
          {
            name: "Notion's Collaborative Workspace",
            url: "https://www.notion.so/help/sharing-and-permissions",
            description: "Notion's approach to collaborative content management"
          }
        ],
        bestPractices: [
          {
            title: "Hierarchical Permission Management",
            description: "Implement efficient permission inheritance with override capabilities",
            example: "Store explicit permissions and calculate effective permissions with inheritance rules; cache frequently accessed permission sets"
          },
          {
            title: "Secure Link Implementation",
            description: "Generate cryptographically secure sharing links with validation",
            example: "Use signed JWTs with expiration, rate limiting, and IP restrictions for public sharing links"
          },
          {
            title: "Permission Denormalization",
            description: "Optimize permission checks with strategic denormalization",
            example: "Maintain denormalized ACL table for quick lookup while ensuring consistency with background reconciliation"
          }
        ]
      }
    },
    {
      problem: "The startup is now facing feature requests for file versioning and history management. Users want to track changes, restore previous versions, and ensure they never lose important work. Additionally, enterprise customers require point-in-time recovery capabilities for compliance and business continuity. The system needs to implement efficient versioning that balances storage costs with comprehensive history preservation.",
      requirements: [
        "Design a versioning system that tracks file changes for at least 30 days"
      ],
      metaRequirements: [
        "Design a system that allows users to upload files up to 100MB in size",
        "Design a sharing system with granular permission controls (viewer, editor, owner)",
        "Design a versioning system that tracks file changes for at least 30 days"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design version creation policies (on every change, scheduled, or manual)",
            "Implement delta compression for efficient version storage",
            "Create version metadata with user attribution and change descriptions",
            "Design restore functionality for previous file versions",
            "Implement version browsing interface with comparison capabilities"
          ],
          nonFunctional: [
            "Limit storage overhead from versioning to maximum 50% of base storage",
            "Ensure version retrieval completes within 2 seconds",
            "Support at least 100 versions per file within retention period",
            "Maintain version history integrity even during system failures",
            "Design for efficient version discovery and navigation"
          ]
        },
        systemAPI: [
          "Design version history retrieval and navigation API",
          "Create version restoration endpoints with conflict resolution",
          "Implement delta comparison and visualization API",
          "Design version creation and policy management endpoints",
          "Create version metadata and annotation API"
        ],
        capacityEstimations: {
          traffic: [
            "Estimate version creation rate (changes per file per day)",
            "Calculate version retrieval and comparison operations frequency",
            "Model restoration operations frequency",
            "Estimate traffic for version browsing and navigation",
            "Calculate metadata operations for version management"
          ],
          storage: [
            "Calculate raw storage required for full versions",
            "Estimate storage savings from delta compression (60-90%)",
            "Determine metadata storage for version history",
            "Plan for temporary storage during restoration",
            "Estimate storage for version comparison operations"
          ],
          memory: [
            "Calculate cache requirements for recent versions",
            "Estimate memory for delta calculations and comparisons",
            "Plan memory needs for version browsing sessions",
            "Determine caching strategy for version metadata",
            "Consider buffer requirements for version restoration"
          ],
          bandwidth: [
            "Calculate bandwidth for version generation and storage",
            "Estimate bandwidth for version retrieval operations",
            "Plan for delta calculation network requirements",
            "Consider bandwidth for version comparison operations",
            "Estimate bandwidth needs for version restoration"
          ]
        },
        highLevelDesign: [
          "Design version tracking service with metadata management",
          "Implement delta storage system with compression",
          "Create version restoration service with conflict resolution",
          "Design version browsing and comparison system",
          "Implement version policy enforcement service"
        ]
      },
      criteria: [
        "System maintains accurate version history for at least 30 days",
        "Users can browse, compare and restore any version within retention period",
        "Delta storage efficiently minimizes space consumption for versions",
        "Version creation has minimal impact on system performance",
        "Version metadata accurately tracks authorship and modification details"
      ],
      learningsInMD: `
# Key Learnings

## Version Control System Design
- **Versioning Models**: Implementing file versioning strategies and policies
- **Delta Storage**: Designing efficient delta-based storage systems
- **Version Metadata**: Creating rich metadata for version tracking and history
- **Version Graphs**: Managing complex version histories with branching and merging
- **Atomicity Guarantees**: Ensuring atomic version creation across related files

## Delta Compression Techniques
- **Binary Delta Algorithms**: Implementing efficient binary difference algorithms
- **Chunking Strategies**: Designing content-defined chunking for optimal deltas
- **Compression Pipelines**: Building multi-stage compression for version storage
- **Rolling Hash Algorithms**: Implementing efficient chunk boundary detection
- **Similarity Detection**: Finding similar content across versions for optimal storage

## Temporal Data Management
- **Point-in-Time Architecture**: Designing systems that support temporal queries
- **Snapshot Isolation**: Implementing consistent snapshots across distributed systems
- **Time Travel Queries**: Building APIs for historical data access
- **Retention Management**: Implementing policy-based retention and pruning
- **Temporal Consistency**: Ensuring consistency in time-based operations

## Backup and Recovery Systems
- **Recovery Point Objectives**: Designing systems with well-defined RPO guarantees
- **Restoration Workflows**: Building efficient recovery procedures
- **Conflict Resolution**: Handling conflicts during version restoration
- **Incremental Backup Design**: Implementing efficient incremental backup systems
- **Disaster Recovery**: Designing for business continuity and disaster scenarios
      `,
      resources: {
        documentation: [
          {
            title: "Git Internal Design",
            url: "https://git-scm.com/book/en/v2/Git-Internals-Plumbing-and-Porcelain",
            description: "Understanding Git's efficient delta-based version control"
          },
          {
            title: "ZFS Snapshot Design",
            url: "https://docs.oracle.com/cd/E19253-01/819-5461/6n7ht6r4f/index.html",
            description: "Copy-on-write snapshot implementation"
          },
          {
            title: "Time-Based Version Control",
            url: "https://martinfowler.com/eaaDev/TemporalObject.html",
            description: "Martin Fowler's patterns for temporal data"
          },
          {
            title: "Rsync Algorithm",
            url: "https://rsync.samba.org/tech_report/",
            description: "Efficient delta synchronization algorithm"
          }
        ],
        realWorldCases: [
          {
            name: "OneDrive Version History",
            url: "https://support.microsoft.com/en-us/office/restore-a-previous-version-of-a-file-stored-in-onedrive-159cad6d-d76e-4981-88ef-de6e96c93893",
            description: "Microsoft's implementation of file versioning in OneDrive"
          },
          {
            name: "Dropbox Smart Sync and Version History",
            url: "https://help.dropbox.com/files-folders/restore-delete/version-history-overview",
            description: "How Dropbox implements efficient versioning and restoration"
          }
        ],
        bestPractices: [
          {
            title: "Delta Compression Implementation",
            description: "Implement efficient delta storage for versions with fallback strategies",
            example: "Use content-defined chunking with variable-sized chunks; store full copies for major versions (every 10th), compute deltas for others; use rolling hash for chunk identification"
          },
          {
            title: "Version Retention Policy",
            description: "Implement tiered retention policies to balance history vs. storage costs",
            example: "Keep all versions for 48 hours, hourly versions for 7 days, daily versions for 30 days, and weekly versions for 90 days"
          },
          {
            title: "Version Metadata",
            description: "Store rich metadata with each version for navigation and management",
            example: "Include user identity, timestamp, change description, parent version reference, and content hash for each version"
          }
        ]
      }
    },
    {
      problem: "The file storage service has grown to millions of users globally, creating challenges with latency, regional compliance, and scalability. Users in different geographic regions experience slow file access, and enterprise customers require data residency compliance for specific regions. The system needs to implement an efficient global distribution architecture while ensuring consistency, compliance, and optimal performance.",
      requirements: [
        "Design a globally distributed storage system with regional data centers"
      ],
      metaRequirements: [
        "Design a system that allows users to upload files up to 100MB in size",
        "Design a sharing system with granular permission controls (viewer, editor, owner)",
        "Design a versioning system that tracks file changes for at least 30 days",
        "Design a globally distributed storage system with regional data centers"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design multi-region architecture with configurable data placement",
            "Implement content delivery network integration for static content",
            "Create regional compliance policies and enforcement mechanisms",
            "Design cross-region replication with appropriate consistency models",
            "Implement latency-based routing for optimal user experience"
          ],
          nonFunctional: [
            "Ensure file access latency under 200ms for 95% of requests in primary regions",
            "Guarantee 99.99% availability across global infrastructure",
            "Support at least 5 geographic regions with independent compliance settings",
            "Maintain consistency guarantees appropriate for file storage context",
            "Optimize bandwidth utilization for cross-region transfers"
          ]
        },
        systemAPI: [
          "Design region selection and preference APIs",
          "Create data residency policy management endpoints",
          "Implement cross-region content migration APIs",
          "Design replication status and monitoring endpoints",
          "Create regional availability and performance reporting APIs"
        ],
        capacityEstimations: {
          traffic: [
            "Model traffic distribution across global regions",
            "Estimate cross-region replication traffic",
            "Calculate CDN offloading potential for static content",
            "Consider regional peak periods based on time zones",
            "Plan for disaster recovery traffic scenarios"
          ],
          storage: [
            "Calculate storage requirements per region",
            "Estimate replication overhead for multi-region redundancy",
            "Plan for regional capacity differences based on user distribution",
            "Consider compliance-driven storage requirements",
            "Determine cache storage sizing for each region"
          ],
          memory: [
            "Estimate cache memory requirements by region",
            "Calculate metadata cache sizing for regional deployments",
            "Plan memory needs for replication management",
            "Consider routing table and location service memory requirements",
            "Determine monitoring and health check memory needs"
          ],
          bandwidth: [
            "Calculate inter-region replication bandwidth",
            "Estimate user traffic bandwidth per region",
            "Plan for backup and disaster recovery bandwidth",
            "Consider monitoring and control plane bandwidth",
            "Model bandwidth costs across different regions and providers"
          ]
        },
        highLevelDesign: [
          "Design multi-region architecture with appropriate consistency model",
          "Implement content routing and replication management system",
          "Create regional compliance enforcement service",
          "Design global metadata synchronization system",
          "Implement CDN integration and cache management system"
        ]
      },
      criteria: [
        "Files are served to users from optimal geographic locations",
        "System enforces data residency requirements for compliance",
        "Cross-region replication maintains consistency within SLAs",
        "System achieves low latency access for users in different regions",
        "Architecture handles regional failures with appropriate redundancy"
      ],
      learningsInMD: `
# Key Learnings

## Global Distribution Architecture
- **Multi-Region Design**: Creating active-active and active-passive regional deployments
- **Data Sovereignty**: Implementing regional data residency controls
- **Latency Optimization**: Designing systems for minimal global access latency
- **Regulatory Compliance**: Building systems that meet global compliance requirements
- **Load Distribution**: Balancing load across global infrastructure

## Replication and Consistency
- **Cross-Region Replication**: Implementing efficient data replication protocols
- **Consistency Models**: Selecting appropriate consistency guarantees for distributed storage
- **Conflict Resolution**: Handling concurrent modifications across regions
- **Synchronization Protocols**: Designing efficient metadata and data synchronization
- **Replication Topologies**: Creating optimal replication patterns across regions

## Content Delivery Optimization
- **CDN Integration**: Designing integration with content delivery networks
- **Cache Strategy**: Implementing multi-level caching for global deployments
- **Origin Shield Patterns**: Protecting origin servers with intermediate caching
- **Dynamic vs. Static Content**: Optimizing delivery strategies for different content types
- **Purge and Invalidation**: Designing cache invalidation mechanisms

## Geographic Routing
- **Request Routing**: Implementing location-aware request routing
- **Anycast Networking**: Using anycast for efficient global traffic management
- **Geolocation Services**: Building accurate geographic detection and routing
- **Disaster Recovery Routing**: Designing routing changes for disaster scenarios
- **Regional Failover**: Implementing automatic failover across regions
      `,
      resources: {
        documentation: [
          {
            title: "AWS Global Accelerator",
            url: "https://aws.amazon.com/global-accelerator/",
            description: "Global routing and acceleration for distributed applications"
          },
          {
            title: "Azure Data Residency",
            url: "https://azure.microsoft.com/en-us/global-infrastructure/data-residency/",
            description: "Microsoft's approach to data sovereignty and compliance"
          },
          {
            title: "Google Cloud CDN",
            url: "https://cloud.google.com/cdn",
            description: "Content delivery network design and implementation"
          },
          {
            title: "CAP Theorem",
            url: "https://en.wikipedia.org/wiki/CAP_theorem",
            description: "Theoretical foundation for distributed systems design"
          }
        ],
        realWorldCases: [
          {
            name: "Netflix's Global Content Delivery",
            url: "https://netflixtechblog.com/open-connect-cdn-part-1-the-evolution-of-netflixs-content-delivery-network-4e4b71fdef89",
            description: "How Netflix optimizes global content delivery"
          },
          {
            name: "Cloudflare's Global Network",
            url: "https://www.cloudflare.com/network/",
            description: "Cloudflare's approach to global distribution and caching"
          }
        ],
        bestPractices: [
          {
            title: "Regional Data Placement",
            description: "Implement policy-based data placement with user preferences",
            example: "Use geolocation, user preferences, and compliance rules to determine optimal file placement; store policy metadata with each file or user account"
          },
          {
            title: "Tiered Caching Architecture",
            description: "Implement multi-level caching strategy for global deployments",
            example: "Deploy edge caches in 50+ locations with TTL based on access patterns; implement regional caches for commonly accessed files; use origin shields to protect primary storage"
          },
          {
            title: "Consistency Management",
            description: "Select appropriate consistency models for different operations",
            example: "Use strong consistency for metadata operations, eventual consistency with TTL bounds for content replication, and conflict resolution for concurrent modifications"
          }
        ]
      }
    },
    {
      problem: "With millions of files stored in the system, users are struggling to find their content efficiently. Additionally, as storage costs grow, the company needs to optimize storage utilization while maintaining performance. The system needs to implement advanced search capabilities, intelligent storage tiering, and data analysis features to improve user experience and operational efficiency.",
      requirements: [
        "Build a scalable search system with metadata and content indexing"
      ],
      metaRequirements: [
        "Design a system that allows users to upload files up to 100MB in size",
        "Design a sharing system with granular permission controls (viewer, editor, owner)",
        "Design a versioning system that tracks file changes for at least 30 days",
        "Design a globally distributed storage system with regional data centers",
        "Build a scalable search system with metadata and content indexing"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design full-text search for file content and metadata",
            "Implement indexing pipeline for various file formats",
            "Create search query language with filtering capabilities",
            "Design relevance ranking algorithm for search results",
            "Implement permission-aware search results filtering"
          ],
          nonFunctional: [
            "Ensure search queries return results in under 500ms for 95th percentile",
            "Support index updates within 5 minutes of content changes",
            "Design for scalable indexing of at least 10TB of content daily",
            "Handle complex search queries with multiple filters and operators",
            "Support indexing for at least 100 file formats"
          ]
        },
        systemAPI: [
          "Design search query API with filtering and sorting options",
          "Create content extraction and indexing endpoints",
          "Implement search suggestion and autocomplete APIs",
          "Design faceted search capability with aggregations",
          "Create search analytics and reporting APIs"
        ],
        capacityEstimations: {
          traffic: [
            "Estimate search queries per second (peak and average)",
            "Calculate indexing workload for new and modified content",
            "Model query complexity distribution (simple vs. complex)",
            "Estimate result set sizes and pagination patterns",
            "Consider background processing for asynchronous indexing"
          ],
          storage: [
            "Calculate search index size (10-20% of original data size)",
            "Estimate storage for index shards and replicas",
            "Plan for content extraction temporary storage",
            "Model index growth rate based on content addition",
            "Consider storage for search suggestion data structures"
          ],
          memory: [
            "Estimate memory requirements for search index segments",
            "Calculate cache size for frequent search queries",
            "Plan memory needs for query processing",
            "Consider memory for relevance scoring models",
            "Determine memory for indexing pipeline operations"
          ],
          bandwidth: [
            "Calculate bandwidth for content extraction and indexing",
            "Estimate bandwidth for distributed search operations",
            "Plan for index replication and synchronization",
            "Consider bandwidth for multi-region search federation",
            "Model internal service communication bandwidth"
          ]
        },
        highLevelDesign: [
          "Design search service with indexing and query processing",
          "Implement content extraction and analysis pipeline",
          "Create distributed index with sharding and replication",
          "Design query parsing and execution engine",
          "Implement relevance ranking and result processing system"
        ]
      },
      criteria: [
        "System indexes both file content and metadata for searchability",
        "Search queries return relevant results efficiently (under 500ms)",
        "Search results respect user permissions and access controls",
        "System handles complex search queries with filtering and sorting",
        "Indexing process scales effectively with growing content volume"
      ],
      learningsInMD: `
# Key Learnings

## Search System Architecture
- **Inverted Index Design**: Building scalable full-text search indexes
- **Search Query Processing**: Implementing efficient query parsing and execution
- **Faceted Search**: Creating multi-dimensional filtering capabilities
- **Relevance Ranking**: Designing algorithms for result relevance scoring
- **Distributed Search**: Scaling search across large datasets and multiple nodes

## Content Processing
- **Document Parsing**: Extracting text and metadata from various file formats
- **Content Classification**: Implementing automatic content categorization
- **Entity Extraction**: Identifying entities and concepts within documents
- **Language Detection**: Determining document language for appropriate processing
- **OCR Integration**: Converting images to searchable text content

## Search Optimization
- **Query Optimization**: Transforming user queries for efficient execution
- **Index Partitioning**: Designing effective sharding strategies for large indexes
- **Caching Strategies**: Implementing multi-level caching for search operations
- **Query Expansion**: Enhancing queries with synonyms and related terms
- **Result Highlighting**: Implementing efficient content snippet generation

## Search User Experience
- **Autocomplete Systems**: Building real-time query suggestion capabilities
- **Spelling Correction**: Implementing "did you mean" functionality
- **Search Analytics**: Tracking and optimizing based on user search patterns
- **Personalized Ranking**: Tailoring results based on user behavior
- **Facet Generation**: Automatically generating navigation facets from content
      `,
      resources: {
        documentation: [
          {
            title: "Elasticsearch Architecture",
            url: "https://www.elastic.co/guide/en/elasticsearch/reference/current/architecture.html",
            description: "Distributed search engine architecture and implementation"
          },
          {
            title: "Apache Lucene Implementation",
            url: "https://lucene.apache.org/core/",
            description: "Core search library powering many search platforms"
          },
          {
            title: "Azure Cognitive Search",
            url: "https://docs.microsoft.com/en-us/azure/search/",
            description: "AI-powered cloud search service"
          },
          {
            title: "Apache Tika Content Analysis",
            url: "https://tika.apache.org/",
            description: "Content detection and analysis toolkit"
          }
        ],
        realWorldCases: [
          {
            name: "Google Drive's Search and ML Features",
            url: "https://cloud.google.com/blog/products/g-suite/whats-new-for-google-drive-making-work-easier",
            description: "How Google implements smart search and content organization"
          },
          {
            name: "Box's Intelligent Content Management",
            url: "https://www.box.com/en-gb/blog/box-skills-brings-intelligence-content-management",
            description: "Box's approach to AI-powered content classification and search"
          }
        ],
        bestPractices: [
          {
            title: "Search Index Design",
            description: "Implement efficient indexing strategy balancing comprehensiveness and performance",
            example: "Index metadata in real-time; extract text content asynchronously; use sharded indices with appropriate routing; implement custom analyzers for different content types"
          },
          {
            title: "Query Processing Pipeline",
            description: "Create multi-stage query processing for optimal performance",
            example: "Implement query parsing, analysis, expansion, execution and result processing stages; cache intermediate results for common query patterns"
          },
          {
            title: "Content Extraction Strategy",
            description: "Design efficient pipeline for content extraction from various file types",
            example: "Use Apache Tika for format detection and extraction; implement format-specific optimizations for common types; index extracted metadata separately from content"
          }
        ]
      }
    }
  ],
  generalLearnings: [
    "Designing scalable and reliable storage systems",
    "Implementing efficient large file transfer mechanisms",
    "Building secure file sharing and access control systems",
    "Designing version control and point-in-time recovery",
    "Creating globally distributed content delivery architecture",
    "Implementing data residency and regulatory compliance",
    "Building search and content intelligence capabilities",
    "Optimizing storage with tiering and deduplication",
    "Designing metadata management and indexing systems",
    "Implementing analytics and recommendations for content management"
  ]
};

export default fileStorageChallenge; 