'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, Zap, ArrowRightLeft, Users, LayoutGrid } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { autobillsAPI, walletAPI } from '@/lib/api';

const aiAPI = { ask: async (_text: string) => { throw new Error('AI feature removed'); } };
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AIScreenProps {
  onSettingsClick: () => void;
}

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  action?: any;
  actionStatus?: 'pending' | 'done' | 'error';
}

const ACTION_LABELS: Record<string, string> = {
  CREATE_AUTOBILL: 'Schedule Bill',
  CONVERT_CURRENCY: 'Convert Now',
  SEND_MONEY: 'Send Money',
  SPLIT_PAY: 'Split Pay',
};

const ACTION_DESCRIPTIONS: Record<string, (a: any) => string> = {
  CREATE_AUTOBILL: (a) => `Schedule ${a.type} for ${a.provider} — ₦${(a.amount || 0).toLocaleString()} ${a.frequency}`,
  CONVERT_CURRENCY: (a) => `Convert ${a.amount} ${a.from} → ${a.to}`,
  SEND_MONEY: (a) => `Send ₦${(a.amount || 0).toLocaleString()} to ${a.recipient || 'someone'}`,
  SPLIT_PAY: (a) => `Split ₦${(a.amount || 0).toLocaleString()} among ${a.participants || 0} people`,
};

const SUGGESTIONS = [
  'Buy MTN 1GB data every week',
  'Convert 20 USDT to NGN',
  'Split ₦15,000 among 3 people',
  'Recharge Airtel ₦500 monthly',
];

export const AIScreen = ({ onSettingsClick }: AIScreenProps) => {
  const setBalances = useStore((s) => s.setBalances);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: 'assistant',
      text: "Hey! I'm your SwiftyOS AI. Tell me what you want to do in plain English — I'll figure out the action.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [executingId, setExecutingId] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const msgId = useRef(1);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text = input) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: msgId.current++, role: 'user', text: text.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const result = await aiAPI.ask(text.trim()) as any;
      const description = ACTION_DESCRIPTIONS[result.action]?.(result) ?? JSON.stringify(result);
      const assistantMsg: Message = {
        id: msgId.current++,
        role: 'assistant',
        text: description,
        action: result,
        actionStatus: 'pending',
      };
      setMessages((m) => [...m, assistantMsg]);
    } catch (err: any) {
      setMessages((m) => [
        ...m,
        { id: msgId.current++, role: 'assistant', text: err.message || 'Something went wrong. Try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const executeAction = async (msg: Message) => {
    if (!msg.action || executingId !== null) return;
    setExecutingId(msg.id);

    const updateStatus = (status: 'done' | 'error', feedback: string) => {
      setMessages((m) =>
        m.map((x) =>
          x.id === msg.id
            ? { ...x, actionStatus: status }
            : x
        ).concat({ id: msgId.current++, role: 'assistant', text: feedback })
      );
    };

    try {
      const { action } = msg.action;

      if (action === 'CREATE_AUTOBILL') {
        const { type, provider, amount, frequency } = msg.action;
        await autobillsAPI.create({
          type, provider, amount, currency: 'NGN', frequency,
          billersCode: '00000000000', // placeholder — user would need to set real number
        });
        updateStatus('done', `Done! I've scheduled ${provider} ${type} for ₦${amount} ${frequency}. Edit the phone/meter number in Bills → Scheduled.`);
      } else if (action === 'CONVERT_CURRENCY') {
        const { from, to, amount } = msg.action;
        await walletAPI.convert({ from, to, amount });
        const balRes = await walletAPI.getBalance();
        if (balRes.data) setBalances(balRes.data);
        updateStatus('done', `Converted ${amount} ${from} → ${to} successfully! Your balance has been updated.`);
      } else {
        updateStatus('error', `I understood the intent but can't execute "${action}" automatically yet. Try using the relevant screen.`);
      }
    } catch (err: any) {
      updateStatus('error', err.message || 'Action failed. Please try manually.');
    } finally {
      setExecutingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] overflow-hidden">
      <Header onSettingsClick={onSettingsClick} />

      <div className="flex-1 overflow-y-auto pb-4 px-4 pt-2 custom-scrollbar space-y-1">
        {/* Suggestion chips — shown when only the welcome message exists */}
        {messages.length === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-4 space-y-3"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)] px-2">Try saying…</p>
            <div className="flex flex-col gap-2">
              {SUGGESTIONS.map((s, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => send(s)}
                  className="glass text-left px-5 py-3.5 rounded-[20px] text-[13px] font-display font-bold text-[var(--text-secondary)] border-white/5 hover:border-[var(--accent)]/30 hover:text-[var(--text-primary)] transition-all"
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} py-1`}
            >
              <div className={`max-w-[82%] ${msg.role === 'user' ? '' : 'space-y-3'}`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <div className="w-6 h-6 rounded-lg accent-gradient flex items-center justify-center text-black shadow-md">
                      <Bot size={13} />
                    </div>
                    <span className="text-[10px] font-display font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">SwiftyAI</span>
                  </div>
                )}

                <div
                  className={`px-5 py-3.5 rounded-[24px] text-[14px] leading-relaxed font-medium ${
                    msg.role === 'user'
                      ? 'accent-gradient text-black font-bold rounded-tr-[8px]'
                      : 'glass border-white/5 text-[var(--text-primary)] rounded-tl-[8px]'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Action button */}
                {msg.role === 'assistant' && msg.action && msg.actionStatus === 'pending' && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => executeAction(msg)}
                    disabled={executingId !== null}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-[18px] bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)] text-[12px] font-display font-black uppercase tracking-wider hover:bg-[var(--accent)]/25 transition-all disabled:opacity-50"
                  >
                    {executingId === msg.id
                      ? <Loader2 size={14} className="animate-spin" />
                      : <Zap size={14} fill="currentColor" />
                    }
                    {ACTION_LABELS[msg.action.action] || 'Execute'}
                  </motion.button>
                )}
                {msg.role === 'assistant' && msg.actionStatus === 'done' && (
                  <span className="text-[11px] text-[var(--success)] font-display font-black px-1">✓ Done</span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex justify-start py-1 pl-2">
            <div className="glass px-5 py-3.5 rounded-[24px] rounded-tl-[8px] border-white/5">
              <Loader2 size={18} className="animate-spin text-[var(--accent)]" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="px-4 pb-32 pt-3">
        <div className="glass-strong flex items-center gap-3 px-5 py-3 rounded-[28px] border-white/10">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Tell me what to do…"
            className="flex-1 bg-transparent text-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none font-medium"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-[16px] accent-gradient flex items-center justify-center text-black shadow-[0_8px_20px_rgba(0,217,255,0.3)] disabled:opacity-30 disabled:shadow-none flex-shrink-0"
          >
            <Send size={17} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};
