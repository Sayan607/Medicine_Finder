import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata = {
  title: "MedMind – From prescription to price, we've got you covered",
  description: "Scan your prescription, get medicine details, timings, and compare prices across Indian brands instantly.",
  openGraph: {
    title: "MedFind – From prescription to price, we've got you covered",
    description: "Scan your prescription, get medicine details, timings, and compare prices across Indian brands instantly.",
  },
};

export const viewport: Viewport = {
  themeColor: "#14b8a6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
