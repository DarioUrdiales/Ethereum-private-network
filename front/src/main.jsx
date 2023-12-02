import React from "react";
import ReactDOM from "react-dom/client";
import { Home } from "../components/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Faucet } from "../components/Faucet.jsx";
import { Transfer } from "../components/Transfer";
import "./index.css";
import { Redes } from "../components/Redes.jsx";
import { Explorer } from "../components/Explorer.jsx";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/faucet" element={<Faucet />} />
        <Route path="/transfer" element={<Transfer />} />
        <Route path="/redes" element={<Redes />} />
        <Route path="/explorer" element={<Explorer />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
