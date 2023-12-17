import { Outlet } from "react-router-dom";

export function Redes() {
  return (
    <>
      <h1 className="no-underline link-dark d-flex justify-content-center align-items-center text-content-build mt-3 mb-0 text-white">
        Redes
      </h1>
      <Outlet />
    </>
  );
}
