import { useEffect, useState } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { Toast, ToastContainer } from "react-bootstrap";

function CustomCard({ title, children, background, titleColor }) {
  const cardStyle = {
    borderRadius: "3px",
    maxWidth: "1000px",
    margin: "0 auto",
    background:
      "radial-gradient(circle, rgba(32,32,69,1) 0%, rgba(46,46,73,1) 50%, rgba(47,47,83,1) 100%)",
    border: "1px solid black",
    boxShadow: "0px 0px 10px rgba(0,0,0,0.5)",
  };

  return (
    <Card className="mt-3" style={cardStyle}>
      <Card.Body>
        <Card.Title className="text-light fs-5">{title}</Card.Title>
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
    getAccount()
  });

  async function getAccount() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);
    window.ethereum.on("accountsChanged", (accounts) =>
      setAccount(accounts[0])
    );
  }

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
        setBalance(balance.balance);
      } else {
        throw new Error("Error al conectar la cuenta.");
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
    setDivTxOK(false);
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        setError(null);
        
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: `0x1F40`,
            rpcUrls: [`http://localhost:8670`],
            chainName: `G2 Initial Blockchain`,
            nativeCurrency: {
              name: "TOKEN",
              symbol: "TOKEN",
              decimals: 18
            },
          }]
        });
        await fetchBalance();
      } catch (error) {
        setError("Error al conectar la billetera.");
        console.error(error);
      }
    } else {
      setError(
        "Proveedor de Ethereum no detectado. Por favor instale MetaMask."
      );
    }
  };

  useEffect(() => {
    fetchBalance()
  }, [account]);

  /**
   * Invokes the faucet to get Ethereum tokens.
   */
  async function invokeFaucet() {
    setLoadingInvokeFaucet(true);
    setDivTxOK(false);
    if (!account) {
      setError("No se ha seleccionado una cuenta de Ethereum.");
      setLoadingInvokeFaucet(false);
      return;
    }
    const apiUrl = `http://localhost:3000/api/faucet/${account}`;

    try {
      const response = await fetch(apiUrl);
      setError(null);
      if (response.ok) {
        //const tx = await response.json();
        setTimeout(() => {
          setDivTxOK(true);
          setLoadingInvokeFaucet(false);
          fetchBalance();
        }, 14000);
        const tx = await response.json();
        console.log(tx);
      } else {
        throw new Error(
          "Error al enviar Ethereum. Por favor intente de nuevo más tarde."
        );
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
      setLoadingInvokeFaucet(false);
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-center">
        {" "}
        {/* Flex container */}
        <h1 className="text-content-build mt-3 mb-0 text-white">Faucet</h1>
      </div>
      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          height: "52vh",
          // background:
          //   "radial-gradient(circle, rgba(2,0,36,1) 0%, rgba(7,7,119,1) 0%, rgba(0,0,0,1) 100%)",
        }}>
        <div
          className="w-50 p-3"
          style={{
            background: "#090730",
            borderRadius: "3px",
            boxShadow: "0px 0px 10px rgba(0,0,0,0.5)",
          }}>
          {error && (
            <div
              className="alert alert-warning"
              role="alert"
              style={{
                borderRadius: "10px",
                background: "#DABB9F",
                color: "#333",
              }}>
              {error}
            </div>
          )}

          {/* Connect Wallet Button */}
          <Button onClick={connectWallet} className="btn btn-light fs-5 my-2">
            Conectar Billetera
          </Button>

          {/* Custom Card components */}
          <CustomCard
            title={`Address: ${account || "Billetera no conectada"}`}
            background="#FFFFFF"
            titleColor="#000000"
          />
          <CustomCard
            title={`Balance: ${balance} ETH`}
            background="#FFFFFF"
            titleColor="#000000"
          />
          <CustomCard title="Recibe faucet ERC20 a tu billetera">
            <Button
              onClick={invokeFaucet}
              className="btn btn-primary fs-5 mt-3"
              disabled={loadingInvokeFaucet}>
              {loadingInvokeFaucet ? (
                <>
                  <Spinner animation="border" role="status" size="sm" />
                  <span className="ms-2">
                    Realizando transacción, espere por favor
                  </span>
                </>
              ) : (
                "Obtener token faucet!"
              )}
            </Button>
          </CustomCard>

          {/* Transaction Success Message */}
          {divTxOK && (
            <ToastContainer
              className="p-3"
              style={{
                zIndex: 1,
                width: "1300px",
                position: "fixed",
                bottom: 0,
                left: 0,
              }}>
              <Toast
                onClose={() => setDivTxOK(false)}
                show={setDivTxOK}
                delay={3000}
                autohide>
                <Toast.Body className="bg-success text-white">
                  <h5 className="fs-5">Transacción realizada correctamente</h5>
                  <p>
                    Espera unos minutos antes de realizar una nueva transacción
                  </p>
                </Toast.Body>
              </Toast>
            </ToastContainer>
          )}
          {/* Transaction Error Message */}
          {error && (
            <ToastContainer
              className="p-3"
              style={{
                zIndex: 1,
                width: "300px",
                position: "fixed",
                bottom: 0,
                left: 0,
              }}>
              <Toast
                onClose={() => setError(null)}
                show={error !== null}
                delay={3000}
                autohide>
                <Toast.Body className="bg-danger text-white">
                  <h5 className="fs-5">Error en la transacción</h5>
                  <p>{error}</p>
                </Toast.Body>
              </Toast>
            </ToastContainer>
          )}
        </div>
      </div>
    </div>
  );
}
