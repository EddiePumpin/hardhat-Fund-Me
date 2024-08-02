const { run } = require("hardhat")

async function verify(contractAddress, args) {
    // this line is also the same as const verify = async (contractAddress, args) => {
    // This won't work on local network such as hardhat.
    console.log("Verifying contractA...")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!")
        } else {
            console.log(e)
        }
    }
}

module.exports = { verify }
