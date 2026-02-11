import apiClient from "../services/apiClient";

export const getTestResults = async (params = {}) => {
  return apiClient.get("/tests/test/results/", { params });
};


