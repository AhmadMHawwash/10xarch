import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PlaygroundSharingPanel } from '../PlaygroundSharingPanel';
import type { Playground } from '@/server/db/schema';

// Mock data
const mockUsersData = {
  users: [
    {
      id: 'editor-1',
      email: 'editor@example.com',
      fullName: 'Editor User',
      imageUrl: 'https://example.com/editor.jpg',
    },
    {
      id: 'viewer-1',
      email: 'viewer@example.com',
      fullName: 'Viewer User',
      imageUrl: 'https://example.com/viewer.jpg',
    },
  ],
};

// Mock tRPC completely inside the mock factory
vi.mock('@/trpc/react', () => {
  return {
    api: {
      playgrounds: {
        getUsersByIds: {
          useQuery: vi.fn(() => ({
            data: mockUsersData,
            isLoading: false,
            error: null,
          })),
        },
        searchUsers: {
          useQuery: vi.fn(() => ({
            data: null,
            isLoading: false,
            error: null,
          })),
        },
        updateSharing: {
          useMutation: vi.fn(() => ({
            mutate: vi.fn(),
            isPending: false,
            error: null,
          })),
        },
      },
      useUtils: vi.fn(() => ({
        playgrounds: {
          searchUsers: {
            fetch: vi.fn().mockResolvedValue({ users: [] }),
          },
        },
      })),
    },
  };
});

// Mock the toast hook
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ 
    toast: vi.fn(),
    dismiss: vi.fn(),
    toasts: [],
  }),
}));

// Test wrapper with QueryClient
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { 
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: { 
        retry: false,
      },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('PlaygroundSharingPanel', () => {
  const mockOnUpdate = vi.fn();

  const mockPlayground: Playground = {
    id: 'playground-123',
    title: 'Test Playground',
    jsonBlob: { nodes: [], edges: [] },
    ownerId: 'owner-123',
    ownerType: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'owner-123',
    updatedBy: 'owner-123',
    editorIds: ['editor-1'],
    viewerIds: ['viewer-1'],
    currentVisitorIds: [],
    lastEvaluationAt: null,
    evaluationScore: null,
    evaluationFeedback: null,
    isPublic: 0,
    tags: null,
    description: null,
    lastBackupCommitSha: null,
    backupStatus: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders sharing panel with basic structure', () => {
    render(
      <TestWrapper>
        <PlaygroundSharingPanel playground={mockPlayground} onUpdate={mockOnUpdate} />
      </TestWrapper>
    );

    expect(screen.getByText('Sharing')).toBeInTheDocument();
    expect(screen.getByText('Add people')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter email address')).toBeInTheDocument();
  });

  test('shows shared users count', async () => {
    render(
      <TestWrapper>
        <PlaygroundSharingPanel playground={mockPlayground} onUpdate={mockOnUpdate} />
      </TestWrapper>
    );

    // Wait for component to settle
    await waitFor(() => {
      expect(screen.getByText('Shared with (2)')).toBeInTheDocument();
    });
  });

  test('renders email input', () => {
    render(
      <TestWrapper>
        <PlaygroundSharingPanel playground={mockPlayground} onUpdate={mockOnUpdate} />
      </TestWrapper>
    );

    const emailInput = screen.getByPlaceholderText('Enter email address');
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
  });
}); 