// Generates og-image.png (dark) and og-image-light.png (light) — 1200×630.
// Reproducible: re-run with `node scripts/generate-og.mjs` if branding changes.
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const W = 1200;
const H = 630;

const DISPLAY    = "Bricolage Grotesque ExtraBold";
const DISPLAY_SB = "Bricolage Grotesque SemiBold";
const MONO       = "DejaVu Sans Mono";

const ekg = "M0 470 H300 l18 -70 l22 150 l18 -110 l14 30 H560 l16 -40 l16 40 H1200";

// ── Themes ────────────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    bgTop:      "#0c0e12",
    bgBot:      "#08090c",
    signal:     "#2ee6a0",
    signalOp:   "0.34",
    ekgOp:      "0.10",
    gridOp:     "0.45",
    glowTopOp:  "0.16",
    text:       "#e8eaed",
    dim:        "#9aa1ac",
    faint:      "#5b626c",
    line:       "#20242b",
    headStart:  "#ffffff",
    headEnd:    "#aeb6c0",
    frameOp:    "0.12",
  },
  light: {
    bgTop:      "#f0f4f8",
    bgBot:      "#e2e8f0",
    signal:     "#0d7a56",
    signalOp:   "0.12",
    ekgOp:      "0.08",
    gridOp:     "0.30",
    glowTopOp:  "0.08",
    text:       "#0d1117",
    dim:        "#4a5568",
    faint:      "#718096",
    line:       "#cbd5e0",
    headStart:  "#0d1117",
    headEnd:    "#2d3748",
    frameOp:    "0.18",
  },
};

// ── SVG template ──────────────────────────────────────────────────────────────
function buildSvg(C) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.bgTop}"/>
      <stop offset="1" stop-color="${C.bgBot}"/>
    </linearGradient>
    <radialGradient id="glowTop" cx="50%" cy="0%" r="60%">
      <stop offset="0" stop-color="${C.signal}" stop-opacity="${C.glowTopOp}"/>
      <stop offset="1" stop-color="${C.signal}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowLogo" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${C.signal}" stop-opacity="${C.signalOp}"/>
      <stop offset="0.6" stop-color="${C.signal}" stop-opacity="0.06"/>
      <stop offset="1" stop-color="${C.signal}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="head" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.25" stop-color="${C.headStart}"/>
      <stop offset="1"    stop-color="${C.headEnd}"/>
    </linearGradient>
    <pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse">
      <path d="M56 0H0V56" fill="none" stroke="${C.line}" stroke-width="1" stroke-opacity="0.5"/>
    </pattern>
  </defs>

  <!-- base -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)" opacity="${C.gridOp}"/>
  <rect width="${W}" height="${H}" fill="url(#glowTop)"/>

  <!-- faint EKG echo -->
  <path d="${ekg}" fill="none" stroke="${C.signal}" stroke-opacity="${C.ekgOp}"
        stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- glow behind the logo -->
  <circle cx="965" cy="315" r="230" fill="url(#glowLogo)"/>

  <!-- inset frame -->
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none"
        stroke="${C.line}" stroke-width="1"/>
  <rect x="20" y="20" width="${W - 40}" height="${H - 40}" rx="18" fill="none"
        stroke="${C.signal}" stroke-opacity="${C.frameOp}" stroke-width="1.5"/>

  <!-- brand wordmark -->
  <text x="156" y="118" font-family="${DISPLAY_SB}" font-size="36"
        fill="${C.text}" letter-spacing="-0.5">OpenAlive</text>

  <!-- eyebrow -->
  <text x="86" y="232" font-family="${MONO}" font-size="22"
        fill="${C.signal}" letter-spacing="3">FOR WINDOWS 10 &amp; 11</text>

  <!-- headline -->
  <text x="80" y="330" font-family="${DISPLAY}" font-size="96"
        fill="url(#head)" letter-spacing="-3">Keep your</text>
  <text x="80" y="430" font-family="${DISPLAY}" font-size="96"
        fill="url(#head)" letter-spacing="-3">PC alive.</text>

  <!-- meta line -->
  <text x="86" y="520" font-family="${MONO}" font-size="24" fill="${C.dim}" xml:space="preserve"><tspan>No admin rights</tspan><tspan fill="${C.signal}">   ·   </tspan><tspan>~4 MB</tspan><tspan fill="${C.signal}">   ·   </tspan><tspan>Open source</tspan></text>

  <!-- url -->
  <text x="${W - 40}" y="${H - 36}" text-anchor="end" font-family="${MONO}"
        font-size="22" fill="${C.faint}">opn-build.github.io</text>
</svg>`;
}

// ── Generate ──────────────────────────────────────────────────────────────────
const iconPath = join(root, "src", "assets", "icono.png");

const LOGO = 300;
const MARK = 58;

async function generate(themeName, outFile) {
  const C    = THEMES[themeName];
  const svg  = buildSvg(C);
  const logo = await sharp(iconPath).resize(LOGO, LOGO).png().toBuffer();
  const mark = await sharp(iconPath).resize(MARK, MARK).png().toBuffer();

  await sharp(Buffer.from(svg))
    .composite([
      { input: logo, left: 965 - LOGO / 2, top: 315 - LOGO / 2 },
      { input: mark, left: 80, top: 72 },
    ])
    .png()
    .toFile(outFile);

  const meta = await sharp(outFile).metadata();
  console.log(`✓ ${outFile.split("/").pop()} (${themeName}) — ${meta.width}×${meta.height}`);
}

await generate("dark",  join(root, "public", "og-image.png"));
await generate("light", join(root, "public", "og-image-light.png"));
