import { Link } from "react-router-dom";
import { Parallax } from "react-parallax";

export function Content() {
  return (
    <div>
      <section className="text-white">
        <Parallax bgImage={"../img/Ethereum3.png"} strength={400}>
          <div style={{ height: "100vh" }}>
            <div className="text-white text-content-build justify-content-center div-cent-izda">
              <h1 className="">
                Build Private <br /> Ethereum <br />
                Networks
              </h1>
            </div>
          </div>
          <div className="text-white text-content-build justify-content-center div-cent-dcha">
            <h1 className="">
              Crea tus propias redes privadas de Ethereum con un click
            </h1>
          </div>
        </Parallax>
      </section>
      <section className="m-5 d-flex justify-content-center">
        <div className="card m-3 w-25 h-25 timeline">
          <div className="div-img-content">
            <Link to="/faucet" className="" aria-current="page">
              <img
                src="../img/Faucet2.png"
                className="card-img-top img-thumbnail img-content"
                alt="Faucet"
              />
            </Link>
          </div>
          <div className="card-body">
            <h5 className="card-title">Faucet</h5>
            <p className="card-text mt-3 mb-3">Envia 10eth a tu billetera</p>
          </div>
        </div>
        <div className="card m-3 w-25 h-25 timeline">
          <div className="div-img-content">
            <Link to="/transfer" className="" aria-current="page">
              <img
                src="../img/Transfer2.png"
                className="card-img-top img-thumbnail img-content"
                alt="Transfer"
              />
            </Link>
          </div>
          <div className="card-body">
            <h5 className="card-title">Transfer</h5>
            <p className="card-text mt-3 mb-3">Realiza transferencias entre cuentas</p>
          </div>
        </div>
        <div className="card m-3 w-25 h-25 timeline">
          <div className="div-img-content">
            <Link to="/Redes" className="" aria-current="page">
              <img
                src="../img/redes-eth.png"
                className="card-img-top img-thumbnail img-content"
                alt="Redes"
              />
            </Link>
          </div>
          <div className="card-body">
            <h5 className="card-title">Redes</h5>
            <p className="card-text mt-3 mb-3">Crea tus propias redes de ethereum</p>
          </div>
        </div>
        <div className="card m-3 w-25 h-25 timeline">
          <div className="div-img-content">
            <Link to="/Explorer" className="" aria-current="page">
              <img
                src="../img/explorer-eth.png"
                className="card-img-top img-thumbnail img-content"
                alt="Explorer"
              />
            </Link>
          </div>
          <div className="card-body">
            <h5 className="card-title">Explorer</h5>
            <p className="card-text">Obtén información de los últimos bloques o de un bloque específico</p>
          </div>
        </div>
      </section>
    </div>
  );
}