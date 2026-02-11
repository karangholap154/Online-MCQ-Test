import apiClient from "../services/apiClient.js";

export const getCandidates = (params = {}) => {
    return apiClient.get("/users/v1/candidates/", { params });
};

export const UpdateCandidate = (candidateId, data) => {
    return apiClient.put(`/users/v1/users/${candidateId}/`, data);
};

export const createCandidate = (data) => {
    return apiClient.post("/users/v1/candidates/create-candidates", data);
};

export const generateTestLink = (data) => {
    return apiClient.post("/tests/test-links/reset/", data);
};

export const getCandidateResult = async (id) => {
    return await apiClient.get(`/candidates/result/${id}/`);
};

export const deleteCandidate = (id) => {
    return apiClient.delete(`/users/v1/users/${id}/users-delete`);
};

export const validateShortcode = (shortcode) => {
    return apiClient.get(`/tests/test/start/${shortcode}/`);
};

export const submitTest = (uuid, payload) => {
    return apiClient.post(`/tests/test/submit/${uuid}/`, payload);
};