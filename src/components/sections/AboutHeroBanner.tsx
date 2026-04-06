import { Breadcrumb } from "@/components/ui/Breadcrumb";

const breadcrumbItems = [
  { label: "홈", href: "/" },
  { label: "사무소 소개" },
];

export function AboutHeroBanner() {
  return (
    <section className="bg-primary flex flex-col justify-center min-h-[320px]">
      <div className="container-content py-12">
        <Breadcrumb
          items={breadcrumbItems}
          variant="dark"
        />
        <h1 className="mt-6 text-h1 font-bold text-bg-white">사무소 소개</h1>
        <p className="mt-3 text-body text-bg-white/70">
          신뢰와 전문성으로 30년, 의뢰인의 권리를 지켜온 법률사무소입니다.
        </p>
      </div>
    </section>
  );
}
