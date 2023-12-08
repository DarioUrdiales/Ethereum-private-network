import { useEffect, useState } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";

/**
 * CustomCard component for displaying a styled card.
 * @param {Object} props - Component props.
 * @param {string} props.title - Title to be displayed on the card.
 * @param {string} props.children - Child components to be displayed within the card.
 * @param {string} props.background - Background color of the card.
 * @param {string} props.titleColor - Color of the title text.
 */
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

/**
 * Faucet component for the main application page.
 */
export function Faucet() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState(null);

  /**
   * Fetches the Ethereum account's balance.
   */
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

  /**
   * Connects the Ethereum wallet using MetaMask.
   */
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
      } catch (error) {
        setError("Failed to connect wallet.");
        console.error(error);
      }
    } else {
      setError("Ethereum provider not detected. Please install MetaMask.");
    }
  };

  useEffect(() => {
    if (account) {
      fetchBalance();
    }
  }, [account]);

  /**
   * Invokes the faucet to get Ethereum tokens.
   */
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
    <div
      className="bg-black min-vh-100 d-flex flex-column justify-content-center"
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

            {/* Connect Wallet Button (Top Right) */}
            {!account ? (
              <Button
                onClick={connectWallet}
                className="btn btn-primary fs-4 align-self-end mt-2 me-2">
                Connect Wallet
              </Button>
            ) : null}

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
            {/* Go Home Button */}
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
  );
}
