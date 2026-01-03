import { Inter } from "next/font/google";
import AdminLayout from "@/components/AdminLayout";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export default function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.variable} font-inter`}>
      <AdminLayout>{children}</AdminLayout>
    </div>
  );
}


