import { CartProvider } from "@/components/CartProvider";
import { StoreProvider } from "@/components/StoreProvider";
import CartDrawer from "@/components/CartDrawer";
import CartToast from "@/components/CartToast";
import ScrollProgress from "@/components/ScrollProgress";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getStore } from "@/server/queries";

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
