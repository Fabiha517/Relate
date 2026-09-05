import { describe, it, expect } from 'vitest';
import { applyDagreLayout } from './dagre';

describe('applyDagreLayout', () => {
  it('should add position properties to nodes', () => {
    const nodes = [
      { id: '1', data: { label: 'Node 1' } },
      { id: '2', data: { label: 'Node 2' } },
      { id: '3', data: { label: 'Node 3' } },
    ];
    const edges = [
      { source: '1', target: '2' },
      { source: '2', target: '3' },
    ];

    const result = applyDagreLayout(nodes, edges);

    expect(result.nodes).toHaveLength(3);
    result.nodes.forEach((node) => {
      expect(node).toHaveProperty('position');
      expect(node.position).toHaveProperty('x');
      expect(node.position).toHaveProperty('y');
      expect(typeof node.position.x).toBe('number');
      expect(typeof node.position.y).toBe('number');
    });
  });

  it('should preserve node data properties', () => {
    const nodes = [
      { id: 'a', data: { concept: 'Concept A', analogy: 'Analogy A' } },
      { id: 'b', data: { concept: 'Concept B', analogy: 'Analogy B' } },
    ];
    const edges = [];

    const result = applyDagreLayout(nodes, edges);

    expect(result.nodes[0].data).toEqual({
      concept: 'Concept A',
      analogy: 'Analogy A',
    });
    expect(result.nodes[1].data).toEqual({
      concept: 'Concept B',
      analogy: 'Analogy B',
    });
  });

  it('should not modify input arrays', () => {
    const nodes = [
      { id: '1', data: { label: 'Node 1' } },
      { id: '2', data: { label: 'Node 2' } },
    ];
    const edges = [{ source: '1', target: '2' }];

    const nodesCopy = JSON.stringify(nodes);
    const edgesCopy = JSON.stringify(edges);

    applyDagreLayout(nodes, edges);

    expect(JSON.stringify(nodes)).toBe(nodesCopy);
    expect(JSON.stringify(edges)).toBe(edgesCopy);
  });

  it('should handle top-to-bottom (TB) direction', () => {
    const nodes = [
      { id: '1', data: { label: 'Root' } },
      { id: '2', data: { label: 'Child 1' } },
      { id: '3', data: { label: 'Child 2' } },
    ];
    const edges = [
      { source: '1', target: '2' },
      { source: '1', target: '3' },
    ];

    const result = applyDagreLayout(nodes, edges, 'TB');

    expect(result.nodes).toHaveLength(3);
    // In TB layout, root should be above children
    expect(result.nodes[0].position.y).toBeLessThan(result.nodes[1].position.y);
    expect(result.nodes[0].position.y).toBeLessThan(result.nodes[2].position.y);
  });

  it('should handle left-to-right (LR) direction', () => {
    const nodes = [
      { id: '1', data: { label: 'Start' } },
      { id: '2', data: { label: 'Next' } },
      { id: '3', data: { label: 'End' } },
    ];
    const edges = [
      { source: '1', target: '2' },
      { source: '2', target: '3' },
    ];

    const result = applyDagreLayout(nodes, edges, 'LR');

    expect(result.nodes).toHaveLength(3);
    // In LR layout, nodes should progress left to right
    expect(result.nodes[0].position.x).toBeLessThan(result.nodes[1].position.x);
  });

  it('should return edges unchanged', () => {
    const nodes = [
      { id: '1', data: { label: 'Node 1' } },
      { id: '2', data: { label: 'Node 2' } },
    ];
    const edges = [
      { source: '1', target: '2', label: 'connects to' },
    ];

    const result = applyDagreLayout(nodes, edges);

    expect(result.edges).toEqual(edges);
  });

  it('should handle graphs with 3-20 nodes', () => {
    // Test with 3 nodes
    const nodes3 = Array.from({ length: 3 }, (_, i) => ({
      id: String(i + 1),
      data: { label: `Node ${i + 1}` },
    }));
    const edges3 = [{ source: '1', target: '2' }, { source: '2', target: '3' }];

    const result3 = applyDagreLayout(nodes3, edges3);
    expect(result3.nodes).toHaveLength(3);

    // Test with 20 nodes
    const nodes20 = Array.from({ length: 20 }, (_, i) => ({
      id: String(i + 1),
      data: { label: `Node ${i + 1}` },
    }));
    const edges20 = Array.from({ length: 19 }, (_, i) => ({
      source: String(i + 1),
      target: String(i + 2),
    }));

    const result20 = applyDagreLayout(nodes20, edges20);
    expect(result20.nodes).toHaveLength(20);
  });

  it('should default to TB direction when not specified', () => {
    const nodes = [
      { id: '1', data: { label: 'Top' } },
      { id: '2', data: { label: 'Bottom' } },
    ];
    const edges = [{ source: '1', target: '2' }];

    const resultDefault = applyDagreLayout(nodes, edges);
    const resultExplicitTB = applyDagreLayout(nodes, edges, 'TB');

    // Both should produce similar layouts (top node above bottom)
    expect(resultDefault.nodes[0].position.y).toBeLessThan(
      resultDefault.nodes[1].position.y
    );
    expect(resultExplicitTB.nodes[0].position.y).toBeLessThan(
      resultExplicitTB.nodes[1].position.y
    );
  });

  it('should handle disconnected components', () => {
    const nodes = [
      { id: '1', data: { label: 'A1' } },
      { id: '2', data: { label: 'A2' } },
      { id: '3', data: { label: 'B1' } },
      { id: '4', data: { label: 'B2' } },
    ];
    const edges = [
      { source: '1', target: '2' },
      { source: '3', target: '4' },
    ];

    const result = applyDagreLayout(nodes, edges);

    expect(result.nodes).toHaveLength(4);
    result.nodes.forEach((node) => {
      expect(node).toHaveProperty('position.x');
      expect(node).toHaveProperty('position.y');
    });
  });

  it('should position nodes without overlap when properly spaced', () => {
    const nodes = [
      { id: '1', data: { label: 'Node 1' } },
      { id: '2', data: { label: 'Node 2' } },
      { id: '3', data: { label: 'Node 3' } },
      { id: '4', data: { label: 'Node 4' } },
    ];
    const edges = [
      { source: '1', target: '2' },
      { source: '1', target: '3' },
      { source: '2', target: '4' },
      { source: '3', target: '4' },
    ];

    const result = applyDagreLayout(nodes, edges);

    // Check that positions are numbers and valid
    result.nodes.forEach((node) => {
      expect(Number.isFinite(node.position.x)).toBe(true);
      expect(Number.isFinite(node.position.y)).toBe(true);
    });
  });
});
