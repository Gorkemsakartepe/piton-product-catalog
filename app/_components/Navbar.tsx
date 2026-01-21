"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAuth, setAuthToken } from "@/features/auth/authSlice";
import { clearToken, getToken } from "@/lib/auth/token";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const dispatch = useAppDispatch();
  const reduxToken = useAppSelector((s) => s.auth.token);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!reduxToken) {
      const t = getToken();
      if (t) dispatch(setAuthToken(t));
    }
  }, [reduxToken, dispatch]);

  const authed = useMemo(() => {
    if (!mounted) return false;
    return !!(reduxToken || getToken());
  }, [mounted, reduxToken]);

  function onLogout() {
    clearToken();
    dispatch(clearAuth());
    router.replace("/auth");
    router.refresh();
  }

  if (pathname?.startsWith("/auth")) return null;

  const activeKey =
    pathname?.startsWith("/favorites")
      ? "favorites"
      : pathname?.startsWith("/products")
      ? "products"
      : "products";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/75 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/products" className="group flex items-center gap-3">
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-2xl border bg-white shadow-sm transition group-hover:shadow">
            <span className="text-sm font-semibold">N</span>
            <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-black" />
          </span>
          <span className="text-sm font-semibold tracking-tight">Noventa</span>
        </Link>

        <nav className="flex items-center gap-2">
          {/* Animated segmented control (Ürünler + Favoriler always visible) */}
          <div className="relative flex rounded-full border bg-white p-1 shadow-sm">
            {/* moving pill */}
            <div
              className={[
                "absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-black shadow-sm",
                "transition-transform duration-300 ease-out",
                activeKey === "products" ? "translate-x-0" : "translate-x-full",
              ].join(" ")}
            />

            <Link
              href="/products"
              className={[
                "relative z-10 flex-1 rounded-full px-4 py-2 text-center text-sm font-medium transition",
                activeKey === "products" ? "text-white" : "text-gray-700",
              ].join(" ")}
            >
              Ürünler
            </Link>

            <Link
              href="/favorites"
              className={[
                "relative z-10 flex-1 rounded-full px-4 py-2 text-center text-sm font-medium transition",
                activeKey === "favorites" ? "text-white" : "text-gray-700",
              ].join(" ")}
            >
              Favoriler
            </Link>
          </div>

          {authed ? (
            <button
              type="button"
              onClick={onLogout}
              className="ml-2 rounded-full border bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-gray-50 active:scale-[0.99]"
            >
              Çıkış
            </button>
          ) : (
            <Link
              href="/auth"
              className="ml-2 rounded-full border bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-gray-50 active:scale-[0.99]"
            >
              Giriş
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
