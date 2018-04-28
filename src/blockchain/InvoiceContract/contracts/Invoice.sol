pragma solidity ^0.4.21;
contract Invoice {
  uint public invoiceWei;
  uint public paymentDueBy;
  bool public exceptionState;
  bool public paid;
  address public creator;
  address public user;


  event Paid(uint amount, address payer, uint time);
  event Swept(uint amount, address to);
  event Refunded(uint amount, address to, uint time);

  function Invoice(uint amount, address onBehalfOf) public payable {
    paymentDueBy = now + 15 minutes;
    invoiceWei = amount;
    paid = false;
    exceptionState = false;
    creator = onBehalfOf;
    user = msg.sender;
  }

  modifier isValidPayment(){
    require(now < paymentDueBy);
    require(msg.value == invoiceWei);
    require(exceptionState == false);
    _;
  }

  modifier isPaid() {
    require(paid);
    _;
  }

  modifier isNotPaid() {
    require(!paid);
    _;
  }

  modifier isCreator() {
    require(msg.sender == creator);
    _;
  }

  modifier isUser() {
    require(msg.sender == user);
    _;
  }

  function pay() isValidPayment isNotPaid private {
    paid = true;
    uint amount = address(this).balance;
    emit Paid(amount, msg.sender, now);
  }

  // This function is called when the contract is sent ether
  function () payable public {
    pay();
  }

  function setException() isCreator public {
    exceptionState = true;
  }

  function sweep() isPaid isCreator public {
    sweepTo(creator);
  }

  function sweepTo(address to) isPaid isCreator public {
    uint amount = address(this).balance;
    to.transfer(amount);
    emit Swept(amount, to);
  }

  function refund() isUser isNotPaid public {
    refundTo(user);
  }
  function refundTo(address to) isUser isNotPaid public {
    uint amount = address(this).balance;
    to.transfer(amount);
    emit Refunded(amount, to, now);
  }
}
