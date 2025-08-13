import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Stub OpenAI env before importing service (service imports openai on module load)
vi.stubEnv('OPENAI_API_KEY', 'test-key');
// Mock openai client to avoid network
vi.mock('@/lib/openai', () => ({
  openai: {
    chat: { completions: { create: vi.fn(async () => ({ choices: [{ message: { content: '{"order":[]}' } }] })) } },
  },
}));

import { GitHubService } from '@/lib/github/github-service';

describe('GitHubService helpers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('parseGitHubUrl parses https and ssh formats', () => {
    expect(GitHubService.parseGitHubUrl('https://github.com/org/repo')).toEqual({ owner: 'org', repo: 'repo' });
    expect(GitHubService.parseGitHubUrl('git@github.com:org/repo.git')).toEqual({ owner: 'org', repo: 'repo' });
    expect(GitHubService.parseGitHubUrl('invalid')).toBeNull();
  });

  it('isAnalysisFresh uses threshold', () => {
    const svc = new GitHubService();
    expect(svc.isAnalysisFresh(3, 5)).toBe(true);
    expect(svc.isAnalysisFresh(6, 5)).toBe(false);
  });
});


