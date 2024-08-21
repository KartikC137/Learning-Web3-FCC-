require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("./tasks/block-number")

/** @type import('hardhat/config').HardhatUserConfig */

const sepoliaRPC = process.env.SEPOLIA_RPC_URL
const pKEY = process.env.PRIVATE_KEY
const ESapiKey = process.env.ETHERSCAN_API_KEY

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        sepolia: {
            url: sepoliaRPC,
            accounts: [pKEY],
            chainId: 11155111,
        },
        localhost: {
            url: "http://127.0.0.1:8545",
            chainId: 31337,
        },
    },

    solidity: "0.8.24",

    etherscan: {
        apiKey: {
            sepolia: ESapiKey,
        },
    },
}
