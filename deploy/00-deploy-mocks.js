const { network } = require("hardhat")
const {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config")
// const DECIMALS = "8"
// const INITIAL_ANSWER = "200000000000" // 2000

module.exports = async ({ getNameAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    if (developmentChains.includes(network.name)) {
        // the 'include' keyword is a function that checks to see  if some variables are inside an array
        log("Local network detected! Deploying mocks...") // log is also the same as console.log
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            logs: true,
            args: [DECIMALS, INITIAL_ANSWER],
        })
        log("Mocks deployed!")
        log("-----------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
