"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DELETE,
  GET,
  POST,
  PUT,
  type AllowedMethods,
  type ApiResponse,
} from "@/services/api";

type UseApiOptions<T> = {
  headers?: Record<string, string>;
  immediate?: boolean;
  onSuccessFn?: (data: T) => void;
  onErrorFn?: (error: string) => void;
};

type UseApiResult<T, TBody> = {
  data: T | null;
  error: string | null;
  loading: boolean;
  execute: (body?: TBody) => Promise<ApiResponse<T>>;
  refetch: () => Promise<ApiResponse<T>>;
  reset: () => void;
};

async function callApi<T, TBody>(
  url: string,
  method: AllowedMethods,
  body?: TBody,
  headers?: Record<string, string>,
): Promise<ApiResponse<T>> {
  switch (method) {
    case "GET":
      return GET<T>(url, headers);
    case "POST":
      return POST<T>(url, body, headers);
    case "PUT":
      return PUT<T>(url, body, headers);
    case "DELETE":
      return DELETE<T>(url, headers);
  }
}

export function useApi<T, TBody = unknown>(
  url: string,
  method: AllowedMethods = "GET",
  options: UseApiOptions<T> = {},
): UseApiResult<T, TBody> {
  const { headers, immediate = method === "GET" } = options;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestIdRef = useRef(0);
  const headersRef = useRef(headers);
  const onSuccessFnRef = useRef(options.onSuccessFn);
  const onErrorFnRef = useRef(options.onErrorFn);

  headersRef.current = headers;
  onSuccessFnRef.current = options.onSuccessFn;
  onErrorFnRef.current = options.onErrorFn;

  const execute = useCallback(
    async (body?: TBody) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      setLoading(true);
      setError(null);

      const response = await callApi<T, TBody>(
        url,
        method,
        body,
        headersRef.current,
      );

      if (requestIdRef.current === requestId) {
        if (response.ok) {
          setData(response.data);
          onSuccessFnRef.current?.(response.data);
        } else {
          setError(response.data.message);
          onErrorFnRef.current?.(response.data.message);
        }
        setLoading(false);
      }

      return response;
    },
    [url, method],
  );

  const reset = useCallback(() => {
    requestIdRef.current += 1;
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!immediate) {
      return;
    }

    void execute();

    return () => {
      requestIdRef.current += 1;
    };
  }, [execute, immediate]);

  return {
    data,
    error,
    loading,
    execute,
    refetch: execute,
    reset,
  };
}
