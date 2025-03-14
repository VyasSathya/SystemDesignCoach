const diagramStructure = {
  sequence: {
    metadata: {
      type: 'sequence',
      title: String,
      description: String
    },
    components: {
      actors: [{
        id: String,
        name: String,
        type: 'user' | 'service' | 'database'
      }],
      messages: [{
        from: String, // actor id
        to: String,   // actor id
        label: String,
        order: Number,
        type: 'sync' | 'async' | 'return'
      }]
    },
    mermaid: {
      template: `sequenceDiagram
    {{#each actors}}
    participant {{id}} as {{name}}
    {{/each}}
    {{#each messages}}
    {{from}}->>{{to}}: {{label}}
    {{/each}}`,
      generated: String // final mermaid code
    }
  },
  system: {
    metadata: {
      type: 'system',
      title: String,
      description: String
    },
    components: {
      nodes: [{
        id: String,
        type: 'service' | 'database' | 'cache' | 'loadbalancer',
        label: String,
        position: { x: Number, y: Number }
      }],
      connections: [{
        from: String,
        to: String,
        type: 'sync' | 'async' | 'depends',
        label: String
      }]
    },
    mermaid: {
      template: `graph TD
    {{#each nodes}}
    {{id}}[{{label}}]
    {{/each}}
    {{#each connections}}
    {{from}} -->|{{label}}| {{to}}
    {{/each}}`,
      generated: String
    }
  }
};