const express = require('express');
const store = require('../data/store');
const { authenticate } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// Admin-only: valid JWT + the "admin" role.
router.use(authenticate, authorizeRoles('admin'));

router.get('/users', (req, res) => res.json({ users: store.all().map(store.toPublic) }));

module.exports = router;
