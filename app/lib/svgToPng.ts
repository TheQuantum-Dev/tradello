/**
 * Converts a public SVG file to a PNG data URL at runtime in the browser.
 * react-pdf cannot render SVGs directly — it requires PNG or JPG.
 * This loads the SVG, draws it onto a canvas, and returns a base64 PNG.
 */
export async function svgToPngDataUrl(
  svgPath: string,
  width: number,
  height: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      // 2x for retina sharpness in PDF
      canvas.width = width * 2;
      canvas.height = height * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context unavailable"));
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = svgPath;
  });
}
