import { getTimeAgo } from "../../src/utils/functions";
import { Link } from "react-router-dom"
import { useQuery } from "react-query";

export function LatestBlocks(){
    const {isLoading, isError, data, error} = useQuery(['blocks'], async () => {
        const response = await fetch("http://localhost:3000/api/blocks")
        const data = await response.json()
        return data
      })
    
    if (isLoading)
    return <h2>Loading...</h2>
    if (isError)
    return <h2>{error.toString()}</h2>

    return <>
        <h2>Últimos bloques</h2>
        <table className="table table-striped">
            <thead>
            <tr>
                <th>Número de bloque</th>
                <th>Número de transacciones</th>
                <th>Antigüedad</th>
            </tr>
            </thead>
            <tbody>
            {data.map((block, i) => <tr key={i}>
                <td><Link to={`/explorer/block/${block.number}`}>{block.number}</Link></td>
                <td>{block.transactions.length}</td>
                <td>{getTimeAgo(block.timestamp)}</td>
            </tr>)}
            </tbody>
        </table>
        </>
}