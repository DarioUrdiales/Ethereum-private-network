import { Outlet } from "react-router-dom";

export function Redes() {
  return (
    <div>
      <h1
        className="text-content-build"
        style={{
          marginTop: "30px",
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
        Redes
      </h1>
      <Outlet />
    </div>
  );
}
