import React from "react";
import Paper from "material-ui/Paper";
import RaisedButton from "material-ui/RaisedButton";
import Web3 from "web3";
import InvoiceFactoryJson from "../../blockchain/InvoiceContract/build/contracts/InvoiceFactory.json";
import InvoiceJson from "../../blockchain/InvoiceContract/build/contracts/Invoice.json";
import request from "request-promise";
import "./invoice.css";

export default class Invoice extends React.Component {
  state = { status: "NONE" };
  constructor() {
    super();
    this.payInvoice = this.payInvoice.bind(this);
    let priceUrl = "https://api.coinmarketcap.com/v1/ticker/ethereum/";
    request(priceUrl)
      .then(resp => JSON.parse(resp))
      .then(([eth]) => eth.price_usd)
      .then(price => this.setState({ usd_rate: price }));
  }
  componentDidMount() {
    if (typeof window.web3 !== "undefined") {
      this.web3 = new Web3(window.web3.currentProvider);
      console.log(this.web3);
      console.log("Using global web3");
    } else {
      // set the provider you want from Web3.providers
      this.web3 = new Web3(
        new Web3.providers.HttpProvider("http://localhost:8545")
      );
      console.log("Using local web3");
    }
    if (this.web3) {
      this.InvoiceFactory = new this.web3.eth.Contract(
        InvoiceFactoryJson.abi,
        "0xbe8bf390882005c7d0a3547d9ab155cdd908a33c"
      );
    }
    this.fetchExchangeRate();
  }

  fetchExchangeRate() {
    let priceUrl = "https://api.coinmarketcap.com/v1/ticker/ethereum/";
    let exchangeRateFetch = setInterval(() => {
      request(priceUrl)
        .then(resp => JSON.parse(resp))
        .then(([eth]) => eth.price_usd)
        .then(price => {
          if (price !== this.state.usd_rate) {
            this.setState({ usd_rate: price });
          }
        });
    }, 10000);
  }

  async payInvoice(amount) {
    let [account] = await this.web3.eth.getAccounts();
    let requiredEth = this.web3.utils.toWei(this.props.eth, "ether");
    let payload = {
      from: account
    };

    if (amount > 0) {
      let value = this.web3.utils.toWei(amount, "ether");
      Object.assign(payload, { value });
    }

    await this.InvoiceFactory.methods
      .make(requiredEth)
      .send(payload)
      .then(tx => {
        console.log("TX", tx);
        let InvoiceAddress = tx.events.InvoiceDeployed.returnValues.invoice;
        this.Invoice = new this.web3.eth.Contract(
          InvoiceJson.abi,
          InvoiceAddress
        );
        this.setState({ status: "WAITING", invoiceAddr: InvoiceAddress });
        this.watchContact(InvoiceAddress);
      })
      .catch(e => {
        console.error(e);
        this.setState({ status: "FAILED" });
      });
  }

  watchContact(address) {
    setTimeout(async () => {
      console.log("Invoice", this.Invoice);
      try {
        let status = await this.Invoice.methods.paid().call();
        if (status) {
          console.log("Invoice paid!", status);
          this.setState({ status: "PAID" });
        } else {
          console.log("Status is", status);
          this.watchContact(address);
        }
      } catch (e) {
        console.error(e);
      }
    }, 5000);
  }

  render() {
    let iconUrl;
    console.log(this.state.status);
    switch (this.state.status) {
      case "PAID":
        iconUrl =
          "https://cdn1.iconfinder.com/data/icons/interface-elements/32/accept-circle-512.png";
        break;
      case "FAILED":
        iconUrl = "https://www.iconsdb.com/icons/preview/red/x-mark-3-xxl.png";
        break;
      default:
        iconUrl =
          "https://www.shareicon.net/download/2016/07/08/117398_eth_512x512.png";
        break;
    }
    const invoiceAddDiv = this.state.invoiceAddr ? (
      <div class="address">{this.state.invoiceAddr}</div>
    ) : (
      <div>Awaiting Invoice...</div>
    );
    let usdCost = this.state.usd_rate
      ? (this.state.usd_rate * this.props.eth).toFixed(2)
      : "Fetching...";
    return (
      <Paper class="invoice">
        <div class="container">
          <img class="icon" src={iconUrl} />
          <div class="bill">
            <div> ETH {this.props.eth}</div>
            <div> USD {usdCost}</div>
          </div>
          <div />
          <div class="invoice-address-container">{invoiceAddDiv}</div>
          <div />
          <div>
            <div class="pay">
              <RaisedButton
                label="Pay Now"
                primary={true}
                onClick={() => this.payInvoice(this.props.eth)}
              />
              <RaisedButton
                label="Pay Address"
                primary={true}
                onClick={this.payInvoice}
              />
            </div>
          </div>
        </div>
      </Paper>
    );
  }
}
