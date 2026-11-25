const jwt = require('jsonwebtoken');
const store = require('../data/store');

/**
 * Authentication: verifies the "Authorization: Bearer <token>" header.
 * Missing / malformed / expired / tampered tokens are rejected with 401.
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Authentication required. Send a Bearer token.' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = store.findById(payload.sub);
    if (!user) return res.status(401).json({ message: 'This account no longer exists.' });
    req.user = user;
    return next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Your session has expired. Log in again.' : 'Invalid token.';
    return res.status(401).json({ message });
  }
}

module.exports = { authenticate };
