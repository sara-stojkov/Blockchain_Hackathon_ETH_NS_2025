// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

contract BillSplitter {
    struct Bill {
        address payer;          // the original bill payer
        uint256 totalAmount;    // the full bill amount in wei
        uint256 share;          // per person share
        address[] participants; // participants (excluding payer)
        bool settled;
    }

    mapping(uint256 => Bill) public bills;
    uint256 public billIndex;

    // Track balances: how much someone owes to another
    mapping(address => mapping(address => uint256)) public debts;

    event BillCreated(
        uint256 indexed billId,
        address indexed payer,
        uint256 totalAmount,
        uint256 share,
        address[] participants
    );

    error InvalidSplit();
    error InvalidParticipants();
    error AlreadySettled();

    function splitBill(
        uint256 totalAmount,
        uint256 numParticipants,
        address[] calldata participants
    ) external {
        if (numParticipants <= 1) revert InvalidSplit();
        if (participants.length != numParticipants - 1) revert InvalidParticipants();

        uint256 share = totalAmount / numParticipants;

        Bill storage bill = bills[billIndex];
        bill.payer = msg.sender;
        bill.totalAmount = totalAmount;
        bill.share = share;
        bill.participants = participants;
        bill.settled = false;

        // record who owes whom
        for (uint i = 0; i < participants.length; i++) {
            debts[participants[i]][msg.sender] += share;
        }

        emit BillCreated(billIndex, msg.sender, totalAmount, share, participants);

        billIndex++;
    }

    // optionally: a settle function so participants can pay the payer through the contract
    function settleUp(uint256 billId) external payable {
        Bill storage bill = bills[billId];
        if (bill.settled) revert AlreadySettled();

        uint256 owed = debts[msg.sender][bill.payer];
        require(msg.value == owed, "Incorrect amount");

        // transfer to the payer
        payable(bill.payer).transfer(msg.value);

        // clear the debt
        debts[msg.sender][bill.payer] = 0;

        // mark settled if everyone paid
        bool allPaid = true;
        for (uint i = 0; i < bill.participants.length; i++) {
            if (debts[bill.participants[i]][bill.payer] != 0) {
                allPaid = false;
                break;
            }
        }
        if (allPaid) {
            bill.settled = true;
        }
    }
}
