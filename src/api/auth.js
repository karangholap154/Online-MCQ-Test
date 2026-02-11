import apiClient from "../services/apiClient";
export const loginApi = (data) => {
  return apiClient.post("/token/", data);
};

export const refreshTokenApi = (refresh) => {
  return apiClient.post("/token/refresh/", {
    refresh,
  });
};