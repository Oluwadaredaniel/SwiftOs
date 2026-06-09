import conversionService from '../src/services/conversionService.js';
import userService from '../src/services/userService.js';
import walletService from '../src/services/walletService.js';

async function verify() {
  console.log('--- Verifying SwiftyOS Core ---');

  // 1. Test Conversion Logic
  const amountNGN = 5000;
  const result = await conversionService.calculateUSDT(amountNGN);
  console.log(`Conversion: ₦${amountNGN} => ${result.usdt} USDT (Rate: ${result.rate}, Buffer: ${result.buffer * 100}%)`);

  if (result.usdt !== 3.79) {
    console.error('❌ Conversion math failed! Expected ~3.79');
  } else {
    console.log('✅ Conversion math correct.');
  }

  // 2. Test User & Wallet Creation
  const mockTelegram = {
    id: Math.floor(Math.random() * 100000000), // Random ID to avoid collision
    username: 'testuser_' + Date.now(),
    first_name: 'Test'
  };

  const user = await userService.getOrCreateUser(mockTelegram);
  if (!user) {
    console.error('❌ User creation returned null!');
    return;
  }
  console.log(`User created: ${user.username} (ID: ${user.id})`);

  if (user.wallet) {
    console.log('✅ Wallet automatically created.');
  } else {
    console.error('❌ Wallet creation failed!');
  }

  // 3. Test Balance Retrieval
  const balances = await walletService.getBalances(user.id);
  console.log('Balances:', balances);

  if (balances.usdt_balance === 0) {
    console.log('✅ Initial balances are zero.');
  }

  // 4. Test Balance Update
  await walletService.updateBalance(user.id, 'usdt', 10.5);
  const updatedBalances = await walletService.getBalances(user.id);
  console.log('Updated Balances:', updatedBalances);

  if (updatedBalances.usdt_balance === 10.5) {
    console.log('✅ Balance increment successful.');
  } else {
    console.error('❌ Balance increment failed!');
  }

  console.log('--- Verification Complete ---');
}

verify().catch(err => {
  console.error(err);
});
