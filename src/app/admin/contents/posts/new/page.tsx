import { PostEditorForm } from "@/components/admin/contents/PostEditorForm";
import { getAuthorOptions, getPostCategories } from "@/lib/admin/posts";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const [categories, authors] = await Promise.all([
    getPostCategories(),
    getAuthorOptions(),
  ]);

  return (
    <PostEditorForm
      mode="create"
      initial={null}
      categories={categories}
      authors={authors}
    />
  );
}
