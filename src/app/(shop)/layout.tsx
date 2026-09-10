import { CartProvider } from "@/components/CartProvider";
import { StoreProvider } from "@/components/StoreProvider";
import CartDrawer from "@/components/CartDrawer";
import CartToast from "@/components/CartToast";
import ScrollProgress from "@/components/ScrollProgress";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getStore } from "@/server/queries";

/**
 * The catalogue and every line of copy are edited live in the admin, so these
 * pages are rendered per request rather than baked at build time. That also
 * keeps `next build` from needing a database — a deploy should not depend on
 * Mongo being reachable from the build machine.
 */
export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const store = await getStore();

  return (
    <StoreProvider value={store}>
      <CartProvider>
        <ScrollProgress />
        <Header />
        <main>{children}</main>
        <Footer />
        <CartDrawer />
        <CartToast />
      </CartProvider>
    </StoreProvider>
  );
}
