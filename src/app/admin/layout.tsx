import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin · NY Bakes and Bloom", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#F4F6F4]">{children}</div>;
}
