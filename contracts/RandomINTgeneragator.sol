// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

contract RandomINTgeneragator is VRFConsumerBaseV2 {
    VRFCoordinatorV2Interface private coordinator;

    bytes32 private keyHash;
    uint64 private subId;
    uint32 private gasLimit;

    uint256 public randomInRange;

    constructor(
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint64 _subscriptionId,
        uint32 _callbackGasLimit
    ) VRFConsumerBaseV2(_vrfCoordinator) {
        coordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        keyHash = _keyHash;
        subId = _subscriptionId;
        gasLimit = _callbackGasLimit;
    }

    uint256 private maxRange;

    function createRandomNumber(uint256 max) external {
        maxRange = max;
        coordinator.requestRandomWords(
            keyHash,
            subId,
            3,
            gasLimit,
            1
        );
    }

    function fulfillRandomWords(uint256, uint256[] memory randomWords) internal override {
        randomInRange = randomWords[0] % (maxRange + 1); // includes 0 to max
    }
}
