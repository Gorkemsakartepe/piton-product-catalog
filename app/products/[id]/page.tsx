"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth/token";
import { addFavorite, isFavorite, removeFavorite, type FavoriteItem } from "@/lib/storage/favorites";

type Product = {
  id: string;
  name: string;
  description?: string;
  price?: number;
};

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
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${theme.a}"/>
        <stop offset="1" stop-color="${theme.b}"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="700" rx="40" fill="url(#g)"/>
    <circle cx="980" cy="200" r="180" fill="${theme.c}" opacity="0.55"/>
    <circle cx="220" cy="560" r="240" fill="${theme.c}" opacity="0.40"/>
    <circle cx="520" cy="260" r="140" fill="${theme.c}" opacity="0.28"/>
    <text x="96" y="200" font-family="Arial, Helvetica, sans-serif" font-size="96">${icon}</text>
  </svg>`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Mock detail (API stabil olunca /books/{id} ile güncellenir)
const MOCK_DETAIL: Record<string, Product> = {
  "1": { id: "1", name: "Kablosuz Kulaklık", description: "Gürültü engelleme, yüksek kalite ses ve uzun pil ömrü.", price: 2499 },
  "2": { id: "2", name: "Akıllı Saat", description: "Sağlık takibi, bildirimler ve spor modları.", price: 3199 },
  "3": { id: "3", name: "Mekanik Klavye", description: "Konforlu yazım, dayanıklı switch yapısı ve kompakt tasarım.", price: 1899 },
  "4": { id: "4", name: "Oyuncu Mouse", description: "Yüksek hassasiyet sensör, ergonomik gövde.", price: 999 },
  "5": { id: "5", name: "4K Monitör", description: "Keskin görüntü, geniş ekran çalışma alanı.", price: 7999 },
};

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const id = params.id;

  useEffect(() => {
    if (!getToken()) router.replace("/auth");
  }, [router]);

  const product = useMemo(() => {
    return (
      MOCK_DETAIL[id] ?? {
        id,
        name: "Ürün",
        description: "Ürün detayı yakında eklenecektir.",
      }
    );
  }, [id]);

  const [fav, setFav] = useState(false);

  useEffect(() => {
    setFav(isFavorite(product.id));
  }, [product.id]);

  const hero = useMemo(() => {
    const icon = iconForName(product.name);
    const theme = themeForName(product.name);
    return cleanHeroSvgDataUri(icon, theme);
  }, [product.name]);

  function onToggleFavorite() {
    const item: FavoriteItem = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
    };

    if (fav) {
      removeFavorite(product.id);
      setFav(false);
    } else {
      addFavorite(item);
      setFav(true);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/products"
          className="rounded-lg border bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
        >
          ← Ürünlere dön
        </Link>

        <Link
          href="/favorites"
          className="rounded-lg border bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
        >
          Favoriler
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={hero} alt={product.name} className="h-full w-full object-cover" />
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">{product.name}</h1>

          {product.description && (
            <p className="mt-2 text-sm text-gray-600">{product.description}</p>
          )}

          {typeof product.price === "number" && (
            <p className="mt-4 text-xl font-semibold">{formatTRY(product.price)}</p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onToggleFavorite}
              className={`rounded-lg px-4 py-2 text-sm text-white ${
                fav ? "bg-gray-700 hover:bg-gray-800" : "bg-black hover:bg-gray-900"
              }`}
            >
              {fav ? "Favorilerden Çıkar" : "Favoriye Ekle"}
            </button>

            <Link
              href="/favorites"
              className="rounded-lg border bg-white px-4 py-2 text-sm shadow-sm hover:bg-gray-50"
            >
              Favorileri Gör
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
