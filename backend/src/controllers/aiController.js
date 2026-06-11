import aiService from '../services/aiService.js';

export const askAI = async (req, res) => {
  try {
    const { text } = req.body;
    const response = await aiService.processCommand(text);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
