# SwiftyOS Backend Contract (Frontend Specs)

This document defines the exact data structures the Frontend expects from the Backend API endpoints.

---

## 1. Authentication
**Endpoint:** `POST /auth/telegram`
**Header:** `X-Telegram-Init-Data` (Raw initData from Telegram)
**Expected Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "12345",
    "username": "davedev",
    "first_name": "Dave"
  }
}
```

---

## 2. Wallet & Balances
**Endpoint:** `GET /api/wallet/balances`
**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "ngn": 250500.00,
    "usd": 120.50,
    "usdt": 45.50,
    "usdt_address": "0x71C765...d897",
    "rates": {
      "usdt_ngn": 1450.00,
      "usd_ngn": 1400.00
    }
  }
}
```

---

## 3. Transactions
**Endpoint:** `GET /api/transactions/list?limit=10`
**Expected Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "tx_001",
      "type": "bill",
      "amount": 5000,
      "currency": "NGN",
      "description": "MTN Data Purchase",
      "timestamp": "2023-10-27T10:30:00Z",
      "status": "completed"
    },
    {
      "id": "tx_002",
      "type": "convert",
      "amount": 10.5,
      "currency": "USDT",
      "description": "Converted USDT to NGN",
      "timestamp": "2023-10-26T15:20:00Z",
      "status": "completed"
    }
  ]
}
```
**Types:** `bill` | `convert` | `link` | `send` | `receive` | `save`

---

## 4. Bill Payments (VTPass Proxy)
**Providers:** `GET /api/bills/providers?category=data`
**Variations:** `GET /api/bills/variations?serviceID=mtn-data`
**Payment:** `POST /api/bills/pay`
**Payload:**
```json
{
  "serviceID": "mtn-data",
  "amount": 1000,
  "phone": "08011111111",
  "variation_code": "mtn-100mb-1000"
}
```

---

## 5. Swifty Links (Escrow)
**Endpoint:** `GET /api/links/list`
**Expected Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "link_abc123",
      "amount": 5000,
      "expiryDate": "2023-11-27T10:30:00Z",
      "status": "active",
      "note": "Lunch money",
      "creator": "davedev"
    }
  ]
}
```

---

## 6. Savings Goals
**Endpoint:** `GET /api/savings/list`
**Expected Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "goal_001",
      "title": "New Laptop",
      "targetAmount": 850,
      "currentAmount": 425,
      "category": "Electronics",
      "createdAt": "2023-09-01T00:00:00Z"
    }
  ]
}
```
**Categories:** `Electronics` | `Security` | `Business` | `Personal` | `Travel`
