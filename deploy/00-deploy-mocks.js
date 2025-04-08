const { ethers } = require("hardhat");

async function deployMocks() {
  const BASE_FEE = 5; // example LINK per request
  const GAS_PRICE_LINK = 1e9; // LINK per gas

  const VRFCoordinatorV2Mock = await ethers.getContractFactory(
    "VRFCoordinatorV2Mock"
  );
  const vrfCoordinatorV2Mock = await VRFCoordinatorV2Mock.deploy(
    BASE_FEE,
    GAS_PRICE_LINK
  );
  await vrfCoordinatorV2Mock.deployed();

  console.log("Mock VRFCoordinator deployed at:", vrfCoordinatorV2Mock.address);

  return vrfCoordinatorV2Mock;
}
