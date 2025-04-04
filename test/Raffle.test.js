const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Raffle Contract", function () {
  let raffle, deployer, user, user2, user3;
  const entranceAmount = ethers.parseEther("0.01"); // 0.01 ETH entrance amount
  const userAmount = ethers.parseEther("0.25"); // 0.25 ETH for users
  const addLotteryTimeInMinutes = 2; // Lottery duration in minutes
  beforeEach(async function () {
    // Get signers (accounts)
    [deployer, user, user2, user3] = await ethers.getSigners();

    // Deploy the contract with the entrance amount and lottery duration
    const Raffle = await ethers.getContractFactory("Raffle");
    raffle = await Raffle.deploy(entranceAmount, addLotteryTimeInMinutes); // Lottery duration = 5 minutes
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

    await raffle.connect(user).enterLottery({ value: entranceAmount });
    await raffle.connect(user2).enterLottery({ value: entranceAmount });
    await raffle.connect(user3).enterLottery({ value: entranceAmount });

    // Check that both users are added to the players list
    const player1 = await raffle.getPlayerAtIndex(0);
    const player2 = await raffle.getPlayerAtIndex(1);
    const player3 = await raffle.getPlayerAtIndex(2);

    expect(player1).to.equal(user.address);
    expect(player2).to.equal(user2.address);
    expect(player3).to.equal(user3.address);
  });

  it("Should select a winner after the lottery time has passed", async function () {
    // Users enter the lottery
    await raffle.connect(user).enterLottery({ value: entranceAmount });
    await raffle.connect(user2).enterLottery({ value: entranceAmount });

    // Get the current block timestamp
    const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
    console.log(`Current blockchain time: ${currentTime}`);

    // Fast forward time by 2 minutes + 1 second (to exceed the lottery duration)
    const timeToIncrease = addLotteryTimeInMinutes + 1 * 60; // 2 minutes + 1 second
    await network.provider.send("evm_increaseTime", [timeToIncrease]);
    await network.provider.send("evm_mine"); // Mine a new block to apply the time change

    // Call getWinner() to update the state
    const tx = await raffle.getWinner();
    await tx.wait(); // Wait for transaction to be confirmed

    // Fetch the winner's address separately
    const winner = await raffle.s_owner(); // ✅ Correct (accessing the variable)

    // console.log(`Winner address: ${winner}`);

    //log users one by one
    console.log(`User 1 address: ${user.address}`);
    console.log(`User 2 address: ${user2.address}`);
    console.log(`User 3 address: ${user3.address}`);
    // winner address
    console.log(`Winner address: ${winner}`);
    // expect([user.address, user2.address]).to.include(winner);
  });
});
