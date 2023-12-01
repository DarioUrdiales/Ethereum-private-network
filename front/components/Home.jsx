import { Content } from "./Content";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Outlet } from "react-router-dom"

export function Home() {
    return <div>
        <Header></Header> 
        <Content></Content>
        <Outlet></Outlet>
        <Footer></Footer>
    </div>
}