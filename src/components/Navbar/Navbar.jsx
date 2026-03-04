import { NavLink } from "react-router-dom";
import "./Navbar.css";

const links = [
  { to: "/play", label: "Jugar online" },
  { to: "/missions", label: "Misiones" },
  { to: "/tournament", label: "Torneo" },
  { to: "/inventory", label: "Mi Inventario" },
  { to: "/auctions", label: "Subasta" },
  { to: "/account", label: "Mi Cuenta" },
];

export default function Navbar() {
  return (
    <header className="nb">
      <div className="nb__inner">
        <div className="nb__brand">
          <span className="nb__logo" aria-hidden="true">⚔️</span>
          <span className="nb__title">Nexus Battles V</span>
        </div>

        <nav className="nb__nav" aria-label="Navegación principal">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `nb__link ${isActive ? "is-active" : ""}`}
              end={l.to === "/"}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}