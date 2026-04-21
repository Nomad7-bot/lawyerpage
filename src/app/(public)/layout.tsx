import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getResolvedSiteInfo } from "@/lib/site-info";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = await getResolvedSiteInfo();

  return (
    <>
      <Header />
      <div className="flex-1 flex flex-col">{children}</div>
      <Footer site={site} />
    </>
  );
}
