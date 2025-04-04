// 01_deploy_contract.js

require("hardhat-deploy");
// require("hardhat-deploy-ethers"); // Import ethers for contract deployment
const { ethers } = require("hardhat"); // Import ethers from Hardhat
// This script deploys the Ruffle contract using Hardhat's deployment plugin

module.exports = async ({ getNamedAccounts, deployments }) => {
  const entranceAmount = ethers.parseEther("0.01"); // Converts 0.01 ETH to wei

  const addLotteryTimeInMinutes = 5; // 5 minutes
  // Get deployer account from named accounts
  const { deployer } = await getNamedAccounts();

  // Use deployments.deploy to deploy the contract
  const { deploy } = deployments;

  // Deploy the contract
  const raffle = await deploy("Raffle", {
    from: deployer, // Account deploying the contract
    args: [entranceAmount, addLotteryTimeInMinutes], // Constructor arguments
    log: true, // Log the deployment process
  });

  // Log the contract address after deployment
  console.log(`${raffle.contractName} deployed to: ${raffle.address}`);
};

module.exports.tags = ["all"]; // Optional: Tagging the deployment
