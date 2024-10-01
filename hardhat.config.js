require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("hardhat-contract-sizer")
require("hardhat-deploy")
require("@nomiclabs/hardhat-ethers")

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || ""

const SEPOLIA_RPC_URL =
    process.env.SEPOLIA_RPC_URL ||
    "https://eth-sepolia.g.alchemy.com/v2/Cn5kDdRogfaYK2592pPUpeGGvDbvdkhz"

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xkey"

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "0xkey"

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.24",
    namedAccounts: {
        deployer: {
            default: 0,
        },
        player: {
            default: 1,
        },
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            blockConfirmations: 1,
            // gasPrice: 130000000000,
        },
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
            blockConfirmations: 6,
        },
    },
    etherscan: {
        apiKey: {
            sepolia: ETHERSCAN_API_KEY,
        },
    },
}
