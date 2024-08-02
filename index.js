// in node.js-- require()
// in front-end javascript you can't use require, we use 'import' keyword instead. Require does not work in the frontend
console.log("You are connected")

import { ethers } from "./utils/ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

// console.log(ethers)

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        //console.log("Metamask existence confirmed!")\

        await window.ethereum.request({ method: "eth_requestAccounts" })
        //console.log("Connected!")
        connectButton.innerHTML = "Connected!"
    } else {
        // console.log("No metamask")
        connectButton.innerHTML = "Please, install Metamask!"
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        await window.ethereum.enable()
        const provider = new ethers.provider.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utilis.formatEther(balance))
    }
}

//fund
async function fund() {
    const ethAmount = document.getElementById("ethAmount").value // this is the value from the input box in the frontend.
    console.log(`Funding with ${ethAmount}...... `)
    if (typeof window.ethereum !== "undefined") {
        // To send a transaction we always need a 1. provider / connection to the blockchain and 2. Signer / wallet / someone with some gas
        // Also, we will need the contract we are intracting with and the ABI & address
        await window.ethereum.enable()
        const provider = new ethers.provider.Web3Provider(window.ethereum)
        const signer = provider.getSigner() // This line will return the wallet the wallet that is connected to the provider(metamask)
        console.log(signer)
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            // listen for the tx to be mined
            // listen for an event
            await listenForTransactionMine(transactionResponse, provider) // hey, wait for this TX to finish
        } catch (error) {
            console.log(error)
        }
    }
    function listenForTransactionMine(transactionResponse, provider) {
        console.log(`Mining $(transactionResponse.hash)...`)
        return new promise((resolve, reject) => {
            provider.once(
                transactionResponse.hash,
                (getTransactionReceipt) => {},
            )
            console.log("Done!")
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`,
            )
            resolve()
        })
    }
}

//withdraw
async function withdraw() {
    console.log("withdrawwwwww")
    if (typeof window.ethereum !== "undefined") {
        console.log("Withdrawing...")
        await window.ethereum.enable()
        const provider = new ethers.provider.Web3Provider(window.ethereum)
        const signer = provider.getSigner() // This line will return the wallet the wallet that is connected to the provider(metamask)
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}
