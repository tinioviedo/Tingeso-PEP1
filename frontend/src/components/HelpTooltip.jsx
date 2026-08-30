import { useState } from "react"

/*
 * Ícono de ayuda contextual ("?") con tooltip propio al pasar el mouse.
 *
 * Heurística 10 (Ayuda y documentación): el frontend no tenía ninguna ayuda
 * contextual — se agrega en los puntos donde el usuario duda (CVV, datos
 * de acompañantes). Se construye un tooltip propio (no el `title` nativo
 * del navegador) para mantener consistencia visual con el resto de la app.
 */
export default function HelpTooltip({ text }) {
  const [show, setShow] = useState(false)

  return (
    <span style={{ position: "relative", display: "inline-block", marginLeft: 5 }}>
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 14, height: 14, borderRadius: "50%",
          background: "#cbd5e1", color: "#fff", fontSize: 10, fontWeight: 700,
          cursor: "help", userSelect: "none", verticalAlign: "middle",
        }}
      >
        ?
      </span>
      {show && (
        <span style={{
          position: "absolute", bottom: "140%", left: "50%", transform: "translateX(-50%)",
          background: "#0A2540", color: "#fff", fontSize: 11, lineHeight: 1.4,
          padding: "7px 10px", borderRadius: 7, width: 190,
          boxShadow: "0 8px 20px rgba(0,0,0,0.25)", zIndex: 30,
          textAlign: "center", pointerEvents: "none",
        }}>
          {text}
        </span>
      )}
    </span>
  )
}
