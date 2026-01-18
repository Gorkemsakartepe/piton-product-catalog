"use client";

import { useMemo, useState } from "react";
import { validateEmail, validatePassword } from "@/lib/validation/authSchemas";
import { Eye, EyeOff } from "lucide-react";

type Mode = "login" | "register";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");

  // form values
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);

  // submit sonrası hataları göstermek için
  const [submitted, setSubmitted] = useState(false);

  const nameError = useMemo(() => {
    if (mode !== "register") return null;
    if (!submitted) return null;
    if (!name.trim()) return "İsim zorunludur";
    return null;
  }, [mode, name, submitted]);

  const emailError = useMemo(() => {
    if (!submitted) return null;
    return validateEmail(email);
  }, [email, submitted]);

  const passwordError = useMemo(() => {
    if (!submitted) return null;
    return validatePassword(password);
  }, [password, submitted]);

  const canSubmit = useMemo(() => {
    const hasEmail = !validateEmail(email);
    const hasPassword = !validatePassword(password);
    const hasName = mode === "login" ? true : !!name.trim();
    return hasEmail && hasPassword && hasName;
  }, [email, password, name, mode]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);

    if (!canSubmit) return;

    // Şimdilik sadece UI + validation
    // API'yi bir sonraki committe bağlayacam
    alert(mode === "login" ? "Login submit OK" : "Register submit OK");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">
            {mode === "login" ? "Giriş Yap" : "Kayıt Ol"}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {mode === "login"
              ? "Hesabına giriş yap"
              : "Yeni bir hesap oluştur"}
          </p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            {mode === "register" && (
              <div className="space-y-1">
                <label className="text-sm font-medium">İsim</label>
                <input
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ad Soyad"
                />
                {nameError && (
                  <p className="text-sm text-red-600">{nameError}</p>
                )}
              </div>
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

              {passwordError && (
                <p className="text-sm text-red-600">{passwordError}</p>
              )}
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 accent-gray-700"
              />
              Beni hatırla
            </label>

            <button
              type="submit"
              className="w-full rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
              disabled={!canSubmit && submitted}
            >
              {mode === "login" ? "Giriş Yap" : "Kayıt Ol"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-gray-600">
            {mode === "login" ? "Hesabın yok mu?" : "Zaten hesabın var mı?"}{" "}
            <button
              className="font-medium text-black underline"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setSubmitted(false);
              }}
              type="button"
            >
              {mode === "login" ? "Kayıt Ol" : "Giriş Yap"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
