import { Link } from "react-router-dom";
import "../index.css";
import datos from "../datos.json";

function Logo({ src, alt }) {
  return <img src={src} alt={alt} className="logo mr-3" />;
}

export function Header() {
  const isExternalLink = (url) => /^https?:\/\//.test(url);

  return (
    <header className="bg-dark text-white">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <div className="d-flex align-items-center justify-content-start medium-text">
            <Logo src="./img/codecriptoacademy.png" alt="Bloques" />
            <p className="mb-0">{datos.header.name}</p>
          </div>
          <div className="navbar-nav mx-auto medium-text">
            <Logo src="./img/eth.png" alt="Ethereum Logo" />
            <Link to="/" className="nav-item nav-link">
              Proyecto: Crear Blockchains Privadas de Ethereum
            </Link>
          </div>
          <div className="d-flex justify-content-end">
            {datos.header.links.map((item, index) =>
              isExternalLink(item.link) ? (
                <a
                  key={index}
                  href={item.link}
                  className="nav-item nav-link medium-text"
                  target="_blank"
                  rel="noopener noreferrer">
                  {item.text}
                </a>
              ) : (
                <Link
                  key={index}
                  to={item.link}
                  className="nav-item nav-link medium-text">
                  {item.text}
                </Link>
              )
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
