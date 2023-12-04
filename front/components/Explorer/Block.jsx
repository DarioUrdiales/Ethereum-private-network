import { useQuery } from "react-query"
import { Link, useParams } from "react-router-dom"
import { getTimeAgo } from "../../src/utils/functions"


export function Block(){
    const { block } = useParams()
    const {isLoading, isError, data, error} = useQuery(['blocks', block], async () => {
        const response = await fetch(`http://localhost:3000/api/blocks/${block}`)
        const data = await response.json()
        return data
    })
    
    if (isLoading)
        return <h2>Loading...</h2>
    if (isError)
        return <h2>{error.toString()}</h2>

    console.log(data)
    return <div className="border border-2 rounded p-3">
        <h2>Bloque #{block}</h2>
        <table className="table">
            <tbody>
                <tr>
                    <th>Hash</th>
                    <td>{data.hash}</td>
                </tr>
                <tr>
                    <th>Hash padre</th>
                    <td>{data.parentHash}</td>
                </tr>
                <tr>
                    <th>Validador</th>
                    <td><Link to={`/explorer/address/${data.miner}`}>{data.miner}</Link></td>
                </tr>
                <tr>
                    <th>Gas usado</th>
                    <td>{data.gasUsed} wei</td>
                </tr>
                <tr>
                    <th>Antigüedad</th>
                    <td>{getTimeAgo(data.timestamp)}</td>
                </tr>
                <tr>
                    <th>Número de transacciones</th>
                    <td>
                        {data.transactions.length}
                        <ul>
                            {data.transactions.map((t,i) => <li key={i}><Link to={`/explorer/tx/${t}`}>{t}</Link></li>)}
                        </ul>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
}