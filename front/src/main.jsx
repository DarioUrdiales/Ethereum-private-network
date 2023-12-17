import React from "react";
import ReactDOM from "react-dom/client";
import { Home } from "./components/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Faucet } from "./components/Faucet.jsx";
import { Transfer } from "./components/Transfer";
import { Redes } from "./components/Redes/Redes.jsx";
import { Explorer } from "./components/Explorer/Explorer.jsx";
import { QueryClient, QueryClientProvider } from "react-query";
import { Block } from "./components/Explorer/Block.jsx";
import { LatestBlocks } from "./components/Explorer/LatestBlocks.jsx";
import { Tx } from "./components/Explorer/Tx.jsx";
import { Address } from "./components/Explorer/Address.jsx";
import { Root } from "./components/Root.jsx";
import { Team } from "./components/Team";
import { CreateNetwork } from "./components/Redes/CreateNetwork.jsx";
import { NetworkList } from "./components/Redes/NetworkList.jsx";
import "./index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Root />}>
            <Route index element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/faucet" element={<Faucet />} />
            <Route path="/transfer" element={<Transfer />} />
            <Route path="/team" element={<Team />} />
            <Route path="/redes" element={<Redes />}>
              <Route index element={<NetworkList />} />
              <Route path="create-network" element={<CreateNetwork />} />
            </Route>
            <Route path="/explorer" element={<Explorer />}>
              <Route path="" element={<LatestBlocks />} />
              <Route path="block/:block" element={<Block />} />
              <Route path="tx/:tx" element={<Tx />} />
              <Route path="address/:address" element={<Address />} />
            </Route>
            <Route path="/team" element={<Team />} />{" "}
          </Route>
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  </QueryClientProvider>
);
