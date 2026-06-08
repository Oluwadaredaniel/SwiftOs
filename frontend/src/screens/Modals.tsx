'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';

import { useEffect, useRef } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { RefreshCw, Timer } from 'lucide-react';

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
          <div className="bg-[var(--tg-secondary-bg-color)] p-3 rounded-lg text-sm border border-[var(--tg-hint-color)]/10">
            <div className="flex justify-between">
              <span className="text-[var(--tg-hint-color)]">Fee:</span>
              <span>₦100</span>
            </div>
            <div className="flex justify-between font-bold mt-1 text-[var(--accent)]">
              <span>Total:</span>
              <span>{formatCurrency(parseInt(amount) + 100, 'NGN')}</span>
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
        <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/20 p-4 rounded-lg">
          <div className="text-xs text-[var(--tg-hint-color)] mb-2 uppercase tracking-wider font-bold">Your Payment Link</div>
          <div className="text-sm font-mono break-all text-[var(--tg-text-color)] bg-[var(--bg-primary)] p-2 rounded">t.me/swiftyos/start?ref=abc123</div>
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
            <label className="text-xs font-display uppercase tracking-widest text-[var(--text-secondary)]">From</label>
            <select 
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full mt-2 p-3 rounded-md bg-[var(--bg-primary)] border border-[var(--bg-tertiary)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            >
              <option>USDT</option>
              <option>NGN</option>
              <option>USD</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-display uppercase tracking-widest text-[var(--text-secondary)]">To</label>
            <div className="w-full mt-2 p-3 rounded-md bg-[var(--bg-primary)] border border-[var(--bg-tertiary)] text-[var(--text-primary)]">
              {fromCurrency === 'NGN' ? 'USDT' : 'NGN'}
            </div>
          </div>
        </div>

        <Input label="Amount" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
        
        {amount && (
          <div className="bg-[var(--bg-tertiary)]/50 p-4 rounded-lg border border-[var(--accent)] border-opacity-10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-[var(--text-secondary)] font-display uppercase">Estimated Output</span>
              <div className={`flex items-center gap-1.5 text-xs font-bold ${timeLeft === 0 ? 'text-[var(--danger)]' : 'text-[var(--accent)]'}`}>
                <Timer size={14} />
                <span>{timeLeft}s</span>
              </div>
            </div>
            <div className="text-xl font-display font-bold text-[var(--text-primary)]">
              ≈ {formatCurrency(parseInt(amount) * (fromCurrency === 'USDT' ? 1450 : 0.00065), fromCurrency === 'USDT' ? 'NGN' : 'USDT')}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] mt-1">1 USDT = ₦1,450.00</div>
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

import { ChevronRight, Smartphone, Tv, Zap as ZapIcon, Globe } from 'lucide-react';

export const AddBillModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { haptic } = useTelegram();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [plan, setPlan] = useState<any>(null);
  const [recipient, setRecipient] = useState('');

  const CATEGORIES = [
    { id: 'data', label: 'Data', icon: Globe },
    { id: 'airtime', label: 'Airtime', icon: Smartphone },
    { id: 'tv', label: 'TV', icon: Tv },
    { id: 'electricity', label: 'Electricity', icon: ZapIcon },
  ];

  const PROVIDERS: Record<string, any[]> = {
    data: [
      { id: 'mtn', name: 'MTN', color: '#FFCC00' },
      { id: 'airtel', name: 'Airtel', color: '#FF0000' },
      { id: 'glo', name: 'Glo', color: '#00FF00' },
      { id: '9mobile', name: '9mobile', color: '#006600' },
    ],
    tv: [
      { id: 'dstv', name: 'DSTV', color: '#0099FF' },
      { id: 'gotv', name: 'GOTV', color: '#FF0000' },
    ],
  };

  const PLANS: Record<string, any[]> = {
    mtn: [
      { id: 'm1', name: '1.5GB Monthly', price: 1200 },
      { id: 'm2', name: '2GB Weekly', price: 600 },
      { id: 'm3', name: '5GB Monthly', price: 1500 },
    ],
    dstv: [
      { id: 'd1', name: 'DSTV Compact', price: 12500 },
      { id: 'd2', name: 'DSTV Premium', price: 29500 },
    ],
  };

  const handleBack = () => {
    haptic('light');
    if (step > 1) setStep(step - 1);
    else onClose();
  };

  const selectCategory = (id: string) => {
    haptic('light');
    setCategory(id);
    setStep(2);
  };

  const selectProvider = (id: string) => {
    haptic('light');
    setProvider(id);
    setStep(3);
  };

  const selectPlan = (item: any) => {
    haptic('light');
    setPlan(item);
    setStep(4);
  };

  const handleFinalize = () => {
    haptic('medium');
    // Implement payment logic
    onClose();
    // Reset state for next time
    setTimeout(() => {
      setStep(1);
      setCategory(null);
      setProvider(null);
      setPlan(null);
    }, 300);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleBack} title={step === 1 ? 'Select Category' : step === 2 ? 'Select Provider' : step === 3 ? 'Select Plan' : 'Enter Details'}>
      <div className="pb-8">
        {step === 1 && (
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => selectCategory(cat.id)}
                className="flex flex-col items-center gap-3 p-5 rounded-lg bg-[var(--bg-primary)] border border-[var(--bg-tertiary)] hover:border-[var(--accent)] transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--accent)]">
                  <cat.icon size={24} />
                </div>
                <span className="text-sm font-display font-bold">{cat.label}</span>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2">
            {(PROVIDERS[category!] || PROVIDERS['data']).map((p) => (
              <button
                key={p.id}
                onClick={() => selectProvider(p.id)}
                className="w-full flex items-center justify-between p-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--bg-tertiary)]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="font-display font-bold">{p.name}</span>
                </div>
                <ChevronRight size={18} className="text-[var(--text-muted)]" />
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-2">
            {(PLANS[provider!] || PLANS['mtn']).map((item) => (
              <button
                key={item.id}
                onClick={() => selectPlan(item)}
                className="w-full flex items-center justify-between p-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--bg-tertiary)]"
              >
                <div>
                  <div className="font-display font-bold text-sm">{item.name}</div>
                  <div className="text-xs text-[var(--accent)] font-display">{formatCurrency(item.price, 'NGN')}</div>
                </div>
                <ChevronRight size={18} className="text-[var(--text-muted)]" />
              </button>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--bg-tertiary)]">
              <div className="text-xs text-[var(--text-secondary)] uppercase mb-1">Summary</div>
              <div className="flex justify-between font-bold">
                <span>{provider?.toUpperCase()} - {plan?.name}</span>
                <span className="text-[var(--accent)]">{formatCurrency(plan?.price, 'NGN')}</span>
              </div>
            </div>

            <Input 
              label={category === 'data' || category === 'airtime' ? 'Phone Number' : 'Account Number'} 
              placeholder="08012345678" 
              value={recipient} 
              onChange={(e) => setRecipient(e.target.value)} 
            />

            <Button size="lg" className="w-full" onClick={handleFinalize} disabled={!recipient}>
              Pay {formatCurrency(plan?.price, 'NGN')}
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
          <div className="bg-[var(--bg-tertiary)]/50 p-4 rounded-lg border border-[var(--accent)] border-opacity-10 text-sm">
            <div className="flex justify-between text-[var(--text-secondary)] mb-1">
              <span>You Send:</span>
              <span>{formatCurrency(parseInt(amount), 'NGN')}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Equivalent (USDT):</span>
              <span className="text-[var(--accent)]">{formatCurrency(parseInt(amount) / 1450, 'USDT')}</span>
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
