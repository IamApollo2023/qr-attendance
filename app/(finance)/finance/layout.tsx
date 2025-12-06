import FinanceLayout from "@/components/FinanceLayout";

export default function FinanceSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FinanceLayout>{children}</FinanceLayout>;
}
