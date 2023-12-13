import { ethers } from 'ethers'
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form'

export function Transfer() {
  if (window.ethereum == null) 
    return <h3>Wallet Web3 no instalada</h3>

  const provider = new ethers.BrowserProvider(window.ethereum)

  const {register, handleSubmit} = useForm()
  const [account, setAccount] = useState(null)
  const [tx, setTx] = useState(null)
  const [balance, setBalance] = useState(0)
  const [quantity, setQuantity] = useState('')

  useEffect(() => {
    window.ethereum.request({
      method: "eth_requestAccounts"
    }).then(accounts => {
      setAccount(accounts[0])
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0])
      })
    })
  })

  useEffect(() => {
    if (!account) return
    getBalance()
    // setTx(null)
  }, [account])

  async function getBalance(){
    const balance = await provider.getBalance(account)
    setBalance(balance)
  }

  async function sendTransaction(data){
    // When sending a transaction, the value is in wei, so parseEther
    // converts ether to wei.

    const signer = await provider.getSigner();
    const amount = ethers.parseEther(quantity.toString())
    try {
      const tx1 = await signer.sendTransaction({
        to: data.address,
        value: amount
      })
      console.log("Post")
    } catch (error) {
      console.log("Error")
      console.log(error)
    }

    console.log("fin")
    // Often you may wish to wait until the transaction is mined
    // const receipt = await tx1.wait();
    // console.log("Enviando transaccion")
    // console.log(receipt)
  }

  async function calculateMax(){
    const {gasPrice} = await provider.getFeeData()
    const totalFee = balance - 21000n * gasPrice 

    setQuantity(ethers.formatUnits(totalFee, "ether"))
  }




  return (
    <div className='d-flex align-items-center justify-content-center'
      style={{
        height: '90vh',
        background: 'radial-gradient(circle, rgba(2,0,36,1) 0%, rgba(7,7,119,1) 0%, rgba(0,0,0,1) 100%)'}}
    >
      <div class='w-50 border border-2 border-primary rounded-3 p-3 shadow' style={{background: "#090730"}} >
        <h3 className='text-light'>Saldo actual: {ethers.formatEther(balance)} ETH</h3>
        <form onSubmit={handleSubmit(sendTransaction)} className='d-flex flex-column gap-2'>

          <div className="form-floating">
            <input style={inputStyle} type="number" className="form-control" id="amount" placeholder="" {...register("amount")} step="any" 
              value={quantity} onChange={(event) => setQuantity(event.target.value)}/>
            <label className='text-light' htmlFor="amount">Cantidad</label>
            <button className="btn btn-link text-decoration-none position-absolute top-50 end-0 translate-middle" 
              type="button" onClick={calculateMax}>max</button>
          </div>

          <div className="form-floating">
            <input style={inputStyle} type="text" className="form-control" id="address" placeholder="" {...register("address")} />
            <label className='text-light' htmlFor="address">Dirección de destino</label>
          </div>

          <button type="submit" className="btn btn-primary fs-5">Realizar transferencia</button>
        </form>
      </div>
    </div>
  );
}


const inputStyle = {
  border: '1px solid',
  background: 'linear-gradient(90deg, rgba(32,32,69,1) 0%, rgba(46,46,73,1) 50%, rgba(47,47,83,1) 100%)'
}