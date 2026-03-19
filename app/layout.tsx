import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MedMind – From prescription to price, we've got you covered",
  description: "Scan your prescription, get medicine details, timings, and compare prices across Indian brands instantly.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MedMind",
  },
  openGraph: {
    title: "MedMind – From prescription to price, we've got you covered",
    description: "Scan your prescription, get medicine details, timings, and compare prices across Indian brands instantly.",
    url: "https://www.medmind.in",
    siteName: "MedMind",
    type: "website",
  },
  metadataBase: new URL("https://www.medmind.in"),
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
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
        <link rel="apple-touch-icon" href="/medmind-logo.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/medmind-logo.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/medmind-logo.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MedMind" />
      </head>
      <body>{children}</body>
    </html>
  );
}
