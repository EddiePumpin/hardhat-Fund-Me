//Arrange
//Act
//Assert
//This is a way of writing a test
// describe block cannot work with promisies(async)

const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config") // This is the first line to write

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
          let fundMe
          let deployer
          let mockV3Aggregator
          const sendValue = ethers.utils.parseEther("1") //"1000000000000000000". The parseEther converts 1 into 1 with 18 zeros
          beforeEach(async function () {
              // deploy our fundme contract using Hardhat deploy
              const deployer = await getNamedAccounts() // getNamedAccounts is a hardhat built-in function which will retrieve account built in hardhat manually.
              // deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"]) // 'fixture' allows us to run the entire deploy folder as many tags as we want
              fundMe = await ethers.getContractAt("FundMe", deployer) // getContract get the most recent deployment of whatever contract we tell it. Here, we will get the raffle contract and it will be connected to the 'deployer
              mockV3Aggregator = await ethers.getContractAt(
                  "MockV3Aggregator",
                  deployer,
              )
          })

          // First set of test
          describe("constructor", function () {
              it("sets the aggregator addresses correctly", async function () {
                  const response = await fundMe.getPriceFeed() // This line will get the priceFeed function from the fundMe contract and save it as 'response'
                  console.log(response)
                  assert.equal(response, mockV3Aggregator.address)
              })
          })
          describe("fund", function () {
              it("Fails if you don't send enough ETH", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH",
                  ) //'expect' was used because we expect it to fail.
              })
              it("updated the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue })
                  const response =
                      await fundMe.getAddressToAmountFunded(deployer)
                  assert.equal(response.toString(), sendValue.toString()) //toString is used because it is going to be a bigNumber. Search some on bigNumber
              })
              it("Add funder to array of funders ", async function () {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.getFunders(0)
                  assert.equal(funder, deployer)
              })
          })
          describe("Withdraw", function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue }) //"Wait for the fund function of the fundMe contract to complete. Send sendValue amount of cryptocurrency to the fundMe contract."
              })
              it("withdraw ETH from a single funder", async function () {
                  //Arrange
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  //Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait()
                  const { gasUsed, effectiveGasPrice } = transactionReceipt // The curly bracket syntax is used to pull out object sout of another object.
                  const gasCost = gasUsed.mul(effectiveGasPrice) //gasUsed * effectiveGasPrice
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address,
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  //Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString(),
                  ) // assert.equal(startingFundMeBalance + startingDeployerBalance, endingDeployerBalance)
              })
              it("allows us to withdraw with multiple funders", async function () {
                  //Arange
                  const accounts = await ethers.getSigners()
                  for (i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i],
                      ) //.connect(accounts(i)): This method is used to connect to the smart contract using a specific account.
                      await fundMeConnectedContract.fund({ value: sendValue }) //
                  }
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  //Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait()
                  const { gasUsed, effectiveGasPrice } = transactionReceipt // The curly bracket syntax is used to pull out object sout of another object.
                  const gasCost = gasUsed.mul(effectiveGasPrice) //gasUsed * effectiveGasPrice
                  console.log(`GasCost: ${GasCost}`)
                  console.log(`GasUsed: ${gasUsed}`)
                  console.log(`GasPrice: ${effectiveGasPrice}`)
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address,
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  //Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString(),
                  ) // assert.equal(startingFundMeBalance + startingDeployerBalance, endingDeployerBalance)

                  //Make sure that the funders are reset properly
                  await expect(fundMe.getFunders(0)).to.be.revertedWith

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.addressToAmountFunded(
                              accounts[i].address,
                          ),
                      )
                  }
              })
              it("Only allows the owner to withdraw", async function () {
                  const accounts = await ethers.getSigners()
                  const attacker = accounts[1]
                  const attackerConnectedContract =
                      await fundMe.connect(attacker)
                  await expect(
                      attackerConnectedContract.withdraw(),
                  ).to.be.revertedWith("FundMe__NotOwne")
              })
          })
      })
