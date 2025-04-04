// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Raffle {
    error Raffle__NotEnoughETHEntered();
    error Raffle__TransferFailed();
    error Raffle__NotOwner();
    error Raffle__NoPlayersEntered();
    error Raffle__IndexOutOfBounds();

    uint256 private immutable i_entranceAmount;
    uint256 private immutable i_lotteryEndTime;
    address payable private s_owner; // Renamed for consistency    npm install --save-dev hardhat-deploy @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers
    address payable[] private s_players;

    constructor(uint256 entranceAmount, uint256 addLotteryTimeInMinutes) payable {
        i_entranceAmount = entranceAmount;
        i_lotteryEndTime = block.timestamp + (addLotteryTimeInMinutes * 60);
        s_owner = payable(msg.sender); // Set owner in constructor
    }

    function enterLottery() external payable {
        if (msg.value < i_entranceAmount) revert Raffle__NotEnoughETHEntered();
        s_players.push(payable(msg.sender));
    }

    function withdraw() external {
        if (msg.sender != s_owner) revert Raffle__NotOwner();
        uint256 amount = address(this).balance;
        if (amount == 0) revert Raffle__NoPlayersEntered();
        
        // Reset players array without the cost of deletion
        delete s_players;

        (bool success, ) = s_owner.call{value: amount}("");
        if (!success) revert Raffle__TransferFailed();
    }

    function getWinner() external returns (address) {
        if (block.timestamp <= i_lotteryEndTime) return address(0);
        if (s_players.length == 0) revert Raffle__NoPlayersEntered();

        uint256 winnerIndex = block.timestamp % s_players.length;
        s_owner = s_players[winnerIndex]; // Update owner with winner
        return s_owner;
    }

    // Optimized getter functions
    function getOwner() external view returns (address) {
        return s_owner;
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getEntranceAmount() external view returns (uint256) {
        return i_entranceAmount;
    }

    function getPlayerCount() external view returns (uint256) {
        return s_players.length;
    }

    function getPlayerAtIndex(uint256 index) external view returns (address) {
        if (index >= s_players.length) revert Raffle__IndexOutOfBounds();
        return s_players[index];
    }
}