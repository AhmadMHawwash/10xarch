# Testing GitHub Integration - Manual Testing Guide

## 🎯 Overview

This guide covers how to manually test the "Build from Repo" GitHub integration feature that was implemented.

## 📋 What We Built

### Core Components
- **GitHub Service** (`src/lib/github/github-service.ts`) - GitHub API integration
- **Analysis Service** (`src/lib/github/analysis-service.ts`) - LLM-based code analysis
- **TRPC Router** (`src/server/api/routers/github.ts`) - API endpoints
- **Database Schema** - Tables for storing analyses and GitHub tokens

### Key Features
- Repository URL parsing and validation
- Smart file selection based on language and patterns
- Cost estimation for LLM analysis
- Multi-expert analysis system (6 specialized experts)
- Component identification and mapping to system architecture
- Support for public and private repositories

## 🧪 Testing Approaches

### 1. Unit Testing (GitHub Service Only)

**✅ WORKING** - Run this to test GitHub API integration:

```bash
npx tsx test-github-service-only.ts
```

**What it tests:**
- URL parsing (various GitHub URL formats)
- Repository information retrieval
- File selection and analysis
- Cost estimation
- Error handling and edge cases

**Expected results:**
- ✅ URL parsing works for all formats
- ✅ Repository info retrieval works
- ✅ File selection works with different analysis depths
- ⚠️ May hit rate limits (403 errors) - this is expected

### 2. Full Integration Testing (with LLM Analysis)

**Requires:** `OPENAI_API_KEY` environment variable

```bash
# Set your OpenAI API key
export OPENAI_API_KEY=your_key_here

# Run full integration test
npx tsx test-github-integration.ts
```

**What it tests:**
- GitHub service + LLM analysis pipeline
- Multi-expert analysis system
- Component identification
- Architecture detection
- Progress tracking

### 3. TRPC API Testing

**Option A: Via Next.js App**

1. Start the development server:
```bash
npm run dev
```

2. Navigate to `/playgrounds/new` and test the GitHub import flow

**Option B: Direct TRPC Testing**

Create a test script to call TRPC endpoints directly:

```typescript
// test-trpc-endpoints.ts
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './src/server/api/root';

const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/api/trpc',
    }),
  ],
});

async function testTRPCEndpoints() {
  try {
    // Test repository validation
    const validation = await trpc.github.validateRepository.query({
      repoUrl: 'https://github.com/expressjs/express'
    });
    console.log('✅ Repository validation:', validation);

    // Test cost estimation
    const estimation = await trpc.github.estimateCost.query({
      repoUrl: 'https://github.com/expressjs/express',
      depth: 'quick'
    });
    console.log('✅ Cost estimation:', estimation);

  } catch (error) {
    console.error('❌ TRPC test failed:', error);
  }
}

testTRPCEndpoints();
```

## 🔑 Environment Setup

### Required Environment Variables

```bash
# Required for LLM analysis
OPENAI_API_KEY=your_openai_key

# Required for database
DATABASE_URL=your_database_url

# Required for authentication
CLERK_SECRET_KEY=your_clerk_secret
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Optional: For higher GitHub API rate limits
GITHUB_BACKUP_TOKEN=your_github_token
```

### Database Setup

Make sure your database is up to date:

```bash
# Generate and run migrations
npx drizzle-kit generate
npx drizzle-kit migrate
```

## 📊 Test Results Analysis

### Successful Test Output

```
🚀 GitHub Service Manual Testing
===================================================

🔗 Testing URL Parsing...
   ✅ https://github.com/owner/repo → owner/repo
   ✅ git@github.com:owner/repo.git → owner/repo
   ❌ invalid-url → INVALID

🔧 Testing GitHub Service...
📋 Testing: Express Framework
   ✅ URL parsing: expressjs/express
   ✅ Repo info: JavaScript | 9MB | Private: false
   📁 Testing quick analysis...
      ✅ 15 files selected (max: 15)
      💰 Cost estimate: $0.0883
      📄 Sample files:
         - package.json (config, 2.6KB, high)
         - index.js (entry, 0.2KB, high)
      🏷️ File types: config(1), entry(1), route(13)
```

### Common Issues and Solutions

**1. Rate Limiting (403 Errors)**
- **Issue:** GitHub API rate limit exceeded
- **Solution:** Use a GitHub token for higher rate limits
- **Expected:** This is normal for unauthenticated requests

**2. Repository Too Large**
- **Issue:** Repository too large (>50MB)
- **Solution:** Expected behavior - validates repository size

**3. OpenAI API Key Missing**
- **Issue:** `Missing OPENAI_API_KEY environment variable`
- **Solution:** Set the environment variable for LLM analysis

**4. File Access Errors**
- **Issue:** Some files return 403 when fetching content
- **Solution:** Expected for some protected files, service continues

## 🎯 Testing Different Repository Types

### Public Repositories (No token needed)

```bash
# Small repositories
https://github.com/chalk/chalk
https://github.com/sindresorhus/got

# Medium repositories  
https://github.com/expressjs/express
https://github.com/microsoft/TypeScript

# Large repositories (should fail size validation)
https://github.com/nodejs/node
https://github.com/facebook/react
```

### Private Repositories (Token required)

Set `GITHUB_BACKUP_TOKEN` in your environment and test with your private repos.

## 🧪 Advanced Testing Scenarios

### 1. Different Programming Languages

Test with repositories in different languages to verify smart file selection:

- **Node.js/JavaScript:** `https://github.com/expressjs/express`
- **Python:** `https://github.com/pallets/flask`
- **React:** `https://github.com/facebook/create-react-app`
- **Vue.js:** `https://github.com/vuejs/vue`

### 2. Different Architecture Patterns

- **Monolith:** Single application repos
- **Microservices:** Repos with multiple services
- **Serverless:** Lambda/function-based repos
- **Full-stack:** Frontend + backend repos

### 3. Analysis Depth Testing

Test all three analysis depths:

```typescript
// Quick (15 files, ~$0.02-0.05)
ANALYSIS_DEPTHS.quick

// Standard (40 files, ~$0.05-0.15)  
ANALYSIS_DEPTHS.standard

// Deep (80 files, ~$0.15-0.50)
ANALYSIS_DEPTHS.deep
```

## 🔍 Debugging Tips

### Enable Verbose Logging

Add console.log statements in:
- `src/lib/github/github-service.ts` - GitHub API calls
- `src/lib/github/analysis-service.ts` - LLM analysis
- `src/server/api/routers/github.ts` - TRPC endpoints

### Check Database Records

```sql
-- Check repository analyses
SELECT * FROM sdp_repository_analyses ORDER BY created_at DESC LIMIT 5;

-- Check GitHub tokens (if using authentication)
SELECT * FROM sdp_user_github_tokens WHERE user_id = 'your_user_id';
```

### Monitor API Costs

Track OpenAI API usage in your OpenAI dashboard to monitor costs during testing.

## ✅ Testing Checklist

- [ ] URL parsing works for all GitHub URL formats
- [ ] Repository validation identifies valid/invalid repos
- [ ] File selection respects analysis depth limits
- [ ] Cost estimation provides accurate estimates
- [ ] Error handling works for edge cases
- [ ] LLM analysis identifies system components
- [ ] Component mapping matches Gallery component types
- [ ] Database integration stores analysis results
- [ ] Authentication works with Clerk
- [ ] TRPC endpoints respond correctly

## 🚀 Next Steps

After manual testing is complete:

1. **Frontend Integration** - Connect the analysis page UI
2. **End-to-End Testing** - Full user workflow testing
3. **Performance Testing** - Test with larger repositories
4. **Error Handling** - Improve error messages and recovery
5. **Rate Limiting** - Implement proper rate limiting

## 📝 Notes

- The test scripts will clean up after themselves
- GitHub API has rate limits - use tokens for extensive testing
- OpenAI API charges apply for LLM analysis
- Some 403 errors are expected and handled gracefully 