// Versión SIMPLE, calcada de la estructura del profe (employees-list-constant-10.js).
// Único cambio real: el endpoint del profe es público, el nuestro pide token ADMIN.
//
// Para probar otro nivel de carga: cambia el número de la línea "vus: 10" a mano
// (10, luego 50, luego 100, luego 200) y vuelve a correr — así de simple.

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 10,
  duration: "30s",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
  },
};

const BASE_URL = "http://localhost:1427";
const TOKEN = __ENV.TOKEN; // el token se pasa por fuera, ver instrucciones abajo

export default function () {
  const res = http.get(
    `${BASE_URL}/api/v1/reports/sales?startDate=2026-01-01&endDate=2026-12-31`,
    { headers: { Authorization: `Bearer ${TOKEN}` } }
  );

  check(res, {
    "status is 200": (r) => r.status === 200,
    "response is array": (r) => Array.isArray(r.json()),
  });

  sleep(1);
}
