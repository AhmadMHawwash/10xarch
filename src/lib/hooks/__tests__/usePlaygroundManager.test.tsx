import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, type MockedFunction } from 'vitest';
import { usePlaygroundManager } from '../usePlaygroundManager';
import * as trpcReact from '@/trpc/react';
import * as useSystemDesignerModule from '../_useSystemDesigner';
import * as nextNavigation from 'next/navigation';
import { useToast, type toast } from '@/components/ui/use-toast';
import type { ToastProps, ToastActionElement } from "@/components/ui/toast";
import { useLocalStorage as mockUseLocalStorageHook } from 'react-use';
import type { Playground } from '@/server/db/schema';
import type { Node, Edge } from 'reactflow';
import type { PlaygroundResponse } from '@/server/api/routers/checkAnswer';
import { TRPCClientError } from '@trpc/client';
import type { AppRouter } from '@/server/api/root';
import type { inferRouterOutputs, inferRouterInputs } from '@trpc/server';
import type { Dispatch } from 'react';
import type { UseTRPCQueryResult, UseTRPCMutationResult } from '@trpc/react-query/shared';
import type { TRPCClientErrorLike } from '@trpc/client';

type RouterOutput = inferRouterOutputs<AppRouter>;
type RouterInput = inferRouterInputs<AppRouter>;

// Replicated ToasterToast type as it's not exported from use-toast
type ToasterToastInternal = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

// Mock dependencies
vi.mock('@/trpc/react', async () => {
  const actual = await vi.importActual('@/trpc/react');
  return {
    ...actual,
    api: {
      playgrounds: {
        getById: {
          useQuery: vi.fn(),
        },
        update: {
          useMutation: vi.fn(),
        },
      },
      ai: {
        playground: {
          useMutation: vi.fn(),
        },
      },
    },
  };
});

vi.mock('../_useSystemDesigner');
vi.mock('next/navigation');
vi.mock('@/components/ui/use-toast');
vi.mock('react-use', () => ({
  useLocalStorage: vi.fn(),
}));

const mockToastFn: MockedFunction<typeof toast> = vi.fn();

const mockGetLocalStorageValue = vi.fn(() => null);
const mockSetLocalStorage = vi.fn((value: PlaygroundResponse | null) => undefined);
const mockRemoveLocalStorage = vi.fn(() => undefined);

const mockedApi = trpcReact.api;
const mockedUseSystemDesigner = useSystemDesignerModule.useSystemDesigner as MockedFunction<typeof useSystemDesignerModule.useSystemDesigner>;
const mockedUsePathname = nextNavigation.usePathname as MockedFunction<typeof nextNavigation.usePathname>;
const mockedUseParams = nextNavigation.useParams as MockedFunction<typeof nextNavigation.useParams>;
const mockedUseToast = useToast as MockedFunction<typeof useToast>;
const mockedReactUseLocalStorage = mockUseLocalStorageHook as MockedFunction<typeof mockUseLocalStorageHook>;

type MockSystemDesignerState = ReturnType<typeof mockedUseSystemDesigner>;

// Define a more specific type for parsed prompt
interface ParsedPromptSolutionComponent {
  type: string;
  name?: string;
  configs: Record<string, unknown>;
  ['and it targets these nodes']: string[];
}

interface ParsedPromptSolution {
  'Functional requirments': string;
  'Non functional requirments': string;
  'API definitions': Array<{ label: string; apiDefinition: string; requestFlow: string }>;
  components: ParsedPromptSolutionComponent[];
}

interface ParsedPrompt {
  solution: ParsedPromptSolution;
}

// Type for AI Playground Mutation
type AiPlaygroundMutationInput = RouterInput['ai']['playground'];
type AiPlaygroundMutationOutput = RouterOutput['ai']['playground'];

// Helper type for tRPC query result
type PlaygroundQueryResult = UseTRPCQueryResult<{
  playground: Playground;
}, TRPCClientError<AppRouter>>;

// Helper type for tRPC mutation result
type PlaygroundMutationResult<TData = unknown, TVariables = unknown> = UseTRPCMutationResult<
  TData,
  TRPCClientErrorLike<AppRouter>,
  TVariables,
  unknown
>;

describe('usePlaygroundManager', () => {
  const mockPlaygroundId = 'test-playground-id';
  const mockNodes = [{ id: 'node-1', type: 'SystemComponentNode', data: { name: 'Client' }, position: { x:0, y:0} }] as Node[];
  const mockEdges = [{ id: 'edge-1', source: 'node-1', target: 'node-2' }] as Edge[];

  const mockPlaygroundFull: Playground = {
    id: mockPlaygroundId,
    title: 'Test Playground',
    jsonBlob: { nodes: mockNodes, edges: mockEdges },
    ownerType: 'user',
    ownerId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user-123',
    updatedBy: 'user-123',
    editorIds: [],
    viewerIds: [],
    currentVisitorIds: [],
    isPublic: 0,
    description: null,
    tags: null,
    lastEvaluationAt: null,
    evaluationScore: null,
    evaluationFeedback: null,
  };

  const mockGetByIdDataReturnValue = {
    playground: mockPlaygroundFull,
  };

  const mockAiPlaygroundMutate = vi.fn((input: AiPlaygroundMutationInput) => undefined);
  const mockPlaygroundsUpdateMutateAsync = vi.fn().mockResolvedValue({});

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetLocalStorageValue.mockReturnValue(null); 

    (mockedApi.playgrounds.getById.useQuery as MockedFunction<typeof mockedApi.playgrounds.getById.useQuery>).mockReturnValue({
      data: mockGetByIdDataReturnValue,
      refetch: vi.fn(),
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
      isFetching: false,
      status: 'success',
      trpc: { path: 'playgrounds.getById' },
    } as unknown as PlaygroundQueryResult); 
    
    (mockedApi.ai.playground.useMutation as MockedFunction<typeof mockedApi.ai.playground.useMutation>).mockReturnValue({
      mutate: mockAiPlaygroundMutate,
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
      data: undefined,
      variables: undefined,
      status: 'idle',
      failureCount: 0,
      failureReason: null,
      reset: vi.fn(),
      context: undefined,
      trpc: { path: 'ai.playground' },
    } as unknown as PlaygroundMutationResult<PlaygroundResponse, AiPlaygroundMutationInput>);
    
    (mockedApi.playgrounds.update.useMutation as MockedFunction<typeof mockedApi.playgrounds.update.useMutation>).mockReturnValue({
      mutateAsync: mockPlaygroundsUpdateMutateAsync,
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
      data: undefined,
      variables: undefined,
      status: 'idle',
      failureCount: 0,
      failureReason: null,
      reset: vi.fn(),
      context: undefined,
      trpc: { path: 'playgrounds.update' },
    } as unknown as PlaygroundMutationResult<{playground: Playground}, RouterInput['playgrounds']['update']>);
    
    mockedUseSystemDesigner.mockReturnValue({
      nodes: mockNodes,
      edges: mockEdges,
    } as MockSystemDesignerState); 
    
    mockedUsePathname.mockReturnValue('/playgrounds/some-path');
    mockedUseParams.mockReturnValue({ id: mockPlaygroundId });
    mockedUseToast.mockReturnValue({ toast: mockToastFn, dismiss: vi.fn(), toasts: [] }); 
    
    // Cast the mock implementation to match the expected type
    mockedReactUseLocalStorage.mockImplementation(() => [
      mockGetLocalStorageValue(),
      mockSetLocalStorage as unknown as Dispatch<unknown>,
      mockRemoveLocalStorage
    ]);
  });

  it('should initialize and return playground data', () => {
    const { result } = renderHook(() => usePlaygroundManager());

    expect(result.current.playgroundId).toBe(mockPlaygroundId);
    expect(result.current.playground?.id).toBe(mockPlaygroundId);
    expect(result.current.playground?.title).toBe('Test Playground');
    expect(result.current.isLoadingPlayground).toBe(false);
    expect(mockedApi.playgrounds.getById.useQuery).toHaveBeenCalledWith(
      mockPlaygroundId,
      { enabled: true }
    );
  });

  it('should call checkSolution and trigger AI mutation with whiteboard context', async () => {
    const whiteboardNode = { id: 'whiteboard-1', type: 'Whiteboard', data: { configs: { context: 'System Context' } }, position: {x:0, y:0} } as Node;
    mockedUseSystemDesigner.mockReturnValue({
      nodes: [...mockNodes, whiteboardNode],
      edges: mockEdges,
    } as MockSystemDesignerState);

    const { result } = renderHook(() => usePlaygroundManager());

    await act(async () => {
      await result.current.checkSolution();
    });

    expect(mockAiPlaygroundMutate).toHaveBeenCalled();
    const mutationArgs = mockAiPlaygroundMutate.mock.calls[0]?.[0];
    if (!mutationArgs) {
      throw new Error('Expected mutation arguments to be defined');
    }
    expect(mutationArgs.systemDesignContext).toBe('System Context');
    expect(mutationArgs.systemDesign).toBeDefined();
  });

  it('should show error toast if whiteboard is missing during checkSolution', async () => {
    mockedUseSystemDesigner.mockReturnValue({
        nodes: mockNodes, 
        edges: mockEdges,
      } as MockSystemDesignerState);

    const { result } = renderHook(() => usePlaygroundManager());

    await act(async () => {
      await result.current.checkSolution();
    });

    expect(mockAiPlaygroundMutate).not.toHaveBeenCalled();
    expect(mockToastFn).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Please create a whiteboard with system context first.',
      variant: 'destructive',
    });
  });

  it('should update feedback in local storage when AI mutation succeeds', () => {
    const mockAiResponse: AiPlaygroundMutationOutput = { 
        strengths: 'Good design', 
        improvementAreas: 'Could be better', 
        recommendations: 'Try harder' 
    };
    (mockedApi.ai.playground.useMutation as MockedFunction<typeof mockedApi.ai.playground.useMutation>).mockReturnValue({
      mutate: mockAiPlaygroundMutate,
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
      data: mockAiResponse,
      variables: undefined,
      status: 'success',
      failureCount: 0,
      failureReason: null,
      reset: vi.fn(),
      context: undefined,
      trpc: { path: 'ai.playground' },
    } as unknown as PlaygroundMutationResult<PlaygroundResponse, AiPlaygroundMutationInput>);

    const { rerender } = renderHook(() => usePlaygroundManager());
    rerender();

    expect(mockSetLocalStorage).toHaveBeenCalledWith(mockAiResponse);
  });

  it('should handle AI mutation error and show toast', () => {
    const errorMessage = "AI error occurred";
    const errorToReturn = new TRPCClientError(errorMessage);
    
    const whiteboardNode = { id: 'whiteboard-test-error', type: 'Whiteboard', data: { configs: { context: 'AI Error Test Context' } }, position: { x: 0, y: 0 } } as Node;
    mockedUseSystemDesigner.mockReturnValueOnce({
      nodes: [...mockNodes, whiteboardNode],
      edges: mockEdges,
    } as MockSystemDesignerState);

    (mockedApi.ai.playground.useMutation as MockedFunction<typeof mockedApi.ai.playground.useMutation>)
      .mockImplementation((options) => {
        const mutate = vi.fn((variables: AiPlaygroundMutationInput) => {
            if (options?.onError) {
                options.onError(errorToReturn, variables, {});
            }
        });
        return {
            mutate,
            mutateAsync: vi.fn(),
            isPending: false,
            isError: true,
            error: errorToReturn,
            data: undefined,
            variables: undefined,
            status: 'error',
            failureCount: 1,
            failureReason: errorToReturn,
            reset: vi.fn(),
            context: undefined,
            trpc: { path: 'ai.playground' },
        } as unknown as PlaygroundMutationResult<PlaygroundResponse, AiPlaygroundMutationInput>;
    });

    const { result } = renderHook(() => usePlaygroundManager());
    
    act(() => {
      void result.current.checkSolution(); 
    });
    
    expect(mockToastFn).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Error',
      description: expect.any(Object) as React.ReactNode,
      variant: 'destructive',
    }));
  });

  it('should handle rate limit error from AI mutation and show specific toast', () => {
    const rateLimitError = new TRPCClientError('Rate limit exceeded') as TRPCClientError<AppRouter> & {
      data?: {
        zodError: null;
        code: 'TOO_MANY_REQUESTS';
        httpStatus: 429;
      };
    };
    rateLimitError.data = {
      zodError: null,
      code: 'TOO_MANY_REQUESTS',
      httpStatus: 429,
    };
    
    const whiteboardNodeRateLimit = { id: 'whiteboard-test-ratelimit', type: 'Whiteboard', data: { configs: { context: 'Rate Limit Test Context' } }, position: { x: 0, y: 0 } } as Node;
    mockedUseSystemDesigner.mockReturnValueOnce({
      nodes: [...mockNodes, whiteboardNodeRateLimit],
      edges: mockEdges,
    } as MockSystemDesignerState);

    (mockedApi.ai.playground.useMutation as MockedFunction<typeof mockedApi.ai.playground.useMutation>)
      .mockImplementation((options) => {
        const mutate = vi.fn((variables: AiPlaygroundMutationInput) => {
            if (options?.onError) {
                options.onError(rateLimitError, variables, {});
            }
        });
        return {
            mutate,
            mutateAsync: vi.fn(),
            isPending: false,
            isError: true,
            error: rateLimitError,
            data: undefined,
            variables: undefined,
            status: 'error',
            failureCount: 1,
            failureReason: rateLimitError,
            reset: vi.fn(),
            context: undefined,
            trpc: { path: 'ai.playground' },
        } as unknown as PlaygroundMutationResult<PlaygroundResponse, AiPlaygroundMutationInput>;
    });

    const { result } = renderHook(() => usePlaygroundManager());

    act(() => {
        void result.current.checkSolution();
    });
    
    expect(mockToastFn).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Rate Limit Reached',
        description: expect.any(Object) as React.ReactNode,
        variant: 'destructive',
    }));
  });

  it('should call updatePlayground mutation', async () => {
    const { result } = renderHook(() => usePlaygroundManager());
    const updateData = { id: mockPlaygroundId, title: 'Updated Title' };

    await act(async () => {
      await result.current.updatePlayground(updateData);
    });

    expect(mockPlaygroundsUpdateMutateAsync).toHaveBeenCalledWith(updateData);
  });

  it('should correctly construct prompt for getSystemDesignPrompt', () => {
    const whiteboardNode = {
      id: 'whiteboard-1',
      type: 'Whiteboard',
      data: {
        configs: {
          context: 'Test System Context',
          displayName: 'Test System',
          'functional requirements': 'Func req 1',
          'non-functional requirements': 'Non-func req 1',
          'Capacity estimations': { Traffic: '1000 RPS', Storage: '1TB' } as Record<string, string>,
        },
      },
      position: {x:0, y:0}
    } as Node;
    const systemNodes = [
      { id: 'client-1', type: 'SystemComponentNode', data: { name: 'Client', configs: { type: 'Web' } }, position: {x:0, y:0} },
      { id: 'server-1', type: 'SystemComponentNode', data: { name: 'Server', configs: { type: 'API' } }, position: {x:0, y:0} },
      { id: 'db-1', type: 'SystemComponentNode', data: { name: 'Database', configs: { 'Database models': [['User', 'id, name']] as [string, string][], 'Database details': 'PostgreSQL' } }, position: {x:0, y:0} },
    ] as Node[];
    const systemEdges = [
      { id: 'e1', source: 'client-1', target: 'server-1', data: { label: 'API1', apiDefinition: 'Def1', requestFlow: 'Flow1' } },
      { id: 'e2', source: 'server-1', target: 'db-1', data: { label: '', apiDefinition: '', requestFlow: '' } },
    ] as Edge[];

    mockedUseSystemDesigner.mockReturnValue({
      nodes: [whiteboardNode, ...systemNodes],
      edges: systemEdges,
    } as MockSystemDesignerState);
    
    const { result } = renderHook(() => usePlaygroundManager());
    
    act(() => {
      void result.current.checkSolution();
    });

    expect(mockAiPlaygroundMutate).toHaveBeenCalled();
    const callArgs = mockAiPlaygroundMutate.mock.calls[0]?.[0];
    if (!callArgs) {
      throw new Error('Expected mutation arguments to be defined');
    }
    const promptString = callArgs.systemDesign;
    const prompt = JSON.parse(promptString) as ParsedPrompt;

    expect(prompt.solution['Functional requirments']).toBe('Func req 1');
    expect(prompt.solution['Non functional requirments']).toBe('Non-func req 1');
    expect(prompt.solution['API definitions']).toEqual([
      { name: 'API1', apiDefinition: 'Def1', requestFlow: 'Flow1', source: 'client-1', target: 'server-1' }
    ]);
    expect(prompt.solution.components).toHaveLength(3);
    
    const clientComponent = prompt.solution.components.find(c => c.type === 'Client');
    expect(clientComponent).toBeDefined();
    if(clientComponent) {
      expect(clientComponent.configs).toEqual({ type: 'Web' });
      expect(clientComponent['and it targets these nodes']).toEqual(['server-1']);
    }
    
    const dbComponent = prompt.solution.components.find((c) => c.type === 'Database');
    expect(dbComponent).toBeDefined();
    if (dbComponent) { 
        const dbModels = dbComponent.configs.schema;
        expect(dbModels).toEqual([{ name: 'User', definition: 'id, name' }]);
    }
  });
}); 