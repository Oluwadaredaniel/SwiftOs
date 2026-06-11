import AutoBill from '../models/AutoBill.js';

export const createAutoBill = async (req, res) => {
  try {
    const { type, provider, amount, currency, frequency, billersCode, variationCode } = req.body;

    if (!billersCode) {
      return res.status(400).json({ message: 'billersCode is required (phone number or meter number)' });
    }

    let nextDue = new Date();
    if (frequency === 'daily') nextDue.setDate(nextDue.getDate() + 1);
    else if (frequency === 'weekly') nextDue.setDate(nextDue.getDate() + 7);
    else if (frequency === 'monthly') nextDue.setMonth(nextDue.getMonth() + 1);

    const bill = await AutoBill.create({
      userId: req.user._id,
      type,
      provider,
      amount,
      currency,
      frequency,
      billersCode,
      variationCode,
      nextDue,
    });

    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAutoBills = async (req, res) => {
  try {
    const bills = await AutoBill.find({ userId: req.user._id });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAutoBill = async (req, res) => {
  try {
    await AutoBill.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'AutoBill deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
