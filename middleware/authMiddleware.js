const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || process.env.EXPO_PUBLIC_JWT_SECRET || process.env.SUPABASE_JWT_SECRET;

/**
 * Middleware to verify JWT Token
 * Usage: router.get('/protected-route', verifyToken, (req, res) => { ... });
 */
const verifyToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Token missing' });
    }

    if (!JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    req.user = decoded;
    req.uid = decoded.sub || decoded.id || decoded.userId;
    req.userId = decoded.sub || decoded.id || decoded.userId;
    
    next();
  } catch (error) {
    console.error('Token Verification Error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized: Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Unauthorized: Invalid token' });
    }
    return res.status(403).json({ error: 'Unauthorized: Token verification failed' });
  }
};

// Middleware to verify Mongo ID format (simple check to prevent CastErrors)
const validateMongoId = (paramName) => (req, res, next) => {
  const id = req.params[paramName] || req.query[paramName] || req.body[paramName];
  if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: `Invalid ${paramName} format` });
  }
  next();
};

module.exports = {
  verifyToken,
  validateMongoId
};
