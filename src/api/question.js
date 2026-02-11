import apiClient from "../services/apiClient";

export const getAllQuestions = (params = {}) => {
  return apiClient.get("/tests/questions/", { params });
};

export const createQuestion = async (payload) => {
  return await apiClient.post("/tests/questions/", payload);
};

export const updateQuestion = async (id, payload) => {
  return await apiClient.put(`/tests/questions/${id}/`, payload);
};

export const deleteQuestion = async (id) => {
  return await apiClient.delete(`/tests/questions/${id}/`);
};


