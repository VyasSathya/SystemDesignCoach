export default function handler(req, res) {
  const { id } = req.query;
  
  if (req.method === 'GET') {
    res.status(200).json({
      success: true,
      session: {
        _id: id,
        status: 'active',
        startedAt: new Date().toISOString(),
        problem: {
          id: 'url-shortener',
          title: 'Design a URL Shortening Service'
        },
        conversation: [{
          role: 'assistant',
          content: "Welcome to your system design coaching session! I'm here to help you work through design challenges and improve your system architecture skills. What would you like to focus on today?",
          timestamp: new Date().toISOString()
        }]
      }
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}