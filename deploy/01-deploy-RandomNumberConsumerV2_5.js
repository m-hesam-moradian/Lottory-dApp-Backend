// 01_deploy_contract.js
//import from coordinator

require("hardhat-deploy");
// require("hardhat-deploy-ethers"); // Import ethers for contract deployment
const { ethers } = require("hardhat"); // Import ethers from Hardhat
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { network } = require("hardhat");
// This script deploys the Ruffle contract using Hardhat's deployment plugin

module.exports = async (
  hre,

  VRFCoordinatorV2_5MockAddress,
  keyHash
) => {
  const { getNamedAccounts, deployments } = hre;

  // Converts 0.01 ETH to wei

  const addLotteryTimeInMinutes = 5; // 5 minutes
  // Get deployer account from named accounts
  const { deployer } = await getNamedAccounts();

  // Use deployments.deploy to deploy the contract
  const { deploy, log } = deployments;

  // Deploy the contract
  const RandomNumberConsumerV2_5 = await deploy("RandomNumberConsumerV2_5", {
    from: deployer, // Account deploying the contract
    args: [subscriptionId, VRFCoordinatorV2_5MockAddress, keyHash], // Constructor arguments
    log: true, // Log the deployment process
  });
  log(
    `${RandomNumberConsumerV2_5.contractName} deployed to: ${RandomNumberConsumerV2_5.address}`
  );
  // Log the contract address after deployment
  log(`Subscription ID: ${subscriptionId.toString()}`);
  log(
    `VRFCoordinatorV2_5Mock Address: ${VRFCoordinatorV2_5MockAddress.toString()}`
  );
};

module.exports.tags = ["all"]; // Optional: Tagging the deployment
