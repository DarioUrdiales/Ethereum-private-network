

import { Link } from "react-router-dom"
import "../src/index.css"

function Logo() {
    return <img x="0px" y="0px" width="40" height="40" src="./img/eth.png" alt="Ethereum Logo" className="mr-3"></img>

    
}

export function Header(){ 
    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark p-2">
                <div className="container-fluid d-flex justify-content-center">
                <Logo className='mr-2'></Logo>
                <Link to='/' className="navbar-brand p-2">ETP</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                
                <div className="collapse navbar-collapse" id="navbarNavDropdown">
                    <ul className="navbar-nav">
                    <li className="nav-item">
                        <Link to='/faucet' className="nav-link mx-2 active" aria-current="page">Faucet</Link>
                    </li>
                    <li className="nav-item ">
                        <Link to='/transfer' className="nav-link mx-2 active" aria-current="page">Transfer</Link>
                    </li>
                    </ul>
                </div>
                </div>        
            </nav>
        </div>

    )
    
}