import crypto from 'crypto';
import PaymentLink from '../models/PaymentLink.js';
import walletService from '../services/walletService.js';

export const listLinks = async (req, res) => {
  try {
    const links = await PaymentLink.find({ creatorId: req.user._id }).sort({ createdAt: -1 });
    res.json({
      status: 'success',
      data: links.map(l => ({
        id: l._id,
        amount: l.amount,
        currency: l.currency,
        token: l.token,
        status: l.isClaimed ? 'claimed' : 'active',
        note: l.note || null,
        creator: req.user.username,
        expiryDate: l.expiresAt || null,
        createdAt: l.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createLink = async (req, res) => {
  try {
    const { amount, currency, note } = req.body;
    const token = crypto.randomBytes(16).toString('hex');

    const link = await PaymentLink.create({
      creatorId: req.user._id,
      amount,
      currency,
      token,
      note,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h expiry per spec
    });

    res.json({ status: 'success', data: link });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const claimLink = async (req, res) => {
  try {
    const { token } = req.params;
    const link = await PaymentLink.findOne({ token, isClaimed: false });

    if (!link) return res.status(404).json({ status: 'error', message: 'Link not found or already claimed' });
    if (link.expiresAt && link.expiresAt < new Date()) {
      return res.status(400).json({ status: 'error', message: 'Link has expired' });
    }
    if (link.creatorId.toString() === req.user._id.toString()) {
      return res.status(400).json({ status: 'error', message: 'Cannot claim your own link' });
    }

    await walletService.transfer(
      link.creatorId,
      req.user._id,
      link.amount,
      link.currency,
      `SwiftyLink claim: ${token}`
    );

    link.isClaimed = true;
    link.claimedBy = req.user._id;
    await link.save();

    res.json({ status: 'success', data: { amount: link.amount, currency: link.currency } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
