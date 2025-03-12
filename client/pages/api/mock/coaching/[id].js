export default function handler(req, res) {
    const { id } = req.query;
    
    res.status(200).json({
      id,
      problem: { 
        id: 'mock-problem',
        title: 'System Design Coaching Session'
      },
      conversation: [{
        role: 'assistant',
        content: "Welcome to your system design coaching session! I'm here to help you work through design challenges and improve your system architecture skills. What would you like to focus on today?",
        timestamp: new Date().toISOString()
      }],
      currentStage: 'introduction',
      status: 'in_progress',
      startedAt: new Date().toISOString()
    });
  }