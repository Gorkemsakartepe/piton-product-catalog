import { apiFetchEnvelope } from "@/lib/api/client";

export type AuthEnvelope = {
  statusCode: number;
  success: boolean;
  message?: string;
  data: string; // token string
};

export async function loginApi(values: { email: string; password: string }) {
  // POST /auth/login
  const res = await apiFetchEnvelope<string>("/auth/login", {
    method: "POST",
    body: JSON.stringify(values),
  });
  return res; // { data: token }
}

export async function registerApi(values: {
  name: string;
  email: string;
  password: string;
}) {
  // POST /auth/register
  const res = await apiFetchEnvelope<string>("/auth/register", {
    method: "POST",
    body: JSON.stringify(values),
  });
  return res; // { data: token }
}
