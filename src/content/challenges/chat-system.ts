import { type Challenge } from "./types";

const chatSystemChallenge: Challenge = {
  slug: "basic-chat-system",
  title: "Real-time Chat System Design",
  description: "Design a scalable, reliable real-time chat system that delivers messages instantly, handles network failures gracefully, and scales to support millions of users. This challenge covers foundational distributed systems concepts including real-time communication, data consistency, fault tolerance, and performance optimization.",
  difficulty: "Easy",
  isFree: false,
  stages: [
    {
      problem: "A startup is launching a new messaging application and needs to build the core messaging functionality. Users need to be able to send and receive text messages in real-time without significant delays. The initial version should focus on reliable 1-on-1 messaging with basic delivery confirmation.",
      requirements: [
        "Design a real-time messaging system for 1-on-1 communication"
      ],
      metaRequirements: [
        "Design a real-time messaging system for 1-on-1 communication"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design message data structure with appropriate metadata (timestamp, sender, recipient, status)",
            "Implement real-time delivery mechanism using WebSockets or similar technology",
            "Create message persistence layer for history and reliable retrieval",
            "Implement message status updates (sent → delivered → read)",
            "Design conversation model for organizing messages between users"
          ],
          nonFunctional: [
            "Ensure message delivery latency under 500ms for 99th percentile",
            "Design for 99.9% message delivery success rate",
            "Optimize real-time connection management for minimal overhead",
            "Ensure efficient message history retrieval (under 300ms)",
            "Implement secure transport for all message data"
          ]
        },
        systemAPI: [
          "Design send message API with status tracking capability",
          "Create message history retrieval API with pagination",
          "Implement WebSocket protocol for bidirectional real-time communication",
          "Design status update API for message delivery confirmations",
          "Create user presence indicators (online, offline, typing)"
        ],
        capacityEstimations: {
          traffic: [
            "Estimate daily active users (10,000 initially) and messages per user per day (20 avg)",
            "Calculate peak message rate (typically 5x average)",
            "Estimate concurrent connection count (30-50% of active users)",
            "Model traffic patterns throughout the day",
            "Plan for 3x traffic growth in 6 months"
          ],
          storage: [
            "Calculate message storage (avg message size 1KB × messages per day × retention period)",
            "Estimate metadata storage overhead (20-30% of message size)",
            "Plan for 90-day message retention policy",
            "Calculate conversation index size",
            "Estimate status tracking data storage needs"
          ],
          memory: [
            "Calculate memory needs for active WebSocket connections (2-5KB per connection)",
            "Estimate cache size for active conversations",
            "Plan for in-memory message status tracking",
            "Calculate memory for message delivery queues",
            "Estimate session state memory requirements"
          ],
          bandwidth: [
            "Calculate average message size including metadata (200-500 bytes)",
            "Estimate WebSocket connection overhead (ping/pong frames)",
            "Calculate bandwidth for peak message throughput",
            "Estimate bandwidth for message history retrieval",
            "Model bandwidth needs for status updates"
          ]
        },
        highLevelDesign: [
          "Design connection management service for WebSocket connections",
          "Implement message storage system with efficient query patterns for history",
          "Create message delivery service with status tracking",
          "Design user presence tracking system",
          "Implement notification service for message delivery confirmations"
        ]
      },
      criteria: [
        "Messages are delivered in real-time (under 500ms) under normal conditions",
        "Users can view accurate message history when opening a conversation",
        "Message status updates (sent, delivered, read) work correctly",
        "System handles the expected message throughput",
        "Basic security measures are in place (TLS, authentication)"
      ],
      learningsInMD: `
# Key Learnings

## Real-time Communication Protocols
- **WebSocket Implementation**: Understanding WebSocket lifecycle, including connection establishment, message framing, and heartbeats
- **Long Polling vs. WebSockets**: Comparing different real-time communication approaches and their tradeoffs
- **Protocol Selection**: Evaluating factors like latency requirements, browser support, and proxy compatibility
- **Connection State Management**: Handling connection establishment, maintenance, and graceful termination

## Message Delivery Architecture
- **Push vs. Pull Models**: Understanding different message delivery paradigms and when to use each
- **Delivery Guarantees**: Implementing at-least-once, at-most-once, and exactly-once delivery semantics
- **Message Routing**: Designing efficient message routing from sender to recipient
- **Acknowledgment Systems**: Creating reliable delivery confirmation mechanisms

## Data Modeling for Chat Systems
- **Message Schema Design**: Structuring message data with appropriate metadata
- **Conversation Management**: Organizing messages into conversations with efficient retrieval
- **User Session Modeling**: Tracking user connection state and presence information
- **Status Tracking**: Implementing message status lifecycle with appropriate state transitions

## Storage Patterns
- **Message Persistence**: Designing storage systems optimized for chat message patterns
- **Access Patterns**: Optimizing for efficient message history retrieval
- **Time-Series Data**: Working with time-ordered message data
- **Indexing Strategies**: Creating effective indexes for message queries
      `,
      resources: {
        documentation: [
          {
            title: "WebSocket API",
            url: "https://developer.mozilla.org/en-US/docs/Web/API/WebSocket",
            description: "Comprehensive guide to implementing WebSockets for real-time communication"
          },
          {
            title: "Designing Data Models for Chat",
            url: "https://firebase.google.com/docs/firestore/data-model",
            description: "Best practices for designing data models for messaging applications"
          },
          {
            title: "Socket.IO Documentation",
            url: "https://socket.io/docs/v4/",
            description: "Popular library for real-time web applications with WebSocket support"
          },
          {
            title: "Message Delivery Semantics",
            url: "https://www.cloudcomputingpatterns.org/exactly_once_delivery/",
            description: "Understanding different message delivery guarantees"
          }
        ],
        realWorldCases: [
          {
            name: "Discord's Architecture",
            url: "https://discord.com/blog/how-discord-stores-billions-of-messages",
            description: "How Discord manages message storage and real-time delivery at scale"
          },
          {
            name: "WhatsApp Architecture",
            url: "https://highscalability.com/blog/2014/2/26/the-whatsapp-architecture-facebook-bought-for-19-billion.html",
            description: "Overview of WhatsApp's messaging architecture fundamentals"
          }
        ],
        bestPractices: [
          {
            title: "Message Structure",
            description: "Include comprehensive metadata with each message for tracking and display",
            example: "{ id: UUID, sender_id, recipient_id, content, timestamp, status, conversation_id }"
          },
          {
            title: "Connection Management",
            description: "Implement heartbeat mechanism to detect stale connections",
            example: "Send ping frame every 30 seconds, close connection if no response after 2 attempts"
          },
          {
            title: "Message Identifiers",
            description: "Generate unique, ordered identifiers for all messages",
            example: "Use UUID v4 or timestamp-based IDs to ensure uniqueness across the system"
          }
        ]
      }
    },
    {
      problem: "As the application gains users, reliability issues have emerged. Users who experience poor connectivity or frequently switch between networks (mobile data to WiFi) report messages being lost. The product team wants to ensure that messages are reliably delivered even when users have unstable internet connections or go offline temporarily.",
      requirements: [
        "Implement offline message support for reliable delivery during connectivity issues"
      ],
      metaRequirements: [
        "Design a real-time messaging system for 1-on-1 communication",
        "Implement offline message support for reliable delivery during connectivity issues"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design client-side message queue for storing messages during offline periods",
            "Implement message persistence on both client and server sides",
            "Create efficient synchronization protocol for reconnection scenarios",
            "Design sequence numbering system for maintaining message order",
            "Implement idempotent message delivery to prevent duplicates"
          ],
          nonFunctional: [
            "Ensure system can handle extended offline periods (up to 24+ hours)",
            "Optimize reconnection bandwidth usage for efficient sync",
            "Implement efficient client storage for offline messages (size and access)",
            "Ensure message ordering consistency across devices",
            "Maintain battery-efficient background sync on mobile devices"
          ]
        },
        systemAPI: [
          "Design batch message sending API for reconnection scenarios",
          "Create incremental sync protocol with message IDs and timestamps",
          "Implement message status reconciliation for offline period",
          "Design conflict resolution API for handling concurrent edits",
          "Create robust retry mechanism with exponential backoff"
        ],
        capacityEstimations: {
          traffic: [
            "Estimate percentage of users with intermittent connectivity (20-30%)",
            "Calculate average offline queue size (messages per offline period)",
            "Model reconnection surge patterns (peak reconnection rate)",
            "Estimate server-side queue size for offline recipients",
            "Calculate batch sync throughput requirements"
          ],
          storage: [
            "Estimate client-side storage needs for offline messages",
            "Calculate server-side pending message queue storage",
            "Model message state persistence requirements",
            "Estimate metadata overhead for sync and ordering",
            "Plan retention policy for undelivered messages"
          ],
          memory: [
            "Calculate memory for tracking offline user message queues",
            "Estimate memory for pending delivery tracking",
            "Model memory needs for message ordering and deduplication",
            "Calculate connection state restoration memory",
            "Estimate client-side caching requirements"
          ],
          bandwidth: [
            "Calculate reconnection sync payload sizes for various offline durations",
            "Estimate bandwidth savings from incremental sync mechanisms",
            "Model compression options for batch message transfer",
            "Calculate bandwidth for message state reconciliation",
            "Estimate retry traffic overhead"
          ]
        },
        highLevelDesign: [
          "Design client-side persistence layer with appropriate storage selection",
          "Create server-side message queue system for offline recipients",
          "Implement efficient reconnection protocol with incremental synchronization",
          "Design message delivery tracking system with acknowledgments",
          "Create versioning system for conflict detection and resolution"
        ]
      },
      criteria: [
        "Messages sent during offline periods are delivered when connectivity resumes",
        "Message ordering is maintained even with delayed delivery",
        "System efficiently synchronizes state after connection gaps",
        "Duplicate messages are prevented during resynchronization",
        "Users can continue creating messages while offline"
      ],
      learningsInMD: `
# Key Learnings

## Offline-First Architecture
- **Client-Side Persistence**: Implementing robust local storage for offline operation
- **Message Queuing**: Designing message queues for delayed transmission
- **Sync Protocols**: Creating efficient protocols for state synchronization after connectivity gaps
- **Progressive Enhancement**: Building systems that degrade gracefully with connectivity limitations

## Message Reliability Patterns
- **Message Acknowledgment Systems**: Implementing reliable delivery confirmation
- **Retry Strategies**: Designing exponential backoff and retry limits
- **Idempotent Operations**: Ensuring operations can be safely repeated without side effects
- **Partial Failure Handling**: Designing systems resilient to various connectivity scenarios

## Data Synchronization
- **Incremental Sync**: Efficiently synchronizing data after connection gaps
- **Conflict Resolution**: Handling conflicts from concurrent updates during offline periods
- **State Reconciliation**: Merging client and server state after reconnection
- **Cache Invalidation**: Maintaining consistency between local and remote data

## Distributed Systems Fundamentals
- **Exactly-Once Delivery**: Implementing deduplication mechanisms
- **Message Ordering**: Preserving causal relationships between messages
- **Distributed Consensus**: Understanding consistency challenges in distributed communication
- **Eventual Consistency**: Designing systems that converge to consistent state despite delays
      `,
      resources: {
        documentation: [
          {
            title: "Offline-First Web Applications",
            url: "https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers",
            description: "Building web applications that work without continuous connectivity"
          },
          {
            title: "CouchDB Replication Protocol",
            url: "https://docs.couchdb.org/en/stable/replication/protocol.html",
            description: "Example of a robust data synchronization protocol for offline-first applications"
          },
          {
            title: "IndexedDB API",
            url: "https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API",
            description: "Client-side storage for significant amounts of structured data"
          },
          {
            title: "CRDT Data Structures",
            url: "https://crdt.tech/",
            description: "Conflict-free replicated data types for synchronization"
          }
        ],
        realWorldCases: [
          {
            name: "WhatsApp's Offline Message Handling",
            url: "https://blog.whatsapp.com/reliable-messaging",
            description: "How WhatsApp ensures message delivery in challenging network conditions"
          },
          {
            name: "Signal's Protocol",
            url: "https://signal.org/blog/private-contact-discovery/",
            description: "Signal's approach to secure, reliable messaging with offline support"
          }
        ],
        bestPractices: [
          {
            title: "Message Persistence",
            description: "Store messages in durable storage until confirmed delivery",
            example: "Use IndexedDB on client and persistent message queue on server with delivery confirmations"
          },
          {
            title: "Synchronization Efficiency",
            description: "Use incremental sync with message IDs to minimize data transfer",
            example: "Client sends highest received message ID, server sends only newer messages"
          },
          {
            title: "Conflict Resolution",
            description: "Implement timestamp-based conflict resolution for concurrent edits",
            example: "When conflicts occur, preserve both versions with timestamp metadata or use CRDTs"
          }
        ]
      }
    },
    {
      problem: "The messaging application has grown rapidly to 500,000 daily active users, and the current infrastructure is struggling during peak hours. Users report increased message delivery times and occasional system unavailability. The engineering team needs to scale the system to handle growing traffic while maintaining performance and reliability.",
      requirements: [
        "Scale the messaging system to handle increased user load"
      ],
      metaRequirements: [
        "Design a real-time messaging system for 1-on-1 communication",
        "Implement offline message support for reliable delivery during connectivity issues",
        "Scale the messaging system to handle increased user load"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design horizontally scalable architecture for all system components",
            "Implement efficient connection distribution across server fleet",
            "Create message routing system between distributed servers",
            "Design database sharding strategy for messages and conversations",
            "Implement autoscaling mechanisms based on load metrics"
          ],
          nonFunctional: [
            "Maintain message delivery latency under 500ms at 99th percentile during peak load",
            "Ensure 99.95% service availability during scaling events",
            "Design for linear cost scaling with increasing user base",
            "Optimize resource utilization for cost efficiency",
            "Support seamless capacity expansion without downtime"
          ]
        },
        systemAPI: [
          "Design service discovery mechanism for distributed components",
          "Create load balancing strategy for WebSocket connections",
          "Implement connection affinity with consistent hashing",
          "Design cross-server message routing protocol",
          "Create health check and monitoring endpoints"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate peak messages per second (5,000+) based on user activity patterns",
            "Estimate WebSocket connection count (500,000 × active connection ratio)",
            "Model regional distribution of users for global service",
            "Calculate connection establishment rate during peak hours",
            "Estimate database read/write operations per second"
          ],
          storage: [
            "Calculate message storage growth rate (messages per day × avg size)",
            "Design storage sharding strategy based on conversation ID",
            "Estimate database IOPS required for message throughput",
            "Plan storage capacity for user profile and connection data",
            "Model index size growth for efficient message retrieval"
          ],
          memory: [
            "Calculate per-server memory requirements for active connections",
            "Estimate distributed cache size for active conversations",
            "Model memory needs for connection state management",
            "Calculate memory for message routing tables",
            "Plan for in-memory queue sizing"
          ],
          bandwidth: [
            "Calculate internal network traffic between distributed components",
            "Estimate external bandwidth for client connections during peak",
            "Model cross-region bandwidth for global deployment",
            "Calculate database replication bandwidth",
            "Estimate monitoring and logging data volume"
          ]
        },
        highLevelDesign: [
          "Design horizontally scalable WebSocket server cluster",
          "Implement message broker for cross-server communication",
          "Create distributed caching layer for active conversations",
          "Design database sharding strategy for messages and conversations",
          "Implement comprehensive monitoring and alerting system"
        ]
      },
      criteria: [
        "System handles 5,000+ messages per second at peak load",
        "99th percentile message delivery latency remains under 500ms",
        "Resources scale efficiently with increasing load",
        "No single point of failure exists in the architecture",
        "System allows for seamless capacity expansion"
      ],
      learningsInMD: `
# Key Learnings

## Horizontal Scaling Techniques
- **Stateless Service Design**: Creating services that can scale horizontally without shared state
- **Connection Distribution**: Efficiently distributing WebSocket connections across server fleet
- **Consistent Hashing**: Implementing consistent hashing for load distribution with minimal rebalancing
- **Sticky Sessions**: Balancing connection affinity with load distribution

## Load Balancing
- **WebSocket-Aware Load Balancing**: Configuring load balancers for long-lived connections
- **Layer 4 vs. Layer 7 Balancing**: Understanding tradeoffs between TCP and application-level load balancing
- **Health Checking**: Implementing robust server health monitoring
- **Graceful Degradation**: Designing systems that handle partial failures

## Distributed Messaging Architecture
- **Message Broker Integration**: Using systems like Kafka, RabbitMQ, or Redis for reliable message distribution
- **Publish-Subscribe Patterns**: Implementing efficient pub/sub systems for real-time delivery
- **Queue Sharding**: Distributing message queues for throughput and reliability
- **Backpressure Handling**: Managing system behavior under high load

## Performance Optimization
- **Connection Pooling**: Efficiently managing database and service connections
- **Resource Utilization**: Optimizing CPU, memory, and I/O across services
- **Caching Strategies**: Implementing multi-level caching for hot conversation data
- **Database Optimization**: Tuning databases for chat-specific workloads
      `,
      resources: {
        documentation: [
          {
            title: "Scaling WebSocket Connections",
            url: "https://www.nginx.com/blog/websocket-nginx/",
            description: "Best practices for scaling WebSocket connections with NGINX"
          },
          {
            title: "Redis Pub/Sub",
            url: "https://redis.io/topics/pubsub",
            description: "Using Redis pub/sub for real-time message distribution"
          },
          {
            title: "Cassandra Data Modeling",
            url: "https://www.datastax.com/blog/best-practices-cassandra-data-modeling",
            description: "Designing Cassandra schemas for chat applications"
          },
          {
            title: "Kafka Streams",
            url: "https://kafka.apache.org/documentation/streams/",
            description: "Real-time stream processing for message delivery"
          }
        ],
        realWorldCases: [
          {
            name: "Slack's Scaling Journey",
            url: "https://slack.engineering/scaling-slacks-job-queue/",
            description: "How Slack scaled their messaging infrastructure to millions of users"
          },
          {
            name: "Discord's Scaling to Millions",
            url: "https://blog.discord.com/how-discord-scaled-elixir-to-5-000-000-concurrent-users-c0e933b76168",
            description: "Discord's approach to scaling real-time communication to millions of users"
          }
        ],
        bestPractices: [
          {
            title: "Connection Distribution",
            description: "Use consistent hashing for optimal connection distribution",
            example: "Hash user IDs to determine server assignment with virtual nodes for better distribution"
          },
          {
            title: "Message Routing",
            description: "Implement efficient message routing between connection servers",
            example: "Use topic-based pub/sub with Redis or Kafka for cross-server message delivery"
          },
          {
            title: "Database Sharding",
            description: "Shard message storage by conversation ID for horizontal scaling",
            example: "Implement a sharded database architecture with conversation ID as the partition key"
          }
        ]
      }
    },
    {
      problem: "As the application scales, users are reporting issues with message ordering and occasional message duplication. Messages sometimes appear out of sequence in conversations, and the same message occasionally appears twice. The product team wants to ensure a consistent messaging experience across all devices, even when users access their accounts from multiple devices simultaneously.",
      requirements: [
        "Implement consistent ordering and deduplication for messages across devices"
      ],
      metaRequirements: [
        "Design a real-time messaging system for 1-on-1 communication",
        "Implement offline message support for reliable delivery during connectivity issues",
        "Scale the messaging system to handle increased user load",
        "Implement consistent ordering and deduplication for messages across devices"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design logical timestamp system for message ordering (vector clocks or Lamport timestamps)",
            "Implement deduplication mechanism based on message identifiers",
            "Create multi-device state synchronization protocol",
            "Design conflict detection and resolution strategy",
            "Implement causality tracking for related messages"
          ],
          nonFunctional: [
            "Minimize overhead of ordering metadata (less than 5% of message size)",
            "Ensure deduplication mechanism has near-zero false negatives",
            "Optimize synchronization protocol for bandwidth efficiency",
            "Ensure conflict resolution adds minimal latency (under 50ms)",
            "Design for eventual consistency with clear visibility of state"
          ]
        },
        systemAPI: [
          "Design message submission API with ordering metadata",
          "Implement message deduplication based on unique identifiers",
          "Create multi-device state synchronization endpoints",
          "Design conflict detection API with appropriate metadata",
          "Implement causality tracking for related message operations"
        ],
        capacityEstimations: {
          traffic: [
            "Estimate percentage of users with multiple active devices (50-70%)",
            "Calculate multi-device synchronization traffic",
            "Model conflict rate during concurrent editing",
            "Estimate deduplication check frequency",
            "Calculate ordering metadata overhead in messages"
          ],
          storage: [
            "Estimate storage for message ordering metadata",
            "Calculate deduplication tracking storage requirements",
            "Model storage needs for conflict resolution data",
            "Estimate multi-device state storage",
            "Calculate causality graph storage requirements"
          ],
          memory: [
            "Calculate memory for active message sequence tracking",
            "Estimate deduplication cache size requirements",
            "Model memory needs for conflict detection",
            "Calculate multi-device state reconciliation memory",
            "Estimate causality tracking memory footprint"
          ],
          bandwidth: [
            "Calculate ordering metadata bandwidth overhead",
            "Estimate multi-device synchronization bandwidth",
            "Model conflict resolution data transfer requirements",
            "Calculate deduplication check bandwidth",
            "Estimate causality tracking bandwidth needs"
          ]
        },
        highLevelDesign: [
          "Design logical timestamping system (vector clocks or Lamport timestamps)",
          "Implement message deduplication service with efficient lookup",
          "Create multi-device synchronization protocol",
          "Design conflict detection and resolution mechanism",
          "Implement causality tracking for related messages"
        ]
      },
      criteria: [
        "Messages appear in correct causal order in all conversations",
        "No message duplication occurs, even during retries and reconnections",
        "Message state remains consistent across all user devices",
        "System correctly handles concurrent message operations",
        "Consistency mechanisms add minimal overhead to message delivery"
      ],
      learningsInMD: `
# Key Learnings

## Distributed Consistency Models
- **Logical Clocks**: Implementing Lamport timestamps and vector clocks for message ordering
- **Causal Consistency**: Preserving cause-effect relationships between messages
- **Eventual Consistency**: Ensuring all replicas eventually converge to the same state
- **Consistency vs. Availability Tradeoffs**: Understanding CAP theorem implications for chat systems

## Message Ordering and Deduplication
- **Sequence Number Generation**: Creating globally unique, monotonically increasing sequence numbers
- **Idempotent Message Processing**: Ensuring operations can be safely repeated without side effects
- **Message Deduplication Techniques**: Implementing efficient duplicate detection with minimal overhead
- **Causality Tracking**: Preserving dependencies between related messages

## Multi-Device Synchronization
- **State Synchronization Protocols**: Efficiently synchronizing message state across devices
- **Conflict Detection**: Identifying and handling concurrent updates to the same conversation
- **Last-Writer-Wins**: Implementing timestamp-based conflict resolution
- **Operational Transforms**: Understanding advanced conflict resolution for concurrent edits

## Advanced Distributed Systems Concepts
- **Consensus Algorithms**: Understanding distributed agreement protocols
- **CRDTs (Conflict-free Replicated Data Types)**: Using specialized data structures for automatic conflict resolution
- **State vs. Operation-Based Replication**: Comparing different approaches to data synchronization
- **Byzantine Fault Tolerance**: Handling malicious or erroneous behavior in distributed systems
      `,
      resources: {
        documentation: [
          {
            title: "Vector Clocks",
            url: "https://en.wikipedia.org/wiki/Vector_clock",
            description: "Understanding vector clocks for distributed event ordering"
          },
          {
            title: "CRDTs for Message Ordering",
            url: "https://martin.kleppmann.com/2020/07/06/crdt-hard-parts-hydra.html",
            description: "Advanced techniques for conflict resolution in distributed systems"
          },
          {
            title: "Idempotency Patterns",
            url: "https://blog.cloudflare.com/idempotent-api-design/",
            description: "Designing idempotent operations for reliable systems"
          },
          {
            title: "Jepsen: Redis Consistency Analysis",
            url: "https://jepsen.io/analyses/redis-6.2.0",
            description: "Understanding consistency challenges in distributed systems"
          }
        ],
        realWorldCases: [
          {
            name: "Facebook Messenger Ordering",
            url: "https://engineering.fb.com/2022/02/07/data-infrastructure/messenger/",
            description: "How Facebook handles message ordering and multi-device consistency"
          },
          {
            name: "Matrix Protocol",
            url: "https://matrix.org/docs/guides/introduction",
            description: "An open protocol for decentralized, consistent real-time communication"
          }
        ],
        bestPractices: [
          {
            title: "Message Ordering",
            description: "Use logical timestamps for causally consistent message ordering",
            example: "Implement vector clocks with (user_id, local_counter) pairs for each message"
          },
          {
            title: "Deduplication",
            description: "Implement efficient message deduplication using unique identifiers",
            example: "Store message IDs in a time-windowed bloom filter followed by exact lookup"
          },
          {
            title: "Conflict Resolution",
            description: "Use last-writer-wins with logical timestamps for simple conflicts",
            example: "For concurrent edits, preserve both versions with timestamp metadata or use CRDTs"
          }
        ]
      }
    },
    {
      problem: "The chat application has become business-critical, and any downtime or data loss directly impacts user trust and revenue. The current system occasionally experiences outages when specific components fail, and recovery requires manual intervention. The company needs a highly available system that can withstand various infrastructure failures without significant service disruption or data loss.",
      requirements: [
        "Design a highly available system with automated recovery"
      ],
      metaRequirements: [
        "Design a real-time messaging system for 1-on-1 communication",
        "Implement offline message support for reliable delivery during connectivity issues",
        "Scale the messaging system to handle increased user load",
        "Implement consistent ordering and deduplication for messages across devices",
        "Design a highly available system with automated recovery"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design multi-region, multi-zone architecture with redundancy",
            "Implement automated failover mechanisms for all critical components", 
            "Create message replication across geographic regions",
            "Design comprehensive health monitoring and alerting system",
            "Implement circuit breakers to prevent cascading failures"
          ],
          nonFunctional: [
            "Achieve recovery time objective (RTO) under 2 minutes for component failures",
            "Maintain recovery point objective (RPO) under 10 seconds for message data",
            "Ensure minimum 99.99% uptime (less than 1 hour downtime per year)",
            "Design for graceful degradation during partial failures",
            "Balance redundancy with operational costs"
          ]
        },
        systemAPI: [
          "Design robust health check endpoints for all services",
          "Create service discovery with automatic failover capabilities",
          "Implement leader election protocol for stateful components",
          "Design dead letter queues for undeliverable messages",
          "Create automatic service restart and recovery APIs"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate redundant capacity requirements (N+2 for critical components)",
            "Estimate traffic distribution across redundant infrastructure",
            "Model failover scenarios and capacity needs during recovery",
            "Calculate cross-region replication traffic",
            "Estimate monitoring data volume"
          ],
          storage: [
            "Calculate storage requirements for redundant message copies",
            "Estimate replication lag impact on storage",
            "Plan backup storage capacity and retention policy",
            "Model disaster recovery storage requirements",
            "Calculate dead letter queue sizing"
          ],
          memory: [
            "Estimate memory for redundant connection handling",
            "Calculate cache warm-up time after failover",
            "Model in-memory state replication requirements",
            "Estimate monitoring and recovery system memory needs",
            "Calculate memory for failover coordination"
          ],
          bandwidth: [
            "Calculate cross-region replication bandwidth requirements",
            "Estimate failover traffic patterns",
            "Model disaster recovery data transfer needs",
            "Calculate monitoring data transfer bandwidth",
            "Estimate leader election protocol bandwidth"
          ]
        },
        highLevelDesign: [
          "Design multi-region, multi-zone architecture with active-active configuration",
          "Implement distributed consensus for leader election and coordination",
          "Create automated failure detection with minimal false positives",
          "Design message replication with appropriate consistency guarantees",
          "Implement comprehensive monitoring and alerting system with proactive detection"
        ]
      },
      criteria: [
        "System continues functioning during single-component failures",
        "Automated recovery completes within 2 minutes without manual intervention",
        "No message loss occurs during infrastructure failures",
        "System can withstand entire region failure with minimal disruption",
        "Comprehensive monitoring provides early warning of potential issues"
      ],
      learningsInMD: `
# Key Learnings

## High Availability Architecture
- **Redundancy Patterns**: Designing N+1 and N+2 redundancy for critical components
- **Failure Domains**: Isolating failures through availability zones and regions
- **Active-Active vs. Active-Passive**: Comparing different high availability architectures
- **Geographic Distribution**: Implementing multi-region redundancy for disaster recovery

## Automated Failure Recovery
- **Health Monitoring**: Designing robust health checks and monitoring systems
- **Failure Detection**: Implementing consensus-based failure detection with minimal false positives
- **Automated Failover**: Creating self-healing systems with automatic component replacement
- **State Recovery**: Efficiently recovering system state after component failures

## Distributed Consensus
- **Leader Election**: Implementing distributed leader election with algorithms like Raft or Paxos
- **Quorum Systems**: Understanding majority-based distributed decision making
- **Split-Brain Prevention**: Avoiding split-brain scenarios in distributed systems
- **Consensus Protocols**: Applying protocols like ZooKeeper or etcd for distributed coordination

## Resilience Engineering
- **Circuit Breakers**: Implementing circuit breakers to prevent cascading failures
- **Bulkheads Pattern**: Isolating system components to contain failures
- **Chaos Engineering**: Testing system resilience through controlled failure injection
- **Graceful Degradation**: Designing systems that maintain core functionality during partial failures
      `,
      resources: {
        documentation: [
          {
            title: "Redis Sentinel",
            url: "https://redis.io/topics/sentinel",
            description: "High availability for Redis with automatic failover"
          },
          {
            title: "Kubernetes StatefulSets",
            url: "https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/",
            description: "Managing stateful applications with automated recovery"
          },
          {
            title: "Distributed Consensus with Raft",
            url: "https://raft.github.io/",
            description: "Understanding the Raft consensus algorithm for leader election"
          },
          {
            title: "Prometheus Monitoring",
            url: "https://prometheus.io/docs/introduction/overview/",
            description: "Implementing comprehensive system monitoring"
          }
        ],
        realWorldCases: [
          {
            name: "Slack's Multi-Region Architecture",
            url: "https://slack.engineering/resiliency-and-disaster-recovery-at-slack/",
            description: "How Slack achieves high availability and disaster recovery"
          },
          {
            name: "LINE Messenger Reliability",
            url: "https://engineering.linecorp.com/en/blog/messaging-reliability",
            description: "LINE's approach to building reliable messaging infrastructure"
          }
        ],
        bestPractices: [
          {
            title: "Failure Detection",
            description: "Implement consensus-based failure detection to minimize false positives",
            example: "Use a quorum of observers (3 or more) before declaring a node as failed"
          },
          {
            title: "Message Durability",
            description: "Replicate messages to multiple regions before confirming delivery",
            example: "Write to primary and at least one secondary region before acknowledging"
          },
          {
            title: "Graceful Degradation",
            description: "Design features to fail independently without affecting core functionality",
            example: "If presence service fails, default all users to 'online' but continue message delivery"
          }
        ]
      }
    }
  ],
  generalLearnings: [
    "Real-time communication protocol design and implementation",
    "Message delivery patterns and reliability guarantees",
    "Offline-first architecture and synchronization protocols",
    "Horizontal scaling techniques for real-time systems",
    "Consistency and ordering in distributed messaging systems",
    "Multi-device state synchronization and conflict resolution",
    "High availability and automated recovery for critical services",
    "Distributed systems fundamentals through practical applications"
  ]
};

export default chatSystemChallenge;
