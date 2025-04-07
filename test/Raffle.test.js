const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Raffle", function () {
  let raffle, deployer, user, user2, user3;
  const entranceAmount = ethers.parseEther("0.1");
  const overpaidAmount = ethers.parseEther("0.25");
  const addLotteryTimeInMinutes = 1;

  let winner, winnerSigner, numUsers;

  beforeEach(async function () {
    [deployer, user, user2, user3] = await ethers.getSigners();
    const Raffle = await ethers.getContractFactory("Raffle");
    raffle = await Raffle.deploy(entranceAmount, addLotteryTimeInMinutes);

    numUsers = 3;
    const users = [user, user2, user3];
    for (let i = 0; i < numUsers; i++) {
      await raffle.connect(users[i]).enterLottery({ value: entranceAmount });
    }

    const timeToIncrease = 2 * 60 + 1;
    await network.provider.send("evm_increaseTime", [timeToIncrease]);
    await network.provider.send("evm_mine");

    const tx = await raffle.getWinner();
    await tx.wait();

    winner = await raffle.s_owner();
    winnerSigner = await ethers.getSigner(winner);
  });

  describe("Lottery Entry", function () {
    it("allows users to enter with sufficient ETH", async function () {
      await expect(raffle.connect(user).enterLottery({ value: overpaidAmount }))
        .to.emit(raffle, "Deposit")
        .withArgs(user.address);

      const player = await raffle.getPlayerAtIndex(0);
      expect(player).to.equal(user.address);
    });

    it("reverts when user sends less ETH than required", async function () {
      const lowAmount = ethers.parseEther("0.005");
      await expect(
        raffle.connect(user).enterLottery({ value: lowAmount })
      ).to.be.revertedWithCustomError(raffle, "Raffle__NotEnoughETHEntered");
    });

    it("tracks multiple participants correctly", async function () {
      const player1 = await raffle.getPlayerAtIndex(0);
      const player2 = await raffle.getPlayerAtIndex(1);
      const player3 = await raffle.getPlayerAtIndex(2);

      expect(player1).to.equal(user.address);
      expect(player2).to.equal(user2.address);
      expect(player3).to.equal(user3.address);
    });
  });

  describe("Winner Selection", function () {
    it("selects a valid winner after time has passed", async function () {
      expect([user.address, user2.address, user3.address]).to.include(winner);
    });

    it("returns the winner address correctly", async function () {
      const ownerAddress = await raffle.getOwner();
      expect(ownerAddress).to.equal(winner);
    });
  });

  describe("Raffle Info Getters", function () {
    it("returns correct player count", async function () {
      const count = await raffle.getPlayerCount();
      expect(count).to.equal(numUsers);
    });

    it("returns correct contract balance", async function () {
      const balance = await raffle.getBalance();
      expect(balance).to.equal(entranceAmount * BigInt(numUsers));
    });

    it("returns correct entrance fee", async function () {
      const amount = await raffle.getEntranceAmount();
      expect(amount).to.equal(entranceAmount);
    });

    it("returns correct player address by index", async function () {
      const players = [user, user2, user3];
      for (let i = 0; i < players.length; i++) {
        const player = await raffle.getPlayerAtIndex(i);
        expect(player).to.equal(players[i].address);
      }
    });
  });

  describe("Withdrawals", function () {
    it("allows only the winner to withdraw and resets state", async function () {
      const initialBalance = await ethers.provider.getBalance(winnerSigner);
      const contractBalance = await ethers.provider.getBalance(raffle.target);

      const tx = await raffle.connect(winnerSigner).withdraw();
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(winnerSigner);
      const expectedFinal = initialBalance + contractBalance - gasCost;

      expect(await ethers.provider.getBalance(raffle.target)).to.equal(0);
      await expect(raffle.getPlayerAtIndex(0)).to.be.reverted;
      expect(finalBalance).to.equal(expectedFinal);
    });

    it("reverts when non-winner tries to withdraw", async function () {
      let nonWinner;
      for (const acc of [user, user2, user3]) {
        if (acc.address !== winner) {
          nonWinner = acc;
          break;
        }
      }

      expect(nonWinner).to.not.be.undefined;

      await expect(
        raffle.connect(nonWinner).withdraw()
      ).to.be.revertedWithCustomError(raffle, "Raffle__NotOwner");
    });
  });
});
