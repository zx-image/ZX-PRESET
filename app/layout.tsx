import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "XIYU FIND PRESET",
  description: "Find Alight Motion presets from TikTok.",
  applicationName: "XIYU FIND PRESET",
  keywords: [
    "Alight Motion",
    "preset",
    "TikTok",
    "AM preset",
    "XIYU"
  ]
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f8f6ff"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
