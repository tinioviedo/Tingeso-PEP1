import api from "../http-common";

const getAll = () => api.get("/api/v1/promotions/");
const getActive = () => api.get("/api/v1/promotions/active");
const create = (data) => api.post("/api/v1/promotions/", data);
const update = (id, data) => api.put(`/api/v1/promotions/${id}`, data);
const changeStatus = (id, active) => api.patch(`/api/v1/promotions/${id}/status`, { active });

export default { getAll, getActive, create, update, changeStatus };