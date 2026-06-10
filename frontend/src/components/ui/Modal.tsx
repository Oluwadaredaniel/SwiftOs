'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  showCloseButton?: boolean;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
}: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#050816]/80 backdrop-blur-md z-40"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
            className="glass-strong fixed bottom-0 left-0 right-0 rounded-t-[42px] z-50 max-h-[92vh] overflow-hidden flex flex-col border-t border-white/10"
          >
            {/* grab handle */}
            <div className="pt-4 pb-2 flex-shrink-0 cursor-grab active:cursor-grabbing" onClick={onClose}>
              <div className="mx-auto h-1.5 w-12 rounded-full bg-white/10" />
            </div>

            <div className="px-7 pb-4 pt-2 flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-display font-extrabold text-[var(--text-primary)] tracking-tight">{title}</h2>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full glass flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all border-white/5"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="px-7 pb-10 overflow-y-auto custom-scrollbar">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
