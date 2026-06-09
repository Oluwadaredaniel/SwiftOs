-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "telegram_id" BIGINT NOT NULL,
    "username" TEXT,
    "first_name" TEXT,
    "photo_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "usdt_balance" DECIMAL NOT NULL DEFAULT 0,
    "usdt_address" TEXT,
    "usd_balance" DECIMAL NOT NULL DEFAULT 0,
    "ngn_balance" DECIMAL NOT NULL DEFAULT 0,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Wallet_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bill" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "amount_ngn" DECIMAL NOT NULL,
    "amount_usdt" DECIMAL NOT NULL,
    "frequency" TEXT NOT NULL,
    "next_payment" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Bill_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BillPayment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "bill_id" INTEGER NOT NULL,
    "amount_ngn" DECIMAL NOT NULL,
    "amount_usdt" DECIMAL NOT NULL,
    "status" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "paid_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BillPayment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BillPayment_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "Bill" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SwiftyLink" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "creator_id" INTEGER NOT NULL,
    "claimer_id" INTEGER,
    "amount_ngn" DECIMAL NOT NULL,
    "amount_usdt" DECIMAL NOT NULL,
    "claim_code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimed_at" DATETIME,
    CONSTRAINT "SwiftyLink_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SwiftyLink_claimer_id_fkey" FOREIGN KEY ("claimer_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SavingsGoal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "target_amount" DECIMAL NOT NULL,
    "saved_amount" DECIMAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavingsGoal_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SavingsRule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "goal_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "value" DECIMAL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "SavingsRule_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "SavingsGoal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_telegram_id_key" ON "User"("telegram_id");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_user_id_key" ON "Wallet"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "BillPayment_reference_key" ON "BillPayment"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "SwiftyLink_claim_code_key" ON "SwiftyLink"("claim_code");
