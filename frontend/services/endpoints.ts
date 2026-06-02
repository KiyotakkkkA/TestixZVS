const BASE_URL = "http://localhost:8000/api";
const V1_BASE_URL = `${BASE_URL}/v1`;

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
  admin: {
    users: {
      list: `${V1_BASE_URL}/admin/users`,
      create: `${V1_BASE_URL}/admin/users`,
      "access-change": `${V1_BASE_URL}/admin/users/access-change`,
    },
    audit: {
      list: `${V1_BASE_URL}/admin/audit`,
      detail: (uuid: string) => `${V1_BASE_URL}/admin/audit/${uuid}`,
    },
  },
  tests: {
    list: `${V1_BASE_URL}/tests`,
    create: `${V1_BASE_URL}/tests`,
    detail: (uuid: string) => `${V1_BASE_URL}/tests/${uuid}`,
    questions: {
      create: (testUuid: string) => `${V1_BASE_URL}/tests/${testUuid}/questions`,
      update: (testUuid: string, questionUuid: string) =>
        `${V1_BASE_URL}/tests/${testUuid}/questions/${questionUuid}`,
      delete: (testUuid: string, questionUuid: string) =>
        `${V1_BASE_URL}/tests/${testUuid}/questions/${questionUuid}`,
    },
  },
};
