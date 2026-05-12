import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import packageService from "../services/package.service"
import { getPackageImage, getFallbackGradient } from "../utils/packageImages"

/* ── Featured card (full bleed image) ────────────────────── */
const FeaturedCard = ({ pkg, onClick }) => {
  const [imgError, setImgError] = useState(false)
  const [hovered, setHovered] = useState(false)
  const imageUrl = getPackageImage(pkg.destination)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", height: 380, borderRadius: 16,
        overflow: "hidden", cursor: "pointer",
        boxShadow: hovered
          ? "0 24px 48px rgba(10,37,64,0.22)"
          : "0 4px 16px rgba(10,37,64,0.10)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        transition: "transform 0.28s ease, box-shadow 0.28s ease",
      }}
    >
      {/* Background */}
      {imageUrl && !imgError ? (
        <img
          src={imageUrl}
          alt={pkg.destination}
          onError={() => setImgError(true)}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            position: "absolute", inset: 0,
            transform: hovered ? "scale(1.06)" : "scale(1)",
            transition: "transform 0.5s ease",
          }}
        />
      ) : (
        <div style={{
          width: "100%", height: "100%", position: "absolute", inset: 0,
          background: getFallbackGradient(pkg.destination),
        }} />
      )}

      {/* Overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(10,37,64,0.90) 0%, rgba(10,37,64,0.15) 55%, transparent 100%)",
      }} />

      {/* Price */}
      <div style={{
        position: "absolute", top: 14, right: 14,
        background: "#F97316", color: "#fff",
        padding: "5px 12px", borderRadius: 20,
        fontSize: 13, fontWeight: 700,
        boxShadow: "0 3px 10px rgba(249,115,22,0.4)",
      }}>
        ${pkg.price.toLocaleString()}
      </div>

      {/* Trip type */}
      {pkg.tripType && (
        <div style={{
          position: "absolute", top: 14, left: 14,
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.25)",
          color: "#fff", padding: "4px 10px", borderRadius: 20,
          fontSize: 10, fontWeight: 600,
          textTransform: "uppercase", letterSpacing: 0.6,
        }}>
          {pkg.tripType}
        </div>
      )}

      {/* Content */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "22px 20px", color: "#fff" }}>
        <div style={{ fontSize: 11, opacity: 0.75, marginBottom: 5 }}>📍 {pkg.destination}</div>
        <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.25, marginBottom: 6 }}>
          {pkg.packageName}
        </div>
        <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 14 }}>
          {pkg.startDate} → {pkg.endDate} · {pkg.availableSlots} cupos
        </div>
        <div style={{
          display: "inline-flex", alignItems: "center",
          background: "rgba(255,255,255,0.14)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.28)",
          color: "#fff", padding: "7px 16px", borderRadius: 20,
          fontSize: 12, fontWeight: 600,
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.25s ease, transform 0.25s ease",
        }}>
          Ver paquete →
        </div>
      </div>
    </div>
  )
}

/* ── Home ─────────────────────────────────────────────────── */
const Home = () => {
  const navigate = useNavigate()
  const [destination, setDestination] = useState("")
  const [tripType, setTripType] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [featured, setFeatured] = useState([])

  useEffect(() => {
    packageService.getAvailable()
      .then(res => setFeatured(res.data.slice(0, 3)))
      .catch(err => console.error(err))
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (destination) params.append("destination", destination)
    if (tripType) params.append("tripType", tripType)
    if (startDate) params.append("startDate", startDate)
    if (endDate) params.append("endDate", endDate)
    navigate(`/packages?${params.toString()}`)
  }

  return (
    <div style={{ margin: "-24px 0", background: "#F0F4F8" }}>

      {/* ══ HERO BANNER ═══════════════════════════════════ */}
      <div style={{
        background: "linear-gradient(135deg, #0A2540 0%, #0d2d4f 60%, #0A2540 100%)",
        padding: "64px 32px 72px",
        textAlign: "center",
      }}>
        <h1 style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: 50, fontWeight: 800,
          color: "#fff", margin: "0 0 14px",
          letterSpacing: -1.5, lineHeight: 1.1,
        }}>
          El viaje que siempre
          <span style={{ color: "#F97316" }}> imaginaste</span>
        </h1>
        <p style={{
          fontSize: 16, color: "rgba(255,255,255,0.60)",
          margin: "0 auto 40px", maxWidth: 460, lineHeight: 1.65,
          fontFamily: "'Poppins', sans-serif",
        }}>
          Paquetes deportivos, festivales, naturaleza y escapadas exclusivas.
        </p>

        {/* Search bar */}
        <div style={{
          background: "#fff", borderRadius: 14, padding: "6px",
          display: "flex", alignItems: "stretch",
          maxWidth: 820, margin: "0 auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
        }}>
          {/* Destination */}
          <div style={{ flex: 1.2, padding: "10px 18px", borderRight: "1px solid #f0f0f0" }}>
            <div style={{ fontSize: 9, color: "#bbb", fontWeight: 700, letterSpacing: 0.8, marginBottom: 3 }}>
              DESTINO
            </div>
            <input
              value={destination}
              onChange={e => setDestination(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="¿A dónde vas?"
              style={{
                border: "none", outline: "none", fontSize: 14,
                color: "#0A2540", width: "100%", background: "transparent",
                fontFamily: "'Poppins', sans-serif",
              }}
            />
          </div>

          {/* Date range */}
          <div style={{ flex: 1.4, padding: "10px 18px", borderRight: "1px solid #f0f0f0" }}>
            <div style={{ fontSize: 9, color: "#bbb", fontWeight: 700, letterSpacing: 0.8, marginBottom: 3 }}>
              FECHAS
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="date"
                value={startDate}
                onChange={e => { setStartDate(e.target.value); if (endDate && e.target.value > endDate) setEndDate("") }}
                style={{
                  border: "none", outline: "none", fontSize: 13,
                  color: startDate ? "#0A2540" : "#aaa", background: "transparent",
                  fontFamily: "'Poppins', sans-serif", cursor: "pointer", width: "100%",
                }}
              />
              <span style={{ color: "#ccc", fontSize: 12, flexShrink: 0 }}>→</span>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={e => setEndDate(e.target.value)}
                style={{
                  border: "none", outline: "none", fontSize: 13,
                  color: endDate ? "#0A2540" : "#aaa", background: "transparent",
                  fontFamily: "'Poppins', sans-serif", cursor: "pointer", width: "100%",
                }}
              />
            </div>
          </div>

          {/* Trip type */}
          <div style={{ flex: 1, padding: "10px 18px" }}>
            <div style={{ fontSize: 9, color: "#bbb", fontWeight: 700, letterSpacing: 0.8, marginBottom: 3 }}>
              TIPO DE VIAJE
            </div>
            <input
              value={tripType}
              onChange={e => setTripType(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Cultural, Deportivo..."
              style={{
                border: "none", outline: "none", fontSize: 14,
                color: "#0A2540", width: "100%", background: "transparent",
                fontFamily: "'Poppins', sans-serif",
              }}
            />
          </div>

          {/* Button */}
          <button
            onClick={handleSearch}
            style={{
              background: "#F97316", color: "#fff", border: "none",
              padding: "10px 26px", borderRadius: 10,
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              fontFamily: "'Poppins', sans-serif", whiteSpace: "nowrap",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#ea6500"}
            onMouseLeave={e => e.currentTarget.style.background = "#F97316"}
          >
            Buscar
          </button>
        </div>
      </div>

      {/* ══ FEATURED PACKAGES ═════════════════════════════ */}
      <div style={{ padding: "48px 32px 72px" }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-end", marginBottom: 28,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 4, height: 24, background: "#F97316", borderRadius: 2 }} />
            <div>
              <h2 style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: 22, fontWeight: 700,
                color: "#0A2540", margin: "0 0 4px", letterSpacing: -0.3,
              }}>
                Experiencias destacadas
              </h2>
              <p style={{ margin: 0, color: "#64748b", fontSize: 14, fontFamily: "'Poppins', sans-serif" }}>
                Las aventuras más solicitadas de la temporada
              </p>
            </div>
          </div>
          <OutlineButton onClick={() => navigate("/packages")}>
            Ver todos →
          </OutlineButton>
        </div>

        {/* Grid */}
        {featured.length === 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: 380, borderRadius: 16,
                background: "linear-gradient(135deg, #e2e8f0, #cbd5e1)",
              }} />
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }}>
            {featured.map(pkg => (
              <FeaturedCard
                key={pkg.id}
                pkg={pkg}
                onClick={() => navigate(`/packages/${pkg.id}`)}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

const OutlineButton = ({ onClick, children }) => {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#0A2540" : "transparent",
        border: "1.5px solid #0A2540",
        color: hovered ? "#fff" : "#0A2540",
        padding: "8px 20px", borderRadius: 50,
        fontSize: 13, fontWeight: 600, cursor: "pointer",
        fontFamily: "'Poppins', sans-serif",
        transition: "all 0.2s ease",
      }}
    >
      {children}
    </button>
  )
}

export default Home
