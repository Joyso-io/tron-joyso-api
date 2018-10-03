const rp = require('request-promise');

class Account {
  constructor(client, address) {
    this.client = client;
    this.address = address;
    this.advanceReal;
    this.advanceInOrder;
  }

  subscribe() {
    this.cable = this.client.cable.subscriptions.create({
      channel: 'AccountAdvanceChannel',
      contract: this.client.system.contract.substr(2),
      address: this.address.substr(2)
    }, {
      received: data => {
        switch (data.e) {
          case 'update':
            this.updateConfig(data.data);
            break;
        }
      }
    });
  }

  unsubscribe() {
    this.cable.unsubscribe();
    delete this.cable;
  }

  updateConfig(json) {
    this.advanceReal = json.advanceReal;
    this.advanceInOrder = json.advanceInOrder;
  }

  async update() {
    const json = await rp(this.client.createRequest(`accounts/advance?user=${this.address.substr(2)}`));
    this.updateConfig(json);
  }
}

module.exports = Account;
