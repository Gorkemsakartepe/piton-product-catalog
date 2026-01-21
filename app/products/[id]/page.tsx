"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuthGuard } from "@/lib/auth/useAuthGuard";
import { getToken } from "@/lib/auth/token";
import { isFavorite, toggleFavorite } from "@/lib/favorites";

type Product = {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  image?: string;
};

const MOCK_PRODUCTS: Product[] = [
  { id: "1", name: "Kablosuz Kulaklık", description: "Gürültü engelleme, yüksek kalite ses ve uzun pil ömrü.", price: 2499, category: "Elektronik" },
  { id: "2", name: "Akıllı Saat", description: "Sağlık takibi, bildirimler ve spor modları.", price: 3199, category: "Giyilebilir" },
  { id: "3", name: "Mekanik Klavye", description: "Konforlu yazım, dayanıklı switch yapısı ve kompakt tasarım.", price: 1899, category: "Aksesuar" },
  { id: "4", name: "Oyuncu Mouse", description: "Yüksek hassasiyet sensör, ergonomik gövde.", price: 999, category: "Aksesuar" },
  { id: "5", name: "4K Monitör", description: "Keskin görüntü, geniş ekran çalışma alanı.", price: 7999, category: "Elektronik" },
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

function detailsForName(name: string) {
  const n = name.toLowerCase();

  if (n.includes("kulak")) {
    return [
      ["Sürücü", "40mm dinamik sürücü"],
      ["Bağlantı", "Bluetooth 5.3"],
      ["Pil", "30 saate kadar kullanım"],
      ["Gürültü Engelleme", "Aktif (ANC)"],
    ];
  }
  if (n.includes("saat")) {
    return [
      ["Ekran", "AMOLED yüksek parlaklık"],
      ["Sensörler", "Kalp ritmi, SpO₂, uyku"],
      ["Dayanıklılık", "Suya dayanıklı"],
      ["Bildirim", "Çağrı & uygulama bildirimleri"],
    ];
  }
  if (n.includes("klavye")) {
    return [
      ["Switch", "Mekanik (dayanıklı)"],
      ["Bağlantı", "Kablolu / düşük gecikme"],
      ["Tuş Dizilimi", "Kompakt düzen"],
      ["Gövde", "Sağlam kasa yapısı"],
    ];
  }
  if (n.includes("mouse")) {
    return [
      ["Sensör", "Yüksek hassasiyet (ayarlanabilir DPI)"],
      ["Tuş", "Programlanabilir tuşlar"],
      ["Kavrama", "Ergonomik yan yüzey"],
      ["Kablo", "Dayanıklı örgü kablo"],
    ];
  }
  if (n.includes("monit")) {
    return [
      ["Çözünürlük", "4K UHD"],
      ["Panel", "Keskin görüntü, geniş açı"],
      ["Bağlantı", "HDMI / DisplayPort"],
      ["Kullanım", "Çalışma ve multimedya"],
    ];
  }
  return [];
}

export default function ProductDetailPage() {
  const { authed, mounted } = useAuthGuard();
  const params = useParams<{ id: string }>();
  const id = String(params?.id ?? "");

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [fav, setFav] = useState(false);

  useEffect(() => {
    if (!mounted || !authed) return;
    setFav(isFavorite(id));
  }, [mounted, authed, id]);

  useEffect(() => {
    async function run() {
      if (!mounted || !authed) return;

      try {
        setLoading(true);

        const fromMock = MOCK_PRODUCTS.find((p) => p.id === id);
        if (fromMock) {
          setProduct({ ...fromMock, image: imageForName(fromMock.name) });
          return;
        }

        const token = getToken();
        if (!token) {
          setProduct(null);
          return;
        }

        const res = await fetch("https://store-api-dev.piton.com.tr/api/v1/books", {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });

        const text = await res.text();
        const json = text ? JSON.parse(text) : null;
        const data = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];

        const found = data.find((b: any) => String(b?.id) === id);
        if (!found) {
          setProduct(null);
          return;
        }

        const name = String(found?.name ?? found?.title ?? "Ürün");
        setProduct({
          id: String(found?.id ?? id),
          name,
          description: found?.description ?? "",
          price: typeof found?.price === "number" ? found.price : undefined,
          category: found?.category ?? "",
          image: imageForName(name),
        });
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [mounted, authed, id]);

  const rows = useMemo(() => {
    if (!product) return [];
    return detailsForName(product.name);
  }, [product]);

  if (!mounted || authed === null) return null;
  if (!authed) return null;

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 pt-6 pb-10">
        <p className="text-sm text-gray-600">Yükleniyor...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="mx-auto max-w-6xl px-4 pt-6 pb-10">
        <p className="text-sm text-gray-700">Ürün bulunamadı.</p>
        <Link
          href="/products"
          className="mt-4 inline-flex rounded-xl border bg-white px-4 py-2 text-sm shadow-sm hover:bg-gray-50"
        >
          Ürünlere dön
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pt-6 pb-10">
      <div className="mb-5">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm shadow-sm hover:bg-gray-50"
        >
          ← Ürünler
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border bg-white p-5 shadow-sm">
          <div className="overflow-hidden rounded-2xl border bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image || imageForName(product.name)}
              alt={product.name}
              className="h-[420px] w-full object-contain p-10"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {product.category ? (
              <span className="rounded-full border bg-white px-3 py-1 text-xs text-gray-700">
                {product.category}
              </span>
            ) : null}

            {!!formatTRY(product.price) && (
              <span className="rounded-full border bg-white px-3 py-1 text-xs text-gray-700">
                {formatTRY(product.price)}
              </span>
            )}

            <span className="rounded-full border bg-white px-3 py-1 text-xs text-gray-700">
              Ürün Kodu: #{product.id}
            </span>
          </div>
        </section>

        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
          {product.description ? (
            <p className="mt-2 text-sm text-gray-700">{product.description}</p>
          ) : null}

          {rows.length ? (
            <div className="mt-5 rounded-2xl border bg-gray-50 p-4">
              <p className="text-sm font-semibold">Teknik Detaylar</p>
              <div className="mt-3 grid gap-2">
                {rows.map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between rounded-xl border bg-white px-4 py-3 text-sm">
                    <span className="text-gray-600">{k}</span>
                    <span className="font-medium text-gray-900">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => {
              const r = toggleFavorite(product.id);
              setFav(r.active);
            }}
            className={[
              "mt-6 w-full rounded-2xl border px-4 py-3 text-sm font-medium shadow-sm transition",
              "bg-white hover:bg-gray-50",
              "text-gray-900",
            ].join(" ")}
          >
            {fav ? "Favoriden Çıkar" : "Favoriye Ekle"}
          </button>
        </section>
      </div>
    </main>
  );
}
