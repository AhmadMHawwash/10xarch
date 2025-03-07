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
        "Design a system that enables users to send and receive text messages in real-time",
        "Implement basic message status tracking (sent, delivered, read)",
        "Provide message history when users open a conversation",
        "Ensure message delivery within 500ms under normal network conditions"
      ],
      metaRequirements: [
        "Implement basic 1-on-1 text messaging functionality"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design message data structure with appropriate metadata (timestamp, sender, recipient, status)",
            "Implement real-time delivery mechanism using WebSockets or similar technology",
            "Create message persistence layer for history and reliability",
            "Implement message status updates (sent → delivered → read)"
          ],
          nonFunctional: [
            "Ensure message delivery latency under 500ms for 99th percentile",
            "Design for 99.9% message delivery success rate",
            "Consider initial system capacity for 10,000 concurrent users",
            "Implement basic security for message transport"
          ]
        },
        systemAPI: [
          "Design RESTful endpoints for message sending, history retrieval, and status updates",
          "Implement WebSocket protocol for real-time message delivery",
          "Create user presence indicators (online, offline, typing)",
          "Design message payload structure with efficient serialization"
        ],
        capacityEstimations: {
          traffic: [
            "Estimate 20 messages per day per active user",
            "Calculate peak message rate (messages per second)",
            "Estimate concurrent connection count (active users * connection ratio)",
            "Plan for 3x traffic growth in 6 months"
          ],
          storage: [
            "Calculate message storage requirements (avg message size * messages per user * user count)",
            "Plan for 90-day message retention policy",
            "Estimate metadata storage overhead",
            "Consider compression strategies for message content"
          ],
          memory: [
            "Calculate memory needs for active connection state",
            "Estimate cache size for active conversations",
            "Plan for user session data caching",
            "Consider memory for message delivery queues"
          ],
          bandwidth: [
            "Calculate average message size including metadata (200-500 bytes)",
            "Estimate WebSocket connection overhead",
            "Calculate bandwidth for peak message throughput",
            "Consider protocol efficiency optimizations"
          ]
        },
        highLevelDesign: [
          "Design connection management service for WebSocket connections",
          "Implement message storage system with appropriate indexing",
          "Create message delivery service with basic retry mechanism",
          "Design user presence tracking system",
          "Implement simple notification service for message delivery"
        ]
      },
      criteria: [
        "Messages are delivered within 500ms under normal conditions",
        "Users can view accurate message history when opening a conversation",
        "Message status updates (sent, delivered, read) work correctly",
        "System handles at least 100 messages per second",
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
        "Implement offline message queueing for message sending during connectivity issues",
        "Design reliable message delivery with client-side persistence",
        "Ensure messages are synced properly when users reconnect",
        "Preserve message order even with delayed delivery"
      ],
      metaRequirements: [
        "Implement basic 1-on-1 text messaging functionality",
        "Implement reliable message delivery with offline support"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design client-side message queue for offline operation",
            "Implement message persistence on both client and server",
            "Create message synchronization protocol for reconnection",
            "Design sequence number system for message ordering"
          ],
          nonFunctional: [
            "Ensure system can handle message delivery delays up to 24 hours",
            "Optimize reconnection data transfer for bandwidth efficiency",
            "Limit client-side storage based on device constraints",
            "Maintain causality of messages despite delays"
          ]
        },
        systemAPI: [
          "Design batch message sending API for reconnection scenarios",
          "Create sync protocol to determine which messages need to be sent/received",
          "Implement idempotent message submission to prevent duplicates",
          "Design message status acknowledgment system"
        ],
        capacityEstimations: {
          traffic: [
            "Estimate percentage of users with occasional offline usage (20-30%)",
            "Calculate average offline queue size (messages per offline period)",
            "Model retry patterns and backoff strategies",
            "Estimate reconnection load (batch size * reconnection frequency)"
          ],
          storage: [
            "Calculate client-side storage requirements for offline messages",
            "Estimate server-side queue size for offline recipients",
            "Consider retention policy for undelivered messages",
            "Plan for message state persistence"
          ],
          memory: [
            "Estimate memory needed for tracking offline user message queues",
            "Calculate caching requirements for pending deliveries",
            "Consider buffer size for batched operations",
            "Plan for message deduplication data structures"
          ],
          bandwidth: [
            "Calculate batch sync payload sizes for various offline durations",
            "Estimate bandwidth savings from incremental sync",
            "Consider compression options for reconnection data",
            "Model bandwidth usage during peak reconnection times"
          ]
        },
        highLevelDesign: [
          "Design client-side persistence layer with appropriate storage selection",
          "Create server-side queue management system for offline recipients",
          "Implement reconnection protocol with efficient state synchronization",
          "Design message delivery tracking system with acknowledgments",
          "Create conflict resolution mechanism for concurrent edits"
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
        "Scale the system to handle 500,000+ daily active users",
        "Optimize infrastructure for 5,000+ messages per second at peak",
        "Ensure message delivery latency remains under 500ms at scale",
        "Implement efficient resource utilization across infrastructure"
      ],
      metaRequirements: [
        "Implement basic 1-on-1 text messaging functionality",
        "Implement reliable message delivery with offline support",
        "Optimize system to handle increasing user load"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design connection distribution across multiple servers",
            "Implement horizontal scaling for all system components",
            "Create efficient message routing between servers",
            "Design load-aware resource allocation"
          ],
          nonFunctional: [
            "Maintain 99.9% service availability during scaling events",
            "Keep message delivery latency under 500ms for 99th percentile",
            "Optimize for cost-efficient resource utilization",
            "Design for dynamic capacity adjustment"
          ]
        },
        systemAPI: [
          "Design service discovery mechanism for distributed components",
          "Implement efficient connection pooling and management",
          "Create load balancing strategy for WebSocket connections",
          "Design distributed rate limiting to prevent abuse"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate messages per second at peak (5,000+)",
            "Estimate WebSocket connection count (concurrent users * connection factor)",
            "Model traffic patterns throughout the day for capacity planning",
            "Calculate peak-to-average ratio for resource allocation"
          ],
          storage: [
            "Estimate database IOPS required for message throughput",
            "Plan storage sharding strategy based on user or conversation IDs",
            "Calculate storage growth rate and capacity planning",
            "Consider read vs. write optimization based on access patterns"
          ],
          memory: [
            "Calculate memory requirements across distributed cache system",
            "Estimate connection state memory per server",
            "Plan cache distribution and replication strategy",
            "Consider hot vs. cold data for tiered caching"
          ],
          bandwidth: [
            "Estimate internal network traffic between components",
            "Calculate external bandwidth for client connections",
            "Plan for regional distribution of traffic",
            "Consider bandwidth optimization techniques"
          ]
        },
        highLevelDesign: [
          "Design horizontally scalable WebSocket server cluster",
          "Implement message broker for cross-server communication",
          "Create distributed caching layer for active conversations",
          "Design database sharding strategy for messages",
          "Implement autoscaling infrastructure based on load metrics"
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
        "Ensure correct message ordering in all conversations",
        "Eliminate message duplication across the system",
        "Support consistent message state across multiple user devices",
        "Implement efficient conflict resolution for concurrent operations"
      ],
      metaRequirements: [
        "Implement basic 1-on-1 text messaging functionality",
        "Implement reliable message delivery with offline support",
        "Optimize system to handle increasing user load",
        "Ensure consistent message ordering and delivery"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design message sequencing mechanism with logical timestamps",
            "Implement idempotent message processing for deduplication",
            "Create multi-device synchronization protocol",
            "Design conflict resolution strategy for concurrent edits"
          ],
          nonFunctional: [
            "Optimize storage efficiency for message sequencing metadata",
            "Minimize overhead of deduplication mechanisms",
            "Ensure consistency guarantees don't significantly impact performance",
            "Balance consistency requirements with system complexity"
          ]
        },
        systemAPI: [
          "Design sequence number or timestamp-based message identifiers",
          "Implement message deduplication based on unique identifiers",
          "Create multi-device state synchronization endpoints",
          "Design conflict detection and resolution mechanisms"
        ],
        capacityEstimations: {
          traffic: [
            "Estimate ratio of users with multiple active devices (50-70%)",
            "Calculate sync traffic between multiple devices",
            "Model consistency protocol overhead",
            "Estimate conflict rate in concurrent editing scenarios"
          ],
          storage: [
            "Calculate storage overhead for sequencing metadata",
            "Estimate space needed for deduplication tracking",
            "Consider storage requirements for conflict resolution",
            "Plan for additional indexing requirements"
          ],
          memory: [
            "Estimate memory needed for tracking message sequences",
            "Calculate deduplication cache size requirements",
            "Consider conflict detection data structures",
            "Plan memory for state reconciliation"
          ],
          bandwidth: [
            "Estimate additional bandwidth for sequence metadata",
            "Calculate overhead of multi-device synchronization",
            "Consider bandwidth for conflict resolution data",
            "Model optimal sync frequency vs. bandwidth usage"
          ]
        },
        highLevelDesign: [
          "Design logical timestamping system (vector clocks or Lamport timestamps)",
          "Implement deduplication service with efficient lookup",
          "Create device synchronization protocol with minimal overhead",
          "Design multi-master replication with conflict detection",
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
            example: "For concurrent edits, preserve both versions with metadata or use CRDTs"
          }
        ]
      }
    },
    {
      problem: "The chat application has become business-critical, and any downtime or data loss directly impacts user trust and revenue. The current system occasionally experiences outages when specific components fail, and recovery requires manual intervention. The company needs a highly available system that can withstand various infrastructure failures without significant service disruption or data loss.",
      requirements: [
        "Design for 99.99% service availability",
        "Implement automated failure detection and recovery",
        "Ensure no message loss during component failures",
        "Enable geographic redundancy for disaster recovery",
        "Implement comprehensive monitoring and alerting"
      ],
      metaRequirements: [
        "Implement basic 1-on-1 text messaging functionality",
        "Implement reliable message delivery with offline support",
        "Optimize system to handle increasing user load",
        "Ensure consistent message ordering and delivery",
        "Implement basic fault tolerance and recovery"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Design automated failover mechanisms for all critical components",
            "Implement multi-region message replication",
            "Create automated recovery procedures for various failure scenarios",
            "Design comprehensive health monitoring system",
            "Implement circuit breakers for dependent services"
          ],
          nonFunctional: [
            "Ensure recovery time objective (RTO) under 2 minutes",
            "Maintain recovery point objective (RPO) under 10 seconds",
            "Design for graceful degradation during partial failures",
            "Balance redundancy with operational costs"
          ]
        },
        systemAPI: [
          "Design service health check endpoints",
          "Implement service discovery with automatic failover",
          "Create leader election protocol for stateful components",
          "Design dead letter queues for undeliverable messages"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate traffic distribution across redundant components",
            "Estimate failover capacity requirements (N+1 or N+2)",
            "Model recovery load patterns after failure events",
            "Plan for regional traffic shifting"
          ],
          storage: [
            "Calculate storage requirements for redundant message copies",
            "Estimate replication lag and its impact",
            "Plan backup storage capacity and retention",
            "Consider storage requirements for disaster recovery"
          ],
          memory: [
            "Estimate memory needed for redundant connection handling",
            "Calculate cache warm-up time after failover",
            "Plan memory requirements for monitoring and recovery systems",
            "Consider state replication overhead"
          ],
          bandwidth: [
            "Calculate cross-region replication bandwidth",
            "Estimate failover traffic patterns",
            "Plan for monitoring data transfer",
            "Consider backup and restore bandwidth needs"
          ]
        },
        highLevelDesign: [
          "Design multi-region, multi-zone architecture",
          "Implement distributed consensus for leader election",
          "Create automated failure detection with minimal false positives",
          "Design message replication with appropriate consistency guarantees",
          "Implement comprehensive monitoring and alerting system"
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
