type ApiResponseSuccess<T> = {
  ok: true;
  data: T;
};

type ApiResponseError = {
  ok: false;
  error: string;
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
  const res = await fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    return { ok: false, error: res.statusText };
  }
  return { ok: true, data: await res.json() };
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
