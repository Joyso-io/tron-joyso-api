# JOYSO on Tron
JOYSO on Tron API client library for trading.

## Installation
You can use this command to install:

    npm install tron-joyso

## Usage
Setup and connect to JOYSO
```JavaScript
const Joyso = require('tron-joyso');

async function start() {
  const joyso = new Joyso({
    // your private key
    key: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
  });

  await joyso.connect();
}

```

### subscribeOrderBook(pair, callback)
Subscribe order book, notify if change.
```JavaScript
const subscription = joyso.subscribeOrderBook('JOY_TRX', orderBook => {
  console.log(JSON.stringify(orderBook));
});
```
Result:
```JSON
{
  "buy":[
    {
      "price":1.23456,
      "amount":"8.5"
    },
    {
      "price":1.23455,
      "amount":"98.5"
    }
  ],
  "sell":[
    {
      "price":1.2346,
      "amount":"100"
    },
    {
      "price":1.2347,
      "amount":"500"
    }
  ]
}
```
* amount is BigNumber object.

### subscribeTrades(pair, callback)
Subscribe market trades, notify if change, return last 100 records.
```JavaScript
const subscription = joyso.subscribeTrades('JOY_TRX', trades => {
  console.log(JSON.stringify(trades.slice(0, 2)));
});
```
Result
```JSON
[
  {
    "id":317,
    "side":"sell",
    "price":1.23456,
    "amount":"2",
    "pair":"JOY_TRX"
  },
  {
    "id":315,
    "side":"buy",
    "price":1.2347,
    "amount":"1",
    "pair":"JOY_TRX"
  }
]
```
* amount is BigNumber object.

### subscribeBalances(callback)
Subscribe balances, notify if change.
```JavaScript
const subscription = joyso.subscribeBalances(balances => {
  console.log(JSON.stringify(balances));
});
```
Result
```JSON
{
  "JOY":{
    "inOrder":"0",
    "available":"4.5"
  },
  "TRX":{
    "inOrder":"144.7757819",
    "available":"97815.997145"
  }
}
```
* inOrder and available are BigNumber objects.

### subscribeOrders(callback)
Subscribe open orders, notify if change.
```JavaScript
const subscription = joyso.subscribeOrders(orders => {
  console.log(JSON.stringify(orders));
});
```
Result
```JSON
[
  {
    "id":353,
    "status":"active",
    "side":"buy",
    "price":12.3481,
    "amount":"1",
    "fill":"0",
    "pair":"T00_TRX"
  },
  {
    "id":326,
    "status":"partial",
    "side":"buy",
    "price":1.23456,
    "amount":"12",
    "fill":"3.5",
    "pair":"JOY_TRX"
  }
]
```
* amount and fill are BigNumber objects.
* status could be `active` or `partial`

### subscribeMyTrades(callback)
Subscribe my trades, notify if change, return last 100 records.
```JavaScript
const subscription = joyso.subscribeMyTrades(trades => {
  console.log(JSON.stringify(trades.slice(0, 2)));
});
```
Result
```JSON
[
  {
    "id":317,
    "status":"done",
    "txHash":"0xcf0aeb815200951559a38650a84f8eefa46411224e5e4076d6313ab47c7f9bb5",
    "side":"sell",
    "price":1.23456,
    "amount":"2",
    "pair":"JOY_TRX",
    "fee":"TRX",
    "gasFee":"0",
    "txFee":"0.002469"
  },
  {
    "id":316,
    "status":"done",
    "txHash":"0x582cc7a84e8aa7e28e44b11e22f24169a34776915ebbc95a88fa0e77c44faf4c",
    "side":"sell",
    "price":1.2347,
    "amount":"1",
    "pair":"JOY_TRX",
    "fee":"TRX",
    "gasFee":"0.000105",
    "txFee":"0.002469"
  }
]
```
* amount, gasFee and txFee are BigNumber objects.

### subscribeFunds(callback)
Subscribe funds, notify if change, return last 100 records.
```JavaScript
const subscription = joyso.subscribeFunds(funds => {
  console.log(JSON.stringify(funds));
});
```
Result
```JSON
[
  {
    "id":192,
    "status":"done",
    "txHash":"0x4dbc49ae4735b1c230244d41377cf6aeccd70c5181df048e3be8306af8a487e6",
    "type":"withdraw",
    "amount":"99",
    "token":"TRX",
    "fee":"TRX",
    "withdrawFee":"0.1",
    "timestamp":1537434044,
    "blockId":null
  },
  {
    "id":191,
    "status":"done",
    "txHash":"0x8435bf9f69dd908373d50353ebab343b625527cd8ea44532eb01c8b0a5642879",
    "type":"withdraw",
    "amount":"1",
    "token":"TRX",
    "fee":"JOY",
    "withdrawFee":"0.809841",
    "timestamp":1537433888,
    "blockId":null
  }
]
```
* amount and withdrawFee are BigNumber objects.
* status could be `pending`, `processing`, `done` or `failed`
* type could be `deposit`, `withdraw` or `transfer`

### buy({ pair, price, amount, feeByJoy })
Place buying order
```JavaScript
try {
  let order = await joyso.buy({
    pair: 'JOY_TRX',
    price: '1.23481',
    amount: 1,
    feeByJoy: true
  });
  console.log(JSON.stringify(order));
} catch (e) {
  if (e.statusCode === 400) {
    console.log(e.error.error);
  } else {
    console.log(e.message);
  }
}
```
Options

|Name|Required|Description|
|---|---|---|
|pair|O|Pair to trade, format is `${base}_${quote}`, eg: JOY_TRX|
|price|O|Order price, minimum is 0.000000001|
|amount|O|Quote amount|
|feeByJoy||Specify how to pay fee. `true` will pay by JOY. `false` will pay by quote token(TRX if pair XXX_TRX). Default is `false`|

Result
```JSON
{
  "id":361,
  "status":"complete",
  "side":"buy",
  "price":1.23481,
  "amount":"1",
  "fill":"1",
  "pair":"JOY_TRX"
}
```
* amount and fill are BigNumber objects.
* status could be `active`, `partial` or `complete`

### sell({ pair, price, amount, feeByJoy })
Place selling order
```JavaScript
let order = await joyso.sell({
  pair: 'JOY_TRX',
  price: '1.23481',
  amount: 100
});
```
Options and result are same with buy.

### trade({ pair, price, amount, feeByJoy, side })
Place order
```JavaScript
let order = await joyso.trade({
  side: 'buy',
  pair: 'JOY_TRX',
  price: '1.23481',
  amount: 100
});
```
Options and result are same with buy. One extra options

|Name|Required|Description|
|---|---|---|
|side|O|`buy` or `sell`|

### withdraw({ token, amount, fee })
Withdraw
```JavaScript
await joyso.withdraw({
  token: 'TRX',
  amount: 10,
  fee: 'trx'
});
```
Options

|Name|Required|Description|
|---|---|---|
|token|O|Token to withdraw|
|amount|O|Amount to withdraw|
|fee|O|Specify how to pay fee. `trx`, `joy` or `token`. `token` can only be used when token is quote token.|

### getMyTrades({ from, to, quote, base, side, before, limit })
Get my trades
```JavaScript
await joyso.getMyTrades({
  quote: 'TRX',
  base: 'JOY',
  side: 'sell',
  from: 1539129600,
  to: 1539216000,
  before: 123,
  limit: 10
});
```
Options

|Name|Required|Description|
|---|---|---|
|quote||Quote token|
|base||Base token|
|side||Specify side. `buy`, `sell` or blank. Blank means both.|
|from||From time (included). Unix timestamp|
|to||To time (excluded). Unix timestamp|
|before||Only return Trade ID before this. (excluded)|
|limit||Specify size of records to return. Default 100, max 1000|

Results are same with subscribeMyTrades.

### disconnect()
Disconnect from JOYSO.

### subscription.unsubscribe()
Unsubscribe
```JavaScript
subscription.unsubscribe();
```


## License
The project is released under the [MIT license](http://www.opensource.org/licenses/MIT).

## Contact
The project's website is located at https://github.com/Joyso-io/tron-joyso-api
