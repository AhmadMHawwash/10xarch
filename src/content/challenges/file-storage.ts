import { type Challenge } from "./types";

const fileStorageChallenge: Challenge = {
  slug: "file-storage-service",
  title: "File Storage Service System Design",
  description: "Design a scalable file storage service focusing on efficient file upload/download, synchronization, and sharing capabilities. Learn key concepts in distributed storage systems and content delivery.",
  difficulty: "Medium",
  isFree: true,
  stages: [
    {
      problem: "Users need to upload and download files reliably with support for large files",
      requirements: [
        "Support reliable file uploads up to 5GB with resumable upload capability and 99.9% upload success rate"
      ],
      metaRequirements: [
        "Support reliable file uploads up to 5GB with resumable upload capability and 99.9% upload success rate"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design chunked upload mechanism",
            "Plan upload resumption strategy",
            "Consider file integrity verification"
          ],
          nonFunctional: [
            "Handle network interruptions gracefully",
            "Ensure upload reliability",
            "Maintain data integrity"
          ]
        },
        systemAPI: [
          "Chunk upload endpoints",
          "Upload status tracking API",
          "File metadata endpoints"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate concurrent uploads",
            "Estimate chunk size and frequency"
          ],
          storage: [
            "File storage requirements",
            "Metadata storage size"
          ],
          memory: [
            "Upload session tracking",
            "Chunk assembly buffer"
          ],
          bandwidth: [
            "Upload bandwidth per user",
            "Total system bandwidth"
          ]
        },
        highLevelDesign: [
          "Upload service architecture",
          "Storage system design",
          "Metadata service"
        ]
      },
      criteria: [
        "System can handle file uploads up to 5GB",
        "Upload success rate meets 99.9%",
        "Uploads are resumable after interruption"
      ],
      learningsInMD: "Learn about chunked upload mechanisms, handling large files, and ensuring data integrity in distributed systems.",
      resources: {
        documentation: [
          {
            title: "Chunked Transfer Encoding",
            url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Transfer-Encoding",
            description: "Understanding chunked transfer encoding for large file uploads"
          }
        ],
        realWorldCases: [
          {
            name: "Dropbox",
            url: "https://dropbox.tech/infrastructure/streaming-file-synchronization",
            description: "How Dropbox handles file synchronization"
          }
        ],
        bestPractices: [
          {
            title: "Resumable Uploads",
            description: "Implement upload resumption using chunk tracking and temporary storage",
            example: "Store upload progress in metadata service and allow clients to resume from last successful chunk"
          }
        ]
      }
    },
    {
      problem: "System needs to efficiently synchronize files across multiple devices",
      requirements: [
        "Implement file synchronization across devices with conflict resolution and <1 minute sync delay for 100,000 concurrent users"
      ],
      metaRequirements: [
        "Support reliable file uploads up to 5GB with resumable upload capability and 99.9% upload success rate",
        "Implement file synchronization across devices with conflict resolution and <1 minute sync delay for 100,000 concurrent users"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design sync notification system",
            "Plan conflict resolution strategy",
            "Consider delta sync mechanism"
          ],
          nonFunctional: [
            "Sync delay under 1 minute",
            "Handle concurrent modifications",
            "Ensure data consistency"
          ]
        },
        systemAPI: [
          "File change notification API",
          "Delta sync endpoints",
          "Conflict resolution API"
        ],
        capacityEstimations: {
          traffic: [
            "Sync operations per second",
            "Change notification frequency"
          ],
          storage: [
            "Version history size",
            "Delta storage requirements"
          ],
          memory: [
            "Active sync session cache",
            "Change notification queue"
          ],
          bandwidth: [
            "Delta sync bandwidth",
            "Notification payload size"
          ]
        },
        highLevelDesign: [
          "Sync service architecture",
          "Notification system design",
          "Conflict resolution system"
        ]
      },
      criteria: [
        "Files sync across devices within 1 minute",
        "System handles conflicts correctly",
        "Supports 100,000 concurrent users"
      ],
      learningsInMD: "Learn about file synchronization mechanisms, conflict resolution strategies, and real-time notification systems.",
      resources: {
        documentation: [
          {
            title: "Vector Clocks",
            url: "https://en.wikipedia.org/wiki/Vector_clock",
            description: "Understanding vector clocks for distributed system synchronization"
          }
        ],
        realWorldCases: [
          {
            name: "Google Drive",
            url: "https://www.google.com/drive/download/",
            description: "Google Drive's approach to file synchronization"
          }
        ],
        bestPractices: [
          {
            title: "Delta Sync",
            description: "Only sync changed portions of files to reduce bandwidth",
            example: "Use rolling checksums to identify changed blocks and sync only those blocks"
          }
        ]
      }
    },
    {
      problem: "Users need to share files and collaborate with others",
      requirements: [
        "Enable file sharing and collaboration features supporting 1 million shared files with appropriate access controls"
      ],
      metaRequirements: [
        "Support reliable file uploads up to 5GB with resumable upload capability and 99.9% upload success rate",
        "Implement file synchronization across devices with conflict resolution and <1 minute sync delay for 100,000 concurrent users",
        "Enable file sharing and collaboration features supporting 1 million shared files with appropriate access controls"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design sharing permission system",
            "Plan collaboration features",
            "Consider access control mechanisms"
          ],
          nonFunctional: [
            "Maintain access control security",
            "Handle concurrent access",
            "Ensure permission propagation"
          ]
        },
        systemAPI: [
          "Sharing management API",
          "Permission check endpoints",
          "Collaboration features API"
        ],
        capacityEstimations: {
          traffic: [
            "Permission checks per second",
            "Sharing operations rate"
          ],
          storage: [
            "Permission data size",
            "Sharing metadata volume"
          ],
          memory: [
            "Active permission cache",
            "Collaboration session data"
          ],
          bandwidth: [
            "Permission update propagation",
            "Collaboration data sync"
          ]
        },
        highLevelDesign: [
          "Permission service design",
          "Sharing system architecture",
          "Collaboration service"
        ]
      },
      criteria: [
        "System handles 1 million shared files",
        "Access controls work correctly",
        "Sharing operations are secure"
      ],
      learningsInMD: "Learn about implementing secure file sharing, access control systems, and collaboration features in distributed systems.",
      resources: {
        documentation: [
          {
            title: "Access Control Lists",
            url: "https://en.wikipedia.org/wiki/Access-control_list",
            description: "Understanding ACLs for file permissions"
          }
        ],
        realWorldCases: [
          {
            name: "Box",
            url: "https://box.com/",
            description: "Box's enterprise file sharing and collaboration features"
          }
        ],
        bestPractices: [
          {
            title: "Hierarchical Permissions",
            description: "Implement hierarchical permission system with inheritance",
            example: "Child objects inherit permissions from parent folders with option to override"
          }
        ]
      }
    }
  ],
  generalLearnings: [
    "Designing distributed storage systems",
    "Implementing efficient file transfer mechanisms",
    "Building reliable synchronization systems",
    "Creating secure sharing and collaboration features",
    "Handling large-scale concurrent operations"
  ]
};

export default fileStorageChallenge; 