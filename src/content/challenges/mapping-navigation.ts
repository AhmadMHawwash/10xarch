import { type Challenge } from "./types";

const mappingNavigationChallenge: Challenge = {
  slug: "mapping-navigation",
  title: "Real-Time Mapping and Navigation System",
  description: "Design a scalable mapping and navigation service that provides accurate directions, handles real-time traffic updates, and supports millions of concurrent users across global regions.",
  difficulty: "Hard",
  isFree: false,
  stages: [
    {
      problem: "A mapping service needs to provide users with accurate location data, detailed maps, and basic routing capabilities to help them navigate from point A to point B.",
      requirements: [
        "Create a core mapping system that provides map data, location search, and basic routing functionality"
      ],
      metaRequirements: [
        "Create a core mapping system that provides map data, location search, and basic routing functionality"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Implement map tile serving for different zoom levels",
            "Provide location search/geocoding functionality",
            "Calculate routes between two points",
            "Support different transportation modes (driving, walking, public transit)"
          ],
          nonFunctional: [
            "Ensure map data freshness and accuracy",
            "Consider map rendering performance on different devices",
            "Think about response time for search and routing queries",
            "Consider storage efficiency for massive geographic data"
          ]
        },
        systemAPI: [
          "Design map tile retrieval API",
          "Consider geocoding and reverse geocoding endpoints",
          "Think about route calculation APIs",
          "Design location search with autocomplete"
        ],
        capacityEstimations: {
          traffic: [
            "Estimate map tile requests per second",
            "Calculate search queries per second",
            "Consider route calculation request rate",
            "Think about daily active users and request patterns"
          ],
          storage: [
            "Calculate storage needed for map data across regions",
            "Estimate size of point of interest database",
            "Consider storage for road network graph",
            "Think about geocoding database storage requirements"
          ],
          memory: [
            "Estimate cache size for popular map tiles",
            "Calculate memory for routing graph algorithms",
            "Consider in-memory geocoding data structures",
            "Think about search index memory requirements"
          ],
          bandwidth: [
            "Calculate bandwidth for serving map tiles",
            "Estimate data transfer for search results",
            "Consider route data response size",
            "Think about map data update propagation"
          ]
        },
        highLevelDesign: [
          "Design map data storage and serving architecture",
          "Consider location search and geocoding services",
          "Think about routing engine architecture",
          "Design caching strategies for map data"
        ]
      },
      criteria: [
        "System serves map tiles at different zoom levels",
        "System provides location search functionality",
        "System calculates efficient routes between locations",
        "System supports different transportation modes"
      ],
      learningsInMD: `
## Key Learnings

### Geospatial Data Management
- **Map Data Storage**: Techniques for efficiently storing and serving massive geographic datasets
- **Quadtree/Geohash Indexing**: Spatial indexing methods for geographic queries
- **Tiled Map Systems**: Breaking maps into tiles for efficient retrieval and caching
- **Vector vs. Raster Maps**: Understanding trade-offs between vector and raster map formats

### Search and Geocoding
- **Geocoding Architecture**: Converting addresses to coordinates and vice versa
- **Location Search Algorithms**: Implementing fast fuzzy search for geographic entities
- **Spatial Indexing**: Optimizing databases for geographical queries
- **Autocomplete Systems**: Building responsive address suggestion systems

### Routing Fundamentals
- **Graph Representations**: Modeling road networks as navigable graphs
- **Shortest Path Algorithms**: Implementing Dijkstra's, A*, and other routing algorithms
- **Multi-Modal Routing**: Supporting different transportation modes in a single system
- **Route Optimization**: Considering distance, time, and other constraints in routing
      `,
      resources: {
        documentation: [
          {
            title: "OpenStreetMap Data Model",
            url: "https://wiki.openstreetmap.org/wiki/Elements",
            description: "Overview of how geographic data is structured in OpenStreetMap"
          },
          {
            title: "Mapbox Vector Tiles",
            url: "https://docs.mapbox.com/data/tilesets/guides/vector-tiles-introduction/",
            description: "Introduction to vector tiles for efficient map serving"
          }
        ],
        realWorldCases: [
          {
            name: "Google Maps Architecture",
            url: "https://cloud.google.com/blog/products/maps-platform/9-things-know-about-googles-maps-data-behind-map",
            description: "Behind the scenes of Google Maps' data processing pipeline"
          },
          {
            name: "Uber's H3 Spatial Index",
            url: "https://eng.uber.com/h3/",
            description: "How Uber uses hexagonal hierarchical spatial index for geospatial analysis"
          }
        ],
        bestPractices: [
          {
            title: "Tile-Based Maps",
            description: "Use a tile-based approach for efficient map serving and caching",
            example: "Break the world map into a hierarchical grid of tiles that can be cached and served independently"
          },
          {
            title: "Graph Optimization",
            description: "Preprocess routing graphs for faster query performance",
            example: "Implement contraction hierarchies or highway node routing to accelerate path finding queries"
          }
        ]
      }
    },
    {
      problem: "As the service gains users, the system needs to provide real-time traffic data and re-routing capabilities to help users avoid congestion and find faster routes during their journeys.",
      requirements: [
        "Implement real-time traffic monitoring and dynamic routing"
      ],
      metaRequirements: [
        "Create a core mapping system that provides map data, location search, and basic routing functionality",
        "Implement real-time traffic monitoring and dynamic routing"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Collect real-time traffic data from user devices",
            "Aggregate and process traffic information",
            "Update routing algorithms with traffic conditions",
            "Implement dynamic re-routing during navigation"
          ],
          nonFunctional: [
            "Ensure traffic data freshness (< 5 minute delay)",
            "Consider traffic data accuracy across different road types",
            "Think about processing latency for route updates",
            "Consider privacy implications of location tracking"
          ]
        },
        systemAPI: [
          "Design traffic data collection endpoints",
          "Consider traffic condition query APIs",
          "Think about real-time route update endpoints",
          "Design traffic incident reporting APIs"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate traffic data points per second from active users",
            "Estimate real-time routing requests during peak hours",
            "Consider traffic update publication rate",
            "Think about incident report processing volume"
          ],
          storage: [
            "Calculate storage for historical traffic patterns",
            "Estimate real-time traffic condition data size",
            "Consider traffic incident database requirements",
            "Think about temporary route data storage"
          ],
          memory: [
            "Estimate memory for real-time traffic graph",
            "Calculate cache requirements for dynamic routing",
            "Consider in-memory processing of traffic updates",
            "Think about pub/sub message queue sizing"
          ],
          bandwidth: [
            "Calculate bandwidth for traffic data collection",
            "Estimate traffic update publication bandwidth",
            "Consider route update notification size",
            "Think about real-time communication overhead"
          ]
        },
        highLevelDesign: [
          "Implement real-time traffic collection and processing pipeline",
          "Design traffic-aware routing engine",
          "Consider publish-subscribe system for route updates",
          "Design real-time notification service for navigation"
        ]
      },
      criteria: [
        "System serves map tiles at different zoom levels",
        "System provides location search functionality",
        "System calculates efficient routes between locations",
        "System supports different transportation modes",
        "System collects and processes real-time traffic data",
        "System updates routes based on current traffic conditions",
        "System notifies users of better routes during navigation"
      ],
      learningsInMD: `
## Key Learnings

### Real-Time Traffic Monitoring
- **Crowd-Sourced Data Collection**: Gathering traffic data from active user devices
- **Traffic Flow Modeling**: Converting sparse data points into comprehensive traffic models
- **Data Fusion Techniques**: Combining multiple data sources for accurate traffic estimation
- **Anomaly Detection**: Identifying traffic incidents from pattern changes

### Stream Processing Architecture
- **Real-Time Data Pipeline**: Building systems for processing continuous location updates
- **Temporal Data Management**: Handling time-series traffic data efficiently
- **Stream Processing Frameworks**: Using technologies like Kafka, Flink, or Spark Streaming
- **Event-Driven Architecture**: Designing responsive systems using event streams

### Dynamic Routing
- **Traffic-Aware Routing**: Incorporating real-time conditions into path finding
- **Predictive Routing**: Using historical and real-time data to predict future conditions
- **Re-Routing Algorithms**: Efficiently calculating alternative routes during navigation
- **ETA Prediction**: Accurately estimating arrival times with varying conditions
      `,
      resources: {
        documentation: [
          {
            title: "Real-Time Traffic Data Processing",
            url: "https://developers.google.com/maps/documentation/roads/traffic",
            description: "Google's approach to processing and displaying traffic data"
          },
          {
            title: "Stream Processing Patterns",
            url: "https://kafka.apache.org/documentation/streams/",
            description: "Kafka Streams documentation for real-time data processing"
          }
        ],
        realWorldCases: [
          {
            name: "Waze Traffic Algorithm",
            url: "https://medium.com/waze/how-waze-determines-the-best-route-for-your-drive-8341a1a130d0",
            description: "How Waze collects and processes traffic data for dynamic routing"
          },
          {
            name: "TomTom's Traffic System",
            url: "https://www.tomtom.com/traffic-solutions/",
            description: "TomTom's approach to real-time traffic information systems"
          }
        ],
        bestPractices: [
          {
            title: "Tiered Data Collection",
            description: "Implement different collection rates based on road importance",
            example: "Collect data more frequently on highways and major roads, less frequently on residential streets"
          },
          {
            title: "Traffic Data Aggregation",
            description: "Aggregate traffic data spatially and temporally to balance accuracy and efficiency",
            example: "Combine speed readings from multiple vehicles on the same road segment within 1-minute windows"
          }
        ]
      }
    },
    {
      problem: "The service needs to efficiently handle millions of users across the globe, with demand spikes during commute hours and major events, while maintaining low latency and high availability.",
      requirements: [
        "Scale the system to support millions of concurrent users globally"
      ],
      metaRequirements: [
        "Create a core mapping system that provides map data, location search, and basic routing functionality",
        "Implement real-time traffic monitoring and dynamic routing",
        "Scale the system to support millions of concurrent users globally"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Support regional map data distribution",
            "Implement global service discovery",
            "Handle location-based load balancing",
            "Consider regionalized traffic processing"
          ],
          nonFunctional: [
            "Ensure low latency (<100ms) for map tile serving",
            "Consider global service availability (99.9%+)",
            "Think about regional data freshness consistency",
            "Consider peak load handling during traffic events"
          ]
        },
        systemAPI: [
          "Design region-aware API endpoints",
          "Consider service discovery APIs",
          "Think about health check and monitoring endpoints",
          "Design load shedding and throttling mechanisms"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate peak concurrent users globally",
            "Estimate regional traffic patterns across time zones",
            "Consider event-based traffic spikes",
            "Think about request distribution across service tiers"
          ],
          storage: [
            "Estimate distributed storage needs across regions",
            "Calculate regional data replication requirements",
            "Consider caching infrastructure sizing",
            "Think about configuration and metadata storage"
          ],
          memory: [
            "Estimate memory requirements across global instances",
            "Calculate regional cache sizes",
            "Consider memory for routing engines per region",
            "Think about service discovery memory needs"
          ],
          bandwidth: [
            "Calculate inter-region data synchronization bandwidth",
            "Estimate CDN bandwidth for map tile distribution",
            "Consider traffic data distribution requirements",
            "Think about monitoring data volume"
          ]
        },
        highLevelDesign: [
          "Design multi-region deployment architecture",
          "Implement global content delivery network",
          "Consider regional routing engines",
          "Design autoscaling and load balancing system"
        ]
      },
      criteria: [
        "System serves map tiles at different zoom levels",
        "System provides location search functionality",
        "System calculates efficient routes between locations",
        "System supports different transportation modes",
        "System collects and processes real-time traffic data",
        "System updates routes based on current traffic conditions",
        "System notifies users of better routes during navigation",
        "System handles millions of concurrent users efficiently",
        "System provides low-latency responses across global regions",
        "System scales automatically to handle demand spikes"
      ],
      learningsInMD: `
## Key Learnings

### Global Scale Architecture
- **Multi-Region Deployment**: Strategies for distributing services globally
- **Edge Computing**: Moving computation closer to users for lower latency
- **Content Delivery Networks**: Efficiently distributing map tiles worldwide
- **Follow-the-Sun Operations**: Managing 24/7 global services

### Performance Optimization
- **Spatial Partitioning**: Dividing geographic data for parallel processing
- **Query Optimization**: Improving response time for geospatial queries
- **Hierarchical Caching**: Implementing multi-level caches for map data
- **Request Distribution**: Balancing load across regional instances

### Scalable System Design
- **Autoscaling Architectures**: Dynamically adjusting resources based on demand
- **Load Shedding**: Gracefully handling traffic spikes beyond capacity
- **Horizontal vs. Vertical Scaling**: Choosing appropriate scaling strategies
- **Service Discovery**: Dynamically locating services in a distributed system
      `,
      resources: {
        documentation: [
          {
            title: "Global Service Architecture",
            url: "https://aws.amazon.com/blogs/architecture/multi-region-fundamentals-building-for-resilience-and-performance/",
            description: "AWS guide on building multi-region services"
          },
          {
            title: "Geospatial Scaling Patterns",
            url: "https://docs.microsoft.com/en-us/azure/architecture/patterns/geode",
            description: "Microsoft's guide to the Geode pattern for geographically distributed data"
          }
        ],
        realWorldCases: [
          {
            name: "Google Maps Serving Architecture",
            url: "https://cloud.google.com/customers/google-maps",
            description: "How Google scales Maps to serve billions of requests globally"
          },
          {
            name: "Cloudflare Map Tile Delivery",
            url: "https://blog.cloudflare.com/accelerating-map-tiles-on-cloudflare/",
            description: "How Cloudflare optimizes map tile delivery at global scale"
          }
        ],
        bestPractices: [
          {
            title: "Geographic Sharding",
            description: "Partition data and services based on geographic regions",
            example: "Maintain separate map data and routing services for each continent, with further subdivision for high-traffic areas"
          },
          {
            title: "Progressive Loading",
            description: "Implement progressive loading of map data based on priority",
            example: "Load main roads and important landmarks first, then fill in details as needed"
          }
        ]
      }
    },
    {
      problem: "Users are experiencing connectivity issues in areas with poor network coverage, and there's a need for offline functionality to ensure navigation continues even when network connection is lost.",
      requirements: [
        "Implement offline capabilities and resilient operation in poor network conditions"
      ],
      metaRequirements: [
        "Create a core mapping system that provides map data, location search, and basic routing functionality",
        "Implement real-time traffic monitoring and dynamic routing",
        "Scale the system to support millions of concurrent users globally",
        "Implement offline capabilities and resilient operation in poor network conditions"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Support offline map data downloading",
            "Implement on-device routing capabilities",
            "Design progressive data sync mechanisms",
            "Consider partial map updates"
          ],
          nonFunctional: [
            "Minimize offline data storage requirements",
            "Consider battery impact of offline operation",
            "Think about data freshness guarantees for offline maps",
            "Consider seamless online/offline transition"
          ]
        },
        systemAPI: [
          "Design offline map package download APIs",
          "Consider delta update endpoints",
          "Think about synchronization status tracking",
          "Design bandwidth-aware downloading"
        ],
        capacityEstimations: {
          traffic: [
            "Estimate offline package download frequency",
            "Calculate incremental update size and frequency",
            "Consider impact of sync requests after reconnection",
            "Think about distribution of offline vs. online users"
          ],
          storage: [
            "Calculate client-side storage requirements for offline maps",
            "Estimate size of offline routing graph data",
            "Consider compression ratios for offline data",
            "Think about versioning overhead for map data"
          ],
          memory: [
            "Estimate memory usage for on-device routing",
            "Calculate memory needs for offline search functionality",
            "Consider caching strategy on mobile devices",
            "Think about memory constraints on low-end devices"
          ],
          bandwidth: [
            "Calculate initial download size for offline regions",
            "Estimate bandwidth for incremental updates",
            "Consider metered connection optimization",
            "Think about priority-based data synchronization"
          ]
        },
        highLevelDesign: [
          "Design offline-capable client architecture",
          "Implement efficient map data packaging",
          "Consider on-device routing engine",
          "Design sync and conflict resolution mechanism"
        ]
      },
      criteria: [
        "System serves map tiles at different zoom levels",
        "System provides location search functionality",
        "System calculates efficient routes between locations",
        "System supports different transportation modes",
        "System collects and processes real-time traffic data",
        "System updates routes based on current traffic conditions",
        "System notifies users of better routes during navigation",
        "System handles millions of concurrent users efficiently",
        "System provides low-latency responses across global regions",
        "System scales automatically to handle demand spikes",
        "System functions without network connectivity",
        "System efficiently synchronizes when connectivity is restored"
      ],
      learningsInMD: `
## Key Learnings

### Offline-First Architecture
- **Offline Data Management**: Strategies for packaging and updating offline map data
- **On-Device Processing**: Implementing routing algorithms on mobile devices
- **Progressive Synchronization**: Efficiently updating local data when connection is available
- **Data Prioritization**: Determining critical vs. non-critical data for offline use

### Mobile Optimization
- **Battery-Efficient Design**: Minimizing power consumption during navigation
- **Storage Efficiency**: Compressing and organizing map data on devices
- **Memory Management**: Working within mobile device constraints
- **Background Processing**: Handling updates and synchronization in the background

### Resilient System Design
- **Graceful Degradation**: Providing core functionality despite limited connectivity
- **Conflict Resolution**: Handling conflicts between offline changes and server state
- **Intelligent Prefetching**: Predicting and downloading potentially needed data
- **Progressive Enhancement**: Adding features based on available connectivity
      `,
      resources: {
        documentation: [
          {
            title: "Offline-First Application Design",
            url: "https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers",
            description: "MDN guide to building offline-capable applications"
          },
          {
            title: "Vector Tile Optimization",
            url: "https://docs.mapbox.com/help/troubleshooting/mobile-offline/",
            description: "Mapbox guide to offline maps implementation"
          }
        ],
        realWorldCases: [
          {
            name: "Google Maps Offline Mode",
            url: "https://support.google.com/maps/answer/6291838",
            description: "How Google implemented offline navigation in Maps"
          },
          {
            name: "HERE WeGo Offline Maps",
            url: "https://medium.com/here-developer-blog/improving-indoor-navigation-with-wi-fi-fingerprinting-8d1b5580f8c4",
            description: "HERE's approach to offline navigation and positioning"
          }
        ],
        bestPractices: [
          {
            title: "Hierarchical Data Packaging",
            description: "Structure offline data in hierarchical packages for flexible downloading",
            example: "Allow downloading high-level road networks first, with optional detailed street-level data"
          },
          {
            title: "Differential Updates",
            description: "Implement efficient differential updates for offline map data",
            example: "Only download changes to map data since the last update rather than complete regions"
          }
        ]
      }
    },
    {
      problem: "The company wants to enhance the mapping service with advanced features like turn-by-turn voice guidance, lane-level navigation, real-time public transit tracking, and indoor mapping, while maintaining system performance.",
      requirements: [
        "Implement advanced navigation features while preserving performance"
      ],
      metaRequirements: [
        "Create a core mapping system that provides map data, location search, and basic routing functionality",
        "Implement real-time traffic monitoring and dynamic routing",
        "Scale the system to support millions of concurrent users globally",
        "Implement offline capabilities and resilient operation in poor network conditions",
        "Implement advanced navigation features while preserving performance"
      ],
      hintsPerArea: {
        requirements: {
          functional: [
            "Implement turn-by-turn voice guidance",
            "Support lane-level navigation for complex intersections",
            "Design real-time public transit tracking",
            "Consider indoor mapping and navigation"
          ],
          nonFunctional: [
            "Maintain low latency during complex navigation",
            "Consider accuracy of lane-level guidance",
            "Think about transit data freshness requirements",
            "Consider indoor positioning accuracy"
          ]
        },
        systemAPI: [
          "Design voice guidance instruction APIs",
          "Consider lane-specific navigation data endpoints",
          "Think about public transit real-time APIs",
          "Design indoor map data retrieval endpoints"
        ],
        capacityEstimations: {
          traffic: [
            "Calculate voice instruction generation load",
            "Estimate lane-level data request volume",
            "Consider public transit update frequency",
            "Think about indoor positioning request rate"
          ],
          storage: [
            "Calculate storage for detailed intersection data",
            "Estimate transit schedule and real-time data size",
            "Consider indoor map data storage requirements",
            "Think about voice instruction template storage"
          ],
          memory: [
            "Estimate memory for advanced routing algorithms",
            "Calculate cache requirements for transit data",
            "Consider indoor positioning algorithm memory needs",
            "Think about voice processing memory requirements"
          ],
          bandwidth: [
            "Calculate bandwidth for detailed navigation instructions",
            "Estimate transit real-time update bandwidth",
            "Consider indoor map data transfer size",
            "Think about voice data streaming requirements"
          ]
        },
        highLevelDesign: [
          "Design advanced navigation instruction system",
          "Implement public transit integration architecture",
          "Consider indoor positioning technology integration",
          "Design voice guidance generation service"
        ]
      },
      criteria: [
        "System serves map tiles at different zoom levels",
        "System provides location search functionality",
        "System calculates efficient routes between locations",
        "System supports different transportation modes",
        "System collects and processes real-time traffic data",
        "System updates routes based on current traffic conditions",
        "System notifies users of better routes during navigation",
        "System handles millions of concurrent users efficiently",
        "System provides low-latency responses across global regions",
        "System scales automatically to handle demand spikes",
        "System functions without network connectivity",
        "System efficiently synchronizes when connectivity is restored",
        "System provides turn-by-turn voice guidance",
        "System supports lane-level navigation at complex intersections",
        "System displays real-time public transit information",
        "System supports indoor mapping and navigation"
      ],
      learningsInMD: `
## Key Learnings

### Advanced Navigation Features
- **Turn-by-Turn Guidance**: Generating clear, timely navigation instructions
- **Lane-Level Navigation**: Using detailed road data for precise guidance
- **Natural Language Processing**: Creating human-like voice instructions
- **Transit Integration**: Combining multiple transportation modes seamlessly

### Complex Geospatial Data
- **High-Definition Mapping**: Working with extremely detailed road network data
- **Indoor Mapping**: Representing multi-level indoor spaces effectively
- **Real-Time Transit Data**: Processing and integrating transit agency feeds
- **Point Cloud Processing**: Using LiDAR and other sources for detailed mapping

### Location Technology Integration
- **Multi-Source Positioning**: Combining GPS, cell towers, WiFi, and other signals
- **Sensor Fusion**: Integrating device sensors for improved positioning
- **Bluetooth Beacons**: Using beacons for indoor positioning
- **Dead Reckoning**: Maintaining position estimates without GPS signals
      `,
      resources: {
        documentation: [
          {
            title: "GTFS Real-Time Transit Data",
            url: "https://developers.google.com/transit/gtfs-realtime",
            description: "Standard for real-time public transportation data"
          },
          {
            title: "Indoor Positioning Technologies",
            url: "https://developers.google.com/maps/documentation/javascript/examples/map-indoor",
            description: "Google's approach to implementing indoor mapping"
          }
        ],
        realWorldCases: [
          {
            name: "TomTom Lane Guidance",
            url: "https://www.tomtom.com/products/real-time-lane-data/",
            description: "How TomTom implements lane-level navigation guidance"
          },
          {
            name: "CityMapper Transit Integration",
            url: "https://citymapper.com/news/2186/under-the-hood",
            description: "CityMapper's approach to integrating multiple transit options"
          }
        ],
        bestPractices: [
          {
            title: "Contextual Instructions",
            description: "Generate navigation instructions based on environmental context",
            example: "Use landmarks and traffic signals in instructions: 'Turn right at the red building' instead of just 'Turn right in 200 meters'"
          },
          {
            title: "Progressive Detail Loading",
            description: "Load detailed navigation data progressively based on route progress",
            example: "Load detailed lane guidance data only when approaching complex intersections, not for the entire route"
          }
        ]
      }
    }
  ],
  generalLearnings: [
    "Geospatial data management and storage techniques",
    "Graph-based routing algorithms and optimizations",
    "Real-time traffic data collection and processing",
    "Scalable architecture for global mapping services",
    "Location search and geocoding systems",
    "Offline mapping and progressive synchronization",
    "Multi-modal navigation across different transportation types",
    "Global content delivery for low-latency map serving",
    "Indoor navigation and positioning technologies",
    "Mobile optimization for battery and data efficiency"
  ]
};

export default mappingNavigationChallenge; 