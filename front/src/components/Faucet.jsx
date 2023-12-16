import { useEffect, useState } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import Spinner from 'react-bootstrap/Spinner';

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
  const [divTxOK, setDivTxOK] = useState(false);
  const [loadingInvokeFaucet, setLoadingInvokeFaucet] = useState(false);
  useEffect(() => {
    window.ethereum.on("accountsChanged", (accounts) => {
      setAccount(accounts[0])
    });    
  })

  /**
   * Fetches the Ethereum account's balance.
   */
  async function fetchBalance() {
    if (!account) return;

    const apiUrl = `http://localhost:3000/api/balance/${account}`;

    try {
      const response = await fetch(apiUrl);



      if (response.ok) {
        const balance = await response.json();
        setBalance(balance.balance)
      } else {
        throw new Error("Failed to connect account.");
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
    setDivTxOK(false)
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        setError(null)
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
    setLoadingInvokeFaucet(true);
    setDivTxOK(false)
    if (!account) {
      setError("No Ethereum account selected.");
      setLoadingInvokeFaucet(false);
      return;
    }
    const apiUrl = `http://localhost:3000/api/faucet/${account}`;

    try {
      const response = await fetch(apiUrl);
      setError(null)
      if (response.ok) {
        //const tx = await response.json();
        setTimeout(() => {
          setDivTxOK(true);
          setLoadingInvokeFaucet(false);
          fetchBalance();
        }, 14000)
        const tx = await response.json();
        console.log(tx);
        
      } else {
        throw new Error("Failed to send Ethereum.");
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
      setLoadingInvokeFaucet(false);
    }
  }

  return (
    <div>
      <div className="bg-light min-vh-100 d-flex flex-column justify-content-center">
        <div className="container d-flex justify-content-center">
          <div className="bg-dark">
          </div>
            <div className="row d-flex background-eth-faucet w-90 h-90"               >
            </div>
          <div className="row justify-content-center w-100 h-100">
            <div className="col-lg-8 ">
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
                <Button
                  onClick={connectWallet}
                  className="btn btn-primary fs-4 align-self-end mt-2 me-2">
                  Connect Wallet
                </Button>

              {/* Custom Card components */}
              <CustomCard
                title={`Address: ${account || "Not connected"}`}
                background="#FFFFFF"
                titleColor="#000000"
              />

              <CustomCard
                title={`Balance: ${balance} ETH`}
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
                    className="btn btn-success mt-4 fs-4"
                    disabled={loadingInvokeFaucet} // Deshabilitar el botón mientras se está cargando
                  >
                    {loadingInvokeFaucet ? ( 
                      <div>
                      <Spinner animation="grow" role="status">
                        <span className="visually-hidden">Realizando transacción, espere por favor</span>
                      </Spinner>
                        <span className="p-3">Realizando transacción, espere por favor</span>
                      </div>
                    ) : (
                      "Get faucet token!"
                    )}
                  </Button>
                </div>
              </CustomCard>
              {/* Go Home Button */}
              {divTxOK && (
                <div className="alert alert-success mt-3 border border-success" 
                    role="alert" >
                  <h5 className="alert-heading"><b>Transacción realizada correctamente</b></h5>
                  <div>
                    Espera unos minutos antes de realizar una nueva transacción
                  </div>
                </div>
              )}
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
    </div>
  );
}
