import { notFound } from "next/navigation";
import { FinanceScreen, type Screen } from "@/components/finance-screen";

const sections = ["transactions", "budgets", "insights", "import", "settings"];
export const generateStaticParams = () => sections.map((section) => ({ section }));
const SectionPage = async ({ params }: { params: Promise<{ section: string }> }) => {
  const { section } = await params;
  if (!sections.includes(section)) notFound();
  return <FinanceScreen section={section as Screen} />;
};
export default SectionPage;
