'use client';

import { useState } from 'react';
import { AppProvider } from '@/components/providers/AppProvider';
import { WalletScreen } from '@/screens/WalletScreen';
import { BillsScreen } from '@/screens/BillsScreen';
import { LinksScreen } from '@/screens/LinksScreen';
import { SavingsScreen } from '@/screens/SavingsScreen';
import { HistoryScreen } from '@/screens/HistoryScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { AIScreen } from '@/screens/AIScreen';
import { TabNav } from '@/components/layout/TabNav';
import {
  SendModal,
  ReceiveModal,
  ConvertModal,
  AddBillModal,
  CreateLinkModal,
  CreateSavingsGoalModal,
} from '@/screens/Modals';
import { motion, AnimatePresence } from 'framer-motion';

function AppContent() {
  const [activeTab, setActiveTab] = useState('wallet');
  const [showSettings, setShowSettings] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [showCreateLinkModal, setShowCreateLinkModal] = useState(false);
  const [showCreateGoalModal, setShowCreateGoalModal] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setShowSettings(false);
  };

  const renderScreen = () => {
    if (showSettings) {
      return (
        <SettingsScreen onBackClick={() => setShowSettings(false)} />
      );
    }

    switch (activeTab) {
      case 'history':
        return (
          <HistoryScreen
            onSettingsClick={() => setShowSettings(true)}
          />
        );
      case 'ai':
        return (
          <AIScreen
            onSettingsClick={() => setShowSettings(true)}
          />
        );
      case 'wallet':
        return (
          <WalletScreen
            onSendClick={() => setShowSendModal(true)}
            onReceiveClick={() => setShowReceiveModal(true)}
            onConvertClick={() => setShowConvertModal(true)}
            onBillsClick={() => handleTabChange('bills')}
            onSettingsClick={() => setShowSettings(true)}
            onViewAllTransactions={() => handleTabChange('history')}
          />
        );
      case 'bills':
        return (
          <BillsScreen
            onAddBillClick={() => setShowAddBillModal(true)}
            onSettingsClick={() => setShowSettings(true)}
          />
        );
      case 'links':
        return (
          <LinksScreen
            onCreateLinkClick={() => setShowCreateLinkModal(true)}
            onSettingsClick={() => setShowSettings(true)}
          />
        );
      case 'savings':
        return (
          <SavingsScreen
            onNewGoalClick={() => setShowCreateGoalModal(true)}
            onSettingsClick={() => setShowSettings(true)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-transparent">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="flex-1 overflow-hidden"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>

      {!showSettings && <TabNav activeTab={activeTab} onTabChange={handleTabChange} />}

      <SendModal isOpen={showSendModal} onClose={() => setShowSendModal(false)} />
      <ReceiveModal isOpen={showReceiveModal} onClose={() => setShowReceiveModal(false)} />
      <ConvertModal isOpen={showConvertModal} onClose={() => setShowConvertModal(false)} />
      <AddBillModal isOpen={showAddBillModal} onClose={() => setShowAddBillModal(false)} />
      <CreateLinkModal isOpen={showCreateLinkModal} onClose={() => setShowCreateLinkModal(false)} />
      <CreateSavingsGoalModal isOpen={showCreateGoalModal} onClose={() => setShowCreateGoalModal(false)} />
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <div className="h-full">
        <AppContent />
      </div>
    </AppProvider>
  );
}