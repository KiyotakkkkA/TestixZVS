const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const LARAVEL_ORIGIN = trimTrailingSlash(
  process.env.NEXT_PUBLIC_LARAVEL_URL ?? "http://localhost:8000",
);

export const API_BASE_URL = trimTrailingSlash(
  process.env.NEXT_PUBLIC_API_URL ?? `${LARAVEL_ORIGIN}/api`,
);

export const API_V1_BASE_URL = trimTrailingSlash(
  process.env.NEXT_PUBLIC_API_V1_URL ?? `${API_BASE_URL}/v1`,
);

export const endpoints = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    logout: `${API_BASE_URL}/auth/logout`,
    register: `${API_BASE_URL}/auth/register`,
    me: `${API_BASE_URL}/auth/me`,
    "password-recovery": `${API_BASE_URL}/auth/password-recovery`,
    "password-reset": `${API_BASE_URL}/auth/password-reset`,
    "email-confirmation": `${API_BASE_URL}/auth/email-confirmation`,
  },
  admin: {
    users: {
      list: `${API_V1_BASE_URL}/admin/users`,
      create: `${API_V1_BASE_URL}/admin/users`,
      "access-change": `${API_V1_BASE_URL}/admin/users/access-change`,
    },
    audit: {
      list: `${API_V1_BASE_URL}/admin/audit`,
      detail: (uuid: string) => `${API_V1_BASE_URL}/admin/audit/${uuid}`,
    },
  },
  tests: {
    list: `${API_V1_BASE_URL}/tests`,
    create: `${API_V1_BASE_URL}/tests`,
    detail: (uuid: string) => `${API_V1_BASE_URL}/tests/${uuid}`,
    questions: {
      create: (testUuid: string) =>
        `${API_V1_BASE_URL}/tests/${testUuid}/questions`,
      update: (testUuid: string, questionUuid: string) =>
        `${API_V1_BASE_URL}/tests/${testUuid}/questions/${questionUuid}`,
      delete: (testUuid: string, questionUuid: string) =>
        `${API_V1_BASE_URL}/tests/${testUuid}/questions/${questionUuid}`,
    },
    results: {
      current: (testUuid: string) =>
        `${API_V1_BASE_URL}/tests/${testUuid}/results/current`,
      latest: (testUuid: string) =>
        `${API_V1_BASE_URL}/tests/${testUuid}/results/latest`,
      start: (testUuid: string) =>
        `${API_V1_BASE_URL}/tests/${testUuid}/results/start`,
      answer: (testUuid: string, resultUuid: string) =>
        `${API_V1_BASE_URL}/tests/${testUuid}/results/${resultUuid}/answer`,
      complete: (testUuid: string, resultUuid: string) =>
        `${API_V1_BASE_URL}/tests/${testUuid}/results/${resultUuid}/complete`,
    },
  },
};
