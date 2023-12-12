#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
    source .env
else
    echo "Error: .env file not found. Please create it or set your environment variables manually."
    exit 1
fi

# Set your environment variables here
CHAIN_ID=${CHAIN_ID}
SIGNER_ADDRESS="0x1234567890abcdef"
SIGNER_ADDRESS_BALANCE="100000000000000000000"
METAMASK_ACCOUNT="0x0000000000000000000000000000000000000000"
METAMASK_BALANCE="000000000000000000"
NODE_COUNT=4
ACCOUNT_COUNT=2
RED_COUNT=1


# Set VARIABLES based on a web app input
if [[ -n "$METAMASK_ACCOUNT" ]]; then
  METAMASK_ACCOUNT="$METAMASK_ACCOUNT"
fi
if [[ -n "$METAMASK_BALANCE" ]]; then
  METAMASK_BALANCE="$METAMASK_BALANCE"
fi
if [[ -n "$CHAIN_ID" ]]; then
  CHAIN_ID="$CHAIN_ID"
fi
if [[ -n "$NODE_COUNT" ]]; then
  NODE_COUNT="$NODE_COUNT"
fi
if [[ -n "$ACCOUNT_COUNT" ]]; then
  ACCOUNT_COUNT="$ACCOUNT_COUNT"
fi

# Step 1: Generate Ethereum accounts
echo "Step 1a: Generating Ethereum accounts for the miner node..."
SIGNER_ADDRESS_FILE=$(docker run --rm -v $PWD:/root ethereum/client-go:latest account new --password /root/password.txt --datadir /root/miner-accounts)

echo "Step 1b: Generating Ethereum accounts for other nodes..."
for ((i = 0; i < ACCOUNT_COUNT - 1; i++)); do
  docker run --rm -v $PWD:/root ethereum/client-go:latest account new --password /root/password.txt --datadir /root/other-accounts
done

# Extract the last 40 characters from the file name
echo "Step 1c: Extracting Miner-Account for genesis.json..."

# Capture the output of the Python script in the OUTPUT variable
SIGNER_ADDRESS=$(python3 src/keystore_account_extract.py "$SIGNER_ADDRESS" "miner-accounts")

# Use the OUTPUT variable as needed
echo "The Signer Account will be  $SIGNER_ADDRESS"

# Step 2: Create a custom Genesis file
echo "Step 2: Creating a custom Genesis file..."
cat > $GENESIS_FILE <<EOF
{
  "config": {
    "chainId": $CHAIN_ID,
    "homesteadBlock": 0,
    "eip150Block": 0,
    "eip150Hash": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "eip155Block": 0,
    "eip158Block": 0,
    "byzantiumBlock": 0,
    "constantinopleBlock": 0,
    "petersburgBlock": 0,
    "istanbulBlock": 0,
    "ethash": {}
  },
  "difficulty": "0x20000",
  "gasLimit": "0x2fefd8",
  "extradata": "0x0000000000000000000000000000000000000000000000000000000000000000${SIGNER_ADDRESS}0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "alloc": {
    "$SIGNER_ADDRESS": {
      "balance": "0x$SIGNER_ADDRESS_BALANCE"
    },    
    "$METAMASK_ACCOUNT": {
      "balance": "0x$METAMASK_BALANCE"
    }
  }
}
EOF

# Step 3: Create a bootnodekey using Python script
echo "Step 3: Creating a bootnodekey..."
# Create a directory if it doesn't exist
DATA_DIR="../src/datos"
BOOTNODEKEY=$(python3 src/bootnodekey_generation.py "$DATA_DIR/bootnode.key")
# Use the OUTPUT variable as needed
echo "The BOOTNODEKEY created  $BOOTNODEKEY"

# Step 4: Create a IPBOOTNODE using Python script
echo "Step 4: Creating a enode ..."
# Create a directory if it doesn't exist
IPBOOTNODE=$(python3 src/ipbootnode_generation.py "$DATA_DIR/bootnode.key")
# Use the OUTPUT variable as needed
echo "The IPBOOTNODE created  $IPBOOTNODE"


# Step 5: Create a Docker Compose configuration
echo "Step 5: Creating a Docker Compose configuration..."
cat > docker-compose.yaml <<EOF
version: '3.7'

services:
  geth-bootnode:
    hostname: geth-bootnode
    env_file:
      - .env
    image: geth-client
    volumes:
      - ./datos/bootnode.key:/root/.ethereum/bootnode.key
    build:
      args:
        - ACCOUNT_PASSWORD=\${ACCOUNT_PASSWORD}
    command:
      --nodekeyhex="${BOOTNODEKEY}"
      --ipcdisable
      --networkid=\${CHAIN_ID}
      --netrestrict="\${SUBNET}"
      --port=\${NETWORK_PORT}
    networks:
      - priv-eth-net
    entrypoint: sh -c 'geth init /root/genesis.json && geth'

  geth-rpc-endpoint:
    hostname: geth-rpc-endpoint
    env_file:
      - .env
    image: geth-client
    volumes:
      - ./rpc:/root/.ethereum
      - ./genesis.json:/root/genesis.json
    build:
      args:
        - ACCOUNT_PASSWORD=\${ACCOUNT_PASSWORD}
    depends_on:
      - geth-bootnode    
    command:
      --bootnodes="enode://${IPBOOTNODE}"
      --allow-insecure-unlock
      --http
      --http.addr="0.0.0.0"
      --http.api="eth,web3,net,admin,txpool,clique,personal"
      --http.corsdomain="*"
      --networkid=\${CHAIN_ID}
      --netrestrict="\${SUBNET}"
    ports:
      - "\${IPRPC}:8545"
    networks:
      - priv-eth-net
    entrypoint: sh -c 'geth init /root/genesis.json && geth'
  
  geth-miner:
    hostname: geth-miner
    env_file:
      - .env
    image: geth-client
    volumes:
      - ./miner:/root/.ethereum
      - ./genesis.json:/root/genesis.json
      - ./password.txt:/root/.ethereum/password.sec
      - ./miner-accounts/keystore:/root/.ethereum/keystore
    build:
      args:
        - ACCOUNT_PASSWORD=\${ACCOUNT_PASSWORD}
    depends_on:
      - geth-bootnode
    command:
      --bootnodes="enode://${IPBOOTNODE}"
      --mine
      --miner.etherbase \${SIGNER_ADDRESS}
      --unlock \${SIGNER_ADDRESS} --password password.txt
      --networkid=\${CHAIN_ID}
      --netrestrict="\${SUBNET}"
    networks:
      - priv-eth-net
    entrypoint: sh -c 'geth init /root/genesis.json && geth'

  # Create additional nodes based on NODE_COUNT
  $(for i in $(seq 1 $((NODE_COUNT - 3))); do
    echo "geth-nodo$i:"
    echo "    hostname: geth-nodo$i" 
    echo "    image: geth-client"
    echo "    env_file:"
    echo "      - .env"
    echo "    command:"
    echo "      --bootnodes=enode://${IPBOOTNODE}"
    echo "      --allow-insecure-unlock"
    echo "      --networkid=\${CHAIN_ID}"
    echo "      --netrestrict=172.16.254.0/28"
  done)

networks:
  priv-eth-net:
    driver: bridge
    ipam:
      driver: default
      config:
        - subnet: ${SUBNET}
EOF

# Step 6: Build the Ethereum network
echo "Step 5: Build the Ethereum network..."
docker-compose build

# Step 7: Start the Ethereum network
echo "Step 5: Starting the Ethereum network..."
docker-compose up 

# Deleting folders 
# echo "Deleting a folder /src/datos..."
# rm -rf ./src/datos
# Deleting folders
# echo "Deleting folders miner-accounts and other-accounts..."
# rm -rf ./other-accounts
# rm -rf ./miner-accounts

# Display information
echo "Ethereum network started. You can access the RPC interface at http://localhost:${IPRPC}"
