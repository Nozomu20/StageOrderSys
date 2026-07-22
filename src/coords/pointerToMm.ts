// ポインタのクライアント座標をmm座標(ドメイン座標系)へ変換する。
// このファイル以外でクライアント座標→mm変換を行わないこと。
export function clientPointToMm(
  svgEl: SVGSVGElement,
  flippedGroupEl: SVGGElement,
  clientX: number,
  clientY: number,
): { x_mm: number; y_mm: number } {
  const point = svgEl.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const ctm = flippedGroupEl.getScreenCTM();
  if (!ctm) return { x_mm: 0, y_mm: 0 };
  const transformed = point.matrixTransform(ctm.inverse());
  return { x_mm: transformed.x, y_mm: transformed.y };
}
