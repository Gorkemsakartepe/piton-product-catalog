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

type FavoritesState = {
  ids: string[];
  active: boolean;
};

function normalizeFavIds(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (v && typeof v === "object" && "ids" in v) {
    const ids = (v as any).ids;
    return Array.isArray(ids) ? ids.map(String) : [];
  }
  return [];
}

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

function getTokenFromStorage() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("token") || localStorage.getItem("token");
}

function normalizeApiBooksToProducts(raw: any): Product[] {
  const arr = Array.isArray(raw) ? raw : [];
  return arr.map((b: any, i: number) => {
    const name = String(b?.name ?? b?.title ?? `Ürün ${i + 1}`);
    return {
      id: String(b?.id ?? i + 1),
      name,
      description: b?.description ?? "",
      price: typeof b?.price === "number" ? b.price : undefined,
      category: b?.category ?? "",
      image: imageForName(name),
    };
  });
}

function attachImages(items: Product[]) {
  return items.map((p) => ({
    ...p,
    image: p.image ?? imageForName(p.name),
  }));
}

export default function ProductsPage() {
  const { authed, mounted } = useAuthGuard();
  const router = useRouter();

  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [userFacingError, setUserFacingError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tümü");
  const [sort, setSort] = useState<"Öne çıkan" | "Fiyat (Artan)" | "Fiyat (Azalan)">(
    "Öne çıkan"
  );

  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [toast, setToast] = useState<{ msg: string; show: boolean }>({
    msg: "",
    show: false,
  });

  useEffect(() => {
    if (!mounted || !authed) return;
    const fav = loadFavorites() as unknown;
    setFavoriteIds(normalizeFavIds(fav));
  }, [mounted, authed]);

  useEffect(() => {
    if (!mounted || !authed) return;

    async function run() {
      try {
        setLoading(true);
        setUserFacingError(null);

        const token = getTokenFromStorage();
        if (!token) {
          setItems(attachImages(MOCK_PRODUCTS));
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

        if (!apiItems.length) {
          setItems(attachImages(MOCK_PRODUCTS));
          return;
        }

        setItems(attachImages(apiItems));
      } catch {
        setItems(attachImages(MOCK_PRODUCTS));
        setUserFacingError("Ürünler şu anda yüklenemedi. Mock veriler gösteriliyor.");
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [mounted, authed, router]);

  useEffect(() => {
    if (!toast.show) return;
    const t = setTimeout(() => setToast({ msg: "", show: false }), 1400);
    return () => clearTimeout(t);
  }, [toast.show]);

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
          (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER)
      );
    } else if (sort === "Fiyat (Azalan)") {
      list.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    }

    return list;
  }, [items, query, category, sort]);

  const favSet = useMemo(() => new Set(favoriteIds.map(String)), [favoriteIds]);

  function onToggleFavorite(productId: string) {
    const result = toggleFavorite(productId) as unknown;
    const nextIds = normalizeFavIds(result);

    setFavoriteIds(nextIds);

    const isNowFav = nextIds.includes(String(productId));
    setToast({
      msg: isNowFav ? "Favorilere eklendi" : "Favorilerden çıkarıldı",
      show: true,
    });
  }

  if (!mounted || authed === null) return null;
  if (!authed) return null;

  return (
    <main className="w-full">
      <div
        className={[
          "pointer-events-none fixed left-1/2 top-5 z-[60] -translate-x-1/2",
          "transition-all duration-200",
          toast.show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
        ].join(" ")}
      >
        <div className="rounded-2xl border bg-white/90 px-4 py-2 text-sm shadow-sm backdrop-blur">
          {toast.msg}
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Ürünler</h1>
          <p className="text-sm text-gray-600">
            Kataloğu inceleyebilir, ürün detaylarına geçebilir ve favorilerine ekleyebilirsin.
          </p>
        </div>

        <div className="mt-5 rounded-3xl border bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Arama</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-2xl border px-3 py-2 text-sm outline-none focus:border-black"
                placeholder="Ürün ara..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-2xl border px-3 py-2 text-sm outline-none focus:border-black"
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
                className="w-full rounded-2xl border px-3 py-2 text-sm outline-none focus:border-black"
              >
                <option>Öne çıkan</option>
                <option>Fiyat (Artan)</option>
                <option>Fiyat (Azalan)</option>
              </select>
            </div>
          </div>
        </div>

        {loading && <p className="mt-6 text-sm text-gray-600">Yükleniyor...</p>}

        {userFacingError && (
          <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            {userFacingError}
          </p>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const isFav = favSet.has(String(p.id));

            return (
              <div
                key={p.id}
                className="group relative rounded-3xl border bg-white p-4 shadow-sm transition hover:shadow"
              >
                <button
                  type="button"
                  onClick={() => onToggleFavorite(p.id)}
                  className="absolute right-3 top-3 z-10 rounded-2xl border bg-white/90 px-2.5 py-2 text-sm shadow-sm backdrop-blur transition hover:bg-white"
                  aria-label={isFav ? "Favorilerden çıkar" : "Favorilere ekle"}
                >
                  <span className={isFav ? "inline-block scale-110 transition-transform" : "inline-block transition-transform"}>
                    {isFav ? "♥" : "♡"}
                  </span>
                </button>

                <Link href={`/products/${p.id}`} className="block">
                  <div className="overflow-hidden rounded-2xl border bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image || imageForName(p.name)}
                      alt={p.name}
                      className="h-[190px] w-full object-contain p-6 transition group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                  </div>

                  <div className="mt-4">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-base font-semibold tracking-tight">{p.name}</h2>

                      {!!formatTRY(p.price) && (
                        <span className="whitespace-nowrap rounded-xl border bg-white px-2 py-1 text-sm">
                          {formatTRY(p.price)}
                        </span>
                      )}
                    </div>

                    {p.category && <p className="mt-2 text-xs text-gray-500">{p.category}</p>}

                    {p.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-gray-600">{p.description}</p>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
