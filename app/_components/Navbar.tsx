"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAuth, setAuthToken } from "@/features/auth/authSlice";
import { clearToken, getToken } from "@/lib/auth/token";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const dispatch = useAppDispatch();
  const reduxToken = useAppSelector((s) => s.auth.token);

  const [mounted, setMounted] = useState(false);
  const [authed, setAuthed] = useState(false);

  if (pathname?.startsWith("/auth")) return null;

  useEffect(() => {
    setMounted(true);

    if (!reduxToken) {
      const t = getToken();
      if (t) dispatch(setAuthToken(t));
    }
  }, [reduxToken, dispatch]);

  useEffect(() => {
    if (!mounted) return;

    const storageToken = getToken();
    setAuthed(!!(reduxToken || storageToken));
  }, [mounted, reduxToken]);

  function onLogout() {
    clearToken();
    dispatch(clearAuth());
    setAuthed(false);

    router.replace("/auth");
    router.refresh();
  }

  const showAuthAction = mounted;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/products" className="flex items-center gap-3">
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-2xl border bg-white shadow-sm">
            <span className="text-sm font-semibold">N</span>
            <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-black" />
          </span>
          <span className="text-sm font-semibold tracking-tight">Noventa</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/products"
            className="rounded-xl px-3 py-2 text-sm hover:bg-gray-50"
          >
            Ürünler
          </Link>

          <Link
            href="/favorites"
            className="rounded-xl px-3 py-2 text-sm hover:bg-gray-50"
          >
            Favoriler
          </Link>

          {showAuthAction ? (
            authed ? (
              <button
                type="button"
                onClick={onLogout}
                className="rounded-xl border px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
              >
                Çıkış
              </button>
            ) : (
              <Link
                href="/auth"
                className="rounded-xl border px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
              >
                Giriş
              </Link>
            )
          ) : (

            <span className="h-9 w-20 rounded-xl border bg-white/60" />
          )}
        </nav>
      </div>
    </header>
  );
}
