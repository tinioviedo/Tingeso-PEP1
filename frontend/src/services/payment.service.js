import api from "../http-common";

const processPayment = (data) => api.post("/api/v1/payments/", data);
const getByReservation = (reservationId) => api.get(`/api/v1/payments/reservation/${reservationId}`);
const getAll = () => api.get("/api/v1/payments/");

export default { processPayment, getByReservation, getAll };