// server/services/diagram/sequenceDiagramUtils.js

const calculateTimePosition = (messages) => {
  let currentTime = 0;
  const timePositions = new Map();
  
  messages.sort((a, b) => a.position.y - b.position.y);
  
  messages.forEach(message => {
    // Each message takes 50 units of time by default
    const messageTime = message.data?.duration || 50;
    timePositions.set(message.id, currentTime);
    currentTime += messageTime;
  });
  
  return timePositions;
};

const generateMermaidCode = (nodes, edges) => {
  let mermaidCode = 'sequenceDiagram\n';
  const timePositions = calculateTimePosition(edges);
  const activeLifelines = new Set();
  
  // First declare all participants in order
  nodes
    .filter(node => node.type !== 'lifeline')
    .sort((a, b) => a.position.x - b.position.x)
    .forEach(node => {
      const prefix = node.type === 'actor' ? 'actor' : 'participant';
      mermaidCode += `    ${prefix} ${node.label}\n`;
    });
  
  // Then add all messages in temporal order
  edges
    .sort((a, b) => timePositions.get(a.id) - timePositions.get(b.id))
    .forEach(edge => {
      const sourceParticipant = nodes.find(n => 
        n.id === edge.source.split('_lifeline')[0]
      ).label;
      const targetParticipant = nodes.find(n => 
        n.id === edge.target.split('_lifeline')[0]
      ).label;
      
      let arrow = '';
      let activation = '';
      
      switch (edge.type) {
        case 'sync':
          arrow = '->>';
          if (!activeLifelines.has(targetParticipant)) {
            activation = '+';
            activeLifelines.add(targetParticipant);
          }
          break;
        case 'async':
          arrow = '-->>';
          break;
        case 'return':
          arrow = '-->>';
          if (activeLifelines.has(targetParticipant)) {
            activation = '-';
            activeLifelines.delete(targetParticipant);
          }
          break;
        case 'create':
          arrow = '->+';
          break;
        case 'destroy':
          arrow = '->x';
          break;
      }
      
      mermaidCode += `    ${sourceParticipant}${arrow}${activation}${targetParticipant}: ${edge.data.label}\n`;
    });
    
  return mermaidCode;
};

module.exports = {
  generateMermaidCode,
  calculateTimePosition
};