# COMPONENTS.md
## React Component Library

All components built with Radix UI primitives + Tailwind CSS. No external UI libraries (except Radix).

---

## Component Hierarchy
src/components/
├── Layout/
│   ├── MainLayout.tsx       ← App wrapper, tab nav, provider setup
│   ├── ScreenContainer.tsx  ← Page padding, safe area
│   └── TabNav.tsx           ← Bottom sticky tab navigation
├── Wallet/
│   ├── BalanceCard.tsx      ← USDT + NGN display
│   ├── QuickActions.tsx     ← Send, Receive, Convert, Bills buttons
│   └── TransactionList.tsx  ← Recent transactions
├── Bills/
│   ├── BillCard.tsx         ← Individual bill with actions
│   ├── BillForm.tsx         ← Create bill form (provider, amount, frequency)
│   ├── UpcomingBills.tsx    ← Calendar/list view of upcoming
│   └── BillPaymentConfirm.tsx ← Confirmation modal before payment
├── Links/
│   ├── LinkCard.tsx         ← Summary of Swifty Link
│   ├── LinkForm.tsx         ← Create Link form
│   ├── LinkClaimDetails.tsx ← Details of an incoming link claim
│   └── LinkPaymentConfirm.tsx ← Confirm funds lock for link
├── Savings/
│   ├── GoalCard.tsx         ← Progress bar + goal status
│   ├── RuleToggle.tsx       ← Switch for automation rules
│   ├── GoalForm.tsx         ← Create savings goal form
│   └── SavingsHeader.tsx    ← Total saved display
├── Modals/
│   ├── SendModal.tsx        ← Send money form
│   ├── ReceiveModal.tsx     ← Receive link generation
│   ├── ConvertModal.tsx     ← Convert currency
│   ├── CreateLinkModal.tsx  ← Create Swifty Link modal
│   ├── ConfirmModal.tsx     ← Generic confirmation (reusable)
│   ├── SuccessModal.tsx     ← Success animation + message
│   └── ErrorModal.tsx       ← Error display + retry
├── Forms/
│   ├── Input.tsx            ← Text input (Radix)
│   ├── Select.tsx           ← Dropdown (Radix)
│   ├── Textarea.tsx         ← Multi-line input
│   ├── Checkbox.tsx         ← Checkbox (Radix)
│   ├── Toggle.tsx           ← Toggle switch (Radix)
│   └── Form.tsx             ← Form wrapper with validation
├── Common/
│   ├── Button.tsx           ← Primary, secondary, danger variants
│   ├── Badge.tsx            ← Status badges (success, pending, error)
│   ├── Card.tsx             ← Generic card container
│   ├── Alert.tsx            ← Alert/warning message
│   ├── Toast.tsx            ← Notification toast
│   ├── LoadingSpinner.tsx   ← Spinner animation
│   ├── Skeleton.tsx         ← Skeleton loader
│   ├── Dialog.tsx           ← Modal/dialog (Radix)
│   ├── Popover.tsx          ← Popover (Radix)
│   ├── Tabs.tsx             ← Tab group (Radix)
│   ├── Icon.tsx             ← Icon wrapper
│   └── Avatar.tsx           ← User avatar (Radix)
├── Typography/
│   ├── Heading.tsx          ← h1-h6 with consistent sizing
│   ├── Text.tsx             ← Body text
│   ├── Code.tsx             ← Code/mono text
│   └── Label.tsx            ← Form label
└── Utilities/
├── Divider.tsx          ← Horizontal divider
├── Spacer.tsx           ← Vertical spacing
├── Grid.tsx             ← Grid layout
└── Flex.tsx             ← Flex layout

---

## Core Components (Build These First)

### 1. Layout Components

**MainLayout.tsx**
```tsx
export interface MainLayoutProps {
  children: React.ReactNode;
  currentTab: 'wallet' | 'bills' | 'links' | 'savings' | 'history' | 'settings';
  onTabChange: (tab: string) => void;
}

export function MainLayout({
  children,
  currentTab,
  onTabChange,
}: MainLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-dark-bg">
      <div className="flex-1 overflow-y-auto pb-20">
        {children}
      </div>
      <TabNav currentTab={currentTab} onChange={onTabChange} />
    </div>
  );
}
```

**TabNav.tsx**
```tsx
export interface TabNavProps {
  currentTab: string;
  onChange: (tab: string) => void;
}

export function TabNav({ currentTab, onChange }: TabNavProps) {
  const tabs = [
    { id: 'wallet', label: '💼 Wallet', icon: '💼' },
    { id: 'bills', label: '📱 Bills', icon: '📱' },
    { id: 'links', label: '🔗 Links', icon: '🔗' },
    { id: 'savings', label: '💰 Save', icon: '💰' },
    { id: 'history', label: '📋 History', icon: '📋' },
    { id: 'settings', label: '⚙️ Settings', icon: '⚙️' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dark-surface border-t border-dark-text-secondary flex justify-around">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 py-3 text-center ${
            currentTab === tab.id ? 'text-primary border-t-2 border-primary' : 'text-dark-text-secondary'
          }`}
        >
          {tab.icon}
        </button>
      ))}
    </div>
  );
}
```

### 2. Card Components

**Card.tsx**
```tsx
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={`bg-dark-surface rounded-lg p-4 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
```

**BalanceCard.tsx**
```tsx
export interface BalanceCardProps {
  usdtBalance: number;
  ngnEquivalent: number;
  rate: number;
  isLoading?: boolean;
}

export function BalanceCard({
  usdtBalance,
  ngnEquivalent,
  rate,
  isLoading,
}: BalanceCardProps) {
  return (
    <Card className="bg-gradient-to-br from-primary-600 to-primary-800 text-white mb-6">
      <p className="text-sm text-primary-100 mb-2">Spendable Balance</p>
      {isLoading ? (
        <Skeleton className="h-12 w-40 mb-4" />
      ) : (
        <>
          <div className="text-4xl font-display font-bold mb-1">
            ₦{ngnEquivalent.toLocaleString()}
          </div>
          <p className="text-xs text-primary-100">
            {usdtBalance.toLocaleString()} USDT @ ₦{rate}/USDT
          </p>
        </>
      )}
    </Card>
  );
}
```

### 3. Button Components

**Button.tsx**
```tsx
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'bg-dark-surface border border-dark-text-secondary text-dark-text hover:bg-dark-bg',
    danger: 'bg-danger text-white hover:bg-red-600',
    ghost: 'text-primary hover:bg-dark-surface',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`
        rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed
        transition-all active:scale-95
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <LoadingSpinner size="sm" /> : children}
    </button>
  );
}
```

### 4. Modal/Dialog Components

**Dialog.tsx (Radix-based)**
```tsx
import * as RadixDialog from '@radix-ui/react-dialog';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  children,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <RadixDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-dark-surface rounded-lg p-6 w-[90%] max-w-md shadow-lg z-50 max-h-[90vh] overflow-y-auto">
          <RadixDialog.Title className="text-xl font-bold mb-4">{title}</RadixDialog.Title>
          <div className="mb-6">{children}</div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                onCancel?.();
                onOpenChange(false);
              }}
              className="flex-1"
            >
              {cancelText}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                onConfirm?.();
                onOpenChange(false);
              }}
              className="flex-1"
            >
              {confirmText}
            </Button>
          </div>
          <RadixDialog.Close asChild>
            <button className="absolute top-4 right-4 text-dark-text-secondary hover:text-dark-text">
              ✕
            </button>
          </RadixDialog.Close>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
```

### 5. Form Components

**Input.tsx (Radix-based)**
```tsx
import * as RadixForm from '@radix-ui/react-form';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className,
  ...props
}: InputProps) {
  return (
    <div className="mb-4">
      {label && <Label>{label}</Label>}
      <input
        className={`
          w-full px-4 py-2.5 bg-dark-bg border border-dark-text-secondary rounded-lg
          text-dark-text placeholder-dark-text-secondary
          focus:outline-none focus:border-primary
          transition-colors
          ${error ? 'border-danger' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-danger text-sm mt-1">{error}</p>}
      {helperText && <p className="text-dark-text-secondary text-sm mt-1">{helperText}</p>}
    </div>
  );
}
```

**Select.tsx (Radix-based)**
```tsx
import * as RadixSelect from '@radix-ui/react-select';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export function Select({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  error,
}: SelectProps) {
  return (
    <div className="mb-4">
      {label && <Label>{label}</Label>}
      <RadixSelect.Root value={value} onValueChange={onChange}>
        <RadixSelect.Trigger className="w-full px-4 py-2.5 bg-dark-bg border border-dark-text-secondary rounded-lg text-dark-text focus:outline-none focus:border-primary">
          <RadixSelect.Value placeholder={placeholder} />
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <RadixSelect.Content className="bg-dark-surface border border-dark-text-secondary rounded-lg shadow-lg z-50">
            {options.map((option) => (
              <RadixSelect.Item key={option.value} value={option.value} className="px-4 py-2 hover:bg-dark-bg cursor-pointer">
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
      {error && <p className="text-danger text-sm mt-1">{error}</p>}
    </div>
  );
}
```

### 6. List Components

**BillCard.tsx**
```tsx
export interface BillCardProps {
  id: string;
  provider: string;
  amount: number;
  frequency: string;
  nextPayment: string;
  onPay: (id: string) => void;
  onReschedule?: (id: string) => void;
}

export function BillCard({
  id,
  provider,
  amount,
  frequency,
  nextPayment,
  onPay,
  onReschedule,
}: BillCardProps) {
  const providerEmojis: { [key: string]: string } = {
    mtnn_data: '📱',
    airtel_airtime: '📞',
    dstv: '📺',
    gotv: '📺',
    startimes: '📺',
    betting: '🎲',
  };

  return (
    <Card className="mb-3 flex justify-between items-center">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{providerEmojis[provider] || '📦'}</span>
          <h3 className="font-bold text-dark-text capitalize">{provider.replace('_', ' ')}</h3>
        </div>
        <p className="text-sm text-dark-text-secondary">
          ₦{amount.toLocaleString()} • {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
        </p>
        <p className="text-xs text-dark-text-secondary">
          Due: {new Date(nextPayment).toLocaleDateString()}
        </p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => onReschedule?.(id)}>
          ⏰
        </Button>
        <Button size="sm" onClick={() => onPay(id)}>
          Pay
        </Button>
      </div>
    </Card>
  );
}
```

**LinkCard.tsx**
```tsx
export interface LinkCardProps {
  id: string;
  amount: number;
  status: 'active' | 'claimed' | 'expired';
  claimCode: string;
  onCopy: (code: string) => void;
  onDeactivate: (id: string) => void;
}

export function LinkCard({
  id,
  amount,
  status,
  claimCode,
  onCopy,
  onDeactivate,
}: LinkCardProps) {
  return (
    <Card className="mb-3">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-dark-text">₦{amount.toLocaleString()} Link</h3>
        <Badge variant={status === 'active' ? 'success' : 'info'}>
          {status}
        </Badge>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" className="flex-1" onClick={() => onCopy(claimCode)}>
          Copy Link
        </Button>
        {status === 'active' && (
          <Button size="sm" variant="danger" onClick={() => onDeactivate(id)}>
            Deactivate
          </Button>
        )}
      </div>
    </Card>
  );
}
```

### 7. Status/Feedback Components

**Badge.tsx (Radix-based)**
```tsx
export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info';
}

export function Badge({ children, variant = 'info' }: BadgeProps) {
  const variants = {
    success: 'bg-success/20 text-success',
    error: 'bg-danger/20 text-danger',
    warning: 'bg-warning/20 text-warning',
    info: 'bg-primary/20 text-primary',
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}
```

**LoadingSpinner.tsx**
```tsx
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizeClasses[size]} border-4 border-dark-text-secondary border-t-primary rounded-full animate-spin`} />
  );
}
```

**Toast.tsx (Radix-based)**
```tsx
import * as RadixToast from '@radix-ui/react-toast';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(false);
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColors = {
    success: 'bg-success',
    error: 'bg-danger',
    info: 'bg-primary',
  };

  return (
    <RadixToast.Root open={isOpen} onOpenChange={setIsOpen}>
      <RadixToast.Viewport className="fixed bottom-4 right-4 flex flex-col gap-2 z-50 max-w-md" />
      <RadixToast.Provider>
        <div className={`${bgColors[type]} text-white px-4 py-3 rounded-lg shadow-lg`}>
          {message}
        </div>
      </RadixToast.Provider>
    </RadixToast.Root>
  );
}
```

---

## Styling Strategy

All components use Tailwind CSS with these guidelines:

**Color Classes:**
Dark mode (default):

bg-dark-bg: #0F172A
bg-dark-surface: #1A202C
text-dark-text: #E5E7EB
text-dark-text-secondary: #9CA3AF

Accent:

bg-primary: #5B3FD4 (purple)
bg-success: #0D9E6E (green)
bg-danger: #EF4444 (red)


**Typography Classes:**

font-display: Bebas Neue (headlines)
text-base: body text
font-mono: monospace (amounts)


**Spacing Grid:**
4px baseline: px-1, px-2, px-4, px-6, px-8
Vertical: mb-1, mb-2, mb-4, mb-6, mb-8

---

## Component Usage Example

```tsx
import { Button, Card, Input, Dialog, Badge } from '@/components';

export function ExamplePage() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="p-4">
      <Card className="mb-4">
        <h1 className="text-2xl font-bold mb-2">Smart Wallet</h1>
        <p className="text-dark-text-secondary mb-4">Manage your USDT balance</p>
        
        <Input
          label="Amount (NGN)"
          placeholder="50000"
          type="number"
        />
        
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1">Cancel</Button>
          <Button
            onClick={() => setIsOpen(true)}
            className="flex-1"
          >
            Convert
          </Button>
        </div>
      </Card>

      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Confirm Conversion"
      >
        <p className="mb-4">
          Convert ₦50,000 to ~37.1 USDT?
        </p>
        <Badge variant="success">✅ Fee: ₦0</Badge>
      </Dialog>
    </div>
  );
}
```

---

## Radix UI Components Used

We use these Radix primitives (unstyled, we add Tailwind):
- @radix-ui/react-dialog — Modal/Dialog
- @radix-ui/react-select — Dropdown Select
- @radix-ui/react-tabs — Tab Group
- @radix-ui/react-form — Form Structure
- @radix-ui/react-popover — Popover
- @radix-ui/react-toast — Notification Toast
- @radix-ui/react-slot — Component Composition

Install all:
```bash
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-form @radix-ui/react-popover @radix-ui/react-toast @radix-ui/react-slot
```

---

## Building Components: Process

1. **Create component file** in `src/components/`
2. **Define TypeScript interface** for props
3. **Use Radix primitives** where applicable
4. **Style with Tailwind** (no external CSS files)
5. **Export from index.ts** for easy imports
6. **Test in storybook** or in page

See COMPONENTS_CHECKLIST below.

---

## Components Checklist

Build in this order (Day 1-2):

### Layout (must have first)
- [ ] MainLayout
- [ ] TabNav
- [ ] ScreenContainer

### Common (reusable)
- [ ] Button
- [ ] Card
- [ ] Input
- [ ] Select
- [ ] Dialog
- [ ] Badge
- [ ] LoadingSpinner
- [ ] Toast

### Wallet
- [ ] BalanceCard
- [ ] QuickActions
- [ ] TransactionList
- [ ] TransactionItem
- [ ] SendModal
- [ ] ReceiveModal
- [ ] ConvertModal

### Bills
- [ ] BillCard
- [ ] BillForm
- [ ] UpcomingBills
- [ ] BillPaymentConfirm

### Links
- [ ] LinkCard
- [ ] LinkForm
- [ ] LinkClaimDetails
- [ ] LinkPaymentConfirm

### Savings
- [ ] GoalCard
- [ ] RuleToggle
- [ ] GoalForm
- [ ] SavingsHeader

### Typography
- [ ] Heading
- [ ] Text
- [ ] Label
- [ ] Code

### Utilities
- [ ] Divider
- [ ] Spacer
- [ ] Grid
- [ ] Flex

**Total: ~45 components. Build ~6 per day, reuse ruthlessly.**