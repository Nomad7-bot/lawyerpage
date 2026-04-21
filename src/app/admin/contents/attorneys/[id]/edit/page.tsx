import { notFound } from "next/navigation";

import { AttorneyEditorForm } from "@/components/admin/contents/AttorneyEditorForm";
import {
  getAttorney,
  getPracticeAreaOptions,
} from "@/lib/admin/attorneys";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function EditAttorneyPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;

  const [attorney, practiceAreas] = await Promise.all([
    getAttorney(id),
    getPracticeAreaOptions(),
  ]);

  if (!attorney) {
    notFound();
  }

  return (
    <AttorneyEditorForm
      mode="edit"
      initial={attorney}
      practiceAreas={practiceAreas}
    />
  );
}
