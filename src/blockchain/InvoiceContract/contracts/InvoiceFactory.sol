pragma solidity ^0.4.21;
import "./Invoice.sol";

contract InvoiceFactory {
  address[] public invoices;
  mapping(address => address[]) public userInvoices;
  address public invoice_sweeper;

  event InvoiceDeployed(address invoice, uint time);
  function InvoiceFactory() public {
    invoice_sweeper = msg.sender;
  }

  function make(uint amount) public payable returns(address) {
    address invoice = new Invoice(amount, invoice_sweeper);
    emit InvoiceDeployed(invoice, now);
    if(msg.value > 0 ){
      require(invoice.call.value(msg.value).gas(28000)());
    }
    userInvoices[msg.sender].push(invoice);
    invoices.push(invoice);

    return invoice;
  }
}

