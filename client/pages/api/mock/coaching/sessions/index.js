export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { problemId } = req.body;
  
  const session = {
    _id: `${problemId}_${Date.now()}`,
    problemId,
    status: 'active',
    startedAt: new Date().toISOString(),
    problem: {
      id: problemId,
      title: problemId === 'url-shortener' 
        ? 'Design a URL Shortener'
        : problemId === 'social-feed'
        ? 'Design a Social Media Feed'
        : 'System Design Coaching Session'
    },
    conversation: [{
      id: 0,
      role: 'assistant',
      content: `Welcome to your system design coaching session! Let's work on designing a solution.`,
      timestamp: new Date().toISOString()
    }]
  };

  res.status(200).json({ success: true, session });
}