import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
