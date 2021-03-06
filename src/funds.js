const rp = require('request-promise');
const BigNumber = require('bignumber.js');
const _ = require('lodash');

const STATUS = ['pending', 'processing', 'done', 'failed', 'cancelled'];
const TYPE = ['deposit', 'withdraw', 'transfer'];

class Funds {
  constructor(options = {}) {
    this.client = options.client;
    this.address = options.address;
    this.onReceived = (() => {});
    this.funds = [];
    this.requesting = 0;
    this.requestId = 0;
  }

  subscribe() {
    this.cable = this.client.cable.subscriptions.create({
      channel: 'FundsChannel',
      contract: this.client.system.contract.substr(2),
      user: this.address.substr(2)
    }, {
      connected: () => {
        const index = _.findLastIndex(this.funds, fund => {
          return fund.status !== 'done' && fund.status !== 'failed';
        });
        if (index !== -1) {
          this.funds = this.funds.slice(index + 1);
        }
        this.update();
      },
      received: data => {
        switch (data.e) {
          case 'new':
            ++this.requestId;
            this.update();
            break;
          case 'update':
            const fund = this.funds.find(f => f.id === data.data.id);
            if (fund) {
              fund.status = STATUS[data.data.status];
              if (data.data.tx_hash) {
                fund.txHash = `0x${data.data.tx_hash}`;
              }
              this.onReceived(this.funds);
            } else {
              this.update();
            }
            break;
        }
      }
    });
  }

  unsubscribe() {
    clearTimeout(this.retryTimer);
    this.cable.unsubscribe();
    delete this.cable;
    this.balances = {};
  }

  async update() {
    if (this.requesting) {
      return;
    }
    this.requesting = this.requestId;
    clearTimeout(this.retryTimer);
    const after = this.funds.length ? this.funds[0].id : null;
    try {
      const json = await this.get(after);
      const funds = this.convert(json.funds, true);
      if (after) {
        this.funds.unshift(...funds);
      } else {
        this.funds = funds;
      }
      this.onReceived(this.funds);
      if (this.requesting !== this.requestId) {
        this.requesting = 0;
        this.update();
      } else {
        this.requesting = 0;
      }
    } catch (e) {
      console.log(e);
      this.requesting = 0;
      this.retryTimer = setTimeout(() => this.update(), 5000);
    }
  }

  convert(funds) {
    return funds.map(fund => {
      const token = this.client.tokenManager.addressMap[`0x${fund.token}`],
        amount = this.client.tokenManager.toAmount(token, fund.amount);
      let tokenFee, fee;
      if (fund.payment_method === 0) {
        tokenFee = this.client.tokenManager.trx;
        fee = 'TRX';
      } else if (fund.payment_method === 1) {
        tokenFee = this.client.tokenManager.joy;
        fee = 'JOY'
      } else {
        tokenFee = token;
        fee = token.symbol;
      }
      const withdrawFee = this.client.tokenManager.toAmount(tokenFee, fund.fee);
      return {
        id: fund.id,
        status: STATUS[fund.status],
        txHash: fund.tx_hash ? `0x${fund.tx_hash}` : null,
        type: TYPE[fund.type],
        amount: amount,
        token: token.symbol,
        fee: fee,
        withdrawFee: withdrawFee,
        timestamp: fund.timestamp,
        blockId: fund.block_id
      };
    });
  }

  get(after = null) {
    return this.client.request('funds', {
      data: {
        contract: this.client.system.contract.substr(2),
        user: this.address.substr(2),
        after: after
      }
    });
  }
}

module.exports = Funds;
