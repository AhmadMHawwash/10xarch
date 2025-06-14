import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComponentSettings } from '../ComponentSettings';
import type { Node } from 'reactflow';
import type { SystemComponentNodeDataProps } from '../../ReactflowCustomNodes/SystemComponentNode';

// Mock all the settings components
vi.mock('../../SystemComponents/Cache', () => ({
  CacheSettings: vi.fn(({ name }) => <div data-testid="cache-settings">Cache Settings for {name}</div>),
}));

vi.mock('../../SystemComponents/CDN', () => ({
  CDNSettings: vi.fn(({ name }) => <div data-testid="cdn-settings">CDN Settings for {name}</div>),
}));

vi.mock('../../SystemComponents/Client', () => ({
  ClientSettings: vi.fn(({ name }) => <div data-testid="client-settings">Client Settings for {name}</div>),
}));

vi.mock('../../SystemComponents/Database', () => ({
  DatabaseSettings: vi.fn(({ name }) => <div data-testid="database-settings">Database Settings for {name}</div>),
}));

vi.mock('../../SystemComponents/LoadBalancer', () => ({
  LoadBalancerSettings: vi.fn(({ name }) => <div data-testid="loadbalancer-settings">Load Balancer Settings for {name}</div>),
}));

vi.mock('../../SystemComponents/MessageQueue', () => ({
  MessageQueueSettings: vi.fn(({ name }) => <div data-testid="messagequeue-settings">Message Queue Settings for {name}</div>),
}));

vi.mock('../../SystemComponents/Server', () => ({
  ServerSettings: vi.fn(({ name }) => <div data-testid="server-settings">Server Settings for {name}</div>),
}));

vi.mock('../../SystemComponents/CustomComponent', () => ({
  CustomComponentSettings: vi.fn(({ name }) => <div data-testid="custom-settings">Custom Component Settings for {name}</div>),
}));

describe('ComponentSettings', () => {
  const createMockNode = (id: string, type = 'SystemComponentNode'): Node<SystemComponentNodeDataProps> => {
    // Extract component name from id for proper type matching
    let componentName = 'Custom Component' as SystemComponentNodeDataProps['name'];
    
    if (id.includes('Client')) componentName = 'Client';
    else if (id.includes('Server')) componentName = 'Server';
    else if (id.includes('Database')) componentName = 'Database';
    else if (id.includes('Cache')) componentName = 'Cache';
    else if (id.includes('CDN')) componentName = 'CDN';
    else if (id.includes('Load Balancer')) componentName = 'Load Balancer';
    else if (id.includes('Message Queue')) componentName = 'Message Queue';
    else if (id.includes('Custom Component')) componentName = 'Custom Component';
    
    return {
      id,
      type,
      position: { x: 0, y: 0 },
      data: {
        id,
        name: componentName,
        configs: {
          title: `${componentName} Title`,
        },
      },
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when node is null', () => {
    it('should return null', () => {
      const { container } = render(<ComponentSettings node={null} />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('when node type is not SystemComponentNode', () => {
    it('should return null', () => {
      const node = createMockNode('test-node', 'CustomNode');
      const { container } = render(<ComponentSettings node={node} />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('when canEdit is true (default)', () => {
    it('should not show read-only message', () => {
      const node = createMockNode('Client-1');
      render(<ComponentSettings node={node} />);
      
      expect(screen.queryByText('Component settings are read-only')).not.toBeInTheDocument();
    });

    it('should render Client settings', () => {
      const node = createMockNode('Client-1');
      render(<ComponentSettings node={node} />);
      
      expect(screen.getByTestId('client-settings')).toBeInTheDocument();
      expect(screen.getByText('Client Settings for Client-1')).toBeInTheDocument();
    });

    it('should render Server settings', () => {
      const node = createMockNode('Server-1');
      render(<ComponentSettings node={node} />);
      
      expect(screen.getByTestId('server-settings')).toBeInTheDocument();
      expect(screen.getByText('Server Settings for Server-1')).toBeInTheDocument();
    });

    it('should render Database settings', () => {
      const node = createMockNode('Database-1');
      render(<ComponentSettings node={node} />);
      
      expect(screen.getByTestId('database-settings')).toBeInTheDocument();
      expect(screen.getByText('Database Settings for Database-1')).toBeInTheDocument();
    });

    it('should render Cache settings', () => {
      const node = createMockNode('Cache-1');
      render(<ComponentSettings node={node} />);
      
      expect(screen.getByTestId('cache-settings')).toBeInTheDocument();
      expect(screen.getByText('Cache Settings for Cache-1')).toBeInTheDocument();
    });

    it('should render CDN settings', () => {
      const node = createMockNode('CDN-1');
      render(<ComponentSettings node={node} />);
      
      expect(screen.getByTestId('cdn-settings')).toBeInTheDocument();
      expect(screen.getByText('CDN Settings for CDN-1')).toBeInTheDocument();
    });

    it('should render Load Balancer settings', () => {
      const node = createMockNode('Load Balancer-1');
      render(<ComponentSettings node={node} />);
      
      expect(screen.getByTestId('loadbalancer-settings')).toBeInTheDocument();
      expect(screen.getByText('Load Balancer Settings for Load Balancer-1')).toBeInTheDocument();
    });

    it('should render Message Queue settings', () => {
      const node = createMockNode('Message Queue-1');
      render(<ComponentSettings node={node} />);
      
      expect(screen.getByTestId('messagequeue-settings')).toBeInTheDocument();
      expect(screen.getByText('Message Queue Settings for Message Queue-1')).toBeInTheDocument();
    });

    it('should render Custom Component settings', () => {
      const node = createMockNode('Custom Component-1');
      render(<ComponentSettings node={node} />);
      
      expect(screen.getByTestId('custom-settings')).toBeInTheDocument();
      expect(screen.getByText('Custom Component Settings for Custom Component-1')).toBeInTheDocument();
    });
  });

  describe('when canEdit is false', () => {
    it('should show read-only message', () => {
      const node = createMockNode('Client-1');
      render(<ComponentSettings node={node} canEdit={false} />);
      
      expect(screen.getByText('Component settings are read-only')).toBeInTheDocument();
    });

    it('should still render the component settings', () => {
      const node = createMockNode('Server-1');
      render(<ComponentSettings node={node} canEdit={false} />);
      
      expect(screen.getByText('Component settings are read-only')).toBeInTheDocument();
      expect(screen.getByTestId('server-settings')).toBeInTheDocument();
      expect(screen.getByText('Server Settings for Server-1')).toBeInTheDocument();
    });
  });

  describe('className prop', () => {
    it('should apply custom className', () => {
      const node = createMockNode('Client-1');
      const { container } = render(<ComponentSettings node={node} className="custom-class" />);
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('component detection', () => {
    it('should handle multiple component types in node id', () => {
      const node = createMockNode('My Custom Component-1');
      render(<ComponentSettings node={node} />);
      
      expect(screen.getByTestId('custom-settings')).toBeInTheDocument();
    });

    it('should handle case where no component type matches', () => {
      const node = createMockNode('UnknownComponent-1');
      const { container } = render(<ComponentSettings node={node} />);
      
      // Should still render the container but no specific settings
      expect(container.querySelector('.component-settings-container')).toBeInTheDocument();
      expect(screen.queryByTestId('client-settings')).not.toBeInTheDocument();
      expect(screen.queryByTestId('server-settings')).not.toBeInTheDocument();
    });
  });
}); 