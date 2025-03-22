// Define available problems
const PROBLEMS = {
  'url-shortener': {
    id: 'url-shortener',
    title: 'Design a URL Shortener',
    description: 'Create a service that takes long URLs and creates unique short URLs, similar to TinyURL or bit.ly.',
    difficulty: 'intermediate',
    estimatedTime: 45
  },
  'social-feed': {
    id: 'social-feed',
    title: 'Design a Social Media Feed',
    description: 'Design a news feed system that can handle millions of users posting and viewing content in real-time.',
    difficulty: 'advanced',
    estimatedTime: 60
  }
};

export default function handler(req, res) {
  const { id } = req.query;
  
  // Extract the problem ID from the session ID (assuming format: problemId_timestamp)
  const problemId = id.split('_')[0];
  const problem = PROBLEMS[problemId] || {
    id: problemId,
    title: 'System Design Session',
    description: 'Practice your system design skills.',
    difficulty: 'intermediate',
    estimatedTime: 45
  };

  const session = {
    _id: id,
    status: 'active',
    startedAt: new Date().toISOString(),
    problem,
    conversation: [{
      id: 0,
      role: 'assistant',
      content: `Welcome to your ${problem.title} coaching session! Let's begin our system design journey!`,
      timestamp: new Date().toISOString()
    }]
  };

  res.status(200).json(session);
}

// Enable API route configuration
export const config = {
  api: {
    bodyParser: true,
  },
};
