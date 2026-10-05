import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZX PRESET FINDER",
  description: "Alight Motion Preset & XML Stream Utility",
  applicationName: "ZX PRESET FINDER",
  keywords: [
    "Alight Motion",
    "preset",
    "TikTok",
    "AM preset",
    "XML preset",
    "ZX"
  ]
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#07080a"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
