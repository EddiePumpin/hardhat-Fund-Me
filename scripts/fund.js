const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
    const deployer = await getNamedAccounts()
    const fundMe = await ethers.getContractAt("FundMe", deployer)
    console.log("Funding Contract...")
    const transactionResponse = await ethers.fund({
        value: ethers.utils.parseEther("0"),
    })

    await transactionResponse.wait(1)
    console.log("Funded!")
}

main() // This section calls the main function
    .then(() => process.exit(0)) // A promise is said to be settled if it is either fulfilled or rejected, but not pending.
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
