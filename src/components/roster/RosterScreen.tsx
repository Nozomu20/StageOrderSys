import { PartEditor } from "./PartEditor";
import { AddMemberForm } from "./AddMemberForm";
import { BulkPasteForm } from "./BulkPasteForm";
import { ImportRosterForm } from "./ImportRosterForm";
import { MemberTable } from "./MemberTable";

export function RosterScreen() {
  return (
    <div style={{ padding: 16 }}>
      <h2>団員登録</h2>
      <PartEditor />
      <AddMemberForm />
      <BulkPasteForm />
      <ImportRosterForm />
      <MemberTable />
    </div>
  );
}
