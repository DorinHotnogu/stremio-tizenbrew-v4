/* Polyfills for Stremio v4 shell on old Tizen Chromium (M47/M56). ES5 only — this file must parse on the TV itself. */
(function () {
  'use strict';

  // ---- Object.values / entries / fromEntries (Chromium 54+) ----
  if (!Object.values) {
    Object.values = function (o) {
      var out = [];
      for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) out.push(o[k]);
      return out;
    };
  }
  if (!Object.entries) {
    Object.entries = function (o) {
      var out = [];
      for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) out.push([k, o[k]]);
      return out;
    };
  }
  if (!Object.fromEntries) {
    Object.fromEntries = function (iter) {
      var o = {};
      var arr = Array.isArray(iter) ? iter : Array.from(iter);
      for (var i = 0; i < arr.length; i++) o[arr[i][0]] = arr[i][1];
      return o;
    };
  }

  // ---- Promise.prototype.finally (Chromium 63+) ----
  if (typeof Promise !== 'undefined' && !Promise.prototype['finally']) {
    Promise.prototype['finally'] = function (cb) {
      var P = this.constructor || Promise;
      return this.then(
        function (v) { return P.resolve(cb()).then(function () { return v; }); },
        function (e) { return P.resolve(cb()).then(function () { throw e; }); }
      );
    };
  }

  // ---- Array.prototype.includes / flat / flatMap ----
  if (!Array.prototype.includes) {
    Array.prototype.includes = function (x) { return this.indexOf(x) !== -1; };
  }
  if (!Array.prototype.flat) {
    Array.prototype.flat = function (depth) {
      depth = depth === undefined ? 1 : depth;
      var out = [];
      (function go(a, d) {
        for (var i = 0; i < a.length; i++) {
          if (Array.isArray(a[i]) && d > 0) go(a[i], d - 1); else out.push(a[i]);
        }
      })(this, depth);
      return out;
    };
  }
  if (!Array.prototype.flatMap) {
    Array.prototype.flatMap = function (fn, thisArg) { return this.map(fn, thisArg).flat(1); };
  }

  // ---- String padStart / padEnd ----
  function pad(str, len, fill, start) {
    str = String(str); fill = fill === undefined ? ' ' : String(fill);
    if (str.length >= len || fill === '') return str;
    var p = ''; while (p.length < len - str.length) p += fill;
    p = p.slice(0, len - str.length);
    return start ? p + str : str + p;
  }
  if (!String.prototype.padStart) String.prototype.padStart = function (l, f) { return pad(this, l, f, true); };
  if (!String.prototype.padEnd) String.prototype.padEnd = function (l, f) { return pad(this, l, f, false); };

  // ---- misc globals ----
  if (typeof globalThis === 'undefined') { try { window.globalThis = window; } catch (e) {} }
  if (!Number.isInteger) Number.isInteger = function (v) { return typeof v === 'number' && isFinite(v) && Math.floor(v) === v; };

  // ---- on-screen diagnostics: UA for 12s, first JS errors stay until BACK/RETURN ----
  function overlay() {
    var box = document.getElementById('__tb_diag');
    if (box) return box;
    box = document.createElement('div');
    box.id = '__tb_diag';
    box.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:2147483647;background:rgba(0,0,0,.85);color:#fff;' +
      'font:16px/1.3 monospace;padding:8px 14px;max-height:45%;overflow:hidden;white-space:pre-wrap;word-break:break-all;';
    (document.body || document.documentElement).appendChild(box);
    return box;
  }
  function show(msg, sticky) {
    try {
      var b = overlay();
      b.textContent += (b.textContent ? '\n' : '') + msg;
      if (!sticky) setTimeout(function () { if (b.parentNode && !b.getAttribute('data-sticky')) b.parentNode.removeChild(b); }, 12000);
      else b.setAttribute('data-sticky', '1');
    } catch (e) {}
  }
  var errors = 0;
  window.addEventListener('error', function (ev) {
    if (!ev || !ev.message) return; // resource load errors (img/css) are not JS errors
    if (errors++ > 5) return;
    var e = ev.error;
    show('JS ERROR: ' + (ev.message || e) + '\n  at ' + (ev.filename || '?') + ':' + ev.lineno + ':' + ev.colno +
      (e && e.stack ? '\n  ' + String(e.stack).split('\n').slice(0, 3).join('\n  ') : ''), true);
  }, true);
  window.addEventListener('unhandledrejection', function (ev) {
    if (errors++ > 5) return;
    var r = ev.reason;
    show('UNHANDLED PROMISE: ' + (r && r.message ? r.message : r), true);
  });
  window.addEventListener('keydown', function (ev) {
    if (ev.keyCode === 10009 || ev.keyCode === 27 || ev.keyCode === 8) { // Tizen RETURN / Esc / Backspace
      var b = document.getElementById('__tb_diag'); if (b && b.parentNode) b.parentNode.removeChild(b);
    }
  }, true);
  function ready() { show('Stremio v4 + polyfills | ' + navigator.userAgent, false); }
  if (document.body) ready(); else document.addEventListener('DOMContentLoaded', ready);
})();
