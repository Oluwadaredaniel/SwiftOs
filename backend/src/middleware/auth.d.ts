import type { Request, Response, NextFunction } from 'express';
/**
 * Validates the initData sent from Telegram Mini App.
 * Uses the BOT_TOKEN to verify the HMAC signature.
 */
export declare const validateTelegramAuth: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
//# sourceMappingURL=auth.d.ts.map