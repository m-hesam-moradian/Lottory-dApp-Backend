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

module.exports = async ({ getNamedAccounts, deployments }) => {
  const _BASEFEE = BigInt(100000000000000000);
  const _GASPRICELINK = 1000000000;
  const _WEIPERUNITLINK = ethers.parseEther("0.007653"); // Converts 0.01 ETH to wei

  const addLotteryTimeInMinutes = 5; // 5 minutes
  // Get deployer account from named accounts
  const { deployer } = await getNamedAccounts();

  // Use deployments.deploy to deploy the contract
  const { deploy } = deployments;

  // Deploy the contract
  const VRFCoordinatorV2_5Mock = await deploy("VRFCoordinatorV2_5Mock", {
    from: deployer, // Account deploying the contract
    args: [_BASEFEE, _GASPRICELINK, _WEIPERUNITLINK], // Constructor arguments
    log: true, // Log the deployment process
  });

  // Log the contract address after deployment
  console.log(
    `${VRFCoordinatorV2_5Mock.contractName} deployed to: ${VRFCoordinatorV2_5Mock.address}`
  );
};

module.exports.tags = ["all"]; // Optional: Tagging the deployment
