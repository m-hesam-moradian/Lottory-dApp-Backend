require("hardhat-deploy");
require("@nomicfoundation/hardhat-toolbox"); // Useful for ethers.js

module.exports = {
  //solidity sevral versions
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },

  namedAccounts: {
    deployer: {
      default: 0, // First account in Hardhat network will be the deployer
    },
    user: {
      default: 1, // Second account in Hardhat network will be the user
    },
    user2: {
      default: 2, // Third account in Hardhat network will be the user2
    },
    user3: {
      default: 3, // Fourth account in Hardhat network will be the user3
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
