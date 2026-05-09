import api from "../http-common";

const getAll = () => api.get("/api/v1/discounts/");
const create = (data) => api.post("/api/v1/discounts/", data);
const update = (id, data) => api.put(`/api/v1/discounts/${id}`, data);
const changeStatus = (id, active) => api.patch(`/api/v1/discounts/${id}/status`, { active });

export default { getAll, create, update, changeStatus };