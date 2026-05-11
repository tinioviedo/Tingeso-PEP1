import { useState } from "react"
import { useNavigate } from "react-router-dom"
import packageService from "../services/package.service"

const Home = () => {
  const navigate = useNavigate()
  const [destination, setDestination] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (destination) params.append("destination", destination)
    if (minPrice) params.append("minPrice", minPrice)
    if (maxPrice) params.append("maxPrice", maxPrice)
    navigate(`/packages?${params.toString()}`)
  }

  return (
    <div style={{ margin: "-24px 0" }}>
      {/* Hero */}
      <div style={{ background: "#006BB6", padding: "60px 24px", textAlign: "center", color: "#fff" }}>
        <h1 style={{ fontSize: 32, fontWeight: 500, margin: "0 0 8px" }}>
          Tu próximo viaje comienza aquí
        </h1>
        <p style={{ fontSize: 15, opacity: 0.85, margin: "0 0 32px" }}>
          Encuentra el paquete perfecto para tu próxima aventura
        </p>

        {/* Search bar */}
        <div style={{
          background: "#fff", borderRadius: 50, padding: "6px 6px 6px 0",
          display: "flex", alignItems: "center", maxWidth: 680,
          margin: "0 auto", boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
        }}>
          <div style={{ flex: 2, padding: "8px 20px", borderRight: "1px solid #eee", textAlign: "left" }}>
            <div style={{ fontSize: 10, color: "#666", fontWeight: 500, marginBottom: 2 }}>DESTINO</div>
            <input
              value={destination}
              onChange={e => setDestination(e.target.value)}
              placeholder="¿A dónde vas?"
              style={{ border: "none", outline: "none", fontSize: 14, color: "#222", width: "100%", background: "transparent" }}
            />
          </div>
          <div style={{ flex: 1, padding: "8px 20px", borderRight: "1px solid #eee", textAlign: "left" }}>
            <div style={{ fontSize: 10, color: "#666", fontWeight: 500, marginBottom: 2 }}>PRECIO MÍN</div>
            <input
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              placeholder="$ Mín"
              type="number"
              style={{ border: "none", outline: "none", fontSize: 14, color: "#222", width: "100%", background: "transparent" }}
            />
          </div>
          <div style={{ flex: 1, padding: "8px 20px", textAlign: "left" }}>
            <div style={{ fontSize: 10, color: "#666", fontWeight: 500, marginBottom: 2 }}>PRECIO MÁX</div>
            <input
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              placeholder="$ Máx"
              type="number"
              style={{ border: "none", outline: "none", fontSize: 14, color: "#222", width: "100%", background: "transparent" }}
            />
          </div>
          <button
            onClick={handleSearch}
            style={{
              background: "#F58426", color: "#fff", border: "none",
              padding: "12px 28px", borderRadius: 50, fontSize: 14,
              fontWeight: 500, cursor: "pointer", marginLeft: 8, whiteSpace: "nowrap"
            }}
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Featured packages */}
      <div style={{ padding: "32px 24px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 20 }}>Paquetes destacados</h2>
        <FeaturedPackages navigate={navigate} />
      </div>
    </div>
  )
}

const FeaturedPackages = ({ navigate }) => {
  const [packages, setPackages] = useState([])
  const [hoveredId, setHoveredId] = useState(null)

  useState(() => {
    packageService.getAvailable()
      .then(res => setPackages(res.data.slice(0, 6)))
      .catch(err => console.error(err))
  }, [])

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
      {packages.map(pkg => (
        <div key={pkg.id}
          onMouseEnter={() => setHoveredId(pkg.id)}
          onMouseLeave={() => setHoveredId(null)}
          onClick={() => navigate(`/packages/${pkg.id}`)}
          style={{
            background: "#fff", border: "1px solid #eee", borderRadius: 12,
            overflow: "hidden", cursor: "pointer",
            transition: "box-shadow 0.2s, transform 0.2s",
            boxShadow: hoveredId === pkg.id ? "0 8px 24px rgba(0,0,0,0.12)" : "none",
            transform: hoveredId === pkg.id ? "translateY(-4px)" : "translateY(0)"
          }}>
          <div style={{ height: 160, background: "#BEC0C2", display: "flex", alignItems: "center", justifyContent: "center", color: "#7a7c7e", fontSize: 13 }}>
            {pkg.destination}
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 4 }}>{pkg.packageName}</div>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>{pkg.tripType} · {pkg.availableSlots} cupos</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 16, fontWeight: 500, color: "#006BB6" }}>${pkg.price.toLocaleString()}</span>
              <button
                onClick={e => { e.stopPropagation(); navigate(`/packages/${pkg.id}`) }}
                style={{ background: "#F58426", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer" }}
              >
                Ver
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Home