import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

type SummaryAccent = "gold" | "warning" | "plain";

type SummaryCardProps = {
  label: string;
  labelEn: string;
  value: number;
  unit?: string;
  helper?: string;
  accent?: SummaryAccent;
  icon?: LucideIcon;
};

const labelAccentStyles: Record<SummaryAccent, string> = {
  gold: "text-accent",
  warning: "text-warning",
  plain: "text-text-sub",
};

const helperAccentStyles: Record<SummaryAccent, string> = {
  gold: "text-accent",
  warning: "text-warning",
  plain: "text-text-sub",
};

export function SummaryCard({
  label,
  labelEn,
  value,
  unit = "건",
  helper,
  accent = "plain",
  icon: Icon,
}: SummaryCardProps) {
  return (
    <Card
      padding="lg"
      className="flex h-full flex-col justify-between bg-bg-light transition-colors hover:bg-accent/5"
    >
      <div>
        <p
          className={cn(
            "text-[10px] font-bold uppercase tracking-[0.2em]",
            labelAccentStyles[accent]
          )}
        >
          {labelEn}
        </p>
        <p className="mt-1 text-caption text-text-sub">{label}</p>
      </div>

      <div className="mt-6 flex items-baseline gap-2">
        <span className="text-4xl font-extrabold text-primary">{value}</span>
        <span className="text-body font-medium text-primary/60">{unit}</span>
      </div>

      {helper ? (
        <div
          className={cn(
            "mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider",
            helperAccentStyles[accent]
          )}
        >
          {Icon ? <Icon className="h-4 w-4" /> : null}
          <span>{helper}</span>
        </div>
      ) : null}
    </Card>
  );
}
