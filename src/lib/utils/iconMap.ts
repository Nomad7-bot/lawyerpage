import {
  Building2,
  Gavel,
  HardHat,
  Home,
  Scale,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * DB 의 `icon_name` 문자열 (practice_areas.icon_name, attorneys.practice_area_cards[].icon_name)
 * 을 lucide-react 컴포넌트로 변환한다.
 *
 * 미등록/누락 시 기본 아이콘(Scale) 으로 폴백한다.
 * 새 아이콘을 DB 에 추가할 때는 이 맵에 반드시 등록해야 한다.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  Scale,
  Gavel,
  Users,
  Building2,
  Home,
  HardHat,
};

export function getIcon(name: string | null | undefined): LucideIcon {
  if (!name) return Scale;
  return ICON_MAP[name] ?? Scale;
}
