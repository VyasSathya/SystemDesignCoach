export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { message, contextInfo } = req.body;

    console.log('Mock API received request:', {
      sessionId: id,
      message,
      contextInfo
    });

    // Always return a mock response in development
    const response = {
      message: {
        role: 'assistant',
        content: `[Mock] I understand you're asking about: "${message}". Let me help you with that. As a system design coach, I can guide you through the architectural considerations and trade-offs involved.`,
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

    // Add artificial delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 500));

    res.status(200).json(response);
  } catch (error) {
    console.error('Mock API Error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      details: error.message 
    });
  }
}
