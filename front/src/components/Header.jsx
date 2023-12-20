import { Link } from "react-router-dom";
import "../index.css";
import datos from "../datos.json";

function Logo({ src, alt }) {
  return <img src={src} alt={alt} className="logo mr-3" />;
}

export function Header() {
  const isExternalLink = (url) => /^https?:\/\//.test(url);

  return (
    <nav className="headertest navbar navbar-expand-lg navbar-height">
      <div className="container-fluid">
        <div className="d-flex align-items-center justify-content-start medium-text white-text ">
          <Logo src="./img/codecriptoacademy.png" alt="Bloques" />
          <Link to="/" className="nav-item nav-link">
            <p className="mb-0">{datos.header.name}</p>
          </Link>
        </div>
        <div className="navbar-nav mx-auto medium-text align-items-center">
          <Logo src="./img/eth.png" alt="Ethereum Logo" />
          <Link to="/" className="nav-item nav-link">
            Proyecto: Crear Blockchains Privadas de Ethereum
          </Link>
        </div>
        <div className="d-flex justify-content-end ">
          {datos.header.links.map((item, index) =>
            isExternalLink(item.link) ? (
              <a
                key={index}
                href={item.link}
                className="nav-item nav-link small-text"
                target="_blank"
                rel="noopener noreferrer">
                {item.text}
              </a>
            ) : (
              <Link
                key={index}
                to={item.link}
                className="nav-item nav-link small-text">
                {item.text}
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
