const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Raffle Contract", function () {
  let raffle, deployer, user, user2, user3;
  const entranceAmount = ethers.parseEther("0.1"); // 0.01 ETH entrance amount
  const userAmount = ethers.parseEther("0.25"); // 0.25 ETH for users
  const addLotteryTimeInMinutes = 1; // Lottery duration in minutes
  let winner, winnerSigner, numUsers;
  beforeEach(async function () {
    // Get signers (accounts)
    [deployer, user, user2, user3] = await ethers.getSigners();

    // Deploy the contract with the entrance amount and lottery duration
    const Raffle = await ethers.getContractFactory("Raffle");
    raffle = await Raffle.deploy(entranceAmount, addLotteryTimeInMinutes);

    // Lottery duration = 5 minutes
    //dynamic user enter with loop
    numUsers = 3; // Number of users to enter the lottery
    const users = [user, user2, user3]; // Array of user signers
    for (let i = 0; i < numUsers; i++) {
      await raffle.connect(users[i]).enterLottery({ value: entranceAmount });
    }

    const timeToIncrease = 2 * 60 + 1; // 2 minutes + 1 second
    await network.provider.send("evm_increaseTime", [timeToIncrease]);
    await network.provider.send("evm_mine");

    const tx = await raffle.getWinner();
    await tx.wait();

    winner = await raffle.s_owner();
    winnerSigner = await ethers.getSigner(winner);
  });
  //test getPlayerAtIndex() function
  it("Should return the correct player address at a given index", async function () {
    const player1 = await raffle.getPlayerAtIndex(0);
    const player2 = await raffle.getPlayerAtIndex(1);
    const player3 = await raffle.getPlayerAtIndex(2);

    expect(player1).to.equal(user.address);
    expect(player2).to.equal(user2.address);
    expect(player3).to.equal(user3.address);
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
    const player1 = await raffle.getPlayerAtIndex(0);
    const player2 = await raffle.getPlayerAtIndex(1);
    const player3 = await raffle.getPlayerAtIndex(2);

    expect(player1).to.equal(user.address);
    expect(player2).to.equal(user2.address);
    expect(player3).to.equal(user3.address);
  });

  it("Should select a winner after the lottery time has passed", async function () {
    expect([user.address, user2.address, user3.address]).to.include(winner);
  });
  it("Should return the winner address", async function () {
    const ownerAddress = await raffle.getOwner();

    expect(ownerAddress).to.equal(winner);
  });
  //test getPlayerCount() function
  it("Should return the correct player count", async function () {
    const playerCount = await raffle.getPlayerCount();

    expect(playerCount).to.equal(numUsers); // 3 players entered
  });
  //test getBalance() function
  it("Should return the correct balance", async function () {
    const balance = await raffle.getBalance();

    expect(balance).to.equal(entranceAmount * (await raffle.getPlayerCount()));
  });
  //test  getEntranceAmount() function
  it("Should return the correct entrance amount", async function () {
    const entranceAmount = await raffle.getEntranceAmount();

    expect(entranceAmount).to.equal(entranceAmount);
  });
  describe("test withdraw section", function () {
    it("Should transfer funds to winner and reset players", async function () {
      let initialOwnerBalance = await ethers.provider.getBalance(winnerSigner);

      const contractBalance = await ethers.provider.getBalance(raffle.target);

      // 3. Withdraw
      const tx = await raffle.connect(winnerSigner).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed;
      const gasPrice = await receipt.gasPrice;
      const gasCost = gasUsed * gasPrice;

      // 4. Get final balances
      const finalOwnerBalance = await ethers.provider.getBalance(winnerSigner);

      // 5. Check: contract is emptied
      expect(await ethers.provider.getBalance(raffle.target)).to.equal(0);

      // 6. Check: players array is cleared
      await expect(raffle.getPlayerAtIndex(0)).to.be.reverted;

      // 7. Check: owner received the funds (minus gas)
      expect(finalOwnerBalance).to.be.equal(
        initialOwnerBalance + contractBalance - gasCost
      ); // Adjust this value based on gas fees

      it("Should revert if a non-winner tries to withdraw", async function () {
        // Trigger winner selection
        const txWinner = await raffle.getWinner();
        await txWinner.wait();

        const winnerAddress = await raffle.s_owner(); // assuming this is your winner

        // Find a user who is NOT the winner
        let nonWinner;
        for (const account of [user, user2, user3]) {
          if (account.address !== winnerAddress) {
            nonWinner = account;
            break;
          }
        }

        expect(nonWinner).to.not.be.undefined; // sanity check

        // Attempt withdraw with non-winner
        await expect(
          raffle.connect(nonWinner).withdraw()
        ).to.be.revertedWithCustomError(
          raffle,
          "Raffle__OnlyWinnerCanWithdraw"
        );
      });
    });
    it("Should revert if a non-winner tries to withdraw", async function () {
      // Find a user who is NOT the winner
      let nonWinner;
      for (const account of [user, user2, user3]) {
        if (account.address !== winner) {
          nonWinner = account;
          break;
        }
      }

      expect(nonWinner).to.not.be.undefined; // sanity check

      // Attempt withdraw with non-winner
      await expect(
        raffle.connect(nonWinner).withdraw()
      ).to.be.revertedWithCustomError(raffle, "Raffle__NotOwner");
    });
  });
  //test for getOwner() function to return winner address
});
