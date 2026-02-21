import api from './apiClient.js';

const baseURL = "/api/schools"

export const getAllSchools = () => {
    return api.get(`${baseURL}`
    );
};