# Guía para Configurar una Red Privada de Ethereum

La red de Ethereum es una red entre pares que consta de múltiples nodos que ejecutan el cliente de Ethereum como Geth u OpenEthereum.

Para este proyecto, se ha configurado una red privada con 3 nodos de la siguiente manera:

* **Bootnode**: el nodo de arranque que se utiliza para el descubrimiento de pares. Escucha en el puerto 30303 por defect, los otros nodos que se unen a la red se conectan primero a este bootnode.&#x20;
* **JSON-RPC endpoint:** este nodo expone la API JSON-RPC a través de un punto final HTTP en el puerto 8545. Publicaremos el puerto 8545 de este contenedor de nodo a la máquina host para permitir la interacción externa con esta blockchain privada.&#x20;
* **Minero (Miner)**: este nodo es responsable de la minería (el proceso de crear un nuevo bloque en nuestra blockchain). Cuando el nodo minero extrae un nuevo bloque con éxito, recibe las recompensas en la cuenta configurada.

Para esto se utilizara docker para automatizar el proceso.

### **Paso 1: Creación de la Carpeta del Nodo**

1. **Preparación del Entorno**:
   * Dirígete al directorio raíz de tu repositorio.
   *   Crea una carpeta para el nodo con el comando:

       ```bash
       mkdir node
       ```

### **Paso 2: Creación del Fichero de Contraseña**

1. **Generación del Fichero**:
   * Dentro de la carpeta `node`, crea un fichero `pwd.txt` que contenga la contraseña para la cuenta. Este paso es esencial para la seguridad de tu nodo. Puedes darle el nombre que desees al fichero.

### **Paso 3: Creación de una Cuenta Ethereum**

1. **Configuración de la Cuenta**:
   * En la terminal, sitúate en la carpeta `node`.
   *   Crea una nueva cuenta Ethereum y guárdala en la carpeta `miner-node` utilizando el siguiente comando, que hace uso del fichero de contraseña creado anteriormente:

       ```bash
       geth account new --datadir miner-node --password pwd.txt
       ```
   * Este proceso generará una carpeta `miner-node` y, dentro de ella, una subcarpeta `keystore` que albergará la cuenta a utilizar para la minería y la firma de transacciones.

### **Paso 4: Creación del Archivo `genesis.json`**

1. **Configuración Inicial de la Blockchain**:
   *   En el directorio `node`, crea el archivo `genesis.json` con la configuración del protocolo de consenso clique. El contenido será similar al siguiente:

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
         "extradata": "0x00000000000000000000000000000000000000000000000000000000000000007b6cc9edfc2268658880b888961cc12d67786f5f0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
         "alloc": {
           "7b6cc9edfc2268658880b888961cc12d67786f5f": { "balance": "50000000000000000000000000000" }
         }
       }
       ```
   * **Importante**:&#x20;
     * En el campo `"extradata"`, añade la cuenta (sin el prefijo `0x`) que has creado en pasos anteriores. Esta debe colocarse después de los primeros 64 ceros. Este campo indica que la cuenta puede firmar transacciones.&#x20;
     * En el campo `"alloc"`, añade la misma cuenta (sin `0x`) para iniciar el proceso de minado con un balance inicial.

### **Paso 5: Creación del Archivo .env**

1. **Configuración de Variables de Entorno**:
   *   En el mismo directorio, crea un archivo `.env` con las siguientes variables:

       ```javascript
       NETWORK_ID=12345
       NETWORK_PORT=30305
       ACCOUNT_PASSWORD= Tu contrasena utilizada al crear la cuenta (pwd.txt)
       SIGNER_ADDRESS=0x7b6cc9edfc2268658880b888961cc12d67786f5f
       ```

Nota**:** ACCOUNT\_PASSWORD debe ser la misma contrasena utilizada para crear la cuenta en el [Paso 3.](guia-para-configurar-una-red-privada-de-ethereum.md#paso-3-creacion-de-una-cuenta-ethereum)

### **Paso 6: Creación del Dockerfile**

1. **Configuración Inicial**:

Para comenzar, es necesario utilizar la imagen base oficial `ethereum/client-go`. Para ello, creamos un `Dockerfile` en el directorio actual, donde también se encuentran los archivos `genesis.json` y `.env`. La configuración inicial en el `Dockerfile` se realiza con el comando `FROM`, siguiendo este ejemplo:

```dockerfile
FROM ethereum/client-go:alltools-latest
```

Posteriormente, declaramos el argumento `ACCOUNT_PASSWORD`, que será esencial en pasos siguientes. Este argumento se introduce de la siguiente manera:

```dockerfile
ARG ACCOUNT_PASSWORD
```

Luego, para incorporar el archivo `genesis.json` en nuestra imagen Docker, utilizamos el comando `COPY`:

```dockerfile
COPY genesis.json .
```

En la sección del comando `RUN`, realizaremos dos operaciones cruciales:

1. **Inicialización de la Cadena de Bloques**: Utilizamos `genesis.json` para inicializar la blockchain. Este proceso configura nuestra red Ethereum según los parámetros definidos en dicho archivo.
2. **Creación de una Nueva Cuenta**: Utilizando la contraseña proporcionada, creamos una nueva cuenta Ethereum. Esto se hace mediante los comandos incluidos en la secuencia `RUN`.

Adicionalmente, tras finalizar la inicialización, eliminamos el `nodekey` que se creó durante este proceso, para mantener la seguridad y limpieza del entorno. El fragmento correspondiente en el `Dockerfile` sería:

```dockerfile
RUN geth init ./genesis.json \
    && rm -f ~/.ethereum/geth/nodekey \
    && echo ${ACCOUNT_PASSWORD} > ./pwd.txt 
```

2. **Estructura del Dockerfile integrado**:

```docker
FROM ethereum/client-go:alltools-latest

ARG ACCOUNT_PASSWORD

COPY genesis.json .
COPY miner-node/keystore /root/.ethereum/keystore

RUN geth init ./genesis.json \
    && rm -f ~/.ethereum/geth/nodekey \
    && echo ${ACCOUNT_PASSWORD} > ./pwd.txt 

ENTRYPOINT ["geth"]
```

### **Paso 7: Generación de Nodekey y Enode para el Bootnode**

1. **Creación de Nodekey**:
   * Ejecuta `bootnode -genkey bootnode.key` para generar `bootnode.key`, que contiene la `nodekeyhex`.
   * Por ejemplo, la `nodekeyhex` podría ser `1b61dd74b5e59f7f47e6618664513a5d65813712cdcb67c78717a7e7f421f7bf`.
2. **Generación del Enode**:
   * Ejecuta `bootnode -nodekeyhex <nodekeyhex-from-file> -writeaddress` para obtener el valor `enode`.
   * Construye la URL del nodo siguiendo el patrón `enode://ENODE-value@IP:PORT`.

### **Paso 8: Creación del Archivo docker-compose.yml**

1. **Configuración de los Servicios**:
   * Define los servicios `geth-bootnode`, `geth-miner` y `geth-rpc-endpoint` en `docker-compose.yml`, incluyendo las configuraciones necesarias.
   *   La configuración sería:

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

### **Paso 9: Construcción y Lanzamiento con Docker Compose**

1. **Ejecución de Comandos**:
   * Si estás en MacOS, asegúrate de que Docker Desktop esté en ejecución.
   *   Desde el directorio actual, ejecuta los siguientes comandos:

       ```
       docker-compose build
       docker-compose up -d
       ```

### **Paso 10: Verificación de la Configuración**

1. **Comprobación del Funcionamiento**:
   * Una vez que Docker Compose haya finalizado, verifica que los nodos estén funcionando correctamente. Podemos probar que nuestra red funciona entrando en la consola de Javascript del geth

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

#### Otro check de operaciones usando curl para testear la iteracion con la red privada son:

Habiendo mapeado el puerto HTTP-RPC 8545 del contenedor a nuestra máquina anfitriona, es posible conectarse a él en localhost:8545.

Conectividad de los nodos:

```bash
curl --location --request POST 'localhost:8545' \
--header 'Content-Type: application/json' \
--data-raw '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "admin_peers",
    "params": []
}'
```

<figure><img src="broken-reference" alt=""><figcaption></figcaption></figure>

Dado que se está comunicando con el nodo del punto final RPC, se observará que el par al que se conecta es el bootnode (reconocible porque el valor enode es el mismo que se configuró como parámetros bootnodes en docker-compose.yml).

Ultimo número de bloque de la blockchain:

```bash
curl --location --request POST 'localhost:8545' \
--header 'Content-Type: application/json' \
--data-raw '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "eth_blockNumber",
    "params": []
}'
```

<figure><img src="broken-reference" alt=""><figcaption></figcaption></figure>

Después de ejecutar los nodos por un tiempo, se debería ver que este número es mayor que 0x0, lo que indica que nuestro nodo minero ya ha creado otros bloques después del bloque génesis.

Obtendrá la dirección de la cuenta principal creada durante la construcción de la imagen:

```bash
curl --location --request POST 'localhost:8545' \
--header 'Content-Type: application/json' \
--data-raw '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "eth_accounts",
    "params": []
}'
```

La respuesta contendrá una lista de las cuentas creadas; en este caso, debería haber solo una cuenta por ahora.

<figure><img src="broken-reference" alt=""><figcaption></figcaption></figure>

Corroborar saldo:

```bash
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

Si el último número de bloque de nuestra blockchain privada es mayor que 0x0, deberíamos ver un saldo no nulo en la cuenta. Como esta primera cuenta que creamos es, por defecto, la que recibe las recompensas de la minería.

<figure><img src="broken-reference" alt=""><figcaption></figcaption></figure>

\----------- hasta aqui para el readme

\




Transferencia de fondos, se creará otra cuenta para ser el destinatario:

```bash
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

Antes de enviar una transacción, se debe asegurar de que la cuenta del remitente esté desbloqueada:

```bash
curl --location --request POST 'http://localhost:8545' \
--header 'Content-type: application/json' \
--data-raw '{
    "jsonrpc": "2.0",
    "id": 6,
    "method": "personal_unlockAccount",
    "params": [
        "0x08d1f47128f5c04d7a4aee69e90642645059acd6",
        "5uper53cr3t"
    ]
}'
```

Ahora estamos listos para transferir algunos fondos:

```bash
curl --location --request POST 'localhost:8545' \
--header 'Content-Type: application/json' \
--data-raw '{
    "jsonrpc": "2.0",
    "id": 7,
    "method": "eth_sendTransaction",
    "params": [
        {
            "from": "0x08d1f47128f5c04d7a4aee69e90642645059acd6",
            "to": "0x2bc05c71899ecff51c80952ba8ed

444796499118",
            "value": "0xf4240"
        }
    ]
}'
```

Si la transacción se envía con éxito, se obtendrá el hash de la transacción en retorno.

Finalmente, se verifica si hemos recibido los fondos en la cuenta del destinatario:

```bash
curl --location --request POST 'localhost:8545' \
--header 'Content-Type: application/json' \
--data-raw '{
    "jsonrpc": "2.0",
    "id": 9,
    "method": "eth_getBalance",
    "params": [
        "0x2bc05c71899ecff51c80952ba8ed444796499118",
        "latest"
    ]
}'
```

Se espera ver el mismo valor (0xf4240) que se envió desde la cuenta principal como resultado.

\
