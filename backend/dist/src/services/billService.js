import axios from 'axios';
import prisma from '../utils/prisma.js';
import conversionService from './conversionService.js';
import walletService from './walletService.js';
import { Prisma } from '@prisma/client';
class BillService {
    VTPASS_BASE_URL = process.env.NODE_ENV === 'production'
        ? 'https://vtpass.com/api'
        : 'https://sandbox.vtpass.com/api';
    get headers() {
        return {
            'api-key': process.env.VTPASS_API_KEY,
            'public-key': process.env.VTPASS_PUBLIC_KEY,
        };
    }
    async getProviders(category = 'data') {
        const response = await axios.get(`${this.VTPASS_BASE_URL}/services?identifier=${category}`, {
            headers: this.headers
        });
        return response.data;
    }
    async getVariations(serviceID) {
        const response = await axios.get(`${this.VTPASS_BASE_URL}/service-variations?serviceID=${serviceID}`, {
            headers: this.headers
        });
        return response.data;
    }
    /**
     * ATOMIC BILL PAYMENT
     * 1. Calculate USDT cost
     * 2. Check & Debit User USDT
     * 3. Call VTpass
     * 4. Refund on failure
     */
    async payBill(userId, payload) {
        const { usdt, rate } = await conversionService.calculateUSDT(payload.amount);
        // Generate unique request ID: YYYYMMDDHHMM[unique]
        const requestId = `${new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 12)}${Math.random().toString(36).slice(2, 7)}`;
        // 1. Debit User (Atomic Transaction start)
        const result = await prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findUnique({ where: { user_id: userId } });
            if (!wallet || Number(wallet.usdt_balance) < usdt) {
                throw new Error('Insufficient USDT balance');
            }
            // Debit
            await tx.wallet.update({
                where: { user_id: userId },
                data: { usdt_balance: { decrement: new Prisma.Decimal(usdt) } }
            });
            // Create Payment Record (Pending)
            return tx.billPayment.create({
                data: {
                    user_id: userId,
                    bill_id: 0, // In this flow we might not have a recurring 'Bill' record yet
                    amount_ngn: new Prisma.Decimal(payload.amount),
                    amount_usdt: new Prisma.Decimal(usdt),
                    status: 'pending',
                    reference: requestId,
                }
            });
        });
        // Sandbox/Demo Trick for Hackathon
        const recipientPhone = process.env.NODE_ENV !== 'production'
            ? '08011111111'
            : payload.phone;
        try {
            // 2. Call VTpass
            const vtResponse = await axios.post(`${this.VTPASS_BASE_URL}/pay`, {
                request_id: requestId,
                serviceID: payload.serviceID,
                amount: payload.amount,
                phone: recipientPhone,
                billersCode: payload.variation_code ? recipientPhone : undefined, // for data/tv
                variation_code: payload.variation_code,
            }, { headers: this.headers });
            if (vtResponse.data.code === '000') {
                // SUCCESS
                await prisma.billPayment.update({
                    where: { id: result.id },
                    data: { status: 'success' }
                });
                return { success: true, data: vtResponse.data };
            }
            else {
                throw new Error(vtResponse.data.response_description || 'VTpass payment failed');
            }
        }
        catch (error) {
            console.error('Payment failed, triggering refund:', error.message);
            // 3. REFUND
            await prisma.$transaction([
                prisma.wallet.update({
                    where: { user_id: userId },
                    data: { usdt_balance: { increment: new Prisma.Decimal(usdt) } }
                }),
                prisma.billPayment.update({
                    where: { id: result.id },
                    data: { status: 'failed' }
                })
            ]);
            throw error;
        }
    }
}
export default new BillService();
//# sourceMappingURL=billService.js.map