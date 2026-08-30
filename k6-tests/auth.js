// Helper compartido: obtiene un token JWT de Keycloak con rol ADMIN.
//
// Los endpoints de Reportes (Épica 7) están protegidos con
// @PreAuthorize("hasRole('ADMIN')"), así que K6 necesita autenticarse
// antes de poder medirlos. Se usa el flujo "password grant" de OAuth2.
//
// REQUISITO previo (una sola vez, en la consola de Keycloak):
//   1. Clients → travelagency-frontend → Settings
//      → activar "Direct access grants" → Save
//   2. Users → crear un usuario con rol ADMIN (Role mapping → Assign role → ADMIN)

import http from "k6/http";

const KEYCLOAK_URL = "http://localhost:9090";
const REALM = "travelagency-realm";
const CLIENT_ID = "travelagency-frontend";

const ADMIN_USER = "admin.k6";
const ADMIN_PASS = "Admin!2026";

export function getAdminToken() {
  const res = http.post(
    `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
    {
      grant_type: "password",
      client_id: CLIENT_ID,
      username: ADMIN_USER,
      password: ADMIN_PASS,
    },
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  if (res.status !== 200) {
    throw new Error(
      `No se pudo obtener el token de Keycloak (status ${res.status}): ${res.body}`
    );
  }

  return res.json("access_token");
}
