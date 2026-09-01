import axios, { AxiosError } from "axios";
import type { ApiEnvelope } from "./types";
import { ApiError } from "./types";
import { emitUnauthorized, tokenStore } from "./tokenStore";

// Fixed test backend for this assignment — falls back here if a deploy host's env var
// wasn't set before the build ran (Vite bakes VITE_* vars in at build time).
const DEFAULT_API_BASE_URL = "https://fractaldmsdev.centralindia.cloudapp.azure.com";

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

httpClient.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => {
    const envelope = response.data as ApiEnvelope<unknown>;
    if (envelope.status_code >= 400) {
      if (envelope.status_code === 401) {
        tokenStore.clear();
        emitUnauthorized();
      }
      throw new ApiError(envelope.message, envelope.status_code);
    }
    return { ...response, data: envelope.data };
  },
  (error: AxiosError<ApiEnvelope<unknown>>) => {
    const status = error.response?.status ?? 0;
    const message = error.response?.data?.message ?? error.message;
    const isLoginCall = error.config?.url?.includes("/auth/login");

    if (status === 401 && !isLoginCall) {
      tokenStore.clear();
      emitUnauthorized();
    }

    return Promise.reject(new ApiError(message, status));
  },
);
