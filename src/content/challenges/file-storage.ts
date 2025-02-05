import { type Challenge } from "./types";

const fileStorageChallenge: Challenge = {
  slug: "file-storage-system",
  title: "File Storage System Design",
  description: "Design a scalable file storage system that allows users to upload, download, and manage files securely with features like sharing and version control.",
  difficulty: "Medium",
  isFree: true,
  stages: [
    {
      problem: "Users need to upload and download personal files to the cloud securely",
      requirements: [
        "Allow users to upload files up to 100MB in size and download them later"
      ],
      metaRequirements: [
        "Allow users to upload files up to 100MB in size and download them later"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider how to handle file upload interruptions",
            "Think about file integrity verification"
          ],
          nonFunctional: [
            "Consider upload/download speed requirements",
            "Think about concurrent upload/download limits"
          ]
        },
        systemAPI: [
          "Design endpoints for file upload and download operations",
          "Consider chunked upload API design for large files",
          "Think about resumable upload capabilities"
        ],
        capacityEstimations: {
          traffic: [
            "Estimate average file size and daily active users",
            "Calculate peak upload/download operations per second"
          ],
          storage: [
            "Calculate total storage needed based on user growth",
            "Consider storage needed for file metadata"
          ],
          memory: [
            "Estimate memory needed for active upload/download sessions",
            "Consider caching requirements for frequently accessed files"
          ],
          bandwidth: [
            "Calculate network bandwidth for peak upload times",
            "Estimate concurrent download bandwidth requirements"
          ]
        },
        highLevelDesign: [
          "Consider separation of metadata and actual file storage",
          "Think about upload/download service architecture"
        ]
      },
      criteria: [
        "System can handle file uploads up to 100MB",
        "Files can be downloaded reliably",
        "Basic error handling for failed uploads/downloads is implemented"
      ],
      learningsInMD: `
# Key Learnings
- Designing large file upload systems
- Handling network interruptions
- Basic file storage architecture
- API design for file operations
- Capacity planning for storage systems
      `,
      resources: {
        documentation: [
          {
            title: "AWS S3 Design Patterns",
            url: "https://aws.amazon.com/s3/",
            description: "Learn about industry-standard object storage design patterns"
          }
        ],
        realWorldCases: [
          {
            name: "Dropbox Architecture",
            url: "https://dropbox.tech/infrastructure/",
            description: "How Dropbox handles millions of file operations"
          }
        ],
        bestPractices: [
          {
            title: "Chunked Upload Design",
            description: "Break large files into smaller chunks for reliable upload",
            example: "Use 5MB chunks with separate upload sessions"
          }
        ]
      }
    },
    {
      problem: "Users want to share files with others and control access permissions",
      requirements: [
        "Enable file sharing with specific users and manage access permissions (read/write)"
      ],
      metaRequirements: [
        "Allow users to upload files up to 100MB in size and download them later",
        "Enable file sharing with specific users and manage access permissions (read/write)"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider different sharing permission levels",
            "Think about sharing link expiration"
          ],
          nonFunctional: [
            "Consider access control performance",
            "Think about permission propagation delays"
          ]
        },
        systemAPI: [
          "Design sharing invitation endpoints",
          "Consider permission management APIs",
          "Think about shared file discovery endpoints"
        ],
        capacityEstimations: {
          traffic: [
            "Estimate sharing operations per second",
            "Calculate permission checks per file access"
          ],
          storage: [
            "Calculate storage for sharing metadata",
            "Estimate permission table size"
          ],
          memory: [
            "Consider caching for frequently accessed permissions",
            "Estimate memory for active sharing sessions"
          ],
          bandwidth: [
            "Calculate additional bandwidth for shared file access",
            "Estimate notification system bandwidth"
          ]
        },
        highLevelDesign: [
          "Design permission management service",
          "Consider sharing notification system"
        ]
      },
      criteria: [
        "Users can share files with specific permissions",
        "Access control is properly enforced",
        "Sharing operations are tracked and logged"
      ],
      learningsInMD: `
# Key Learnings
- Designing access control systems
- Permission management at scale
- Sharing system architecture
- Security considerations for shared resources
      `,
      resources: {
        documentation: [
          {
            title: "Google Drive Sharing Model",
            url: "https://developers.google.com/drive/api/guides/about-sharing",
            description: "Learn about enterprise-grade file sharing systems"
          }
        ],
        realWorldCases: [
          {
            name: "Box Enterprise Sharing",
            url: "https://box.com/enterprise",
            description: "How Box implements enterprise file sharing"
          }
        ],
        bestPractices: [
          {
            title: "Hierarchical Permissions",
            description: "Implement hierarchical permission model for efficient access control",
            example: "Owner > Editor > Viewer permission hierarchy"
          }
        ]
      }
    },
    {
      problem: "Users need file version control and recovery options",
      requirements: [
        "Implement file versioning with ability to restore previous versions up to 30 days"
      ],
      metaRequirements: [
        "Allow users to upload files up to 100MB in size and download them later",
        "Enable file sharing with specific users and manage access permissions (read/write)",
        "Implement file versioning with ability to restore previous versions up to 30 days"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider version retention policies",
            "Think about version restoration process"
          ],
          nonFunctional: [
            "Consider storage efficiency for versions",
            "Think about version retrieval performance"
          ]
        },
        systemAPI: [
          "Design version history endpoints",
          "Consider version restoration APIs",
          "Think about version cleanup endpoints"
        ],
        capacityEstimations: {
          traffic: [
            "Estimate version creation frequency",
            "Calculate version restoration operations"
          ],
          storage: [
            "Calculate storage for version history",
            "Estimate version metadata size"
          ],
          memory: [
            "Consider caching for recent versions",
            "Estimate memory for version comparison"
          ],
          bandwidth: [
            "Calculate bandwidth for version retrieval",
            "Estimate version backup bandwidth"
          ]
        },
        highLevelDesign: [
          "Design version tracking service",
          "Consider delta storage system"
        ]
      },
      criteria: [
        "System maintains file versions for 30 days",
        "Users can view and restore previous versions",
        "Version storage is optimized for space efficiency"
      ],
      learningsInMD: `
# Key Learnings
- Version control system design
- Delta storage optimization
- Backup and recovery systems
- Storage efficiency strategies
      `,
      resources: {
        documentation: [
          {
            title: "Git Internal Design",
            url: "https://git-scm.com/book/en/v2/Git-Internals-Plumbing-and-Porcelain",
            description: "Learn about efficient version control systems"
          }
        ],
        realWorldCases: [
          {
            name: "OneDrive Version History",
            url: "https://support.microsoft.com/en-us/office/restore-a-previous-version-of-a-file-stored-in-onedrive-159cad6d-d76e-4981-88ef-de6e96c93893",
            description: "How OneDrive implements file versioning"
          }
        ],
        bestPractices: [
          {
            title: "Delta Compression",
            description: "Store only changes between versions to optimize storage",
            example: "Store full copy for major versions, deltas for minor versions"
          }
        ]
      }
    }
  ],
  generalLearnings: [
    "Designing scalable storage systems",
    "Implementing secure file sharing mechanisms",
    "Managing file versions efficiently",
    "Handling large file uploads/downloads",
    "Designing permission and access control systems",
    "Optimizing storage and retrieval operations",
    "Implementing backup and recovery mechanisms"
  ]
};

export default fileStorageChallenge; 