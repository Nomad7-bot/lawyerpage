"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef } from "react";
import {
  Bold,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Unlink,
} from "lucide-react";

import { useToast } from "@/components/admin/ToastProvider";
import { uploadImage, type StorageBucket } from "@/lib/storage";
import { cn } from "@/lib/utils/cn";

type TiptapEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** 본문 내 이미지 업로드에 사용할 버킷 (기본 posts) */
  bucket?: StorageBucket;
  disabled?: boolean;
};

/**
 * Tiptap 기반 리치 텍스트 에디터 — 게시글/업무분야 공용.
 *
 * - SSR: `immediatelyRender: false` 로 hydration mismatch 방지
 * - 이미지 업로드: 툴바 버튼 → hidden file input → Supabase Storage 업로드 → setImage
 * - prose 스타일: Tailwind typography 플러그인으로 본문 렌더
 */
export function TiptapEditor({
  value,
  onChange,
  placeholder = "내용을 입력하세요",
  bucket = "posts",
  disabled = false,
}: TiptapEditorProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    immediatelyRender: false,
    editable: !disabled,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none min-h-[400px] px-4 py-3",
          "focus:outline-none",
          "prose-headings:text-primary prose-p:text-text-main prose-a:text-accent",
          "prose-img:rounded-card"
        ),
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // 외부 value 변경(e.g. 에디터 초기화) 시 동기화
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() === value) return;
    editor.commands.setContent(value, { emitUpdate: false });
  }, [value, editor]);

  const handleImagePick = () => fileInputRef.current?.click();

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;

    const result = await uploadImage(bucket, file, "editor");
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    editor.chain().focus().setImage({ src: result.publicUrl }).run();
  };

  const promptLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href ?? "";
    const url = window.prompt("링크 URL 을 입력하세요", previous);
    if (url === null) return; // 취소
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!editor) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-card border border-bg-light bg-bg-white">
        <Loader2 className="h-5 w-5 animate-spin text-text-sub" aria-hidden />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-card border border-bg-light bg-bg-white">
      <Toolbar
        editor={editor}
        onPickImage={handleImagePick}
        onPromptLink={promptLink}
        disabled={disabled}
      />
      <EditorContent editor={editor} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleImageChange}
      />
    </div>
  );
}

type ToolbarProps = {
  editor: Editor;
  onPickImage: () => void;
  onPromptLink: () => void;
  disabled: boolean;
};

function Toolbar({ editor, onPickImage, onPromptLink, disabled }: ToolbarProps) {
  const Btn = ({
    onClick,
    active,
    label,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    label: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-none transition-colors",
        "hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-40",
        active ? "bg-primary text-bg-white hover:bg-primary" : "text-text-sub"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-bg-light bg-bg-light/40 px-2 py-2">
      <Btn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        label="굵게"
      >
        <Bold className="h-4 w-4" aria-hidden />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        label="기울임"
      >
        <Italic className="h-4 w-4" aria-hidden />
      </Btn>
      <div className="mx-1 h-5 w-px bg-bg-light" aria-hidden />
      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        label="제목 2"
      >
        <Heading2 className="h-4 w-4" aria-hidden />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        label="제목 3"
      >
        <Heading3 className="h-4 w-4" aria-hidden />
      </Btn>
      <div className="mx-1 h-5 w-px bg-bg-light" aria-hidden />
      <Btn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        label="글머리 기호 목록"
      >
        <List className="h-4 w-4" aria-hidden />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        label="번호 목록"
      >
        <ListOrdered className="h-4 w-4" aria-hidden />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        label="인용"
      >
        <Quote className="h-4 w-4" aria-hidden />
      </Btn>
      <div className="mx-1 h-5 w-px bg-bg-light" aria-hidden />
      <Btn onClick={onPickImage} label="이미지 업로드">
        <ImageIcon className="h-4 w-4" aria-hidden />
      </Btn>
      {editor.isActive("link") ? (
        <Btn
          onClick={() => editor.chain().focus().unsetLink().run()}
          active
          label="링크 제거"
        >
          <Unlink className="h-4 w-4" aria-hidden />
        </Btn>
      ) : (
        <Btn onClick={onPromptLink} label="링크 삽입">
          <LinkIcon className="h-4 w-4" aria-hidden />
        </Btn>
      )}
    </div>
  );
}
