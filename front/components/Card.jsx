import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

export function Card({ card }) {
  return(
    <>
      <div className="card m-3 w-25 h-25 timeline">
          <Link to={card.link} className="" aria-current="page">
            <img
              src={card.imgPath}
              className="card-img-top img-thumbnail img-content"
              alt={card.alt}
            />
          </Link>
          <div className="card-body">
            <h5 className="card-title">{card.title}</h5>
            <p className="card-text mt-3 mb-3">{card.description}</p>
          </div>
      </div>
    </>
  )
}

Card.propTypes = {
  card: PropTypes.object.isRequired
};