import api from "../http-common";

const getAll = () => api.get("/api/v1/clients/");
const getById = (id) => api.get(`/api/v1/clients/${id}`);
const create = (data) => api.post("/api/v1/clients/", data);
const update = (id, data) => api.put(`/api/v1/clients/${id}`, data);
const deactivate = (id) => api.delete(`/api/v1/clients/${id}`);
const deactivateAdmin = (id) => api.delete(`/api/v1/clients/admin/${id}`);

export default { getAll, getById, create, update, deactivate, deactivateAdmin };