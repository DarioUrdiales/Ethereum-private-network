import React from "react";
import { Link } from "react-router-dom";
import { Linkedin, Github, Spotify } from "react-bootstrap-icons";
import datos from "../datos.json";

function Logo({ src, alt }) {
  return <img src={src} alt={alt} className="logo mr-3" />;
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white py-4">
      <div className="container">
        {" "}
        {/* Changed from container-fluid to container for padding */}
        <div className="row justify-content-between align-items-center my-2">
          <div className="col-lg-3 col-md-4 d-flex align-items-center">
            <Logo src="./img/codecriptoacademy.png" alt="Bloques" />
            <p className="mb-0">{datos.header.name}</p>
          </div>
          <div className="col-lg-6 col-md-8 text-lg-right text-center">
            <p>
              Masters en Blockchain & Web3. <br />
              Sé referente Blockchain en 12 meses. Más de 100 alumnos formados
              8ª Edición.
            </p>
          </div>
        </div>
        <hr className="my-2" />
        <div className="row">
          {/* Address Section */}
          <div className="col-md-3">
            <h5>DIRECCIÓN</h5>
            <p>
              Madrid, ESP <br />
              Código Postal: 28021 <br />
              Teléfono: +34 634 475 345
            </p>
          </div>

          {/* Helpful Links Section */}
          <div className="col-md-3">
            <h5>ENLACES ÚTILES</h5>
            <Link to="/privacy" className="d-block text-white">
              Política de Privacidad
            </Link>
          </div>

          {/* Contact Section */}
          <div className="col-md-3">
            <div className="contact-section">
              <h5>CONTACTANOS</h5>
              <a href="mailto:codecrypto@codecrypto.com" className="text-white">
                codecrypto@codecrypto.com
              </a>
            </div>
            {/* Social Icons Section */}
            <div className="mt-3">
              <a
                href="https://www.linkedin.com/in/claudiobriceno/"
                target="_blank"
                rel="noopener noreferrer">
                <Linkedin className="icon mx-1" color="white" size={24} />
              </a>
              <a
                href="https://www.linkedin.com/in/jose-viejo-huerta/"
                target="_blank"
                rel="noopener noreferrer">
                <Github className="icon mx-1" color="white" size={24} />
              </a>
              <a
                href="https://open.spotify.com/show/4sh7lfaLPWjScBNBfcF3lu"
                target="_blank"
                rel="noopener noreferrer">
                <Spotify className="icon mx-1" color="white" size={24} />
              </a>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="col-md-3">
            <h5>PODCASTS</h5>
            <p>Subscríbete a nuestro Podcast</p>
            <input
              type="email"
              className="form-control mb-2"
              placeholder="Tu correo electrónico"
            />
            <button className="btn btn-primary">ENVIAR</button>
          </div>
        </div>
        <hr className="my-4" /> {/* Add a horizontal line for separation */}
        <div className="row">
          <div className="col-md-12 text-center">
            <p>
              &copy; {year} {"</codecrypto.academy>"} | Todos los derechos
              reservados
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
