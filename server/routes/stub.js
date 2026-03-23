const express = require('express');
const authMiddleware = require('../middleware/auth');

const createStubRouter = () => {
  const router = express.Router();
  router.get('/', authMiddleware, (req, res) => res.json([]));
  router.post('/', authMiddleware, (req, res) => res.status(201).json({ message: 'Saved (Stub)' }));
  return router;
};

module.exports = createStubRouter;
