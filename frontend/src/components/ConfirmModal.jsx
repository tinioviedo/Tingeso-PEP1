/*
 * Modal de confirmación propio — reemplaza a window.confirm().
 *
 * Heurística 4 (Consistencia y estándares) / 8 (Diseño estético): el diálogo
 * nativo del navegador (window.confirm) es gris, sin tipografía ni colores
 * de la app — rompe la identidad visual. Este componente usa la misma
 * paleta y el mismo patrón visual que los overlays de éxito ya existentes
 * (fondo oscuro + tarjeta blanca centrada).
 */
export default function ConfirmModal({
  open,
  title = "¿Estás seguro?",
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(10,37,64,0.75)",
      backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "32px 32px 28px",
        maxWidth: 400, width: "100%",
        boxShadow: "0 32px 80px rgba(0,0,0,0.30)",
        animation: "fadeUp 0.25s ease",
      }}>
        <h3 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 700, color: "#0A2540" }}>
          {title}
        </h3>
        <p style={{ margin: "0 0 26px", color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              background: "#fff", border: "1px solid #ddd", color: "#444",
              padding: "10px 18px", borderRadius: 10, fontSize: 14, fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              background: danger ? "#e53e3e" : "#F58426", border: "none", color: "#fff",
              padding: "10px 18px", borderRadius: 10, fontSize: 14, fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  )
}
