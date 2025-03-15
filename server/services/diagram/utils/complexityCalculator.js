/**
 * Calculates complexity metrics for a diagram
 * @param {Array} nodes - Array of diagram nodes
 * @param {Array} edges - Array of diagram edges
 * @returns {Object} Complexity metrics
 */
function calculateComplexity(nodes, edges) {
  const metrics = {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    density: 0,
    avgConnections: 0,
    maxDepth: 0,
    complexity: 0
  };

  // Calculate density (ratio of actual to possible connections)
  const possibleConnections = nodes.length * (nodes.length - 1) / 2;
  metrics.density = possibleConnections > 0 ? edges.length / possibleConnections : 0;

  // Calculate average connections per node
  metrics.avgConnections = nodes.length > 0 ? edges.length / nodes.length : 0;

  // Calculate max depth (longest path from any root node)
  metrics.maxDepth = calculateMaxDepth(nodes, edges);

  // Calculate overall complexity score
  metrics.complexity = calculateComplexityScore(metrics);

  return metrics;
}

/**
 * Calculates the maximum depth of the diagram
 * @param {Array} nodes 
 * @param {Array} edges 
 * @returns {number}
 */
function calculateMaxDepth(nodes, edges) {
  const adjacencyList = buildAdjacencyList(nodes, edges);
  let maxDepth = 0;

  nodes.forEach(node => {
    const depth = findLongestPath(node.id, adjacencyList, new Set());
    maxDepth = Math.max(maxDepth, depth);
  });

  return maxDepth;
}

/**
 * Builds an adjacency list representation of the diagram
 * @param {Array} nodes 
 * @param {Array} edges 
 * @returns {Object}
 */
function buildAdjacencyList(nodes, edges) {
  const adjacencyList = {};
  
  // Initialize adjacency list for all nodes
  nodes.forEach(node => {
    adjacencyList[node.id] = [];
  });

  // Add edges to adjacency list
  edges.forEach(edge => {
    if (adjacencyList[edge.source]) {
      adjacencyList[edge.source].push(edge.target);
    }
  });

  return adjacencyList;
}

/**
 * Finds the longest path from a starting node
 * @param {string} nodeId 
 * @param {Object} adjacencyList 
 * @param {Set} visited 
 * @returns {number}
 */
function findLongestPath(nodeId, adjacencyList, visited) {
  if (visited.has(nodeId)) return 0;
  visited.add(nodeId);

  let maxChildDepth = 0;
  const neighbors = adjacencyList[nodeId] || [];

  neighbors.forEach(neighbor => {
    const childDepth = findLongestPath(neighbor, adjacencyList, new Set(visited));
    maxChildDepth = Math.max(maxChildDepth, childDepth);
  });

  return maxChildDepth + 1;
}

/**
 * Calculates overall complexity score
 * @param {Object} metrics 
 * @returns {number}
 */
function calculateComplexityScore(metrics) {
  const weights = {
    nodeCount: 0.3,
    edgeCount: 0.3,
    density: 0.2,
    maxDepth: 0.2
  };

  return (
    (metrics.nodeCount * weights.nodeCount) +
    (metrics.edgeCount * weights.edgeCount) +
    (metrics.density * weights.density) +
    (metrics.maxDepth * weights.maxDepth)
  );
}

module.exports = {
  calculateComplexity
};