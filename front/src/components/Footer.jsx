import React from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom

export function Footer() {
  return (
    <footer className="bg-dark text-white py-5">
      <div className="container">
        <div className="row">
          <div className="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">
            <div className="d-flex align-items-center">
              <img
                x="0px"
                y="0px"
                width="40"
                height="40"
                src="./img/cadena-de-bloques.png"
                alt="Bloques"
              />
              <a
                href="https://codecrypto.academy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-decoration-none mr-3">
                codecrypto.academy
              </a>
            </div>
            <p>
              Masters en Blockchain & Web3 <br />
              Sé referente Blockchain en 12 meses <br />
              100+ Alumnos Formados 8º Ed <br />
              CodeCrypto World Podcast
            </p>
          </div>
          <div className="col-md-4">
            <h5 className="fw-bold">Who we are?</h5>
            {/* Use the Link component to navigate to the Team component */}
            <ul className="list-unstyled">
              <li>
                <Link to="/team" className="text-white text-decoration-none">
                  Team
                </Link>
              </li>
              <li>
                <a
                  href="https://medium.com/@techieesp/seguridad-en-tu-billetera-digital-metamask-adb51f446504"
                  className="text-white text-decoration-none">
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="https://open.spotify.com/show/4sh7lfaLPWjScBNBfcF3lu"
                  className="text-white text-decoration-none">
                  Podcast
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/cheetah-alo/EthereumPrivateRed/branches"
                  className="text-white text-decoration-none">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
          <div className="col-md-4">
            <h5 className="fw-bold">Contact Us</h5>
            <address>
              <i className="fas fa-home me-2"></i> Madrid, ESP <br />
              <i className="fas fa-envelope me-2"></i> codecrypto@codecrypto.com{" "}
              <br />
              <i className="fas fa-phone me-2"></i> +34 654 768 987
            </address>
          </div>
        </div>
        <hr className="my-4" /> {/* Add a horizontal line for separation */}
        <div className="row">
          <div className="col-md-12 text-center">
            <p>
              &copy; {new Date().getFullYear()} codecrypto.academy | All Rights
              Reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
