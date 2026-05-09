import api from "../http-common";

const getAll = () => api.get("/api/v1/packages/");
const getAvailable = () => api.get("/api/v1/packages/available");
const getById = (id) => api.get(`/api/v1/packages/${id}`);
const search = (params) => api.get("/api/v1/packages/search", { params });
const create = (data) => api.post("/api/v1/packages/", data);
const update = (id, data) => api.put(`/api/v1/packages/${id}`, data);
const changeStatus = (id, status) => api.patch(`/api/v1/packages/${id}/status`, { packageStatus: status });

export default { getAll, getAvailable, getById, search, create, update, changeStatus };