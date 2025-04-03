const { network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const entranceAmount = ethers.utils.parseEther("0.1"); // 0.1 ETH
  const lotteryDuration = 60; // 60 minutes

  const raffle = await deploy("Raffle", {
    from: deployer,
    args: [entranceAmount, lotteryDuration],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  log("Raffle deployed to:", raffle.address);
};

module.exports.tags = ["all", "raffle"];
