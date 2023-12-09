const app = require("./src/app")
const { exec } = require('child_process');
const { Web3 } = require("web3");
const fs = require("fs")


const key_miner = JSON.parse(fs.readFileSync("../nodos/miner-node/keystore/UTC--2023-11-27T23-33-17.304429318Z--7b6cc9edfc2268658880b888961cc12d67786f5f.json"))
const PORT = 3000
const web3 = new Web3("http://localhost:8545")

const initBlockchain = () => {
  const command = 'cd ../nodos && docker-compose build && docker-compose up';

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al ejecutar el comando: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Error en la salida estándar del comando: ${stderr}`);
      return;
    }

    console.log(`Salida estándar del comando:\n${stdout}`);
  });
};

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
  // initBlockchain();
})

app.get("/api/balance/:account", async(req, res) => {
  web3.eth.getBalance(req.params.account)
    .then(saldo =>{
        res.send(saldo)
    }).catch(err =>{
        res.send(err)
    })
})


app.get("/api/balance/:account", async(req, res) => {
  web3.eth.getBalance(req.params.account)
    .then(saldo =>{
        res.send(saldo)
    }).catch(err =>{
        res.send(err)
    })
})

app.get("/api/faucet/:account", async(req, res) => {
  const account = await web3.eth.accounts.decrypt(key_miner, "secret_pw")
  const tx = {
    chainId: 12345,
    to: req.params.account,
    from: account.address, 
    gas: 21000,
    gasPrice: await web3.eth.getGasPrice(),
    value: web3.utils.toWei("10", 'ether')
  }

  const txSigned = await account.signTransaction(tx)
  const respuesta = await web3.eth.sendSignedTransaction(txSigned.rawTransaction)
  res.send(respuesta)
})