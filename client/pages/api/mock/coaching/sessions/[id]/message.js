export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  const { message, contextInfo } = req.body;

  const response = {
    message: {
      role: 'assistant',
      content: `I understand you're asking about: "${message}". Let me help you with that. As a system design coach, I can guide you through the architectural considerations and trade-offs involved.`,
      timestamp: new Date().toISOString()
    }
  };

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