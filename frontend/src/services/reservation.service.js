import api from "../http-common";

const getAll = () => api.get("/api/v1/reservations/");
const getById = (id) => api.get(`/api/v1/reservations/${id}`);
const getMyReservations = (clientId) => api.get(`/api/v1/reservations/my/${clientId}`);
const create = (data) => api.post("/api/v1/reservations/", data);
const createMultiple = (data) => api.post("/api/v1/reservations/multiple", data);
const cancel = (id) => api.patch(`/api/v1/reservations/${id}/cancel`);

export default { getAll, getById, getMyReservations, create, createMultiple, cancel };