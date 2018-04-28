var Migrations = artifacts.require("./Migrations.sol");
var InvoiceFactory = artifacts.require("./InvoiceFactory.sol");
var Invoice = artifacts.require("./Invoice.sol");

module.exports = function(deployer) {
  deployer.deploy(InvoiceFactory, {
    gas: "0x2DC6C0",
    gasPrice: "0x165A0BC00"
  });
};
