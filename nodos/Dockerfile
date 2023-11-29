FROM ethereum/client-go:alltools-latest

ARG ACCOUNT_PASSWORD

COPY genesis.json .

COPY miner-node/keystore /root/.ethereum/keystore

RUN geth init ./genesis.json \
    && rm -f ~/.ethereum/geth/nodekey \
    && echo ${ACCOUNT_PASSWORD} > ./password.txt 

ENTRYPOINT ["geth"]