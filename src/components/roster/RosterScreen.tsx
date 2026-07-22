import { PartEditor } from "./PartEditor";
import { BulkPasteForm } from "./BulkPasteForm";
import { MemberTable } from "./MemberTable";

export function RosterScreen() {
  return (
    <div style={{ padding: 16 }}>
      <h2>団員登録</h2>
      <PartEditor />
      <BulkPasteForm />
      <MemberTable />
    </div>
  );
}
