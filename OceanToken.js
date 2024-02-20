const { expect } = require("chai");
const hre = require("hardhat");

describe("OceanToken contract", function () {
  let Token;
  let OceanToken;
  let owner;
  let address_1;               
  let address_2;
  let tokenCap = 100000000;
  let tokenBlockReward = 50;

  beforeEach(async function () {
    Token = await ethers.getContractFactory("OceanToken");
    [owner, address_1, address_2] = await hre.ethers.getSigners();

    OceanToken = await Token.deploy(tokenCap, tokenBlockReward);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await OceanToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await OceanToken.balanceOf(owner.address);
      expect(await OceanToken.totalSupply()).to.equal(ownerBalance);
    });

    it("Should set the max capped supply to the argument provided during deployment", async function () {
      const cap = await OceanToken.cap();
      expect(Number(hre.ethers.utils.formatEther(cap))).to.equal(tokenCap);
    });

    it("Should set the blockReward to the argument provided during deployment", async function () {
      const blockReward = await OceanToken.blockReward();
      expect(Number(hre.ethers.utils.formatEther(blockReward))).to.equal(
        tokenBlockReward
      );
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // 50 токенов в address_1
      await OceanToken.transfer(address_1.address, 50);
      const address_1Balance = await OceanToken.balanceOf(address_1.address);
      expect(address_1Balance).to.equal(50);

      // 50 токенов from address_1 to addr2
      await OceanToken.connect(address_1).transfer(address_2.address, 50);
      const addr2Balance = await OceanToken.balanceOf(address_2.address);
      expect(addr2Balance).to.equal(50);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await OceanToken.balanceOf(owner.address);
      // Попытка отправить 1 токен с адреса 1 с 0 токенов владельцу с 1000000 токенами
      await expect(
        OceanToken.connect(address_1).transfer(owner.address, 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      expect(await OceanToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await OceanToken.balanceOf(owner.address);

      await OceanToken.transfer(address_1.address, 100);

      await OceanToken.transfer(address_2.address, 50);

      // проверка баланса
      const finalOwnerBalance = await OceanToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(150));

      const address_1Balance = await OceanToken.balanceOf(address_1.address);
      expect(address_1Balance).to.equal(100);

      const addr2Balance = await OceanToken.balanceOf(address_2.address);
      expect(addr2Balance).to.equal(50);
    });
  });
});