// 01-random-consumer.js
const { network, deployments } = require("hardhat");
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock;

  if (developmentChains.includes(network.name)) {
    vrfCoordinatorV2Mock = await deployments.get("VRFCoordinatorV2_5Mock");
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
    const vrfCoordinatorV2MockContract = await ethers.getContractAt(
      "VRFCoordinatorV2_5Mock",
      vrfCoordinatorV2Mock.address
    );
    log(`VRFCoordinatorV2_5Mock deployed to: ${vrfCoordinatorV2Mock.address}`);
    // Now you can call createSubscription
    const tx = await vrfCoordinatorV2MockContract.createSubscription();
    const receipt = await tx.wait();
    subscriptionId = receipt.logs[0].args.subId;
    log(`Subscription created with ID: ${subscriptionId.toString()}`);
    //fund the subscription
    const fundAmount = networkConfig[network.config.chainId].fundAmount;
    await vrfCoordinatorV2MockContract.fundSubscription(
      subscriptionId,
      fundAmount
    );
    log(
      `Subscription ${subscriptionId.toString()} funded with ${fundAmount} LINK`
    );
    // Add the consumer to the subscription
  } else {
    vrfCoordinatorV2Address =
      networkConfig[network.config.chainId].vrfCoordinatorV2;
    subscriptionId = networkConfig[network.config.chainId].subscriptionId;
  }
  const keyHash = networkConfig[network.config.chainId]
    ? networkConfig[network.config.chainId].keyHash
    : null;
  // Deploy your consumer contract passing the VRF Coordinator address and subscription ID
  log("Deploying RandomNumberConsumer...");
  const RandomNumberConsumerV2_5 = await deploy("RandomNumberConsumerV2_5", {
    from: deployer,
    args: [subscriptionId, vrfCoordinatorV2Address, keyHash],
    log: true,
  });

  log(
    `RandomNumberConsumerV2_5 deployed at ${RandomNumberConsumerV2_5.address}`
  );
  // Optionally: If on a local network, add the consumer as an authorized consumer in the VRF mock
  if (developmentChains.includes(network.name)) {
    const vrfCoordinatorV2MockContract = await ethers.getContractAt(
      "VRFCoordinatorV2_5Mock",
      vrfCoordinatorV2Address
    );

    const txAddConsumer = await vrfCoordinatorV2MockContract.addConsumer(
      subscriptionId,
      RandomNumberConsumerV2_5.address
    );
    await txAddConsumer.wait(1);

    log(
      `Consumer ${RandomNumberConsumerV2_5.address} added to subscription ${subscriptionId}`
    );
  }
};
module.exports.tags = ["all", "RNC"];
