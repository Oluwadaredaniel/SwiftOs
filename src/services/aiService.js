import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class AIService {
  async processCommand(text) {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an AI financial assistant for SwiftyOS.
          Extract structured actions from user input.
          Possible actions: CREATE_AUTOBILL, SPLIT_PAY, CONVERT_CURRENCY, SEND_MONEY.
          Return ONLY JSON.
          Example:
          Input: "Buy MTN data every Friday for 3000 NGN"
          Output: {"action": "CREATE_AUTOBILL", "type": "Data", "provider": "MTN", "amount": 3000, "frequency": "weekly"}
          
          Input: "Split 20000 among 5 people for dinner"
          Output: {"action": "SPLIT_PAY", "amount": 20000, "participants": 5, "description": "dinner"}
          
          Input: "Convert 50 USDT to NGN"
          Output: {"action": "CONVERT_CURRENCY", "from": "USDT", "to": "NGN", "amount": 50}`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      model: 'llama3-8b-8192',
      response_format: { type: 'json_object' },
    });

    return JSON.parse(chatCompletion.choices[0].message.content);
  }
}

export default new AIService();
