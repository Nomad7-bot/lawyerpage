interface PracticeAreaDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PracticeAreaDetailPage({
  params,
}: PracticeAreaDetailPageProps) {
  const { slug } = await params;

  return (
    <main className="container-content py-16 sm:py-24">
      <h1 className="text-h1 font-bold text-primary">업무분야 상세</h1>
      <p className="mt-2 text-caption text-text-sub">slug: {slug}</p>
      <p className="mt-4 text-body text-text-sub">
        개별 업무분야 상세 페이지입니다. 준비 중입니다.
      </p>
    </main>
  );
}
