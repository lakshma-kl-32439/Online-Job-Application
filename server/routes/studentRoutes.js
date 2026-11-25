const express = require('express');
const store = require('../data/store');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// Every route below needs a valid JWT *and* the "user" (candidate) role.
router.use(authenticate, authorizeRoles('user'));

router.get('/profile', (req, res) => res.json({ user: store.toPublic(req.user) }));

router.get('/dashboard', (req, res) => {
  const first = req.user.name.split(' ')[0];
  res.json({
    message: `Welcome back, ${first}.`,
    user: store.toPublic(req.user),
    modules: ['Job board', 'Applications', 'Interviews', 'Saved roles'],
  });
});

module.exports = router;
