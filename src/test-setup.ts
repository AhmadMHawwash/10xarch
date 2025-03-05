import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage for all tests
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  length: 0,
  key: vi.fn(),
};

// Mock ResizeObserver which is used by ReactFlow
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// Apply global mocks
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

// Mock DOMRect used by ReactFlow for dimensions
type DOMRectType = {
  fromRect: (rect?: DOMRectInit) => DOMRect;
  new(x?: number, y?: number, width?: number, height?: number): DOMRect;
  prototype: DOMRect;
};

global.DOMRect = {
  fromRect: () => ({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: 100,
    height: 100,
    x: 0,
    y: 0,
    toJSON: vi.fn(),
  }),
} as unknown as DOMRectType;

// Mock Intersection Observer used by ReactFlow
global.IntersectionObserver = class IntersectionObserverMock {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  
  constructor(
    private callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ) {}
  
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn();
} as unknown as typeof IntersectionObserver;

// Type for canvas context mock
type CanvasContextMock = {
  fillRect: ReturnType<typeof vi.fn>;
  clearRect: ReturnType<typeof vi.fn>;
  getImageData: ReturnType<typeof vi.fn>;
  putImageData: ReturnType<typeof vi.fn>;
  createImageData: ReturnType<typeof vi.fn>;
  setTransform: ReturnType<typeof vi.fn>;
  drawImage: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
  fillText: ReturnType<typeof vi.fn>;
  restore: ReturnType<typeof vi.fn>;
  beginPath: ReturnType<typeof vi.fn>;
  moveTo: ReturnType<typeof vi.fn>;
  lineTo: ReturnType<typeof vi.fn>;
  closePath: ReturnType<typeof vi.fn>;
  stroke: ReturnType<typeof vi.fn>;
  translate: ReturnType<typeof vi.fn>;
  scale: ReturnType<typeof vi.fn>;
  rotate: ReturnType<typeof vi.fn>;
  arc: ReturnType<typeof vi.fn>;
  fill: ReturnType<typeof vi.fn>;
  measureText: ReturnType<typeof vi.fn>;
  transform: ReturnType<typeof vi.fn>;
  rect: ReturnType<typeof vi.fn>;
  clip: ReturnType<typeof vi.fn>;
};

// Mock canvas features used by ReactFlow for node rendering
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({
    data: new Array(4),
  })),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
})) as unknown as HTMLCanvasElement['getContext'];

// Suppress React Flow console errors
console.error = vi.fn();
console.warn = vi.fn();

// Type for media query list mock
interface MediaQueryListMock {
  matches: boolean;
  media: string;
  onchange: null;
  addListener: ReturnType<typeof vi.fn>;
  removeListener: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  dispatchEvent: ReturnType<typeof vi.fn>;
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string): MediaQueryListMock => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock DocumentFragment
if (typeof window.DocumentFragment === 'undefined') {
  class MockDocumentFragment {
    appendChild = vi.fn();
    querySelectorAll = vi.fn().mockReturnValue([]);
  }
  // Use type assertion to avoid type error
  global.DocumentFragment = MockDocumentFragment as unknown as typeof DocumentFragment;
}

// Mock getBoundingClientRect
Element.prototype.getBoundingClientRect = vi.fn(() => {
  return {
    width: 120,
    height: 120,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    x: 0,
    y: 0,
    toJSON: () => { /* empty implementation */ },
  };
});

// Mock HTMLElement.prototype.scrollIntoView
HTMLElement.prototype.scrollIntoView = vi.fn();

// Add necessary DOM properties for React Flow
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 100 });
Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 100 }); 