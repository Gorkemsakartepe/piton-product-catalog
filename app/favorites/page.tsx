"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth/token";
import { getFavorites, removeFavorite, type FavoriteItem } from "@/lib/storage/favorites";

function formatTRY(price?: number) {
  if (typeof price !== "number") return "";
  return price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

export default function FavoritesPage() {
  const router = useRouter();
  const [items, setItems] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/auth");
      return;
    }
    setItems(getFavorites());
  }, [router]);

  function onRemove(id: string) {
    removeFavorite(id);
    setItems(getFavorites());
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Favoriler</h1>

        <Link
          href="/products"
          className="rounded-lg border bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
        >
          Ürünlere dön
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-6 rounded-2xl border bg-white p-6 text-sm text-gray-600 shadow-sm">
          Henüz favori ürün eklemediniz.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((p) => (
            <div
              key={p.id}
              className="flex items-start justify-between gap-4 rounded-2xl border bg-white p-4 shadow-sm"
            >
              <div>
                <p className="font-medium">{p.name}</p>
                {p.description && <p className="mt-1 text-sm text-gray-600">{p.description}</p>}
              </div>

              <div className="flex items-center gap-3">
                {!!formatTRY(p.price) && (
                  <span className="rounded-lg border px-2 py-1 text-sm">{formatTRY(p.price)}</span>
                )}

                <Link
                  href={`/products/${p.id}`}
                  className="rounded-lg border bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
                >
                  Detay
                </Link>

                <button
                  onClick={() => onRemove(p.id)}
                  className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:bg-gray-900"
                >
                  Kaldır
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
