if [ "$#" -ne 2 ]; then
  echo "Uso: $0 <numero_nodos> <id_cadena>"
  exit 1
fi

NUM_NODOS=$1
CHAIN_ID=$2

cd ../nodos/scripts && ./crear_red.sh $NUM_NODOS $CHAIN_ID