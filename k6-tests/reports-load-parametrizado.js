// LOAD TESTING parametrizado — permite medir CADA nivel de carga por separado
// Épica 7 (Reportes) — endpoint: GET /api/v1/reports/sales
//
// El script de rampa entrega un único resultado agregado de todas las etapas.
// Para construir el cuadro comparativo en Excel se necesita el resultado
// aislado de cada nivel de carga, así que aquí los VUs se reciben por parámetro:
//
//   k6 run -e VUS=10  k6-tests/reports-load-parametrizado.js
//   k6 run -e VUS=50  k6-tests/reports-load-parametrizado.js
//   k6 run -e VUS=100 k6-tests/reports-load-parametrizado.js
//   k6 run -e VUS=200 k6-tests/reports-load-parametrizado.js

import http from "k6/http";
import { check, sleep } from "k6";
import { getAdminToken } from "./auth.js";

const VUS = parseInt(__ENV.VUS || "10");

export const options = {
  vus: VUS,
  duration: "30s",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
  },
  // No abortar la prueba si se incumple un umbral: interesa registrar el
  // comportamiento degradado, no detener la medición.
  noConnectionReuse: false,
};

const BASE_URL = "http://localhost:1427";

export function setup() {
  return { token: getAdminToken() };
}

export default function (data) {
  const params = { headers: { Authorization: `Bearer ${data.token}` } };

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

// Exporta un resumen en JSON por cada corrida, para tabular en Excel sin
// tener que copiar números a mano desde la consola.
export function handleSummary(data) {
  const m = data.metrics;
  const resumen = {
    vus: VUS,
    peticiones_totales: m.http_reqs ? m.http_reqs.values.count : 0,
    peticiones_por_seg: m.http_reqs ? Number(m.http_reqs.values.rate.toFixed(2)) : 0,
    duracion_avg_ms: m.http_req_duration ? Number(m.http_req_duration.values.avg.toFixed(2)) : 0,
    duracion_min_ms: m.http_req_duration ? Number(m.http_req_duration.values.min.toFixed(2)) : 0,
    duracion_med_ms: m.http_req_duration ? Number(m.http_req_duration.values.med.toFixed(2)) : 0,
    duracion_max_ms: m.http_req_duration ? Number(m.http_req_duration.values.max.toFixed(2)) : 0,
    duracion_p90_ms: m.http_req_duration ? Number(m.http_req_duration.values["p(90)"].toFixed(2)) : 0,
    duracion_p95_ms: m.http_req_duration ? Number(m.http_req_duration.values["p(95)"].toFixed(2)) : 0,
    tasa_fallos_pct: m.http_req_failed ? Number((m.http_req_failed.values.rate * 100).toFixed(2)) : 0,
    checks_ok_pct: m.checks ? Number((m.checks.values.rate * 100).toFixed(2)) : 0,
  };

  return {
    stdout: "\n=== RESUMEN " + VUS + " VUs ===\n" + JSON.stringify(resumen, null, 2) + "\n",
    [`resultados/load-${VUS}vus.json`]: JSON.stringify(resumen, null, 2),
  };
}
