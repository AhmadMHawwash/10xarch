/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the toast hook
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock tRPC API with factory function
vi.mock("@/trpc/react", () => ({
  api: {
    playgrounds: {
      getVersionHistory: {
        useQuery: vi.fn(),
      },
      restoreVersion: {
        useMutation: vi.fn(),
      },
    },
    useUtils: () => ({
      playgrounds: {
        getById: {
          invalidate: vi.fn(),
        },
      },
    }),
  },
}));

// Mock date-fns
vi.mock("date-fns", () => ({
  formatDistanceToNow: vi.fn(() => "2 hours ago"),
}));

// Import after mocks
import { VersionHistoryPanel } from "../VersionHistoryPanel";
import { api } from "@/trpc/react";

describe("VersionHistoryPanel", () => {
  const mockVersions = [
    {
      commitSha: "abc123def456",
      message: "Update playground: Test System Design",
      author: "John Doe",
      date: "2024-01-15T10:30:00Z",
      url: "https://github.com/test/repo/commit/abc123def456",
    },
    {
      commitSha: "def456ghi789",
      message: "Add load balancer component",
      author: "Jane Smith",
      date: "2024-01-14T15:45:00Z",
      url: "https://github.com/test/repo/commit/def456ghi789",
    },
  ];

  const defaultProps = {
    playgroundId: "test-playground-id",
    onRestore: vi.fn(),
    lastBackupCommitSha: "abc123def456",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    vi.mocked(api.playgrounds.getVersionHistory.useQuery).mockReturnValue({
      data: { versions: mockVersions },
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(api.playgrounds.restoreVersion.useMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);
  });

  describe("Loading State", () => {
    it("should display loading spinner when fetching version history", () => {
      vi.mocked(api.playgrounds.getVersionHistory.useQuery).mockReturnValue({
        data: undefined,
        isLoading: true,
        refetch: vi.fn(),
      } as any);

      render(<VersionHistoryPanel {...defaultProps} />);

      expect(screen.getByText("Loading version history...")).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should display empty state when no versions exist", () => {
      vi.mocked(api.playgrounds.getVersionHistory.useQuery).mockReturnValue({
        data: { versions: [] },
        isLoading: false,
        refetch: vi.fn(),
      } as any);

      render(<VersionHistoryPanel {...defaultProps} />);

      expect(screen.getByText("No Version History")).toBeInTheDocument();
      expect(screen.getByText("Version history will appear here after your first backup.")).toBeInTheDocument();
    });
  });

  describe("Version List", () => {
    it("should render version history list correctly", () => {
      render(<VersionHistoryPanel {...defaultProps} />);

      // Check that versions are displayed
      expect(screen.getByText("Update playground: Test System Design")).toBeInTheDocument();
      expect(screen.getByText("Add load balancer component")).toBeInTheDocument();

      // Check commit SHAs (shortened)
      expect(screen.getByText("abc123d")).toBeInTheDocument();
      expect(screen.getByText("def456g")).toBeInTheDocument();

      // Check authors
      expect(screen.getByText("by John Doe")).toBeInTheDocument();
      expect(screen.getByText("by Jane Smith")).toBeInTheDocument();
    });

    it("should mark current version with badge", () => {
      render(<VersionHistoryPanel {...defaultProps} />);

      // The first version should be marked as current
      const currentBadge = screen.getByText("Current");
      expect(currentBadge).toBeInTheDocument();
    });

    it("should not show restore button for current version", () => {
      render(<VersionHistoryPanel {...defaultProps} />);

      const restoreButtons = screen.getAllByText("Restore");
      // Should have restore buttons for all versions except the current one
      expect(restoreButtons).toHaveLength(1);
    });
  });

  describe("Props Handling", () => {
    it("should handle null lastBackupCommitSha", () => {
      render(<VersionHistoryPanel {...defaultProps} lastBackupCommitSha={null} />);

      // No version should be marked as current
      expect(screen.queryByText("Current")).not.toBeInTheDocument();
      
      // All versions should have restore buttons
      const restoreButtons = screen.getAllByText("Restore");
      expect(restoreButtons).toHaveLength(2);
    });

    it("should pass correct parameters to version history query", () => {
      render(<VersionHistoryPanel {...defaultProps} />);

      expect(api.playgrounds.getVersionHistory.useQuery).toHaveBeenCalledWith({
        playgroundId: "test-playground-id",
        limit: 20,
      });
    });
  });

  describe("Restore Mutation Setup", () => {
    it("should set up restore mutation with proper callbacks", () => {
      render(<VersionHistoryPanel {...defaultProps} />);

      // Verify that the restore mutation was set up
      expect(api.playgrounds.restoreVersion.useMutation).toHaveBeenCalledWith(
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });

    it("should disable restore button when mutation is pending", () => {
      vi.mocked(api.playgrounds.restoreVersion.useMutation).mockReturnValue({
        mutate: vi.fn(),
        isPending: true,
      } as any);

      render(<VersionHistoryPanel {...defaultProps} />);

      const restoreButtons = screen.getAllByText("Restore");
      expect(restoreButtons[0]).toBeDisabled();
    });
  });
}); 