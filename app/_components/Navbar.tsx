"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { clearToken, getToken } from "@/lib/auth/token";

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "rounded-full px-3 py-2 text-sm transition",
        active
          ? "bg-black text-white"
          : "text-gray-700 hover:bg-gray-100 hover:text-black",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [hasToken, setHasToken] = useState(false);

  const hideNav = useMemo(() => pathname?.startsWith("/auth"), [pathname]);

  useEffect(() => {
    setHasToken(!!getToken());
  }, [pathname]);

  if (hideNav) return null;

  const isProducts =
    pathname === "/products" || pathname?.startsWith("/products/");
  const isFav = pathname?.startsWith("/favorites");

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        {/* Brand */}
        <Link
          href={hasToken ? "/products" : "/auth"}
          className="group flex items-center gap-3"
        >
          {/* Logo Mark */}
          <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border bg-white shadow-sm">
            <span className="text-base font-semibold tracking-tight">N</span>
            <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-black" />
          </span>

          {/* Wordmark */}
          <p className="text-[15px] font-semibold tracking-[-0.02em]">
            Noventa
          </p>
        </Link>

        <nav className="flex items-center gap-2">
          <NavLink
            href="/products"
            label="Ürünler"
            active={!!hasToken && isProducts}
          />
          <NavLink
            href="/favorites"
            label="Favoriler"
            active={!!hasToken && isFav}
          />

          {!hasToken ? (
            <Link
              href="/auth"
              className="rounded-full border bg-white px-3 py-2 text-sm shadow-sm transition hover:bg-gray-50"
            >
              Giriş
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                clearToken();
                setHasToken(false);
                router.replace("/auth");
              }}
              className="rounded-full border bg-white px-3 py-2 text-sm shadow-sm transition hover:bg-gray-50"
            >
              Çıkış
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
