import { httpClient } from "./httpClient";
import type { CurrentUser, LoginRequest, LoginResponse } from "./types";

export function login(credentials: LoginRequest): Promise<LoginResponse> {
  return httpClient.post<LoginResponse>("/auth/login", credentials).then((res) => res.data);
}

export function fetchCurrentUser(): Promise<CurrentUser> {
  return httpClient.get<CurrentUser>("/auth/me").then((res) => res.data);
}

export function logout(): Promise<void> {
  return httpClient.post("/auth/logout").then(() => undefined);
}
