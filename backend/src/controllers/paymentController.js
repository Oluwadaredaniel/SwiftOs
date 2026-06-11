import crypto from 'crypto';
import PaymentLink from '../models/PaymentLink.js';
import walletService from '../services/walletService.js';

export const createLink = async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const token = crypto.randomBytes(16).toString('hex');
    
    const link = await PaymentLink.create({
      creatorId: req.user._id,
      amount,
      currency,
      token,
    });
    
    res.json(link);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const claimLink = async (req, res) => {
  try {
    const { token } = req.params;
    const link = await PaymentLink.findOne({ token, isClaimed: false });
    
    if (!link) return res.status(404).json({ message: 'Link not found or already claimed' });
    if (link.creatorId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot claim your own link' });
    }

    // Transfer from creator to claimer
    await walletService.transfer(
      link.creatorId,
      req.user._id,
      link.amount,
      link.currency,
      `Payment link claim: ${token}`
    );

    link.isClaimed = true;
    link.claimedBy = req.user._id;
    await link.save();

    res.json({ message: 'Claimed successfully', amount: link.amount, currency: link.currency });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
