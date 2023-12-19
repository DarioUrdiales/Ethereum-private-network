import { Footer } from "./Footer";
import { Header } from "./Header";
import { Outlet } from "react-router-dom";

export function Root() {
  return (
    <div className="d-flex flex-column full-height">
      <Header/>
      <div className="flex-grow-1">
        <Outlet/>
      </div>
      <Footer/>
    </div>
  );
}