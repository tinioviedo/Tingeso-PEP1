import Drawer from "@mui/material/Drawer"
import List from "@mui/material/List"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Divider from "@mui/material/Divider"
import HomeIcon from "@mui/icons-material/Home"
import FlightIcon from "@mui/icons-material/Flight"
import BookOnlineIcon from "@mui/icons-material/BookOnline"
import PersonIcon from "@mui/icons-material/Person"
import { useNavigate, useLocation } from "react-router-dom"
import { useKeycloak } from "@react-keycloak/web"

export default function Sidemenu({ open, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { keycloak } = useKeycloak()
  const roles = keycloak.tokenParsed?.realm_access?.roles || []
  const isAdmin = roles.includes('ADMIN')

  const go = (path) => { navigate(path); onClose() }

  const itemStyle = (path) => ({
    borderLeft: location.pathname === path ? "3px solid #006BB6" : "3px solid transparent",
    background: location.pathname.startsWith(path) && path !== "/" ? "#E6F1FB" : "transparent",
    color: location.pathname.startsWith(path) && path !== "/" ? "#006BB6" : "inherit",
  })

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <List sx={{ width: 220, pt: 1 }}>
        <ListItemButton onClick={() => go('/home')} sx={itemStyle('/home')}>
          <ListItemIcon><HomeIcon sx={{ color: location.pathname === '/home' ? '#006BB6' : '#888' }} /></ListItemIcon>
          <ListItemText primary="Inicio" />
        </ListItemButton>

        <ListItemButton onClick={() => go('/packages')} sx={itemStyle('/packages')}>
          <ListItemIcon><FlightIcon sx={{ color: location.pathname.startsWith('/packages') ? '#006BB6' : '#888' }} /></ListItemIcon>
          <ListItemText primary="Explorar paquetes" />
        </ListItemButton>

        <ListItemButton onClick={() => go('/my-reservations')} sx={itemStyle('/my-reservations')}>
          <ListItemIcon><BookOnlineIcon sx={{ color: location.pathname === '/my-reservations' ? '#006BB6' : '#888' }} /></ListItemIcon>
          <ListItemText primary="Mis reservas" />
        </ListItemButton>

        <ListItemButton onClick={() => go('/profile')} sx={itemStyle('/profile')}>
          <ListItemIcon><PersonIcon sx={{ color: location.pathname === '/profile' ? '#006BB6' : '#888' }} /></ListItemIcon>
          <ListItemText primary="Mi perfil" />
        </ListItemButton>

        {isAdmin && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItemButton onClick={() => go('/admin/packages')} sx={itemStyle('/admin/packages')}>
              <ListItemText primary="Gestionar paquetes" sx={{ pl: 2 }} />
            </ListItemButton>
            <ListItemButton onClick={() => go('/admin/clients')} sx={itemStyle('/admin/clients')}>
              <ListItemText primary="Gestionar clientes" sx={{ pl: 2 }} />
            </ListItemButton>
            <ListItemButton onClick={() => go('/admin/reservations')} sx={itemStyle('/admin/reservations')}>
              <ListItemText primary="Todas las reservas" sx={{ pl: 2 }} />
            </ListItemButton>
            <ListItemButton onClick={() => go('/admin/discounts')} sx={itemStyle('/admin/discounts')}>
              <ListItemText primary="Descuentos" sx={{ pl: 2 }} />
            </ListItemButton>
            <ListItemButton onClick={() => go('/admin/promotions')} sx={itemStyle('/admin/promotions')}>
              <ListItemText primary="Promociones" sx={{ pl: 2 }} />
            </ListItemButton>
            <ListItemButton onClick={() => go('/admin/reports')} sx={itemStyle('/admin/reports')}>
              <ListItemText primary="Reportes" sx={{ pl: 2 }} />
            </ListItemButton>
          </>
        )}
      </List>
    </Drawer>
  )
}
