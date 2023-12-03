import { Parallax } from "react-parallax";
import Card from 'react-bootstrap/Card';
import { Link } from "react-router-dom";

export function Content() {
  const cards = [
    { link: "/faucet", imgPath: "../img/Faucet2.png", title: "Faucet", alt: "Faucet", description: "Envía 10eth a tu billetera" },
    { link: "/transfer", imgPath: "../img/Transfer2.png", title: "Transfer", alt: "Transfer", description: "Realiza transferencias entre cuentas" },
    { link: "/redes", imgPath: "../img/redes-eth.png", title: "Redes", alt: "Redes", description: "Crea tus propias redes ethereum" },
    { link: "/explorer", imgPath: "../img/explorer-eth.png", title: "Explorer", alt: "Explorer", description: "Obtén información de un bloque, de una transacción o de una cuenta" }
  ];

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
        {
          cards.map((card, index) => (
            <Card key={index} className="card m-3 w-25 h-25 timeline">
              <Link to={card.link}>
                <div className="div-img-content">
                  <Card.Img 
                    className="img-thumbnail img-content" 
                    variant="top" 
                    alt={card.alt} 
                    src={card.imgPath}
                  />
                </div>
              </Link>
              <Card.Body>
                <Card.Title>{card.title}</Card.Title>
                <Card.Text>{card.description}</Card.Text>
              </Card.Body>
            </Card>
          ))
        }
      </section>
    </div>
  );
}