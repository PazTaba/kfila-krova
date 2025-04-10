// src/config/config.ts

const API_IP = process.env.API_IP || '172.20.10.3';
const API_PORT = process.env.API_PORT || '3000';
const API_URL = `http://${API_IP}:${API_PORT}`;

export const Config = {
    API_IP,
    API_PORT,
    API_URL,
};
