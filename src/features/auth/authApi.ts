import { apiFetchEnvelope } from "@/lib/api/client";

export type ApiEnvelope<T> = {
  statusCode: number;
  success: boolean;
  message?: string;
  data: T;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  role_id: number;
  branch_id: number | null;
};

export type AuthData = {
  user: AuthUser;
  token: string;
};

export async function loginApi(values: { email: string; password: string }) {
  return apiFetchEnvelope<AuthData>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(values),
  });
}

export async function registerApi(values: {
  name: string;
  email: string;
  password: string;
}) {
  return apiFetchEnvelope<AuthData>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(values),
  });
}

