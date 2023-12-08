const { exec, execSync } = require('child_process');

/**
 * Obtiene la lista de redes de ethereum.
 * @returns {Array} - Un array de objetos con el nombre de las redes.
 */
const getNetworksList = () => {

  const networksListCommand = "docker network ls --filter 'name=blockchain*' --format '{{.Name}}'";
 
  const networksList = execSync(networksListCommand).toString();

  const networks = networksList.split('\n').map(name => { 
    const chainId = +name.substring(name.lastIndexOf('-') + 1);

    const containersNumberCommand = `docker ps -a --filter 'network=${name}' --format '{{.Names}}' | wc -l`;
    const nodesNumber = execSync(containersNumberCommand).toString();

    return { 
      name,
      chainId,
      nodesNumber: +nodesNumber
    }
  });

  networks.pop();

  return networks;
}

/**
 * Elimina la red ethereum correspondiente al chainId especificado.
 * @param {number} chainId - El id de la blockchain a eliminar.
 */
const removeNetwork = (chainId) => {
  const command = `cd ../nodos/blockchain-${chainId} && docker-compose down`;

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

/**
 * Crea una nueva red ethereum con el número de nodos y el chainId especificados.
 * @param {number} nodesNumber - El número de nodos de la red.
 * @param {number} chainId - El id de la blockchain a crear.
 */
const createNetwork = (nodesNumber, chainId) => {
  const command = `bash ./exec_network.sh ${nodesNumber} ${chainId}`;

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
  createNetwork
};