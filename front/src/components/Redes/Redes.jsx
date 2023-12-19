import { Outlet } from "react-router-dom";

export function Redes() {
  return (
    <>
      <h1 className="no-underline link-dark d-flex justify-content-center align-items-center text-content-build text-white margin-redes">
        Redes
      </h1>
      <Outlet />
    </>
  );
}
