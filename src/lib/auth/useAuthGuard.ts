"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getToken } from "@/lib/auth/token";
import { setAuthToken } from "@/features/auth/authSlice";

export function useAuthGuard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const reduxToken = useAppSelector((s) => s.auth.token);
  const [checked, setChecked] = useState(false);

  const token = useMemo(() => reduxToken || getToken(), [reduxToken]);

  useEffect(() => {
    const t = getToken();
    if (!reduxToken && t) dispatch(setAuthToken(t));

    const effective = reduxToken || t;
    if (!effective) {
      router.replace("/auth");
      router.refresh();
      return;
    }

    setChecked(true);
  }, [reduxToken, dispatch, router]);

  return { token, checked };
}
