import { useState, useEffect } from 'react';
import Web3 from 'web3';
import { useParams } from "react-router-dom"

export function Address() {
  const [balance, setBalance] = useState(null);
  const { address } = useParams()

  useEffect(() => {
    const web3 = new Web3('http://localhost:8670');
    const getBalance = async () => {
      const weiBalance = await web3.eth.getBalance(address);
      const ethBalance = web3.utils.fromWei(weiBalance, 'ether');
      setBalance(ethBalance);
    };
    getBalance();
  }, [address]);

  return <div>
  <h2>Saldo de la billetera</h2>
  {balance !== null ? <p>El saldo de la billetera <b>{address}</b> es: <b>{balance} ETH</b></p> : <p>Cargando saldo...</p>}
  </div>
}
