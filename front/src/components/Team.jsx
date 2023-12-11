import React, { useState } from "react";
import datos from "../datos.json";

export function Team() {
  const [selectedMember, setSelectedMember] = useState(null);

  const handleMouseOver = (member) => {
    setSelectedMember(member);
  };

  const handleMouseOut = () => {
    setSelectedMember(null);
  };

  const topRowMembers = datos.equipoData.slice(0, 3); // Members for the top row
  const bottomRowMembers = datos.equipoData.slice(3); // Members for the bottom row

  const renderMember = (member, index) => (
    <div
      className="col-md-4 member" // Adjust the column size as needed
      key={index}
      onMouseOver={() => handleMouseOver(member)}
      onMouseOut={handleMouseOut}>
      <div className="card mb-1">
        <img src={member.imagen} alt={member.nombre} className="card-img-top" />
        <div className="card-body">
          <h5 className="card-title">{member.nombre}</h5>
          <p className="card-text">{member.rol}</p>
          {selectedMember === member && (
            <div>
              <p>{member.phrase}</p>
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="card-link">
                <img
                  width="48"
                  height="48"
                  src="https://img.icons8.com/color/48/linkedin.png"
                  alt="linkedin"
                />
              </a>
              <a
                href={member.github}
                target="_blank"
                rel="noopener noreferrer"
                className="card-link">
                <img
                  width="48"
                  height="48"
                  src="https://img.icons8.com/fluency/48/github.png"
                  alt="discord--v2"
                />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="bg-black min-vh-100 d-flex flex-column justify-content-center"
      style={{ background: "#21252a" }}>
      <div className="container my-5 large-text white-text">
        <h1>Quienes Somos</h1>
        <p className="my-5 medium-text white-text">
          "Somos la suma de nuestro conocimiento, somos lo que sabemos que no
          sabemos, somos los que colaboramos con buen rollo, somos los que
          buscamos una mejora continua, somos los que creemos en un mundo
          descentralizado y conectado, somos los que construimos parte de ese
          mundo. Somos CodeCriptoAcademy."
        </p>
        <div className="team black-text small-text">
          <div className="row">{topRowMembers.map(renderMember)}</div>
          <div className="row">{bottomRowMembers.map(renderMember)}</div>
        </div>
      </div>
    </div>
  );
}
