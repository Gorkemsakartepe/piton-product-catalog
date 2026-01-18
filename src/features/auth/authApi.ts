import { apiFetch } from "@/lib/api/client";

export type AuthResponse = { token: string };

export async function loginApi(values: {
  email: string;
  password: string;
}) {
  return apiFetch<AuthResponse>("/api/v1/user/login", {
    method: "POST",
    body: JSON.stringify(values),
  });
}

export async function registerApi(values: {
  name: string;
  email: string;
  password: string;
}) {
  return apiFetch<AuthResponse>("/api/v1/user/register", {
    method: "POST",
    body: JSON.stringify(values),
  });
}
