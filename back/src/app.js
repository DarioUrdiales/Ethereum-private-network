const express = require("express");
const cors = require("cors");
const { Web3 } = require("web3");
const {
  getNetworksList,
  removeNetwork,
  createNetwork,
  addNode,
} = require("./services/networks.service");

const network = require("./ethers/config");

const app = express();

app.use(express.json());

app.use(cors());

// Create a new Web3 instance connected to a local Ethereum node
const web3 = new Web3("http://localhost:8545");

const fs = require("fs");
const redParameters = JSON.parse(fs.readFileSync("redParameters.json", "utf8"));

app.get("/api/networks", (req, res) => {
  try {
    const networks = getNetworksList();

    res.status(200).json(networks);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post("/api/networks/addNode/:chainId/:nodeNumber", (req, res) => {
  try {
    const chainId = +req.params.chainId;
    const nodeNumber = +req.params.nodeNumber;

    addNode(chainId, nodeNumber);

    res
      .status(200)
      .send(
        `Node has been succesfully added to the network with chain id ${chainId}`
      );
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post("/api/redparameters", (req, res) => {
  try {
    const nodesNumber = +req.params.nodesNumber;
    const chainId = +req.params.chainId;

    createNetwork(nodesNumber, chainId);
    res.setHeader("Content-Type", "application/json");
    res.status(200).send("Network has been succesfully created");
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post("/api/networks/remove/:chainId", (req, res) => {
  try {
    const chainId = +req.params.chainId;

    removeNetwork(chainId);

    res.status(200).send("Network has been succesfully removed");
  } catch (error) {
    res.status(500).json(error);
  }
});

/**
 * Returns info from the last 10 blocks
 */
app.get("/api/blocks", async (req, res) => {
  try {
    const currentBlock = await network.getBlockNumber();

    const blocks = [];
    for (let index = 0; index < 10; index++) {
      const blockNumber = currentBlock - index;
      if (blockNumber < 1) break;
      const block = await network.getBlock(blockNumber);
      blocks.push(block);
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
  const tx = req.params.tx;
  try {
    res.json(await network.getTransaction(tx));
  } catch (error) {
    res.status(500).json(error.message);
  }
});

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

/**
 * Returns the Red parameter
 */
app.get("/api/redparameters", async (req, res) => {
  try {
    // Serve the Red parameters from the imported module
    res.json(redParameters);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

/**
 * Route to update the Red parameter
 */
app.post("/api/redparameters", async (req, res) => {
  try {
    const updatedParameters = req.body;
    console.log("Received Red parameters:", updatedParameters);

    // Convert JSON object to string
    const data = JSON.stringify(updatedParameters, null, 2);

    // Write JSON string to a file
    fs.writeFile(
      "redParameters.json",
      JSON.stringify(req.body, null, 2),
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send(err);
        }
        res.send({ message: "JSON received and stored." });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
