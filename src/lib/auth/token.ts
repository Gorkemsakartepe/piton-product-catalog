const LS_KEY = "token";
const SS_KEY = "token_session";
const REMEMBER_KEY = "remember_me";

export function setToken(token: string, remember: boolean) {
  if (remember) {
    localStorage.setItem(LS_KEY, token);
    localStorage.setItem(REMEMBER_KEY, "1");
    sessionStorage.removeItem(SS_KEY);
  } else {
    sessionStorage.setItem(SS_KEY, token);
    localStorage.removeItem(LS_KEY);
    localStorage.removeItem(REMEMBER_KEY);
  }
}

export function getToken(): string | null {
  // Önce local (remember), yoksa session (remember değil)
  return localStorage.getItem(LS_KEY) ?? sessionStorage.getItem(SS_KEY);
}

export function clearToken() {
  localStorage.removeItem(LS_KEY);
  localStorage.removeItem(REMEMBER_KEY);
  sessionStorage.removeItem(SS_KEY);
}

export function isRemembered(): boolean {
  return localStorage.getItem(REMEMBER_KEY) === "1";
}
