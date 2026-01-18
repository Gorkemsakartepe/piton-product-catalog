"use client";

import { useMemo, useState } from "react";
import { validateEmail, validatePassword } from "@/lib/validation/authSchemas";

type Mode = "login" | "register";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");

  // form values
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
    // API'yi bir sonraki committe bağlayacağız
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
              <label className="text-sm font-medium">Email</label>
              <input
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@mail.com"
                type="email"
              />
              {emailError && <p className="text-sm text-red-600">{emailError}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Şifre</label>
              <input
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6-20 karakter, harf + rakam"
                type="password"
              />
              {passwordError && (
                <p className="text-sm text-red-600">{passwordError}</p>
              )}
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
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
