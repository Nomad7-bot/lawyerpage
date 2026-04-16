"use client";

import { useState } from "react";
import { CalendarDays, User } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { formatDateTimeKo } from "@/lib/utils/date";
import {
  reservationFormSchema,
  type ReservationFormErrors,
} from "@/lib/schemas/reservation";
import { useReservationStore } from "@/store/reservationStore";
import {
  useAttorneys,
  usePracticeAreas,
  useCreateReservation,
} from "@/hooks/useReservation";

export function Step3Info() {
  const {
    selectedAttorneySlug,
    selectedAttorneyId,
    selectedDate,
    selectedTime,
    formData,
    setFormData,
    setStep,
    setReservationNumber,
  } = useReservationStore();

  const { data: attorneys } = useAttorneys();
  const { data: practiceAreas } = usePracticeAreas();
  const createReservation = useCreateReservation();

  const [errors, setErrors] = useState<ReservationFormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // 변호사명 resolve
  const attorney =
    selectedAttorneySlug && attorneys
      ? attorneys.find((a) => a.slug === selectedAttorneySlug)
      : null;

  const attorneyLabel = attorney
    ? `${attorney.name} ${attorney.position}`
    : "담당 변호사 자동 배정";

  const dateTimeLabel =
    selectedDate && selectedTime
      ? formatDateTimeKo(selectedDate, selectedTime)
      : "";

  // 상담분야 Select 옵션
  const topicOptions =
    practiceAreas?.map((pa) => ({ value: pa.id, label: pa.name })) ?? [];

  // 로컬 폼 상태 (스토어 formData 반영)
  const [localForm, setLocalForm] = useState({
    name: (formData.name as string) ?? "",
    phone: (formData.phone as string) ?? "",
    email: (formData.email as string) ?? "",
    topic: (formData.topic as string) ?? "",
    content: (formData.content as string) ?? "",
    agreePrivacy: (formData.agreePrivacy as boolean) ?? false,
  });

  function handleChange(
    field: keyof typeof localForm,
    value: string | boolean
  ) {
    setLocalForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof ReservationFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (apiError) setApiError(null);
  }

  function handleSubmit() {
    const result = reservationFormSchema.safeParse({
      ...localForm,
      agreePrivacy: localForm.agreePrivacy || undefined,
    });

    if (!result.success) {
      const fieldErrors: ReservationFormErrors = {};
      result.error.errors.forEach((err) => {
        const key = err.path[0] as keyof ReservationFormErrors;
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setApiError(null);

    createReservation.mutate(
      {
        attorney_id: selectedAttorneyId ?? undefined,
        client_name: localForm.name,
        client_phone: localForm.phone,
        client_email: localForm.email,
        practice_area_id: localForm.topic,
        consultation_note: localForm.content || undefined,
        preferred_date: selectedDate!,
        preferred_time: selectedTime!,
      },
      {
        onSuccess: (data) => {
          setFormData({ ...localForm, agreePrivacy: true });
          setReservationNumber(data.reservation_no);
          setStep(4);
        },
        onError: (err) => {
          setApiError(err.message);
        },
      }
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-h3 font-semibold text-primary">정보 입력</h2>
        <p className="mt-1 text-body text-text-sub">
          상담 신청에 필요한 정보를 입력해주세요.
        </p>
      </div>

      {/* 상단 요약 카드 */}
      <div className="bg-bg-light rounded-card p-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1">
          <User className="w-5 h-5 text-accent shrink-0" aria-hidden />
          <span className="text-body font-medium text-primary">
            {attorneyLabel}
          </span>
        </div>
        <div className="flex items-center gap-3 flex-1">
          <CalendarDays className="w-5 h-5 text-accent shrink-0" aria-hidden />
          <span className="text-body text-text-main">{dateTimeLabel}</span>
        </div>
        <button
          type="button"
          onClick={() => setStep(2)}
          className="text-caption font-medium text-primary-light underline hover:text-primary transition-colors self-start sm:self-auto"
        >
          변경하기
        </button>
      </div>

      {/* 폼 필드 */}
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="이름 *"
            placeholder="홍길동"
            value={localForm.name}
            onChange={(e) => handleChange("name", e.target.value)}
            error={errors.name}
            autoComplete="name"
            disabled={createReservation.isPending}
          />
          <Input
            label="연락처 *"
            placeholder="010-0000-0000"
            value={localForm.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            error={errors.phone}
            inputMode="tel"
            autoComplete="tel"
            disabled={createReservation.isPending}
          />
        </div>

        <Input
          label="이메일 *"
          type="email"
          placeholder="example@email.com"
          value={localForm.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={errors.email}
          autoComplete="email"
          disabled={createReservation.isPending}
        />

        <Select
          label="상담분야 *"
          placeholder="상담받을 분야를 선택하세요"
          options={topicOptions}
          value={localForm.topic}
          onChange={(v) => handleChange("topic", v)}
          error={errors.topic}
          disabled={createReservation.isPending}
        />

        <Textarea
          label="상담 내용"
          placeholder="상담받고 싶은 내용을 자유롭게 적어주세요. (선택 사항)"
          value={localForm.content}
          onChange={(e) => handleChange("content", e.target.value)}
          rows={5}
          maxLength={500}
          error={errors.content}
          disabled={createReservation.isPending}
        />

        {/* 개인정보 동의 */}
        <div>
          <label
            className={cn(
              "flex items-start gap-3 cursor-pointer group",
              errors.agreePrivacy && "text-error"
            )}
          >
            <input
              type="checkbox"
              checked={localForm.agreePrivacy}
              onChange={(e) => handleChange("agreePrivacy", e.target.checked)}
              className="sr-only"
              aria-describedby={
                errors.agreePrivacy ? "privacy-error" : undefined
              }
              disabled={createReservation.isPending}
            />
            <div
              className={cn(
                "mt-0.5 w-5 h-5 rounded-none border-2 flex items-center justify-center shrink-0 transition-colors",
                localForm.agreePrivacy
                  ? "bg-accent border-accent"
                  : "border-bg-light group-hover:border-accent/50"
              )}
              aria-hidden
            >
              {localForm.agreePrivacy && (
                <svg
                  className="w-3 h-3 text-bg-white"
                  fill="none"
                  viewBox="0 0 12 12"
                >
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <span className="text-body text-text-main">
              <span className="font-medium text-primary">
                개인정보 수집·이용에 동의합니다.{" "}
              </span>
              <span className="text-text-sub">(필수)</span>{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-caption text-primary-light underline hover:text-primary"
                onClick={(e) => e.stopPropagation()}
              >
                내용 보기
              </a>
            </span>
          </label>
          {errors.agreePrivacy && (
            <p
              id="privacy-error"
              className="mt-1.5 ml-8 text-caption text-error"
              role="alert"
            >
              {errors.agreePrivacy}
            </p>
          )}
        </div>
      </div>

      {/* API 에러 */}
      {apiError && (
        <div className="mt-4 p-3 bg-error/5 border border-error/20 rounded-card">
          <p className="text-caption text-error" role="alert">
            {apiError}
          </p>
        </div>
      )}

      {/* 하단 버튼 */}
      <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
        <Button
          variant="ghost"
          size="lg"
          onClick={() => setStep(2)}
          className="w-full sm:w-auto"
          disabled={createReservation.isPending}
        >
          ← 이전
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          loading={createReservation.isPending}
          className="w-full sm:w-auto"
        >
          예약 신청하기
        </Button>
      </div>
    </div>
  );
}
