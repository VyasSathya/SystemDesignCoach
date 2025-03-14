const templates = {
  system: {
    basic: {
      name: 'Basic Web App',
      nodes: [
        {
          id: 'client',
          type: 'client',
          position: { x: 100, y: 100 },
          data: { label: 'Client' }
        },
        {
          id: 'server',
          type: 'service',
          position: { x: 400, y: 100 },
          data: { label: 'Server' }
        },
        {
          id: 'db',
          type: 'database',
          position: { x: 700, y: 100 },
          data: { label: 'Database' }
        }
      ],
      edges: [
        {
          id: 'client-server',
          source: 'client',
          target: 'server',
          type: 'default',
          animated: true
        },
        {
          id: 'server-db',
          source: 'server',
          target: 'db',
          type: 'default',
          animated: true
        }
      ]
    },
    microservices: {
      name: 'Microservices',
      nodes: [
        {
          id: 'lb',
          type: 'loadBalancer',
          position: { x: 250, y: 50 },
          data: { label: 'Load Balancer' }
        },
        {
          id: 'auth',
          type: 'service',
          position: { x: 100, y: 200 },
          data: { label: 'Auth Service' }
        },
        {
          id: 'api',
          type: 'service',
          position: { x: 400, y: 200 },
          data: { label: 'API Gateway' }
        },
        {
          id: 'cache',
          type: 'cache',
          position: { x: 250, y: 350 },
          data: { label: 'Cache' }
        }
      ],
      edges: [
        // Add appropriate edges
      ]
    },
    distributed: {
      name: 'Distributed System',
      nodes: [
        {
          id: 'cdn',
          type: 'client',
          position: { x: 100, y: 50 },
          data: { label: 'CDN' }
        },
        {
          id: 'queue',
          type: 'queue',
          position: { x: 400, y: 200 },
          data: { label: 'Message Queue' }
        }
        // Add more nodes
      ],
      edges: []
    }
  },
  sequence: {
    auth: {
      name: 'Authentication Flow',
      actors: ['Client', 'Auth Service', 'Database'],
      messages: [
        { from: 'Client', to: 'Auth Service', text: 'Login Request' },
        { from: 'Auth Service', to: 'Database', text: 'Verify Credentials' },
        { from: 'Database', to: 'Auth Service', text: 'User Data' },
        { from: 'Auth Service', to: 'Client', text: 'JWT Token' }
      ]
    },
    // Add more sequence diagram templates
  }
};

module.exports = templates;