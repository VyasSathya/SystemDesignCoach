export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const problems = [
    {
      id: "url-shortener",
      title: "Design a URL Shortener",
      difficulty: "intermediate",
      description: "Create a service that takes long URLs and creates unique short URLs, similar to TinyURL or bit.ly.",
      estimatedTime: 45
    },
    {
      id: "social-feed",
      title: "Design a Social Media Feed",
      difficulty: "advanced",
      description: "Design a news feed system that can handle millions of users posting and viewing content in real-time.",
      estimatedTime: 60
    },
    {
      id: "chat-system",
      title: "Design a Chat System",
      difficulty: "intermediate",
      description: "Design a scalable real-time chat system supporting both one-on-one and group conversations.",
      estimatedTime: 50
    }
  ];

  res.status(200).json({ problems });
}


