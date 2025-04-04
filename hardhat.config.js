require("hardhat-deploy");
require("@nomicfoundation/hardhat-toolbox"); // Useful for ethers.js

module.exports = {
  solidity: "0.8.28", // Choose your Solidity version
  namedAccounts: {
    deployer: {
      default: 0, // First account in Hardhat network will be the deployer
    },
  },
  // networks: {
  //   hardhat: {},
  //   sepolia: {
  //     url: process.env.ALCHEMY_API_URL, // Your RPC URL
  //     accounts: [process.env.PRIVATE_KEY], // Your private key
  //   },
  // },
};
