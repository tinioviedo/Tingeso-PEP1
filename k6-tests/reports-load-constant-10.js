// LOAD TESTING — carga constante de 10 usuarios virtuales
// Épica 7 (Reportes) — endpoint: GET /api/v1/reports/sales
// Mide cómo se comporta el sistema con una carga normal y sostenida.

import http from "k6/http";
import { check, sleep } from "k6";
import { getAdminToken } from "./auth.js";

export const options = {
  vus: 10,
  duration: "30s",
  thresholds: {
    http_req_failed: ["rate<0.01"],    // menos del 1% de peticiones fallidas
    http_req_duration: ["p(95)<500"],  // el 95% responde en menos de 500 ms
  },
};

const BASE_URL = "http://localhost:1427";

// setup() corre UNA sola vez antes de la prueba: obtiene el token de admin
// y lo comparte con todos los VUs (así no se pide un token por cada petición).
export function setup() {
  return { token: getAdminToken() };
}

export default function (data) {
  const params = {
    headers: {
      Authorization: `Bearer ${data.token}`,
    },
  };

  const res = http.get(
    `${BASE_URL}/api/v1/reports/sales?startDate=2026-01-01&endDate=2026-12-31`,
    params
  );

  check(res, {
    "status is 200": (r) => r.status === 200,
    "response is array": (r) => Array.isArray(r.json()),
  });

  sleep(1);
}
