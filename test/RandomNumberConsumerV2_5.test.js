const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { expect } = require("chai");

describe("RandomNumberConsumerV2_5 tests :", function () {
  beforeEach(async function () {
    await deployments.fixture(["mocks", "RNC"]);
    const { deployer } = await getNamedAccounts();

    // Get the deployment info
    const deployment = await deployments.get("RandomNumberConsumerV2_5");

    // Get contract instance connected to deployer signer
    let RandomNumberConsumer = await ethers.getContractAt(
      "RandomNumberConsumerV2_5",
      deployment.address,
      deployer
    );
    console.log(
      `this.RandomNumberConsumer.address :`,
      RandomNumberConsumer.address
    );
  });

  //get random number
  it("Should get a random number", async function () {
    const tx = await this.RandomNumberConsumer.requestRandomWords();
    const receipt = await tx.wait();
    // console.log(`receipt :`, receipt.logs[0]);
    // const iface = new ethers.Interface(
    //   this.RandomNumberConsumer.interface.format()
    // );
    // const decoded = iface.decodeEventLog(
    //   "RandomWordsRequested",
    //   receipt.logs[0].data,
    //   receipt.logs[0].topics
    // );
    // console.log(`decoded :`, decoded);
    //fullfill the request

    const tx2 = await vrfCoordinatorV2Mock.fulfillRandomWords(
      1,
      this.RandomNumberConsumer.address
    );
    const receipt2 = await tx2.wait();
    // console.log(`receipt2 :`, receipt2.logs[0]);
  });
});
