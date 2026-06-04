# UI_SCREENS.md
## SwiftyOS Screen Designs

---

## Design System

### Colors
```css
--primary: #5B3FD4;        /* Purple (SwiftyEx brand) */
--primary-light: #7C5CE6;
--primary-dark: #4A2FB8;

--success: #0D9E6E;        /* Green */
--danger: #EF4444;         /* Red */
--warning: #F59E0B;        /* Amber */

--dark-bg: #0F172A;        /* Navy (dark mode) */
--dark-surface: #1A202C;
--dark-text: #E5E7EB;
--dark-text-secondary: #9CA3AF;

--light-bg: #F9FAFB;
--light-surface: #FFFFFF;
--light-text: #111827;
```

### Typography
```
Display:  Bebas Neue, system sans-serif (headings, large numbers)
Body:     -apple-system, BlinkMacSystemFont, system sans-serif
Mono:     JetBrains Mono, monospace (amounts, transaction IDs)
```

### Components
- Button: 44px min height (mobile accessible)
- Card: 12px border-radius, subtle shadow
- Modal: Full screen on mobile, center on desktop
- Spacing: 4px baseline grid (4, 8, 12, 16, 24, 32, 48px)

---

## Screen 1: Wallet (Landing/Home)

```
┌─────────────────────────────────────┐
│ 🌙 SwiftyOS              ⚙️           │  ← Status bar
├─────────────────────────────────────┤
│                                     │
│  NGN Wallet: ₦13,400,000            │
│  USD Wallet: $10,000                │
│  USDT Wallet: 10,000 USDT           │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Quick Actions (Icon + Label)       │
│  ┌──────────┐ ┌──────────┐         │
│  │ 📤       │ │ 📥       │         │
│  │  Send    │ │ Receive  │         │
│  └──────────┘ └──────────┘         │
│                                     │
│  ┌──────────┐ ┌──────────┐         │
│  │ 🔄       │ │ 📱       │         │
│  │ Convert  │ │ Bills    │         │
│  └──────────┘ └──────────┘         │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Recent Transactions                │
│                                     │
│  Today                              │
│  ✅ Paid MTN data ₦1,000            │
│  2:30 PM                            │
│                                     │
│  Yesterday                          │
│  ✅ Claimed Swifty Link ₦5,000      │
│  5:15 PM                            │
│  ↳ From @ayo                        │
│                                     │
│  [View All Transactions] →          │
│                                     │
├─────────────────────────────────────┤
│  [Wallet] [Bills] [Links] [Save]    │  ← Tab nav (sticky bottom)
└─────────────────────────────────────┘
```

**States:**
- Loading: Skeleton loader on balance
- Error: "Failed to load balance. Retry?" button
- Empty: "No transactions yet" message

---

## Screen 2: Send Modal

```
┌─────────────────────────────────────┐
│ Send Money                       ✕   │
├─────────────────────────────────────┤
│                                     │
│  Recipient                          │
│  [ @username or telegram link ]     │
│                                     │
│  Amount (NGN)                       │
│  [    50000           ]             │
│  ↓ = ~37.1 USDT                     │
│                                     │
│  Message (optional)                 │
│  [ Lunch payment        ]           │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ Fee: ₦100 + 0.5% (≈₦350)        ││
│  │ Total: ₦50,450                  ││
│  └─────────────────────────────────┘│
│                                     │
│         [Cancel] [Send ₦50,000]     │
│                                     │
└─────────────────────────────────────┘
```

**On "Send":**
```
Confirmation Modal:
┌─────────────────────────────────────┐
│ Confirm Payment                 ✕   │
├─────────────────────────────────────┤
│                                     │
│  To:     @username                  │
│  Amount: ₦50,000 (37.1 USDT)        │
│                                     │
│  [Cancel]  [Confirm & Pay]          │
│                                     │
└─────────────────────────────────────┘

Success Screen:
┌─────────────────────────────────────┐
│                                     │
│        ✅ PAYMENT SENT              │
│                                     │
│  To:      @username                 │
│  Amount:  ₦50,000                   │
│  Fee:     ₦100                      │
│  Time:    2:45 PM                   │
│                                     │
│  New Balance: ₦13.3M                │
│                                     │
│     [Share Link] [Done]             │
│                                     │
└─────────────────────────────────────┘
```

---

## Screen 3: Receive Modal

```
┌─────────────────────────────────────┐
│ Receive Money                   ✕   │
├─────────────────────────────────────┤
│                                     │
│  Your Telegram Username:            │
│  @your_username                     │
│                                     │
│  Amount (optional)                  │
│  [    50000     ] NGN               │
│                                     │
│  Message                            │
│  [ Payment for design work  ]       │
│                                     │
│  Generate Payment Link              │
│  ┌─────────────────────────────────┐│
│  │ t.me/swiftyos/claim?ref=abc123  ││
│  │          [Copy]  [Share]         ││
│  └─────────────────────────────────┘│
│                                     │
│         [Cancel] [Generate Link]    │
│                                     │
└─────────────────────────────────────┘
```

---

## Screen 4: Convert Modal

```
┌─────────────────────────────────────┐
│ Convert                         ✕   │
├─────────────────────────────────────┤
│                                     │
│  From: USDT                         │
│  [  10000        ]                  │
│                                     │
│       ⇅ [Swap]                      │
│                                     │
│  To: NGN                            │
│  [  13480000     ]                  │
│                                     │
│  Live Rate: ₦1,348 / USDT           │
│  Last updated: 2 seconds ago        │
│                                     │
│  Fee: 0% (First convert free)       │
│                                     │
│      [Cancel] [Convert Now]         │
│                                     │
└─────────────────────────────────────┘
```

---

## Screen 5: AutoBills (Bills Screen)

```
┌─────────────────────────────────────┐
│ AutoBills                      ⓘ    │
├─────────────────────────────────────┤
│                                     │
│  Total Monthly: ₦3,200              │
│  (approx ₦80,000 / year)            │
│                                     │
├─────────────────────────────────────┤
│  UPCOMING (This Week)               │
│                                     │
│  📱 MTN Data                        │
│  ₦1,000 | Weekly                    │
│  Due: Today at 12:00 AM             │
│  [Pay Now] [Reschedule]             │
│                                     │
│  📺 DSTV                            │
│  ₦2,000 | Monthly                   │
│  Due: June 10 at 6:00 AM            │
│  [Pay Now] [Reschedule]             │
│                                     │
├─────────────────────────────────────┤
│  PAST PAYMENTS (This Month)         │
│                                     │
│  ✅ Data Top-up (MTN)  ₦1,000       │
│  June 5 • 12:30 AM                  │
│                                     │
│  ✅ DSTV                 ₦3,500     │
│  June 1 • 10:15 AM                  │
│                                     │
├─────────────────────────────────────┤
│  [Wallet] [Bills] [Links] [Save]    │
│               +  [Add Bill]         │
└─────────────────────────────────────┘
```

---

## Screen 6: Add Bill Modal

```
┌─────────────────────────────────────┐
│ Add Recurring Bill              ✕   │
├─────────────────────────────────────┤
│                                     │
│  Bill Type                          │
│  ┌─────────────────────────────────┐│
│  │ Select Provider...          ▼   ││
│  │ • MTN Data                      ││
│  │ • Airtel Airtime                ││
│  │ • DSTV/GOTV                     ││
│  │ • Startimes                     ││
│  │ • Betting Wallet                ││
│  └─────────────────────────────────┘│
│                                     │
│  Amount (NGN)                       │
│  [    1000             ]            │
│  ↓ Costs: ~0.74 USDT / week        │
│                                     │
│  Frequency                          │
│  ┌─────────────────────────────────┐│
│  │ Weekly                      ▼   ││
│  │ • Once                          ││
│  │ • Weekly                        ││
│  │ • Bi-weekly                     ││
│  │ • Monthly                       ││
│  └─────────────────────────────────┘│
│                                     │
│  ⚠️  Auto-Convert Setting           │
│  If USDT insufficient, convert NGN │
│  [Toggle ON]                        │
│                                     │
│    [Cancel] [Create Bill]           │
│                                     │
└─────────────────────────────────────┘
```

**On "Create Bill":**
```
Confirmation:
┌─────────────────────────────────────┐
│ Confirm Bill Creation           ✕   │
├─────────────────────────────────────┤
│                                     │
│  Bill: MTN Data                     │
│  Amount: ₦1,000 / Week              │
│  Cost: ~0.74 USDT per payment       │
│                                     │
│  First payment: Today at 12:00 AM   │
│  Recurring: Every 7 days            │
│                                     │
│   [Cancel] [Create & Confirm]       │
│                                     │
└─────────────────────────────────────┘

Success:
┌─────────────────────────────────────┐
│        ✅ BILL CREATED              │
│                                     │
│  MTN Data scheduled for weekly      │
│  payments of ₦1,000.                │
│                                     │
│  First payment: Today               │
│  Will auto-convert USDT if needed   │
│                                     │
│     [View Upcoming] [Done]          │
│                                     │
└─────────────────────────────────────┘
```

---

## Screen 7: Swifty Links (Links Screen)

```
┌─────────────────────────────────────┐
│ Swifty Links                   ⓘ    │
├─────────────────────────────────────┤
│                                     │
│  ACTIVE LINKS                       │
│                                     │
│  ₦5,000 Link                        │
│  Created: Today, 10:00 AM           │
│  Status: Active (Unclaimed)         │
│  [Copy Link] [Deactivate]           │
│                                     │
│  ₦10,000 Gift Link                  │
│  Created: Yesterday                 │
│  Status: Claimed by @fatima         │
│  [View Details]                     │
│                                     │
├─────────────────────────────────────┤
│  RECENTLY CLAIMED                   │
│                                     │
│  ✅ From @host_user                 │
│  You received: ₦3,000               │
│  June 5 • 2:45 PM                   │
│                                     │
├─────────────────────────────────────┤
│  [Wallet] [Bills] [Links] [Save]    │
│               +  [Create Link]      │
└─────────────────────────────────────┘
```

---

## Screen 8: Create Swifty Link Modal

```
┌─────────────────────────────────────┐
│ Create Swifty Link              ✕   │
├─────────────────────────────────────┤
│                                     │
│  Link Amount (NGN)                  │
│  [    5000             ]            │
│  ↓ Costs: ~3.71 USDT                │
│                                     │
│  Recipient (Optional)               │
│  [ @username                ]       │
│  (Only they can claim)              │
│                                     │
│  Note (Optional)                    │
│  [ For the pizza 🍕       ]         │
│                                     │
│  Expiry                              │
│  [ 24 Hours                 ▼ ]     │
│                                     │
│    [Cancel] [Generate Link]         │
│                                     │
└─────────────────────────────────────┘
```

**On "Generate Link":**
```
Confirmation & Link Generation:
┌─────────────────────────────────────┐
│ Link Generated!                 ✕   │
├─────────────────────────────────────┤
│                                     │
│  Amount: ₦5,000                     │
│  Cost: 3.71 USDT                    │
│                                     │
│  Share this link with your friend:  │
│  ┌─────────────────────────────────┐│
│  │ t.me/SwiftyOS_bot?start=claim_..││
│  │  [Copy Link] [Share to Chat]     ││
│  └─────────────────────────────────┘│
│                                     │
│  Note: Funds are locked until       │
│  claimed or link expires.           │
│                                     │
│       [View Links] [Done]           │
│                                     │
└─────────────────────────────────────┘
```

---

## Screen 9: Claim Link Screen

```
┌─────────────────────────────────────┐
│ Claim Swifty Link               ✕   │
├─────────────────────────────────────┤
│                                     │
│  @host_user sent you                │
│  money!                             │
│                                     │
│  Amount:                            │
│  ₦5,000  (3.71 USDT)                │
│                                     │
│  Note:                              │
│  "For the pizza 🍕"                │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  [Decline]  [Claim Now]             │
│                                     │
│  This link expires in 12 hours.     │
│                                     │
└─────────────────────────────────────┘
```

**On "Claim":**
```
Success:
┌─────────────────────────────────────┐
│        ✅ LINK CLAIMED              │
│                                     │
│  Amount: ₦5,000 from @host_user     │
│  Time: 2:45 PM                      │
│                                     │
│  Your new balance:                  │
│  ₦13.1M / 9,731 USDT                │
│                                     │
│     [View Wallet] [Done]            │
│                                     │
└─────────────────────────────────────┘
```

---

## Screen 10: Savings & Automation (Savings Screen)

```
┌─────────────────────────────────────┐
│ Savings & Rules                ⓘ    │
├─────────────────────────────────────┤
│                                     │
│  TOTAL SAVED                        │
│  ₦245,000  /  181.7 USDT            │
│  ↑ +12% this month                  │
│                                     │
├─────────────────────────────────────┤
│  ACTIVE GOALS                       │
│                                     │
│  💻 New Laptop                      │
│  ₦225,000 / ₦500,000                │
│  [▓▓▓▓▓▓▓░░░░░░] 45%                │
│                                     │
│  🏠 Rent 2027                       │
│  ₦20,000 / ₦1.2M                    │
│  [▓░░░░░░░░░░░░] 2%                 │
│                                     │
├─────────────────────────────────────┤
│  AUTOMATION RULES                   │
│                                     │
│  🔄 Round-up (Bills)        [ON]    │
│  Save change to 'Laptop'            │
│                                     │
│  📅 Weekly Deposit          [ON]    │
│  ₦5,000 to 'Rent 2027'              │
│                                     │
├─────────────────────────────────────┤
│  [Wallet] [Bills] [Links] [Save]    │
│               +  [New Goal]         │
└─────────────────────────────────────┘
```

---

## Screen 11: Transaction History / All Transactions

```
┌─────────────────────────────────────┐
│ Transaction History            ✕    │
├─────────────────────────────────────┤
│                                     │
│  [All] [Sent] [Received] [Bills] [Links] [Save] │  ← Filters
│                                     │
│  Today                              │
│  ✅ Paid MTN Data       -₦1,000     │
│     0.74 USDT spent                 │
│                                     │
│  💰 Auto-Save Round-up   -₦200      │
│     To: 'New Laptop'                │
│                                     │
│  ✅ Swifty Link Claim   +₦5,000     │
│     From @ayo                       │
│                                     │
│  Yesterday                          │
│  ✅ Received from @ayo  +₦1,500     │
│     Movie ticket refund             │
│                                     │
│  ✅ Bill Payment        -₦2,000     │
│     DSTV renewal                    │
│                                     │
│  ✅ Convert             -₦5,000     │
│     Sold 5,000 NGN                  │
│                                     │
│  [Load More...]                     │
│                                     │
└─────────────────────────────────────┘
```

**On transaction tap:**
```
Transaction Details:
┌─────────────────────────────────────┐
│ Transaction Details             ✕   │
├─────────────────────────────────────┤
│                                     │
│  Status: ✅ Confirmed               │
│  Type: Payment (Bill)               │
│  Date: June 5, 2026 12:30 AM        │
│                                     │
│  Amount: ₦1,000 NGN / 0.74 USDT     │
│  Provider: MTN Data                 │
│  Recipient: MTN Network             │
│                                     │
│  Transaction ID:                    │
│  0x7f2a3b8c9d1e2f4a                │
│                                     │
│  Fee: ₦0 (First of month free)      │
│                                     │
│  [Copy TxID] [Share] [Report]       │
│                                     │
└─────────────────────────────────────┘
```

---

## Screen 11: Settings

```
┌─────────────────────────────────────┐
│ Settings                       ⚙️    │
├─────────────────────────────────────┤
│                                     │
│  👤 PROFILE                         │
│  ┌─────────────────────────────────┐│
│  │ @username                       ││
│  │ Telegram ID: 123456789          ││
│  │ Joined: May 2026                ││
│  │ [Edit Profile]                  ││
│  └─────────────────────────────────┘│
│                                     │
│  🔐 SECURITY                        │
│  ┌─────────────────────────────────┐│
│  │ Two-Factor Auth          [OFF]  ││
│  │ Session Timeout          [5min] ││
│  │ Connected Devices        [1]    ││
│  └─────────────────────────────────┘│
│                                     │
│  💳 PAYMENTS                        │
│  ┌─────────────────────────────────┐│
│  │ Default Currency         [NGN]  ││
│  │ Auto-Convert            [ON]   ││
│  │ Transaction Limit       [∞]     ││
│  └─────────────────────────────────┘│
│                                     │
│  📱 NOTIFICATIONS                   │
│  ┌─────────────────────────────────┐│
│  │ Bill Reminders          [ON]   ││
│  │ Payment Alerts          [ON]   ││
│  │ Link Claim Alerts       [ON]   ││
│  └─────────────────────────────────┘│
│                                     │
│  ℹ️  HELP & LEGAL                   │
│  [FAQ] [Support] [Privacy] [Terms]  │
│                                     │
│  [Logout]                           │
│                                     │
└─────────────────────────────────────┘
```

---

## Animation Details

### Entrance Animations
- Screens slide in from bottom (translateY)
- Balance numbers count-up (0 → final value)
- Cards stagger-fade (delay: 0, 100, 200ms)

### Micro-interactions
- Button tap: scale 0.95 + haptic feedback
- Bill paid: checkmark scale-pop animation
- Balance update: color flash (₦ in green for 500ms)
- Split creation: confetti animation (optional)

### Transitions
- Tab changes: fade between screens
- Modal open: backdrop fade-in + slide-up
- Success states: 2-second auto-dismiss, then back to screen

---

## Responsive Behavior
- Full-width on mobile (Telegram default)
- Safe area padding (notch-aware)
- Touch targets: min 44px
- Vertical scrolling only
- No horizontal scroll

---

## Accessibility
- ARIA labels on all buttons
- Focus states on interactive elements
- Color not sole indicator (use icons + text)
- High contrast dark mode (default for Telegram)
- Semantic HTML (button, input, form elements)