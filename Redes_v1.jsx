import React, { useState, useEffect } from "react";

/**
 * Check if a given value is a valid number.
 * A valid number is a non-empty string that can be parsed to a positive integer.
 *
 * @param {string} value - The value to be validated.
 * @returns {boolean} - True if the value is a valid number, false otherwise.
 */
const isValidNumber = (value) =>
  value.trim() === "" || (!isNaN(value) && parseInt(value, 10) > 0);
const isValidMetamaskAccount = (value) => /^0x[a-fA-F0-9]{40}$/.test(value);
const isValidMetamaskBalance = (value) =>
  !isNaN(value) && parseFloat(value) >= 100000000000000000;

// Component for the toggle list of variables
function RedVariablesList({ red, isOpen, handleRedInputChange }) {
  return (
    <div className={`collapse ${isOpen ? "show" : ""}`}>
      <ul className="list-group">
        <li className="list-group-item">
          <strong>Chain ID:</strong>{" "}
          {isOpen ? (
            <input
              type="text"
              name="chainId"
              value={red.chainId}
              onChange={(e) => handleRedInputChange(e)}
              title="Enter a valid Chain ID must be a number different than one"
            />
          ) : (
            red.chainId
          )}
        </li>
        <li className="list-group-item">
          <strong>Number of Nodes:</strong>{" "}
          {isOpen ? (
            <input
              type="text"
              name="nodeCount"
              value={red.nodeCount}
              onChange={(e) => handleRedInputChange(e)}
              title="Enter a valid number of node must be 3 or a higher number"
            />
          ) : (
            red.nodeCount
          )}
        </li>
        <li className="list-group-item">
          <strong>Number of Accounts:</strong>{" "}
          {isOpen ? (
            <input
              type="text"
              name="accountCount"
              value={red.accountCount}
              onChange={(e) => handleRedInputChange(e)}
              title="Enter the number of Ethereum account you want to create"
            />
          ) : (
            red.accountCount
          )}
        </li>
        <li className="list-group-item">
          <strong>Metamask Account:</strong>{" "}
          {isOpen ? (
            <input
              type="text"
              name="metamaskAccount"
              value={red.metamaskAccount}
              onChange={(e) => handleRedInputChange(e)}
              title="Provide your Metamask account if you want it on the red"
            />
          ) : (
            red.metamaskAccount
          )}
        </li>
        <li className="list-group-item">
          <strong>Metamask Balance:</strong>{" "}
          {isOpen ? (
            <input
              type="text"
              name="metamaskBalance"
              value={red.metamaskBalance}
              onChange={(e) => handleRedInputChange(e)}
              title="Provide the balance for the Metamask account"
            />
          ) : (
            red.metamaskBalance
          )}
        </li>
      </ul>
    </div>
  );
}

export function Redes() {
  const [variables, setVariables] = useState({
    redId: "",
    chainId: "",
    nodeCount: "",
    accountCount: "",
    totalNumRed: "",
    metamaskAccount: "",
    metamaskBalance: "",
  });

  const addRed = () => {
    const newRedId = `redId${redSpecifications.length + 1}`;
    const newRed = {
      redId: newRedId,
      chainId: "",
      nodeCount: "",
      accountCount: "",
      metamaskAccount: "",
      metamaskBalance: "",
      redCount: "",
    };
    setRedSpecifications([...redSpecifications, newRed]);
    setOpenLists([...openLists, false]);
    setEditModes([...editModes, true]);
    setRequestStatus("default");
  };

  const [redSpecifications, setRedSpecifications] = useState([]);
  const [openLists, setOpenLists] = useState([]);
  const [editModes, setEditModes] = useState([false]);
  const [report, setReport] = useState(""); // State to store the report
  const [requestStatus, setRequestStatus] = useState("default"); // 'default', 'success', or 'error'

  useEffect(() => {
    // Fetch Red parameters from the server when the component mounts
    fetchRedParameters();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVariables({ ...variables, [name]: value });
  };

  const handleRedInputChange = (e, index) => {
    const { name, value } = e.target;
    const updatedRedSpecifications = [...redSpecifications];
    updatedRedSpecifications[index] = {
      ...updatedRedSpecifications[index],
      [name]: value,
    };
    setRedSpecifications(updatedRedSpecifications);
  };

  const toggleList = (index) => {
    const updatedLists = [...openLists];
    updatedLists[index] = !updatedLists[index];
    setOpenLists(updatedLists);
  };

  const validateRedSpecification = (index) => {
    const red = redSpecifications[index];
    if (
      !isValidNumber(red.nodeCount) ||
      !isValidNumber(red.accountCount) ||
      !isValidMetamaskAccount(red.metamaskAccount) ||
      !isValidMetamaskBalance(red.metamaskBalance)
    ) {
      // Handle invalid red specification
      console.log("Invalid data in red specification");
      return false;
    }
    return true;
  };

  const toggleEditMode = (index) => {
    const updatedEditModes = [...editModes];
    updatedEditModes[index] = !updatedEditModes[index];

    if (updatedEditModes[index]) {
      setRequestStatus("default"); // Set to default when editing begins
    } else {
      if (!validateRedSpecification(index)) {
        console.log("Invalid data in red specification");
        return; // Prevent leaving edit mode if validation fails
      }
      // Additional actions when saving, if necessary
    }

    setEditModes(updatedEditModes);
  };

  const deleteRed = (index) => {
    const updatedRedSpecifications = [...redSpecifications];
    updatedRedSpecifications.splice(index, 1);
    setRedSpecifications(updatedRedSpecifications);

    const updatedLists = [...openLists];
    updatedLists.splice(index, 1);
    setOpenLists(updatedLists);

    const updatedEditModes = [...editModes];
    updatedEditModes.splice(index, 1);
    setEditModes(updatedEditModes);
  };

  const fetchRedParameters = () => {
    fetch("http://localhost:3000/api/redparameters")
      .then((response) => response.json())
      .then((data) => {
        setVariables(data);
        // Check if 'reds' is an array before setting it to state
        if (Array.isArray(data.reds)) {
          setRedSpecifications(data.reds);
        }
      })
      .catch((error) => {
        console.error("Error fetching Red parameters:", error);
      });
  };

  const updateVariables = () => {
    const requestData = {
      variables, // Make sure this contains the data you want to send
      reds: redSpecifications,
    };

    fetch("http://localhost:3000/api/redparameters", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => response.json())
      .then((data) => {
        setReport("Red parameters updated successfully.");
        setRequestStatus("success");
      })
      .catch((error) => {
        console.error("Error updating Red parameters:", error);
        setReport("Error updating Red parameters.");
        setRequestStatus("error");
      });
  };

  return (
    <div
      className="bg-black min-vh-100 d-flex flex-column "
      style={{ background: "#21252a" }}>
      <div className="container mt-5 ">
        <div className="row">
          <div className="col-lg-4 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Specify Number of Reds</h5>
                <input
                  type="number"
                  className="form-control"
                  name="redCount"
                  value={variables.redCount}
                  onChange={handleInputChange}
                />
                <button className="btn btn-primary mt-3" onClick={addRed}>
                  Add New Red
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {Array.isArray(redSpecifications) &&
        redSpecifications.map((red, index) => (
          <div className="row mt-2 " key={index}>
            {/* Input fields for each red */}
            <div className="col-lg-5 mb-2 ">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">
                    Specify Chain ID for the Red {index + 1}
                    <button
                      className="btn btn-link btn-sm mb-2"
                      onClick={() => toggleList(index)}>
                      {openLists[index] ? "Hide Parameters" : "Show Parameters"}
                    </button>
                    {editModes[index] ? (
                      <button
                        className="btn btn-success btn-sm mb-4 float-right"
                        onClick={() => toggleEditMode(index)}>
                        Save
                      </button>
                    ) : (
                      <>
                        <button
                          className={`btn ${
                            editModes[index]
                              ? "btn-warning"
                              : "btn-warning btn-sm float-right mr-2 mb-2"
                          }`}
                          onClick={() => toggleEditMode(index)}>
                          {editModes[index] ? "Save" : "Edit Input"}
                        </button>
                      </>
                    )}
                    <button
                      className="btn btn-danger btn-sm float-right mr-2 mb-2"
                      onClick={() => deleteRed(index)}>
                      Delete Red
                    </button>
                  </h5>
                  <input
                    type="text"
                    className="form-control"
                    name="chainId"
                    value={red.chainId || ""}
                    onChange={(e) => handleRedInputChange(e, index)}
                    disabled={!editModes[index]}
                  />
                  {/* Add more input fields for other variables */}
                </div>
              </div>
            </div>
            {/* Pass redSpecifications as a prop */}
            <RedVariablesList
              key={index}
              red={red}
              isOpen={openLists[index]}
              handleRedInputChange={(e) => handleRedInputChange(e, index)}
              redSpecifications={redSpecifications}
            />
          </div>
        ))}

      <div className="row mt-4">
        <div className="col-12">
          <button
            className={`btn ${
              requestStatus === "success"
                ? "btn-success"
                : requestStatus === "error"
                ? "btn-warning"
                : "btn-primary"
            }`}
            onClick={updateVariables}>
            Update Specifications
          </button>
        </div>
      </div>
      <div className="row mt-4">
        <div className="col-12">
          <h5>Number of Reds: {redSpecifications.length}</h5>
        </div>
      </div>
      {/* Display the report */}
      {report && (
        <div className="row mt-4">
          <div className="col-12">
            <h4>Report:</h4>
            <pre>{report}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
