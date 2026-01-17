import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold">
          PTN Catalog
        </Link>

        <nav className="flex items-center gap-4 text-sm text-gray-600">
          <Link href="/products" className="hover:text-black">
            Products
          </Link>
          <Link href="/auth" className="hover:text-black">
            Auth
          </Link>
        </nav>
      </div>
    </header>
  );
}
