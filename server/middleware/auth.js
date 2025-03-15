const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Get token from header or cookie
    const authHeader = req.header('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : req.cookies?.auth_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token, authorization denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info to request
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Token is not valid'
    });
  }
};