import dagre from 'dagre';

/**
 * Applies Dagre layout algorithm to position Analogy nodes
 * 
 * @param {Array} nodes - Array of node objects with shape { id, data: {...} }
 * @param {Array} edges - Array of edge objects
 * @param {String} direction - Layout direction ('TB' = top-to-bottom, 'LR' = left-to-right, etc.)
 * @returns {Object} Object with positioned nodes and edges arrays
 */
export function applyDagreLayout(nodes, edges, direction = 'TB') {
  // Create a new Dagre graph
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: direction, nodesep: 60, ranksep: 80 });
  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes to the graph with fixed size
  nodes.forEach((node) => {
    g.setNode(node.id, { width: 180, height: 60 });
  });

  // Add edges to the graph
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  // Run the layout algorithm
  dagre.layout(g);

  // Extract positions and create positioned nodes
  const positionedNodes = nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x,
        y: nodeWithPosition.y,
      },
    };
  });

  // Return positioned nodes and original edges
  return {
    nodes: positionedNodes,
    edges,
  };
}
