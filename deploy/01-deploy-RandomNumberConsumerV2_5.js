// 01-random-consumer.js
const { network, deployments } = require("hardhat");
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  let vrfCoordinatorV2Address, subscriptionId;

  if (developmentChains.includes(network.name)) {
    const vrfCoordinatorV2Mock = await deployments.get(
      "VRFCoordinatorV2_5Mock"
    );
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

    // creat subscription
    // const replacer = (key, value) => {
    //   if (typeof value === "bigint") {
    //     return value.toString();
    //   }
    //   return value;
    // // };
    // log("Creating subscription...");
    // // log(
    // //   "VRFCoordinatorV2_5Mock:" +
    // //     JSON.stringify(VRFCoordinatorV2_5Mock, replacer, 2)
    // // );
    // let transactionResponse = await VRFCoordinatorV2_5Mock.createSubscription();
    // const transactionReceipt = await transactionResponse.wait(1);

    // const subscriptionId = transactionReceipt.logs[0].args.subId;
    // log(`Subscription created with ID: ${subscriptionId.toString()}`);

    // //fund subscription

    // const fundAmount = ethers.parseEther("0.1"); // Amount to fund the subscription
    // log("Funding subscription...");
    // transactionResponse = await VRFCoordinatorV2_5Mock.fundSubscription(
    //   subscriptionId,
    //   fundAmount
    // );
    // await transactionResponse.wait(1);
    // log(`Subscription funded with ${fundAmount.toString()} LINK`);

    // // deploy consumer
    // const keyHash =
    //   "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc"; // Replace with your actual key hash

    // const VRFCoordinatorV2_5MockAddress = VRFCoordinatorV2_5Mock.address; // Replace with your actual contract address
    // await deployConsumer(
    //   hre,
    //   subscriptionId,
    //   keyHash,
    //   VRFCoordinatorV2_5MockAddress
    // );
    // Retrieve the VRF mock deployment
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
  log("RandomNumberConsumerV2_5 deployed!");

  // Optionally: If on a local network, add the consumer as an authorized consumer in the VRF mock
  if (developmentChains.includes(network.name)) {
    await vrfCoordinator.addConsumer(
      subscriptionId,
      RandomNumberConsumerV2_5.address
    );
    log("Consumer contract added to VRF subscription!");
  }
};
module.exports.tags = ["all", "consumer"];
