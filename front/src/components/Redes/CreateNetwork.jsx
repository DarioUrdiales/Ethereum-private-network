import { useState, useEffect } from "react";
import "../../index.css";
import { useNavigate } from "react-router-dom";

/**
 * Component for managing Red specifications.
 * Allows users to add, edit, delete, and submit Red specifications.
 * It also enables creating a Red by making an API call.
 */
export function CreateNetwork() {
  // State for storing the current input values
  const [newRed, setNewRed] = useState({ chainId: "", nodeCount: 0 });

  // State for storing an array of Red specifications
  const [redSpecifications, setRedSpecifications] = useState([]);

  // State for tracking the index of the Red being edited
  const [editIndex, setEditIndex] = useState(null);

  // States for managing the creation process of a Red
  const [creatingRed, setCreatingRed] = useState(false);
  const [creationMessage, setCreationMessage] = useState("");

  const navigate = useNavigate();

  // Fetch Red parameters on component mount
  useEffect(() => {
    fetchRedParameters();
  }, []);

  const [variables, setVariables] = useState({
    redId: "",
    chainId: "",
    nodeCount: "",
  });

  /**
   * Validates the node count input.
   * @param {string} value - The node count value to validate.
   * @returns {string|null} - An error message if invalid, otherwise null.
   */
  const validateNodeCount = (value) => {
    const number = parseInt(value, 10);
    return !isNaN(number) && number <= 100
      ? null
      : "Number of Nodes must be a positive integer and no higher than 100.";
  };

  /**
   * Validates the chain ID input.
   * @param {string} value - The chain ID value to validate.
   * @returns {string|null} - An error message if invalid, otherwise null.
   */
  const validateChainId = (value) => {
    const number = parseInt(value, 10);
    return !isNaN(number) && number > 1
      ? null
      : "Chain ID must be a positive integer different from 1.";
  };

  /**
   * Handles submission of a new or edited Red.
   * Validates input, checks for duplicate chain IDs, and updates the state.
   */
  const submitRed = () => {
    // Validation
    const nodeCountError = validateNodeCount(newRed.nodeCount);
    const chainIdError = validateChainId(newRed.chainId);

    // Alert and return if there's an error
    if (nodeCountError || chainIdError) {
      alert(
        `Invalid input. ${nodeCountError || ""} ${
          chainIdError || ""
        } Please check your data.`
      );
      return;
    }

    // Check for duplicate Chain ID
    const isDuplicateChainId = redSpecifications.some(
      (red) => red.chainId.toString() === newRed.chainId
    );
    if (isDuplicateChainId) {
      alert("The Chain ID already exists. Please enter a different Chain ID.");
      return;
    }

    // Update Red specifications list
    const newRedData = {
      ...newRed,
      redId:
        editIndex !== null
          ? `red${editIndex + 1}`
          : `red${redSpecifications.length + 1}`,
      chainId: parseInt(newRed.chainId, 10),
      nodeCount: parseInt(newRed.nodeCount, 10),
    };
    const updatedReds =
      editIndex !== null
        ? redSpecifications.map((red, index) =>
            index === editIndex ? newRedData : red
          )
        : [...redSpecifications, newRedData];

    setRedSpecifications(updatedReds);
    setNewRed({ chainId: "", nodeCount: 0 });
    setEditIndex(null);
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

  const fetchRedParameters = async () => {
    fetch("http://localhost:3000/api/inputredparameters")
      .then((response) => response.json())
      .then((data) => {
        setVariables(data);
      })
      .catch((error) => {
        console.error("Error fetching Red parameters:", error);
      });
  };

  /**
   * Asynchronously updates the Red specifications in the backend.
   * It sends the current state of variables and redSpecifications to the server.
   */
  const updateVariables = async () => {
    const requestData = {
      variables,
      reds: redSpecifications,
    };
    console.log("Sending JSON to backend:", requestData);

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
        console.log("Red parameters updated successfully");
      } else {
        const text = await response.text();
        throw new Error(`Unexpected response: ${text}`);
      }
    } catch (error) {
      console.error("Error updating Red parameters:", error);
    }
  };

  /**
   * Handles the submission of the current Red specifications.
   * It asks for confirmation before proceeding with the update.
   */
  const submitRedParameters = () => {
    const confirmation = window.confirm(
      "Are you sure you want to submit the current red(s) specifications?"
    );

    if (confirmation) {
      updateVariables();
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
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      setCreationMessage(`Red created successfully: ${JSON.stringify(result)}`);
      setTimeout(() => {
        navigate("/redes");
      }, 5000);
    } catch (error) {
      console.error("Error creating Red:", error);
      setCreationMessage(`Error creating Red: ${error.message}`);
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
                    placeholder="Enter Chain ID"
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
                <button className="btn btn-secondary mb-3" onClick={submitRed}>
                  {editIndex !== null ? "Actualizar Red" : "Agregar Nueva Red"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {redSpecifications.length > 0 && (
          <>
            <h4 className="mt-5 text-center white-text ">
              Especificaciones de las Redes
            </h4>
            <table className="table table-bordered mt-2 white-text">
              <thead>
                <tr>
                  <th>Red ID</th>
                  <th>Chain ID</th>
                  <th>Números de Nodos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {redSpecifications.map((red, index) => (
                  <tr key={index}>
                    <td>{red.redId}</td>
                    <td>{red.chainId}</td>
                    <td>{red.nodeCount}</td>
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
        <button
          className="btn btn-primary mt-4 me-2"
          onClick={submitRedParameters}>
          Enviar los Parametros de la Red
        </button>
        <div className="d-flex justify-content-end gap-2">
          <button
            className="btn btn-primary mt-4"
            onClick={createRed}
            disabled={creatingRed}>
            {creatingRed
              ? "Creando..."
              : redSpecifications.length === 1
              ? "Crear Nueva Red Privada"
              : "Crear Nuevas Redes Privadas"}
          </button>
          <button className="btn btn-secondary mt-4" onClick={goBack}>
            Back
          </button>
        </div>
        {creationMessage && (
          <div className="alert alert-info d-flex mt-2 justify-content-end">
            {creationMessage}
          </div>
        )}
      </div>
    </div>
  );
}
