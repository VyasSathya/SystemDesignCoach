export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const token = authHeader.split(' ')[1];

    // For development, return mock user data if token exists
    if (token) {
      return res.status(200).json({
        success: true,
        user: {
          id: 'mock-user-1',
          email: 'vyas.sathya@gmail.com',
          name: 'Test User',
          experience: 'intermediate'
        }
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });

  } catch (error) {
    console.error('Auth me handler error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}