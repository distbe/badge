import { parseBuffer } from "./opentype.js";

interface Glyph {
  index: number;
  name: string;
  unicode: number;
  unicodes: number[];
  advanceWidth?: number;
  leftSideBearing: number;
}

const fontBuffer = await Deno.readFile("./Roboto-Regular.ttf");
const font = parseBuffer(fontBuffer.buffer, {});

export function write(
  text: string,
  options: { fontSize: number; decimalPlaces?: number; maxWidth?: number },
) {
  const decimalPlaces = options.decimalPlaces || 2;
  const fontSize = options.fontSize;
  const fontScale = 1 / font.unitsPerEm * fontSize;
  const maxWidth = options.maxWidth ?? Infinity;

  const glyphs = font.stringToGlyphs(text) as Glyph[];
  const chunks = [] as { width: number; index: number }[];

  let width = 0;
  glyphs.forEach((glyph, index) => {
    const glyphWidth = (glyph.advanceWidth ?? 0) * fontScale;
    if (width > 0 && width + glyphWidth > maxWidth) {
      chunks.push({ width: +width.toFixed(decimalPlaces), index });
      width = 0;
    }
    width += (width > 0
      ? font.getKerningValue(glyphs[index - 1], glyph) * fontScale
      : 0) + glyphWidth;
  });
  chunks.push({ width: +width.toFixed(decimalPlaces), index: glyphs.length });

  const ascender = font.ascender * fontScale;
  const height = (font.ascender - font.descender) * fontScale;

  return chunks.map((chunk, chunkIndex) => {
    const startIndex = chunkIndex > 0 ? chunks[chunkIndex - 1].index : 0;
    const line = text.slice(startIndex, chunk.index);
    return {
      h: height,
      w: chunk.width,
      d: font.getPath(line, 0, ascender, options.fontSize, {
        kerning: true,
        letterSpacing: false,
        tracking: false,
      }).toPathData() as string,
    };
  });
}

export function label(
  messages: {
    text: string;
    fontSize?: number;
    bgColor?: string;
    textColor?: string;
    px?: number;
    py?: number;
  }[],
): string {
  if (messages.length === 0) {
    return "";
  }

  const mMessages = messages.map((message) => {
    const m = write(message.text, {
      fontSize: message.fontSize ?? 12,
      decimalPlaces: 2,
    })[0];
    return {
      w: Math.ceil(m.w),
      h: Math.ceil(m.h),
      d: m.d,
      px: message.px ?? 6,
      py: message.py ?? 2.5,
      bgColor: message.bgColor ?? "#555",
      textColor: message.textColor ?? "#fff",
    };
  });

  const width = mMessages.reduce((acc, m) => acc + m.w + m.px * 2, 0);
  const height = Math.max(...mMessages.map((m) => m.h + m.py * 2));

  let body =
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}">`;
  body += `<g shape-rendering="crispEdges">`;
  let rectX = 0;
  mMessages.forEach((m) => {
    body += `<rect x="${rectX}" width="${m.w +
      m.px * 2}" height="${height}" fill="${m.bgColor}"/>`;
    rectX += m.w + m.px * 2;
  });
  body += `</g>`;
  body += `<g>`;
  let textX = 0;
  mMessages.forEach((m) => {
    body += `<path transform="translate(${textX + m.px},${(height - m.h) /
      2})" fill="${m.textColor}" d="${m.d}"/>`;
    textX += m.w + m.px * 2;
  });
  body += `</g>`;
  body += `</svg>`;
  return body;
}

if (import.meta.main) {
  // for test :-)
  // $ deno run -A svg.ts > test.svg
  console.log(label([
    { text: "2021-11-09 ~ 2021-11-20" },
    { text: "Day 2", bgColor: "#97ca00" },
  ]));
}
