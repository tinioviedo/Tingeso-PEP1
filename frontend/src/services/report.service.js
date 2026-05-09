import api from "../http-common";

const getSales = (startDate, endDate) => api.get("/api/v1/reports/sales", { params: { startDate, endDate } });
const getRanking = (startDate, endDate) => api.get("/api/v1/reports/ranking", { params: { startDate, endDate } });

export default { getSales, getRanking };