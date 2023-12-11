import { Link } from "react-router-dom";
import "../index.css";

function Logo() {
  return (
    <img
      x="0px"
      y="0px"
      width="40"
      height="40"
      src="./img/eth.png"
      alt="Ethereum Logo"
      className="mr-3"></img>
  );
}

export function Header() {
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark p-2 fixed-top">
        <div className="container-fluid d-flex justify-content-center">
          <Logo className="mr-2"></Logo>
          <Link to="/" className="navbar-brand p-2">
            Ethereum Team Project
          </Link>
        </div>
      </nav>
    </div>
  );
}
