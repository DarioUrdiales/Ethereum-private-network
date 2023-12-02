import React, { useEffect, useState } from "react";
import { Logo } from "./Logo";
import datos from "../src/datos.json";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";

export function Faucet() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState(null);

  // Define the fetchBalance function
  async function fetchBalance() {
    if (!account) return;

    const apiUrl = `http://localhost:3000/api/balance/${account}`;

    try {
      const response = await fetch(apiUrl);
      if (response.ok) {
        const json = await response.json();
        setBalance(json.balance);
      } else {
        throw new Error("Failed to fetch balance.");
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  }

  useEffect(() => {
    async function fetchAccount() {
      if (!window.ethereum) {
        setError("Ethereum provider not detected. Please install MetaMask.");
        return;
      }

      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
      } catch (err) {
        setError("Failed to fetch account.");
        console.error(err);
      }
    }

    fetchAccount();
  }, []);

  useEffect(() => {
    // Automatically fetch the balance when the account changes
    fetchBalance();
  }, [account]);

  async function invokeFaucet() {
    if (!account) {
      setError("No Ethereum account selected.");
      return;
    }

    const apiUrl = `http://localhost:3000/api/faucet/${account}`;

    try {
      const response = await fetch(apiUrl);
      if (response.ok) {
        const json = await response.json();
        console.log(json);
      } else {
        throw new Error("Failed to send Ethereum.");
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  }

  return (
    <div className="container-fluid my-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <nav className="navbar navbar-expand-lg navbar-light bg-white p-2 fixed-top">
            <div className="d-flex align-items-center">
              <Logo />
              <p className="fs-3 mx-2 ml-2 mb-0 ">{datos.header.name}</p>
            </div>
          </nav>

          {error && (
            <div
              className="alert alert-warning mt-3"
              role="alert"
              style={{ backgroundColor: "#DABB9F", color: "#333" }}>
              {error}
            </div>
          )}

          <Card className="mt-3">
            <Card.Body>
              <Card.Title>Address: {account || "Not connected"}</Card.Title>
            </Card.Body>
          </Card>

          <Card className="mt-3">
            <Card.Body>
              <Card.Title>Balance: {balance}</Card.Title>
            </Card.Body>
          </Card>

          <Card
            className="mt-4"
            style={{ background: "rgba(61, 60, 57, 0.71)" }}>
            <Card.Body>
              <Card.Subtitle>Receive faucet ERC20 to your wallet</Card.Subtitle>
              <br />
              <div className="d-grid gap-2">
                <Button onClick={invokeFaucet} className="btn btn-success">
                  Get faucet token!
                </Button>
              </div>
              <div className="d-grid gap-2">
                <Button onClick={fetchBalance} className="btn btn-dark mt-2">
                  Check my balance
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Button to go home */}
          <Link to="/" className="btn btn-dark mt-3">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
