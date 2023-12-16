import { useQuery } from "react-query"
import { Link, useParams } from "react-router-dom"
import { Web3 } from 'web3';
const web3 = new Web3("http://localhost:8670");


export function Tx(){
    const { tx } = useParams()
    const {isLoading, isError, data, error} = useQuery(['tx', tx], async () => {
        const response = await fetch(`http://localhost:3000/api/tx/${tx}`)
        const data = await response.json()
        return data
    })
    
    if (isLoading)
        return <h2>Loading...</h2>
    if (isError)
        return <h2>{error.toString()}</h2>
    
    const valueEth = Web3.utils.fromWei(data.value, 'ether');

    return <div className="border border-2 rounded p-3">
        <h5 className="text-content-build">Transacción {tx}</h5>
        <table className="table">
            <tbody>
                <tr>
                    <th>Chain ID</th>
                    <td>{data.chainId}</td>
                </tr>
                <tr>
                    <th>Número de bloque</th>
                    <td><Link to={`/explorer/block/${data.blockNumber}`}>{data.blockNumber}</Link></td>
                </tr>
                <tr>
                    <th>Hash</th>
                    <td>{data.hash}</td>
                </tr>
                <tr>
                    <th>From</th>
                    <td>{data.from}</td>
                </tr>
                <tr>
                    <th>To</th>
                    <td>{data.to}</td>
                </tr>
                <tr>
                    <th>Cantidad</th>
                    <td>{valueEth}</td>
                </tr>
            </tbody>
        </table>
    </div>
}