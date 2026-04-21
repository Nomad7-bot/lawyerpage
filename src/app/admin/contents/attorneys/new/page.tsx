import { AttorneyEditorForm } from "@/components/admin/contents/AttorneyEditorForm";
import { getPracticeAreaOptions } from "@/lib/admin/attorneys";

export const dynamic = "force-dynamic";

export default async function NewAttorneyPage() {
  const practiceAreas = await getPracticeAreaOptions();

  return (
    <AttorneyEditorForm
      mode="create"
      initial={null}
      practiceAreas={practiceAreas}
    />
  );
}
