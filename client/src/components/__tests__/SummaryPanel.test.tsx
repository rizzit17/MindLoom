import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { SummaryPanel } from '../SummaryPanel';
import { Mindmap, MindmapNode } from '@visualli/shared';

const mockMindmap: Mindmap = {
  id: 'mm-1',
  title: 'Sample Architecture',
  rootId: 'n1',
  nodes: [
    { id: 'n1', label: 'Microservices', summary: 'Microservices architecture overview.', isRoot: true },
    { id: 'n2', label: 'API Gateway', summary: 'Handles routing and authentication.' },
  ],
  connections: [{ id: 'c1', from: 'n1', to: 'n2', label: 'routes to' }],
};

describe('SummaryPanel Component', () => {
  it('renders node details and summary when node is selected', () => {
    const selectedNode: MindmapNode = mockMindmap.nodes[0];
    render(
      <SummaryPanel
        node={selectedNode}
        mindmap={mockMindmap}
        onClose={jest.fn()}
        onSelectNode={jest.fn()}
      />
    );

    expect(screen.getByText('Microservices')).toBeInTheDocument();
    expect(screen.getByText('Microservices architecture overview.')).toBeInTheDocument();
    expect(screen.getByText(/Root Topic/i)).toBeInTheDocument();
    expect(screen.getByText('API Gateway')).toBeInTheDocument();
  });

  it('triggers onClose when close button is clicked', () => {
    const onCloseMock = jest.fn();
    render(
      <SummaryPanel
        node={mockMindmap.nodes[0]}
        mindmap={mockMindmap}
        onClose={onCloseMock}
        onSelectNode={jest.fn()}
      />
    );

    const closeBtn = screen.getByRole('button', { name: /close panel/i });
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalled();
  });
});
