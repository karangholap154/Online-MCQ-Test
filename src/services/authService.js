import { loginApi, refreshTokenApi } from "../api/auth";

export const login = async (credentials) => {
  const res = await loginApi(credentials);

  // store tokens
  localStorage.setItem("token", res.data.access);
  localStorage.setItem("refreshToken", res.data.refresh);

  // store user
  localStorage.setItem("user", JSON.stringify(res.data.user));

  return res.data;
};

export const refreshToken = async () => {
  const refresh = localStorage.getItem("refreshToken");
  if (!refresh) throw new Error("No refresh token");

  const res = await refreshTokenApi(refresh);
  localStorage.setItem("token", res.data.access);

  return res.data.access;
};
