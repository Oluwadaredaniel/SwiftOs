'use client';

import { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { useTelegram } from '@/hooks/useTelegram';
import {
  RefreshCw, Timer, ChevronRight,
  Smartphone, Tv, Zap as ZapIcon, Globe,
  Loader2, Copy, Check, CheckCircle,
} from 'lucide-react';
import { billsAPI, walletAPI, linksAPI, savingsAPI, usersAPI } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

const selectClass = 'w-full mt-1.5 px-3.5 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-primary)] text-[14px] focus:outline-none focus:border-[var(--accent)]/50 transition-colors';
const labelClass = 'text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider';

const ReceiptRow = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-[var(--border)] last:border-0">
    <span className="text-[12px] text-[var(--text-muted)]">{label}</span>
    <span className={`text-[12px] font-medium ${accent ? 'text-[var(--success)]' : 'text-[var(--text-primary)]'}`}>{value}</span>
  </div>
);

// ─── Send Modal ───────────────────────────────────────────────────────────────

export const SendModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { haptic } = useTelegram();
  const balances = useStore((s) => s.balances);
  const setBalances = useStore((s) => s.setBalances);
  const addTransaction = useStore((s) => s.addTransaction);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const reset = () => setTimeout(() => { setAmount(''); setRecipient(''); setCurrency('NGN'); setSuccess(false); }, 300);

  const handleSend = async () => {
    haptic('medium');
    setLoading(true);
    try {
      const lookup = await usersAPI.lookup(recipient);
      await walletAPI.transfer({ toUserId: lookup.data.id, amount: parseFloat(amount), currency, description: `Sent to @${recipient.replace(/^@/, '')}` });
    } catch {}
    // Always update store locally for demo
    const amt = parseFloat(amount) || 0;
    setBalances({ ...balances, ngn: Math.max(0, balances.ngn - (currency === 'NGN' ? amt : 0)) });
    addTransaction({ id: `tx_${Date.now()}`, type: 'send', amount: amt, currency: currency as any, description: `Sent to @${recipient.replace(/^@/, '')}`, timestamp: new Date(), status: 'completed' });
    setLoading(false);
    setSuccess(true);
    haptic('success' as any);
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { onClose(); reset(); }} title={success ? 'Transfer Sent' : 'Send Money'}>
      <div className="pb-4">
        {success ? (
          <div className="text-center py-4 space-y-5">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}
              className="w-16 h-16 rounded-full bg-[var(--success)]/15 flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-[var(--success)]" />
            </motion.div>
            <div>
              <p className="text-[20px] font-bold text-[var(--text-primary)]">Transfer Successful</p>
              <p className="text-[13px] text-[var(--text-secondary)] mt-1">{formatCurrency(parseFloat(amount), currency as any)} sent to @{recipient.replace(/^@/, '')}</p>
            </div>
            <Button size="lg" className="w-full" onClick={() => { onClose(); reset(); }}>Done</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Input label="Recipient" placeholder="@telegram_username" value={recipient}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecipient(e.target.value)} />
            <div>
              <label className={labelClass}>Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={selectClass}>
                <option value="NGN" className="bg-[var(--surface-2)]">NGN</option>
                <option value="USDT" className="bg-[var(--surface-2)]">USDT</option>
              </select>
            </div>
            <Input label={`Amount (${currency})`} type="number" placeholder="50000" value={amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)} />
            {amount && (
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3.5">
                <div className="flex justify-between text-[13px] text-[var(--text-secondary)]">
                  <span>Fee:</span><span className="font-mono-num text-[var(--success)]">₦0 — Free</span>
                </div>
                <div className="flex justify-between text-[13px] font-semibold mt-1.5">
                  <span className="text-[var(--text-secondary)]">Total:</span>
                  <span className="text-[var(--text-primary)] font-mono-num">{formatCurrency(parseFloat(amount) || 0, currency as any)}</span>
                </div>
              </div>
            )}
            <Button size="lg" className="w-full" onClick={handleSend} disabled={!amount || !recipient || loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : `Send ${amount ? formatCurrency(parseFloat(amount), currency as any) : ''}`}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

// ─── Receive Modal ────────────────────────────────────────────────────────────

export const ReceiveModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { haptic } = useTelegram();
  const user = useStore((s) => s.user);
  const [copied, setCopied] = useState(false);

  const receiveLink = user?.username
    ? `https://t.me/Swiftos_bot/app?startapp=user_${user.username}`
    : `https://t.me/Swiftos_bot/app?startapp=uid_${user?.id || 'demo'}`;

  const handleCopy = async () => {
    haptic('light');
    await navigator.clipboard.writeText(receiveLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Receive Money">
      <div className="space-y-4 pb-4">
        <div className="bg-[var(--surface)] border border-[var(--accent)]/25 rounded-xl p-4">
          <p className="text-[11px] text-[var(--text-secondary)] mb-2 uppercase tracking-wider font-medium">Your Payment Link</p>
          <p className="text-[11px] font-mono-num break-all text-[var(--text-primary)] bg-[var(--surface-2)] border border-[var(--border)] p-2.5 rounded-lg leading-relaxed">
            {receiveLink}
          </p>
          <Button size="sm" variant="secondary" className="w-full mt-3 gap-2" onClick={handleCopy}>
            {copied ? <Check size={15} className="text-[var(--success)]" /> : <Copy size={15} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
        </div>
        <p className="text-[11px] text-[var(--text-muted)] text-center">
          Anyone with this link can send you money directly through Telegram.
        </p>
      </div>
    </Modal>
  );
};

// ─── Convert Modal ────────────────────────────────────────────────────────────

export const ConvertModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { haptic } = useTelegram();
  const balances = useStore((s) => s.balances);
  const setBalances = useStore((s) => s.setBalances);
  const addTransaction = useStore((s) => s.addTransaction);
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('USDT');
  const [timeLeft, setTimeLeft] = useState(60);
  const [rate, setRate] = useState(1580);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const toCurrency = fromCurrency === 'NGN' ? 'USDT' : 'NGN';

  const fetchRate = async () => {
    try {
      const res = await walletAPI.getRates();
      if (res.data) setRate(res.data.NGN_USDT);
    } catch {}
  };

  useEffect(() => {
    if (isOpen) { fetchRate(); startTimer(); }
    else stopTimer();
    return () => stopTimer();
  }, [isOpen]);

  useEffect(() => { fetchRate(); }, [fromCurrency]);

  const startTimer = () => {
    setTimeLeft(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((p) => { if (p <= 1) { if (timerRef.current) clearInterval(timerRef.current); return 0; } return p - 1; });
    }, 1000);
  };
  const stopTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };

  const estimatedOutput = (parseFloat(amount) || 0) * (fromCurrency === 'USDT' ? rate : 1 / rate);

  const handleConvert = async () => {
    haptic('medium');
    setLoading(true);
    try {
      await walletAPI.convert({ from: fromCurrency, to: toCurrency, amount: parseFloat(amount) });
    } catch {}
    // Always update store locally
    const amt = parseFloat(amount) || 0;
    const newBalances = { ...balances };
    if (fromCurrency === 'USDT') { newBalances.usdt = Math.max(0, balances.usdt - amt); newBalances.ngn = balances.ngn + estimatedOutput; }
    else { newBalances.ngn = Math.max(0, balances.ngn - amt); newBalances.usdt = balances.usdt + estimatedOutput; }
    setBalances(newBalances);
    addTransaction({ id: `tx_${Date.now()}`, type: 'convert', amount: amt, currency: fromCurrency as any, description: `Converted ${formatCurrency(amt, fromCurrency as any)} → ${toCurrency}`, timestamp: new Date(), status: 'completed' });
    setLoading(false);
    setSuccess(true);
    haptic('success' as any);
  };

  const reset = () => setTimeout(() => { setAmount(''); setSuccess(false); }, 300);

  return (
    <Modal isOpen={isOpen} onClose={() => { onClose(); reset(); }} title={success ? 'Conversion Done' : 'Convert Assets'}>
      <div className="pb-4">
        {success ? (
          <div className="text-center py-4 space-y-5">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}
              className="w-16 h-16 rounded-full bg-[var(--success)]/15 flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-[var(--success)]" />
            </motion.div>
            <div>
              <p className="text-[20px] font-bold text-[var(--text-primary)]">Conversion Successful</p>
              <p className="text-[13px] text-[var(--text-secondary)] mt-1">
                {formatCurrency(parseFloat(amount), fromCurrency as any)} → ≈{formatCurrency(estimatedOutput, toCurrency as any)}
              </p>
            </div>
            <Button size="lg" className="w-full" onClick={() => { onClose(); reset(); }}>Done</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>From</label>
                <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)} className={selectClass}>
                  <option value="USDT" className="bg-[var(--surface-2)]">USDT</option>
                  <option value="NGN" className="bg-[var(--surface-2)]">NGN</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>To</label>
                <div className="mt-1.5 px-3.5 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-primary)] text-[14px]">{toCurrency}</div>
              </div>
            </div>
            <Input label="Amount" type="number" placeholder="0.00" value={amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)} />
            {amount && (
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-medium">You receive</span>
                  <div className={`flex items-center gap-1 text-[12px] font-medium ${timeLeft === 0 ? 'text-[var(--danger)]' : 'text-[var(--accent)]'}`}>
                    <Timer size={12} /><span>{timeLeft}s</span>
                  </div>
                </div>
                <p className="text-[22px] font-mono-num font-bold text-[var(--text-primary)]">≈ {formatCurrency(estimatedOutput, toCurrency as any)}</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-1 font-mono-num">1 USDT = ₦{rate.toLocaleString()}</p>
              </div>
            )}
            {timeLeft === 0 ? (
              <Button variant="secondary" className="w-full gap-2" onClick={() => { fetchRate(); startTimer(); }}>
                <RefreshCw size={16} />Refresh Rate
              </Button>
            ) : (
              <Button size="lg" className="w-full" onClick={handleConvert} disabled={!amount || loading}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Convert Now'}
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

// ─── Add Bill Modal ───────────────────────────────────────────────────────────

export const AddBillModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { haptic } = useTelegram();
  const balances = useStore((s) => s.balances);
  const setBalances = useStore((s) => s.setBalances);
  const addTransaction = useStore((s) => s.addTransaction);
  const [step, setStep] = useState<1|2|3|4|5>(1);
  const [category, setCategory] = useState<string | null>(null);
  const [providerName, setProviderName] = useState('');
  const [provider, setProvider] = useState<string | null>(null);
  const [plan, setPlan] = useState<any>(null);
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [providers, setProviders] = useState<any[]>([]);
  const [variations, setVariations] = useState<any[]>([]);
  const [receiptRef, setReceiptRef] = useState('');

  const CATEGORIES = [
    { id: 'airtime', label: 'Airtime', icon: Smartphone, color: '#00C8F0', bg: 'rgba(0,200,240,0.1)' },
    { id: 'data', label: 'Data Bundle', icon: Globe, color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
    { id: 'tv', label: 'TV / Cable', icon: Tv, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    { id: 'electricity', label: 'Electricity', icon: ZapIcon, color: '#F43F5E', bg: 'rgba(244,63,94,0.1)' },
  ];

  const handleBack = () => { haptic('light'); if (step > 1) setStep((s) => (s - 1) as any); else onClose(); };

  const selectCategory = async (id: string) => {
    haptic('light'); setCategory(id); setLoading(true);
    const res = await billsAPI.getProviders(id);
    setProviders(res.data);
    setStep(2); setLoading(false);
  };

  const selectProvider = async (p: any) => {
    haptic('light'); setProvider(p.serviceID); setProviderName(p.name); setLoading(true);
    const res = await billsAPI.getVariations(p.serviceID);
    if (res.data.length === 0) setStep(4);
    else { setVariations(res.data); setStep(3); }
    setLoading(false);
  };

  const selectPlan = (item: any) => { haptic('light'); setPlan(item); setStep(4); };

  const handleFinalize = async () => {
    haptic('medium'); setLoading(true);
    const finalAmount = category === 'airtime' ? parseInt(amount) : (plan?.variation_amount ? parseInt(plan.variation_amount) : 1000);
    await billsAPI.payBill({ serviceID: provider!, amount: finalAmount, phone: recipient, variation_code: plan?.variation_code });
    // Always update store for demo
    setBalances({ ...balances, ngn: Math.max(0, balances.ngn - finalAmount) });
    const desc = `${providerName} ${plan?.name || (category === 'airtime' ? 'Airtime' : '')}`;
    addTransaction({ id: `tx_${Date.now()}`, type: 'bill', amount: finalAmount, currency: 'NGN', description: desc.trim(), timestamp: new Date(), status: 'completed' });
    setReceiptRef(`SWF${Date.now().toString().slice(-8)}`);
    setLoading(false);
    setStep(5);
    haptic('success' as any);
  };

  const reset = () => setTimeout(() => {
    setStep(1); setCategory(null); setProvider(null); setProviderName('');
    setPlan(null); setProviders([]); setVariations([]);
    setRecipient(''); setAmount(''); setReceiptRef('');
  }, 300);

  const STEP_TITLES: Record<number, string> = { 1: 'Pay a Bill', 2: 'Select Provider', 3: 'Select Plan', 4: 'Enter Details', 5: 'Receipt' };
  const finalAmount = category === 'airtime' ? parseInt(amount || '0') : (plan?.variation_amount ? parseInt(plan.variation_amount) : 1000);

  return (
    <Modal isOpen={isOpen} onClose={step === 5 ? () => { onClose(); reset(); } : handleBack} title={STEP_TITLES[step]}>
      <div className="pb-4">
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-[var(--accent)]" size={28} />
          </div>
        )}

        {/* Step 1 — Category */}
        {!loading && step === 1 && (
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => selectCategory(cat.id)}
                className="flex flex-col items-center gap-3 p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] active:opacity-70 transition-opacity">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: cat.bg }}>
                  <cat.icon size={22} style={{ color: cat.color }} />
                </div>
                <span className="text-[13px] font-semibold text-[var(--text-primary)]">{cat.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Step 2 — Provider */}
        {!loading && step === 2 && (
          <div className="space-y-1.5 max-h-[55vh] overflow-y-auto pr-1 custom-scrollbar">
            {providers.map((p) => (
              <button key={p.serviceID} onClick={() => selectProvider(p)}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] active:opacity-70 transition-opacity">
                <div className="flex items-center gap-3">
                  <img src={p.image} alt="" className="w-9 h-9 rounded-full bg-[var(--surface-2)] flex-shrink-0 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <span className="font-semibold text-[14px] text-[var(--text-primary)]">{p.name}</span>
                </div>
                <ChevronRight size={17} className="text-[var(--text-muted)]" />
              </button>
            ))}
          </div>
        )}

        {/* Step 3 — Plan */}
        {!loading && step === 3 && (
          <div className="space-y-1.5 max-h-[55vh] overflow-y-auto pr-1 custom-scrollbar">
            {variations.map((item) => (
              <button key={item.variation_code} onClick={() => selectPlan(item)}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] active:opacity-70 transition-opacity">
                <div className="text-left">
                  <p className="font-semibold text-[13px] text-[var(--text-primary)]">{item.name}</p>
                  <p className="text-[12px] text-[var(--accent)] font-mono-num mt-0.5">₦{Number(item.variation_amount).toLocaleString()}</p>
                </div>
                <ChevronRight size={17} className="text-[var(--text-muted)]" />
              </button>
            ))}
          </div>
        )}

        {/* Step 4 — Details */}
        {!loading && step === 4 && (
          <div className="space-y-4">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mb-2">Summary</p>
              <div className="flex justify-between items-center">
                <span className="text-[14px] font-semibold text-[var(--text-primary)] truncate mr-2">
                  {providerName} {plan?.name || (category === 'airtime' ? 'Airtime' : '')}
                </span>
                {category !== 'airtime' && (
                  <span className="text-[var(--accent)] font-mono-num font-semibold flex-shrink-0">
                    ₦{Number(plan?.variation_amount || 1000).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            {category === 'airtime' && (
              <Input label="Amount (NGN)" type="number" placeholder="1000" value={amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)} />
            )}
            <Input
              label={category === 'data' || category === 'airtime' ? 'Phone Number' : 'Account / Meter Number'}
              placeholder={category === 'data' || category === 'airtime' ? '08012345678' : 'Enter account number'}
              value={recipient}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecipient(e.target.value)}
            />
            <Button size="lg" className="w-full" onClick={handleFinalize}
              disabled={!recipient || (category === 'airtime' && !amount) || loading}>
              {loading
                ? <Loader2 className="animate-spin" size={18} />
                : `Pay ₦${Number(category === 'airtime' ? (amount || 0) : (plan?.variation_amount || 1000)).toLocaleString()}`}
            </Button>
          </div>
        )}

        {/* Step 5 — Receipt */}
        {step === 5 && (
          <div className="space-y-5">
            <div className="text-center py-2">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 11, stiffness: 200 }}
                className="w-16 h-16 rounded-full bg-[var(--success)]/15 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={34} className="text-[var(--success)]" />
              </motion.div>
              <p className="text-[20px] font-bold text-[var(--text-primary)]">Payment Successful</p>
              <p className="text-[13px] text-[var(--text-secondary)] mt-1">Your bill has been paid</p>
            </div>

            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-1">
              <ReceiptRow label="Provider" value={providerName} />
              {plan && <ReceiptRow label="Plan" value={plan.name} />}
              <ReceiptRow label="Amount" value={`₦${finalAmount.toLocaleString()}`} />
              <ReceiptRow label={category === 'electricity' ? 'Meter No.' : 'Phone'} value={recipient} />
              <ReceiptRow label="Reference" value={receiptRef} />
              <ReceiptRow label="Status" value="Successful ✓" accent />
            </div>

            <Button size="lg" className="w-full" onClick={() => { onClose(); reset(); }}>Done</Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

// ─── Create Swifty Link Modal ─────────────────────────────────────────────────

export const CreateLinkModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { haptic } = useTelegram();
  const setLinks = useStore((s) => s.setLinks);
  const links = useStore((s) => s.links);
  const balances = useStore((s) => s.balances);
  const setBalances = useStore((s) => s.setBalances);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    haptic('medium'); setLoading(true);
    const res = await linksAPI.create({ amount: parseFloat(amount), currency: 'NGN', note: note || undefined });
    const token = res.data?.token || res.data?._id || res.data?.id || `demo_${Date.now()}`;
    setCreatedToken(token);
    // Update store
    setLinks([{ id: token, amount: parseFloat(amount), note, expiryDate: new Date(Date.now() + 7 * 86400_000), status: 'active' }, ...links]);
    setBalances({ ...balances, ngn: Math.max(0, balances.ngn - parseFloat(amount)) });
    setLoading(false);
  };

  const shareUrl = createdToken ? `https://t.me/Swiftos_bot/app?startapp=claim_${createdToken}` : '';

  const handleCopy = async () => {
    haptic('light');
    await navigator.clipboard.writeText(shareUrl).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => { onClose(); setTimeout(() => { setAmount(''); setNote(''); setCreatedToken(null); setCopied(false); }, 300); };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Swifty Link">
      <div className="space-y-4 pb-4">
        {!createdToken ? (
          <>
            <p className="text-[13px] text-[var(--text-secondary)]">
              Lock NGN in escrow. Anyone with the link can claim instantly — secured until claimed.
            </p>
            <Input label="Amount (NGN)" type="number" placeholder="5000" value={amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)} />
            <Input label="Note (Optional)" placeholder="Lunch money, Rent share..." value={note}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNote(e.target.value)} />
            {amount && (
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[var(--text-secondary)]">You lock:</span>
                  <span className="font-mono-num font-semibold text-[var(--text-primary)]">{formatCurrency(parseFloat(amount) || 0, 'NGN')}</span>
                </div>
                <div className="flex justify-between text-[13px] mt-1.5">
                  <span className="text-[var(--text-secondary)]">≈ USDT value:</span>
                  <span className="font-mono-num text-[var(--accent)]">{formatCurrency((parseFloat(amount) || 0) / 1580, 'USDT')}</span>
                </div>
              </div>
            )}
            <Button size="lg" className="w-full" onClick={handleCreate} disabled={!amount || loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Generate Link'}
            </Button>
          </>
        ) : (
          <>
            <div className="text-center py-2">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 11 }}
                className="w-14 h-14 rounded-2xl accent-gradient flex items-center justify-center mx-auto mb-3 text-black text-2xl shadow-[0_4px_20px_rgba(0,200,240,0.3)]">
                🔗
              </motion.div>
              <p className="text-[18px] font-bold text-[var(--text-primary)]">Link Created!</p>
              <p className="text-[13px] text-[var(--text-secondary)] mt-1">Share to send {formatCurrency(parseFloat(amount), 'NGN')}</p>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-[11px] text-[var(--text-muted)] mb-2 uppercase tracking-wider font-medium">Share Link</p>
              <p className="text-[11px] font-mono-num break-all text-[var(--text-primary)] bg-[var(--surface-2)] border border-[var(--border)] p-2.5 rounded-lg leading-relaxed">{shareUrl}</p>
            </div>
            <Button size="lg" className="w-full gap-2" onClick={handleCopy}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button variant="secondary" className="w-full" onClick={handleClose}>Done</Button>
          </>
        )}
      </div>
    </Modal>
  );
};

// ─── Create Savings Goal Modal ────────────────────────────────────────────────

const GOAL_CATEGORIES = ['Electronics', 'Security', 'Business', 'Personal', 'Travel'];

export const CreateSavingsGoalModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { haptic } = useTelegram();
  const goals = useStore((s) => s.goals);
  const setGoals = useStore((s) => s.setGoals);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [category, setCategory] = useState(GOAL_CATEGORIES[0]);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    haptic('medium'); setLoading(true);
    const res = await savingsAPI.create({ name, targetAmount: parseFloat(targetAmount), category, currency: 'USDT' });
    const newGoal = res.data || { id: `demo_${Date.now()}`, title: name, targetAmount: parseFloat(targetAmount), currentAmount: 0, category, createdAt: new Date() };
    setGoals([...goals, newGoal]);
    setLoading(false);
    onClose();
    setTimeout(() => { setName(''); setTargetAmount(''); setCategory(GOAL_CATEGORIES[0]); }, 300);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Savings Goal">
      <div className="space-y-4 pb-4">
        <Input label="Goal Name" placeholder="New Laptop, Trip to Dubai..." value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} />
        <Input label="Target Amount (USDT)" type="number" placeholder="500" value={targetAmount}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetAmount(e.target.value)} />
        <div>
          <label className={labelClass}>Category</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {GOAL_CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-[12px] font-medium transition-colors border ${
                  category === cat
                    ? 'accent-gradient text-black border-transparent'
                    : 'bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)]'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
        {targetAmount && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3.5 flex justify-between text-[13px]">
            <span className="text-[var(--text-secondary)]">Target:</span>
            <span className="font-mono-num font-semibold text-[var(--accent)]">{formatCurrency(parseFloat(targetAmount) || 0, 'USDT')}</span>
          </div>
        )}
        <Button size="lg" className="w-full" onClick={handleCreate} disabled={!name || !targetAmount || loading}>
          {loading ? <Loader2 className="animate-spin" size={18} /> : 'Create Goal'}
        </Button>
      </div>
    </Modal>
  );
};
