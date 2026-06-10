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
  Loader2
} from 'lucide-react';
import { billsAPI, walletAPI } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

export const SendModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { haptic } = useTelegram();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');

  const handleSend = () => {
    haptic('medium');
    // Implement send logic
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Money">
      <div className="space-y-4 pb-8">
        <Input label="Recipient" placeholder="@username or Telegram link" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
        <Input label="Amount (NGN)" type="number" placeholder="50000" value={amount} onChange={(e) => setAmount(e.target.value)} />
        {amount && (
          <div className="glass p-4 rounded-2xl text-sm">
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Fee:</span>
              <span className="font-mono-num">₦100</span>
            </div>
            <div className="flex justify-between font-bold mt-1 text-[var(--accent)]">
              <span>Total:</span>
              <span className="font-mono-num">{formatCurrency(parseInt(amount) + 100, 'NGN')}</span>
            </div>
          </div>
        )}
        <Button size="lg" className="w-full" onClick={handleSend} disabled={!amount || !recipient}>
          Send {amount ? formatCurrency(parseInt(amount), 'NGN') : ''}
        </Button>
      </div>
    </Modal>
  );
};

export const ReceiveModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { haptic } = useTelegram();
  const [amount, setAmount] = useState('');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Receive Money">
      <div className="space-y-4 pb-8">
        <Input label="Amount (optional)" type="number" placeholder="50000" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <div className="glass p-4 rounded-2xl !border-[var(--accent)]/30">
          <div className="text-[11px] text-[var(--text-secondary)] mb-2 uppercase tracking-[0.18em] font-bold">Your Payment Link</div>
          <div className="text-sm font-mono-num break-all text-[var(--text-primary)] bg-black/20 border border-[var(--glass-border)] p-2.5 rounded-xl">t.me/swiftyos/start?ref=abc123</div>
          <Button size="sm" variant="secondary" className="w-full mt-3" onClick={() => { haptic('light'); }}>
            Copy Link
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export const ConvertModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { haptic } = useTelegram();
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('USDT');
  const [timeLeft, setTimeLeft] = useState(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      startTimer();
    } else {
      stopTimer();
    }
    return () => stopTimer();
  }, [isOpen]);

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
    startTimer();
  };

  const handleConvert = () => {
    haptic('medium');
    onClose();
  };

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
              <option className="bg-[var(--bg-secondary)]">USD</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-display uppercase tracking-[0.18em] text-[var(--text-secondary)]">To</label>
            <div className="w-full mt-2 p-3 rounded-xl bg-white/[0.04] border border-[var(--glass-border)] text-[var(--text-primary)] backdrop-blur-md">
              {fromCurrency === 'NGN' ? 'USDT' : 'NGN'}
            </div>
          </div>
        </div>

        <Input label="Amount" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
        
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
              ≈ {formatCurrency(parseInt(amount) * (fromCurrency === 'USDT' ? 1450 : 0.00065), fromCurrency === 'USDT' ? 'NGN' : 'USDT')}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] mt-1 font-mono-num">1 USDT = ₦1,450.00</div>
          </div>
        )}

        {timeLeft === 0 ? (
          <Button variant="secondary" className="w-full gap-2" onClick={handleRefresh}>
            <RefreshCw size={18} />
            Refresh Rate
          </Button>
        ) : (
          <Button size="lg" className="w-full" onClick={handleConvert} disabled={!amount}>
            Convert Now
          </Button>
        )}
      </div>
    </Modal>
  );
};

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
    } catch (err) {
      tg?.showPopup({ message: 'Failed to load providers' });
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
        // Airtime doesn't have variations in VTpass, it's just amount
        if (res.data.length === 0) {
          setStep(4); // Skip to details for airtime
        } else {
          setVariations(res.data);
          setStep(3);
        }
      }
    } catch (err) {
      tg?.showPopup({ message: 'Failed to load variations' });
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
        variation_code: plan?.variation_code
      };

      const res = await billsAPI.payBill(payload);
      if (res.success) {
        tg?.showPopup({ message: 'Payment successful!' });
        // Refresh balance
        const balanceRes = await walletAPI.getBalance();
        if (balanceRes.data) setBalances(balanceRes.data);
        onClose();
        reset();
      }
    } catch (err: any) {
      tg?.showPopup({ message: err.message || 'Payment failed' });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setTimeout(() => {
      setStep(1);
      setCategory(null);
      setProvider(null);
      setPlan(null);
      setProviders([]);
      setVariations([]);
    }, 300);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleBack} title={step === 1 ? 'Select Category' : step === 2 ? 'Select Provider' : step === 3 ? 'Select Plan' : 'Enter Details'}>
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
                onChange={(e) => setAmount(e.target.value)}
              />
            )}

            <Input 
              label={category === 'data' || category === 'airtime' ? 'Phone Number' : 'Account Number'} 
              placeholder="08012345678" 
              value={recipient} 
              onChange={(e) => setRecipient(e.target.value)} 
            />

            <Button
              size="lg"
              className="w-full"
              onClick={handleFinalize}
              disabled={!recipient || (category === 'airtime' && !amount)}
            >
              {category === 'airtime' ? `Pay ₦${Number(amount || 0).toLocaleString()}` : `Pay ₦${Number(plan?.variation_amount || 1000).toLocaleString()}`}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export const CreateLinkModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { haptic } = useTelegram();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handleCreate = () => {
    haptic('medium');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Swifty Link">
      <div className="space-y-5 pb-8">
        <div className="text-sm text-[var(--text-secondary)]">
          Create a link to send money to anyone on Telegram. The funds will be locked in escrow until claimed.
        </div>

        <Input label="Amount (NGN)" type="number" placeholder="1000" value={amount} onChange={(e) => setAmount(e.target.value)} />
        
        <Input label="Note (Optional)" placeholder="Lunch money 🍕" value={note} onChange={(e) => setNote(e.target.value)} />

        {amount && (
          <div className="glass p-4 rounded-2xl text-sm">
            <div className="flex justify-between text-[var(--text-secondary)] mb-1">
              <span>You Send:</span>
              <span className="font-mono-num">{formatCurrency(parseInt(amount), 'NGN')}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Equivalent (USDT):</span>
              <span className="text-[var(--accent)] font-mono-num">{formatCurrency(parseInt(amount) / 1450, 'USDT')}</span>
            </div>
          </div>
        )}

        <Button size="lg" className="w-full" onClick={handleCreate} disabled={!amount}>
          Generate Link
        </Button>
      </div>
    </Modal>
  );
};
