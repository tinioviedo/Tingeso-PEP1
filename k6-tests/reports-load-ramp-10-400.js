// LOAD TESTING — carga escalonada de 10 → 400 usuarios virtuales
// Épica 7 (Reportes) — endpoint: GET /api/v1/reports/sales
// Mide el comportamiento del sistema en distintos escenarios de carga,
// para armar el cuadro comparativo en Excel (10 / 50 / 100 / 200 / 400 usuarios).

import http from "k6/http";
import { check, sleep } from "k6";
import { getAdminToken } from "./auth.js";

export const options = {
  stages: [
    { duration: "30s", target: 10 },
    { duration: "30s", target: 50 },
    { duration: "30s", target: 100 },
    { duration: "30s", target: 200 },
    { duration: "30s", target: 400 },
    { duration: "30s", target: 0 },
  ],
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
