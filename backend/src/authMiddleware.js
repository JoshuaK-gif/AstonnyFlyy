import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Malformed authorization header.' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('FATAL: JWT_SECRET is not set in environment variables.');
      return res.status(500).json({ error: 'Server configuration error.' });
    }

    const decoded = jwt.verify(token, secret);

    // Verify the token has the admin role
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden. Insufficient privileges.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token. Access denied.' });
    }
    return res.status(401).json({ error: 'Authentication failed.' });
  }
};
