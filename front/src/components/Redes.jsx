import React, { useState, useEffect } from "react";
import "../index.css";

export function Redes() {
  const [variables, setVariables] = useState({
    redId: "",
    chainId: "",
    nodeCount: "",
  });
  const [redSpecifications, setRedSpecifications] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [newRed, setNewRed] = useState({ chainId: "", nodeCount: 0 });
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    fetchRedParameters();
  }, []);

  const validateNodeCount = (value) => {
    const number = parseInt(value, 10);
    return !isNaN(number) && number > 0 && number <= 100
      ? null
      : "Number of Nodes must be a positive integer and no higher than 100.";
  };

  const validateChainId = (value) => {
    const number = parseInt(value, 10);
    return !isNaN(number) && number > 1
      ? null
      : "Chain ID must be a positive integer different from 1.";
  };

  const submitRed = () => {
    const nodeCountError = validateNodeCount(newRed.nodeCount);
    const chainIdError = validateChainId(newRed.chainId);

    if (nodeCountError || chainIdError) {
      alert(
        `Invalid input. ${nodeCountError || ""} ${
          chainIdError || ""
        } Please check your data.`
      );
      return;
    }

    const isDuplicateChainId = redSpecifications.some(
      (red) => red.chainId.toString() === newRed.chainId
    );

    if (isDuplicateChainId) {
      alert("The Chain ID already exists. Please enter a different Chain ID.");
      return;
    }

    const newRedData = {
      ...newRed,
      redId:
        editIndex !== null
          ? `red${editIndex + 1}`
          : `red${redSpecifications.length + 1}`,
      chainId: parseInt(newRed.chainId, 10),
      nodeCount: parseInt(newRed.nodeCount, 10),
    };

    if (editIndex !== null) {
      const updatedReds = [...redSpecifications];
      updatedReds[editIndex] = newRedData;
      setRedSpecifications(updatedReds);
      setEditIndex(null);
    } else {
      setRedSpecifications([...redSpecifications, newRedData]);
    }

    setNewRed({ chainId: "", nodeCount: 0 });
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
    const nodeCount = parseInt(e.target.value, 10);
    setNewRed({ ...newRed, nodeCount: isNaN(nodeCount) ? 0 : nodeCount });
  };

  const fetchRedParameters = async () => {
    fetch("http://localhost:3000/api/redparameters")
      .then((response) => response.json())
      .then((data) => {
        setVariables(data);
        // Check if 'reds' is an array before setting it to state
        // if (Array.isArray(data.reds)) {
        //   setRedSpecifications(data.reds);
        // }
      })
      .catch((error) => {
        console.error("Error fetching Red parameters:", error);
      });
  };

  const updateVariables = async () => {
    const requestData = {
      variables,
      reds: redSpecifications,
    };

    console.log("Sending JSON to backend:", requestData); // Log the JSON here

    try {
      const response = await fetch("http://localhost:3000/api/redparameters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Assuming a successful response with no content
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

  const submitRedParameters = () => {
    const confirmation = window.confirm(
      "Are you sure you want to submit the current red(s) specifications?"
    );

    if (confirmation) {
      updateVariables();
    }
  };

  return (
    <div
      className="bg-black min-vh-100 d-flex flex-column my-5 justify-content-between"
      style={{ background: "#FFF" }}>
      <div className="container mt-3">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card mb-3">
              <div className="card-body text-center">
                <h2 className="card-title mb-3">Manage Red</h2>
                <div className="form-group mb-3">
                  <label htmlFor="chain-id" className="label-large">
                    Chain ID:
                  </label>
                  <input
                    id="chain-id"
                    type="text"
                    className="form-control"
                    value={newRed.chainId}
                    onChange={handleChainIdChange}
                    placeholder="Enter Chain ID"
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="node-count" className="label-large">
                    Number of Nodes:
                  </label>
                  <input
                    id="node-count"
                    type="number"
                    className="form-control"
                    min="0"
                    value={newRed.nodeCount}
                    onChange={handleNodeCountChange}
                  />
                </div>
                <button className="btn btn-primary mb-3" onClick={submitRed}>
                  {editIndex !== null ? "Update Red" : "Add New Red"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {showSummary && (
          <>
            <h4 className="mt-5 text-center">Red Specifications Summary</h4>
            <table className="table table-bordered mt-2">
              <thead>
                <tr>
                  <th>Red ID</th>
                  <th>Chain ID</th>
                  <th>Node Count</th>
                  <th>Actions</th>
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
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteRed(index)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <button
          className="btn btn-secondary mt-4 me-2"
          onClick={() => setShowSummary(!showSummary)}>
          {showSummary ? "Hide" : "Show"} Specifications
        </button>
        <button
          className="btn btn-success mt-4 me-2"
          onClick={submitRedParameters}>
          Submit Red Parameters
        </button>
      </div>
    </div>
  );
}
