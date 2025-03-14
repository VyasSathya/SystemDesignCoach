export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  const { message, contextInfo, sessionId } = req.body;
  
  // Log incoming request
  console.log('Mock API Request:', {
    message,
    contextInfo,
    sessionId
  });
  
  const response = {
    message: {
      role: 'assistant',
      content: `I understand you're asking about: "${message}". Let me help you with that. As a system design coach, I can guide you through the architectural considerations and trade-offs involved.`,
      timestamp: new Date().toISOString()
    }
  };

  // If diagram suggestions were requested
  if (contextInfo?.requestDiagramSuggestions) {
    response.diagramSuggestions = {
      mermaidCode: `graph TD
    A[Client] --> B[Load Balancer]
    B --> C[Web Server]
    C --> D[Database]`
    };
  }

  res.status(200).json(response);
}
