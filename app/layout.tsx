import type { Metadata } from "next";
import "./globals.css";
import Providers from "./_components/Providers";
import Navbar from "./_components/Navbar";

export const metadata: Metadata = {
  title: "Noventa | Product Catalog",
  description: "Noventa ürün kataloğu uygulaması",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900">
        <Providers>
          <Navbar />
          <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
