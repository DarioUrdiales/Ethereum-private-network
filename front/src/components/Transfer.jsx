import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

import toast, { Toaster } from "react-hot-toast";

export function Transfer() {
  if (window.ethereum == null) return <h3>Billetera Web3 no instalada</h3>;

  const provider = new ethers.BrowserProvider(window.ethereum);

  const { register, handleSubmit } = useForm();

  const [waitButton, setWaitButton] = useState(null);
  const [network, setNetwork] = useState(null);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(0);
  const [quantity, setQuantity] = useState("");
  const [gas, setGas] = useState(0n);

  useEffect(() => {
    getNetwork();
    getAccount();
  });

  useEffect(() => {
    if (!account) return;
    getBalance();
  }, [account, network]);

  useEffect(() => {
    getGas();
  }, [network]);

  async function getNetwork() {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    setNetwork(chainId);
    window.ethereum.on("chainChanged", (chainId) => setNetwork(chainId));
  }
  async function getAccount() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);
    window.ethereum.on("accountsChanged", (accounts) =>
      setAccount(accounts[0])
    );
  }
  async function getBalance() {
    const balance = await provider.getBalance(account);
    setBalance(balance);
  }
  async function getGas() {
    const gasPrice = await window.ethereum.request({ method: "eth_gasPrice" });
    setGas(ethers.formatUnits(gasPrice, "gwei"));
    return BigInt(gasPrice);
  }

  async function sendTransaction(data) {
    const signer = await provider.getSigner();
    const amount = ethers.parseEther(quantity.toString());
    try {
      setWaitButton("Esperando confirmación...");
      const transaction = await signer.sendTransaction({
        to: data.address,
        value: amount,
      });
      setWaitButton("Validando transacción...");
      const receipt = await transaction.wait();
      if (receipt.status == 1) {
        showSuccessToast(receipt.hash);
        getBalance();
      } else {
        showErrorToast(`Error al validar transacción`);
      }
    } catch (error) {
      showErrorToast("Transacción cancelada");
    } finally {
      setWaitButton(null);
    }
  }

  async function calculateMax() {
    const gasPrice = await getGas();
    const totalFee = balance - 21000n * gasPrice;

    setQuantity(ethers.formatUnits(totalFee, "ether"));
  }

  return (
    <div>
      <div className="d-flex justify-content-center">
        {" "}
        {/* Flex container */}
        <h1 className="text-content-build mt-3 mb-0 text-white">
          Transferencias
        </h1>
      </div>
      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          height: "52vh",
        }}>
        <div>
          <Toaster />
        </div>
        <div
          className="w-50 border border-2 border-primary rounded-3 p-3 shadow"
          style={{ background: "#090730" }}>
          <h3 className="text-light">
            Saldo actual: {ethers.formatEther(balance)} ETH
          </h3>
          <form
            onSubmit={handleSubmit(sendTransaction)}
            className="d-flex flex-column gap-2">
            <div className="form-floating">
              <input
                style={inputStyle}
                type="number"
                className="form-control"
                id="amount"
                placeholder=""
                {...register("amount")}
                step="any"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
              <label className="text-light" htmlFor="amount">
                Cantidad
              </label>
              <button
                className="btn btn-link text-decoration-none position-absolute top-50 end-0 translate-middle"
                type="button"
                onClick={calculateMax}>
                max
              </button>
            </div>

            <div className="form-floating">
              <input
                style={inputStyle}
                type="text"
                className="form-control"
                id="address"
                placeholder=""
                {...register("address")}
              />
              <label className="text-light" htmlFor="address">
                Dirección de destino
              </label>
            </div>

            {waitButton ? (
              <SpinnerButton>{waitButton}</SpinnerButton>
            ) : (
              <button type="submit" className="btn btn-primary fs-5">
                Realizar transferencia
              </button>
            )}
          </form>
          <div className="text-light mt-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="mx-1 bi bi-router"
              viewBox="0 0 16 16">
              <path d="M5.525 3.025a3.5 3.5 0 0 1 4.95 0 .5.5 0 1 0 .707-.707 4.5 4.5 0 0 0-6.364 0 .5.5 0 0 0 .707.707Z" />
              <path d="M6.94 4.44a1.5 1.5 0 0 1 2.12 0 .5.5 0 0 0 .708-.708 2.5 2.5 0 0 0-3.536 0 .5.5 0 0 0 .707.707ZM2.5 11a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1m4.5-.5a.5.5 0 1 0 1 0 .5.5 0 0 0-1 0m2.5.5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1m1.5-.5a.5.5 0 1 0 1 0 .5.5 0 0 0-1 0m2 0a.5.5 0 1 0 1 0 .5.5 0 0 0-1 0" />
              <path d="M2.974 2.342a.5.5 0 1 0-.948.316L3.806 8H1.5A1.5 1.5 0 0 0 0 9.5v2A1.5 1.5 0 0 0 1.5 13H2a.5.5 0 0 0 .5.5h2A.5.5 0 0 0 5 13h6a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5h.5a1.5 1.5 0 0 0 1.5-1.5v-2A1.5 1.5 0 0 0 14.5 8h-2.306l1.78-5.342a.5.5 0 1 0-.948-.316L11.14 8H4.86L2.974 2.342ZM14.5 9a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5z" />
              <path d="M8.5 5.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0" />
            </svg>
            Red Id: {parseInt(network)} /
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="mx-1 bi bi-fuel-pump"
              viewBox="0 0 16 16">
              <path d="M3 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5z" />
              <path d="M1 2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v8a2 2 0 0 1 2 2v.5a.5.5 0 0 0 1 0V8h-.5a.5.5 0 0 1-.5-.5V4.375a.5.5 0 0 1 .5-.5h1.495c-.011-.476-.053-.894-.201-1.222a.97.97 0 0 0-.394-.458c-.184-.11-.464-.195-.9-.195a.5.5 0 0 1 0-1c.564 0 1.034.11 1.412.336.383.228.634.551.794.907.295.655.294 1.465.294 2.081v3.175a.5.5 0 0 1-.5.501H15v4.5a1.5 1.5 0 0 1-3 0V12a1 1 0 0 0-1-1v4h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1zm9 0a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v13h8z" />
            </svg>
            Gas: {gas} Gwei
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  border: "1px solid black",
  background:
    "linear-gradient(90deg, rgba(32,32,69,1) 0%, rgba(46,46,73,1) 50%, rgba(47,47,83,1) 100%)",
  color: "white",
};

function SpinnerButton({ children }) {
  return (
    <button className="btn btn-primary fs-5" type="button" disabled>
      <span
        className="spinner-border spinner-border-sm"
        aria-hidden="true"></span>
      <span role="status"> {children} </span>
    </button>
  );
}

function showSuccessToast(transactionHash) {
  toast(
    (t) => (
      <span>
        Validado{" "}
        <Link to={`/explorer/tx/${transactionHash}`}>Ver en explorer</Link>
        <button
          className="btn btn-dark btn-sm ms-2"
          onClick={() => toast.dismiss(t.id)}>
          x
        </button>
      </span>
    ),
    {
      duration: 5000,
      icon: "✅", //❌
      style: {
        borderRadius: "10px",
        background: "#153613",
        color: "#fff",
      },
    }
  );
}

function showErrorToast(errorMessage) {
  toast(
    (t) => (
      <span>
        {errorMessage}
        <button
          className="btn btn-dark btn-sm ms-2"
          onClick={() => toast.dismiss(t.id)}>
          x
        </button>
      </span>
    ),
    {
      duration: 5000,
      icon: "❌",
      style: {
        borderRadius: "10px",
        background: "#361313",
        color: "#fff",
      },
    }
  );
}
