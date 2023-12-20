const { exec, execSync } = require('child_process');
const fs = require('fs');
const yaml = require('js-yaml');
const path = require("path")
const crypto = require('crypto');
const { generatePassword, generateIpList } = require("../utils/networks.utils");

/**
 * Obtiene la lista de redes de ethereum.
 * @returns {Array} - Un array de objetos con el nombre de las redes.
 */
const getNetworksList = () => {
  const networksListCommand = `docker network ls --filter name="^blockchain" --format {{.Name}}`;
 
  const networksList = execSync(networksListCommand).toString();

  const networks = networksList.split('\n').map(name => { 
    const chainId = name.substring(name.lastIndexOf('-') + 1);

    const containersNumberCommand = `docker ps -a --filter network=${name} --format {{.Names}}`; /*| wc -l*/
    const networkStatusCommand = `docker ps -a --filter network=${name} --format {{.Status}}`;
    const networkPortCommand = `docker ps -a --filter network=${name} --filter name=geth-rpc-endpoint --format {{.Ports}}`

    const nodesList = execSync(containersNumberCommand).toString().split("\n");
    const networkStatus = execSync(networkStatusCommand).toString();
    const port = execSync(networkPortCommand).toString().match(/:(\d{4})/) 
    const status = networkStatus.match(/\b\w+\b/)[0] //Expresión regular para obtener la primera palabra de un texto
    nodesList.pop();
    
    const nodes = nodesList.length;
    const normalNodes = nodesList.filter(node => node.includes("nodo")).length;

    return {
      name,
      chainId,
      nodes,
      normalNodes,
      port: port ? port[1] : '',
      status: status === "Up" ? "Running" : status
    }
  });

  networks.pop();
  return networks;
};

/**
 * Elimina la blockchain correspondiente al chainId especificado.
 * @param {number} chainId - El id de la blockchain a eliminar.
 */
const removeNetwork = (chainId) => {
  //Con script de BASH
  // const command = `cd ../nodos/blockchain-${chainId} && docker-compose down`;
  // execute(command);
  //Con scripts de Node.js
  const blockchainPath = path.join(__dirname, `../../../nodos/blockchain-${chainId}`)
  if (fs.existsSync(blockchainPath)){
      execSync(`cd ${blockchainPath} && docker-compose down`)
      fs.rmSync(blockchainPath, {recursive: true, force: true})
  }
}

/**
 * Crea una nueva blockchain con el número de nodos y el chainId especificados.
 * @param {number} nodesNumber - El número de nodos de la blockchain.
 * @param {number} chainId - El id de la blockchain a crear.
 */
const createNetwork = (nodesNumber, chainId, walletAccount) => {
  //Con script de BASH
  // const command = `bash ./exec_network.sh ${nodesNumber} ${chainId}`;
  // execute(command);
  //Con scripts de Node.js
  const blockchainPath = path.join(__dirname, `../../../nodos/blockchain-${chainId}`)
    
  //Borrar si ya existe con el mismo chainId
  removeNetwork(chainId)
  
  //Crear directorio para almacenar archivos generados
  fs.mkdirSync(blockchainPath)

  //Generamos una contraseña aleatoria y la escribimos en el archivo pwd.txt
  fs.writeFileSync(path.join(blockchainPath, 'pwd.txt'), generatePassword(16))
  
  //Crear la configuración inicial del genesis.json
  const genesis = {
      config: {
          chainId: chainId,
          homesteadBlock: 0,
          eip150Block: 0,
          eip155Block: 0,
          eip158Block: 0,
          byzantiumBlock: 0,
          constantinopleBlock: 0,
          petersburgBlock: 0,
          istanbulBlock: 0,
          clique: {
              period: 15,
              epoch: 30000
          }
      },
      coinbase: "0x0000000000000000000000000000000000000000",
      difficulty: "0x20000",
      extraData: "0x",
      gasLimit: "0x2fefd8",
      alloc: {}
  }
  const accountRegex = /0x([A-F0-9]{40})/i
  const account = execSync(`geth --datadir ${blockchainPath} account new --password ${blockchainPath}/pwd.txt`)
      .toString()
      .match(accountRegex)[1]
  
  genesis.extraData = `0x${'0'.repeat(64)}${account}${'0'.repeat(130)}`
  genesis.alloc[account] = {balance: "1000000000000000000000000"}
  genesis.alloc[walletAccount] = {balance: "1000000000000000000000000"}
  
  fs.writeFileSync(path.join(blockchainPath, 'genesis.json'), JSON.stringify(genesis,null,2))

  //Numero aleatorio entre 10 y 255 para las ips
  const IP_LIST = generateIpList(nodesNumber + 3)
  const IP_ALEATORIA_BOOTNODE = IP_LIST[0]
  const IP_ALEATORIA_RPC = IP_LIST[1]
  const IP_ALEATORIA_MINERO = IP_LIST[2]
  const RANGO_IP_ALEATORIO = crypto.randomInt(10, 255)

  //Numero aleatorio entre 8545 y 9500 para el puerto del nodo rpc
  const PUERTO_RPC = crypto.randomInt(8545, 9500)

  //Generar el bootnode
  execSync(`bootnode --genkey=${blockchainPath}/bootnode.key`)
  const BOOTNODE_KEY = fs.readFileSync(`${blockchainPath}/bootnode.key`).toString()
  
  //Agregar el enode del bootnode al archivo genesis.json
  execSync(`bootnode --writeaddress --addr 172.16.${RANGO_IP_ALEATORIO}.${IP_ALEATORIA_BOOTNODE}:30305 --netrestrict="172.16.${RANGO_IP_ALEATORIO}.0/24" --nodekey=${blockchainPath}/bootnode.key > ${blockchainPath}/bootnode.enode`)
  const BOOTNODE_ENODE = fs.readFileSync(`${blockchainPath}/bootnode.enode`).toString().replace(/\n|\r|\n\r/g,'')
  const ENODE = `enode://${BOOTNODE_ENODE}@172.16.${RANGO_IP_ALEATORIO}.${IP_ALEATORIA_BOOTNODE}:0?discport=30305`
  fs.writeFileSync(path.join(blockchainPath, 'enode.txt'), ENODE)

  //Crear la configuración inicial del docker-compose
  let docker_compose = `
  version: '3.7'

  services:
      geth-bootnode:
          hostname: geth-bootnode
          image: ethereum/client-go:alltools-latest
          volumes:
          - ./bootnode.key:/root/.ethereum/bootnode.key
          - ./genesis.json:/root/genesis.json
          entrypoint: sh -c 'geth init 
              /root/genesis.json && geth  
              --nodekeyhex="${BOOTNODE_KEY}"
              --networkid=${chainId}
              --netrestrict="172.16.${RANGO_IP_ALEATORIO}.0/24"
              --port=30305'
          networks:
              priv-eth-net-${chainId}:
                  ipv4_address: 172.16.${RANGO_IP_ALEATORIO}.${IP_ALEATORIA_BOOTNODE}

      geth-rpc-endpoint:
          hostname: geth-rpc-endpoint
          image: ethereum/client-go:alltools-latest
          volumes:
          - ./genesis.json:/root/genesis.json
          depends_on:
          - geth-bootnode
          networks:
              priv-eth-net-${chainId}:
                  ipv4_address: 172.16.${RANGO_IP_ALEATORIO}.${IP_ALEATORIA_RPC}
          ports:
          - "${PUERTO_RPC}:8545"
          entrypoint: sh -c 'geth init 
              /root/genesis.json && geth     
              --netrestrict="172.16.${RANGO_IP_ALEATORIO}.0/24"    
              --bootnodes="${ENODE}"
              --nat "extip:172.16.${RANGO_IP_ALEATORIO}.${IP_ALEATORIA_RPC}"
              --networkid=${chainId}
              --http 
              --http.addr "0.0.0.0" 
              --http.port 8545 
              --http.corsdomain "*" 
              --http.api "admin,clique,eth,debug,miner,net,txpool,personal,web3"'

      geth-miner:
          hostname: geth-miner
          image: ethereum/client-go:alltools-latest
          volumes:
          - ./genesis.json:/root/genesis.json
          - ./pwd.txt:/root/.ethereum/pwd.sec
          - ./keystore:/root/.ethereum/keystore
          depends_on:
          - geth-bootnode
          networks:
              priv-eth-net-${chainId}:
                  ipv4_address: 172.16.${RANGO_IP_ALEATORIO}.${IP_ALEATORIA_MINERO}
          entrypoint: sh -c 'geth init 
              /root/genesis.json && geth   
              --nat "extip:172.16.${RANGO_IP_ALEATORIO}.${IP_ALEATORIA_MINERO}"
              --netrestrict="172.16.${RANGO_IP_ALEATORIO}.0/24"
              --bootnodes="${ENODE}"
              --miner.etherbase ${account}   
              --mine  
              --unlock ${account}
              --password /root/.ethereum/pwd.sec'
  `
  //Añadir los nodos al docker compose
  for (let i = 1; i <= nodesNumber; i++) {
      //Numero aleatorio entre 10 y 255 para las ips
      const IP_ALEATORIA_NODO = IP_LIST[i+2]
      docker_compose += `
      nodo-${i}:
          hostname: nodo-${i}
          image: ethereum/client-go:alltools-latest
          volumes:
          - ./genesis.json:/root/genesis.json
          depends_on:
          - geth-bootnode
          networks:
              priv-eth-net-${chainId}:
                  ipv4_address: 172.16.${RANGO_IP_ALEATORIO}.${IP_ALEATORIA_NODO}
          entrypoint: sh -c 'geth init
              /root/genesis.json && geth
              --bootnodes="${ENODE}"
              --netrestrict="172.16.${RANGO_IP_ALEATORIO}.0/24"
              --nat "extip:172.16.${RANGO_IP_ALEATORIO}.${IP_ALEATORIA_NODO}"'
      `
  }

  docker_compose += `
  networks:
      priv-eth-net-${chainId}:
          driver: bridge
          ipam:
              driver: default
              config:
              - subnet: 172.16.${RANGO_IP_ALEATORIO}.0/24`

  fs.writeFileSync(path.join(blockchainPath, 'docker-compose.yaml'), docker_compose)

  execute(`cd ${blockchainPath} && docker-compose up`)
}

/**
 * Añade un nuevo nodo a la blockchain especificada.
 * @param {number} chainId - El id de la blockchain a la que se añadirá el nodo.
 * @param {number} nodesCount - El número de nodos a añadir.
 */
const addNode = (chainId, nodesCount) => {
  if (nodesCount === 0) return;

  const networks = getNetworksList();
  const currentNetwork = networks?.find(
    (network) => network?.chainId === chainId
  );

  if (!currentNetwork) return;

  // Paramos la red
  stopNetwork(chainId);

  // Creamos el nuevo nodo y lo añadimos al docker-compose.yaml
  for (let i = 1; i <= nodesCount; i++) {
    createNode(chainId, currentNetwork.normalNodes + i);
  }

  // Arrancamos la red con el nuevo docker-compose.yaml
  setTimeout(() => {
    upNetwork(chainId);
  }, 5000);
};

/**
 * Añade una nueva cuenta a la blockchain especificada.
 * @param {number} chainId - El id de la blockchain a la que se añadirá el nodo.
 * @param {string} account - La dirección de la cuenta a añadir.
 */
const addAccount = (chainId, account) => {
  if (!account || account === "") return;

  downNetwork(chainId);

  const pathNetworkFile = `../nodos/blockchain-${chainId}/genesis.json`;
  const genesisFile = JSON.parse(fs.readFileSync(pathNetworkFile, "utf8"));
  const formattedAddress = account.substring(2);
  console.log({ formattedAddress });
  console.log(genesisFile.alloc);

  genesisFile.alloc[formattedAddress] = {
    balance: "2000000000000000000000000",
  };

  const newGenesisFile = JSON.stringify(genesisFile, null, 2);

  fs.writeFileSync(
    `../nodos/blockchain-${chainId}/genesis.json`,
    newGenesisFile,
    "utf8"
  );

  setTimeout(() => {
    upNetwork(chainId);
  }, 5000);
};

/**
 * Detiene la blockchain correspondiente al chainId especificado.
 * @param {number} chainId - El id de la blockchain a detener.
 */
const stopNetwork = (chainId) => {
  const command = `cd ../nodos/blockchain-${chainId} && docker-compose stop`;

  execute(command);
};

/**
 * Inicia la blockchain correspondiente al chainId especificado.
 * @param {number} chainId - El id de la blockchain a iniciar.
 */
const startNetwork = (chainId) => {
  const command = `cd ../nodos/blockchain-${chainId} && docker-compose start`;

  execute(command);
};

/**
 * Elimina la blockchain correspondiente al chainId especificado.
 * @param {number} chainId - El id de la blockchain a eliminar.
 */
const downNetwork = (chainId) => {
  const command = `cd ../nodos/blockchain-${chainId} && docker-compose down`;

  execute(command);
};

/**
 * Levanta la blockchain correspondiente al chainId especificado.
 * @param {number} chainId - El id de la blockchain a iniciar.
 */
const upNetwork = (chainId) => {
  const command = `cd ../nodos/blockchain-${chainId} && docker-compose up`;

  execute(command);
};

/**
 * Crea un nuevo nodo en la blockchain especificada.
 * @param {number} chainId - El id de la blockchain.
 * @param {number} nodeNumber - El número del nodo a crear.
 */
const createNode = (chainId, nodeNumber) => {
  const pathNetworkFile = `../nodos/blockchain-${chainId}/docker-compose.yaml`;
  const networkFile = yaml.load(fs.readFileSync(pathNetworkFile, "utf8"));
  const nodesList = Object.values(networkFile.services);

  const newNode = JSON.parse(JSON.stringify(nodesList[nodesList.length - 1]));
  const nodeIp = String(
    newNode.networks[`priv-eth-net-${chainId}`].ipv4_address
  );
  const newIp = randomIp(nodeIp, networkFile);

  newNode.hostname = `nodo-${nodeNumber}`;
  newNode.networks[`priv-eth-net-${chainId}`].ipv4_address = newIp;
  newNode.entrypoint = newNode.entrypoint.replace(nodeIp, newIp);

  networkFile.services[`nodo-${nodeNumber}`] = newNode;

  const newNetworkFile = yaml.dump(networkFile);

  fs.writeFileSync(
    `../nodos/blockchain-${chainId}/docker-compose.yaml`,
    newNetworkFile,
    "utf8"
  );
};

const randomIp = (nodeIp, networkFile) => {
  const networkFileSerialized = JSON.stringify(networkFile);

  const randomFraction = Math.random();

  const min = 10;
  const max = 254;
  const randomNumber = Math.floor(randomFraction * (max - min + 1)) + min;
  const newIp =
    nodeIp.substring(0, nodeIp.lastIndexOf(".") + 1) + randomNumber.toString();

  if (!networkFileSerialized.includes(newIp)) return newIp;

  randomIp(nodeIp, networkFile);
};

const execute = (command) => {
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

// Function to handle the database data
async function dbData(updatedParameters, onSuccess, onError) {
  try {
    console.log("Received Red parameters:", updatedParameters);

    // Overwrite file with new data
    fs.writeFile(
      "redParameters.json",
      JSON.stringify(updatedParameters, null, 2),
      (err) => {
        if (err) {
          console.error(err);
          return onError(err);
        }
        onSuccess({ message: "JSON received and stored." });
      }
    );
  } catch (error) {
    console.error(error.message);
    onError({ error: error.message });
  }
}

module.exports = {
  getNetworksList,
  removeNetwork,
  createNetwork,
  addNode,
  addAccount,
  startNetwork,
  stopNetwork,
  dbData,
};
