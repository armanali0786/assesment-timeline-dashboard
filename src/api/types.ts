export interface ApiEnvelope<T> {
  trace_id: string;
  status_code: number;
  message: string;
  data: T;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface CurrentUser {
  id: string;
  username: string;
  name: string;
  email: string;
  customer_id?: string;
  customer_name?: string;
  roles: string[];
  status?: string;
}
