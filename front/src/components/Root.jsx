import { Footer } from "./Footer";
import { Header } from "./Header";
import { Outlet } from "react-router-dom";
import "../index.css";

export function Root() {
  return (
    <div className="testlayout">
      <Header />
      <div>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
