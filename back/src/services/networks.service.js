const { exec, execSync } = require('child_process');
const fs = require('fs');
const yaml = require('js-yaml');

/**
 * Obtiene la lista de redes de ethereum.
 * @returns {Array} - Un array de objetos con el nombre de las redes.
 */
const getNetworksList = () => {

  const networksListCommand = "docker network ls --filter 'name=blockchain*' --format '{{.Name}}'";
 
  const networksList = execSync(networksListCommand).toString();

  const networks = networksList.split('\n').map(name => { 
    const chainId = +name.substring(name.lastIndexOf('-') + 1);

    const containersNumberCommand = `docker ps -a --filter 'network=${name}' --format '{{.Names}}'`; /*| wc -l*/
    const networkStatusCommand = `docker ps -a --filter 'network=${name}' --format '{{.Status}}'`;

    const nodesList = execSync(containersNumberCommand).toString().split("\n");
    const networkStatus = execSync(networkStatusCommand).toString();
    
    nodesList.pop();
    
    const nodes = nodesList.length;
    const normalNodes = nodesList.filter(node => node.includes("nodo")).length;

    return { 
      name,
      chainId,
      nodes,
      normalNodes,
      status: networkStatus.substring(0, networkStatus.indexOf(" "))
    }
  });

  networks.pop();

  return networks;
}

/**
 * Elimina la blockchain correspondiente al chainId especificado.
 * @param {number} chainId - El id de la blockchain a eliminar.
 */
const removeNetwork = (chainId) => {
  const command = `cd ../nodos/blockchain-${chainId} && docker-compose down`;

  execute(command);
}

/**
 * Crea una nueva blockchain con el número de nodos y el chainId especificados.
 * @param {number} nodesNumber - El número de nodos de la blockchain.
 * @param {number} chainId - El id de la blockchain a crear.
 */
const createNetwork = (nodesNumber, chainId) => {
  const command = `bash ./exec_network.sh ${nodesNumber} ${chainId}`;

  execute(command);
}

/**
 * Añade un nuevo nodo a la blockchain especificada.
 * @param {number} chainId - El id de la blockchain a la que se añadirá el nodo.
 * @param {number} nodesCount - El número de nodos a añadir.
 */
const addNode = (chainId, nodesCount) => {
  if (nodesCount === 0) return;

  const networks = getNetworksList();
  const currentNetwork = networks?.find(network => network?.chainId === chainId);
  
  if (!currentNetwork) return;

  // Paramos la red  
  stopNetwork(chainId);

  // Creamos el nuevo nodo y lo añadimos al docker-compose.yaml 
  for (let i = 1; i <= nodesCount; i++) {
    createNode(chainId, currentNetwork.normalNodes + i);    
  }

  // Arrancamos la red con el nuevo docker-compose.yaml
  setTimeout(() => {
    startNetwork(chainId);
  }, 5000);
}

/**
 * Detiene la blockchain correspondiente al chainId especificado.
 * @param {number} chainId - El id de la blockchain a detener.
 */
const stopNetwork = (chainId) => {
  const command = `cd ../nodos/blockchain-${chainId} && docker-compose stop`;
  
  execute(command);
}

/**
 * Inicia la blockchain correspondiente al chainId especificado.
 * @param {number} chainId - El id de la blockchain a iniciar.
 */
const startNetwork = (chainId) => {
  const command = `cd ../nodos/blockchain-${chainId} && docker-compose up`;
  
  execute(command);
}

/**
 * Crea un nuevo nodo en la blockchain especificada.
 * @param {number} chainId - El id de la blockchain.
 * @param {number} nodeNumber - El número del nodo a crear.
 */
const createNode = (chainId, nodeNumber) => {
  const pathNetworkFile = `../nodos/blockchain-${chainId}/docker-compose.yaml`;
  const networkFile = yaml.load(fs.readFileSync(pathNetworkFile, 'utf8'));
  const nodesList = Object.values(networkFile.services);
  
  const newNode = JSON.parse(JSON.stringify(nodesList[nodesList.length - 1]));
  const nodeIp = String(newNode.networks[`priv-eth-net-${chainId}`].ipv4_address);
  const newIp = nodeIp.substring(0, nodeIp.lastIndexOf('.')) + '.' + randomIp();

  newNode.hostname = `nodo-${nodeNumber}`;
  newNode.networks[`priv-eth-net-${chainId}`].ipv4_address = newIp;
  newNode.entrypoint = newNode.entrypoint.replace(nodeIp, newIp);

  networkFile.services[`nodo-${nodeNumber}`] = newNode;
  
  const newNetworkFile = yaml.dump(networkFile);

  fs.writeFileSync(`../nodos/blockchain-${chainId}/docker-compose.yaml`, newNetworkFile, 'utf8');
}

const randomIp = () => {
  const randomFraction = Math.random();

  const min = 10;
  const max = 254;
  const randomNumber = Math.floor(randomFraction * (max - min + 1)) + min;

  return randomNumber;
}

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
}

module.exports = { 
  getNetworksList,
  removeNetwork,
  createNetwork,
  addNode
};