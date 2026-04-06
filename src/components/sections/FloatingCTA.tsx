"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Phone, Calendar } from "lucide-react";
import { SITE } from "@/constants/site";
import { cn } from "@/lib/utils/cn";

export function FloatingCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Hero 섹션(약 90vh)을 지나면 등장
      setVisible(window.scrollY > window.innerHeight * 0.7);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 z-30",
        "bg-bg-white border-t border-bg-light shadow-[0_-4px_12px_rgba(0,0,0,0.08)]",
        "transition-transform duration-300 ease-out",
        visible ? "translate-y-0" : "translate-y-full"
      )}
      aria-hidden={!visible}
    >
      <div className="flex items-center gap-2 p-3">
        <a
          href={`tel:${SITE.nap.phone}`}
          className={cn(
            "flex-1 h-12 inline-flex items-center justify-center gap-2",
            "border border-primary text-primary text-caption font-semibold",
            "hover:bg-primary hover:text-white transition-colors"
          )}
        >
          <Phone className="h-4 w-4" aria-hidden />
          전화 상담
        </a>
        <Link
          href="/reservation"
          className={cn(
            "flex-1 h-12 inline-flex items-center justify-center gap-2",
            "bg-accent text-white text-caption font-semibold",
            "hover:bg-accent-light hover:text-text-main transition-colors"
          )}
        >
          <Calendar className="h-4 w-4" aria-hidden />
          예약 상담
        </Link>
      </div>
    </div>
  );
}
