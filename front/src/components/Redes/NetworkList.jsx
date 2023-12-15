import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, PlayFill, StopFill, ArrowClockwise, TrashFill } from 'react-bootstrap-icons';
import { Toast, ToastContainer } from "react-bootstrap";

export function NetworkList() {
  const REFRESH_TIME = 30;  
  const [networkList, setNetworkList] = useState([]);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const navigate = useNavigate();

  const updateNetworkList = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/networks");
      let networkList = await response.json();
      networkList = networkList.filter(network => network.name !== "initial-blockchain_priv-eth-net-8000");
      
      setNetworkList(networkList);
    } catch (error) {
      throw new Error(`Error trying to obtain the network list: ${error.message}`);
    }    
  }

  const refreshList = async () => {
    await updateNetworkList();
    setTiempoRestante(REFRESH_TIME);
  }

  useEffect(() => {
    const intervalo = setInterval(() => {
      setTiempoRestante(prev => (prev > 0 ? prev - 1 : REFRESH_TIME));
    }, 1000); 

    // Limpiar el intervalo al desmontar el componente
    return () => clearInterval(intervalo);
  }, []); 

  useEffect(() => {
    if (tiempoRestante === 0) {
      updateNetworkList();
    }
  }, [tiempoRestante]);

  const handleClick = () => {
    console.log("Click");
  }

  const removeNetwork = async (chainId) => {
    try {
      await fetch(`http://localhost:3000/api/networks/remove/${chainId}`, { method: 'POST' });

      setTimeout(async () => { 
        await refreshList(); 
        setShowToast(true);
        setToastMessage("Network has been succesfully removed!");
      }, 10000);
    } catch (error) {
      throw new Error(`Error trying to remove the network with chain id ${chainId}: ${error.message}`);
    } 
  }

  const startNetwork = async (chainId) => {
    try {
      await fetch(`http://localhost:3000/api/networks/start/${chainId}`, { method: 'POST' });

      setTimeout(async () => { 
        await refreshList(); 
        setShowToast(true);
        setToastMessage("Network has been succesfully started!");
      }, 5000);
    } catch (error) {
      throw new Error(`Error trying to start the network with chain id ${chainId}: ${error.message}`);
    } 
  }

  const stopNetwork = async (chainId) => {
    try {
      await fetch(`http://localhost:3000/api/networks/stop/${chainId}`, { method: 'POST' });

      setTimeout(async () => { 
        await refreshList(); 
        setShowToast(true);
        setToastMessage("Network has been succesfully stopped!");
      }, 10000);
    } catch (error) {
      throw new Error(`Error trying to stop the network with chain id ${chainId}: ${error.message}`);
    } 
  }

  const goHome = () => {
    navigate("/home");
  }

  return (
    <>
      <div className="container mb-5 mt-5">
        <div className="d-flex justify-content-end align-items-center gap-2">
          <span className="mb-2">{tiempoRestante === 1 ? "Queda" : "Quedan"} {tiempoRestante} {tiempoRestante === 1 ? "segundo" : "segundos"} para refrescar la lista</span>
          <button className="btn btn-primary mb-2 d-flex align-items-center ps-1"><Plus cursor={'pointer'} size={24}/><Link className="text-decoration-none text-white" to={"create-network"}>Create network</Link></button>
          <button className="btn btn-primary mb-2 d-flex align-items-center ps-2 gap-1" onClick={refreshList}><ArrowClockwise cursor={'pointer'} size={20}/>Refresh</button>
        </div>

        <div className="border border-2 rounded p-3">
          <h2>Networks list</h2>
          <table className="table table-striped">
            <thead>
              <tr className="align-middle">
                <th>Name</th>
                <th>Chain id</th>
                <th>Nodes count</th>
                <th>Normal nodes count</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {
                networkList?.map((network, index) => (
                  <tr className="align-middle" key={index}>
                    <td>{network.name}</td>
                    <td>{network.chainId}</td>
                    <td>{network.nodes}</td>
                    <td>{network.normalNodes}</td>
                    <td>{network.status}</td>
                    <td>
                      <Plus onClick={handleClick} title="Add node" cursor={'pointer'} size={28}/>
                      {
                        network.status === 'Exited' ? 
                        <PlayFill onClick={() => startNetwork(network.chainId)} cursor={'pointer'} title="Start blockchain" color={"green"} size={24}/> :
                        <StopFill onClick={() => stopNetwork(network.chainId)} cursor={'pointer'} title="Stop blockchain" color={"red"} size={24}/>
                      }                      
                      <TrashFill onClick={() => removeNetwork(network.chainId)} cursor={'pointer'} title="Delete blockchain" size={20}/>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-end align-items-center gap-2">
          <button className="btn btn-secondary mt-2 gap-1" onClick={goHome}>Back</button>
        </div>
      </div>
      <ToastContainer className="p-3 position-absolute" style={{ zIndex: 1 }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide>
          <Toast.Body className="bg-success text-white">
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}