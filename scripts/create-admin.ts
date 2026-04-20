/**
 * 초기 관리자 계정 생성 스크립트
 *
 * 사용법:
 *   1) .env.local 에 아래 변수를 채운다
 *        NEXT_PUBLIC_SUPABASE_URL=...
 *        SUPABASE_SERVICE_ROLE_KEY=...
 *        INITIAL_ADMIN_PASSWORD=...
 *   2) npm run create-admin
 *
 * 주의:
 *   - 이 스크립트는 Service Role Key 로 auth.admin API 를 호출한다
 *   - 브라우저/API Route 에서 호출 금지 (서버 전용 1회성 스크립트)
 *   - 프로덕션 환경에서 실행 후에는 INITIAL_ADMIN_PASSWORD 를 환경변수에서 제거 권장
 */

import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "admin@lawfirm.co.kr";

function printError(errorType: string, summary: string, why: string, how: string[], fix: string): void {
  // CLAUDE.md §15 에러 설명 형식
  console.error(`\n[${errorType}]: ${summary}\n`);
  console.error("🚨 에러 발생\n");
  console.error("[ 어떤 에러인가요? ]");
  console.error(summary, "\n");
  console.error("[ 왜 발생했나요? ]");
  console.error(why, "\n");
  console.error("[ 어떻게 발생했나요? ]");
  how.forEach((step, i) => console.error(`  ${i + 1}. ${step}`));
  console.error("");
  console.error("[ 해결 방법 ]");
  console.error(fix, "\n");
}

async function main(): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const password = process.env.INITIAL_ADMIN_PASSWORD;

  // 환경변수 누락 검증
  const missing: string[] = [];
  if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!password) missing.push("INITIAL_ADMIN_PASSWORD");

  if (missing.length > 0) {
    printError(
      "EnvVarMissing",
      `필수 환경변수 누락: ${missing.join(", ")}`,
      "Node 가 .env.local 을 읽었지만 위 변수가 비어 있거나 정의되지 않았습니다. 환경변수는 Supabase 서버 주소와 관리자 권한 키, 초기 비밀번호를 스크립트에 전달하는 통로입니다.",
      [
        "npm run create-admin 명령을 실행했습니다",
        "tsx 가 .env.local 을 로드했지만 변수가 비어 있었습니다",
        "Supabase 클라이언트를 초기화할 수 없어 바로 중단합니다",
      ],
      ".env.local 파일을 열어 .env.example 을 참조해 누락된 변수를 채워주세요. Service Role Key 는 Supabase Dashboard → Settings → API 에서 복사할 수 있습니다."
    );
    process.exit(1);
  }

  // 비밀번호 최소 길이 가드 (Supabase 기본 6자이나 내부 정책으로 10자 권장)
  if (password!.length < 10) {
    printError(
      "WeakPassword",
      `INITIAL_ADMIN_PASSWORD 가 너무 짧습니다 (현재 ${password!.length}자)`,
      "관리자 계정은 서비스의 모든 데이터에 접근할 수 있어 강력한 비밀번호가 필요합니다. 내부 정책상 최소 10자 이상을 요구합니다.",
      [
        ".env.local 의 INITIAL_ADMIN_PASSWORD 를 읽었습니다",
        "길이가 10자 미만인 것을 확인했습니다",
        "보안상 계정 생성을 중단합니다",
      ],
      "영문 대·소문자 + 숫자 + 특수문자를 조합한 10자 이상 비밀번호로 변경한 뒤 다시 실행하세요."
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl!, serviceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log(`🔧 관리자 계정 생성 시도: ${ADMIN_EMAIL}`);

  const { data, error } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: password!,
    email_confirm: true, // Dashboard "Auto Confirm User" 와 동일 효과
  });

  if (error) {
    const isDuplicate =
      error.message.toLowerCase().includes("already") ||
      error.message.toLowerCase().includes("registered");

    if (isDuplicate) {
      printError(
        "AdminAlreadyExists",
        `이미 ${ADMIN_EMAIL} 계정이 존재합니다`,
        "Supabase Auth 사용자 테이블에 이미 같은 이메일로 등록된 계정이 있습니다. 동일 이메일은 중복 생성이 불가합니다.",
        [
          "supabase.auth.admin.createUser 를 호출했습니다",
          "Supabase 가 중복 이메일을 감지하고 에러를 반환했습니다",
          "스크립트가 중복 생성을 방지하기 위해 중단합니다",
        ],
        "Dashboard → Authentication → Users 에서 기존 계정을 삭제 후 다시 실행하거나, 이미 계정이 정상 사용 중이라면 이 스크립트는 건너뛰어도 됩니다. 비밀번호 재설정이 필요하면 Dashboard 의 해당 사용자 메뉴를 사용하세요."
      );
      process.exit(1);
    }

    printError(
      "SupabaseAdminError",
      `Supabase Admin API 호출 실패: ${error.message}`,
      "Supabase 서버에 관리자 계정 생성 요청을 보냈지만 서버가 에러를 반환했습니다. 대부분 Service Role Key 권한 문제 또는 Supabase 프로젝트 상태 문제입니다.",
      [
        `Service Role Key 로 Supabase (${supabaseUrl}) 에 연결을 시도했습니다`,
        "auth.admin.createUser 엔드포인트 호출 중 오류가 반환되었습니다",
        `원문 메시지: ${error.message}`,
      ],
      "Service Role Key 가 올바른지, Supabase 프로젝트가 활성 상태인지 확인하세요. 네트워크 문제라면 잠시 후 다시 시도하세요."
    );
    process.exit(1);
  }

  console.log(`✅ 관리자 계정 생성 완료: ${data.user.email} (id=${data.user.id})`);
  console.log("\n다음 단계:");
  console.log("  1) 브라우저에서 /admin/login 으로 접속");
  console.log(`  2) ${ADMIN_EMAIL} + INITIAL_ADMIN_PASSWORD 로 로그인`);
  console.log("  3) 로그인 성공 후 .env.local 의 INITIAL_ADMIN_PASSWORD 는 제거 권장\n");
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  printError(
    "UnexpectedError",
    `예기치 못한 오류가 발생했습니다: ${message}`,
    "스크립트 실행 중 예상하지 못한 예외가 발생했습니다. 보통 네트워크/의존성/런타임 문제입니다.",
    [
      "스크립트 메인 함수 실행 중 예외가 throw 되었습니다",
      "catch 블록에서 최종 처리되었습니다",
      `원문: ${message}`,
    ],
    "tsx, node 버전을 확인하고 의존성 재설치(npm install) 후 다시 시도하세요. 그래도 실패하면 위 원문 메시지로 검색해보세요."
  );
  process.exit(1);
});
