const jwt = require('jsonwebtoken');

// Middleware to check if user is authenticated
const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header instead of cookies
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No token found in Authorization header');
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token found:', token.substring(0, 20) + '...');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    console.log('Decoded token:', { userId: decoded.userId, role: decoded.role });
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to check if user is admin
const adminMiddleware = (req, res, next) => {
  console.log('Checking admin access, user role:', req.user.role);
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware }; 