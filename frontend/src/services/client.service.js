import api from "../http-common";

const getAll = () => api.get("/api/v1/clients/");
const getById = (id) => api.get(`/api/v1/clients/${id}`);
const create = (data) => api.post("/api/v1/clients/", data);
const update = (id, data) => api.put(`/api/v1/clients/${id}`, data);
const deactivate = (id) => api.delete(`/api/v1/clients/${id}`);
const deactivateAdmin = (id) => api.delete(`/api/v1/clients/admin/${id}`);
const getByEmail = (email) => api.get("/api/v1/clients/by-email", { params: { email } })

export default { getAll, getById, getByEmail, create, update, deactivate, deactivateAdmin };