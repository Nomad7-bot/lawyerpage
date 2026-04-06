import { SectionTitle } from "@/components/ui/SectionTitle";

type HistoryItem = {
  year: string;
  title: string;
  desc: string;
};

const HISTORY: HistoryItem[] = [
  {
    year: "1994",
    title: "사무소 창립",
    desc: "서초구 소재 법률사무소 개소. 민사·형사 분야를 중심으로 전문 법률 서비스를 시작했습니다.",
  },
  {
    year: "2003",
    title: "전문 분야 확장",
    desc: "기업법·부동산·가사 분야로 서비스 영역을 확대하며 종합 법률사무소로 도약했습니다.",
  },
  {
    year: "2010",
    title: "서초동 사옥 이전",
    desc: "법조 타운으로 확장 이전하며 변호사 10명 체계를 구축하고 서비스 역량을 강화했습니다.",
  },
  {
    year: "2018",
    title: "우수 법률사무소 선정",
    desc: "대한변호사협회로부터 우수 법률사무소로 선정되며 전문성과 신뢰도를 공식 인정받았습니다.",
  },
  {
    year: "2024",
    title: "디지털 분야 신설",
    desc: "AI·디지털 자산·개인정보 전문 팀을 신설하며 미래 법률 수요에 선제적으로 대응합니다.",
  },
];

type CardProps = {
  item: HistoryItem;
  align?: "left" | "right";
};

function TimelineCard({ item, align = "left" }: CardProps) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <span className="inline-block text-caption font-semibold text-accent tracking-widest">
        {item.year}
      </span>
      <h3 className="mt-1 text-h4 font-semibold text-primary">{item.title}</h3>
      <p className="mt-2 text-body text-text-sub">{item.desc}</p>
    </div>
  );
}

export function AboutHistoryTimeline() {
  return (
    <section className="py-16 md:py-22 bg-bg-white">
      <div className="container-content">
        <SectionTitle
          title="연혁"
          subtitle="법률사무소가 걸어온 30년의 발자취"
          align="center"
          className="mb-16"
        />

        <div className="relative">
          {/* 세로선: 모바일 좌측 / 데스크톱 중앙 */}
          <div
            className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-accent/30 md:-translate-x-1/2"
            aria-hidden
          />

          {HISTORY.map((item, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div key={item.year} className="relative py-10">
                {/* 도트 */}
                <div
                  className="absolute left-4 md:left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-accent z-10 ring-4 ring-bg-white"
                  aria-hidden
                />

                {/* 모바일 레이아웃 */}
                <div className="md:hidden pl-12">
                  <TimelineCard item={item} />
                </div>

                {/* 데스크톱 레이아웃: 좌우 교차 */}
                <div className="hidden md:grid md:grid-cols-2">
                  {isEven ? (
                    <>
                      <div className="pr-12">
                        <TimelineCard item={item} align="right" />
                      </div>
                      <div />
                    </>
                  ) : (
                    <>
                      <div />
                      <div className="pl-12">
                        <TimelineCard item={item} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
