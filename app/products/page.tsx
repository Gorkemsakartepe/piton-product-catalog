"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthGuard } from "@/lib/auth/useAuthGuard";
import { loadFavorites, toggleFavorite } from "@/lib/favorites";

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
    image: "/images/kulaklik.png",
  },
  {
    id: "2",
    name: "Akıllı Saat",
    description: "Sağlık takibi, bildirimler ve spor modları.",
    price: 3199,
    category: "Giyilebilir",
    image: "/images/saat.png",
  },
  {
    id: "3",
    name: "Mekanik Klavye",
    description: "Konforlu yazım, dayanıklı switch yapısı ve kompakt tasarım.",
    price: 1899,
    category: "Aksesuar",
    image: "/images/klavye.png",
  },
  {
    id: "4",
    name: "Oyuncu Mouse",
    description: "Yüksek hassasiyet sensör, ergonomik gövde.",
    price: 999,
    category: "Aksesuar",
    image: "/images/mouse.png",
  },
  {
    id: "5",
    name: "4K Monitör",
    description: "Keskin görüntü, geniş ekran çalışma alanı.",
    price: 7999,
    category: "Elektronik",
    image: "/images/monitor.webp",
  },
];

function formatTRY(price?: number) {
  if (typeof price !== "number") return "";
  return price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

function normalizeApiBooksToProducts(raw: any): Product[] {
  const arr = Array.isArray(raw) ? raw : [];
  return arr.map((b: any, i: number) => {
    const name = String(b?.name ?? b?.title ?? `Ürün ${i + 1}`);

    const n = name.toLowerCase();
    const mappedImage =
      n.includes("kulak") ? "/images/kulaklik.png" :
      n.includes("saat") ? "/images/saat.png" :
      n.includes("klavye") ? "/images/klavye.png" :
      n.includes("mouse") ? "/images/mouse.png" :
      n.includes("monit") ? "/images/monitor.webp" :
      undefined;

    return {
      id: String(b?.id ?? i + 1),
      name,
      description: b?.description ?? "",
      price: typeof b?.price === "number" ? b.price : undefined,
      category: b?.category ?? "",
      image: mappedImage,
    };
  });
}

export default function ProductsPage() {
  const router = useRouter();
  const { authed, mounted } = useAuthGuard();

  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [userFacingError, setUserFacingError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tümü");
  const [sort, setSort] = useState<"Öne çıkan" | "Fiyat (Artan)" | "Fiyat (Azalan)">(
    "Öne çıkan"
  );

  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setFavoriteIds(loadFavorites());
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1100);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    async function run() {
      try {
        setLoading(true);
        setUserFacingError(null);

        const token =
          typeof window !== "undefined"
            ? sessionStorage.getItem("token") || localStorage.getItem("token")
            : null;

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

        if (!res.ok) {
          if (res.status === 401) {
            router.replace("/auth");
            return;
          }
          throw new Error("Ürün verisi alınamadı.");
        }

        const data = json?.data ?? json;
        const apiItems = normalizeApiBooksToProducts(data);

        setItems(apiItems.length ? apiItems : MOCK_PRODUCTS);
      } catch {
        setItems(MOCK_PRODUCTS);
        setUserFacingError("Ürünler şu anda yüklenemedi. Mock veriler gösteriliyor.");
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [router]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    ["Elektronik", "Giyilebilir", "Aksesuar"].forEach((c) => set.add(c));
    return ["Tümü", ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = items.slice();

    if (category !== "Tümü") {
      list = list.filter(
        (p) => (p.category ?? "").toLowerCase() === category.toLowerCase()
      );
    }

    if (q) {
      list = list.filter((p) => {
        const hay = `${p.name} ${p.description ?? ""} ${p.category ?? ""}`.toLowerCase();
        return hay.includes(q);
      });
    }

    if (sort === "Fiyat (Artan)") {
      list.sort(
        (a, b) =>
          (a.price ?? Number.MAX_SAFE_INTEGER) -
          (b.price ?? Number.MAX_SAFE_INTEGER)
      );
    } else if (sort === "Fiyat (Azalan)") {
      list.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    }

    return list;
  }, [items, query, category, sort]);

  function onToggleFav(id: string) {
    const result = toggleFavorite(id);
    setFavoriteIds(result.ids);
    setToast(result.active ? "Favorilere eklendi" : "Favorilerden çıkarıldı");
  }

  if (!mounted || authed === null) return null;
  if (!authed) return null;

  return (
    <main className="mx-auto max-w-6xl px-4 pt-0 pb-8">
      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-2xl border bg-white px-4 py-2 text-sm shadow-sm">
          {toast}
        </div>
      )}

      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Ürünler</h1>
          <p className="mt-1 text-sm text-gray-600">
            Kataloğu inceleyebilir, ürün detaylarına geçebilir ve favorilerine ekleyebilirsin.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border bg-white p-3.5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Arama</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-black"
              placeholder="Ürün ara..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-black"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Sıralama</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-black"
            >
              <option>Öne çıkan</option>
              <option>Fiyat (Artan)</option>
              <option>Fiyat (Azalan)</option>
            </select>
          </div>
        </div>
      </div>

      {loading && <p className="mt-5 text-sm text-gray-600">Yükleniyor...</p>}

      {userFacingError && (
        <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {userFacingError}
        </p>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => {
          const isFav = favoriteIds.includes(String(p.id));

          return (
            <div
              key={p.id}
              className="group relative rounded-3xl border bg-white p-4 shadow-sm transition hover:shadow"
            >
              <button
                type="button"
                onClick={() => onToggleFav(String(p.id))}
                className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border bg-white/90 shadow-sm backdrop-blur transition hover:bg-gray-50"
                aria-label={isFav ? "Favorilerden çıkar" : "Favorilere ekle"}
              >
                <span
                  className={[
                    "text-[20px] leading-none",
                    isFav ? "text-gray-900" : "text-gray-500",
                  ].join(" ")}
                >
                  {isFav ? "♥" : "♡"}
                </span>
              </button>

              <Link href={`/products/${p.id}`} className="block">
                <div className="overflow-hidden rounded-2xl border bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image || "/images/klavye.png"}
                    alt={p.name}
                    className="h-[185px] w-full object-contain p-5 transition group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                </div>

                <div className="mt-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-base font-semibold tracking-tight">{p.name}</h2>

                    {!!formatTRY(p.price) && (
                      <span className="whitespace-nowrap rounded-xl border bg-white px-2 py-1 text-sm">
                        {formatTRY(p.price)}
                      </span>
                    )}
                  </div>

                  {p.category && <p className="mt-1.5 text-xs text-gray-500">{p.category}</p>}

                  {p.description && (
                    <p className="mt-1.5 line-clamp-2 text-sm text-gray-600">{p.description}</p>
                  )}
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </main>
  );
}
