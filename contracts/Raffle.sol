// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Raffle {
    error Raffle__NotEnoughETHEntered();
    error Raffle__TransferFailed();
    error Raffle__NotOwner();
    error Raffle__NoPlayersEntered();
    error Raffle__IndexOutOfBounds();
    
    uint256 private immutable i_entranceAmount; 
    address payable[] private players;
    address private immutable owner; 

    constructor(uint256 entranceAmount) payable {
        i_entranceAmount = entranceAmount;
        owner = msg.sender; 
    }

    function enterLottery() external payable { 
        if (msg.value < i_entranceAmount) {
            revert Raffle__NotEnoughETHEntered();
        }
        players.push(payable(msg.sender));
    }

    function withdraw() external {
        if (msg.sender != owner) revert Raffle__NotOwner();
        
        uint256 amount = address(this).balance;
        if (amount == 0) revert Raffle__NoPlayersEntered();
        
       
        delete players; 
        
        (bool success, ) = owner.call{value: amount}("");
        if (!success) revert Raffle__TransferFailed();
    }

    // Getter functions optimized
    function getOwner() external view returns (address) {
        return owner;
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getEntranceAmount() external view returns (uint256) {
        return i_entranceAmount;
    }

    function getPlayerCount() external view returns (uint256) {
        return players.length;
    }

    function getPlayerAtIndex(uint256 index) external view returns (address) {
        if (index >= players.length) revert Raffle__IndexOutOfBounds();
        return players[index];
    }
}