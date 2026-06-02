import { getStoredToken } from "./tokenStorage";

type ApiResponseSuccess<T> = {
  ok: true;
  data: T;
};

type ApiResponseError = {
  ok: false;
  data: {
    message: string;
  };
};

export type AllowedMethods = "GET" | "POST" | "PUT" | "DELETE";

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;

export type RequestOptions = {
  url: string;
  method: AllowedMethods;
  headers?: Record<string, string>;
  body?: unknown;
};

async function request<T>({
  url,
  method,
  headers,
  body,
}: RequestOptions): Promise<ApiResponse<T>> {
  const storedToken = getStoredToken();
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  const res = await fetch(url, {
    method: method,
    headers: {
      Accept: "application/json",
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(storedToken ? { Authorization: `Bearer ${storedToken.token}` } : {}),
      ...headers,
    },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });
  return { ok: res.ok, data: await res.json() } as ApiResponse<T>;
}

export async function GET<T>(
  url: string,
  headers?: Record<string, string>,
): Promise<ApiResponse<T>> {
  return request({ url, method: "GET", headers });
}

export async function POST<T>(
  url: string,
  body?: unknown,
  headers?: Record<string, string>,
): Promise<ApiResponse<T>> {
  return request({ url, method: "POST", body, headers });
}

export async function PUT<T>(
  url: string,
  body?: unknown,
  headers?: Record<string, string>,
): Promise<ApiResponse<T>> {
  return request({ url, method: "PUT", body, headers });
}

export async function DELETE<T>(
  url: string,
  headers?: Record<string, string>,
): Promise<ApiResponse<T>> {
  return request({ url, method: "DELETE", headers });
}
