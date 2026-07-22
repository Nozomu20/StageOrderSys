import { useEffect } from "react";
import { useUndoRedo } from "../state/DomainStateContext";

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

// Ctrl+Z / Cmd+Z で元に戻す、Ctrl+Shift+Z・Ctrl+Y / Cmd+Shift+Z でやり直す。
// テキスト入力欄にフォーカスがある間は、ブラウザ標準のテキスト編集の
// undoを奪わないよう何もしない。
export function UndoRedoControls() {
  const { undo, redo, canUndo, canRedo } = useUndoRedo();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isEditableTarget(e.target)) return;
      const isMod = e.metaKey || e.ctrlKey;
      if (!isMod) return;
      const key = e.key.toLowerCase();
      if (key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if (key === "z") {
        e.preventDefault();
        undo();
      } else if (key === "y") {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return (
    <div style={{ display: "flex", gap: 4 }}>
      <button onClick={undo} disabled={!canUndo} title="元に戻す (Ctrl+Z)">
        元に戻す
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        title="やり直す (Ctrl+Shift+Z)"
      >
        やり直す
      </button>
    </div>
  );
}
