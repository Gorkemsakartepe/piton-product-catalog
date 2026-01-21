"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuthGuard } from "@/lib/auth/useAuthGuard";
import { loadFavorites, removeFavorite } from "@/lib/favorites";

type Product = {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  image?: string;
};

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Kablosuz Kulaklık",
    description: "Gürültü engelleme, yüksek kalite ses ve uzun pil ömrü.",
    price: 2499,
    category: "Elektronik",
  },
  {
    id: "2",
    name: "Akıllı Saat",
    description: "Sağlık takibi, bildirimler ve spor modları.",
    price: 3199,
    category: "Giyilebilir",
  },
  {
    id: "3",
    name: "Mekanik Klavye",
    description: "Konforlu yazım, dayanıklı switch yapısı ve kompakt tasarım.",
    price: 1899,
    category: "Aksesuar",
  },
  {
    id: "4",
    name: "Oyuncu Mouse",
    description: "Yüksek hassasiyet sensör, ergonomik gövde.",
    price: 999,
    category: "Aksesuar",
  },
  {
    id: "5",
    name: "4K Monitör",
    description: "Keskin görüntü, geniş ekran çalışma alanı.",
    price: 7999,
    category: "Elektronik",
  },
];

function formatTRY(price?: number) {
  if (typeof price !== "number") return "";
  return price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

function imageForName(name: string) {
  const n = name.toLowerCase();
  if (n.includes("kulak")) return "/images/kulaklik.png";
  if (n.includes("saat")) return "/images/saat.png";
  if (n.includes("klavye")) return "/images/klavye.png";
  if (n.includes("mouse")) return "/images/mouse.png";
  if (n.includes("monit")) return "/images/monitor.webp";
  return "/images/klavye.png";
}

export default function FavoritesPage() {
  const { authed, mounted } = useAuthGuard();

  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    if (!mounted || !authed) return;
    setFavoriteIds(loadFavorites());
  }, [mounted, authed]);

  const favoriteProducts = useMemo(() => {
    const set = new Set(favoriteIds.map(String));
    return MOCK_PRODUCTS.filter((p) => set.has(String(p.id))).map((p) => ({
      ...p,
      image: imageForName(p.name),
    }));
  }, [favoriteIds]);

  if (!mounted || authed === null) return null;
  if (!authed) return null;

  return (
    <main className="mx-auto max-w-6xl px-4 pt-6 pb-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Favoriler</h1>
        <p className="mt-1 text-sm text-gray-600">
          Kaydettiğin ürünleri burada görebilirsin.
        </p>
      </div>

      {favoriteProducts.length === 0 ? (
        <section className="mt-6 rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border bg-gray-50 text-lg">
              ♡
            </span>

            <div className="flex-1">
              <p className="text-base font-medium">Henüz favori ürünün yok.</p>
              <p className="mt-1.5 text-sm text-gray-600">
                Ürünler sayfasından kalp ikonuna basarak favorilerine
                ekleyebilirsin.
              </p>

              <Link
                href="/products"
                className="mt-4 inline-flex rounded-xl border bg-white px-4 py-2 text-sm shadow-sm hover:bg-gray-50"
              >
                Ürünlere git
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <div className="mt-6 space-y-3">
          {favoriteProducts.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-3 rounded-2xl border bg-white p-3 shadow-sm sm:flex-row sm:items-center"
            >
              <div className="w-full overflow-hidden rounded-xl border bg-gray-50 sm:w-[160px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image || imageForName(p.name)}
                  alt={p.name}
                  className="h-[110px] w-full object-contain p-4"
                  loading="lazy"
                />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{p.name}</p>
                    {p.category ? (
                      <p className="mt-1 text-[11px] text-gray-500">
                        {p.category}
                      </p>
                    ) : null}
                  </div>

                  {!!formatTRY(p.price) && (
                    <span className="rounded-lg border bg-white px-2 py-1 text-xs">
                      {formatTRY(p.price)}
                    </span>
                  )}
                </div>

                {p.description ? (
                  <p className="mt-2 line-clamp-2 text-xs text-gray-600">
                    {p.description}
                  </p>
                ) : null}

                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/products/${p.id}`}
                    className="flex-1 rounded-xl border bg-white px-3 py-2 text-xs text-center shadow-sm hover:bg-gray-50"
                  >
                    Detay
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      const next = removeFavorite(p.id);
                      setFavoriteIds(next);
                    }}
                    className="flex-1 rounded-xl border bg-white px-3 py-2 text-xs shadow-sm hover:bg-gray-50"
                  >
                    Çıkar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
