# EthereumPrivateRed

## Introduction

TODO: Give a short introduction of your project. Let this section explain the objectives or the motivation behind this project.

## Getting Started

TODO: Guide users through getting your code up and running on their own system. In this section you can talk about:

1. Installation process
2. Software dependencies
3. Latest releases
4. API references

## Desplegar la red de ethereum

### Paso 1: Crear un fichero con la contraseña

Creamos un fichero .txt (pwd.txt en este caso) con la contraseña que usaremos para crear la cuenta

### Paso 2: Crear una cuenta

Creamos una nueva cuenta y la guardamos en la carpeta miner-node ejecutando el siguiente comando
```bash
geth account new --datadir miner-node --password pwd.txt
```
Esto nos crea una carpeta miner-node y en su interior la carpeta keystore con la cuenta que vamos a utilizar para minar y firmar

### Paso 3: Crear archivo genesis.json

Creamos el archivo genesis.json con el protocolo de consenso clique
```
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
  "extradata": "0x00000000000000000000000000000000000000000000000000000000000000007b6cc9edfc2268658880b888961cc12d67786f5f0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "alloc": {
    "7b6cc9edfc2268658880b888961cc12d67786f5f": { "balance": "50000000000000000000000000000" }
  }
}
```
En el campo "extradata" debemos añadir la cuenta (sin 0x) que hemos creado anteriormente. Ésta debe colocarse después de los primeros 64 ceros. En este campo le indicamos que esta cuenta puede firmar transacciones.
En el campo "alloc" añadimos la misma cuenta (sin 0x) que será la cuenta en la que se inicie el minado.

### Paso 4: Crear un Dockerfile

Primero necesitamos la imagen base del ethereum/client-go oficial. Creamos un Dockerfile en el directorio actual (junto con los archivos genesis.json y .env) y escribimos la primera línea utilizando el comando FROM como se muestra en el siguiente fragmento de código.

A continuación, vamos a utilizar el argumento ACCOUNT_PASSWORD así hay que declararlo. Necesitamos usar el archivo genesis.json, así que agregamos un comando COPY.

En el comando RUN, haremos dos cosas importantes. Inicializaremos la cadena de bloques utilizando el archivo genesis.json y crearemos una nueva cuenta utilizando la contraseña del argumento. Eliminé el nodekey creado durante la inicialización después de su uso

```
FROM ethereum/client-go:alltools-latest

ARG ACCOUNT_PASSWORD

COPY genesis.json .

COPY miner-node/keystore /root/.ethereum/keystore

RUN geth init ./genesis.json \
    && rm -f ~/.ethereum/geth/nodekey \
    && echo ${ACCOUNT_PASSWORD} > ./password.txt 

ENTRYPOINT ["geth"]
```

### Paso 5: Crear un archivo .env

Creamos un archivo .env configurando la NETWORK_ID, el NETWORK_PORT, la ACCOUNT_PASSWORD y la SIGNER_ADDRESS que usaremos más adelante cuando creemos el archivo yaml del docker compose
```
NETWORK_ID=12345
NETWORK_PORT=30305
ACCOUNT_PASSWORD=secret_pw
SIGNER_ADDRESS=0x7b6cc9edfc2268658880b888961cc12d67786f5f
```

### Paso 6: Crear un nodekey y un enode para el bootnode

Vamos a crear el nodekey para el bootnode y el valor enode del bootnode

Ejecutamos el siguiente comando para crear el nodekey.
```bash
bootnode -genkey bootnode.key
```
Esto creará un archivo bootnode.key en el directorio actual. El archivo tendrá la nodekeyhex guardada en él.

Ahora ejecutamos el siguiente comando para generar la cadena enode
```bash
bootnode -nodekeyhex <nodekeyhex-from-file> -writeaddress
```
En este caso, la nodekeyhex es: 1b61dd74b5e59f7f47e6618664513a5d65813712cdcb67c78717a7e7f421f7bf

La salida de este comando nos dará el valor enode

La URL del nodo puede construirse a partir del valor utilizando el siguiente patrón
```bash
enode://ENODE-value@IP:PORT
```

### Paso 7: Crear el archivo docker-compose

Crearemos un bootnode y 2 nodos menores en el archivo. Vamos a empezar con bootnode.
```
geth-bootnode:
    hostname: geth-bootnode
    env_file:
      - .env
    image: geth-client
    build:
      args:
        - ACCOUNT_PASSWORD=${ACCOUNT_PASSWORD}
    command:
      --nodekeyhex="1b61dd74b5e59f7f47e6618664513a5d65813712cdcb67c78717a7e7f421f7bf"
      --nodiscover
      --ipcdisable
      --networkid=${NETWORK_ID}
      --netrestrict="172.16.254.0/28"
      --port=${NETWORK_PORT}
    networks:
      priv-eth-net:
```

El nombre del servicio es geth-bootnode y también damos el mismo nombre al hostname.

No vamos a utilizar ninguna imagen docker externa sino que utilizaremos la imagen docker personalizada creada a partir de nuestro Dockerfile. Para ello, añadimos el build y proporcionamos el contexto como directorio actual.

En el comando, estamos pasando las banderas necesarias para geth.

Un último punto, todos nuestros nodos necesitan estar conectados, por lo que priv-eth-net bridge se menciona en la sección de red.

```
geth-miner:
    hostname: geth-miner
    env_file:
        - .env
    image: geth-client
    build:
        args:
        - ACCOUNT_PASSWORD=${ACCOUNT_PASSWORD}
    depends_on:
        - geth-bootnode
    command:
        --bootnodes="enode://3506195bad0d414294a2d8dee98858619f002e77ea97f095ccdc4b461ce26176a13330fbb195a268b283ff7a67939f84da59d5920ff53f9a7b200613297607f6@geth-bootnode:${NETWORK_PORT}"
        --mine
        --miner.etherbase ${SIGNER_ADDRESS}
        --miner.gasprice 10
        --unlock ${SIGNER_ADDRESS} --password password.txt
        --networkid=${NETWORK_ID}
        --netrestrict="172.16.254.0/28"
    networks:
        priv-eth-net:
```

El punto más importante aquí es proporcionar la bandera bootnodes en el comando geth. Esta bandera toma una lista. Sólo tenemos un bootnode, por lo que vamos a añadir que sólo. Tenga en cuenta aquí, hemos utilizado @geth-bootnode como la dirección IP / nombre de host en la URL del nodo y el puerto del archivo .env

```
geth-miner:
    hostname: geth-rpc-endpoint
    env_file:
      - .env
    image: geth-client
    build:
      args:
        - ACCOUNT_PASSWORD=${ACCOUNT_PASSWORD}
    depends_on:
      - geth-bootnode    
    command:
      --bootnodes="enode://3506195bad0d414294a2d8dee98858619f002e77ea97f095ccdc4b461ce26176a13330fbb195a268b283ff7a67939f84da59d5920ff53f9a7b200613297607f6@geth-bootnode:${NETWORK_PORT}"
      --allow-insecure-unlock
      --http
      --http.addr="0.0.0.0"
      --http.api="eth,web3,net,admin,txpool,clique,personal"
      --http.corsdomain="*"
      --networkid=${NETWORK_ID}
      --netrestrict="172.16.254.0/28"
      # --authrpc.port="8551"
    ports:
      - "8545:8545"
    networks:
      priv-eth-net:
```
El anterior nodo será el encargado de minar por lo que, este último nodo será el encargado de gestionar las transacciones por lo que necesitamos aplicarle los flags del protocolo http

### Paso 8: Construir y lanzar docker-compose

Ejecutamos los siguientes comandos desde el directorio actual
```bash
# Build images
docker-compose build

# Once build is over, let's run
docker-compose up
```

### Paso 9: Comprobación

Podemos probar que nuestra red funciona entrando en la consola de Javascript del geth
```bash
geth attach https://localhost:8545
```
Y ejecutando algunos comandos
```bash
eth.accounts
["0x7b6cc9edfc2268658880b888961cc12d67786f5f"]

eth.getBalance(eth.accounts[0])
50000000000000000000000000000
```

## Build and Test

TODO: Describe and show how to build your code and run the tests.

## Contribute

TODO: Explain how other users and developers can contribute to make your code better.

If you want to learn more about creating good readme files then refer the following [guidelines Opens in new window or tab](https://docs.microsoft.com/en-us/azure/devops/repos/git/create-a-readme?view=azure-devops). You can also seek inspiration from the below readme files:

* [ASP.NET Core Opens in new window or tab](https://github.com/aspnet/Home)
* [Visual Studio Code Opens in new window or tab](https://github.com/Microsoft/vscode)
* [Chakra Core Opens in new window or tab](https://github.com/Microsoft/ChakraCore)\

* [Oficial documentation for 'ethers' library for version 6](https://docs.ethers.org/v6)