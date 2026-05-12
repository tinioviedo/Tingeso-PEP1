import { useState, useEffect, useRef } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import packageService from "../services/package.service"
import { getPackageImage, getFallbackGradient } from "../utils/packageImages"

/*
 * Dual range slider — técnica de CSS-Tricks:
 * https://css-tricks.com/multi-thumb-sliders-particular-two-thumb-case/
 *
 * Clave: pointer-events:none en el <input> completo,
 * pointer-events:all solo en el thumb vía pseudo-elemento CSS.
 * Así ambos thumbs son independientemente arrastrables.
 */
const SLIDER_STYLES = `
  .dual-range { position: relative; width: 100%; height: 28px; }
  .dual-range input[type="range"] {
    position: absolute; top: 0; left: 0;
    width: 100%; height: 100%;
    margin: 0; padding: 0;
    background: transparent;
    -webkit-appearance: none; appearance: none;
    pointer-events: none;
  }
  .dual-range input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none; appearance: none;
    width: 22px; height: 22px; border-radius: 50%;
    background: #fff;
    border: 2.5px solid #0A2540;
    box-shadow: 0 2px 8px rgba(10,37,64,0.22);
    cursor: grab;
    pointer-events: all;
  }
  .dual-range input[type="range"]::-moz-range-thumb {
    width: 22px; height: 22px; border-radius: 50%;
    background: #fff;
    border: 2.5px solid #0A2540;
    box-shadow: 0 2px 8px rgba(10,37,64,0.22);
    cursor: grab;
    pointer-events: all;
  }
  .dual-range input[type="range"]::-webkit-slider-runnable-track { background: transparent; }
  .dual-range input[type="range"]::-moz-range-track { background: transparent; }
`

/* ── Dual price range slider with histogram ───────────────── */
const PriceRangeSlider = ({ allPrices, minVal, maxVal, onMinChange, onMaxChange }) => {
  const prices = allPrices.filter(p => p > 0)
  if (prices.length === 0) return null

  const globalMin = Math.floor(Math.min(...prices))
  const globalMax = Math.ceil(Math.max(...prices))
  const range = globalMax - globalMin || 1

  const currentMin = minVal !== "" && !isNaN(Number(minVal))
    ? Math.max(globalMin, Math.min(Number(minVal), globalMax))
    : globalMin
  const currentMax = maxVal !== "" && !isNaN(Number(maxVal))
    ? Math.max(globalMin, Math.min(Number(maxVal), globalMax))
    : globalMax

  const minPct = ((currentMin - globalMin) / range) * 100
  const maxPct = ((currentMax - globalMin) / range) * 100

  // Histogram: 18 buckets
  const BUCKETS = 18
  const bucketSize = range / BUCKETS
  const histogram = Array(BUCKETS).fill(0)
  prices.forEach(p => {
    const idx = Math.min(Math.floor((p - globalMin) / bucketSize), BUCKETS - 1)
    histogram[idx]++
  })
  const maxCount = Math.max(...histogram, 1)

  const handleMin = (e) => {
    const v = Math.min(Number(e.target.value), currentMax - 1)
    onMinChange(String(v))
  }
  const handleMax = (e) => {
    const v = Math.max(Number(e.target.value), currentMin + 1)
    onMaxChange(String(v))
  }

  return (
    <div>
      {/* Inject styles once */}
      <style>{SLIDER_STYLES}</style>

      {/* Histogram bars */}
      <div style={{
        display: "flex", alignItems: "flex-end", height: 56,
        gap: 2, marginBottom: 0, padding: "0 1px",
      }}>
        {histogram.map((count, i) => {
          const bucketStart = globalMin + i * bucketSize
          const bucketEnd = bucketStart + bucketSize
          const active = bucketEnd > currentMin && bucketStart < currentMax
          return (
            <div key={i} style={{
              flex: 1,
              height: `${Math.max((count / maxCount) * 100, 3)}%`,
              background: active ? "#0A2540" : "#e2e8f0",
              borderRadius: "3px 3px 0 0",
              transition: "background 0.15s ease",
            }} />
          )
        })}
      </div>

      {/* Track + dual inputs */}
      <div style={{ position: "relative", height: 28, marginBottom: 8 }}>
        {/* Track base */}
        <div style={{
          position: "absolute", top: "50%", left: 0, right: 0,
          height: 4, background: "#e2e8f0", borderRadius: 2,
          transform: "translateY(-50%)", pointerEvents: "none",
        }} />
        {/* Active range fill */}
        <div style={{
          position: "absolute", top: "50%",
          left: `${minPct}%`, right: `${100 - maxPct}%`,
          height: 4, background: "#0A2540", borderRadius: 2,
          transform: "translateY(-50%)", pointerEvents: "none",
        }} />

        {/* Both inputs inside .dual-range — thumbs are independently draggable */}
        <div className="dual-range">
          <input
            type="range"
            min={globalMin} max={globalMax} step={1}
            value={currentMin}
            onChange={handleMin}
          />
          <input
            type="range"
            min={globalMin} max={globalMax} step={1}
            value={currentMax}
            onChange={handleMax}
          />
        </div>
      </div>

      {/* Price labels */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
        <div style={{
          background: "#f8fafc", border: "1.5px solid #e2e8f0",
          borderRadius: 10, padding: "6px 14px", textAlign: "center",
        }}>
          <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, marginBottom: 1 }}>Mínimo</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0A2540" }}>
            ${currentMin.toLocaleString()}
          </div>
        </div>
        <div style={{
          background: "#f8fafc", border: "1.5px solid #e2e8f0",
          borderRadius: 10, padding: "6px 14px", textAlign: "center",
        }}>
          <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, marginBottom: 1 }}>Máximo</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0A2540" }}>
            ${currentMax.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Package card ─────────────────────────────────────────── */
const PackageCard = ({ pkg, onClick }) => {
  const [imgError, setImgError] = useState(false)
  const [hovered, setHovered] = useState(false)
  const imageUrl = getPackageImage(pkg.destination)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", height: 320, borderRadius: 14,
        overflow: "hidden", cursor: "pointer",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        transition: "transform 0.28s ease, box-shadow 0.28s ease",
        boxShadow: hovered
          ? "0 20px 40px rgba(10,37,64,0.20)"
          : "0 4px 14px rgba(10,37,64,0.09)",
      }}
    >
      {imageUrl && !imgError ? (
        <img
          src={imageUrl} alt={pkg.destination}
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
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(10,37,64,0.88) 0%, rgba(10,37,64,0.15) 55%, transparent 100%)",
      }} />
      <div style={{
        position: "absolute", top: 12, right: 12,
        background: "#F97316", color: "#fff",
        padding: "4px 11px", borderRadius: 20,
        fontSize: 13, fontWeight: 700,
        boxShadow: "0 3px 10px rgba(249,115,22,0.4)",
      }}>
        ${pkg.price.toLocaleString()}
      </div>
      {pkg.tripType && (
        <div style={{
          position: "absolute", top: 12, left: 12,
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.25)",
          color: "#fff", padding: "3px 10px", borderRadius: 20,
          fontSize: 10, fontWeight: 600,
          textTransform: "uppercase", letterSpacing: 0.6,
        }}>
          {pkg.tripType}
        </div>
      )}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "18px 16px", color: "#fff" }}>
        <div style={{ fontSize: 11, opacity: 0.75, marginBottom: 4 }}>📍 {pkg.destination}</div>
        <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.25, marginBottom: 4 }}>{pkg.packageName}</div>
        <div style={{ fontSize: 11, opacity: 0.6 }}>{pkg.startDate} → {pkg.endDate} · {pkg.availableSlots} cupos</div>
      </div>
    </div>
  )
}

/* ── Filter panel ─────────────────────────────────────────── */
const FilterModal = ({ open, onClose, filters, onChange, onApply, onClear, count, allPrices }) => {
  if (!open) return null

  const activeFilters = Object.values(filters).filter(v => v !== "").length

  const inputStyle = {
    width: "100%", padding: "10px 14px",
    border: "1.5px solid #e2e8f0", borderRadius: 10,
    fontSize: 14, color: "#0A2540", outline: "none",
    fontFamily: "'Poppins', sans-serif",
    boxSizing: "border-box",
  }

  const SectionTitle = ({ children }) => (
    <div style={{
      fontSize: 15, fontWeight: 700, color: "#0A2540",
      marginBottom: 14, letterSpacing: -0.2,
    }}>
      {children}
    </div>
  )

  const Divider = () => (
    <div style={{ height: 1, background: "#f1f5f9", margin: "20px 0" }} />
  )

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(10,37,64,0.45)",
          backdropFilter: "blur(3px)",
          zIndex: 1200,
        }}
      />

      {/* Panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: 400, background: "#fff",
        zIndex: 1300,
        display: "flex", flexDirection: "column",
        boxShadow: "-8px 0 40px rgba(10,37,64,0.18)",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "20px 24px 18px",
          borderBottom: "1px solid #f1f5f9",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 18, fontWeight: 700, color: "#0A2540" }}>
              Filtros
            </span>
            {activeFilters > 0 && (
              <div style={{
                background: "#F97316", color: "#fff",
                fontSize: 11, fontWeight: 700,
                padding: "2px 8px", borderRadius: 20,
              }}>
                {activeFilters}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9", border: "none",
              width: 32, height: 32, borderRadius: "50%",
              cursor: "pointer", fontSize: 15, color: "#64748b",
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>

          {/* Destination */}
          <SectionTitle>Destino</SectionTitle>
          <input
            value={filters.destination}
            onChange={e => onChange("destination", e.target.value)}
            placeholder="Ej: París, Tokio, Roma..."
            style={inputStyle}
          />

          <Divider />

          {/* Trip type */}
          <SectionTitle>Tipo de viaje</SectionTitle>
          <input
            value={filters.tripType}
            onChange={e => onChange("tripType", e.target.value)}
            placeholder="Ej: Cultural, Deportivo, Aventura..."
            style={inputStyle}
          />

          <Divider />

          {/* Price range */}
          <SectionTitle>Rango de precios</SectionTitle>
          <p style={{
            margin: "0 0 16px", fontSize: 13, color: "#64748b",
            fontFamily: "'Poppins', sans-serif",
          }}>
            Precio del viaje (por persona)
          </p>

          <PriceRangeSlider
            allPrices={allPrices}
            minVal={filters.minPrice}
            maxVal={filters.maxPrice}
            onMinChange={v => onChange("minPrice", v)}
            onMaxChange={v => onChange("maxPrice", v)}
          />
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px",
          borderTop: "1px solid #f1f5f9",
          display: "flex", gap: 10,
        }}>
          <button
            onClick={onClear}
            style={{
              flex: 1, background: "#f8fafc",
              border: "1.5px solid #e2e8f0", borderRadius: 10,
              padding: "11px", fontSize: 14, fontWeight: 500,
              color: "#64748b", cursor: "pointer",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Limpiar
          </button>
          <button
            onClick={() => { onApply(); onClose() }}
            style={{
              flex: 2, background: "#0A2540",
              border: "none", borderRadius: 10,
              padding: "11px", fontSize: 14, fontWeight: 600,
              color: "#fff", cursor: "pointer",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            {count > 0 ? `Ver ${count} resultados` : "Ver resultados"}
          </button>
        </div>
      </div>
    </>
  )
}

/* ── Main page ────────────────────────────────────────────── */
const AvailablePackages = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [packages, setPackages] = useState([])
  const [allPrices, setAllPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)

  const [filters, setFilters] = useState({
    destination: searchParams.get("destination") || "",
    tripType: searchParams.get("tripType") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  })

  const activeFiltersCount = Object.values(filters).filter(v => v !== "").length

  // Load all prices once (for histogram)
  useEffect(() => {
    packageService.getAvailable()
      .then(res => setAllPrices(res.data.map(p => p.price)))
      .catch(() => {})
  }, [])

  const load = (f = filters) => {
    setLoading(true)
    const hasFilters = Object.values(f).some(v => v !== "")
    const params = {}
    if (f.destination) params.destination = f.destination
    if (f.tripType) params.tripType = f.tripType
    if (f.minPrice) params.minPrice = f.minPrice
    if (f.maxPrice) params.maxPrice = f.maxPrice

    const call = hasFilters
      ? packageService.search(params)
      : packageService.getAvailable()

    call
      .then(res => setPackages(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }))

  const handleClear = () => {
    const empty = { destination: "", tripType: "", minPrice: "", maxPrice: "" }
    setFilters(empty)
    load(empty)
  }

  return (
    <div style={{ padding: "0 32px", maxWidth: 1280, margin: "0 auto" }}>

      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 20, paddingTop: 8,
      }}>
        <div>
          <h2 style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: 22, fontWeight: 700,
            color: "#0A2540", margin: "0 0 4px", letterSpacing: -0.3,
          }}>
            Paquetes disponibles
          </h2>
          {!loading && (
            <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>
              {packages.length} {packages.length === 1 ? "resultado" : "resultados"}
              {activeFiltersCount > 0 && " con filtros aplicados"}
            </p>
          )}
        </div>

        {/* Filter button */}
        <button
          onClick={() => setFilterOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: activeFiltersCount > 0 ? "#0A2540" : "#fff",
            border: `1.5px solid ${activeFiltersCount > 0 ? "#0A2540" : "#cbd5e1"}`,
            borderRadius: 50, padding: "10px 20px",
            cursor: "pointer", fontFamily: "'Poppins', sans-serif",
            fontSize: 14, fontWeight: 500,
            color: activeFiltersCount > 0 ? "#fff" : "#0A2540",
            boxShadow: "0 2px 8px rgba(10,37,64,0.08)",
            transition: "all 0.2s ease",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="11" y1="18" x2="13" y2="18" />
          </svg>
          Filtros
          {activeFiltersCount > 0 && (
            <div style={{
              background: "#F97316", color: "#fff",
              width: 20, height: 20, borderRadius: "50%",
              fontSize: 11, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {activeFiltersCount}
            </div>
          )}
        </button>
      </div>

      {/* Active chips */}
      {activeFiltersCount > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {filters.destination && (
            <Chip label={`Destino: ${filters.destination}`} onRemove={() => { const f = { ...filters, destination: "" }; setFilters(f); load(f) }} />
          )}
          {filters.tripType && (
            <Chip label={`Tipo: ${filters.tripType}`} onRemove={() => { const f = { ...filters, tripType: "" }; setFilters(f); load(f) }} />
          )}
          {filters.minPrice && (
            <Chip label={`Desde $${Number(filters.minPrice).toLocaleString()}`} onRemove={() => { const f = { ...filters, minPrice: "" }; setFilters(f); load(f) }} />
          )}
          {filters.maxPrice && (
            <Chip label={`Hasta $${Number(filters.maxPrice).toLocaleString()}`} onRemove={() => { const f = { ...filters, maxPrice: "" }; setFilters(f); load(f) }} />
          )}
          <button onClick={handleClear} style={{
            background: "none", border: "none", color: "#F97316",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            fontFamily: "'Poppins', sans-serif", padding: "4px 8px",
          }}>
            Limpiar todo
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ height: 320, borderRadius: 14, background: "linear-gradient(135deg, #e2e8f0, #cbd5e1)" }} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && packages.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#94a3b8" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#475569", marginBottom: 8 }}>Sin resultados</div>
          <div style={{ fontSize: 14 }}>
            Intenta con otros filtros o{" "}
            <button onClick={handleClear} style={{ background: "none", border: "none", color: "#F97316", fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins', sans-serif", fontSize: 14 }}>
              limpia los filtros
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      {!loading && packages.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, paddingBottom: 48 }}>
          {packages.map(pkg => (
            <PackageCard key={pkg.id} pkg={pkg} onClick={() => navigate(`/packages/${pkg.id}`)} />
          ))}
        </div>
      )}

      <FilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onChange={handleChange}
        onApply={() => load()}
        onClear={handleClear}
        count={packages.length}
        allPrices={allPrices}
      />
    </div>
  )
}

const Chip = ({ label, onRemove }) => (
  <div style={{
    display: "inline-flex", alignItems: "center", gap: 6,
    background: "#EEF2F8", border: "1px solid #dde6f0",
    borderRadius: 20, padding: "4px 12px",
    fontSize: 13, color: "#0A2540", fontWeight: 500,
    fontFamily: "'Poppins', sans-serif",
  }}>
    {label}
    <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: 14, padding: 0, lineHeight: 1 }}>
      ✕
    </button>
  </div>
)

export default AvailablePackages
