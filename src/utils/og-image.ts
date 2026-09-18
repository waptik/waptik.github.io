import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

import { OG, SITE } from "../config";

let fontPromise: Promise<Buffer> | undefined;
let avatarPromise: Promise<string> | undefined;

function loadFont(): Promise<Buffer> {
  fontPromise ??= readFile(
    join(process.cwd(), "src/assets/fonts/jetbrains-mono-latin-400.ttf"),
  );
  return fontPromise;
}

function loadAvatar(): Promise<string> {
  avatarPromise ??= readFile(join(process.cwd(), "public/icon-192.png")).then(
    (buf) => `data:image/png;base64,${buf.toString("base64")}`,
  );
  return avatarPromise;
}

const BG_COLOR = "#0c0d11";
const TEXT_MAIN = "#ededf0";
const TEXT_MUTED = "#9d9db5";

export interface OgOptions {
  title: string;
  description?: string;
  category?: string;
  stamp?: string;
  tags?: string[];
}

const node = (
  type: string,
  style: Record<string, unknown>,
  children?: unknown,
  extraProps: Record<string, unknown> = {},
) => ({
  type,
  props: { style, children, ...extraProps },
});

const text = (value: string, style: Record<string, unknown>) =>
  node("div", style, value);

export async function renderOgImage(options: OgOptions): Promise<Buffer> {
  const { title, description, category, stamp } = options;
  const [font, avatar] = await Promise.all([loadFont(), loadAvatar()]);

  const domain = stamp || SITE.url.replace(/^https?:\/\//, "");

  const topItems = [];

  if (category) {
    topItems.push(
      text(category.toUpperCase(), {
        fontSize: 24,
        letterSpacing: "0.14em",
        color: TEXT_MUTED,
        marginBottom: 16,
      }),
    );
  }

  topItems.push(
    text(title, {
      fontSize: title.length > 50 ? 50 : 62,
      lineHeight: 1.18,
      color: TEXT_MAIN,
      maxWidth: 980,
      marginBottom: description ? 28 : 0,
    }),
  );

  if (description) {
    topItems.push(
      text(description, {
        fontSize: 22,
        lineHeight: 1.55,
        color: TEXT_MUTED,
        maxWidth: 900,
      }),
    );
  }

  const markup = node(
    "div",
    {
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      width: "100%",
      height: "100%",
      padding: "80px",
      backgroundColor: BG_COLOR,
      fontFamily: "JetBrains Mono",
    },
    [
      node("div", { display: "flex", flexDirection: "column" }, topItems),
      node(
        "div",
        { display: "flex", flexDirection: "column", gap: 14 },
        [
          node(
            "img",
            {
              width: 56,
              height: 56,
              transform: "rotate(-12deg)",
            },
            undefined,
            {
              src: avatar,
              width: 56,
              height: 56,
            },
          ),
          text(domain, {
            fontSize: 24,
            color: TEXT_MUTED,
          }),
        ],
      ),
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
