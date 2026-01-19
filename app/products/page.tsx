"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  description?: string;
  price?: number;
};

/**
 * Kurumsal not:
 * - /api/v1/books endpoint'i zaman zaman 500 dönebiliyor.
 * - UI akışının bozulmaması için API başarısız olursa mock data ile devam edilir.
 */
const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Kablosuz Kulaklık",
    description: "Gürültü engelleme, yüksek kalite ses ve uzun pil ömrü.",
    price: 2499,
  },
  {
    id: "2",
    name: "Akıllı Saat",
    description: "Sağlık takibi, bildirimler ve spor modları.",
    price: 3199,
  },
  {
    id: "3",
    name: "Mekanik Klavye",
    description: "Konforlu yazım, dayanıklı switch yapısı ve kompakt tasarım.",
    price: 1899,
  },
  {
    id: "4",
    name: "Oyuncu Mouse",
    description: "Yüksek hassasiyet sensör, ergonomik gövde.",
    price: 999,
  },
  {
    id: "5",
    name: "4K Monitör",
    description: "Keskin görüntü, geniş ekran çalışma alanı.",
    price: 7999,
  },
];

function formatTRY(price?: number) {
  if (typeof price !== "number") return "";
  return price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

function iconForName(name: string) {
  const n = name.toLowerCase();
  if (n.includes("kulak")) return "🎧";
  if (n.includes("saat")) return "⌚";
  if (n.includes("klavye")) return "⌨️";
  if (n.includes("mouse")) return "🖱️";
  if (n.includes("monit")) return "🖥️";
  return "📦";
}

function themeForName(name: string) {
  const n = name.toLowerCase();
  if (n.includes("kulak")) return { a: "#EEF2FF", b: "#E0F2FE", c: "#FFFFFF" };
  if (n.includes("saat")) return { a: "#ECFEFF", b: "#E0E7FF", c: "#FFFFFF" };
  if (n.includes("klavye")) return { a: "#F5F3FF", b: "#E0F2FE", c: "#FFFFFF" };
  if (n.includes("mouse")) return { a: "#EFF6FF", b: "#ECFCCB", c: "#FFFFFF" };
  if (n.includes("monit")) return { a: "#F1F5F9", b: "#E2E8F0", c: "#FFFFFF" };
  return { a: "#F3F4F6", b: "#E5E7EB", c: "#FFFFFF" };
}

function cleanHeroSvgDataUri(icon: string, theme: { a: string; b: string; c: string }) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${theme.a}"/>
        <stop offset="1" stop-color="${theme.b}"/>
      </linearGradient>
    </defs>

    <rect width="800" height="500" rx="32" fill="url(#g)"/>
    <circle cx="650" cy="150" r="130" fill="${theme.c}" opacity="0.55"/>
    <circle cx="160" cy="420" r="180" fill="${theme.c}" opacity="0.40"/>
    <circle cx="320" cy="180" r="90" fill="${theme.c}" opacity="0.28"/>

    <text x="72" y="140" font-family="Arial, Helvetica, sans-serif" font-size="64">${icon}</text>

    <!-- küçük brand line (istersen kaldırabiliriz) -->
    <text x="72" y="450" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#6B7280">
      Piton Product Catalog
    </text>
  </svg>`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [userFacingError, setUserFacingError] = useState<string | null>(null);

  const cards = useMemo(
    () =>
      items.map((p) => {
        const icon = iconForName(p.name);
        const theme = themeForName(p.name);
        const img = cleanHeroSvgDataUri(icon, theme);
        return { ...p, img };
      }),
    [items]
  );

  useEffect(() => {
    async function run() {
      try {
        setLoading(true);
        setUserFacingError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          setItems(MOCK_PRODUCTS);
          return;
        }

        const res = await fetch("https://store-api-dev.piton.com.tr/api/v1/books", {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const text = await res.text();
        const json = text ? JSON.parse(text) : null;

        if (!res.ok || json?.success === false || !json?.data) {
          console.warn("[Products] Books API failed, fallback to mock.", {
            status: res.status,
            body: json,
          });
          setItems(MOCK_PRODUCTS);
          return;
        }

        const apiItems: Product[] = (json.data as any[]).map((b, i) => ({
          id: String(b.id ?? i + 1),
          name: String(b.name ?? b.title ?? "Ürün"),
          description: b.description ?? "",
          price: typeof b.price === "number" ? b.price : undefined,
        }));

        setItems(apiItems.length ? apiItems : MOCK_PRODUCTS);
      } catch (e) {
        console.warn("[Products] Unexpected error, fallback to mock.", e);
        setItems(MOCK_PRODUCTS);
        setUserFacingError("Ürünler şu anda yüklenemedi. Lütfen tekrar deneyin.");
      } finally {
        setLoading(false);
      }
    }

    run();
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Ürünler</h1>
          <p className="mt-1 text-sm text-gray-600">
            Kataloğu inceleyebilir ve ürün detaylarına geçebilirsiniz.
          </p>
        </div>

        <Link
          href="/auth"
          className="rounded-lg border bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
        >
          Hesap
        </Link>
      </div>

      {loading && <p className="mt-6 text-sm text-gray-600">Yükleniyor...</p>}

      {userFacingError && (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {userFacingError}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.id}`}
            className="rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow"
          >
            <div className="overflow-hidden rounded-xl border bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.img}
                alt={p.name}
                className="h-[180px] w-full object-cover"
                loading="lazy"
              />
            </div>

            <div className="mt-3">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-medium">{p.name}</h2>
                {!!formatTRY(p.price) && (
                  <span className="whitespace-nowrap rounded-lg border px-2 py-1 text-sm">
                    {formatTRY(p.price)}
                  </span>
                )}
              </div>

              {p.description && (
                <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                  {p.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
