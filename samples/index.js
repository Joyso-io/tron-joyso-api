const Joyso = require('../src/joyso');

async function start() {
  const joyso = new Joyso({
    // your private key
    key: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
  });

  await joyso.connect();

  // subscribe order book, notify if change
  joyso.subscribeOrderBook('JOY_TRX', orderBook => {
    console.log(JSON.stringify(orderBook));
  });

  // subscribe market trades, notify if change
  joyso.subscribeTrades('JOY_TRX', trades => {
    console.log(JSON.stringify(trades.slice(0, 5)));
  });

  // subscribe balances, notify if change
  joyso.subscribeBalances(balances => {
    console.log(JSON.stringify(balances));
  });

  // subscribe open orders, notify if change
  joyso.subscribeOrders(orders => {
    console.log(JSON.stringify(orders));
  });

  // subscribe my trades, notify if change
  joyso.subscribeMyTrades(trades => {
    console.log(JSON.stringify(trades));
  });

  // subscribe funds, notify if change
  joyso.subscribeFunds(funds => {
    console.log(JSON.stringify(funds));
  });

  try {
    let order;

    // place buying order
    order = await joyso.buy({
      pair: 'JOY_TRX',
      price: '1.1',
      amount: 1
    });

    // place selling order
    order = await joyso.sell({
      pair: 'JOY_TRX',
      price: '1.2',
      amount: 5
    });

    // or place order by trade with side
    order = await joyso.trade({
      side: 'buy',
      pair: 'JOY_TRX',
      price: '1.05',
      amount: 6,
      feeByJoy: true
    });

    // cancel order
    await joyso.cancel(2);

    // withdraw
    await joyso.withdraw({
      token: 'TRX',
      amount: 10,
      fee: 'trx'
    });

    // get my trades
    const trades = await joyso.getMyTrades({
      quote: 'ETH',
      base: 'JOY',
      side: 'sell',
      from: 1539680000,
      to: 1539679000,
      before: 123,
      limit: 10
    });
  } catch (e) {
    if (e.statusCode === 400) {
      console.log(e.error.error);
    } else {
      throw e;
      console.log(e.message);
    }
  }
}

start();

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection:', reason);
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});
