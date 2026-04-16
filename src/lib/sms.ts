/**
 * SMS 발송 Mock 함수
 *
 * 실제 SMS 게이트웨이(NHN Cloud, 알리고 등) 연동 전 단계로, 현재는
 * 콘솔 로그만 출력한다. 향후 이 함수의 구현부만 교체하면
 * 호출부(API Route) 수정 없이 실제 발송으로 전환할 수 있다.
 */

type SendSMSResult = { success: boolean };

export async function sendSMS(phone: string, message: string): Promise<SendSMSResult> {
  console.log(`[SMS Mock] To: ${phone} | Message: ${message}`);
  return { success: true };
}
