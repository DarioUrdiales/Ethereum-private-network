const fs = require("fs")
const path = require("path")
const crypto = require('crypto');
const { execSync, exec } = require("child_process");
const { generatePassword, generateIpList } = require("../utils/networks.utils");
const { getNetworksList } = require("../services/networks.service");


const crear_red = (nodesNumber, chainId) => {
    const blockchainPath = path.join(__dirname, `../../../nodos/blockchain-${chainId}`)
    
    //Borrar si ya existe con el mismo chainId
    borrar_red(chainId)
    
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
    const account = execSync(
        `geth --datadir ${blockchainPath} account new --password ${blockchainPath}/pwd.txt`)
        .toString()
        .match(accountRegex)[1]
    
    genesis.extraData = `0x${'0'.repeat(64)}${account}${'0'.repeat(130)}`
    genesis.alloc[account] = {balance: "1000000000000000000000000"}
    
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

    exec(`cd ${blockchainPath} && docker-compose up`)
}


const borrar_red = (chainId) => {
    const blockchainPath = path.join(__dirname, `../../../nodos/blockchain-${chainId}`)
    
    if (fs.existsSync(blockchainPath)){
        execSync(`cd ${blockchainPath} && docker-compose down`)
        fs.rmSync(blockchainPath, {recursive: true, force: true})
    }
}


// crear_red(6, 12345)

console.log(getNetworksList())
 
