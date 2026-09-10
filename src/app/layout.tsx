import type { Metadata } from "next";
import { Playfair_Display, Manrope } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartProvider";
import CartDrawer from "@/components/CartDrawer";
import CartToast from "@/components/CartToast";
import ScrollProgress from "@/components/ScrollProgress";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NY Bakes and Bloom — Cakes & Flowers, delivered the day they're made",
    template: "%s · NY Bakes and Bloom",
  },
  description:
    "Hand-iced cakes and morning-cut flowers delivered same-day across 12 Indian cities. Midnight delivery, eggless options, and combos that arrive in one slot.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen">
        <CartProvider>
          <ScrollProgress />
          <Header />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
          <CartToast />
        </CartProvider>
      </body>
    </html>
  );
}
