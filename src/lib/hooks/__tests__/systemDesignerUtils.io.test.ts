import { vi, describe, it, expect, beforeEach } from 'vitest';
import { saveFlow, restoreFlow } from '../systemDesignerUtils';
import { type ReactFlowInstance } from 'reactflow';

// Track if resetCounting was called
const resetCountingMock = vi.fn();

// Mock dependencies
vi.mock('../../levels/utils', () => ({
  componentsNumberingStore: {
    getState: vi.fn(() => ({
      resetCounting: resetCountingMock,
    })),
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('localStorage-related utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe('saveFlow', () => {
    it('should do nothing when reactFlowInstance is null', () => {
      saveFlow(null);
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('should save flow to localStorage', () => {
      const mockFlow = {
        nodes: [{ id: 'node-1' }],
        edges: [{ id: 'edge-1' }],
        viewport: { x: 100, y: 200, zoom: 1.5 },
      };
      
      const mockInstance = {
        toObject: vi.fn(() => mockFlow),
      } as unknown as ReactFlowInstance;
      
      saveFlow(mockInstance);
      
      /* eslint-disable @typescript-eslint/no-unsafe-assignment */
      expect(mockInstance.toObject).toHaveBeenCalled();
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'reactflow',
        JSON.stringify(mockFlow)
      );
      /* eslint-enable @typescript-eslint/no-unsafe-assignment */
    });
  });

  describe('restoreFlow', () => {
    it('should handle empty localStorage', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);
      
      const result = restoreFlow();
      
      expect(result).toEqual({
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
      });
      expect(resetCountingMock).toHaveBeenCalled();
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid-json');
      
      // Use a comment to explain the empty function is intentional
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        /* Intentionally empty to suppress console output during tests */
      });
      
      const result = restoreFlow();
      
      expect(result).toEqual({
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
      });
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle missing viewport', () => {
      const flowData = {
        nodes: [{ id: 'node-1' }],
        edges: [{ id: 'edge-1' }],
        // No viewport
      };
      
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(flowData));
      
      const result = restoreFlow();
      
      expect(result).toEqual({
        nodes: [{ id: 'node-1' }],
        edges: [{ id: 'edge-1' }],
        viewport: { x: 0, y: 0, zoom: 1 },
      });
    });

    it('should restore complete flow data', () => {
      const flowData = {
        nodes: [{ id: 'node-1' }, { id: 'node-2' }],
        edges: [{ id: 'edge-1', source: 'node-1', target: 'node-2' }],
        viewport: { x: 250, y: 500, zoom: 0.8 },
      };
      
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(flowData));
      
      const result = restoreFlow();
      
      expect(result).toEqual(flowData);
    });
  });
}); 