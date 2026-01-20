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
import { setAuthToken } from "@/features/auth/authSlice";
import { loginApi, registerApi } from "@/features/auth/authApi";
import { setToken, clearToken } from "@/lib/auth/token";

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

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string | null;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-800">{label}</label>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function extractTokenFromApiResponse(res: any): string | null {
  return (
    res?.data?.token ||
    res?.data?.data?.token ||
    res?.data?.data?.data?.token ||
    null
  );
}

export default function AuthPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [mode, setMode] = useState<Mode>("login");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

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
        const token = extractTokenFromApiResponse(res);

        if (!token) {
          throw new Error("Giriş başarılı ancak token alınamadı.");
        }

        setToken(token, rememberMe);
        dispatch(setAuthToken(token));

        router.replace("/products");
        router.refresh();
        return;
      }

      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const res = await registerApi({
        name: fullName,
        email,
        password,
      });

      const token = extractTokenFromApiResponse(res);

      clearToken();
      if (token) {
        setToken(token, false);
        dispatch(setAuthToken(token));
      }

      router.replace("/products");
      router.refresh();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-80px)]">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl items-center px-4 py-10">
        <div className="grid w-full items-stretch gap-8 lg:grid-cols-2">
          <section className="hidden lg:block">
            <div className="h-full rounded-3xl border bg-white p-10 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border bg-white shadow-sm">
                  <span className="text-base font-semibold tracking-tight">N</span>
                  <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-black" />
                </span>
                <p className="text-[15px] font-semibold tracking-[-0.02em]">
                  Noventa
                </p>
              </div>

              <div className="mt-6 h-px w-full bg-gradient-to-r from-gray-200 via-gray-100 to-transparent" />

              <h1 className="mt-8 text-4xl font-semibold tracking-tight">
                Ürün kataloğunu <span className="text-gray-500">modern</span>{" "}
                şekilde yönet.
              </h1>

              <p className="mt-4 text-base text-gray-600">
                Giriş yaparak ürünleri görüntüleyebilir, favorilerine
                ekleyebilir ve ürün detaylarını inceleyebilirsin.
              </p>

              <div className="mt-8 grid gap-4">
                <div className="rounded-2xl border bg-gray-50 p-4">
                  <p className="text-sm font-medium">Hızlı erişim</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Hesabına güvenli şekilde giriş yap.
                  </p>
                </div>

                <div className="rounded-2xl border bg-gray-50 p-4">
                  <p className="text-sm font-medium">Favoriler</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Beğendiğin ürünleri kaydet, sonra kaldığın yerden devam et.
                  </p>
                </div>

                <div className="rounded-2xl border bg-gray-50 p-4">
                  <p className="text-sm font-medium">Detay sayfası</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Ürün bilgilerini temiz bir arayüzle incele.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="flex items-center">
            <div className="w-full rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {mode === "login" ? "Giriş Yap" : "Kayıt Ol"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {mode === "login"
                      ? "Hesabına erişmek için giriş yap."
                      : "Bilgilerini girerek yeni bir hesap oluştur."}
                  </p>
                </div>

                <div className="relative flex w-[190px] items-center rounded-full border bg-gray-50 p-1">
                  <div
                    className={[
                      "absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-black shadow-sm",
                      "transition-transform duration-300 ease-out",
                      mode === "login" ? "translate-x-0" : "translate-x-full",
                    ].join(" ")}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setSubmitted(false);
                      setApiError(null);
                    }}
                    className={[
                      "relative z-10 flex-1 rounded-full px-4 py-2 text-sm transition",
                      mode === "login" ? "text-white" : "text-gray-700",
                    ].join(" ")}
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
                    className={[
                      "relative z-10 flex-1 rounded-full px-4 py-2 text-sm transition",
                      mode === "register" ? "text-white" : "text-gray-700",
                    ].join(" ")}
                  >
                    Kayıt
                  </button>
                </div>
              </div>

              {apiError && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {apiError}
                </div>
              )}

              <form className="mt-6 space-y-4" onSubmit={onSubmit}>
                {mode === "register" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Ad" error={firstNameError}>
                      <input
                        className="w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-black"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder=""
                      />
                    </Field>

                    <Field label="Soyad" error={lastNameError}>
                      <input
                        className="w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-black"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder=""
                      />
                    </Field>

                    <div className="sm:col-span-2">
                      <Field label="Telefon" error={phoneError}>
                        <input
                          className="w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-black"
                          value={formatTRPhoneFromDigits(phoneDigits)}
                          onChange={(e) =>
                            setPhoneDigits(extractPhoneDigits(e.target.value))
                          }
                          placeholder=""
                          type="tel"
                          inputMode="numeric"
                        />
                      </Field>
                    </div>
                  </div>
                )}

                <Field label="E-Posta" error={emailError}>
                  <input
                    className="w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-black"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=""
                    type="email"
                  />
                </Field>

                <Field label="Şifre" error={passwordError}>
                  <div className="relative">
                    <input
                      className="w-full rounded-2xl border px-4 py-3 pr-12 outline-none transition focus:border-black"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder=""
                      type={showPassword ? "text" : "password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-gray-600 transition hover:bg-gray-100 hover:text-black"
                      aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </Field>

                {mode === "register" && (
                  <Field label="Şifre Tekrar" error={passwordConfirmError}>
                    <div className="relative">
                      <input
                        className="w-full rounded-2xl border px-4 py-3 pr-12 outline-none transition focus:border-black"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        placeholder=""
                        type={showPasswordConfirm ? "text" : "password"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordConfirm((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-gray-600 transition hover:bg-gray-100 hover:text-black"
                        aria-label={
                          showPasswordConfirm
                            ? "Şifre tekrarını gizle"
                            : "Şifre tekrarını göster"
                        }
                      >
                        {showPasswordConfirm ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </Field>
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
                  disabled={loading}
                  className="w-full rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-900 disabled:opacity-50"
                >
                  {loading
                    ? "İşleniyor..."
                    : mode === "login"
                    ? "Giriş Yap"
                    : "Kayıt Ol"}
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
