type StatItem = {
  value: string;
  label: string;
};

const STATS: StatItem[] = [
  { value: "30+", label: "년 업력" },
  { value: "5,000+", label: "누적 상담" },
  { value: "98%", label: "의뢰인 만족도" },
  { value: "5명", label: "전문 변호사" },
];

export function AboutStatsSection() {
  return (
    <section className="bg-bg-light py-16 md:py-22">
      <div className="container-content grid grid-cols-2 md:grid-cols-4 gap-8">
        {STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center text-center py-6">
            <span className="text-h1 font-bold text-accent leading-none">
              {stat.value}
            </span>
            <span className="mt-3 text-body font-semibold text-primary">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
