import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LinkedElementsPanel } from '../components/LinkedElementsPanel';

describe('LinkedElementsPanel', () => {
  const mockProps = {
    linkedElements: [
      { id: 'node1', type: 'node' as const, name: 'Database' },
      { id: 'edge1', type: 'edge' as const, name: 'Connection' }
    ],
    sectionId: 'section1',
    fileId: 'file1',
    canEdit: true,
    hideAllLinkedElements: false,
    linkingTextAreaId: null,
    onSelectLinkedElements: vi.fn(),
  };

  it('should render linked elements', () => {
    render(<LinkedElementsPanel {...mockProps} />);
    
    expect(screen.getByText('Linked Elements')).toBeInTheDocument();
    expect(screen.getByText(/Database/)).toBeInTheDocument();
    expect(screen.getByText(/Connection/)).toBeInTheDocument();
    expect(screen.getByText('(2)')).toBeInTheDocument();
  });

  it('should call onSelectLinkedElements when clicking on element', () => {
    render(<LinkedElementsPanel {...mockProps} />);
    
    const databaseElement = screen.getByText(/Database/);
    fireEvent.click(databaseElement);
    
    expect(mockProps.onSelectLinkedElements).toHaveBeenCalledWith(['node1'], []);
  });

  it('should not render when hideAllLinkedElements is true', () => {
    render(<LinkedElementsPanel {...mockProps} hideAllLinkedElements={true} />);
    
    expect(screen.queryByText('Linked Elements')).not.toBeInTheDocument();
  });

  it('should show no linked elements message when empty and not editable', () => {
    render(<LinkedElementsPanel 
      {...mockProps} 
      linkedElements={[]}
      canEdit={false}
      onStartLinking={undefined}
    />);
    
    expect(screen.queryByText('Linked Elements')).not.toBeInTheDocument();
  });

  it('should show link elements button when editable and no elements', () => {
    const onStartLinking = vi.fn();
    render(<LinkedElementsPanel 
      {...mockProps} 
      linkedElements={[]}
      onStartLinking={onStartLinking}
    />);
    
    expect(screen.getByText('Link Elements')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Link Elements'));
    expect(onStartLinking).toHaveBeenCalledWith('file1_section1');
  });
}); 