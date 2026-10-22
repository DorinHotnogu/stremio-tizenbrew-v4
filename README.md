# stremio-tizenbrew-v4

[TizenBrew](https://github.com/reisxd/TizenBrew) module that loads the **Stremio v4 web shell** (`https://app.strem.io/shell-v4.4/`) and injects small polyfills (`Object.values/entries`, `Promise.prototype.finally`, `Array.prototype.flat`, `String.prototype.padStart`, …) before the page runs, so it works on 2017–2018 Samsung TVs (Tizen 3.0/4.0) whose Chromium is too old for the current Stremio bundle.

Install in TizenBrew: **Add module → GitHub → `DorinHotnogu/stremio-tizenbrew-v4`**.

A small on-screen bar shows the user agent for a few seconds; JavaScript errors (if any) stay on screen until you press BACK.

Not affiliated with Stremio. The module contains no Stremio code.
