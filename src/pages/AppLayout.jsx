import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import "./AppLayout.css";

export default function AppLayout() {
  return (
    <>
      <Navbar />

      <main className="app-container">
        <Outlet />
      </main>
    </>
  );
}