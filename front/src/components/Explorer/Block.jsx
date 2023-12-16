import { useQuery } from "react-query"
import { Link, useParams } from "react-router-dom"
import { getTimeAgo } from "../../utils/functions"


export function Block(){
    const { block } = useParams()
    const {isLoading, isError, data, error} = useQuery(['blocks', block], async () => {
        const response = await fetch(`http://localhost:3000/api/blocks/${block}`)
        const data = await response.json()
        return data
    })
    
    if (isLoading)
        return <h2 className="text-content-build">Loading...</h2>
    if (isError)
        return <h2>{error.toString()}</h2>

    return <div className="border border-2 rounded p-3">
        <h2 className="text-content-build">Bloque #{block}</h2>
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
                    <th>Gas usado</th>
                    <td>{data.gasUsed} wei</td>
                </tr>
                <tr>
                    <th>Antigüedad</th>
                    <td>{getTimeAgo(data.timestamp)}</td>
                </tr>
                <tr>
                    <th>Transacciones</th>
                    <td>
                        {data.transactions && data.transactions.length > 0 ? (
                        <ul>
                            {data.transactions && data.transactions.map((t, i) => (
                            <p key={i}><Link to={`/explorer/tx/${t}`}>{t}</Link></p>
                            ))}
                        </ul>
                        ): (
                        <ul>
                            <p>No se han realizado transacciones</p>
                        </ul>
                        )}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
}