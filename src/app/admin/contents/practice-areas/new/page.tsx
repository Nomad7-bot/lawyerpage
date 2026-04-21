import { PracticeAreaEditorForm } from "@/components/admin/contents/PracticeAreaEditorForm";

export const dynamic = "force-dynamic";

export default function NewPracticeAreaPage() {
  return <PracticeAreaEditorForm mode="create" initial={null} />;
}
