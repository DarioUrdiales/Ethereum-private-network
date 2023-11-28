const { ethers } = require("ethers")

const URL_INFURA = 'https://mainnet.infura.io/v3/9d4c7bb748624b96b5ccd090f2ac6382'

const network = new ethers.JsonRpcProvider(URL_INFURA)

module.exports = network