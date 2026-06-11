import express from 'express';
import * as authController from '../controllers/authController.js';
import authMiddleware from '../utils/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/telegram:
 *   post:
 *     summary: Login with Telegram data
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               initData:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/telegram', authController.telegramLogin);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user info
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User info
 */
router.get('/me', authMiddleware, authController.getMe);

export default router;
