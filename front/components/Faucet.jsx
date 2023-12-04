import React, { useEffect, useState } from "react";
import { Logo } from "./Logo";
import datos from "../src/datos.json";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import { Parallax } from "react-parallax";
import { Footer } from "./Footer";
import { Header } from "./Header";

// Define a Card component for reusability
function CustomCard({ title, children, background, titleColor }) {
  return (
    <Card
      className="mt-3"
      style={{
        borderRadius: "20px",
        maxWidth: "1000px",
        margin: "0 auto",
        background: background || "#103D13",
      }}>
      <Card.Body>
        <Card.Title className="fs-4" style={{ color: titleColor || "#FFFFFF" }}>
          {title}
        </Card.Title>
        {children}
      </Card.Body>
    </Card>
  );
}

export function Faucet() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState(null);

  async function fetchBalance() {
    if (!account) return;

    const apiUrl = `http://localhost:3000/api/balance/${account}`;

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
  //rgba(33, 48, 34, 0.71)
  return (
    <Parallax strength={400}>
      <Header></Header>
      <div
        className="bg-black min-vh-100 d-flex align-items-center"
        style={{ background: "#0C290E" }}>
        {" "}
        <div className="container my-5">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              {error && (
                <div
                  className="alert alert-warning mt-3"
                  role="alert"
                  style={{
                    borderRadius: "5px",
                    backgroundColor: "#DABB9F",
                    color: "#333",
                    maxWidth: "1000px",
                    margin: "0 auto",
                  }}>
                  {error}
                </div>
              )}
              {/* Custom Card components */}
              <CustomCard
                title={`Address: ${account || "Not connected"}`}
                background="#FFFFFF"
                titleColor="#000000"
              />

              <CustomCard
                title={`Balance: ${balance}`}
                background="#FFFFFF"
                titleColor="#000000"
              />
              <CustomCard
                title="Receive faucet ERC20 to your wallet"
                style={{
                  color: "#FFFFFF",
                }}>
                <div className="d-grid gap-2 mt-10 fs-4">
                  <Button
                    onClick={invokeFaucet}
                    className="btn btn-success mt-4 fs-4">
                    Get faucet token!
                  </Button>
                </div>
                <div className="d-grid gap-2">
                  <Button
                    onClick={fetchBalance}
                    className="btn btn-secondary mt-3 fs-4">
                    Check my balance
                  </Button>
                </div>
              </CustomCard>

              {/* Button to go home */}
              <div className="mt-4">
                <Link
                  to="/"
                  className="btn btn-dark fs-4"
                  style={{
                    borderRadius: "5px",
                    maxWidth: "1000px",
                    margin: "3 auto",
                  }}>
                  Go Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer></Footer>
    </Parallax>
  );
}
