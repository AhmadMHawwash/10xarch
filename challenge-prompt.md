# System Design Challenge: Simple Chat Application

## Overview
You are a system design expert and your goal is to design a **URL Shortener (Easy)**. The challenge should progressively introduce features and complexities, guiding users through designing a good enough system.

## Focus: Hashing, Redirection, Caching

### Key Features:

- Short code generation
- High-volume redirects
- Custom alias support

### Learning Outcomes:

- Hash collision resolution
- HTTP 301 vs 302 tradeoffs
- Cache-aside pattern


---

## Challenge Structure

The challenge should be represented as a **TypeScript object** following these type definitions:

type Challenge = {  
  isFree: boolean;
  slug: string;  
  title: string;  
  description: string;  
  difficulty: "Easy" | "Medium" | "Hard";  
  stages: Stage[];  
  generalLearnings: string[];  
};  

type Stage = {  
  problem: string;  
  requirements: string[];  
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
    documentation: string[];    // Official docs and references
    realWorldCases: string[];  // Similar real-world implementations
    bestPractices: string[];   // Industry standards and patterns
  };
  commonPitfalls: string[];    // Common mistakes to avoid
  systemTradeoffs: {           // Key decisions and their implications
    option: string;
    pros: string[];
    cons: string[];
  }[];
};  

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
- **Scalability**: How the system handles increased load
- **Reliability**: System's ability to handle failures
- **Cost-Effectiveness**: Efficient use of resources

### 4. Learning Resources Per Stage

### 5. Challenge Engagement Elements

#### Interactive Components
- **Decision Points**: Key architectural decisions with justification
- **Performance Analysis**: Calculate and compare different approaches
- **Cost Analysis**: Estimate infrastructure costs for different solutions

#### Real-World Context
- **Industry Examples**: Reference similar systems in production
- **Scale Considerations**: Real traffic patterns and growth scenarios
- **Cost Implications**: Budget constraints and optimization opportunities

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

---

## Guidelines
- The challenge should be **suitable for beginners** in system design.
- Content should be **clear and concise**.
- The focus should be on **teaching fundamental system design principles through practical problem-solving**.
- The challenge should be **progressive**.
- If you specify the number of users, then mention it in the requirements and meta requirements.

---

## Implementation Notes
- Each stage should build upon previous learnings
- Include practical examples and code snippets where relevant
- Provide clear success criteria for each learning outcome
- Encourage exploration of alternative solutions
- Focus on both theoretical knowledge and practical application