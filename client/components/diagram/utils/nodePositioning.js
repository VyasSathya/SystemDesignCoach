const GRID_SIZE = 50;
const NODE_WIDTH = 150;
const NODE_HEIGHT = 40;

export const getNodePositionForType = (type, bounds, existingNodes) => {
  switch (type) {
    case 'loadBalancer':
      return getLoadBalancerPosition(bounds, existingNodes);
    case 'cache':
      return getCachePosition(bounds, existingNodes);
    case 'apiGateway':
      return getApiGatewayPosition(bounds, existingNodes);
    case 'database':
      return getDatabasePosition(bounds, existingNodes);
    default:
      return getDefaultPosition(bounds, existingNodes);
  }
};

const getLoadBalancerPosition = (bounds, existingNodes) => {
  // Place load balancer before the first service node
  const serviceNode = existingNodes.find(node => node.type === 'service');
  if (serviceNode) {
    return {
      x: serviceNode.position.x - NODE_WIDTH - GRID_SIZE,
      y: serviceNode.position.y
    };
  }
  return getDefaultPosition(bounds, existingNodes);
};

const getCachePosition = (bounds, existingNodes) => {
  // Place cache near the database
  const dbNode = existingNodes.find(node => node.type === 'database');
  if (dbNode) {
    return {
      x: dbNode.position.x,
      y: dbNode.position.y + NODE_HEIGHT + GRID_SIZE
    };
  }
  return getDefaultPosition(bounds, existingNodes);
};

const getApiGatewayPosition = (bounds, existingNodes) => {
  // Place API Gateway at the entry point
  const clientNode = existingNodes.find(node => node.type === 'client');
  if (clientNode) {
    return {
      x: clientNode.position.x + NODE_WIDTH + GRID_SIZE,
      y: clientNode.position.y
    };
  }
  return {
    x: bounds.minX - NODE_WIDTH - GRID_SIZE,
    y: (bounds.minY + bounds.maxY) / 2
  };
};

const getDatabasePosition = (bounds, existingNodes) => {
  // Place database at the end
  return {
    x: bounds.maxX + NODE_WIDTH + GRID_SIZE,
    y: (bounds.minY + bounds.maxY) / 2
  };
};

const getDefaultPosition = (bounds, existingNodes) => {
  // Place new node in a grid pattern
  const gridX = Math.floor((bounds.maxX + GRID_SIZE) / GRID_SIZE) * GRID_SIZE;
  const gridY = Math.floor((bounds.minY + GRID_SIZE) / GRID_SIZE) * GRID_SIZE;
  
  return {
    x: gridX,
    y: gridY
  };
};