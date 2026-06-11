import vtpassService from '../services/vtpassService.js';
import walletService from '../services/walletService.js';
import rateService from '../services/rateService.js';
import Transaction from '../models/Transaction.js';
import axios from 'axios';

const VTPASS_BASE = process.env.VTPASS_BASE_URL || 'https://sandbox.vtpass.com/api';
const headers = {
  'api-key': process.env.VTPASS_API_KEY,
  'public-key': process.env.VTPASS_PUBLIC_KEY,
};

// Proxy VTpass service list — frontend calls GET /api/bills/providers?category=data
export const getProviders = async (req, res) => {
  try {
    const { category } = req.query;
    const identifier = category || 'data';
    const { data } = await axios.get(`${VTPASS_BASE}/services?identifier=${identifier}`, { headers });
    res.json({ status: 'success', data: data.content || data });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Proxy VTpass variations — frontend calls GET /api/bills/variations?serviceID=mtn-data
export const getVariations = async (req, res) => {
  try {
    const { serviceID } = req.query;
    if (!serviceID) return res.status(400).json({ status: 'error', message: 'serviceID is required' });
    const { data } = await axios.get(`${VTPASS_BASE}/service-variations?serviceID=${serviceID}`, { headers });
    res.json({ status: 'success', data: data.content || data });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// POST /api/bills/pay — payload: { serviceID, amount, phone, variation_code? }
export const payBill = async (req, res) => {
  try {
    const { serviceID, amount, phone, variation_code, billersCode } = req.body;
    if (!serviceID || !amount || !phone) {
      return res.status(400).json({ status: 'error', message: 'serviceID, amount and phone are required' });
    }

    const recipientCode = billersCode || phone;

    // Calculate USDT cost from live rate
    const { usdt: usdtCost, rate } = await rateService.ngnToUsdt(amount);

    const wallet = await walletService.getWallet(req.user._id);
    if (wallet.balances.USDT < usdtCost) {
      return res.status(400).json({ status: 'error', message: `Insufficient USDT. Need ${usdtCost} USDT (rate: ${rate} NGN/USDT)` });
    }

    // Lock funds first
    wallet.balances.USDT -= usdtCost;
    await wallet.save();

    let vtpassResult;
    try {
      vtpassResult = await vtpassService.payDirect({ serviceID, amount, phone, billersCode: recipientCode, variationCode: variation_code });
    } catch (vtpassErr) {
      // Refund on VTpass failure
      wallet.balances.USDT += usdtCost;
      await wallet.save();
      throw vtpassErr;
    }

    await Transaction.create({
      userId: req.user._id,
      type: 'autobill',
      amount: usdtCost,
      currency: 'USDT',
      description: `Bill payment: ${serviceID} — ${amount} NGN`,
      status: 'completed',
    });

    res.json({
      status: 'success',
      data: {
        vtpass: vtpassResult,
        usdtCharged: usdtCost,
        ngnAmount: amount,
        rate,
      },
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const verifyMeter = async (req, res) => {
  try {
    const { provider, meterNumber, variationCode } = req.body;
    const result = await vtpassService.verifyMeter({ provider, meterNumber, variationCode });
    res.json({ status: 'success', data: result });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
