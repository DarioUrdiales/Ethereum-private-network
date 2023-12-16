import { Modal, Button } from "react-bootstrap";
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";
import { Plus } from 'react-bootstrap-icons';

export function CustomModal ({ showModal, closeModal, callback, chainId, title, placeholder, control, type }) {
  const { register, handleSubmit } = useForm();

  const submitForm = (data) => {
    callback(chainId, data[control]);
  }

  return (
    <>
      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="d-flex justify-content-center gap-1" onSubmit={handleSubmit(submitForm)}>
            <input className="form-control" placeholder={placeholder} {...register(control)} size={70} type={type}/>
            <Button className="d-flex align-items-center ps-1" variant="primary" type="submit">
              <Plus cursor={'pointer'} size={24}/>Add
            </Button>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

CustomModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  callback: PropTypes.func.isRequired,
  chainId: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  control: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired
};