export function Footer() {
    return (
    <footer className="text-center text-lg-start bg-body-tertiary text-white bg-dark border-top border-secondary">
      <section className="d-flex justify-content-center justify-content-lg-between border-bottom ">
        <div className="container text-center text-md-start mt-5">
          <div className="row mt-3">
            <div className="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">
              <h6 className="text-uppercase fw-bold mb-4">
                <img x="0px" y="0px" width="40" height="40" src="./img/cadena-de-bloques.png" alt="Bloques"></img> 
                codecrypto.academy
              </h6>
              <p>
                 Masters en Blockchain & Web3 <br/>
                 Sé referente Blockchain en 12 meses <br/>
                 100+ Alumnos Formados 8º Ed <br/>
                 CodeCrypto World Podcast
              </p>
            </div>

            <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mb-4">
              <h6 className="text-uppercase fw-bold mb-4">
                Desarroladores
              </h6>
              <p>
                <a href="https://www.linkedin.com/in/alejandrodelmedico/" className="text-reset">Alejandro Del Medico</a>
              </p>
              <p>
                <a href="https://www.linkedin.com/in/jackybarraza/" className="text-reset">Jacky Barraza</a>
              </p>
              <p>
                <a href="https://www.linkedin.com/in/dariourdiales/" className="text-reset">Dario Rodriguez</a>
              </p>
              <p>
                <a href="https://www.linkedin.com/in/natalia-molina-fernandez/" className="text-reset">Natalia Molina</a>
              </p>
            </div>

            <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4">
              <h6 className="text-uppercase fw-bold mb-4">Contacto</h6>
              <p><i className="fas fa-home me-3"></i> Madrid, ESP</p>
              <p>
                <i className="fas fa-envelope me-3"></i>
                codecrypto@codecrypto.com
              </p>
              <p><i className="fas fa-phone me-3"></i> +34 654 768 987</p>
            </div>

          </div>

        </div>
      </section>
    </footer>
    )
}