"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import {
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordConfirm,
  validatePhone,
} from "@/lib/validation/authSchemas";

import { useAppDispatch } from "@/store/hooks";
import { setAuth } from "@/features/auth/authSlice";
import { loginApi, registerApi } from "@/features/auth/authApi";
import { setToken } from "@/lib/auth/token";

type Mode = "login" | "register";

function formatTRPhoneFromDigits(digits: string) {
  const d = digits.replace(/\D/g, "").slice(0, 10);
  if (!d) return "";

  const p1 = d.slice(0, 3);
  const p2 = d.slice(3, 6);
  const p3 = d.slice(6, 8);
  const p4 = d.slice(8, 10);

  let out = "+90";
  out += `(${p1}`;
  if (p1.length === 3) out += `)`;
  if (p2) out += ` ${p2}`;
  if (p3) out += `-${p3}`;
  if (p4) out += `-${p4}`;
  return out;
}

function extractPhoneDigits(input: string) {
  const digits = input.replace(/\D/g, "");
  const normalized = digits.startsWith("90") ? digits.slice(2) : digits;
  return normalized.slice(0, 10);
}

export default function AuthPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [mode, setMode] = useState<Mode>("login");

  // Register fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");

  // Shared fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register confirm
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // Remember Me (login only)
  const [rememberMe, setRememberMe] = useState(false);

  // API state
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Validation display
  const [submitted, setSubmitted] = useState(false);

  const firstNameError = useMemo(() => {
    if (mode !== "register" || !submitted) return null;
    return validateName(firstName, "Ad");
  }, [mode, submitted, firstName]);

  const lastNameError = useMemo(() => {
    if (mode !== "register" || !submitted) return null;
    return validateName(lastName, "Soyad");
  }, [mode, submitted, lastName]);

  const phoneError = useMemo(() => {
    if (mode !== "register" || !submitted) return null;
    return validatePhone(phoneDigits);
  }, [mode, submitted, phoneDigits]);

  const emailError = useMemo(() => {
    if (!submitted) return null;
    return validateEmail(email);
  }, [submitted, email]);

  const passwordError = useMemo(() => {
    if (!submitted) return null;
    return validatePassword(password);
  }, [submitted, password]);

  const passwordConfirmError = useMemo(() => {
    if (mode !== "register" || !submitted) return null;
    return validatePasswordConfirm(password, passwordConfirm);
  }, [mode, submitted, password, passwordConfirm]);

  const canSubmit = useMemo(() => {
    const okEmail = !validateEmail(email);
    const okPassword = !validatePassword(password);

    if (mode === "login") return okEmail && okPassword;

    const okFirst = !validateName(firstName, "Ad");
    const okLast = !validateName(lastName, "Soyad");
    const okPhone = !validatePhone(phoneDigits);
    const okConfirm = !validatePasswordConfirm(password, passwordConfirm);

    return okFirst && okLast && okPhone && okEmail && okPassword && okConfirm;
  }, [mode, firstName, lastName, phoneDigits, email, password, passwordConfirm]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setApiError(null);

    if (!canSubmit) return;

    try {
      setLoading(true);

      if (mode === "login") {
        const res = await loginApi({ email, password });
        const token = res.data.token;

        dispatch(setAuth({ token, rememberMe }));
        setToken(token, rememberMe);

        router.push("/products");
        return;
      }

      // register
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const res = await registerApi({
        name: fullName,
        email,
        password,
      });

      const token = res.data.token;

      dispatch(setAuth({ token, rememberMe: false }));
      setToken(token, false);
      
      router.push("/products");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">
              {mode === "login" ? "Giriş Yap" : "Kayıt Ol"}
            </h1>

            <div className="flex rounded-lg border p-1 text-sm">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setSubmitted(false);
                  setApiError(null);
                }}
                className={`rounded-md px-3 py-1 ${
                  mode === "login" ? "bg-black text-white" : "text-gray-700"
                }`}
              >
                Giriş
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setSubmitted(false);
                  setApiError(null);
                }}
                className={`rounded-md px-3 py-1 ${
                  mode === "register" ? "bg-black text-white" : "text-gray-700"
                }`}
              >
                Kayıt
              </button>
            </div>
          </div>

          <p className="mt-2 text-sm text-gray-600">
            {mode === "login"
              ? "Hesabına giriş yap"
              : "Ad, soyad, telefon, e-mail ve şifre bilgileri ile kayıt ol"}
          </p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            {apiError && (
              <p className="rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                {apiError}
              </p>
            )}

            {mode === "register" && (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Ad</label>
                  <input
                    className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder=""
                  />
                  {firstNameError && (
                    <p className="text-sm text-red-600">{firstNameError}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Soyad</label>
                  <input
                    className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder=""
                  />
                  {lastNameError && (
                    <p className="text-sm text-red-600">{lastNameError}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Telefon</label>
                  <input
                    className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black"
                    value={formatTRPhoneFromDigits(phoneDigits)}
                    onChange={(e) => setPhoneDigits(extractPhoneDigits(e.target.value))}
                    placeholder=""
                    type="tel"
                    inputMode="numeric"
                  />
                  {phoneError && (
                    <p className="text-sm text-red-600">{phoneError}</p>
                  )}
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium">E-Posta</label>
              <input
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                type="email"
              />
              {emailError && <p className="text-sm text-red-600">{emailError}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Şifre</label>

              <div className="relative">
                <input
                  className="w-full rounded-lg border px-3 py-2 pr-12 outline-none focus:border-black"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  type={showPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-600 hover:text-black"
                  aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
            </div>

            {mode === "register" && (
              <div className="space-y-1">
                <label className="text-sm font-medium">Şifre Tekrar</label>

                <div className="relative">
                  <input
                    className="w-full rounded-lg border px-3 py-2 pr-12 outline-none focus:border-black"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder=""
                    type={showPasswordConfirm ? "text" : "password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-600 hover:text-black"
                    aria-label={
                      showPasswordConfirm ? "Şifre tekrarını gizle" : "Şifre tekrarını göster"
                    }
                  >
                    {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {passwordConfirmError && (
                  <p className="text-sm text-red-600">{passwordConfirmError}</p>
                )}
              </div>
            )}

            {mode === "login" && (
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 accent-black"
                />
                Beni hatırla
              </label>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "İşleniyor..." : mode === "login" ? "Giriş Yap" : "Kayıt Ol"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
