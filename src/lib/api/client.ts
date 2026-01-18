const BASE_URL = "https://assignment-api.piton.com.tr";

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  if (!res.ok) {
    let details = "";
    try {
      details = await res.text();
    } catch {
      // ignore
    }

    throw new Error(`Request failed (${res.status}) ${details ? "- " + details : ""}`);
  }

  return (await res.json()) as T;
}
