import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import MenuIcon from "@mui/icons-material/Menu"
import { useKeycloak } from "@react-keycloak/web"
import { useState } from "react"
import Sidemenu from "./Sidemenu"

export default function Navbar() {
  const { keycloak } = useKeycloak()
  const [open, setOpen] = useState(false)

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <Toolbar>
          <IconButton edge="start" sx={{ mr: 2, color: '#006BB6' }} onClick={() => setOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, color: '#006BB6', fontWeight: 500 }}>
            Travel<span style={{ color: '#F58426' }}>Agency</span>
          </Typography>
          <Typography sx={{ mr: 2, color: '#444', fontSize: 14 }}>
            {keycloak.tokenParsed?.preferred_username}
          </Typography>
          <Button
            onClick={() => keycloak.logout()}
            sx={{ backgroundColor: '#F58426', color: '#fff', borderRadius: '20px', px: 2, '&:hover': { backgroundColor: '#d4711f' } }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Sidemenu open={open} onClose={() => setOpen(false)} />
    </>
  )
}