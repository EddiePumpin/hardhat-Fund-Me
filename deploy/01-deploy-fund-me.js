// import
// main function
// calling of main function

// async function deployFunc() {
//     console.log("Hi!")
// }
// Module.exports.tags = ["all", "fundme"]

// module.exports = async (hre) => {} // This line is the same has the ones above

// const {getNameAccounts, deployments} = hre // This line is also the same as //hre.getNameAccounts, hre.deployments. Also, with the one above

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
// The two lines below is the same as the one line above.
// const helperConfig = require("../helper-hardhat-config")
// const networkConfig = helperConfig

const { network } = require("hardhat")
const { verify } = require("../utils/verify")
require("dotenv").config()

module.exports = async ({ getNamedAccounts, deployments }) => {
    //  This line export an asynchronous function which takes two parameter.The deployment object to get two functions: deploy function and log function
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // if chainId is X use address Y
    // if chainId is Z use address A

    //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPrice"]

    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator") // the 'get' keyword allow us to get the recently deployment
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    // if the contract doesn't exist, we depoy a minimal version of it for our local testing

    // well what happens when we want to change chains
    // when going for localhost or hardhat ntwork we want to use a mock

    //const args = [ethUsdPriceFeedAddress]

    const fundMe = await deploy("FundMe", {
        // This is used to deploy a contract. It is similar to using contractFactory but 'deploy' function is used here.
        from: deployer,
        //args: args
        args: [ethUsdPriceFeedAddress], // put price feed address.
        log: true,
        waitConfirmation: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, [ethUsdPriceFeedAddress])
    }
    log("-------------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
