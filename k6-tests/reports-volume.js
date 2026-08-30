// VOLUME TESTING — mide el rendimiento del endpoint de Reportes (Épica 7)
// manteniendo FIJA la carga de usuarios, mientras varía el volumen de datos
// en la base de datos.
//
// A diferencia del load testing (donde varían los usuarios), aquí la variable
// independiente es la CANTIDAD DE REGISTROS en la tabla reservations.
//
// Uso: poblar la BD y luego correr indicando cuántos registros tiene:
//   k6 run -e REGISTROS=500 k6-tests/reports-volume.js

import http from "k6/http";
import { check, sleep } from "k6";
import { getAdminToken } from "./auth.js";

const REGISTROS = __ENV.REGISTROS || "0";
const VUS = parseInt(__ENV.VUS || "50"); // carga fija para poder comparar entre volúmenes

export const options = {
  vus: VUS,
  duration: "30s",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
  },
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

export function handleSummary(data) {
  const m = data.metrics;
  const resumen = {
    registros_en_bd: parseInt(REGISTROS),
    vus: VUS,
    peticiones_totales: m.http_reqs ? m.http_reqs.values.count : 0,
    peticiones_por_seg: m.http_reqs ? Number(m.http_reqs.values.rate.toFixed(2)) : 0,
    duracion_avg_ms: m.http_req_duration ? Number(m.http_req_duration.values.avg.toFixed(2)) : 0,
    duracion_med_ms: m.http_req_duration ? Number(m.http_req_duration.values.med.toFixed(2)) : 0,
    duracion_max_ms: m.http_req_duration ? Number(m.http_req_duration.values.max.toFixed(2)) : 0,
    duracion_p90_ms: m.http_req_duration ? Number(m.http_req_duration.values["p(90)"].toFixed(2)) : 0,
    duracion_p95_ms: m.http_req_duration ? Number(m.http_req_duration.values["p(95)"].toFixed(2)) : 0,
    tasa_fallos_pct: m.http_req_failed ? Number((m.http_req_failed.values.rate * 100).toFixed(2)) : 0,
    datos_recibidos_mb: m.data_received ? Number((m.data_received.values.count / 1024 / 1024).toFixed(2)) : 0,
  };

  return {
    stdout: "\n=== VOLUMEN " + REGISTROS + " registros ===\n" + JSON.stringify(resumen, null, 2) + "\n",
    [`resultados/volume-${REGISTROS}.json`]: JSON.stringify(resumen, null, 2),
  };
}
