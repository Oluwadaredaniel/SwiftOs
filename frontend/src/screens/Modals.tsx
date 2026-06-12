'use client';

import { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { useTelegram } from '@/hooks/useTelegram';
import {
  RefreshCw,
  Timer,
  ChevronRight,
  Smartphone,
  Tv,
  Zap as ZapIcon,
  Globe,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import { billsAPI, walletAPI, linksAPI, savingsAPI, usersAPI } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Send Modal ──────────────────────────────────────────────────────────────

export const SendModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { haptic, tg } = useTelegram();
  const setBalances = useStore((state) => state.setBalances);
  const addTransaction = useStore((state) => state.addTransaction);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setTimeout(() => { setAmount(''); setRecipient(''); setCurrency('NGN'); }, 300);
  };

  const handleSend = async () => {
    haptic('medium');
    setLoading(true);
    try {
      // Look up internal user ID from Telegram username
      const lookup = await usersAPI.lookup(recipient);
      const toUserId = lookup.data.id;

      await walletAPI.transfer({
        toUserId,
        amount: parseFloat(amount),
        currency,
        description: `Sent to @${recipient.replace(/^@/, '')}`,
      });
      const balanceRes = await walletAPI.getBalance();
      if (balanceRes.data) setBalances(balanceRes.data);
      tg?.showPopup?.({ message: `Sent ${formatCurrency(parseFloat(amount), currency as any)} to @${recipient.replace(/^@/, '')}!` });
      onClose();
      reset();
    } catch (err: any) {
      tg?.showPopup?.({ message: err.message || 'Transfer failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Money">
      <div className="space-y-4 pb-8">
        <Input
          label="Recipient"
          placeholder="@telegram_username"
          value={recipient}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecipient(e.target.value)}
        />
        <div>
          <label className="text-[11px] font-display uppercase tracking-[0.18em] text-[var(--text-secondary)]">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full mt-2 p-3 rounded-xl bg-white/[0.04] border border-[var(--glass-border)] text-[var(--text-primary)] backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60"
          >
            <option className="bg-[var(--bg-secondary)]">NGN</option>
            <option className="bg-[var(--bg-secondary)]">USDT</option>
          </select>
        </div>
        <Input
          label={`Amount (${currency})`}
          type="number"
          placeholder="50000"
          value={amount}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
        />
        {amount && (
          <div className="glass p-4 rounded-2xl text-sm">
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Fee:</span>
              <span className="font-mono-num">₦0</span>
            </div>
            <div className="flex justify-between font-bold mt-1 text-[var(--accent)]">
              <span>Total:</span>
              <span className="font-mono-num">{formatCurrency(parseFloat(amount) || 0, currency as any)}</span>
            </div>
          </div>
        )}
        <Button size="lg" className="w-full" onClick={handleSend} disabled={!amount || !recipient || loading}>
          {loading ? <Loader2 className="animate-spin" size={18} /> : `Send ${amount ? formatCurrency(parseFloat(amount), currency as any) : ''}`}
        </Button>
      </div>
    </Modal>
  );
};

// ─── Receive Modal ────────────────────────────────────────────────────────────

export const ReceiveModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { haptic, tg } = useTelegram();
  const user = useStore((state) => state.user);
  const [copied, setCopied] = useState(false);

  const receiveLink = user?.username
    ? `https://t.me/Swiftos_bot/app?startapp=user_${user.username}`
    : `https://t.me/Swiftos_bot/app?startapp=uid_${user?.id}`;

  const handleCopy = async () => {
    haptic('light');
    await navigator.clipboard.writeText(receiveLink).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = receiveLink;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Receive Money">
      <div className="space-y-4 pb-8">
        <div className="glass p-4 rounded-2xl !border-[var(--accent)]/30">
          <div className="text-[11px] text-[var(--text-secondary)] mb-2 uppercase tracking-[0.18em] font-bold">Your Payment Link</div>
          <div className="text-sm font-mono-num break-all text-[var(--text-primary)] bg-black/20 border border-[var(--glass-border)] p-2.5 rounded-xl">
            {receiveLink}
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="w-full mt-3 gap-2"
            onClick={handleCopy}
          >
            {copied ? <Check size={16} className="text-[var(--success)]" /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
        </div>
        <div className="text-[11px] text-[var(--text-muted)] text-center opacity-60">
          Share this link with anyone to receive money into your SwiftyOS wallet.
        </div>
      </div>
    </Modal>
  );
};

// ─── Convert Modal ────────────────────────────────────────────────────────────

export const ConvertModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { haptic, tg } = useTelegram();
  const setBalances = useStore((state) => state.setBalances);
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('USDT');
  const [timeLeft, setTimeLeft] = useState(60);
  const [rate, setRate] = useState(1450);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const toCurrency = fromCurrency === 'NGN' ? 'USDT' : 'NGN';

  const fetchRate = async () => {
    try {
      const res = await walletAPI.getRates();
      if (res.data) {
        setRate(fromCurrency === 'USDT' ? res.data.NGN_USDT : res.data.NGN_USDT);
      }
    } catch {
      // fallback rate already set
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRate();
      startTimer();
    } else {
      stopTimer();
    }
    return () => stopTimer();
  }, [isOpen]);

  useEffect(() => {
    fetchRate();
  }, [fromCurrency]);

  const startTimer = () => {
    setTimeLeft(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleRefresh = () => {
    haptic('light');
    fetchRate();
    startTimer();
  };

  const handleConvert = async () => {
    haptic('medium');
    setLoading(true);
    try {
      await walletAPI.convert({ from: fromCurrency, to: toCurrency, amount: parseFloat(amount) });
      const balanceRes = await walletAPI.getBalance();
      if (balanceRes.data) setBalances(balanceRes.data);
      tg?.showPopup?.({ message: `Converted ${formatCurrency(parseFloat(amount), fromCurrency as any)} successfully!` });
      onClose();
      setTimeout(() => setAmount(''), 300);
    } catch (err: any) {
      tg?.showPopup?.({ message: err.message || 'Conversion failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const estimatedOutput = parseFloat(amount) * (fromCurrency === 'USDT' ? rate : 1 / rate);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Convert Assets">
      <div className="space-y-5 pb-8">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-display uppercase tracking-[0.18em] text-[var(--text-secondary)]">From</label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full mt-2 p-3 rounded-xl bg-white/[0.04] border border-[var(--glass-border)] text-[var(--text-primary)] backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60"
            >
              <option className="bg-[var(--bg-secondary)]">USDT</option>
              <option className="bg-[var(--bg-secondary)]">NGN</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-display uppercase tracking-[0.18em] text-[var(--text-secondary)]">To</label>
            <div className="w-full mt-2 p-3 rounded-xl bg-white/[0.04] border border-[var(--glass-border)] text-[var(--text-primary)] backdrop-blur-md">
              {toCurrency}
            </div>
          </div>
        </div>

        <Input
          label="Amount"
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
        />

        {amount && (
          <div className="glass p-4 rounded-2xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] text-[var(--text-secondary)] font-display uppercase tracking-[0.18em]">Estimated Output</span>
              <div className={`flex items-center gap-1.5 text-xs font-mono-num font-semibold ${timeLeft === 0 ? 'text-[var(--danger)]' : 'text-[var(--accent)]'}`}>
                <Timer size={14} />
                <span>{timeLeft}s</span>
              </div>
            </div>
            <div className="text-xl font-mono-num font-semibold text-gradient">
              ≈ {formatCurrency(estimatedOutput || 0, toCurrency as any)}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] mt-1 font-mono-num">
              1 USDT = ₦{rate.toLocaleString()}
            </div>
          </div>
        )}

        {timeLeft === 0 ? (
          <Button variant="secondary" className="w-full gap-2" onClick={handleRefresh}>
            <RefreshCw size={18} />
            Refresh Rate
          </Button>
        ) : (
          <Button size="lg" className="w-full" onClick={handleConvert} disabled={!amount || loading}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Convert Now'}
          </Button>
        )}
      </div>
    </Modal>
  );
};

// ─── Add Bill Modal ───────────────────────────────────────────────────────────

export const AddBillModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { haptic, tg } = useTelegram();
  const setBalances = useStore((state) => state.setBalances);
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [plan, setPlan] = useState<any>(null);
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [providers, setProviders] = useState<any[]>([]);
  const [variations, setVariations] = useState<any[]>([]);

  const CATEGORIES = [
    { id: 'airtime', label: 'Airtime', icon: Smartphone },
    { id: 'data', label: 'Data', icon: Globe },
    { id: 'tv', label: 'TV', icon: Tv },
    { id: 'electricity', label: 'Electricity', icon: ZapIcon },
  ];

  const handleBack = () => {
    haptic('light');
    if (step > 1) setStep(step - 1);
    else onClose();
  };

  const selectCategory = async (id: string) => {
    haptic('light');
    setCategory(id);
    setLoading(true);
    try {
      const res = await billsAPI.getProviders(id);
      if (res.status === 'success') {
        setProviders(res.data);
        setStep(2);
      }
    } catch {
      tg?.showPopup?.({ message: 'Failed to load providers' });
    } finally {
      setLoading(false);
    }
  };

  const selectProvider = async (p: any) => {
    haptic('light');
    setProvider(p.serviceID);
    setLoading(true);
    try {
      const res = await billsAPI.getVariations(p.serviceID);
      if (res.status === 'success') {
        if (res.data.length === 0) {
          setStep(4);
        } else {
          setVariations(res.data);
          setStep(3);
        }
      }
    } catch {
      tg?.showPopup?.({ message: 'Failed to load variations' });
    } finally {
      setLoading(false);
    }
  };

  const selectPlan = (item: any) => {
    haptic('light');
    setPlan(item);
    setStep(4);
  };

  const handleFinalize = async () => {
    haptic('medium');
    setLoading(true);
    try {
      const finalAmount = category === 'airtime' ? parseInt(amount) : (plan ? plan.variation_amount : 1000);
      const payload = {
        serviceID: provider!,
        amount: finalAmount,
        phone: recipient,
        variation_code: plan?.variation_code,
      };
      const res = await billsAPI.payBill(payload);
      if (res.success) {
        tg?.showPopup?.({ message: 'Payment successful!' });
        const balanceRes = await walletAPI.getBalance();
        if (balanceRes.data) setBalances(balanceRes.data);
        onClose();
        reset();
      }
    } catch (err: any) {
      tg?.showPopup?.({ message: err.message || 'Payment failed' });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setTimeout(() => {
      setStep(1); setCategory(null); setProvider(null);
      setPlan(null); setProviders([]); setVariations([]);
      setRecipient(''); setAmount('');
    }, 300);
  };

  const titles = ['Select Category', 'Select Provider', 'Select Plan', 'Enter Details'];

  return (
    <Modal isOpen={isOpen} onClose={handleBack} title={titles[step - 1]}>
      <div className="pb-8">
        {loading && (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
          </div>
        )}

        {!loading && step === 1 && (
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => selectCategory(cat.id)}
                className="glass flex flex-col items-center gap-3 p-5 rounded-2xl hover:border-[var(--accent)]/50 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl accent-gradient flex items-center justify-center text-[var(--bg-primary)]">
                  <cat.icon size={24} />
                </div>
                <span className="text-sm font-display font-bold">{cat.label}</span>
              </button>
            ))}
          </div>
        )}

        {!loading && step === 2 && (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {providers.map((p) => (
              <button
                key={p.serviceID}
                onClick={() => selectProvider(p)}
                className="glass w-full flex items-center justify-between p-4 rounded-2xl hover:border-[var(--accent)]/40 transition-all"
              >
                <div className="flex items-center gap-3 text-left">
                  <img src={p.image} alt="" className="w-8 h-8 rounded-full bg-white/10" />
                  <span className="font-display font-bold text-sm">{p.name}</span>
                </div>
                <ChevronRight size={18} className="text-[var(--text-muted)]" />
              </button>
            ))}
          </div>
        )}

        {!loading && step === 3 && (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {variations.map((item) => (
              <button
                key={item.variation_code}
                onClick={() => selectPlan(item)}
                className="glass w-full flex items-center justify-between p-4 rounded-2xl hover:border-[var(--accent)]/40 transition-all"
              >
                <div className="text-left">
                  <div className="font-display font-bold text-xs">{item.name}</div>
                  <div className="text-xs text-[var(--accent)] font-mono-num">₦{Number(item.variation_amount).toLocaleString()}</div>
                </div>
                <ChevronRight size={18} className="text-[var(--text-muted)]" />
              </button>
            ))}
          </div>
        )}

        {!loading && step === 4 && (
          <div className="space-y-5">
            <div className="glass p-4 rounded-2xl">
              <div className="text-[11px] text-[var(--text-secondary)] uppercase tracking-[0.25em] mb-1">Summary</div>
              <div className="flex justify-between font-bold">
                <span className="text-sm truncate mr-2">{provider?.toUpperCase()} {plan?.name || category?.toUpperCase()}</span>
                {category !== 'airtime' && (
                  <span className="text-[var(--accent)] font-mono-num">₦{Number(plan?.variation_amount || 1000).toLocaleString()}</span>
                )}
              </div>
            </div>

            {category === 'airtime' && (
              <Input
                label="Amount (NGN)"
                type="number"
                placeholder="1000"
                value={amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
              />
            )}

            <Input
              label={category === 'data' || category === 'airtime' ? 'Phone Number' : 'Account Number'}
              placeholder="08012345678"
              value={recipient}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecipient(e.target.value)}
            />

            <Button
              size="lg"
              className="w-full"
              onClick={handleFinalize}
              disabled={!recipient || (category === 'airtime' && !amount) || loading}
            >
              {loading
                ? <Loader2 className="animate-spin" size={18} />
                : category === 'airtime'
                  ? `Pay ₦${Number(amount || 0).toLocaleString()}`
                  : `Pay ₦${Number(plan?.variation_amount || 1000).toLocaleString()}`
              }
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

// ─── Create Swifty Link Modal ─────────────────────────────────────────────────

export const CreateLinkModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { haptic, tg } = useTelegram();
  const setLinks = useStore((state) => state.setLinks);
  const links = useStore((state) => state.links);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    haptic('medium');
    setLoading(true);
    try {
      const res = await linksAPI.create({
        amount: parseFloat(amount),
        currency: 'NGN',
        note: note || undefined,
      });
      if (res.status === 'success' && res.data) {
        const token = res.data.token || res.data._id;
        setCreatedToken(token);
        // Refresh links list
        const listRes = await linksAPI.list();
        if (listRes.data) setLinks(listRes.data);
      }
    } catch (err: any) {
      tg?.showPopup?.({ message: err.message || 'Failed to create link.' });
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = createdToken
    ? `https://t.me/Swiftos_bot/app?startapp=claim_${createdToken}`
    : '';

  const handleCopy = async () => {
    haptic('light');
    await navigator.clipboard.writeText(shareUrl).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setAmount(''); setNote(''); setCreatedToken(null); setCopied(false); }, 300);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Swifty Link">
      <div className="space-y-5 pb-8">
        {!createdToken ? (
          <>
            <div className="text-sm text-[var(--text-secondary)]">
              Lock funds in escrow. Anyone with the link can claim it instantly.
            </div>

            <Input
              label="Amount (NGN)"
              type="number"
              placeholder="1000"
              value={amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
            />

            <Input
              label="Note (Optional)"
              placeholder="Lunch money"
              value={note}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNote(e.target.value)}
            />

            {amount && (
              <div className="glass p-4 rounded-2xl text-sm">
                <div className="flex justify-between text-[var(--text-secondary)] mb-1">
                  <span>You send:</span>
                  <span className="font-mono-num">{formatCurrency(parseFloat(amount) || 0, 'NGN')}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Equivalent (USDT):</span>
                  <span className="text-[var(--accent)] font-mono-num">
                    {formatCurrency((parseFloat(amount) || 0) / 1450, 'USDT')}
                  </span>
                </div>
              </div>
            )}

            <Button size="lg" className="w-full" onClick={handleCreate} disabled={!amount || loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Generate Link'}
            </Button>
          </>
        ) : (
          <>
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-[24px] accent-gradient flex items-center justify-center mx-auto mb-4 text-black text-3xl shadow-[0_20px_40px_rgba(0,217,255,0.3)]">
                🔗
              </div>
              <p className="text-lg font-display font-black mb-1">Link Created!</p>
              <p className="text-sm text-[var(--text-secondary)]">Share this link to send {formatCurrency(parseFloat(amount), 'NGN')}</p>
            </div>

            <div className="glass p-4 rounded-2xl">
              <div className="text-[11px] text-[var(--text-secondary)] mb-2 uppercase tracking-[0.18em] font-bold">Share Link</div>
              <div className="text-xs font-mono-num break-all text-[var(--text-primary)] bg-black/20 border border-[var(--glass-border)] p-2.5 rounded-xl">
                {shareUrl}
              </div>
            </div>

            <Button size="lg" className="w-full gap-2" onClick={handleCopy}>
              {copied ? <Check size={18} className="text-[var(--success)]" /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>

            <Button variant="secondary" className="w-full" onClick={handleClose}>
              Done
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
};

// ─── Create Savings Goal Modal ────────────────────────────────────────────────

const GOAL_CATEGORIES = ['Electronics', 'Security', 'Business', 'Personal', 'Travel'];

export const CreateSavingsGoalModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { haptic, tg } = useTelegram();
  const setGoals = useStore((state) => state.setGoals);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [category, setCategory] = useState(GOAL_CATEGORIES[0]);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    haptic('medium');
    setLoading(true);
    try {
      await savingsAPI.create({
        name,
        targetAmount: parseFloat(targetAmount),
        category,
        currency: 'USDT',
      });
      const listRes = await savingsAPI.list();
      if (listRes.data) setGoals(listRes.data);
      tg?.showPopup?.({ message: `Goal "${name}" created!` });
      onClose();
      setTimeout(() => { setName(''); setTargetAmount(''); setCategory(GOAL_CATEGORIES[0]); }, 300);
    } catch (err: any) {
      tg?.showPopup?.({ message: err.message || 'Failed to create goal.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Savings Goal">
      <div className="space-y-5 pb-8">
        <Input
          label="Goal Name"
          placeholder="New Laptop"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        />

        <Input
          label="Target Amount (USDT)"
          type="number"
          placeholder="500"
          value={targetAmount}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetAmount(e.target.value)}
        />

        <div>
          <label className="text-[11px] font-display uppercase tracking-[0.18em] text-[var(--text-secondary)]">Category</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {GOAL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-2xl text-xs font-display font-bold transition-all border ${
                  category === cat
                    ? 'accent-gradient text-black border-transparent'
                    : 'glass text-[var(--text-secondary)] border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {targetAmount && (
          <div className="glass p-4 rounded-2xl text-sm">
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Target:</span>
              <span className="font-mono-num text-[var(--accent)]">{formatCurrency(parseFloat(targetAmount) || 0, 'USDT')}</span>
            </div>
          </div>
        )}

        <Button size="lg" className="w-full" onClick={handleCreate} disabled={!name || !targetAmount || loading}>
          {loading ? <Loader2 className="animate-spin" size={18} /> : 'Create Goal'}
        </Button>
      </div>
    </Modal>
  );
};
