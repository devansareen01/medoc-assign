const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
}

const protectedRoutes = [
  '/patients',
  '/patients/:id/reports',
  '/diagnostic-tests',
  '/reports',
  '/reports/:id',
  '/reports/:id/pdf'
];

function authMiddleware(req, res, next) {
  if (req.path.startsWith('/api')) {
    const match = protectedRoutes.some(route => {
      const regex = new RegExp('^' + route.replace(':id', '[^/]+') + '$');
      return regex.test(req.path.replace('/api', ''));
    });
    if (match) {
      return authenticateJWT(req, res, next);
    }
  }
  next();
}

module.exports = { authenticateJWT, authorizeRoles, authMiddleware }; 