FROM ethereum/client-go:alltools-latest
# Alternatively, you can uncomment the following line to use a specific version:
# FROM ethereum/client-go:v1.10.1

ARG ACCOUNT_PASSWORD

COPY genesis.json .

COPY miner-node/keystore /root/.ethereum/keystore

RUN geth init ./genesis.json  \
    && echo ${ACCOUNT_PASSWORD} > ./pwd.txt


ENTRYPOINT ["geth"]
