const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Raffle Contract", function () {
  let raffle, deployer, user;
  const entranceAmount = ethers.parseEther("0.01"); // 0.01 ETH entrance amount
  const userAmount = ethers.parseEther("0.25"); // 0.25 ETH for users
  beforeEach(async function () {
    // Get signers (accounts)
    [deployer, user] = await ethers.getSigners();

    // Deploy the contract with the entrance amount and lottery duration
    const Raffle = await ethers.getContractFactory("Raffle");
    raffle = await Raffle.deploy(entranceAmount, 1); // Lottery duration = 5 minutes
  });

  it("Should allow users to enter the lottery with sufficient ETH", async function () {
    // User enters with the correct amount (0.01 ETH)
    await expect(raffle.connect(user).enterLottery({ value: userAmount }))
      .to.emit(raffle, "Deposit") // Assuming you emit an event when entering
      .withArgs(user.address); // Ensure the correct user entered

    // Check that the player is added to the players array
    const player = await raffle.getPlayerAtIndex(0);
    expect(player).to.equal(user.address);
  });

  it("Should revert with a custom error when sending less ETH than required", async function () {
    const lessThanEntranceAmount = ethers.parseEther("0.005"); // Sending less than required ETH

    await expect(
      raffle.connect(user).enterLottery({ value: lessThanEntranceAmount })
    ).to.be.revertedWithCustomError(raffle, "Raffle__NotEnoughETHEntered");
  });

  it("Should allow multiple users to enter", async function () {
    // Another user enters with the correct amount (0.01 ETH)
    const [_, user2] = await ethers.getSigners();
    await raffle.connect(user).enterLottery({ value: entranceAmount });
    await raffle.connect(user2).enterLottery({ value: entranceAmount });

    // Check that both users are added to the players list
    const player1 = await raffle.getPlayerAtIndex(0);
    const player2 = await raffle.getPlayerAtIndex(1);

    expect(player1).to.equal(user.address);
    expect(player2).to.equal(user2.address);
  });

  // it("Should not allow users to enter without ETH", async function () {
  //   // User tries to enter without sending any ETH
  //   await expect(
  //     raffle.connect(user).enterLottery({ value: 0 })
  //   ).to.be.revertedWith("Raffle__NotEnoughETHEntered");
  // });
});
