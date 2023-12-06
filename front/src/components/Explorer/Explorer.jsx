import { Link, Outlet } from "react-router-dom";

export function Explorer() {

  return <div className="container">
    <Link to={`/explorer`}><h1>Explorer</h1></Link>
    <div className="form-control mb-3 d-flex align-items-center border border-2 p-2 rounded-5">
      <input type="email" className="form-control border-0 m-1" id="exampleFormControlInput1" placeholder="Buscar por Dirección de billetera / Hash de transacción / Número de bloque"/>
      <button type="submit" className="btn btn-primary m-1 px-4 py-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
        </svg>
      </button>
    </div>
    <div className="border border-2 rounded p-3">
      <Outlet></Outlet>
    </div>
  </div>
}
