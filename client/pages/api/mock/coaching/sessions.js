export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { problemId } = req.body;

  const session = {
    _id: `session-${Date.now()}`,
    problemId: problemId,
    status: 'active',
    startedAt: new Date().toISOString(),
    problem: {
      id: problemId,
      title: 'System Design Coaching Session'
    }
  };

  res.status(200).json({ session });
}