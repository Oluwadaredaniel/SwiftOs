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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="glass-strong fixed bottom-0 left-0 right-0 rounded-t-3xl z-50 max-h-[90vh] overflow-y-auto"
          >
            {/* grab handle */}
            <div className="sticky top-0 z-10 pt-3 backdrop-blur-2xl">
              <div className="mx-auto mb-1 h-1.5 w-10 rounded-full bg-white/20" />
              <div className="px-5 pb-3 pt-1 flex items-center justify-between">
                <h2 className="text-lg font-display font-bold text-[var(--text-primary)]">{title}</h2>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl text-[var(--text-secondary)] hover:bg-white/10 hover:text-[var(--text-primary)] transition"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
            <div className="px-5 pb-2">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
