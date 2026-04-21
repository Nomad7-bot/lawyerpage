import { PageHeader } from "@/components/layout/PageHeader";

const breadcrumbItems = [
  { label: "홈", href: "/" },
  { label: "사무소 소개" },
];

export function AboutHeroBanner() {
  return (
    <PageHeader
      breadcrumbItems={breadcrumbItems}
      title="사무소 소개"
      subtitle="신뢰와 전문성으로 30년, 의뢰인의 권리를 지켜온 법률사무소입니다."
    />
  );
}
