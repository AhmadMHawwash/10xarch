import { type Challenge } from "./types";

const taskManagementChallenge: Challenge = {
  slug: "basic-task-management",
  title: "Task Management System Design",
  description: "Design a task management system focusing on data organization, task tracking, and collaboration. Learn core system design concepts through practical task management features.",
  difficulty: "Easy",
  isFree: true,
  stages: [
    {
      problem: "Users need to create and manage their personal tasks",
      requirements: [
        "Implement basic CRUD operations for personal tasks"
      ],
      metaRequirements: [
        "Implement basic CRUD operations for personal tasks"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Think about task properties (title, description, status)",
            "Consider task state transitions (todo, in-progress, done)"
          ],
          nonFunctional: [
            "Consider response time expectations",
            "Think about data consistency needs"
          ]
        },
        systemAPI: [
          "What endpoints do you need for task management?",
          "How would you structure the task data?",
          "Consider API versioning approach"
        ],
        capacityEstimations: {
          traffic: [
            "How many tasks per user?",
            "What's your expected user base?"
          ],
          storage: [
            "How much data per task?",
            "Consider task history needs"
          ],
          memory: [
            "What data needs caching?",
            "Think about active user sessions"
          ],
          bandwidth: [
            "Calculate task payload size",
            "Consider request frequency"
          ]
        },
        highLevelDesign: [
          "Where will you store tasks?",
          "How will you handle task updates?",
          "Consider basic data access patterns"
        ]
      },
      criteria: [
        "Users can create, read, update, and delete tasks",
        "Task status changes are tracked",
        "Basic task data is persisted"
      ],
      learningsInMD: `
## Key Learnings

### Data Modeling
- Basic entity design
- State management
- Storage patterns

### API Design
- RESTful endpoints
- Resource modeling
- Basic CRUD operations
      `,
      resources: {
        documentation: [
          {
            title: "REST API Design",
            url: "https://docs.microsoft.com/en-us/azure/architecture/best-practices/api-design",
            description: "Best practices for REST API design"
          }
        ],
        realWorldCases: [
          {
            name: "Trello Architecture",
            url: "https://tech.trello.com/how-we-built-trello",
            description: "Basic task management system architecture"
          }
        ],
        bestPractices: [
          {
            title: "Task Data Model",
            description: "Include essential task metadata",
            example: "id, title, status, created_at, updated_at"
          }
        ]
      }
    },
    {
      problem: "Users want to share and collaborate on task lists with team members",
      requirements: [
        "Add multi-user collaboration features for task management"
      ],
      metaRequirements: [
        "Implement basic CRUD operations for personal tasks",
        "Add multi-user collaboration features for task management"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Think about access controls",
            "Consider collaboration modes"
          ],
          nonFunctional: [
            "Consider data isolation",
            "Think about concurrent updates"
          ]
        },
        systemAPI: [
          "How will you handle permissions?",
          "Consider team management APIs",
          "Think about sharing mechanisms"
        ],
        capacityEstimations: {
          traffic: [
            "How many users per task list?",
            "Consider collaborative access patterns"
          ],
          storage: [
            "Think about permission data size",
            "Consider team data storage"
          ],
          memory: [
            "What team data to cache?",
            "Consider active collaboration sessions"
          ],
          bandwidth: [
            "Calculate team data transfer needs",
            "Consider update notifications"
          ]
        },
        highLevelDesign: [
          "How will you manage permissions?",
          "Consider team data organization",
          "Think about update distribution"
        ]
      },
      criteria: [
        "Users can share task lists",
        "Team members can collaborate on tasks",
        "Basic access control works"
      ],
      learningsInMD: `
## Key Learnings

### Multi-user Systems
- Access control patterns
- Collaboration models
- Permission management

### Data Organization
- Team-based data structures
- Sharing mechanisms
- Concurrent access handling
      `,
      resources: {
        documentation: [
          {
            title: "Role-Based Access Control",
            url: "https://auth0.com/docs/authorization/rbac",
            description: "Understanding RBAC for collaboration"
          }
        ],
        realWorldCases: [
          {
            name: "Asana Teams",
            url: "https://asana.com/guide/team",
            description: "How Asana implements team collaboration"
          }
        ],
        bestPractices: [
          {
            title: "Permission Model",
            description: "Implement granular access controls",
            example: "view, edit, admin permission levels"
          }
        ]
      }
    },
    {
      problem: "Task lists are loading slowly as they grow larger",
      requirements: [
        "Optimize task list loading and management for larger scales"
      ],
      metaRequirements: [
        "Implement basic CRUD operations for personal tasks",
        "Add multi-user collaboration features for task management",
        "Optimize task list loading and management for larger scales"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider pagination needs",
            "Think about search capabilities"
          ],
          nonFunctional: [
            "Consider response time goals",
            "Think about data retrieval efficiency"
          ]
        },
        systemAPI: [
          "How will you implement pagination?",
          "Consider filtering options",
          "Think about search endpoints"
        ],
        capacityEstimations: {
          traffic: [
            "What's your largest task list size?",
            "Consider query patterns"
          ],
          storage: [
            "Think about index size",
            "Consider search data structures"
          ],
          memory: [
            "What to cache for faster access?",
            "Consider pagination cache"
          ],
          bandwidth: [
            "Calculate paginated response size",
            "Consider data transfer optimization"
          ]
        },
        highLevelDesign: [
          "How will you implement search?",
          "Consider caching strategy",
          "Think about data indexing"
        ]
      },
      criteria: [
        "Task lists load quickly",
        "Pagination works efficiently",
        "Basic search functionality works"
      ],
      learningsInMD: `
## Key Learnings

### Performance Optimization
- Pagination patterns
- Caching strategies
- Search implementation

### Data Access
- Indexing basics
- Query optimization
- Efficient data retrieval
      `,
      resources: {
        documentation: [
          {
            title: "Database Indexing",
            url: "https://use-the-index-luke.com/",
            description: "Understanding database indexing"
          }
        ],
        realWorldCases: [
          {
            name: "Monday.com Performance",
            url: "https://monday.com/blog/tech/performance",
            description: "How Monday.com optimizes performance"
          }
        ],
        bestPractices: [
          {
            title: "Pagination",
            description: "Implement cursor-based pagination",
            example: "Use task ID as cursor for consistent ordering"
          }
        ]
      }
    },
    {
      problem: "Users want to be notified of task updates and assignments",
      requirements: [
        "Implement task notification system"
      ],
      metaRequirements: [
        "Implement basic CRUD operations for personal tasks",
        "Add multi-user collaboration features for task management",
        "Optimize task list loading and management for larger scales",
        "Implement task notification system"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider notification types",
            "Think about delivery methods"
          ],
          nonFunctional: [
            "Consider notification timing",
            "Think about delivery reliability"
          ]
        },
        systemAPI: [
          "How will you trigger notifications?",
          "Consider notification preferences",
          "Think about delivery status"
        ],
        capacityEstimations: {
          traffic: [
            "How many notifications per update?",
            "Consider notification patterns"
          ],
          storage: [
            "Think about notification history",
            "Consider preference storage"
          ],
          memory: [
            "What notification data to cache?",
            "Consider delivery queues"
          ],
          bandwidth: [
            "Calculate notification payload",
            "Consider delivery protocols"
          ]
        },
        highLevelDesign: [
          "How will you queue notifications?",
          "Consider delivery system",
          "Think about failure handling"
        ]
      },
      criteria: [
        "Users receive task update notifications",
        "Notification preferences work",
        "Notifications are reliable"
      ],
      learningsInMD: `
## Key Learnings

### Event Processing
- Notification systems
- Event queuing
- Delivery patterns

### Asynchronous Systems
- Message queues
- Event handling
- Delivery guarantees
      `,
      resources: {
        documentation: [
          {
            title: "RabbitMQ Tutorials",
            url: "https://www.rabbitmq.com/getstarted.html",
            description: "Understanding message queues"
          }
        ],
        realWorldCases: [
          {
            name: "Jira Notifications",
            url: "https://confluence.atlassian.com/jirasoftwarecloud/notifications",
            description: "How Jira handles notifications"
          }
        ],
        bestPractices: [
          {
            title: "Notification Design",
            description: "Implement notification preferences",
            example: "Allow per-event and per-channel settings"
          }
        ]
      }
    },
    {
      problem: "System becomes unresponsive during backup and maintenance",
      requirements: [
        "Implement basic high availability for the task system"
      ],
      metaRequirements: [
        "Implement basic CRUD operations for personal tasks",
        "Add multi-user collaboration features for task management",
        "Optimize task list loading and management for larger scales",
        "Implement task notification system",
        "Implement basic high availability for the task system"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Consider backup procedures",
            "Think about maintenance windows"
          ],
          nonFunctional: [
            "Consider availability goals",
            "Think about data durability"
          ]
        },
        systemAPI: [
          "How will you handle failover?",
          "Consider health checks",
          "Think about backup APIs"
        ],
        capacityEstimations: {
          traffic: [
            "What's your backup data size?",
            "Consider maintenance impact"
          ],
          storage: [
            "Think about backup storage",
            "Consider redundancy needs"
          ],
          memory: [
            "What fails over to backup?",
            "Consider recovery state"
          ],
          bandwidth: [
            "Calculate backup transfer needs",
            "Consider replication traffic"
          ]
        },
        highLevelDesign: [
          "How will you handle failover?",
          "Consider backup strategy",
          "Think about monitoring"
        ]
      },
      criteria: [
        "System remains available during maintenance",
        "Backups don't impact performance",
        "Basic failover works"
      ],
      learningsInMD: `
## Key Learnings

### High Availability
- Backup strategies
- Failover patterns
- Maintenance procedures

### System Operations
- Monitoring basics
- Backup management
- Recovery procedures
      `,
      resources: {
        documentation: [
          {
            title: "Database Replication",
            url: "https://docs.mongodb.com/manual/replication/",
            description: "Understanding database replication"
          }
        ],
        realWorldCases: [
          {
            name: "Todoist Reliability",
            url: "https://blog.todoist.com/reliability",
            description: "How Todoist maintains availability"
          }
        ],
        bestPractices: [
          {
            title: "Backup Strategy",
            description: "Implement incremental backups",
            example: "Use write-ahead logs for point-in-time recovery"
          }
        ]
      }
    }
  ],
  generalLearnings: [
    "Basic CRUD system design",
    "Multi-user collaboration patterns",
    "Performance optimization techniques",
    "Event-driven architecture basics",
    "High availability fundamentals",
    "Data modeling and storage patterns",
    "API design principles",
    "Basic system scaling approaches"
  ]
};

export default taskManagementChallenge; 