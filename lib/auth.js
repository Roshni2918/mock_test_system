import jwt from 'jsonwebtoken';

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret');
  } catch (error) {
    return null;
  }
}

export function getUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  return verifyToken(token);
}

export function requireAuth(handler) {
  return async (req, res) => {
    const user = getUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Access denied' });
    }
    req.user = user;
    return handler(req, res);
  };
}

export function requireAdmin(handler) {
  return requireAuth(async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    return handler(req, res);
  });
}

export function requireStudent(handler) {
  return requireAuth(async (req, res) => {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Student access required' });
    }
    return handler(req, res);
  });
}
