require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config()

/** @type import('hardhat/config').HardhatUserConfig */

const sepoliaRPC = process.env.SEPOLIA_RPC_URL
const pKEY = process.env.PRIVATE_KEY

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      url: sepoliaRPC,
      accounts: [pKEY],
      chainId: 11155111,
    },
  },
  solidity: "0.8.24",
};
