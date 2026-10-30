/* Physics playground (easter eggs).
   Find it: the faded 🍎 in the footer, or type a secret word anywhere on the page:
     gravity · zerog · flip · slippery · spin · reset (or press Esc)
   Only on the main pages (not inside the labs). Reloading the page also resets everything. */
(function () {
  "use strict";
  var G = 2200;                       // px/s² — feels like real gravity on a screen
  var E = {                           // playground state
    on: false, g: 0, friction: true, bodies: [], stage: null, raf: 0, last: 0,
    spin: false, angle: 0, omega: 0, spinDrag: null, hidden: []
  };

  // ---------- styles ----------
  var css = document.createElement("style");
  css.textContent =
    ".egg-apple{background:none;border:0;cursor:pointer;font-size:18px;opacity:.28;padding:4px 6px;border-radius:6px;transition:opacity .2s}" +
    ".egg-apple:hover,.egg-apple:focus-visible{opacity:1}" +
    ".egg-panel{position:fixed;right:16px;bottom:16px;z-index:10001;background:var(--panel,#fff);color:var(--ink,#15232b);border:1px solid var(--line,#c4d3cc);" +
    "border-radius:12px;padding:14px 16px;box-shadow:0 10px 30px rgba(0,0,0,.18);width:min(320px,calc(100vw - 32px));font-size:.95rem}" +
    ".egg-panel h2{margin:0 0 4px;font-size:1.1rem}.egg-panel p{margin:0 0 10px;color:var(--muted,#56666e)}" +
    ".egg-panel .egg-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}" +
    ".egg-panel button{font:inherit;font-weight:700;border:2px solid var(--ink,#15232b);background:transparent;color:var(--ink,#15232b);border-radius:8px;padding:6px 8px;cursor:pointer}" +
    ".egg-panel button[aria-pressed=true]{background:var(--ink,#15232b);color:var(--panel,#fff)}" +
    ".egg-panel .egg-x{position:absolute;top:6px;right:8px;border:0;font-size:18px;padding:2px 6px}" +
    ".egg-panel code{background:var(--tint,#f3f7f5);padding:0 4px;border-radius:4px}" +
    ".egg-stage{position:absolute;z-index:9000;pointer-events:none;overflow:hidden}" +
    ".egg-body{position:absolute;left:0;top:0;margin:0!important;background:var(--panel,#fff);border:1px solid var(--line,#c4d3cc);pointer-events:auto;cursor:grab;touch-action:none;user-select:none;will-change:transform;box-sizing:border-box}" +
    ".egg-body.egg-grab{cursor:grabbing;box-shadow:0 12px 28px rgba(0,0,0,.25)}" +
    ".egg-toast{position:fixed;left:50%;top:16px;transform:translateX(-50%);z-index:10002;background:var(--ink,#15232b);color:var(--panel,#fff);" +
    "padding:8px 16px;border-radius:99px;font-weight:700;pointer-events:none;transition:opacity .4s}" +
    "html.egg-spin,html.egg-spin body{cursor:grab;user-select:none}";
  document.head.appendChild(css);

  function toast(msg) {
    var t = document.createElement("div"); t.className = "egg-toast"; t.setAttribute("role", "status"); t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.style.opacity = "0"; }, 1600);
    setTimeout(function () { t.remove(); }, 2100);
  }

  // ---------- the stage: copies of the page's pieces that can move ----------
  function pieces() {
    var sel = "header.page h1, header.page .lede, main h2, .card, main li, .section-note";
    var all = Array.prototype.slice.call(document.querySelectorAll(sel)), keep = [];
    all.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.width < 20 || r.height < 12) return;
      if (r.bottom < 0 || r.top > window.innerHeight || r.right < 0 || r.left > window.innerWidth) return;
      if (keep.some(function (k) { return k.contains(el) || el.contains(k); })) return;
      keep.push(el);
    });
    return keep.slice(0, 26);
  }
  function startStage() {
    if (E.on) return;
    E.on = true;
    var st = document.createElement("div"); st.className = "egg-stage";
    placeStage(st); document.body.appendChild(st); E.stage = st;
    document.documentElement.style.overflow = "hidden";
    var list = pieces(), W = window.innerWidth, H = window.innerHeight;
    var area = list.reduce(function (t, el) { var r = el.getBoundingClientRect(); return t + r.width * r.height; }, 0);
    var s0 = Math.max(0.28, Math.min(1, Math.sqrt(0.32 * W * H / Math.max(area, 1))));   // pieces fill about a third of the screen
    list.forEach(function (el) {
      var r = el.getBoundingClientRect(), cs = getComputedStyle(el);
      var sc = Math.min(s0, 0.4 * H / r.height, 0.6 * W / r.width), w = r.width * sc, h = r.height * sc;
      var box = document.createElement("div"); box.className = "egg-body"; box.style.width = w + "px"; box.style.height = h + "px";
      box.style.borderRadius = cs.borderRadius === "0px" ? "8px" : cs.borderRadius; box.style.overflow = "hidden";
      var c = el.cloneNode(true); c.removeAttribute("id");
      c.querySelectorAll("[id]").forEach(function (n) { n.removeAttribute("id"); });
      c.style.width = r.width + "px"; c.style.height = r.height + "px"; c.style.margin = "0"; c.style.transformOrigin = "0 0";
      c.style.transform = "scale(" + sc.toFixed(3) + ")"; c.style.pointerEvents = "none";
      c.style.background = cs.backgroundColor === "rgba(0, 0, 0, 0)" ? "var(--panel, #fff)" : cs.backgroundColor;
      c.style.color = cs.color; c.style.font = cs.font; c.style.borderRadius = cs.borderRadius === "0px" ? "8px" : cs.borderRadius;
      if (!el.classList.contains("card")) { c.style.padding = "4px 8px"; c.style.border = "1px solid var(--line, #c4d3cc)"; c.style.listStyle = "none"; }
      box.setAttribute("aria-hidden", "true"); box.appendChild(c);
      st.appendChild(box);
      el.style.visibility = "hidden"; E.hidden.push(el);
      // shrink around the piece's centre
      E.bodies.push({ el: box, x: r.left + (r.width - w) / 2, y: r.top + (r.height - h) / 2, w: w, h: h, vx: 0, vy: 0, m: w * h, drag: null });
    });
    E.last = performance.now(); loop();
  }
  function placeStage(st) {
    st.style.left = window.scrollX + "px"; st.style.top = window.scrollY + "px";
    st.style.width = window.innerWidth + "px"; st.style.height = window.innerHeight + "px";
  }
  function stopStage() {
    if (!E.on) return;
    cancelAnimationFrame(E.raf); E.on = false;
    E.stage.remove(); E.stage = null; E.bodies = [];
    E.hidden.forEach(function (el) { el.style.visibility = ""; }); E.hidden = [];
    document.documentElement.style.overflow = "";
  }

  // ---------- physics ----------
  function loop() {
    var now = performance.now(), dt = Math.min(0.033, (now - E.last) / 1000); E.last = now;
    var steps = 3, h = dt / steps;
    for (var s = 0; s < steps; s++) step(h);
    E.bodies.forEach(function (b) { b.el.style.transform = "translate(" + b.x.toFixed(1) + "px," + b.y.toFixed(1) + "px)"; });
    E.raf = requestAnimationFrame(loop);
  }
  function step(dt) {
    var W = window.innerWidth, H = window.innerHeight, fr = E.friction;
    var e = fr ? 0.45 : 0.97, air = fr ? 0.25 : 0, slide = fr ? 6 : 0;
    E.bodies.forEach(function (b) {
      if (b.drag) return;
      b.vy += E.g * dt;
      var k = Math.exp(-air * dt); b.vx *= k; b.vy *= k;
      b.x += b.vx * dt; b.y += b.vy * dt;
      // walls
      if (b.x < 0) { b.x = 0; if (b.vx < 0) b.vx = -b.vx * e; }
      if (b.x + b.w > W) { b.x = W - b.w; if (b.vx > 0) b.vx = -b.vx * e; }
      if (b.y < 0) { b.y = 0; if (b.vy < 0) b.vy = -b.vy * e; if (E.g < 0) b.vx *= Math.exp(-slide * dt); }
      if (b.y + b.h > H) { b.y = H - b.h; if (b.vy > 0) b.vy = -b.vy * e; if (E.g > 0) b.vx *= Math.exp(-slide * dt); }
      if (Math.abs(b.vy) < 8 && ((E.g > 0 && b.y + b.h >= H - 0.5) || (E.g < 0 && b.y <= 0.5))) b.vy = 0;
    });
    // collisions between rectangles (bigger cards are heavier; a dragged card can't be pushed)
    var B = E.bodies;
    for (var it = 0; it < 4; it++) {
    for (var i = 0; i < B.length; i++) for (var j = i + 1; j < B.length; j++) {
      var a = B[i], c = B[j];
      var ox = Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x); if (ox <= 0) continue;
      var oy = Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y); if (oy <= 0) continue;
      var ia = a.drag ? 0 : 1 / a.m, ic = c.drag ? 0 : 1 / c.m; if (!ia && !ic) continue;
      var nx = 0, ny = 0, pen;
      if (ox < oy) { nx = (a.x + a.w / 2 < c.x + c.w / 2) ? -1 : 1; pen = ox; } else { ny = (a.y + a.h / 2 < c.y + c.h / 2) ? -1 : 1; pen = oy; }
      var tot = ia + ic;
      a.x += nx * pen * ia / tot; a.y += ny * pen * ia / tot;
      c.x -= nx * pen * ic / tot; c.y -= ny * pen * ic / tot;
      var rv = (a.vx - c.vx) * nx + (a.vy - c.vy) * ny;
      if (rv < 0) {
        var jimp = -(1 + e) * rv / tot;
        a.vx += jimp * ia * nx; a.vy += jimp * ia * ny; c.vx -= jimp * ic * nx; c.vy -= jimp * ic * ny;
        if (fr) {                                   // sliding friction between touching pieces
          var tx = -ny, ty = nx, rt = (a.vx - c.vx) * tx + (a.vy - c.vy) * ty, jt = -rt * 0.3 / tot;
          a.vx += jt * ia * tx; a.vy += jt * ia * ty; c.vx -= jt * ic * tx; c.vy -= jt * ic * ty;
        }
      }
    }
    B.forEach(function (b) {                       // keep everything inside the screen after each pass
      if (b.drag) return;
      if (b.x < 0) b.x = 0; if (b.x + b.w > W) b.x = W - b.w;
      if (b.y < 0) b.y = 0; if (b.y + b.h > H) b.y = H - b.h;
    });
    }
  }

  // ---------- grab and fling ----------
  document.addEventListener("pointerdown", function (ev) {
    if (!E.on) return;
    var el = ev.target.closest && ev.target.closest(".egg-body"); if (!el) return;
    var b = E.bodies.find(function (q) { return q.el === el; }); if (!b) return;
    ev.preventDefault(); el.setPointerCapture(ev.pointerId); el.classList.add("egg-grab");
    b.drag = { dx: ev.clientX - b.x, dy: ev.clientY - b.y, t: performance.now(), px: ev.clientX, py: ev.clientY };
    b.vx = b.vy = 0;
  }, true);
  document.addEventListener("pointermove", function (ev) {
    if (E.on) E.bodies.forEach(function (b) {
      if (!b.drag) return;
      var t = performance.now(), dtt = Math.max(0.008, (t - b.drag.t) / 1000);
      var nx = ev.clientX - b.drag.dx, ny = ev.clientY - b.drag.dy;
      b.vx = 0.6 * b.vx + 0.4 * (nx - b.x) / dtt; b.vy = 0.6 * b.vy + 0.4 * (ny - b.y) / dtt;
      b.x = nx; b.y = ny; b.drag.t = t;
    });
    spinMove(ev);
  });
  function endDrag() { E.bodies.forEach(function (b) { if (b.drag) { b.drag = null; b.el.classList.remove("egg-grab"); } }); spinEnd(); }
  document.addEventListener("pointerup", endDrag);
  document.addEventListener("pointercancel", endDrag);
  // links and buttons inside moving pieces don't fire
  document.addEventListener("click", function (ev) { if (ev.target.closest && ev.target.closest(".egg-body")) { ev.preventDefault(); ev.stopPropagation(); } }, true);

  // ---------- spin the whole page ----------
  var spinRaf = 0, spinLast = 0;
  function center() { return { x: window.innerWidth / 2, y: window.innerHeight / 2 }; }
  function applySpin() {
    var de = document.documentElement;
    de.style.transformOrigin = (window.scrollX + window.innerWidth / 2) + "px " + (window.scrollY + window.innerHeight / 2) + "px";
    de.style.transform = E.angle ? "rotate(" + E.angle.toFixed(2) + "deg)" : "";
  }
  document.addEventListener("pointerdown", function (ev) {
    if (!E.spin || ev.button !== 0) return;
    if (ev.target.closest && (ev.target.closest(".egg-body") || ev.target.closest(".egg-panel"))) return;
    var c = center();
    E.spinDrag = { a0: Math.atan2(ev.clientY - c.y, ev.clientX - c.x) * 180 / Math.PI, ang0: E.angle, t: performance.now(), lastA: E.angle, moved: false };
    E.omega = 0;
  });
  function spinMove(ev) {
    if (!E.spinDrag) return;
    var c = center(), a = Math.atan2(ev.clientY - c.y, ev.clientX - c.x) * 180 / Math.PI;
    var d = a - E.spinDrag.a0; if (Math.abs(d) > 2) E.spinDrag.moved = true;
    var newA = E.spinDrag.ang0 + d, t = performance.now(), dtt = Math.max(0.008, (t - E.spinDrag.t) / 1000);
    var dd = newA - E.spinDrag.lastA; if (dd > 180) dd -= 360; if (dd < -180) dd += 360;
    E.omega = 0.6 * E.omega + 0.4 * dd / dtt; E.spinDrag.lastA = newA; E.spinDrag.t = t;
    E.angle = newA; applySpin();
  }
  function spinEnd() {
    if (!E.spinDrag) return;
    var moved = E.spinDrag.moved; E.spinDrag = null;
    if (moved) { spinLast = performance.now(); cancelAnimationFrame(spinRaf); spinRaf = requestAnimationFrame(spinCoast); }
  }
  function spinCoast(now) {
    var dt = Math.min(0.05, (now - spinLast) / 1000); spinLast = now;
    if (E.friction) E.omega *= Math.exp(-1.2 * dt);
    E.angle = (E.angle + E.omega * dt) % 360; applySpin();
    if (Math.abs(E.omega) > 2 && !E.spinDrag) spinRaf = requestAnimationFrame(spinCoast);
  }
  // swallow the click that ends a spin-drag so it doesn't follow a link
  document.addEventListener("click", function (ev) { if (E.spin && E.omega && Math.abs(E.omega) > 5) { ev.preventDefault(); ev.stopPropagation(); } }, true);

  // ---------- modes ----------
  function setGravity(mode) {
    startStage();
    E.g = mode === "down" ? G : mode === "up" ? -G : 0;
    if (mode === "zero") E.bodies.forEach(function (b) { b.vx += (Math.random() - 0.5) * 260; b.vy += (Math.random() - 0.5) * 260 - 60; });
    toast(mode === "down" ? "Gravity on. Grab a card and throw it!" : mode === "up" ? "Gravity reversed!" : "Zero gravity. Everything floats.");
    syncPanel();
  }
  function toggleFriction() {
    E.friction = !E.friction;
    toast(E.friction ? "Friction is back." : "Friction off: nothing slows down.");
    if (!E.friction && E.spin && Math.abs(E.omega) > 2) { cancelAnimationFrame(spinRaf); spinLast = performance.now(); spinRaf = requestAnimationFrame(spinCoast); }
    syncPanel();
  }
  function toggleSpin() {
    E.spin = !E.spin; document.documentElement.classList.toggle("egg-spin", E.spin);
    toast(E.spin ? "Spin mode: click-drag anywhere to spin the page." : "Spin mode off.");
    syncPanel();
  }
  function resetAll() {
    stopStage(); E.g = 0; E.friction = true; E.spin = false; E.omega = 0; E.angle = 0; E.spinDrag = null;
    cancelAnimationFrame(spinRaf); document.documentElement.classList.remove("egg-spin"); applySpin();
    document.documentElement.style.transform = ""; document.documentElement.style.transformOrigin = "";
    syncPanel();
  }

  // ---------- the hidden panel ----------
  var panel = null;
  function openPanel() {
    if (panel) { panel.remove(); panel = null; return; }
    panel = document.createElement("div"); panel.className = "egg-panel"; panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Physics playground");
    panel.innerHTML = '<button class="egg-x" data-egg="close" aria-label="Close">×</button><h2>🍎 Physics playground</h2>' +
      '<p>You found it! Try these, then grab a card and throw it.</p><div class="egg-grid">' +
      '<button data-egg="down">Gravity on</button><button data-egg="zero">Zero gravity</button>' +
      '<button data-egg="up">Reverse gravity</button><button data-egg="friction">Friction off</button>' +
      '<button data-egg="spin">Spin the page</button><button data-egg="reset">Reset</button></div>' +
      '<p style="margin:10px 0 0;font-size:.85rem">Secret words: <code>gravity</code> <code>zerog</code> <code>flip</code> <code>slippery</code> <code>spin</code> <code>reset</code>, or press Esc.</p>';
    document.body.appendChild(panel); syncPanel();
    panel.querySelector("[data-egg=down]").focus();
  }
  function syncPanel() {
    if (!panel) return;
    var q = function (k) { return panel.querySelector("[data-egg=" + k + "]"); };
    q("down").setAttribute("aria-pressed", String(E.on && E.g > 0));
    q("up").setAttribute("aria-pressed", String(E.on && E.g < 0));
    q("zero").setAttribute("aria-pressed", String(E.on && E.g === 0));
    q("friction").setAttribute("aria-pressed", String(!E.friction));
    q("spin").setAttribute("aria-pressed", String(E.spin));
  }
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest && ev.target.closest("[data-egg]"); if (!b) return;
    var k = b.getAttribute("data-egg");
    if (k === "close") { panel.remove(); panel = null; }
    else if (k === "down" || k === "up" || k === "zero") setGravity(k);
    else if (k === "friction") toggleFriction();
    else if (k === "spin") toggleSpin();
    else if (k === "reset") { resetAll(); toast("Everything is back to normal."); }
    else if (k === "apple") openPanel();
  });
  // the faded apple in the footer
  var foot = document.querySelector("footer");
  if (foot) { var ap = document.createElement("button"); ap.className = "egg-apple"; ap.setAttribute("data-egg", "apple"); ap.setAttribute("aria-label", "Physics playground"); ap.title = "?"; ap.textContent = "🍎"; foot.appendChild(ap); }

  // ---------- secret words ----------
  var typed = "";
  var WORDS = { gravity: function () { setGravity("down"); }, zerog: function () { setGravity("zero"); }, flip: function () { setGravity("up"); },
    slippery: toggleFriction, spin: toggleSpin, reset: function () { resetAll(); toast("Everything is back to normal."); } };
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && (E.on || E.spin || E.angle)) { resetAll(); toast("Everything is back to normal."); return; }
    var t = ev.target; if (t && (t.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(t.tagName))) return;
    if (ev.key.length !== 1) return;
    typed = (typed + ev.key.toLowerCase()).slice(-12);
    for (var w in WORDS) if (typed.slice(-w.length) === w) { typed = ""; WORDS[w](); break; }
  });
  window.addEventListener("resize", function () { if (E.stage) placeStage(E.stage); });
})();
