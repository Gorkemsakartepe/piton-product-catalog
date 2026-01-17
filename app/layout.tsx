import "./globals.css";
import Providers from "./_components/Providers";

export const metadata = {
  title: "PTN Product Catalog",
  description: "Frontend Developer Case Study",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
