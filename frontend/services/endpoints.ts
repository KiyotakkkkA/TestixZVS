const BASE_URL = "http://localhost:8000/api";

export const endpoints = {
  auth: {
    login: `${BASE_URL}/auth/login`,
    logout: `${BASE_URL}/auth/logout`,
    register: `${BASE_URL}/auth/register`,
    me: `${BASE_URL}/auth/me`,
    "password-recovery": `${BASE_URL}/auth/password-recovery`,
    "password-reset": `${BASE_URL}/auth/password-reset`,
    "email-confirmation": `${BASE_URL}/auth/email-confirmation`,
  },
};
