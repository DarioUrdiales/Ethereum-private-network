import { useState, useEffect } from "react";
import "../../index.css";
import { useNavigate } from "react-router-dom";

export function CreateNetwork() {
  const [newRed, setNewRed] = useState({
    chainId: "",
    nodeCount: 0,
    account: "",
  });
  const [redSpecifications, setRedSpecifications] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [creatingRed, setCreatingRed] = useState(false);
  const [creationMessage, setCreationMessage] = useState("");
  const [isCreationSuccessful, setIsCreationSuccessful] = useState(false);
  const [isSentSuccessfully, setIsSentSuccessfully] = useState(false);
  const [variables, setVariables] = useState({
    redId: "",
    chainId: "",
    nodeCount: "",
    address: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchRedParameters();
  }, []);

  const validateNodeCount = (value) => {
    const number = parseInt(value, 10);
    return !isNaN(number) && number <= 100
      ? null
      : "El número de nodos debe ser un entero positivo y no mayor de 100.";
  };

  const validateChainId = (value) => {
    const number = parseInt(value, 10);
    return !isNaN(number) && number > 1
      ? null
      : "El ID de la cadena debe ser un número entero positivo diferente de 1.";
  };

  const validateAccount = (value) => {
    if (!value || value.trim() === "") {
      return "";
    }
    const isValidEthereumAccount = /^0x[a-fA-F0-9]{40}$/.test(value);
    return isValidEthereumAccount
      ? ""
      : "Por favor ingrese una dirección de billetera Ethereum válida.";
  };

  const submitRed = () => {
    const nodeCountError = validateNodeCount(newRed.nodeCount);
    const chainIdError = validateChainId(newRed.chainId);
    const accountError = validateAccount(newRed.account);

    let errorMessage = "";
    if (nodeCountError) errorMessage += nodeCountError + " ";
    if (chainIdError) errorMessage += chainIdError + " ";
    if (accountError) errorMessage += accountError;

    if (errorMessage) {
      alert(`Input no valido. ${errorMessage.trim()}`);
      return false;
    }

    const isDuplicateChainId = redSpecifications.some(
      (red) => red.chainId.toString() === newRed.chainId
    );
    if (isDuplicateChainId) {
      alert(
        "El ID de la cadena ya existe. Por favor, introduzca un ID de cadena diferente."
      );
      return false;
    }

    const newRedData = {
      ...newRed,
      redId:
        editIndex !== null
          ? `red${editIndex + 1}`
          : `red${redSpecifications.length + 1}`,
      chainId: parseInt(newRed.chainId, 10),
      nodeCount: parseInt(newRed.nodeCount, 10),
      account: newRed.account,
    };

    const updatedReds =
      editIndex !== null
        ? redSpecifications.map((red, index) =>
            index === editIndex ? newRedData : red
          )
        : [...redSpecifications, newRedData];

    setRedSpecifications(updatedReds);
    setNewRed({ chainId: "", nodeCount: 0, account: "" });
    setEditIndex(null);
    return true;
  };

  const editRed = (index) => {
    setNewRed({ ...redSpecifications[index] });
    setEditIndex(index);
  };

  const deleteRed = (index) => {
    const updatedReds = redSpecifications.filter((_, i) => i !== index);
    setRedSpecifications(updatedReds);
    if (editIndex === index) {
      setNewRed({ chainId: "", nodeCount: 0 });
      setEditIndex(null);
    }
  };

  const handleChainIdChange = (e) => {
    setNewRed({ ...newRed, chainId: e.target.value });
  };

  const handleNodeCountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setNewRed({ ...newRed, nodeCount: value ? parseInt(value, 10) : "" });
  };

  const handleAccountChange = (e) => {
    setNewRed({ ...newRed, account: e.target.value });
  };

  const handleAddNetwork = async () => {
    if (!submitRed()) {
      return;
    }

    // If you want to create a new network and send updated specifications
    const newRedData = {
      ...newRed,
      redId: `red${redSpecifications.length + 1}`,
      chainId: parseInt(newRed.chainId, 10),
      nodeCount: parseInt(newRed.nodeCount, 10),
      account: newRed.account,
    };

    // Add newRedData to the existing specifications
    const updatedReds = [...redSpecifications, newRedData];

    // Assuming you want to send the updated list to the backend
    await updateVariables(updatedReds);

    // Only call createRed if a new network is indeed being created
    // if (redSpecifications.length === 0) {
    //   await createRed();
    // }
  };

  const fetchRedParameters = async () => {
    fetch("http://localhost:3000/api/networks/inputredparameters")
      .then((response) => response.json())
      .then((data) => {
        setVariables(data);
      })
      .catch((error) => {
        console.error("Error al obtener los parámetros de la Red:", error);
      });
  };

  /**
   * Asynchronously updates the Red specifications in the backend.
   * It sends the current state of variables and redSpecifications to the server.
   */
  const updateVariables = async (updatedReds) => {
    const requestData = {
      variables,
      reds: updatedReds,
    };
    console.log("Enviando JSON al servidor:", requestData);

    try {
      const response = await fetch(
        "http://localhost:3000/api/networks/inputredparameters",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Check for successful response
      if (response.status >= 200 && response.status < 300) {
        console.log("Parámetros de la Red actualizados con éxito");
        setIsSentSuccessfully(true);
      } else {
        const text = await response.text();
        throw new Error(`Respuesta inesperada: ${text}`);
      }
    } catch (error) {
      console.error("Error al actualizar los parámetros de la Red:", error);
      setIsSentSuccessfully(false);
    }
  };

  /**
   * Creates a new Red by sending a POST request to the backend.
   * It sets the state to reflect the creation process and updates the user upon completion.
   */
  const createRed = async () => {
    setCreatingRed(true);
    setCreationMessage("");

    try {
      const response = await fetch(
        "http://localhost:3000/api/networks/redparameters",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newRed }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      setCreationMessage(`Red created successfully: ${JSON.stringify(result)}`);
      setIsCreationSuccessful(true);
      setTimeout(() => {
        navigate("/redes");
      }, 5000);
    } catch (error) {
      console.error("Error creating Red, please check input:", error);
      setCreationMessage(
        `Error creating Red, please check input: ${error.message}`
      );
      setIsCreationSuccessful(false);
    } finally {
      setCreatingRed(false);
    }
  };

  const goBack = () => {
    navigate("/redes");
  };

  return (
    <div className="min-vh-100 d-flex flex-column my-5 justify-content-between">
      <div className="container mt-3">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card mb-3 black-background">
              <div className="card-body text-center">
                <h2 className="card-title mb-3">Administración de Redes</h2>
                <div className="form-group mb-3">
                  <label htmlFor="chain-id" className="label-large">
                    Chain ID:
                  </label>
                  <input
                    id="chain-id"
                    type="text"
                    className="form-control black-input"
                    value={newRed.chainId}
                    onChange={handleChainIdChange}
                    placeholder="Identificador de la Red"
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="node-count" className="label-large">
                    Número de Nodos:
                  </label>
                  <input
                    id="node-count"
                    type="number"
                    className="form-control black-input"
                    min="0"
                    value={newRed.nodeCount}
                    onChange={handleNodeCountChange}
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="node-count" className="label-large">
                    Ingrese la dirección de su billetera Ethereum:
                  </label>
                  <input
                    id="account"
                    type="text"
                    className="form-control black-input"
                    value={newRed.account}
                    onChange={handleAccountChange}
                    placeholder="Billetera Ethereum para asociarla con la configuración de la Red"
                  />
                </div>
                <button
                  className={`btn ${
                    isSentSuccessfully ? "btn-success" : "btn-primary"
                  } mt-4 me-2`}
                  onClick={handleAddNetwork}>
                  {editIndex !== null ? "Actualizar Red" : "Agregar Nueva Red"}
                </button>
                <button
                  className={`btn ${
                    isCreationSuccessful ? "btn-success" : "btn-primary"
                  } mt-4`}
                  onClick={createRed}
                  disabled={creatingRed}>
                  {creatingRed
                    ? "Creando..."
                    : redSpecifications.length === 1
                    ? "Crear Red "
                    : "Crear Redes "}
                </button>
              </div>
            </div>
          </div>
        </div>

        {redSpecifications.length > 0 && (
          <>
            <div className="d-flex justify-content-center gap-2">
              <button className="btn btn-secondary mt-4" onClick={goBack}>
                Ir a Listado de Redes
              </button>
            </div>
            <h4 className="mt-5 text-center white-text ">
              Especificaciones de las Redes
            </h4>
            <table className="table table-bordered mt-2 white-text">
              <thead>
                <tr>
                  <th>Red ID</th>
                  <th>Chain ID</th>
                  <th>Números de Nodos</th>
                  <th>Cuenta de Billetera en Red de Ethereum</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {redSpecifications.map((red, index) => (
                  <tr key={index}>
                    <td>{red.redId}</td>
                    <td>{red.chainId}</td>
                    <td>{red.nodeCount}</td>
                    <td>{red.account}</td>
                    <td>
                      <button
                        className="btn btn-info btn-sm me-2"
                        onClick={() => editRed(index)}>
                        Editar
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteRed(index)}>
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {creationMessage && (
          <div className="alert alert-info d-flex mt-2 justify-content-end">
            {creationMessage}
          </div>
        )}
      </div>
    </div>
  );
}
