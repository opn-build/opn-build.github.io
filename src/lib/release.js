// Single source of truth for "latest release" data.
// Used at BUILD TIME (Astro frontmatter) to bake the download into static HTML,
// and mirrored client-side by /scripts/refresh.js for freshness between deploys.

export const RELEASES_REPO = "opn-build/OpenAlive";
export const RELEASES_API = `https://api.github.com/repos/${RELEASES_REPO}/releases/latest`;
export const RELEASES_HTML = `https://github.com/${RELEASES_REPO}/releases`;

// Baked fallback — used if the GitHub API is unreachable during the build.
// Keep this in sync with the most recent known release.
const FALLBACK = {
  version: "v1.2.0.0",
  tag: "v1.2.0.0",
  assetName: "OpenAlive_Setup_v1.2.0.0.exe",
  downloadUrl:
    "https://github.com/opn-build/OpenAlive/releases/download/v1.2.0.0/OpenAlive_Setup_v1.2.0.0.exe",
  sizeBytes: 3928866,
  publishedAt: "2026-06-19T11:11:13Z",
  fromFallback: true,
};

/** Normalize a tag like `1.0.2` or `v1.0.3` to a display version `v1.0.3`. */
export function normalizeVersion(tag) {
  if (!tag) return "";
  return tag.startsWith("v") ? tag : `v${tag}`;
}

/** Pick the Windows installer asset, falling back to the first asset. */
function pickInstaller(assets = []) {
  return (
    assets.find((a) => /\.exe$/i.test(a.name)) || assets[0] || null
  );
}

/** Shape a raw GitHub release payload into the minimal object the UI needs. */
export function shapeRelease(release) {
  const asset = pickInstaller(release.assets);
  if (!asset) return { ...FALLBACK };
  return {
    version: normalizeVersion(release.tag_name),
    tag: release.tag_name,
    assetName: asset.name,
    downloadUrl: asset.browser_download_url,
    sizeBytes: asset.size,
    publishedAt: release.published_at,
    fromFallback: false,
  };
}

/**
 * Build-time fetch of the latest release.
 * Authenticates with GITHUB_TOKEN when present (CI) to dodge the API rate limit.
 * Never throws — returns the baked FALLBACK on any failure so builds stay green.
 */
export async function getLatestRelease() {
  try {
    const headers = { Accept: "application/vnd.github+json" };
    const token = process.env.GITHUB_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(RELEASES_API, { headers });
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const data = await res.json();
    return shapeRelease(data);
  } catch (err) {
    console.warn(
      `[release] Using fallback (${FALLBACK.version}):`,
      err?.message ?? err,
    );
    return { ...FALLBACK };
  }
}

/** Human-readable size, e.g. "15.5 MB". */
export function formatSize(bytes) {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}
