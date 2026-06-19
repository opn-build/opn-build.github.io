// Generates public/og-image.png (1200×630) — the social share card.
// Reproducible: re-run with `node scripts/generate-og.mjs` if branding changes.
// Renders an SVG (site's dark "signal" language) with sharp, then composites
// the real app logo on top. Requires Bricolage Grotesque installed for text.
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const W = 1200;
const H = 630;

// Palette — mirrors src/styles/global.css
const C = {
  bgTop: "#0c0e12",
  bgBot: "#08090c",
  signal: "#2ee6a0",
  signalDeep: "#128a63",
  text: "#e8eaed",
  dim: "#9aa1ac",
  faint: "#5b626c",
  line: "#20242b",
};

const DISPLAY = "Bricolage Grotesque ExtraBold";
const DISPLAY_SB = "Bricolage Grotesque SemiBold";
const MONO = "DejaVu Sans Mono";

// Faint EKG trace echoing the logo — drawn low-opacity across the lower third.
const ekg =
  "M0 470 H300 l18 -70 l22 150 l18 -110 l14 30 H560 l16 -40 l16 40 H1200";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.bgTop}"/>
      <stop offset="1" stop-color="${C.bgBot}"/>
    </linearGradient>
    <radialGradient id="glowTop" cx="50%" cy="0%" r="60%">
      <stop offset="0" stop-color="${C.signal}" stop-opacity="0.16"/>
      <stop offset="1" stop-color="${C.signal}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowLogo" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${C.signal}" stop-opacity="0.34"/>
      <stop offset="0.6" stop-color="${C.signal}" stop-opacity="0.08"/>
      <stop offset="1" stop-color="${C.signal}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="head" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.25" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#aeb6c0"/>
    </linearGradient>
    <pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse">
      <path d="M56 0H0V56" fill="none" stroke="${C.line}" stroke-width="1" stroke-opacity="0.5"/>
    </pattern>
  </defs>

  <!-- base -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)" opacity="0.45"/>
  <rect width="${W}" height="${H}" fill="url(#glowTop)"/>

  <!-- faint EKG echo -->
  <path d="${ekg}" fill="none" stroke="${C.signal}" stroke-opacity="0.10"
        stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- glow behind the logo -->
  <circle cx="965" cy="315" r="230" fill="url(#glowLogo)"/>

  <!-- inset frame -->
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none"
        stroke="${C.line}" stroke-width="1"/>
  <rect x="20" y="20" width="${W - 40}" height="${H - 40}" rx="18" fill="none"
        stroke="${C.signal}" stroke-opacity="0.12" stroke-width="1.5"/>

  <!-- brand wordmark (icon is composited separately at x=84) -->
  <text x="156" y="118" font-family="${DISPLAY_SB}" font-size="36"
        fill="${C.text}" letter-spacing="-0.5">OpenAlive</text>

  <!-- eyebrow -->
  <text x="86" y="232" font-family="${MONO}" font-size="22"
        fill="${C.signal}" letter-spacing="3">FOR WINDOWS 10 &amp; 11</text>

  <!-- headline -->
  <text x="80" y="330" font-family="${DISPLAY}" font-size="96"
        fill="url(#head)" letter-spacing="-3">Keep your</text>
  <text x="80" y="430" font-family="${DISPLAY}" font-size="96"
        fill="url(#head)" letter-spacing="-3">session alive.</text>

  <!-- meta line -->
  <text x="86" y="520" font-family="${MONO}" font-size="24" fill="${C.dim}" xml:space="preserve"><tspan>No telemetry</tspan><tspan fill="${C.signal}">   ·   </tspan><tspan>8 languages</tspan><tspan fill="${C.signal}">   ·   </tspan><tspan>GPL-3.0</tspan></text>

  <!-- url -->
  <text x="${W - 40}" y="${H - 36}" text-anchor="end" font-family="${MONO}"
        font-size="22" fill="${C.faint}">opn-build.github.io</text>
</svg>`;

const iconPath = join(root, "src", "assets", "icono.png");

const LOGO = 300; // hero logo, right side
const logo = await sharp(iconPath).resize(LOGO, LOGO).png().toBuffer();

const MARK = 58; // brand lockup icon, top-left next to the wordmark
const mark = await sharp(iconPath).resize(MARK, MARK).png().toBuffer();

await sharp(Buffer.from(svg))
  .composite([
    { input: logo, left: 965 - LOGO / 2, top: 315 - LOGO / 2 },
    { input: mark, left: 80, top: 72 },
  ])
  .png()
  .toFile(join(root, "public", "og-image.png"));

const meta = await sharp(join(root, "public", "og-image.png")).metadata();
console.log(`✓ og-image.png written — ${meta.width}×${meta.height}`);
