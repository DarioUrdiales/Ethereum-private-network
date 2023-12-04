import React from "react";
import ReactDOM from "react-dom/client";
import { Home } from "./components/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Faucet } from "./components/Faucet.jsx";
import { Transfer } from "./components/Transfer";
import "./index.css";
import { Redes } from "./components/Redes.jsx";
import { Explorer } from "./components/Explorer/Explorer.jsx";
import { QueryClient, QueryClientProvider } from "react-query";
import { Block } from "./components/Explorer/Block.jsx";
import { LatestBlocks } from "./components/Explorer/LatestBlocks.jsx";
import { Tx } from "./components/Explorer/Tx.jsx";
import { Address } from "./components/Explorer/Address.jsx";
import { Root } from "./components/Root.jsx";
import { Team } from "../components/Team";

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
            <Route path="/redes" element={<Redes />} />
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
