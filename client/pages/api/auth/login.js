export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // For development, create a mock successful response
    const mockUser = {
      id: 'mock-user-1',
      email: email,
      name: 'Test User',
      experience: 'intermediate'
    };

    const mockToken = `mock-token-${Date.now()}`;

    // Return success response
    return res.status(200).json({
      success: true,
      token: mockToken,
      user: mockUser
    });

  } catch (error) {
    console.error('Login handler error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}