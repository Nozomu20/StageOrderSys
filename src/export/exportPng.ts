export interface PngHeaderInfo {
  title: string;
  groupName: string;
  date: string;
}

const HEADER_HEIGHT_PX = 60;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("SVGの読み込みに失敗しました"));
    image.src = src;
  });
}

// StageSvgCanvasの<svg>をラスタライズしてPNG Blobにする。
// SVGはページのCSSから切り離して単体でシリアライズするため、
// テキストのフォントはMmText側で明示指定してある前提。
export async function exportSvgToPngBlob(
  svgEl: SVGSVGElement,
  scale: number,
  header: PngHeaderInfo,
): Promise<Blob> {
  const viewBox = svgEl.viewBox.baseVal;
  const stageWidth = Math.round(viewBox.width * scale);
  const stageHeight = Math.round(viewBox.height * scale);
  const headerHeight = Math.round(HEADER_HEIGHT_PX * scale);
  const width = stageWidth;
  const height = stageHeight + headerHeight;

  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("width", String(stageWidth));
  clone.setAttribute("height", String(stageHeight));
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const svgString = new XMLSerializer().serializeToString(clone);
  const svgUrl = URL.createObjectURL(
    new Blob([svgString], { type: "image/svg+xml;charset=utf-8" }),
  );

  try {
    const image = await loadImage(svgUrl);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D描画コンテキストを取得できませんでした");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#000000";
    ctx.textBaseline = "top";
    ctx.font = `bold ${16 * scale}px sans-serif`;
    ctx.fillText(header.title, 10 * scale, 8 * scale);
    ctx.font = `${12 * scale}px sans-serif`;
    ctx.fillText(
      [header.groupName, header.date].filter(Boolean).join("  "),
      10 * scale,
      30 * scale,
    );

    ctx.drawImage(image, 0, headerHeight, stageWidth, stageHeight);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("PNGの生成に失敗しました"));
      }, "image/png");
    });
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}
