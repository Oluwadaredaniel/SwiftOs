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

export const Modal = ({ isOpen, onClose, title, children, showCloseButton = true }: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-40"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320, mass: 0.7 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[92vh] overflow-hidden flex flex-col bg-[var(--surface-2)] border-t border-[var(--border-strong)] rounded-t-2xl"
          >
            {/* Handle */}
            <div className="pt-3 pb-1 flex-shrink-0 cursor-pointer" onClick={onClose}>
              <div className="mx-auto h-1 w-10 rounded-full bg-[var(--border-strong)]" />
            </div>

            {/* Header */}
            <div className="px-5 py-3 flex items-center justify-between flex-shrink-0 border-b border-[var(--border)]">
              <h2 className="text-[17px] font-semibold text-[var(--text-primary)]">{title}</h2>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-[var(--surface-3)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="px-5 pb-8 overflow-y-auto custom-scrollbar pt-4">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
