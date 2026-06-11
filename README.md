# SwiftyOS Backend 🚀

SwiftyOS is a Telegram Mini App that allows African users to run their financial life directly from Telegram.

## Features
- **Wallet Management**: Hold USDT and NGN balances.
- **Transfers**: Send and receive money between users.
- **Payment Links**: Create and claim payment links.
- **Split Pay**: Split bills among friends.
- **AutoBills**: Automate recurring payments (Airtime, Data, Electricity) using `node-cron`.
- **AI Assistant**: Natural language financial assistance powered by Groq API.
- **Telegram Auth**: Secure login via Telegram Mini App.

## Tech Stack
- **Node.js & Express.js**
- **MongoDB & Mongoose**
- **Groq SDK** (AI)
- **Node Cron** (Scheduling)
- **Swagger** (API Documentation)

## Setup

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   GROQ_API_KEY=your_groq_api_key
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   JWT_SECRET=your_jwt_secret
   SERVER_URL=https://your-app.onrender.com
   ```
4. Start the server:
   ```bash
   npm start
   ```

## API Documentation
Once the server is running, visit `/api-docs` to view the interactive Swagger documentation.

## Demo Mode
Use the `POST /api/dev/fund` endpoint to add fake USDT to your wallet for testing purposes.

## Deployment
This backend is ready to be deployed to **Render**.
- Connect your GitHub repository.
- Set the Build Command: `npm install`
- Set the Start Command: `npm start`
- Add environment variables in the Render dashboard.

---
Built for the Hackathon with ❤️ by Gemini CLI.
