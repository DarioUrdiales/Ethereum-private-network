# Guide to Setting Up a Private Ethereum Network

The Ethereum network is a peer-to-peer network consisting of multiple nodes running Ethereum clients such as Geth or OpenEthereum.

For this project, a private network has been configured with 3 nodes as follows:

1. **Bootnode:** This is the bootstrap node used for peer discovery. It listens on the default port 30303, and other nodes joining the network first connect to this bootnode.
2. **JSON-RPC Endpoint:** This node exposes the JSON-RPC API through an HTTP endpoint on port 8545. Port 8545 of this node container is exposed to the host machine to allow external interaction with this private blockchain.
3. **Miner:** This node is responsible for mining, which is the process of creating a new block on our blockchain. When the miner node successfully mines a new block, it receives rewards in the configured account.

Docker is used to automate the process.

**Step 1: Creating the Node Folder**

Prepare the environment:

Navigate to the root directory of your repository.

Create a folder for the node using the command:

```
mkdir node
```

**Step 2: Creating the Password File**

Generate the file:

Inside the node folder, create a `pwd.txt` file containing the password for the account. This step is essential for the security of your node. You can name the file as you like.

**Step 3: Creating an Ethereum Account**

Account setup:

In the terminal, navigate to the node folder.

Create a new Ethereum account and save it in the `miner-node` folder using the following command, which uses the previously created password file:

```
geth account new --datadir miner-node --password pwd.txt
```

This process will generate a `miner-node` folder, and inside it, a `keystore` subfolder that will host the account to be used for mining and transaction signing.

**Step 4: Creating the genesis.json File**

Initial blockchain configuration:

In the `node` directory, create the `genesis.json` file with the clique consensus protocol configuration. The content will be similar to the following:

```json
{
  "config": {
    "chainId": 12345,
    "homesteadBlock": 0,
    "eip150Block": 0,
    "eip155Block": 0,
    "eip158Block": 0,
    "byzantiumBlock": 0,
    "constantinopleBlock": 0,
    "petersburgBlock": 0,
    "istanbulBlock": 0,
    "berlinBlock": 0,
    "clique": {
      "period": 5,
      "epoch": 30000
    }
  },
  "difficulty": "1",
  "gasLimit": "800000000",
  "extradata": "0x00000000000000000000000000000000000000000000000000000000000000007b6cc9edfc2268658880b888961cc12d67786f5f0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "alloc": {
    "7b6cc9edfc2268658880b888961cc12d67786f5f": { "balance": "50000000000000000000000000000" }
  }
}
```

Important:

* In the "extradata" field, add the account (without the 0x prefix) created in previous steps. It should be placed after the first 64 zeros. This field indicates that the account can sign transactions.
* In the "alloc" field, add the same account (without 0x) to initiate the mining process with an initial balance.

**Step 5: Creating the .env File**

Environment variable configuration:

In the same directory, create a `.env` file with the following variables:

```
NETWORK_ID=12345
NETWORK_PORT=30305
ACCOUNT_PASSWORD=Your password used when creating the account (pwd.txt)
SIGNER_ADDRESS=0x7b6cc9edfc2268658880b888961cc12d67786f5f
```

Note: `ACCOUNT_PASSWORD` should be the same password used to create the account in Step 3.

**Step 6: Creating the Dockerfile**

Initial configuration:

To begin, use the official ethereum/client-go base image. Create a Dockerfile in the current directory, where the genesis.json and .env files are located. The initial configuration in the Dockerfile is done with the `FROM` command, following this example:

```Dockerfile
FROM ethereum/client-go:alltools-latest
```

Subsequently, declare the `ACCOUNT_PASSWORD` argument, which will be essential in later steps. Introduce this argument as follows:

```Dockerfile
ARG ACCOUNT_PASSWORD
```

Next, to incorporate the genesis.json file into our Docker image, use the `COPY` command:

```Dockerfile
COPY genesis.json .
```

In the `RUN` command section, perform two crucial operations:

* Blockchain Initialization: Use genesis.json to initialize the blockchain. This process configures our Ethereum network according to the parameters defined in that file.
* Create a New Account: Using the provided password, create a new Ethereum account. This is done using the commands included in the `RUN` sequence.

Additionally, after completing the initialization, delete the nodekey that was created during this process to maintain security and cleanliness of the environment. The relevant fragment in the Dockerfile would be:

```Dockerfile
RUN geth init ./genesis.json \
    && rm -f ~/.ethereum/geth/nodekey \
    && echo ${ACCOUNT_PASSWORD} > ./pwd.txt
```

Integrated Dockerfile structure:

```Dockerfile
FROM ethereum/client-go:alltools-latest

ARG ACCOUNT_PASSWORD

COPY genesis.json .
COPY miner-node/keystore /root/.ethereum/keystore

RUN geth init ./genesis.json \
    && rm -f ~/.ethereum/geth/nodekey \
    && echo ${ACCOUNT_PASSWORD} > ./pwd.txt

ENTRYPOINT ["geth"]
```

**Step 7: Generating Nodekey and Enode for Bootnode**

Nodekey creation:

Run `bootnode -genkey bootnode.key` to generate `bootnode.key`, which contains the nodekeyhex.

For example, the nodekeyhex might be `1b61dd74b5e59f7f47e6618664513a5d65813712cdcb67c78717a7e7f421f7bf`.

Enode generation:

Run `bootnode -nodekeyhex <nodekeyhex-from-file> -writeaddress` to obtain the enode value.

Build the node URL following the pattern `enode://ENODE-value@IP:PORT`.

**Step 8: Creating the docker-compose.yml File**

Service configuration:

Define the `geth-bootnode`, `geth-miner`, and `geth-rpc-endpoint` services in \`docker-compose

.yml\`, including the necessary configurations.

The configuration would be:

```yaml
version: "3.7"

services:
  geth-bootnode:
    hostname: geth-bootnode
    env_file: .env
    image: geth-client
    build:
      context: .
      args:
        - ACCOUNT_PASSWORD=${ACCOUNT_PASSWORD}
    command:
      [
        "--nodekeyhex=48044a972830ae92ebb62f33c2aa279fc90b7a00f3730346f059608becaa7e0b",
        "--nodiscover",
        "--ipcdisable",
        "--networkid=${NETWORK_ID}",
        "--netrestrict=172.16.254.0/28",
        "--port=${NETWORK_PORT}",
      ]
    networks:
      - priv-eth-net

  geth-rpc-endpoint:
    hostname: geth-rpc-endpoint
    env_file: .env
    image: geth-client
    build:
      context: .
      args:
        - ACCOUNT_PASSWORD=${ACCOUNT_PASSWORD}
    depends_on:
      - geth-bootnode
    command:
      [
        "--bootnodes=enode://95ab6f81910f9cd9f8d319d45c9a07f2f0eff97ac9580880c5df301cf9baa8e6c9a76f43f6fcb9d36f7599d206b79922a876802fffc9e9c3f9acbb849631a86d@geth-bootnode:${NETWORK_PORT}",
        "--allow-insecure-unlock",
        "--http",
        "--http.addr=0.0.0.0",
        "--http.api=eth,web3,net,admin,txpool,clique,personal",
        "--http.corsdomain=*",
        "--networkid=${NETWORK_ID}",
        "--netrestrict=172.16.254.0/28",
      ]
    ports:
      - "8545:8545"
    networks:
      - priv-eth-net

  geth-miner:
    hostname: geth-miner
    env_file: .env
    image: geth-client
    build:
      context: .
      args:
        - ACCOUNT_PASSWORD=${ACCOUNT_PASSWORD}
    depends_on:
      - geth-bootnode
    command:
      [
        "--bootnodes=enode://95ab6f81910f9cd9f8d319d45c9a07f2f0eff97ac9580880c5df301cf9baa8e6c9a76f43f6fcb9d36f7599d206b79922a876802fffc9e9c3f9acbb849631a86d@geth-bootnode:${NETWORK_PORT}",
        "--mine",
        "--miner.etherbase=${SIGNER_ADDRESS}",
        "--miner.gasprice=10",
        "--unlock=${SIGNER_ADDRESS}",
        "--password=pwd.txt",
        "--networkid=${NETWORK_ID}",
        "--netrestrict=172.16.254.0/28",
      ]
    networks:
      - priv-eth-net

networks:
  priv-eth-net:
    driver: bridge
    ipam:
      config:
        - subnet: 172.16.254.0/28
```

**Step 9: Building and Launching with Docker Compose**

Running commands:

If you're on MacOS, make sure Docker Desktop is running.

From the current directory, execute the following commands:

```
docker-compose build
docker-compose up -d
```

**Step 10: Configuration Verification**

Checking functionality:

Once Docker Compose has finished, verify that the nodes are running correctly. You can test that your network is functioning by entering the JavaScript console of Geth:

```
geth attach https://localhost:8545
```

And running some commands:

```javascript
eth.accounts
["0x7b6cc9edfc2268658880b888961cc12d67786f5f"]

eth.getBalance(eth.accounts[0])
50000000000000000000000000000
```

Another check of operations using curl to test interaction with the private network:

Since we've mapped the HTTP-RPC port 8545 of the container to our host machine, you can connect to it at `localhost:8545`.

Node connectivity:

```shell
curl --location --request POST 'localhost:8545' \
--header 'Content-Type: application/json' \
--data-raw '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "admin_peers",
    "params": []
}'
```

As you're communicating with the RPC endpoint node, you will observe that the peer it connects to is the bootnode (recognizable because the enode value matches what was configured as bootnodes parameters in docker-compose.yml).

Last block number of the blockchain:

```shell
curl --location --request POST 'localhost:8545' \
--header 'Content-Type: application/json' \
--data-raw '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "eth_blockNumber",
    "params": []
}'
```

After running the nodes for some time, you should see that this number is greater than 0x0, indicating that our miner node has already created additional blocks after the genesis block.

Get the address of the main account created during image build:

```shell
curl --location --request POST 'localhost:8545' \
--header 'Content-Type: application/json' \
--data-raw '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "eth_accounts",
    "params": []
}'
```

The response will contain a list of created accounts; in this case, there should be only one account for now.

Check balance:

```shell
curl --location --request POST 'localhost:8545' \
--header 'Content-Type: application/json' \
--data-raw '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "eth_getBalance",
    "params": [
        "0x6b5bdb28b81cc0d08767266033b66660915a300f",
        "latest"
    ]
}'
```

If the last block number of our private blockchain is greater than 0x0, you should see a non-zero balance in the account. This first account we created is, by default, the one receiving mining rewards.

***

**Transfer of Funds:**

To create another account as the recipient:

```shell
curl --location --request POST 'http://localhost:8545' \
--header 'Content-type: application/json' \
--data-raw '{
    "jsonrpc": "2.0",
    "id": 5,
    "method": "personal_newAccount",
    "params": [
        "5uper53cr3t"
    ]
}'
```

Before sending a transaction, ensure that the sender's account is unlocked:

```shell
curl --location --request POST 'http://localhost:8545' \
--header 'Content-type: application/json' \
--data-raw '{
    "jsonrpc
```
