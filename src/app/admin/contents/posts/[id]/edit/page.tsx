import { notFound } from "next/navigation";

import { PostEditorForm } from "@/components/admin/contents/PostEditorForm";
import {
  getAuthorOptions,
  getPost,
  getPostCategories,
} from "@/lib/admin/posts";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function EditPostPage({ params }: { params: Params }) {
  const { id } = await params;

  const [post, categories, authors] = await Promise.all([
    getPost(id),
    getPostCategories(),
    getAuthorOptions(),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <PostEditorForm
      mode="edit"
      initial={post}
      categories={categories}
      authors={authors}
    />
  );
}
