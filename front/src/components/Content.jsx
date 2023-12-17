import React, { useState, useEffect } from "react";
import { Parallax } from "react-parallax";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";
import data from "../datos.json";

export function Content() {
  const [cards, setCards] = useState([]);
  const [buildingText, setBuildingText] = useState({ es: "", en: "" });

  useEffect(() => {
    setCards(data.cards);
    setBuildingText(data.buildingText);
  }, []);

  const splitText = (text) => {
    const words = text.split(" ");
    const halfLength = Math.ceil(words.length / 2);
    return {
      firstPart: words.slice(0, halfLength).join(" "),
      secondPart: words.slice(halfLength).join(" "),
    };
  };

  return (
    <div>
      <section className="text-white">
        <Parallax bgImage={"../img/Ethereum3.png"} strength={400}>
          <div
            style={{
              height: "100vh",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              alignItems: "center",
              justifyItems: "center",
            }}>
            <div
              className="text-content-build div-left"
              style={{
                textAlign: "left",
                padding: "10px 20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                fontSize: "28px",
              }}>
              {splitText(buildingText.es).firstPart}
              <br />
              {splitText(buildingText.es).secondPart}
            </div>
            <div
              className="text-content-build div-right"
              style={{
                textAlign: "right",
                padding: "10px 20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                fontSize: "28px",
              }}>
              {splitText(buildingText.en).firstPart}
              <br />
              {splitText(buildingText.en).secondPart}
            </div>
          </div>
        </Parallax>
      </section>

      <section className="m-5 d-flex justify-content-center">
        {cards.map((card, index) => (
          <Card
            key={index}
            className="card m-3 w-25 h-25 timeline"
            style={{ border: "0px solid black" }}>
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
        ))}
      </section>
    </div>
  );
}
