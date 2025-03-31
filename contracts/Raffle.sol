// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Raffle {

    error Raffle__NotEnoughETHEntered();
    error Raffle__TransferFailed();
    error Raffle__NotOwner();
    error Raffle__NoPlayersEntered();
    uint private immutable i_entraceAmount;
    
    address payable[] private players;
    address payable private owner;

    // event Withdrawal(uint amount, uint when);

    constructor(uint entraceAmount) payable {
        i_entraceAmount = entraceAmount;
        owner = payable(msg.sender);
    }

    function enterLottory() public payable {
        if (msg.value < i_entraceAmount) {
            revert Raffle__NotEnoughETHEntered();
        }
        players.push(payable(msg.sender));
    }

    function getOwner() public view returns (address) {
        return owner;
    }
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
    function withdraw() public {
        require(msg.sender == owner, "Only the owner can withdraw");
        uint amount = address(this).balance;
        (bool success, ) = owner.call{value: amount}("");
        if (!success) {
            revert Raffle__TransferFailed();
        }
   
        players = new address payable[](0);
        
    }
    function getEntranceAmount() public view returns (uint) {
        return i_entraceAmount;
    }
    
    function getAllPlayers() public view returns (address payable[] memory){
        return players;
    }
    function getPlayersAtIndex(uint index) public view returns (address payable) {
        require(index < players.length, "Index out of bounds");
        return players[index];
    }
}
