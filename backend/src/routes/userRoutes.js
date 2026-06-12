import express from 'express';
import User from '../models/User.js';
import authMiddleware from '../utils/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// Look up a user by Telegram username to get their internal ID for transfers
router.get('/lookup', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ message: 'username query param required' });

    const clean = username.replace(/^@/, '').trim();
    if (!clean) return res.status(400).json({ message: 'Invalid username' });

    const user = await User.findOne({ username: clean });
    if (!user) return res.status(404).json({ message: `User @${clean} not found. They must have used SwiftyOS at least once.` });

    res.json({ status: 'success', data: { id: user._id, username: user.username, firstName: user.firstName } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
