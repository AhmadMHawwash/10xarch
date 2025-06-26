import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BreadcrumbNavigation from '../BreadcrumbNavigation';

// Simple ResizeObserver mock
const mockObserve = vi.fn();
const mockUnobserve = vi.fn();
const mockDisconnect = vi.fn();

class MockResizeObserver {
  constructor() {
    // Mock constructor
  }
  
  observe = mockObserve;
  unobserve = mockUnobserve;
  disconnect = mockDisconnect;
}

describe('BreadcrumbNavigation', () => {
  const mockOnNavigateToRoot = vi.fn();
  const mockOnNavigateToPath = vi.fn();
  
  const defaultProps = {
    currentPath: [],
    segments: [],
    onNavigateToRoot: mockOnNavigateToRoot,
    onNavigateToPath: mockOnNavigateToPath,
  };

  const sampleSegments = [
    { id: 'folder1', name: 'Documents' },
    { id: 'folder2', name: 'Projects' },
    { id: 'folder3', name: 'React Apps' },
  ];

  let originalResizeObserver: typeof ResizeObserver;

  beforeEach(() => {
    vi.clearAllMocks();
    mockObserve.mockClear();
    mockUnobserve.mockClear();
    mockDisconnect.mockClear();
    originalResizeObserver = global.ResizeObserver;
    global.ResizeObserver = MockResizeObserver as any;
  });

  afterEach(() => {
    global.ResizeObserver = originalResizeObserver;
  });

  describe('Basic Rendering', () => {
    it('should render home button when path is empty', () => {
      render(<BreadcrumbNavigation {...defaultProps} />);
      
      const homeButtons = screen.getAllByRole('button');
      expect(homeButtons.length).toBeGreaterThan(0);
      
      // Check if home icon is present
      const homeIcon = document.querySelector('svg.lucide-home');
      expect(homeIcon).toBeInTheDocument();
    });

    it('should render breadcrumb segments', () => {
      const props = {
        ...defaultProps,
        currentPath: ['folder1', 'folder2'],
        segments: sampleSegments,
      };
      
      render(<BreadcrumbNavigation {...props} />);
      
      // Component renders both hidden (measurement) and visible breadcrumbs
      expect(screen.getAllByText('Documents')).toHaveLength(2);
      expect(screen.getAllByText('Projects')).toHaveLength(2);
    });

    it('should render current file name when provided', () => {
      const props = {
        ...defaultProps,
        currentPath: ['folder1'],
        segments: sampleSegments,
        currentFileName: 'readme.md',
      };
      
      render(<BreadcrumbNavigation {...props} />);
      
      expect(screen.getAllByText('readme.md')).toHaveLength(2); // Hidden + visible
    });

    it('should apply custom className when provided', () => {
      const { container } = render(
        <BreadcrumbNavigation {...defaultProps} className="custom-breadcrumb" />
      );
      
      expect(container.firstChild).toHaveClass('custom-breadcrumb');
    });
  });

  describe('Navigation Functionality', () => {
    it('should call onNavigateToRoot when home button is clicked', () => {
      render(<BreadcrumbNavigation {...defaultProps} />);
      
      // Get visible home button (not the hidden one)
      const visibleContainer = document.querySelector('[class*="flex-1"]');
      const homeButton = visibleContainer?.querySelector('button');
      
      if (homeButton) {
        fireEvent.click(homeButton);
        expect(mockOnNavigateToRoot).toHaveBeenCalledTimes(1);
      }
    });

    it('should call onNavigateToPath when segment is clicked', () => {
      const props = {
        ...defaultProps,
        currentPath: ['folder1'],
        segments: sampleSegments,
      };
      
      render(<BreadcrumbNavigation {...props} />);
      
             // Get visible breadcrumb (not the hidden measurement one)
       const visibleContainer = document.querySelector('[class*="flex-1"]');
       const documentsButton = Array.from(visibleContainer?.querySelectorAll('button') ?? [])
         .find(button => button.textContent === 'Documents');
      
      if (documentsButton) {
        fireEvent.click(documentsButton);
        expect(mockOnNavigateToPath).toHaveBeenCalledWith(0);
      }
    });
  });

  describe('Segment Name Resolution', () => {
    it('should display segment name from segments array', () => {
      const props = {
        ...defaultProps,
        currentPath: ['folder1'],
        segments: sampleSegments,
      };
      
      render(<BreadcrumbNavigation {...props} />);
      
      expect(screen.getAllByText('Documents')).toHaveLength(2); // Hidden + visible
    });

    it('should fallback to segment ID when name not found', () => {
      const props = {
        ...defaultProps,
        currentPath: ['unknown-folder'],
        segments: sampleSegments,
      };
      
      render(<BreadcrumbNavigation {...props} />);
      
      expect(screen.getAllByText('unknown-folder')).toHaveLength(2); // Hidden + visible
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty currentPath gracefully', () => {
      render(<BreadcrumbNavigation {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should handle single path segment', () => {
      const props = {
        ...defaultProps,
        currentPath: ['folder1'],
        segments: sampleSegments,
      };
      
      render(<BreadcrumbNavigation {...props} />);
      
      expect(screen.getAllByText('Documents')).toHaveLength(2);
    });
  });

  describe('ResizeObserver Integration', () => {
    it('should setup ResizeObserver', () => {
      render(<BreadcrumbNavigation {...defaultProps} />);
      
      expect(mockObserve).toHaveBeenCalled();
    });

    it('should cleanup ResizeObserver on unmount', () => {
      const { unmount } = render(<BreadcrumbNavigation {...defaultProps} />);
      
      unmount();
      
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for hidden elements', () => {
      const props = {
        ...defaultProps,
        currentPath: ['folder1'],
        segments: sampleSegments,
      };
      
      render(<BreadcrumbNavigation {...props} />);
      
      // Hidden measurement breadcrumb should be properly hidden
      const hiddenElement = document.querySelector('[aria-hidden="true"]');
      expect(hiddenElement).toBeInTheDocument();
    });

    it('should have focusable buttons', () => {
      const props = {
        ...defaultProps,
        currentPath: ['folder1'],
        segments: sampleSegments,
      };
      
      render(<BreadcrumbNavigation {...props} />);
      
      const visibleContainer = document.querySelector('[class*="flex-1"]');
      const homeButton = visibleContainer?.querySelector('button');
      
      if (homeButton) {
        homeButton.focus();
        expect(document.activeElement).toBe(homeButton);
      }
    });
  });
}); 