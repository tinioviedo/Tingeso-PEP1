// STRESS TESTING — llevar el sistema más allá de su capacidad normal
// Épica 7 (Reportes) — endpoint: GET /api/v1/reports/sales
// Objetivo: encontrar el PUNTO DE QUIEBRE, es decir, en qué cantidad de
// usuarios el sistema empieza a fallar o a degradarse de forma inaceptable.
//
// Nota: el threshold de duración se relaja a 2000 ms (en vez de 500 ms) porque
// acá no se busca cumplir el objetivo de rendimiento, sino observar hasta
// dónde aguanta antes de romperse.

import http from "k6/http";
import { check, sleep } from "k6";
import { getAdminToken } from "./auth.js";

export const options = {
  stages: [
    { duration: "30s", target: 100 },
    { duration: "30s", target: 200 },
    { duration: "30s", target: 400 },
    { duration: "30s", target: 800 },
    { duration: "30s", target: 1000 },
    { duration: "30s", target: 2000 },
    { duration: "30s", target: 3000 },
    { duration: "30s", target: 4000 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"],
  },
};

const BASE_URL = "http://localhost:1427";

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
