"use client";

import { Plus, Trash2 } from "lucide-react";

import type { CareerItem } from "@/types";

type Props = {
  items: CareerItem[];
  onChange: (next: CareerItem[]) => void;
};

export function CareerListEditor({ items, onChange }: Props) {
  const addItem = () => {
    if (items.length >= 30) return;
    onChange([...items, { year: "", content: "" }]);
  };

  const updateItem = (index: number, patch: Partial<CareerItem>) => {
    const next = items.map((it, i) => (i === index ? { ...it, ...patch } : it));
    onChange(next);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-caption font-medium text-text-main">
          경력 사항
        </label>
        <button
          type="button"
          onClick={addItem}
          disabled={items.length >= 30}
          className="inline-flex items-center gap-1 text-caption font-bold text-accent hover:text-accent-light disabled:opacity-40"
        >
          <Plus className="h-3 w-3" aria-hidden />
          경력 추가
        </button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-card bg-bg-light px-4 py-6 text-center text-caption text-text-sub">
          등록된 경력이 없습니다. "경력 추가" 버튼을 눌러 입력하세요.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <input
                type="text"
                value={item.year}
                onChange={(e) => updateItem(idx, { year: e.target.value })}
                placeholder="연도"
                maxLength={20}
                className="h-11 w-24 shrink-0 rounded-none border border-bg-light bg-bg-white px-3 text-caption text-text-main tabular-nums focus:border-accent focus:outline-none focus:ring-0"
              />
              <input
                type="text"
                value={item.content}
                onChange={(e) => updateItem(idx, { content: e.target.value })}
                placeholder="경력 내용"
                maxLength={200}
                className="h-11 flex-1 rounded-none border border-bg-light bg-bg-white px-3 text-caption text-text-main focus:border-accent focus:outline-none focus:ring-0"
              />
              <button
                type="button"
                onClick={() => removeItem(idx)}
                aria-label={`경력 ${idx + 1} 삭제`}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center text-text-sub transition-colors hover:bg-error/10 hover:text-error"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
