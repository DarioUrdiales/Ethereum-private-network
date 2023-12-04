const express = require("express");
const cors = require("cors");
const { Web3 } = require("web3");

const network = require("./ethers/config");

const app = express();

app.use(cors());

// Create a new Web3 instance connected to a local Ethereum node
const web3 = new Web3("http://localhost:8545");

/**
 * Returns info from the last 10 blocks
 */
app.get("/api/blocks", async (req, res) => {
  try {
    const currentBlock = await network.getBlockNumber();
    
    const blocks = []
    for (let index = 0; index < 10; index++) {
        const blockNumber = currentBlock - index
        if (blockNumber < 1) break
        const block = await network.getBlock(blockNumber)
        blocks.push(block)  
    }

    res.json(blocks);
  } catch (error) {
    res.status(500).json(error);
  }
});

/**
 * Returns info from specific block
 */
app.get("/api/blocks/:block", async (req, res) => {
  const blockNumber = req.params.block;
  try {
    res.json(await network.getBlock(parseInt(blockNumber)));
  } catch (error) {
    res.status(500).json(error.message);
  }
});

/**
 * Returns transaction info
 */
app.get("/api/tx/:tx", async (req, res) => {
    const tx = req.params.tx
    try {
        res.json(await network.getTransaction(tx))
    } catch (error) {
        res.status(500).json(error.message)
    }
})

/**
* Returns balance from address
*/
app.get("/api/balance/:address", async (req, res) => {
  try {
    // Retrieve the balance
    const balance = await web3.eth.getBalance(req.params.address);
    res.json({ balance: balance.toString() }); // Convert BigInt to string
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve balance" });
  }
});


module.exports = app;
