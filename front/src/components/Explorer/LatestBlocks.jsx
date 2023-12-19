import { getTimeAgo } from "../../utils/functions";
import { Link } from "react-router-dom";
import { useQuery } from "react-query";

export function LatestBlocks() {
  const { isLoading, isError, data, error } = useQuery(
    ["blocks"],
    async () => {
      const response = await fetch("http://localhost:3000/api/blocks");
      const data = await response.json();
      return data;
    },
    {
      refetchInterval: 15000,
    }
  );

  if (isLoading) return <h2>Loading...</h2>;
  if (isError) return <h2>{error.toString()}</h2>;

  return (
    <>
      <h2 className="text-content-build white-text">Últimos bloques</h2>
      <table className="table text-white">
        <thead>
          <tr>
            <th>Número de bloque</th>
            <th>Número de transacciones</th>
            <th>Antigüedad</th>
          </tr>
        </thead>
      <tbody>
          {data.map((block, i) => (
            <tr key={i}>
              <td>
                <Link className='link-info' to={`/explorer/block/${block.number}`}>
                  {block.number}
                </Link>
              </td>
              <td>
                {block.transactions && block.transactions.length > 0
                  ? block.transactions.length
                  : "No se han realizado transacciones"}
              </td>
              <td>{getTimeAgo(block.timestamp)}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </>
  );
}
