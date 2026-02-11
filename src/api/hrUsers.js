import apiClient from "../services/apiClient";

//Fetch Users
export const getUsers = (params = {}) => {
    return apiClient.get("/users/v1/users/admin-hr", { params })
};
// Create User
export const createUser = (payload) => {
    return apiClient.post("/users/v1/users/create-admin-hr/", payload);
};

export const updateUser = (id, payload) => {
    return apiClient.put(`/users/v1/users/${id}/`, payload);
};

// update user is active or inactive
export const updateStatus = (id, payload) => {
    return apiClient.patch(`/users/v1/users/${id}/`, payload);
};

// Delete User
export const deleteUser = (id) => {
    return apiClient.delete(`/users/v1/users/${id}/users-delete`);
};