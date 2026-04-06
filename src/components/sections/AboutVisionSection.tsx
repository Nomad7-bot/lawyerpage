export function AboutVisionSection() {
  return (
    <section className="py-16 md:py-22 bg-bg-white">
      <div className="container-content grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
        {/* 왼쪽: Pull Quote */}
        <div className="border-l-4 border-accent pl-6">
          <p className="text-h2 font-bold text-primary leading-snug">
            정의로운 법률 서비스로 모든 사람의 권리를 보호합니다
          </p>
        </div>

        {/* 오른쪽: 소개 텍스트 */}
        <div className="space-y-4">
          <h2 className="text-h3 font-semibold text-primary">
            의뢰인과 함께 걸어온 30년의 여정
          </h2>
          <p className="text-body text-text-main">
            저희 법률사무소는 1994년 창립 이래 민사·형사·기업법 등 다양한 분야에서
            의뢰인의 권익을 최우선으로 지켜왔습니다. 단순한 법률 서비스를 넘어,
            의뢰인 한 분 한 분의 상황을 깊이 이해하고 최선의 해결책을 함께
            모색하는 것이 저희의 사명입니다.
          </p>
          <p className="text-body text-text-main">
            탁월한 전문성과 풍부한 경험을 바탕으로, 복잡한 법적 문제도 명쾌하고
            신속하게 해결합니다. 5명의 전문 변호사가 각 분야에서 최고의 역량을
            발휘하며 의뢰인 곁에 함께합니다.
          </p>
          <p className="text-body text-text-main">
            법률 문제로 어려움을 겪고 계신다면, 먼저 저희에게 상담하십시오.
            정확한 법률 정보와 현실적인 조언으로 최선의 결과를 이끌어 내겠습니다.
          </p>
        </div>
      </div>
    </section>
  );
}
