/* OpenAlive — client-side release refresh.
 * The build bakes the latest release into the HTML. This script re-checks the
 * GitHub API and, ONLY if a newer version shipped since the last deploy, updates
 * the download button and metadata in place. Any failure leaves the baked
 * values untouched — the page is fully functional without this script.
 */
(function () {
  "use strict";

  var repo = meta("oa:repo");
  var bakedVersion = meta("oa:version");
  if (!repo) return;

  fetch("https://api.github.com/repos/" + repo + "/releases/latest", {
    headers: { Accept: "application/vnd.github+json" },
  })
    .then(function (r) {
      if (!r.ok) throw new Error("api " + r.status);
      return r.json();
    })
    .then(function (rel) {
      var version = normalize(rel.tag_name);
      // Only move forward — never downgrade what the build already baked.
      if (!version || compare(version, bakedVersion) <= 0) return;

      var asset = pickInstaller(rel.assets);
      if (!asset) return;

      setAttr("[data-oa-download]", "href", asset.browser_download_url);
      setText("[data-oa-version]", version);
      setText("[data-oa-size]", formatSize(asset.size));
      setText("[data-oa-disk]", formatSize(asset.size * 1.7));
      setText("[data-oa-asset]", asset.name);
      setText("[data-oa-date]", formatDate(rel.published_at));

      var portable = pickPortable(rel.assets);
      if (portable) {
        setAttr("[data-oa-portable]", "href", portable.browser_download_url);
      }
    })
    .catch(function () {
      /* keep baked values */
    });

  function meta(name) {
    var el = document.querySelector('meta[name="' + name + '"]');
    return el ? el.getAttribute("content") : "";
  }
  function normalize(tag) {
    if (!tag) return "";
    return tag.charAt(0) === "v" ? tag : "v" + tag;
  }
  function compare(a, b) {
    var pa = a.replace(/^v/, "").split(".").map(Number);
    var pb = (b || "").replace(/^v/, "").split(".").map(Number);
    for (var i = 0; i < Math.max(pa.length, pb.length); i++) {
      var x = pa[i] || 0,
        y = pb[i] || 0;
      if (x !== y) return x > y ? 1 : -1;
    }
    return 0;
  }
  function pickInstaller(assets) {
    if (!assets || !assets.length) return null;
    for (var i = 0; i < assets.length; i++) {
      if (/\.exe$/i.test(assets[i].name)) return assets[i];
    }
    return assets[0];
  }
  function pickPortable(assets) {
    if (!assets || !assets.length) return null;
    for (var i = 0; i < assets.length; i++) {
      if (/\.zip$/i.test(assets[i].name)) return assets[i];
    }
    return null;
  }
  function formatSize(bytes) {
    if (!bytes) return "";
    return (bytes / 1048576).toFixed(1) + " MB";
  }
  function formatDate(iso) {
    try {
      return new Intl.DateTimeFormat(document.documentElement.lang, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(iso));
    } catch (e) {
      return iso ? iso.slice(0, 10) : "";
    }
  }
  function setText(sel, value) {
    document.querySelectorAll(sel).forEach(function (el) {
      el.textContent = value;
    });
  }
  function setAttr(sel, attr, value) {
    document.querySelectorAll(sel).forEach(function (el) {
      el.setAttribute(attr, value);
    });
  }
})();
