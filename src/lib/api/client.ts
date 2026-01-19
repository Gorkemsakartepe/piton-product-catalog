const BASE_URL = "https://assignment-api.piton.com.tr";

type ApiEnvelope<T> = {
  statusCode: number;
  success: boolean;
  message?: string;
  data: T;
};

export async function apiFetchEnvelope<T>(
  path: string,
  options?: RequestInit
): Promise<ApiEnvelope<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  const text = await res.text();
  let json: any = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
  }

  if (!res.ok) {
    const msg =
      json?.message ||
      json?.error?.message ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  if (json && typeof json === "object" && json.success === false) {
    throw new Error(json.message || "İşlem başarısız");
  }

  return json as ApiEnvelope<T>;
}
