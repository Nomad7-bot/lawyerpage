-- ============================================================
-- 법률사무소 홈페이지 — 공개 컨텐츠 확장 컬럼 Seed
-- 파일: supabase/migrations/005_seed_extended_fields.sql
-- 생성일: 2026-04-16
-- 설명: 마이그레이션 004 에서 추가한 신규 컬럼들
--       (practice_areas.key_services / related_cases,
--        attorneys.intro / practice_area_cards,
--        posts.reading_time / toc,
--        site_settings.postal_code / address_region /
--        address_locality / phone_display)
--       에 초기 값을 채워 공개 페이지가 비어 렌더링되지 않도록 한다.
--
-- 주의: 이 마이그레이션은 이미 존재하는 row 를 UPDATE 한다.
--       001 + 수동 seed 로 기본 데이터(변호사 5, 분야 6, 게시글 10)
--       가 먼저 적재되어 있어야 한다.
-- ============================================================


-- ============================================================
-- 1. practice_areas (slug 기반 매칭)
-- ============================================================

UPDATE practice_areas SET
  key_services = ARRAY['채권·채무 관계 분쟁','손해배상청구 소송','부당이득반환 청구','계약불이행 및 계약 해제','가압류·가처분 신청','집행문 부여 및 강제집행'],
  related_cases = $$[
    {"id":"01","title":"채권자 대위소송을 통한 5억 원 채권 회수","desc":"소멸시효가 임박한 채권을 대위소송 방식으로 보전하여 전액 회수에 성공한 사건입니다.","result":"원고 전부 승소"},
    {"id":"02","title":"공사대금 분쟁 조정 합의","desc":"건설사와 하도급업체 간 공사대금 분쟁에서 조정 절차를 통해 의뢰인에게 유리한 조건으로 합의를 이끌어냈습니다.","result":"청구액 100% 수령 합의"}
  ]$$::jsonb
WHERE slug = 'civil';

UPDATE practice_areas SET
  key_services = ARRAY['경찰·검찰 수사 단계 대응','구속영장실질심사 변호','형사 고소·고발 대리','피해자와의 합의 및 협상','불기소 처분 청구','항소·상고 변호'],
  related_cases = $$[
    {"id":"01","title":"사기 혐의 불기소 처분","desc":"계약 관계에서 비롯된 사기 혐의를 받은 의뢰인을 변호하여 혐의없음 불기소 처분을 이끌어낸 사건입니다.","result":"혐의없음 (불기소)"},
    {"id":"02","title":"폭행 사건 집행유예 선고","desc":"초범이나 상대방의 강한 처벌 의지로 실형 위기에 처한 사건에서 피해자 합의 및 반성 자료를 통해 집행유예를 받아냈습니다.","result":"집행유예 선고"}
  ]$$::jsonb
WHERE slug = 'criminal';

UPDATE practice_areas SET
  key_services = ARRAY['협의이혼·재판이혼 절차','재산분할 협상 및 소송','친권·양육권 지정 소송','양육비·위자료 청구','상속재산 분쟁','후견인 선임 절차'],
  related_cases = $$[
    {"id":"01","title":"5년 별거 후 이혼 소송에서 재산분할 50% 확보","desc":"배우자의 재산 은닉 의혹이 있는 이혼 사건에서 재산명시 신청을 통해 은닉 자산을 추적, 공정한 재산분할을 이끌어냈습니다.","result":"재산분할 50% 인정"},
    {"id":"02","title":"미성년 자녀 친권·양육권 단독 지정","desc":"배우자의 양육 부적합 사유를 체계적으로 증명하여 의뢰인이 미성년 자녀의 단독 친권자 및 양육권자로 지정되었습니다.","result":"단독 친권·양육권 인정"}
  ]$$::jsonb
WHERE slug = 'family';

UPDATE practice_areas SET
  key_services = ARRAY['회사 설립 및 정관 작성','계약서 검토 및 작성','M&A·투자 자문','임원 책임 및 지배구조','공정거래법 대응','기업 분쟁 소송 대리'],
  related_cases = $$[
    {"id":"01","title":"계약서 검토로 100억 원 규모 분쟁 예방","desc":"대규모 납품 계약 체결 전 계약서 검토 과정에서 불공정 조항을 발견, 조항 수정을 통해 잠재적 분쟁을 사전에 차단한 사건입니다.","result":"분쟁 예방 및 계약 조건 개선"},
    {"id":"02","title":"스타트업 M&A 자문을 통한 성공적 투자 유치","desc":"스타트업의 시리즈 B 투자 유치 과정에서 주주간계약, 투자계약서를 검토하고 핵심 조건을 유리하게 협상했습니다.","result":"투자 계약 성공적 체결"}
  ]$$::jsonb
WHERE slug = 'corporate';

UPDATE practice_areas SET
  key_services = ARRAY['부동산 매매계약 검토·자문','임대차 분쟁 (명도·차임)','주택·상가임대차보호법 적용','재건축·재개발 권리 분쟁','등기 말소 소송','경매 절차 대리'],
  related_cases = $$[
    {"id":"01","title":"사기 분양 계약 취소 및 계약금 전액 반환","desc":"허위 과장 광고를 통한 분양 계약에서 취소 사유를 입증하여 계약을 해제하고 계약금을 전액 반환받은 사건입니다.","result":"계약 취소 및 계약금 전액 반환"},
    {"id":"02","title":"상가 임차인 권리금 회수 보호","desc":"임대인의 방해 행위로 권리금을 회수하지 못한 임차인을 대리하여 손해배상 소송에서 전액 인용 판결을 받아냈습니다.","result":"권리금 전액 배상 판결"}
  ]$$::jsonb
WHERE slug = 'real-estate';

UPDATE practice_areas SET
  key_services = ARRAY['부당해고 구제 신청 및 소송','임금·퇴직금 체불 청구','산업재해 인정 및 산재보험 청구','직장 내 괴롭힘·성희롱 대응','근로계약·취업규칙 검토','노동위원회 심판 대리'],
  related_cases = $$[
    {"id":"01","title":"부당해고 구제 신청 복직 판정","desc":"정당한 이유 없이 해고된 의뢰인을 대리하여 노동위원회에서 부당해고 판정을 받아 원직 복직과 임금 상당액을 지급받은 사건입니다.","result":"원직 복직 및 임금 상당액 지급 명령"},
    {"id":"02","title":"산재 불인정 처분 취소 소송 승소","desc":"근로복지공단의 산재 불인정 처분에 불복하여 행정소송을 제기, 업무상 재해임을 입증하여 처분 취소 판결을 받아낸 사건입니다.","result":"불인정 처분 취소 판결"}
  ]$$::jsonb
WHERE slug = 'labor';


-- ============================================================
-- 2. attorneys (slug 기반 매칭)
--    실제 DB 의 변호사 slug 는 kim-jeongui / park-sinroe / lee-gongjung
--    / choi-hyelim / jung-myeongseok 이며, 각자 담당 분야 JOIN 에 따라
--    intro 와 practice_area_cards 를 구성한다.
-- ============================================================

UPDATE attorneys SET
  intro = '의뢰인의 이야기에 귀 기울이고, 최선의 결과를 만들겠습니다.',
  practice_area_cards = $$[
    {"icon_name":"Scale","title":"민사소송","desc":"채권채무, 손해배상, 계약분쟁 등 복잡한 민사 사건을 체계적으로 수행합니다."},
    {"icon_name":"Building2","title":"기업법무","desc":"기업 설립부터 M&A, 계약 분쟁까지 기업 법률 리스크를 종합 관리합니다."},
    {"icon_name":"Home","title":"부동산","desc":"매매·임대차·재건축 분쟁에서 의뢰인의 재산권을 보호합니다."}
  ]$$::jsonb
WHERE slug = 'kim-jeongui';

UPDATE attorneys SET
  intro = '법의 정의로운 실현이 의뢰인에게 새로운 시작이 됩니다.',
  practice_area_cards = $$[
    {"icon_name":"Gavel","title":"형사사건","desc":"수사부터 항소심까지 의뢰인의 방어권 보장을 최우선으로 변호합니다."},
    {"icon_name":"Scale","title":"민사소송","desc":"손해배상, 계약분쟁 등 민사 사건에서 의뢰인의 권리를 수호합니다."}
  ]$$::jsonb
WHERE slug = 'park-sinroe';

UPDATE attorneys SET
  intro = '신중한 분석과 섬세한 접근으로 의뢰인의 권익을 지키겠습니다.',
  practice_area_cards = $$[
    {"icon_name":"Users","title":"가사·이혼","desc":"이혼, 재산분할, 친권·양육권 분쟁을 신중하고 섬세하게 풀어갑니다."},
    {"icon_name":"Scale","title":"민사소송","desc":"손해배상, 계약분쟁 등 민사 사건에서 의뢰인의 권리를 체계적으로 대응합니다."}
  ]$$::jsonb
WHERE slug = 'lee-gongjung';

UPDATE attorneys SET
  intro = '기업과 근로자 모두를 위한 균형 잡힌 법률 서비스를 제공합니다.',
  practice_area_cards = $$[
    {"icon_name":"Building2","title":"기업법무","desc":"기업 설립, 계약 검토, M&A부터 기업 분쟁까지 종합 기업법무를 지원합니다."},
    {"icon_name":"HardHat","title":"노동·산재","desc":"부당해고, 임금 체불, 산업재해 인정까지 근로자의 권리를 지켜냅니다."}
  ]$$::jsonb
WHERE slug = 'choi-hyelim';

UPDATE attorneys SET
  intro = '복잡한 법률 문제도 명확하고 실용적인 해결책을 제시합니다.',
  practice_area_cards = $$[
    {"icon_name":"Home","title":"부동산","desc":"매매·임대차·재건축 등 부동산 거래와 분쟁 전반에 걸쳐 솔루션을 제공합니다."},
    {"icon_name":"Scale","title":"민사소송","desc":"채권채무, 손해배상, 계약분쟁 등 민사 사건을 체계적으로 대응합니다."}
  ]$$::jsonb
WHERE slug = 'jung-myeongseok';


-- ============================================================
-- 3. posts (slug 기반 매칭)
-- ============================================================

UPDATE posts SET reading_time = 5, toc = $$[{"id":"background","title":"판례 변화의 배경"},{"id":"key-changes","title":"3가지 핵심 변경사항"},{"id":"practical-impact","title":"실무적 의의"}]$$::jsonb WHERE slug = 'divorce-property-division-2026';
UPDATE posts SET reading_time = 4, toc = $$[{"id":"renewal-right","title":"계약갱신요구권 강화"},{"id":"premium-protection","title":"권리금 회수 보호"},{"id":"rent-cap","title":"차임 증액 한도"}]$$::jsonb WHERE slug = 'lease-protection-act-guide';
UPDATE posts SET reading_time = 6, toc = $$[{"id":"labor","title":"노무 관리"},{"id":"contract","title":"계약 관리"},{"id":"privacy","title":"개인정보 보호"},{"id":"fair-trade","title":"공정거래·하도급"}]$$::jsonb WHERE slug = 'corporate-compliance-checklist';
UPDATE posts SET reading_time = 5, toc = $$[{"id":"background","title":"상담 배경"},{"id":"legal-issues","title":"법적 쟁점"},{"id":"process","title":"해결 과정"},{"id":"result","title":"결과 및 교훈"}]$$::jsonb WHERE slug = 'unfair-dismissal-case-study';
UPDATE posts SET reading_time = 4, toc = $$[{"id":"situation","title":"임금 체불 상황"},{"id":"response","title":"단계별 대응"},{"id":"outcome","title":"최종 결과"}]$$::jsonb WHERE slug = 'wage-theft-resolution';
UPDATE posts SET reading_time = 5, toc = $$[{"id":"discovery","title":"사기 시도 발견 경위"},{"id":"actions","title":"취한 법적 조치"},{"id":"result","title":"결과"}]$$::jsonb WHERE slug = 'jeonse-fraud-response';
UPDATE posts SET reading_time = 6, toc = $$[{"id":"definition","title":"가압류의 정의"},{"id":"procedure","title":"신청 절차"},{"id":"effect","title":"효력과 해제"}]$$::jsonb WHERE slug = 'provisional-seizure-explained';
UPDATE posts SET reading_time = 7, toc = $$[{"id":"doctrine","title":"법인격 부인론이란"},{"id":"requirements","title":"인정 요건"},{"id":"cases","title":"주요 판례"}]$$::jsonb WHERE slug = 'legal-entity-denial-doctrine';
UPDATE posts SET reading_time = 8, toc = $$[{"id":"divorce-types","title":"협의이혼 vs 재판이혼"},{"id":"property","title":"재산분할 관련"},{"id":"children","title":"자녀 관련"}]$$::jsonb WHERE slug = 'divorce-faq';
UPDATE posts SET reading_time = 5, toc = $$[{"id":"scene","title":"현장 대처"},{"id":"insurance","title":"보험 처리"},{"id":"legal","title":"법적 조치"}]$$::jsonb WHERE slug = 'traffic-accident-first-steps';


-- ============================================================
-- 4. site_settings (단일 행 — 주소 구성요소와 표시용 전화)
-- ============================================================

UPDATE site_settings SET
  postal_code      = '06000',
  address_region   = '서울특별시',
  address_locality = '강남구',
  phone_display    = phone;
