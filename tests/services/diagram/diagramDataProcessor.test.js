const DiagramDataProcessor = require('../../../server/services/diagram/diagramDataProcessor');

describe('DiagramDataProcessor', () => {
  describe('reactFlowToMermaid', () => {
    test('converts sequence diagram correctly', () => {
      const nodes = [
        { id: 'user1', type: 'user', data: { label: 'User' } },
        { id: 'service1', type: 'service', data: { label: 'Auth Service' } },
        { id: 'database1', type: 'database', data: { label: 'Database' } }
      ];
      
      const edges = [
        { 
          source: 'user1', 
          target: 'service1',
          data: { label: 'Login Request', type: 'sync' }
        },
        {
          source: 'service1',
          target: 'database1',
          data: { label: 'Verify Credentials', type: 'async' }
        }
      ];

      const mermaid = DiagramDataProcessor.reactFlowToMermaid(nodes, edges, 'sequence');
      
      // Verify the conversion matches your workbook seeder format
      expect(mermaid).toContain('participant user1 as "User"');
      expect(mermaid).toContain('participant service1 as "Auth Service"');
      expect(mermaid).toContain('participant database1 as "Database"');
      expect(mermaid).toContain('user1->>service1: Login Request');
      expect(mermaid).toContain('service1-->>database1: Verify Credentials');
    });

    test('handles fragments in sequence diagram', () => {
      const nodes = [
        { id: 'service1', type: 'service', data: { label: 'Auth Service' } },
        { id: 'database1', type: 'database', data: { label: 'Database' } }
      ];
      
      const edges = [
        { 
          source: 'service1', 
          target: 'database1',
          data: { 
            label: 'Verify Credentials',
            type: 'async',
            fragment: {
              type: 'loop',
              label: 'Retry Logic'
            }
          }
        }
      ];

      const mermaid = DiagramDataProcessor.reactFlowToMermaid(nodes, edges, 'sequence');
      expect(mermaid).toContain('loop Retry Logic');
      expect(mermaid).toContain('service1-->>database1: Verify Credentials');
      expect(mermaid).toContain('end');
    });
  });

  describe('mermaidToReactFlow', () => {
    test('converts sequence diagram to ReactFlow format', () => {
      const mermaidCode = `
        sequenceDiagram
          participant user1 as "User"
          participant service1 as "Auth Service"
          user1->>service1: Login Request
      `;

      const { nodes, edges } = DiagramDataProcessor.mermaidToReactFlow(mermaidCode, 'sequence');
      
      expect(nodes).toHaveLength(2);
      expect(edges).toHaveLength(1);
      
      expect(nodes[0]).toMatchObject({
        id: 'user1',
        data: { label: 'User' }
      });
      
      expect(edges[0]).toMatchObject({
        source: 'user1',
        target: 'service1',
        data: { label: 'Login Request', type: 'sync' }
      });
    });

    test('preserves diagram metadata during conversion', () => {
      const originalNodes = [
        { 
          id: 'user1', 
          type: 'user',
          data: { 
            label: 'User',
            metadata: { role: 'client' }
          }
        }
      ];

      const mermaid = DiagramDataProcessor.reactFlowToMermaid(originalNodes, [], 'sequence');
      const { nodes } = DiagramDataProcessor.mermaidToReactFlow(mermaid, 'sequence');
      
      expect(nodes[0].data.metadata).toEqual({ role: 'client' });
    });
  });

  describe('validateDiagram', () => {
    test('validates required node connections', () => {
      const nodes = [
        { id: 'user1', type: 'user', data: { label: 'User' } },
        { id: 'service1', type: 'service', data: { label: 'Service' } }
      ];
      
      const edges = [];

      const result = DiagramDataProcessor.validateDiagram(nodes, edges);
      expect(result.isValid).toBeFalsy();
      expect(result.errors).toContain('Nodes must have at least one connection');
    });

    test('validates diagram completeness', () => {
      const nodes = [
        { id: 'user1', type: 'user', data: { label: 'User' } },
        { id: 'service1', type: 'service', data: { label: 'Service' } }
      ];
      
      const edges = [
        { 
          source: 'user1', 
          target: 'service1',
          data: { label: 'Request', type: 'sync' }
        }
      ];

      const result = DiagramDataProcessor.validateDiagram(nodes, edges);
      expect(result.isValid).toBeTruthy();
      expect(result.errors).toHaveLength(0);
    });
  });
});