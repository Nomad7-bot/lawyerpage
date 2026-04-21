import { notFound } from "next/navigation";

import { PracticeAreaEditorForm } from "@/components/admin/contents/PracticeAreaEditorForm";
import { getPracticeArea } from "@/lib/admin/practice-areas";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function EditPracticeAreaPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const area = await getPracticeArea(id);
  if (!area) notFound();

  return <PracticeAreaEditorForm mode="edit" initial={area} />;
}
