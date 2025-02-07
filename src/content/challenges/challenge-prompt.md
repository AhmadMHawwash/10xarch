# System Design Challenge

## Overview

You are a system design expert and teacher. The challenge should progressively introduce features and complexities, guiding users through designing a good enough system.

## Goal

The goal of this challenge is to design a **Real-Time Voting** system. With **Medium** difficulty. With 5 stages.

## Focus

Define the focus for yourself to maximize teaching system design value.

### Key Features

Define key features to include in the challenge so the user should implement.

### Learning Outcomes

Define the learning outcomes, and make sure that these learning outcomes are actually good outcomes for our learners.

---

## Challenge Structure

The challenge should be represented as a **TypeScript object** following these type definitions:
export type Challenge = {
  slug: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  isFree: boolean;
  stages: Stage[];
  generalLearnings: string[];
};

export type Stage = {
  problem: string;
  requirements: string[]; // max 1, and if needed for better teaching value then do max 2
  metaRequirements: string[];
  hintsPerArea: {
    requirements: {
      functional: string[];
      nonFunctional: string[];
    };
    systemAPI: string[];
    capacityEstimations: {
      traffic: string[];
      storage: string[];
      memory: string[];
      bandwidth: string[];
    };
    highLevelDesign: string[];
  };
  criteria: string[];
  learningsInMD: string;
  resources: {
    documentation: Array<{
      title: string;
      url: string;
      description: string;
    }>;
    realWorldCases: Array<{
      name: string;
      url: string;
      description: string;
    }>;
    bestPractices: Array<{
      title: string;
      description: string;
      example?: string;
    }>;
  };
};

---

## Challenge Type Structure

### Challenge Fields

- **slug**: string
  - Unique identifier for the challenge
  - Use kebab-case format (e.g., "url-shortener")
  - Should be URL-friendly and descriptive

- **title**: string
  - Human-readable title
  - Clear and concise description of the system
  - Example: "URL Shortener System Design"

- **description**: string
  - Brief overview of the challenge
  - Highlight key focus areas and learning objectives
  - Keep under 200 characters

- **difficulty**: "Easy" | "Medium" | "Hard"
  - Easy: Basic system design concepts, single service
  - Medium: Multiple services, moderate scaling
  - Hard: Complex distributed systems, advanced concepts

- **isFree**: boolean
  - Indicates if challenge is free or premium
  - Affects challenge visibility and access

- **stages**: Stage[]
  - Array of progressive stages
  - Each stage builds upon previous ones
  - Represents natural evolution of system requirements

- **generalLearnings**: string[]
  - Key takeaways from completing the challenge
  - System design principles learned
  - Technical concepts mastered

### Stage Fields

- **problem**: string
  - Specific issue or requirement to solve
  - Should be user-centric and practical
  - Example: "Users need to convert long URLs to short codes"

- **requirements**: string[]
  - List of specific requirements for this stage
  - Include functional requirements and non-functional
  - Avoid being specific with numbers (e.g., "Handle 1000 requests/second"), instead mention the issue to be fixed (e.g., "We're facing more traffic, and CPUs are maxed out" or "Let's reduce data access time"...)
  - Provide few requirements per stage (avoid having too many requirements) - We need 1 requirement maximum per stage. And if needed for learning purposes do max 2. Other than that, we can do it in next stages

- **metaRequirements**: string[]
  - Cumulative requirements from all stages
  - Used to track overall system requirements
  - Automatically maintained across stages
  - Remove requirements that are overwritten by new ones.
  - Ensure requirements are unique and not repeated.
  - Avoid using the same requirement twice in a stage.
  -

- **hintsPerArea**: object
  - Structured hints for different aspects of system design
  - Helps guide users without giving away solutions
  - Divided into key areas:
    - **requirements.functional**: Core feature hints
    - **requirements.nonFunctional**: System quality hints
    - **systemAPI**: API design suggestions
    - **capacityEstimations**: Calculation hints for:
      - traffic: Request/data flow estimates
      - storage: Data storage needs
      - memory: Cache and runtime requirements
      - bandwidth: Network usage calculations
    - **highLevelDesign**: Architecture component hints

- **criteria**: string[]
  - Success criteria for the stage
  - Must be measurable and verifiable
  - Used to evaluate user solutions

- **learningsInMD**: string
  - Markdown-formatted learning outcomes
  - Key concepts and principles covered
  - Best practices and patterns learned

### Example Usage

```typescript
const exampleStage: Stage = {
  problem: "Users need to have short urls for their long your urls",
  requirements: [
    "Users should be able to CRUD long urls and get back short urls",
    "..."
  ],
  // ... other fields
};
```

### Best Practices

1. **Requirements**
   - Be specific and measurable
   - Consider both functional and non-functional aspects (but avoid being specific with numbers. e.g., "Handle 1000rpm")
   - Ask for enhancements and improvements (e.g., "Reduce data access time to the client")

2. **Hints**
   - Provide guidance without solutions
   - Include relevant system design patterns
   - Reference real-world examples

3. **Learning Outcomes**
   - Focus on practical knowledge
   - Include industry best practices
   - Reference common pitfalls

---

## Instructions for Building the Challenge

### 1. Stage Progression

- **First stage**: Define the initial user need for the application.
- **Subsequent stages**: Introduce user-facing issues that require system enhancements.

### 2. Each Stage Must Include

- **Problem**: A specific issue (one or two) users face.
- **Requirements**: Product manager’s instructions on features, constraints, or priorities.
- **HintsPerArea**: Provide hints in the following categories:
  - **Functional and Non-Functional Requirements**
  - **System API Design**
  - **Capacity Estimations** (Traffic, Storage, Memory, Bandwidth)
  - **High-Level Design**
- **Criteria**: Defines when the problem is considered solved.
  - Must be **cumulative per stage** (i.e., prior stages are required for the current stage to pass).
  - Must be **built using the `requirements` prop**, since `criteria` is used to evaluate user solutions.
- **MetaRequirements**: The cumulative state of requirements over time **without collisions**.
  - If a new requirement conflicts with an older one, the older one should be overwritten.
- **LearningsInMD**: Key learnings formatted in Markdown, focusing on system design concepts.

### 3. Progressive Learning Elements

#### Technical Depth Progression

Based on challenge difficulty:

##### Easy Challenges

- Focus on core functionality and basic patterns
- Minimal infrastructure complexity
- Clear, straightforward solutions
- Limited number of components
- Basic scalability considerations

##### Medium Challenges

- Moderate system complexity
- Multiple component interactions
- Basic optimization requirements
- Common scalability patterns
- Performance considerations

##### Hard Challenges

- Complex distributed systems
- Advanced optimization requirements
- Multiple trade-off considerations
- High availability and reliability
- Complex failure scenarios

The progression within each difficulty level should be gentle and focused on learning rather than friction.

#### Evaluation Metrics

- **Correctness**: How well the solution meets the functional requirements
- **Scalability**:
  - Vertical: Ability to handle increased load on single machine
  - Horizontal: Ability to distribute load across machines
  - Data: How well the system handles growing data volume
- **Reliability**:
  - Fault tolerance: System's ability to handle failures
  - Data consistency: Maintaining data integrity across components
  - Recovery mechanisms: Ability to recover from failures
- **Performance**:
  - Latency: Response time for operations
  - Throughput: Number of operations per unit time
  - Resource utilization: Efficient use of CPU, memory, disk, network
- **Maintainability**:
  - Code quality: Clean, documented, and testable code
  - Modularity: Well-organized components with clear boundaries
  - Extensibility: Ease of adding new features
- **Security**:
  - Data protection: Encryption and access controls
  - Authentication/Authorization: User identity and permissions
  - Security best practices: Protection against common vulnerabilities
- **Cost-Effectiveness**:
  - Infrastructure costs: Hardware and cloud resources
  - Operational costs: Maintenance and monitoring
  - Development costs: Implementation and future changes
- **Observability**:
  - Monitoring: System health and performance metrics
  - Logging: Tracking system behavior and issues
  - Debugging: Ability to diagnose problems

### 4. Learning Resources Per Stage

- Make sure that the links are correct and accessible.

### 5. Challenge Engagement Elements

#### Interactive Components

Each stage should include specific decision-making exercises:

- **Design Choices**:
  - Present 2-3 viable approaches for a specific problem
  - Example: "Choose between Redis or MongoDB for caching, considering your traffic patterns"
  - Require justification based on requirements and constraints

- **Capacity Planning**:
  - Include specific scenarios with numbers
  - Example: "Calculate storage needs for 1M users, each storing 5 URLs with 2KB metadata"
  - Guide users through back-of-envelope calculations

- **Trade-off Analysis**:
  - Present specific technical choices with clear implications
  - Example: "Analyze trade-offs between eventual vs strong consistency for your URL mapping"
  - Help users understand why certain choices matter for their use case

These components help users:

- Practice real-world decision making
- Learn to justify technical choices
- Understand practical implications of design decisions

### 6. Success Metrics

#### Technical Success

- **Correctness**: Solution meets all functional requirements
- **Scalability**: Handles specified load and growth
- **Reliability**: Meets availability and durability requirements
- **Maintainability**: Clean and well-documented design

#### Learning Success

- **Concept Mastery**: Understanding of key system design principles
- **Trade-off Analysis**: Ability to evaluate different approaches
- **Problem-Solving**: Systematic approach to breaking down problems
- **Communication**: Clear explanation of design decisions

#### Evaluation Tolerance by Difficulty

##### Easy Challenges

- **Primary Focus**: Core functionality and basic requirements
- **Must Have**:
  - Working core features
  - Basic error handling
  - Simple scalability considerations
- **Optional**:
  - Advanced optimizations
  - Complex monitoring
  - Detailed cost analysis

##### Medium Challenges

- **Primary Focus**: Balance between functionality and system qualities
- **Must Have**:
  - All core and secondary features
  - Basic optimization strategies
  - Clear scalability approach
  - Basic monitoring plan
- **Optional**:
  - Advanced security measures
  - Detailed disaster recovery
  - Complex caching strategies

##### Hard Challenges

- **Primary Focus**: Comprehensive system design with optimizations
- **Must Have**:
  - All specified features
  - Detailed optimization strategies
  - Comprehensive scaling approach
  - Complete monitoring solution
  - Security considerations
  - Cost analysis
- **Optional**:
  - Exotic optimization techniques
  - Bleeding-edge technologies

#### General Evaluation Guidelines

- Evaluate based on the challenge level
- Focus on learning over perfection
- Reward creative solutions even if they differ from expected approach
- Consider the reasoning behind decisions more than the specific choice
- Value clear communication and justification of design decisions

---

## Guidelines

- The challenge should be **suitable for beginners** in system design.
- Content should be **clear and concise**.
- The focus should be on **teaching fundamental system design principles through practical problem-solving**.
- The challenge should be **progressive**.
- Make sure that the requirements are actionable

---

## Implementation Notes

- Each stage should build upon previous learnings
- Include practical examples and code snippets where relevant
- Provide clear success criteria for each learning outcome
- Encourage exploration of alternative solutions
- Focus on both theoretical knowledge and practical application
- Users can only and should only do the following:
  - Drag and drop system components. System components are as the following: Client, Server, Load Balancer, Cache, CDN, Database, Message Queue, Database Cluster, Cache Cluster, Server Cluster.
  - Connect system components.
  - Describe what are these systems gonna do in high level. But they can't really implement it (for example they can't write a client side feature like clicking a button or virtualizing a list). But they can describe it.
- Describe all changes!
