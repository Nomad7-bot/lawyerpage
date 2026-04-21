"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";

import { SeoEditorPanel } from "@/components/admin/seo/SeoEditorPanel";
import { pageLabel } from "@/lib/admin/seo-meta";
import { cn } from "@/lib/utils/cn";

import type { SeoSetting } from "@/types";

type Props = {
  siteUrl: string;
  rows: SeoSetting[];
};

function isCompleted(row: SeoSetting): boolean {
  return Boolean(
    row.meta_title &&
      row.meta_title.trim() &&
      row.meta_description &&
      row.meta_description.trim()
  );
}

export function SeoPagesTable({ siteUrl, rows }: Props) {
  const [editing, setEditing] = useState<SeoSetting | null>(null);

  if (rows.length === 0) {
    return (
      <div className="overflow-hidden rounded-card border border-bg-light bg-bg-white px-6 py-16 text-center">
        <p className="text-body text-text-sub">
          등록된 SEO 설정이 없습니다. seed.sql 을 실행하거나 페이지 레코드를
          추가해주세요.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-card border border-bg-light bg-bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-bg-light">
                <th className="px-4 py-3 text-caption font-bold uppercase tracking-wider text-primary">
                  페이지
                </th>
                <th className="px-4 py-3 text-caption font-bold uppercase tracking-wider text-primary">
                  URL
                </th>
                <th className="px-4 py-3 text-caption font-bold uppercase tracking-wider text-primary">
                  Meta Title
                </th>
                <th className="px-4 py-3 text-caption font-bold uppercase tracking-wider text-primary">
                  Meta Desc
                </th>
                <th className="px-4 py-3 text-caption font-bold uppercase tracking-wider text-primary">
                  OG Image
                </th>
                <th className="px-4 py-3 text-caption font-bold uppercase tracking-wider text-primary">
                  상태
                </th>
                <th className="w-12 px-4 py-3" aria-label="열기" />
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-light">
              {rows.map((row) => {
                const done = isCompleted(row);
                return (
                  <tr
                    key={row.id}
                    onClick={() => setEditing(row)}
                    className="cursor-pointer transition-colors hover:bg-accent/5"
                  >
                    <td className="px-4 py-3 text-caption font-semibold text-primary">
                      {pageLabel(row.page_name)}
                    </td>
                    <td className="px-4 py-3 font-mono text-caption text-text-main">
                      {row.page_url}
                    </td>
                    <td className="max-w-[220px] px-4 py-3 text-caption text-text-main">
                      <span className="line-clamp-1">
                        {row.meta_title ?? (
                          <span className="text-text-sub/60">미설정</span>
                        )}
                      </span>
                    </td>
                    <td className="max-w-[260px] px-4 py-3 text-caption text-text-main">
                      <span className="line-clamp-1">
                        {row.meta_description ?? (
                          <span className="text-text-sub/60">미설정</span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-caption">
                      {row.og_image ? (
                        <span className="text-success">✓ 설정됨</span>
                      ) : (
                        <span className="text-text-sub/60">미설정</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-caption font-bold",
                          done ? "text-success" : "text-warning"
                        )}
                      >
                        {done ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                            설정완료
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                            미설정
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-sub">
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <SeoEditorPanel
        siteUrl={siteUrl}
        target={editing}
        onClose={() => setEditing(null)}
      />
    </>
  );
}
