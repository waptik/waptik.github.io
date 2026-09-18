import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

import { OG, SITE } from "../config";

let fontPromise: Promise<Buffer> | undefined;

function loadFont(): Promise<Buffer> {
  fontPromise ??= readFile(
    join(process.cwd(), "src/assets/fonts/jetbrains-mono-latin-400.ttf"),
  );
  return fontPromise;
}

const BG_COLOR = "#202122";
const TEXT_MAIN = "#ffffff";
const TEXT_MUTED = "rgba(255, 255, 255, 0.65)";
const ACCENT = "#548e9b";

interface OgOptions {
  title: string;
  stamp?: string;
  tags?: string[];
}

const node = (
  type: string,
  style: Record<string, unknown>,
  children?: unknown,
) => ({ type, props: { style, children } });

const text = (value: string, style: Record<string, unknown>) =>
  node("div", style, value);

export async function renderOgImage(options: OgOptions): Promise<Buffer> {
  const { title, stamp, tags = [] } = options;
  const font = await loadFont();

  const footer = [stamp, tags.join(" · ")].filter(Boolean).join("  —  ");

  const markup = node(
    "div",
    {
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      width: "100%",
      height: "100%",
      padding: "72px 80px",
      backgroundColor: BG_COLOR,
      fontFamily: "JetBrains Mono",
      color: TEXT_MAIN,
    },
    [
      text(SITE.title.toUpperCase(), {
        fontSize: 24,
        letterSpacing: "0.3em",
        color: ACCENT,
        fontWeight: 600,
      }),

      node("div", { display: "flex", flexDirection: "column", gap: 32 }, [
        text(title, {
          fontSize: title.length > 45 ? 54 : 64,
          lineHeight: 1.2,
          letterSpacing: "-0.01em",
          color: TEXT_MAIN,
        }),
        node("div", {
          display: "flex",
          width: 100,
          height: 4,
          backgroundColor: ACCENT,
          borderRadius: 2,
        }),
      ]),

      text(footer, {
        fontSize: 22,
        letterSpacing: "0.1em",
        color: TEXT_MUTED,
      }),
    ],
  );

  const svg = await satori(markup as never, {
    width: OG.width,
    height: OG.height,
    fonts: [
      {
        name: "JetBrains Mono",
        data: font,
        weight: 400,
        style: "normal",
      },
    ],
  });

  return Buffer.from(
    new Resvg(svg, {
      fitTo: { mode: "width", value: OG.width },
    })
      .render()
      .asPng(),
  );
}
