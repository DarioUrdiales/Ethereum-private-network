import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  PlayFill,
  StopFill,
  ArrowClockwise,
  TrashFill,
  WalletFill,
} from "react-bootstrap-icons";
import { Toast, ToastContainer } from "react-bootstrap";
import { CustomModal } from "./CustomModal";

export function NetworkList() {
  const REFRESH_TIME = 30;
  const [networkList, setNetworkList] = useState([]);
  const [remainingTime, setRemainingTime] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [chainId, setChainId] = useState(0);

  const updateNetworkList = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/networks");
      let networkList = await response.json();
      networkList = networkList.filter(
        (network) => network.name !== "initial-blockchain_priv-eth-net-8000"
      );

      setNetworkList(networkList);
    } catch (error) {
      throw new Error(
        `Error al intentar obtener la lista de redes: ${error.message}`
      );
    }
  };

  const refreshList = async () => {
    await updateNetworkList();
    setRemainingTime(REFRESH_TIME);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime((prev) => (prev > 0 ? prev - 1 : REFRESH_TIME));
    }, 1000);

    // Limpiar el intervalo al desmontar el componente
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (remainingTime === 0) {
      updateNetworkList();
      setRemainingTime(REFRESH_TIME);
    }
  }, [remainingTime]);

  const removeNetwork = async (chainId) => {
    try {
      await fetch(`http://localhost:3000/api/networks/remove/${chainId}`, {
        method: "POST",
      });

      setTimeout(async () => {
        await refreshList();
        setShowToast(true);
        setToastMessage("La red ha sido eliminada exitosamente!");
      }, 10000);
    } catch (error) {
      throw new Error(
        `Error al intentar eliminar la red con el id de cadena ${chainId}: ${error.message}`
      );
    }
  };

  const startNetwork = async (chainId) => {
    try {
      await fetch(`http://localhost:3000/api/networks/start/${chainId}`, {
        method: "POST",
      });

      setTimeout(async () => {
        await refreshList();
        setShowToast(true);
        setToastMessage("La red ha sido iniciada exitosamente!");
      }, 5000);
    } catch (error) {
      throw new Error(
        `Error al intentar iniciar la red con el id de cadena ${chainId}: ${error.message}`
      );
    }
  };

  const stopNetwork = async (chainId) => {
    try {
      await fetch(`http://localhost:3000/api/networks/stop/${chainId}`, {
        method: "POST",
      });

      setTimeout(async () => {
        await refreshList();
        setShowToast(true);
        setToastMessage("La red ha sido detenida exitosamente!");
      }, 10000);
    } catch (error) {
      throw new Error(
        `Error al intentar detener la red con el id de cadena ${chainId}: ${error.message}`
      );
    }
  };

  const openAddNodeModal = (chainId) => {
    setShowAddNodeModal(true);
    setChainId(chainId);
  };

  const openAddAccountModal = (chainId) => {
    setShowAddAccountModal(true);
    setChainId(chainId);
  };

  const closeAddNodeModal = () => setShowAddNodeModal(false);
  const closeAddAccountModal = () => setShowAddAccountModal(false);

  const addNodes = async (chainId, nodesCount) => {
    try {
      await fetch(
        `http://localhost:3000/api/networks/add-node/${chainId}/${nodesCount}`,
        { method: "POST" }
      );
      closeAddNodeModal();

      setTimeout(async () => {
        await refreshList();
        setShowToast(true);
        setToastMessage("Los nodos han sido agregados exitosamente a la red!");
      }, 7000);
    } catch (error) {
      throw new Error(
        `Error al intentar agregar ${nodesCount} nodos a la red con el id de cadena ${chainId}: ${error.message}`
      );
    }
  };

  const addAccount = async (chainId, account) => {
    try {
      await fetch(`http://localhost:3000/api/networks/add-account`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chainId, account }),
      });

      closeAddAccountModal();

      setTimeout(async () => {
        await refreshList();
        setShowToast(true);
        setToastMessage(
          `La cuenta ${account} ha sido agregada exitosamente a la red!`
        );
      }, 7000);
    } catch (error) {
      throw new Error(
        `Error al intentar agregar la cuenta ${account} a la red con el id de cadena ${chainId}: ${error.message}`
      );
    }
  };

  return (
    <>
      <div className="container mb-5 mt-5">
        <div className="d-flex justify-content-end align-items-center gap-2">
          <span className="mb-2 text-white">
            {remainingTime} {remainingTime === 1 ? "second" : "seconds"} left to
            Refrescar la lista
          </span>
          <button className="btn btn-primary mb-2 d-flex align-items-center ps-1">
            <Plus cursor={"pointer"} size={24} />
            <Link
              className="text-decoration-none text-white"
              to={"create-network"}>
              Crear Red
            </Link>
          </button>
          <button
            className="btn btn-primary mb-2 d-flex align-items-center ps-2 gap-1"
            onClick={refreshList}>
            <ArrowClockwise cursor={"pointer"} size={20} />
            Refrescar
          </button>
        </div>

        <div className="border border-2 rounded p-3">
          <h2 className="text-content-build text-white">Listado de Redes</h2>
          <table className="table table-striped">
            <thead>
              <tr className="align-middle text-white">
                <th>Nombre</th>
                <th>Chain id</th>
                <th>Total de Nodos</th>
                <th>Número de Nodos Completos </th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {networkList && networkList.length > 0 ? (
                networkList?.map((network, index) => (
                  <tr className="align-middle text-white" key={index}>
                    <td>{network.name}</td>
                    <td>{network.chainId}</td>
                    <td>{network.nodes}</td>
                    <td>{network.normalNodes}</td>
                    <td>{network.status}</td>
                    <td>
                      <Plus
                        onClick={() => openAddNodeModal(network.chainId)}
                        title="Add node"
                        cursor={"pointer"}
                        size={28}
                      />
                      <WalletFill
                        onClick={() => openAddAccountModal(network.chainId)}
                        title="Add account"
                        cursor={"pointer"}
                        size={20}
                        color="#a26300"
                      />
                      {network.status === "Exited" ? (
                        <PlayFill
                          onClick={() => startNetwork(network.chainId)}
                          cursor={"pointer"}
                          title="Start blockchain"
                          color={"green"}
                          size={24}
                        />
                      ) : (
                        <StopFill
                          onClick={() => stopNetwork(network.chainId)}
                          cursor={"pointer"}
                          title="Stop blockchain"
                          color={"red"}
                          size={24}
                        />
                      )}
                      <TrashFill
                        onClick={() => removeNetwork(network.chainId)}
                        cursor={"pointer"}
                        title="Delete blockchain"
                        size={20}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="align-middle text-center text-white">
                  <td colSpan="6">No hay datos disponibles</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ToastContainer className="p-3 position-absolute" style={{ zIndex: 1 }}>
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide>
          <Toast.Body className="bg-success text-white">
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <CustomModal
        showModal={showAddNodeModal}
        callback={addNodes}
        closeModal={closeAddNodeModal}
        chainId={chainId}
        title="Agregar Nodos"
        placeholder="Número de Nodos"
        control="nodesCount"
        type="number"></CustomModal>

      <CustomModal
        showModal={showAddAccountModal}
        callback={addAccount}
        closeModal={closeAddAccountModal}
        chainId={chainId}
        title="Agregar Cuenta"
        placeholder="Cuentas"
        control="address"
        type="text"></CustomModal>
    </>
  );
}
