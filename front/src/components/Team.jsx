import React, { useState } from "react"; // Importing useState
import datos from "../datos.json";
import { Linkedin, Github } from "react-bootstrap-icons";

export function Team() {
  const [selectedMember, setSelectedMember] = useState(null);

  const handleMouseOver = (member) => {
    setSelectedMember(member);
  };

  const handleMouseOut = () => {
    setSelectedMember(null);
  };

  const topRowMembers = datos.equipoData.slice(0, 3);
  const bottomRowMembers = datos.equipoData.slice(3);

  const renderMember = (member, index) => (
    <div
      className="col-md-4 member"
      key={index}
      onMouseOver={() => handleMouseOver(member)}
      onMouseOut={handleMouseOut}>
      <div className="card mb-1">
        <img
          src={member.imagen}
          alt={`Imagen de ${member.nombre}`}
          className="card-img-top"
        />
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
                <Linkedin size={24} />
              </a>
              <a
                href={member.github}
                target="_blank"
                rel="noopener noreferrer"
                className="card-link">
                <Github size={24} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="d-flex justify-content-center">
        {" "}
        <h1 className="text-content-build mt-3 mb-5 text-white">Equipo</h1>
      </div>
      <div
        className="bg-black min-vh-100 d-flex flex-column justify-content-center"
        style={{
          background:
            "radial-gradient(circle, rgba(2,0,36,1) 0%, rgba(7,7,119,1) 0%, rgba(0,0,0,1) 100%)",
        }}>
        <div className="container my-5 large-text white-text">
          <h1>¿Quienes somos?</h1>
          <p className="my-5 medium-text white-text">
            "Somos la suma de nuestro conocimiento, somos lo que sabemos que no
            sabemos, somos los que colaboramos con buen rollo, somos los que
            buscamos una mejora continua, somos los que creemos en un mundo
            descentralizado y conectado, somos los que construimos parte de ese
            mundo. Somos codecrypto.academy."
          </p>
          <div className="team black-text small-text d-flex flex-column justify-content-center">
            <div className="row">{topRowMembers.map(renderMember)}</div>
            <div className="row">{bottomRowMembers.map(renderMember)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
