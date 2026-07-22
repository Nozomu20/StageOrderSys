interface MmTextProps {
  x_mm: number;
  y_mm: number;
  fontSize_mm: number;
  children: string;
}

// 親<g>にscale(1,-1)がかかっている前提で、文字だけ上下反転を打ち消して表示する。
// ラベルは常に装飾目的で、下にあるコマ(circle)のドラッグ操作を邪魔しないよう
// ポインタイベントを透過させる(コマの名前をつかんだ時にテキスト選択が始まるのを防ぐ)。
export function MmText({ x_mm, y_mm, fontSize_mm, children }: MmTextProps) {
  return (
    <g transform={`translate(${x_mm}, ${y_mm}) scale(1, -1)`}>
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={fontSize_mm}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {children}
      </text>
    </g>
  );
}
