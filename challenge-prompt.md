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

---

## Guidelines
- The challenge should be **suitable for beginners** in system design.
- Content should be **clear and concise**.
- The focus should be on **teaching fundamental system design principles through practical problem-solving**.
- The challenge should be **progressive**.
- If you specify the number of users, then mention it in the requirements and meta requirements.