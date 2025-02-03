import { type Challenge } from "./types";

const taskManagementChallenge: Challenge = {
  slug: "task-management-system",
  title: "Task Management System Design",
  description: "Design a simple task management system that allows users to create, organize, and track their tasks. Perfect for learning basic system design concepts and data modeling.",
  difficulty: "Easy",
  isFree: true,
  stages: [
    {
      problem: "Users need to create and manage their personal tasks",
      requirements: [
        "Build a task management system that can handle 1000 tasks per user with < 100ms response time"
      ],
      metaRequirements: [
        "Build a task management system that can handle 1000 tasks per user with < 100ms response time"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design task CRUD operations",
            "Plan task list organization",
            "Consider task status tracking"
          ],
          nonFunctional: [
            "Response time under 100ms",
            "Support multiple task lists",
            "Ensure data persistence"
          ]
        },
        systemAPI: [
          "Task management endpoints",
          "List organization API",
          "Task status endpoints"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate tasks per user",
            "Estimate API request frequency"
          ],
          storage: [
            "Task data size per user",
            "User metadata storage"
          ],
          memory: [
            "Active user cache size",
            "Task list cache requirements"
          ],
          bandwidth: [
            "Task operation payload size",
            "List view data transfer"
          ]
        },
        highLevelDesign: [
          "Basic service architecture",
          "Data storage design",
          "Caching strategy"
        ]
      },
      criteria: [
        "System handles 1000 tasks per user",
        "Response time is under 100ms",
        "Basic CRUD operations work correctly"
      ],
      learningsInMD: "Learn about basic CRUD operations, data modeling, and simple caching strategies.",
      resources: {
        documentation: [
          {
            title: "RESTful API Design",
            url: "https://restfulapi.net/",
            description: "Understanding REST API principles for task management"
          }
        ],
        realWorldCases: [
          {
            name: "Todoist",
            url: "https://todoist.com/",
            description: "How Todoist manages task organization"
          }
        ],
        bestPractices: [
          {
            title: "Task Organization",
            description: "Implement hierarchical task lists with basic sorting and filtering",
            example: "Group tasks by projects/lists and allow status-based filtering"
          }
        ]
      }
    },
    {
      problem: "Users want to set due dates and receive notifications for their tasks",
      requirements: [
        "Implement task scheduling and notification system supporting 10,000 daily notifications with 99% delivery rate"
      ],
      metaRequirements: [
        "Build a task management system that can handle 1000 tasks per user with < 100ms response time",
        "Implement task scheduling and notification system supporting 10,000 daily notifications with 99% delivery rate"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design notification system",
            "Plan scheduling mechanism",
            "Consider notification preferences"
          ],
          nonFunctional: [
            "99% notification delivery rate",
            "Handle timezone differences",
            "Ensure notification timing"
          ]
        },
        systemAPI: [
          "Due date management API",
          "Notification preferences endpoints",
          "Notification delivery API"
        ],
        capacityEstimations: {
          traffic: [
            "Daily notification volume",
            "Schedule check frequency"
          ],
          storage: [
            "Notification preferences size",
            "Schedule data volume"
          ],
          memory: [
            "Active schedule cache",
            "Notification queue size"
          ],
          bandwidth: [
            "Notification payload size",
            "Schedule update volume"
          ]
        },
        highLevelDesign: [
          "Notification service design",
          "Scheduling system",
          "Delivery mechanism"
        ]
      },
      criteria: [
        "System handles 10,000 daily notifications",
        "Achieves 99% delivery rate",
        "Notifications are timely"
      ],
      learningsInMD: "Learn about scheduling systems, notification delivery mechanisms, and handling time-based operations.",
      resources: {
        documentation: [
          {
            title: "Cron Scheduling",
            url: "https://en.wikipedia.org/wiki/Cron",
            description: "Understanding time-based job scheduling"
          }
        ],
        realWorldCases: [
          {
            name: "Microsoft To Do",
            url: "https://todo.microsoft.com/",
            description: "Microsoft To Do's reminder system"
          }
        ],
        bestPractices: [
          {
            title: "Notification Design",
            description: "Implement flexible notification preferences with reliable delivery",
            example: "Allow users to choose notification channels (email, push, etc.) and timing preferences"
          }
        ]
      }
    },
    {
      problem: "Users need to categorize and search their tasks efficiently",
      requirements: [
        "Support task categorization and search functionality with < 200ms search response time across 10,000 tasks"
      ],
      metaRequirements: [
        "Build a task management system that can handle 1000 tasks per user with < 100ms response time",
        "Implement task scheduling and notification system supporting 10,000 daily notifications with 99% delivery rate",
        "Support task categorization and search functionality with < 200ms search response time across 10,000 tasks"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design tagging system",
            "Plan search functionality",
            "Consider filtering options"
          ],
          nonFunctional: [
            "Search response under 200ms",
            "Support multiple categories",
            "Enable efficient filtering"
          ]
        },
        systemAPI: [
          "Category management API",
          "Search endpoints",
          "Filter management API"
        ],
        capacityEstimations: {
          traffic: [
            "Search requests per second",
            "Category operations rate"
          ],
          storage: [
            "Category metadata size",
            "Search index volume"
          ],
          memory: [
            "Search index cache",
            "Category cache size"
          ],
          bandwidth: [
            "Search result payload",
            "Category update size"
          ]
        },
        highLevelDesign: [
          "Search service design",
          "Category system",
          "Index management"
        ]
      },
      criteria: [
        "Search completes within 200ms",
        "Category operations work correctly",
        "Filtering is accurate"
      ],
      learningsInMD: "Learn about search system design, categorization mechanisms, and efficient data indexing.",
      resources: {
        documentation: [
          {
            title: "Search Indexing",
            url: "https://www.elastic.co/guide/en/elasticsearch/guide/current/indexing-performance.html",
            description: "Understanding search index design"
          }
        ],
        realWorldCases: [
          {
            name: "Trello",
            url: "https://trello.com/",
            description: "Trello's label and search system"
          }
        ],
        bestPractices: [
          {
            title: "Category Design",
            description: "Implement flexible categorization with efficient search",
            example: "Use tags/labels with full-text search and category-based filtering"
          }
        ]
      }
    }
  ],
  generalLearnings: [
    "Basic system design principles",
    "Simple data modeling and storage",
    "Notification system design",
    "Search and categorization concepts",
    "Performance optimization basics"
  ]
};

export default taskManagementChallenge; 