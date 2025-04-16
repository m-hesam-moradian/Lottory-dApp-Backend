// 00-deploy-VRFCoordinatorV2_5Mock.js
const { ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments, network }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  if (developmentChains.includes(network.name)) {
    const _BASEFEE = BigInt(100000000000000000);
    const _GASPRICELINK = 1000000000;
    const _WEIPERUNITLINK = ethers.parseEther("0.007653");

    log("Deploying VRFCoordinatorV2_5Mock...");
    const vrfDeployment = await deploy("VRFCoordinatorV2_5Mock", {
      from: deployer,
      args: [_BASEFEE, _GASPRICELINK, _WEIPERUNITLINK],
      log: true,
    });
    log(`VRFCoordinatorV2_5Mock deployed at: ${vrfDeployment.address}`);
  }
};

module.exports.tags = ["all", "mocks"];
