import { PART_COLOR_PALETTE } from "../../domain/partColors";

interface ColorSwatchPickerProps {
  value: string;
  onChange: (color: string) => void;
}

// パートの色は自由入力にせず、固定パレットからのスウォッチ選択にする。
export function ColorSwatchPicker({ value, onChange }: ColorSwatchPickerProps) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {PART_COLOR_PALETTE.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          aria-label={color}
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: color,
            padding: 0,
            cursor: "pointer",
            border:
              value === color ? "2px solid #333" : "1px solid #ccc",
            outline: value === color ? "1px solid #333" : "none",
            outlineOffset: 1,
          }}
        />
      ))}
    </div>
  );
}
