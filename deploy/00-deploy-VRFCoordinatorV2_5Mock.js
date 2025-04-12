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
  subscriptionId,
  keyHash,
  VRFCoordinatorV2_5MockAddress
) => {
  const { getNamedAccounts, deployments } = hre;

  // Converts 0.01 ETH to wei

  const addLotteryTimeInMinutes = 5; // 5 minutes
  // Get deployer account from named accounts
  const { deployer } = await getNamedAccounts();

  // Use deployments.deploy to deploy the contract
  const { deploy, log } = deployments;

  // Deploy the contract

  // Log the contract address after deployment
  log(
    `${VRFCoordinatorV2_5Mock.contractName} deployed to: ${VRFCoordinatorV2_5Mock.address}`
  );

  // creat subscription
  async () => {
    log("Creating subscription...");
    const transactionResponse = await VRFCoordinatorV2_5Mock.createSubscription;
    const transactionReceipt = await transactionResponse.wait(1);

    const subscriptionId = transactionReceipt.events[0].args.subId;
    log(`Subscription created with ID: ${subscriptionId.toString()}`);
  };

  //fund subscription
  async () => {
    const fundAmount = ethers.parseEther("0.1"); // Amount to fund the subscription
    log("Funding subscription...");
    const transactionResponse = await VRFCoordinatorV2_5Mock.fundSubscription(
      subscriptionId,
      fundAmount
    );
    await transactionResponse.wait(1);
    log(`Subscription funded with ${fundAmount.toString()} LINK`);
  };
  // deploy consumer
  const keyHash =
    "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc"; // Replace with your actual key hash

  const VRFCoordinatorV2_5MockAddress = VRFCoordinatorV2_5Mock.address; // Replace with your actual contract address
  await deployConsumer(
    hre,
    subscriptionId,
    keyHash,
    VRFCoordinatorV2_5MockAddress
  );
};

module.exports.tags = ["all"]; // Optional: Tagging the deployment
