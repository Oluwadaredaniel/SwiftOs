# FRONTEND_INSTRUCTIONS.md
## For the Frontend Developer

Your goal is to build a premium, "Telegram-native" financial interface. It should feel like a high-end fintech app (like Kuda or Revolut) but living inside Telegram.

---

## 1. Project Setup & Global State
- **Framework:** Next.js (App Router).
- **Styling:** Tailwind CSS + Framer Motion.
- **State Management:** Zustand (`src/store/useStore.ts`).
- **Telegram SDK:** Initialize `@telegram-apps/sdk` in `_app.tsx` or a high-level provider. 
- **Theming:** Use CSS variables for colors to support Telegram's light/dark modes automatically.

---

## 2. Core Logic Blueprints

### A. Telegram SDK Integration (`src/hooks/useTelegram.ts`)
```ts
export const useTelegram = () => {
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
  
  useEffect(() => {
    tg?.ready();
    tg?.expand();
    // Sync theme colors with Telegram
    document.documentElement.style.setProperty('--tg-bg', tg?.backgroundColor || '#fff');
  }, []);

  return {
    tg,
    user: tg?.initDataUnsafe?.user,
    initData: tg?.initData,
    haptic: (type: 'light' | 'medium' | 'heavy' = 'light') => 
      tg?.HapticFeedback.impactOccurred(type),
  };
};
```

### B. Global State Management (`src/store/useStore.ts`)
Use Zustand to track multi-currency balances across the app.
```ts
interface AppState {
  balances: { ngn: number; usd: number; usdt: number };
  setBalances: (newBalances: any) => void;
  transactions: any[];
  addTransaction: (tx: any) => void;
}
```

### C. The 60s Rate Lock Logic
When a user opens a payment/convert modal:
1.  **Mount:** Fetch latest rates from `/api/wallet/rates`.
2.  **State:** Set a `timer` state to 60.
3.  **Effect:** `setInterval` to decrement every second.
4.  **UI:** If `timer === 0`, disable the [Confirm] button and show a [Refresh Rate] button.

---

## 3. Screen-by-Screen Breakdown

### Screen 1: Smart Wallet (The Dashboard)
- **Header:** Telegram User Avatar + "SwiftyOS" logo + Settings icon.
- **Balances Section:** 
  - Show 3 distinct horizontal cards or a swipeable carousel:
    - **Naira Wallet:** Large NGN balance.
    - **Dollar Wallet:** Virtual USD balance.
    - **USDT Wallet:** Crypto USDT balance. 
      - *State:* If `usdt_address` is null, show a [Generate Address] button.
      - *State:* If address exists, show balance + QR code icon to view address.
- **Quick Actions Grid:** 4 prominent buttons in `src/components/Wallet/QuickActions.tsx`: [Send], [Receive], [Convert], [Bills].
- **Transaction Preview:** Show the 3 most recent transactions using `src/components/Wallet/TransactionItem.tsx`.
- **APIs:** 
  - `GET /api/wallet/balance`
  - `GET /api/wallet/transactions?limit=3`

### Screen 2: AutoBills (Utility Layer)
- **Main View:** 
  - "Upcoming Bills" section with horizontal scrolling or a vertical list.
  - "Past Payments" section.
  - Floating Action Button (+) for "Add New Bill".
- **Add Bill Flow (Multi-step Modal or Page):**
  1. **Select Category:** Icons for Data, Airtime, TV (DSTV, GOTV, Startimes).
  2. **Select Provider:** Network logos (MTN, Airtel, etc.) fetched via `GET /api/bills/providers`.
  3. **Select Plan:** List of available variations fetched via `GET /api/bills/variations`. (Note: Capture the `variation_code` for the final payload).
  4. **Recipient Input:** Input phone number (used as `billersCode` for Data or `phone` for Airtime). 
      - *UX Tip:* Use `08011111111` as the placeholder to guide users towards a successful sandbox test.
- **Rate Lock Modal:** 
  - Show the final NGN amount and the exact USDT cost.
  - **The Timer:** A circular progress bar or countdown from 60s.
  - **Button:** "Confirm & Pay" (only active while timer > 0).
- **Receipt Screen (Post-Payment):**
  - Triggered after successful API response.
  - Display: "Payment Successful", Amount (NGN & USDT), Recipient, Transaction ID, and Date.
  - **Action:** "Share Receipt" button using `tg.shareUrl` to send the receipt details to a chat.

### Screen 3: Swifty Links (Social Payments)
- **Main View:** 
  - List of "Created Links" showing status (Active, Claimed, Expired).
  - "Generate Link" button at the top.
- **Generation Form:** 
  - Input for NGN amount.
  - Input for Optional Recipient @username.
  - "Create" button -> Shows a success screen with a "Copy Link" and "Share to Chat" button.
- **APIs:** `POST /api/links/create`, `GET /api/links/list`.

### Screen 4: Savings & Automation (Wealth Building)
- **Header:** "Total Saved" card showing total USDT in savings.
- **Goal Cards:** 
  - Show Title, Target Amount, and a **Progress Bar**.
  - Example: "Laptop: 45% saved".
- **Goal Creation:** Modal with Title input and Target NGN input.
- **Automation Section:** 
  - Toggle switches for "Round-ups" and "Weekly Savings".
  - Small description text: "Saves the change from your bill payments automatically."
- **APIs:** `GET /api/savings/list`, `POST /api/savings/create`.

### Screen 5: History (The Ledger)
- **UI:** A clean, scrollable list grouped by date (Today, Yesterday, Last Week).
- **Filters:** A horizontal pill-style filter bar: [All], [Bills], [Links], [Savings].
- **Transaction Detail:** Tapping an item opens a drawer/modal with:
  - Reference ID (Mono font).
  - Exact Time/Date. 
  - Exchange Rate used at that time.
  - "Download Receipt" button (UI only).

### Screen 6: Settings
- **Profile:** Show Telegram Name, ID, and Username.
- **Security:** Toggles for "Biometric Lock" (if supported) and "Transaction Pin".
- **Preferences:** "Default Currency" (NGN/USDT), "Notification Toggles".
- **Support:** "Report a Problem" and "FAQ" links.

---

## 3. UI/UX Rules for the Hackathon
1. **No Jargon:** Don't say "Gas fees" or "Hash". Say "Network fee" or "Transaction ID".
2. **Speed:** Use skeleton loaders for balances so the app feels instant.
3. **Animations:** Use `AnimatePresence` from Framer Motion for modal transitions and tab switching.
4. **Haptics:** Call `tg.HapticFeedback.impactOccurred('light')` on every button press.

---

## 4. References
- **Exact Designs:** `UI_SCREENS.md`
- **Logic & Math:** `IMPLEMENTATION_LOGIC.md`
- **Backend Spec:** `ARCHITECTURE.md`
