"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setAuthToken } from "@/features/auth/authSlice";
import { getToken } from "@/lib/auth/token";

type Options = {
  /** auth sayfasına atarken return url eklesin mi */
  withNext?: boolean;
};

export function useAuthGuard(options: Options = { withNext: true }) {
  const router = useRouter();
  const pathname = usePathname();

  const dispatch = useAppDispatch();
  const reduxToken = useAppSelector((s) => s.auth.token);

  const [mounted, setMounted] = useState(false);

  // Mount sonrası token'ı redux'a hydrate et
  useEffect(() => {
    setMounted(true);

    if (!reduxToken) {
      const t = getToken();
      if (t) dispatch(setAuthToken(t));
    }
  }, [reduxToken, dispatch]);

  const authed = useMemo(() => {
    if (!mounted) return null;
    return !!(reduxToken || getToken());
  }, [mounted, reduxToken]);

  useEffect(() => {
    if (!mounted) return;
    if (authed) return;

    const next = options.withNext && pathname ? `?next=${encodeURIComponent(pathname)}` : "";
    router.replace(`/auth${next}`);
  }, [mounted, authed, router, pathname, options.withNext]);

  return { authed, mounted };
}
