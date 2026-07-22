import { PartEditor } from "./PartEditor";
import { AddMemberForm } from "./AddMemberForm";
import { BulkPasteForm } from "./BulkPasteForm";
import { ImportRosterForm } from "./ImportRosterForm";
import { MemberTable } from "./MemberTable";

export function RosterScreen() {
  return (
    <div className="screen">
      <h2>団員登録</h2>
      <div className="card">
        <PartEditor />
      </div>
      <div className="card">
        <AddMemberForm />
      </div>
      <div className="card">
        <BulkPasteForm />
      </div>
      <div className="card">
        <ImportRosterForm />
      </div>
      <MemberTable />
    </div>
  );
}
