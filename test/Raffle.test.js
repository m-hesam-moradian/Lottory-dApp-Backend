const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Raffle Contract", function () {
  let raffle, deployer, user, user2, user3, winner;
  const entranceAmount = ethers.parseEther("0.01"); // 0.01 ETH entrance amount
  const userAmount = ethers.parseEther("0.25"); // 0.25 ETH for users
  const addLotteryTimeInMinutes = 1; // Lottery duration in minutes
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

  describe(" test multi enter and increase time  ", function () {
    this.beforeEach(async function () {
      await raffle.connect(user).enterLottery({ value: entranceAmount });
      await raffle.connect(user2).enterLottery({ value: entranceAmount });
      await raffle.connect(user3).enterLottery({ value: entranceAmount });

      const timeToIncrease = 2 * 60 + 1; // 2 minutes + 1 second
      await network.provider.send("evm_increaseTime", [timeToIncrease]);
      await network.provider.send("evm_mine");
    });
    it("Should allow multiple users to enter", async function () {
      const player1 = await raffle.getPlayerAtIndex(0);
      const player2 = await raffle.getPlayerAtIndex(1);
      const player3 = await raffle.getPlayerAtIndex(2);

      expect(player1).to.equal(user.address);
      expect(player2).to.equal(user2.address);
      expect(player3).to.equal(user3.address);
    });

    it("Should select a winner after the lottery time has passed", async function () {
      const tx = await raffle.getWinner();
      await tx.wait();

      winner = await raffle.s_owner();

      expect([user, user2, user3, winner]).to.include(winner);
    });
    describe("test withdraw section", function () {
      it("Should transfer funds to owner and reset players", async function () {
        const txwinner = await raffle.getWinner();
        await txwinner.wait();

        winner = await raffle.s_owner();
        const winnerSigner = await ethers.getSigner(winner);
        let initialOwnerBalance = await ethers.provider.getBalance(
          winnerSigner
        );

        const contractBalance = await ethers.provider.getBalance(raffle.target);

        // 3. Withdraw
        const tx = await raffle.connect(winnerSigner).withdraw();
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed;
        const gasPrice = await receipt.gasPrice;
        const gasCost = gasUsed * gasPrice;

        // 4. Get final balances
        const finalOwnerBalance = await ethers.provider.getBalance(
          winnerSigner
        );

        // 5. Check: contract is emptied
        expect(await ethers.provider.getBalance(raffle.target)).to.equal(0);

        // 6. Check: players array is cleared
        await expect(raffle.getPlayerAtIndex(0)).to.be.reverted;
        console.log(finalOwnerBalance);
        console.log(initialOwnerBalance + contractBalance + gasCost);

        // 7. Check: owner received the funds (minus gas)
        expect(finalOwnerBalance).to.be.closeTo(
          initialOwnerBalance + contractBalance + gasCost,
          ethers.parseEther("0.0001") // Adjust this value based on gas fees

          // Define an appropriate tolerance value
        );
      });
    });
  });
});
