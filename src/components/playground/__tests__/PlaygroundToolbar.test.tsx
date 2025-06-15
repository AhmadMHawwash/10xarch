import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PlaygroundToolbar } from '../PlaygroundToolbar';
import type { Playground } from '@/server/db/schema';

// Mock useRouter from Next.js
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
}));

// Mock tRPC at the module level
vi.mock('@/trpc/react', async () => {
  const actual = await vi.importActual('@/trpc/react');
  return {
    ...actual,
    api: {
      playgrounds: {
        searchUsers: {
          useQuery: vi.fn(() => ({ data: null, isLoading: false })),
        },
        updateSharing: {
          useMutation: vi.fn(() => ({
            mutate: vi.fn(),
            isPending: false,
          })),
        },
        delete: {
          useMutation: vi.fn(() => ({
            mutate: vi.fn(),
            isPending: false,
          })),
        },
        getUsersByIds: {
          useQuery: vi.fn(() => ({ data: { users: [] }, isLoading: false })),
        },
      },
      useUtils: vi.fn(() => ({
        playgrounds: {
          searchUsers: {
            fetch: vi.fn(),
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
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('PlaygroundToolbar', () => {
  const mockOnPlaygroundUpdate = vi.fn();
  
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
    editorIds: ['editor-1', 'editor-2'],
    viewerIds: ['viewer-1'],
    currentVisitorIds: [],
    lastEvaluationAt: null,
    evaluationScore: null,
    evaluationFeedback: null,
    isPublic: 0,
    tags: null,
    description: null,
  };

  const mockEmptyPlayground: Playground = {
    ...mockPlayground,
    editorIds: [],
    viewerIds: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders share button with correct shared count', () => {
    render(
      <TestWrapper>
        <PlaygroundToolbar 
          playground={mockPlayground} 
          onPlaygroundUpdate={mockOnPlaygroundUpdate} 
        />
      </TestWrapper>
    );

    // Find share button by looking for the Share2 icon
    const shareButton = screen.getAllByRole('button')[0]; // First button is share button
    expect(shareButton).toBeInTheDocument();
    
    // Should show count badge for shared users
    expect(screen.getByText('3')).toBeInTheDocument(); // 2 editors + 1 viewer
  });

  test('renders share button without count badge when not shared', () => {
    render(
      <TestWrapper>
        <PlaygroundToolbar 
          playground={mockEmptyPlayground} 
          onPlaygroundUpdate={mockOnPlaygroundUpdate} 
        />
      </TestWrapper>
    );

    const shareButton = screen.getAllByRole('button')[0]; // First button is share button
    expect(shareButton).toBeInTheDocument();
    
    // Should not show count badge when no users are shared
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  test('renders delete button', () => {
    render(
      <TestWrapper>
        <PlaygroundToolbar 
          playground={mockPlayground} 
          onPlaygroundUpdate={mockOnPlaygroundUpdate} 
        />
      </TestWrapper>
    );

    // Should render both share and delete buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    
    // Delete button should be the second button
    const deleteButton = buttons[1];
    expect(deleteButton).toBeInTheDocument();
  });

  test('calculates shared count correctly for mixed permissions', () => {
    const mixedPlayground = {
      ...mockPlayground,
      editorIds: ['user-1', 'user-2', 'user-3'],
      viewerIds: ['user-4', 'user-5'],
    };

    render(
      <TestWrapper>
        <PlaygroundToolbar 
          playground={mixedPlayground} 
          onPlaygroundUpdate={mockOnPlaygroundUpdate} 
        />
      </TestWrapper>
    );

    // Should show total count (3 editors + 2 viewers = 5)
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('handles null or undefined permission arrays', () => {
    const nullPlayground = {
      ...mockPlayground,
      editorIds: null as any,
      viewerIds: undefined as any,
    };

    render(
      <TestWrapper>
        <PlaygroundToolbar 
          playground={nullPlayground} 
          onPlaygroundUpdate={mockOnPlaygroundUpdate} 
        />
      </TestWrapper>
    );

    const shareButton = screen.getAllByRole('button')[0];
    expect(shareButton).toBeInTheDocument();
    
    // Should not show count badge when arrays are null/undefined
    expect(screen.queryByText(/\d+/)).not.toBeInTheDocument();
  });

  test('buttons are accessible', () => {
    render(
      <TestWrapper>
        <PlaygroundToolbar 
          playground={mockPlayground} 
          onPlaygroundUpdate={mockOnPlaygroundUpdate} 
        />
      </TestWrapper>
    );

    const buttons = screen.getAllByRole('button');
    
    // Both buttons should be focusable
    const shareButton = buttons[0];
    const deleteButton = buttons[1];
    
    expect(shareButton).toBeDefined();
    expect(deleteButton).toBeDefined();
    
    shareButton?.focus();
    expect(shareButton).toHaveFocus();
    
    deleteButton?.focus();
    expect(deleteButton).toHaveFocus();
  });

  test('renders with custom className', () => {
    const { container } = render(
      <TestWrapper>
        <PlaygroundToolbar 
          playground={mockPlayground} 
          onPlaygroundUpdate={mockOnPlaygroundUpdate}
          className="custom-toolbar"
        />
      </TestWrapper>
    );

    const toolbar = container.firstChild as HTMLElement;
    expect(toolbar).toHaveClass('custom-toolbar');
  });

  test('toolbar contains share and delete buttons', () => {
    render(
      <TestWrapper>
        <PlaygroundToolbar 
          playground={mockPlayground} 
          onPlaygroundUpdate={mockOnPlaygroundUpdate} 
        />
      </TestWrapper>
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    
    // Should have both share and delete buttons
    expect(buttons[0]).toBeInTheDocument(); // Share button
    expect(buttons[1]).toBeInTheDocument(); // Delete button
  });
}); 