import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/layout/TopBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import CookieConsent from "@/components/ui/CookieConsent";
import AccessibilityMenu from "@/components/accessibility/AccessibilityMenu";
import SplashScreen from "@/components/ui/SplashScreen";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "YAZE PROJE | Mimarlık, Gayrimenkul & Yazılım - Gölbaşı, Ankara",
  description:
    "YAZE PROJE MİMARLIK MÜHENDİSLİK - Gölbaşı, Ankara merkezli mimarlık, yapı, gayrimenkul ve yazılım çözümleri. Modern tasarım, sürdürülebilir yapılar ve yenilikçi teknoloji.",
  keywords: [
    "mimarlık",
    "gayrimenkul",
    "yapı",
    "inşaat",
    "Gölbaşı",
    "Ankara",
    "YAZE PROJE",
    "mühendislik",
    "yazılım",
    "proje",
  ],
  authors: [{ name: "YAZE PROJE MİMARLIK MÜHENDİSLİK" }],
  creator: "YAZE PROJE",
  publisher: "YAZE PROJE MİMARLIK MÜHENDİSLİK",
  formatDetection: {
    telephone: true,
    email: true,
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://yazeproje.com",
    siteName: "YAZE PROJE",
    title: "YAZE PROJE | Mimarlık, Gayrimenkul & Yazılım - Gölbaşı, Ankara",
    description:
      "Gölbaşı, Ankara merkezli mimarlık, yapı, gayrimenkul ve yazılım çözümleri.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "YAZE PROJE - Mimarlık, Gayrimenkul & Yazılım",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YAZE PROJE | Mimarlık, Gayrimenkul & Yazılım",
    description:
      "Gölbaşı, Ankara merkezli mimarlık, yapı, gayrimenkul ve yazılım çözümleri.",
    images: ["/images/og-image.jpg"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
};

import { getSiteSettings } from "@/lib/api";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let settings: Record<string, any> = {};
  try {
    settings = await getSiteSettings();
  } catch (error) {
    console.error("Failed to load layout settings in RootLayout:", error);
  }

  return (
    <html lang="tr" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-inter antialiased">
        <SplashScreen />
        <TopBar settings={settings} />
        <Header settings={settings} />
        <main className="min-h-screen">{children}</main>
        <Footer settings={settings} />
        <MobileBottomNav />
        <WhatsAppButton />
        <CookieConsent />
        <AccessibilityMenu />
      </body>
    </html>
  );
}
