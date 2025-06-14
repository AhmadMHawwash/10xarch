import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PlaygroundSharingPanel } from '../PlaygroundSharingPanel';
import type { Playground } from '@/server/db/schema';

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
  };

  const mockEmptyPlayground: Playground = {
    ...mockPlayground,
    editorIds: [],
    viewerIds: [],
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

  test('shows shared users count', () => {
    render(
      <TestWrapper>
        <PlaygroundSharingPanel playground={mockPlayground} onUpdate={mockOnUpdate} />
      </TestWrapper>
    );

    expect(screen.getByText('Shared with (2)')).toBeInTheDocument();
  });

  test('shows placeholder users for existing shared IDs', () => {
    render(
      <TestWrapper>
        <PlaygroundSharingPanel playground={mockPlayground} onUpdate={mockOnUpdate} />
      </TestWrapper>
    );

    // Should show simplified user representations
    expect(screen.getByText('user-editor-1@example.com')).toBeInTheDocument();
    expect(screen.getByText('user-viewer-1@example.com')).toBeInTheDocument();
  });

  test('renders search button', () => {
    render(
      <TestWrapper>
        <PlaygroundSharingPanel playground={mockPlayground} onUpdate={mockOnUpdate} />
      </TestWrapper>
    );

    // Search button exists but may not have accessible name
    const buttons = screen.getAllByRole('button');
    const searchButton = buttons.find(button => button.querySelector('.lucide-search'));
    expect(searchButton).toBeDefined();
  });

  test('shows empty state when no users shared', () => {
    render(
      <TestWrapper>
        <PlaygroundSharingPanel playground={mockEmptyPlayground} onUpdate={mockOnUpdate} />
      </TestWrapper>
    );

    expect(screen.getByText('Shared with (0)')).toBeInTheDocument();
    expect(screen.getByText('This playground is not shared with anyone yet.')).toBeInTheDocument();
  });

  test('renders permission selects for shared users', () => {
    render(
      <TestWrapper>
        <PlaygroundSharingPanel playground={mockPlayground} onUpdate={mockOnUpdate} />
      </TestWrapper>
    );

    // Should have permission dropdowns for existing users
    const permissionButtons = screen.getAllByRole('combobox');
    expect(permissionButtons).toHaveLength(2); // One for each shared user
  });

  test('renders remove buttons for shared users', () => {
    render(
      <TestWrapper>
        <PlaygroundSharingPanel playground={mockPlayground} onUpdate={mockOnUpdate} />
      </TestWrapper>
    );

    // Should have remove buttons for existing users (look for X icons)
    const buttons = screen.getAllByRole('button');
    const removeButtons = buttons.filter(button => button.querySelector('.lucide-x'));
    expect(removeButtons).toHaveLength(2); // One for each shared user
  });

  test('displays correct permission values', () => {
    render(
      <TestWrapper>
        <PlaygroundSharingPanel playground={mockPlayground} onUpdate={mockOnUpdate} />
      </TestWrapper>
    );

    // Check that we show "Edit" and "View" permissions (not "Can Edit"/"Can View")
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
  });

  test('email input is accessible', () => {
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