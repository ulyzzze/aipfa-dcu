import { notFound } from "next/navigation";
import { navigation } from "@/lib/navigation";

export const generateStaticParams = () => [
  ...navigation.filter(({ href }) => href !== "/").map(({ href }) => ({ section: href.slice(1) })),
  { section: "settings" },
];

const SectionPage = async ({ params }: { params: Promise<{ section: string }> }) => {
  const { section } = await params;
  const label = section === "settings" ? "Settings" : navigation.find(({ href }) => href === `/${section}`)?.label;
  if (!label) notFound();
  return <h1 className="text-3xl font-semibold tracking-tight">{label}</h1>;
};

export default SectionPage;
