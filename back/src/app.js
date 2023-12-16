const express = require("express");
const cors = require("cors");
const { Web3 } = require("web3");
const { getNetworksList, removeNetwork, createNetwork, addNode, addAccount, stopNetwork, startNetwork } = require("./services/networks.service");
const fs = require("fs")


const key_miner = JSON.parse(fs.readFileSync("../nodos/initial-blockchain/keystore/UTC--2023-12-14T12-46-05.565502610Z--c18727dab5fe77c472137437e8955d96d4db9407"))
const passwd_miner = fs.readFileSync("../nodos/initial-blockchain/pwd.txt");
console.log(passwd_miner)

const network = require("./ethers/config");
const app = express();

app.use(express.json());
app.use(cors());

const web3 = new Web3("http://localhost:8670");

// Route to get a list of networks
app.get("/api/networks", (req, res) => {
  try {
    const networks = getNetworksList();
    res.status(200).json(networks);
  } catch (error) {
    console.error("Error getting networks:", error);
    res.status(500).json({ error: error.message });
  }
});

// Route to add a node to a network
app.post("/api/networks/add-node/:chainId/:nodesCount", (req, res) => {
  try {
    const chainId = +req.params.chainId;
    const nodesCount = +req.params.nodesCount;

    addNode(chainId, nodesCount);

    res
      .status(200)
      .send(
        `Nodes has been succesfully added to the network with chain id ${chainId}`
      );
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post("/api/networks/add-account/", (req, res) => {
  try {
    const { chainId, account } = req.body;
    
    addAccount(chainId, account);

    res
      .status(200)
      .send(
        `The account ${account} has been succesfully added to the network with chain id ${chainId}`
      );
  } catch (error) {
    res.status(500).json(error);
  }
});

// Route to remove a network
app.post("/api/networks/remove/:chainId", (req, res) => {
  try {
    const chainId = +req.params.chainId;

    removeNetwork(chainId);

    res.status(200).send("Network has been succesfully removed");
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post("/api/networks/start/:chainId", (req, res) => {
  try {
    const chainId = +req.params.chainId;

    startNetwork(chainId);

    res.status(200).send("Network has been succesfully started");
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post("/api/networks/stop/:chainId", (req, res) => {
  try {
    const chainId = +req.params.chainId;

    stopNetwork(chainId);

    res.status(200).send("Network has been succesfully stopped");
  } catch (error) {
    res.status(500).json(error);
  }
});

// Route to get information about the last 10 blocks
app.get("/api/blocks", async (req, res) => {
  try {
    const currentBlockNumber = await web3.eth.getBlockNumber();
    const blocks = [];

    for (let index = 0; index < 10; index++) {
      const blockNumber = currentBlockNumber - BigInt(index);
      if (blockNumber < 0) break;
      const block = await web3.eth.getBlock(blockNumber);
      blocks.push({
        number: block.number.toString(), // Convertir a cadena
        timestamp: block.timestamp.toString(), // Convertir a cadena
        transactions: block.transactions
      });
    }

    res.json(blocks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to get information about a specific block
app.get("/api/blocks/:block", async (req, res) => {
  const blockNumber = req.params.block;
  try {
    const block = await web3.eth.getBlock(parseInt(blockNumber));
    const serializedBlock = JSON.parse(JSON.stringify(block, (key, value) => typeof value === 'bigint' ? value.toString() : value));
    res.json(serializedBlock);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// Route to get transaction information
app.get("/api/tx/:tx", async (req, res) => {
  const tx = req.params.tx;
  try {
    const serializedTx = JSON.parse(JSON.stringify(await web3.eth.getTransaction(tx), (key, value) => typeof value === 'bigint' ? value.toString() : value));
    res.json(serializedTx);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// Route to get balance for a given address
app.get("/api/balance/:address", async (req, res) => {
  try {
    const balance = await web3.eth.getBalance(req.params.address);
    const balanceEth = await web3.utils.fromWei(balance, 'ether'); 
    
    res.json({ balance: balanceEth.toString() }); // Convert BigInt to string
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve balance" });
  }
});

// Route to get the current Red parameters
app.get("/api/inputredparameters", async (req, res) => {
  try {
    const updatedParameters = req.body;
    console.log("Received Red parameters:", updatedParameters);

    // Overwrite file with new data
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

// Route to update the Red parameter
app.post("/api/inputredparameters", async (req, res) => {
  try {
    const updatedParameters = req.body;
    console.log("Received Red parameters:", updatedParameters);

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

// Route to create a network based on parameters from 'red1' in redParameters.json
app.post("/api/redparameters", (req, res) => {
  try {
    const redParameters = JSON.parse(
      fs.readFileSync("redParameters.json", "utf8")
    );

    if (!Array.isArray(redParameters.reds)) {
      throw new Error("No reds array found in redParameters.json");
    }

    redParameters.reds.forEach((red) => {
      const { nodeCount, chainId } = red;

      createNetwork(nodeCount, chainId);
    });

    res.status(200).json({
      message: "Networks have been successfully created for all reds.",
    });
  } catch (error) {
    console.error("Error creating networks:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/faucet/:address", async(req, res) => {
  try {
    const account = await web3.eth.accounts.decrypt(key_miner, passwd_miner)

    const gasPrice = await web3.eth.getGasPrice();
    const tx = {
      chainId: 8000,
      from: account.address,
      to: req.params.address,
      value: web3.utils.toWei('10', 'ether'),
      gas: 21000,
      gasPrice: gasPrice
    };
    const signedTx = await web3.eth.accounts.signTransaction(tx, account.privateKey);

    const receipt = await JSON.stringify(web3.eth.sendSignedTransaction(signedTx.rawTransaction) , (key, value) => {
      return typeof value === 'bigint' ? value.toString() : value;
  });
   res.send(receipt)

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve balance" });
  }

})


module.exports = app;
