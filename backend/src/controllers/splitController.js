import SplitPayment from '../models/SplitPayment.js';
import walletService from '../services/walletService.js';

export const createSplit = async (req, res) => {
  try {
    const { totalAmount, currency, description, participants } = req.body;
    // participants is an array of { userId, amount }
    
    const split = await SplitPayment.create({
      creatorId: req.user._id,
      totalAmount,
      currency,
      description,
      participants,
    });
    
    res.json(split);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSplit = async (req, res) => {
  try {
    const split = await SplitPayment.findById(req.params.id).populate('participants.userId');
    res.json(split);
  } catch (error) {
    res.status(404).json({ message: 'Split payment not found' });
  }
};

export const paySplit = async (req, res) => {
  try {
    const split = await SplitPayment.findById(req.params.id);
    if (!split) return res.status(404).json({ message: 'Split payment not found' });

    const participant = split.participants.find(p => p.userId.toString() === req.user._id.toString());
    if (!participant) return res.status(403).json({ message: 'You are not a participant' });
    if (participant.status === 'paid') return res.status(400).json({ message: 'Already paid' });

    // Transfer to creator
    await walletService.transfer(
      req.user._id,
      split.creatorId,
      participant.amount,
      split.currency,
      `Split payment: ${split.description}`
    );

    participant.status = 'paid';
    
    const allPaid = split.participants.every(p => p.status === 'paid');
    if (allPaid) split.status = 'completed';
    
    await split.save();
    res.json({ message: 'Paid successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
