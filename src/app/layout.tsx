import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://pawmemo.vercel.app"),
  title: "PawMemo - A private memory journal for your pet",
  description: "Capture little pet moments, organize memories, and turn notes into gentle weekly letters and vet-ready summaries.",
  openGraph: {
    title: "PawMemo - A private memory journal for your pet",
    description: "Capture little pet moments, organize memories, and turn notes into gentle weekly letters and vet-ready summaries.",
    siteName: "PawMemo",
    url: "https://pawmemo.vercel.app",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
