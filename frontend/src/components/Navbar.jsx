import { useState, useEffect } from "react"
import IconButton from "@mui/material/IconButton"
import MenuIcon from "@mui/icons-material/Menu"
import { useKeycloak } from "@react-keycloak/web"
import { useNavigate, useLocation } from "react-router-dom"
import Sidemenu from "./Sidemenu"

export default function Navbar() {
  const { keycloak } = useKeycloak()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const username = keycloak.tokenParsed?.preferred_username || ""
  const initial = username[0]?.toUpperCase() || "?"
  const roles = keycloak.tokenParsed?.realm_access?.roles || []
  const isAdmin = roles.includes("ADMIN")

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const navLinks = [
    { label: "Inicio", path: "/home" },
    { label: "Paquetes", path: "/packages" },
    { label: "Mis reservas", path: "/my-reservations" },
    { label: "Mi perfil", path: "/profile" },
    ...(isAdmin ? [{ label: "Admin", path: "/admin" }] : []),
  ]

  const isActive = (path) =>
    path === "/home"
      ? location.pathname === "/home"
      : location.pathname.startsWith(path)

  return (
    <>
      <div style={{
        position: "sticky", top: 0, zIndex: 1100,
        background: scrolled ? "rgba(10,37,64,0.97)" : "#0A2540",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        boxShadow: scrolled ? "0 4px 24px rgba(10,37,64,0.28)" : "none",
        transition: "box-shadow 0.3s ease",
      }}>
        <div style={{
          display: "flex", alignItems: "center",
          padding: "0 24px", height: 60,
          maxWidth: 1400, margin: "0 auto",
        }}>

          {/* Hamburger — solo por si acaso, oculto en desktop */}
          <IconButton
            onClick={() => setOpen(true)}
            sx={{ mr: 1, color: "rgba(255,255,255,0.6)", display: { xs: "flex", md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <div
            onClick={() => navigate("/home")}
            style={{
              display: "flex", alignItems: "center",
              gap: 10, cursor: "pointer",
              userSelect: "none", marginRight: 36, flexShrink: 0,
            }}
          >
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: "#F97316",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 17, flexShrink: 0,
              boxShadow: "0 2px 10px rgba(249,115,22,0.4)",
            }}>
              ✈
            </div>
            <span style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 800, fontSize: 20,
              letterSpacing: "-0.5px", color: "#fff",
            }}>
              Travel<span style={{ color: "#F97316" }}>Agency</span>
            </span>
          </div>

          {/* Nav links — centro */}
          <nav style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
            {navLinks.map(link => (
              <NavLink
                key={link.path}
                label={link.label}
                active={isActive(link.path)}
                onClick={() => navigate(link.path)}
              />
            ))}
          </nav>

          {/* Derecha: avatar + nombre + logout */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            {/* Divider */}
            <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.15)", marginRight: 4 }} />

            {/* Avatar */}
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "#F97316",
              color: "#fff", fontSize: 12, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              {initial}
            </div>

            {/* Username */}
            <span style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 13, color: "rgba(255,255,255,0.75)",
              maxWidth: 120, overflow: "hidden",
              textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {username}
            </span>

            {/* Logout button */}
            <LogoutButton onClick={() => keycloak.logout()} />
          </div>
        </div>
      </div>

      <Sidemenu open={open} onClose={() => setOpen(false)} />
    </>
  )
}

function NavLink({ label, active, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "none", border: "none",
        color: active ? "#fff" : hovered ? "#fff" : "rgba(255,255,255,0.62)",
        fontFamily: "'Poppins', sans-serif",
        fontSize: 14, fontWeight: active ? 600 : 500,
        padding: "8px 14px",
        cursor: "pointer",
        borderRadius: 6,
        position: "relative",
        transition: "color 0.15s ease",
      }}
    >
      {label}
      <div style={{
        position: "absolute", bottom: 2, left: "50%",
        transform: "translateX(-50%)",
        width: active ? "55%" : hovered ? "30%" : "0%",
        height: 2.5, borderRadius: 2,
        background: "#F97316",
        transition: "width 0.2s ease",
      }} />
    </button>
  )
}

function LogoutButton({ onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: "'Poppins', sans-serif",
        background: hovered ? "#F97316" : "rgba(255,255,255,0.08)",
        border: `1px solid ${hovered ? "#F97316" : "rgba(255,255,255,0.18)"}`,
        color: hovered ? "#fff" : "rgba(255,255,255,0.7)",
        padding: "6px 16px", borderRadius: 20,
        fontSize: 12, fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
    >
      Salir
    </button>
  )
}
