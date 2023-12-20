import { Link, Outlet, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Alert } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { Web3} from 'web3'



export function Explorer() {
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();
  const [showAlert, setShowAlert] = useState(false);
  const web3 = new Web3("http://localhost:8670");

  
  useEffect(() => {
    // Restablece el formulario cuando cambia la URL
    reset();
    setShowAlert(false);
  }, [location.pathname]);

  const checkExistence = async (data) => {
    try {
      // Validación
      if (!data) {
        setShowAlert(true);
        return false;
      }

      // Bloque
      if (/^\d+\.?\d*$/.test(data)) {
        const blockNumber = parseInt(data, 10);
        const block = await web3.eth.getBlock(blockNumber);
        return !!block;
      }

      // Balance
      else if (data.length === 42) {
        const accounts = await web3.eth.getAccounts();
        const balance = await web3.eth.getBalance(data);
        return accounts.includes(data) && balance !== '0';
      }

      // Transaccion
      else if (data.length === 66) {
        const transaction = await web3.eth.getTransaction(data);
        return !!transaction;
      }

      return false;
    } catch (error) {
      console.error('Error al verificar la existencia:', error);
      return false;
    }
  };

  const submitForm = async (data) => {
    // Validación de datos
    if (!data.data) {
      setShowAlert(true);
      return;
    }
  
    try {
      // Transaccion
      if (data.data.length === 66) {
        const transaccionExiste = await checkExistence(data.data);
        console.log(transaccionExiste);
        if (transaccionExiste) {
          navigate(`/explorer/tx/${data.data}`);
          setShowAlert(false);
        } else {
          setShowAlert(true);
        }
      }
      // Balance
      else if (data.data.length === 42) {
        const balanceExiste = await checkExistence(data.data);
        console.log(balanceExiste);
        if (balanceExiste) {
          navigate(`/explorer/address/${data.data}`);
          setShowAlert(false);
        } else {
          setShowAlert(true);
        }
      }
      // Bloque
      else if (/^\d+\.?\d*$/.test(data.data)) {
        const bloqueExiste = await checkExistence(data.data);
        console.log(bloqueExiste);
        if (bloqueExiste) {
          navigate(`/explorer/block/${data.data}`);
          setShowAlert(false);
        } else {
          setShowAlert(true);
        }
      } else {
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);
      setShowAlert(true);
    }
  };


  return (
    <div>
      <div className="d-flex justify-content-center">
        {" "}
        <Link className='no-underline link-light d-flex justify-content-center align-items-center text-content-build m-3' to={`/explorer`}><h1 className="text-white">Explorer</h1></Link>
      </div>
      <div className="container white-text">
        <form
          onSubmit={handleSubmit(submitForm)}
          className="form-control mb-3 d-flex align-items-center border border-2 p-2 rounded-5">
          <input
            {...register("data")}
            className="form-control border-0 m-1"
            id="exampleFormControlInput1"
            placeholder="Buscar por Dirección de billetera / Hash de transacción / Número de bloque"
          />
          <button type="submit" className="btn btn-primary m-1 px-4 py-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-search"
              viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
            </svg>
          </button>
        </form>
        {showAlert && (
          <Alert variant="danger" onClose={() => setShowAlert(false)} dismissible>
            Por favor, ingrese una transacción, balance o cuenta correctos.
          </Alert>
        )}
        <div className="border border-2 rounded p-3 mb-5 white-text">
          <Outlet></Outlet>
        </div>
      </div>
    </div>
  );
}
