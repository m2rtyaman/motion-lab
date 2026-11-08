/*
 * Injected by scripts/browser-probe.mjs into an ISOLATED WORLD of the rendered composition page (Page.createIsolatedWorld): it shares the DOM with the page
 * but has its own JS globals, so nothing here (no window.__probe, no helper state) can be seen by the Scene. Read as text, evaluated in the browser, never imported.
 * The one thing that needs the page's own JS world (GSAP's timelines) lives in probe-timelines.inject.js and is evaluated as a throw-away expression.
 */
(() => {
  const W = innerWidth, H = innerHeight;
  const cv = document.createElement("canvas");
  cv.width = cv.height = 1;
  const cx = cv.getContext("2d", { willReadFrequently: true });
  const colorCache = new Map();
  /** any CSS color (oklch, color-mix, hsl, ...) -> [r,g,b,a] in sRGB through a canvas */
  const parseColor = (s) => {
    if (colorCache.has(s)) return colorCache.get(s);
    let res = [0, 0, 0, 0];
    try {
      cx.clearRect(0, 0, 1, 1);
      cx.fillStyle = "#000";
      cx.fillStyle = s;
      cx.fillRect(0, 0, 1, 1);
      const d = cx.getImageData(0, 0, 1, 1).data;
      const a = d[3] / 255; // premultiplied -> straight alpha
      res = a > 0 ? [Math.round(d[0] / a), Math.round(d[1] / a), Math.round(d[2] / a), a] : [0, 0, 0, 0];
    } catch { /* keep transparent */ }
    colorCache.set(s, res);
    return res;
  };
  const csOf = (n) => getComputedStyle(n);

  /** Product of every `opacity(x)` in a CSS filter list (filter: opacity(0) hides an element without touching `opacity`). */
  const filterOpacity = (cs) => {
    let f = 1;
    const re = /opacity\(\s*([\d.]+)(%?)\s*\)/g;
    for (let m = re.exec(cs.filter || ""); m; m = re.exec(cs.filter || "")) f *= m[2] ? parseFloat(m[1]) / 100 : parseFloat(m[1]);
    return Math.max(0, Math.min(1, Number.isFinite(f) ? f : 1));
  };
  /** Share of the box left visible by clip-path (inset / circle / ellipse / polygon); 1 for none or anything unparsed. */
  const clipPathFrac = (cs, w, h) => {
    const cp = cs.clipPath;
    if (!cp || cp === "none" || w <= 0 || h <= 0) return 1;
    const len = (v, ref) => (/%$/.test(v) ? (parseFloat(v) / 100) * ref : parseFloat(v) || 0);
    let m = cp.match(/^inset\(([^)]*)\)/);
    if (m) {
      const p = m[1].split(/\sround\s/)[0].trim().split(/\s+/);
      const [t, r, b, l] = p.length === 1 ? [p[0], p[0], p[0], p[0]] : p.length === 2 ? [p[0], p[1], p[0], p[1]] : p.length === 3 ? [p[0], p[1], p[2], p[1]] : p;
      return Math.max(0, 1 - (len(l, w) + len(r, w)) / w) * Math.max(0, 1 - (len(t, h) + len(b, h)) / h);
    }
    m = cp.match(/^circle\(\s*([^\s)]+)/);
    if (m) { const R = /%$/.test(m[1]) ? (parseFloat(m[1]) / 100) * Math.sqrt((w * w + h * h) / 2) : parseFloat(m[1]) || 0; return Math.min(1, (Math.PI * R * R) / (w * h)); }
    m = cp.match(/^ellipse\(\s*([^\s)]+)\s+([^\s)]+)/);
    if (m) return Math.min(1, (Math.PI * len(m[1], w) * len(m[2], h)) / (w * h));
    m = cp.match(/^polygon\(([^)]*)\)/);
    if (m) {
      const pts = m[1].split(",").map((s) => s.trim()).filter((s) => !/^(nonzero|evenodd)$/.test(s)).map((s) => { const [a, b] = s.split(/\s+/); return [len(a, w), len(b, h)]; });
      let a2 = 0;
      for (let i = 0; i < pts.length; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length]; a2 += x1 * y2 - x2 * y1; }
      return Math.min(1, Math.abs(a2) / 2 / (w * h));
    }
    return 1;
  };
  /** Everything about an element's own and inherited CSS that can hide it: opacity x filter:opacity(), display, visibility, content-visibility, blend mode. */
  const effective = (el) => {
    let op = 1, hidden = null, blend = false;
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const cs = csOf(n);
      if (cs.display === "none") { hidden = n === el ? "display:none" : "display:none on ancestor"; break; }
      if (cs.contentVisibility === "hidden") { hidden = n === el ? "content-visibility:hidden" : "content-visibility:hidden on ancestor"; break; }
      if (n === el && (cs.visibility === "hidden" || cs.visibility === "collapse")) hidden = "visibility:hidden";
      const o = parseFloat(cs.opacity);
      if (Number.isFinite(o)) op *= o;
      op *= filterOpacity(cs);
      if (cs.mixBlendMode && cs.mixBlendMode !== "normal") blend = true;
    }
    return { op, hidden, blend };
  };
  const hasTransform = (cs) => (cs.transform && cs.transform !== "none") || (cs.filter && cs.filter !== "none") || (cs.willChange && /transform/.test(cs.willChange)) || /paint|layout|strict|content/.test(cs.contain || "");
  /** rect intersected with every overflow-clipping ancestor that really contains it, then with the viewport */
  const clipped = (el, r) => {
    let c = { l: r.left, t: r.top, r: r.right, b: r.bottom };
    let curPos = csOf(el).position;
    for (let n = el.parentElement; n && n !== document.body && n !== document.documentElement; n = n.parentElement) {
      const cs = csOf(n), pos = cs.position;
      const clips = cs.overflowX !== "visible" || cs.overflowY !== "visible";
      const skip = curPos === "fixed" || (curPos === "absolute" && pos === "static" && !hasTransform(cs));
      if (clips && !skip) {
        const nr = n.getBoundingClientRect();
        if (cs.overflowX !== "visible") { c.l = Math.max(c.l, nr.left); c.r = Math.min(c.r, nr.right); }
        if (cs.overflowY !== "visible") { c.t = Math.max(c.t, nr.top); c.b = Math.min(c.b, nr.bottom); }
      }
      if (!skip) curPos = pos === "static" && curPos !== "static" ? curPos : pos;
    }
    c.l = Math.max(c.l, 0); c.t = Math.max(c.t, 0); c.r = Math.min(c.r, W); c.b = Math.min(c.b, H);
    return c;
  };
  const area = (c) => Math.max(0, c.r - c.l) * Math.max(0, c.b - c.t);
  /** product of the clip-path fractions of the element and its ancestors */
  const clipFracOf = (el, r) => {
    let f = 1;
    for (let n = el; n && n.nodeType === 1 && n !== document.documentElement; n = n.parentElement) {
      const cs = csOf(n);
      if (cs.clipPath && cs.clipPath !== "none") { const nr = n === el ? r : n.getBoundingClientRect(); f *= clipPathFrac(cs, nr.width, nr.height); }
    }
    return f;
  };

  /* ---- SVG: a shape with fill:none and no stroke paints nothing ---- */
  const SVG_SHAPE = /^(path|rect|circle|ellipse|line|polyline|polygon|text|tspan|image)$/i;
  const shapePaints = (n) => {
    const cs = csOf(n);
    if (/^image$/i.test(n.tagName)) return true;
    const fillOn = cs.fill !== "none" && parseFloat(cs.fillOpacity) > 0.02 && parseColor(cs.fill)[3] > 0.02;
    const strokeOn = cs.stroke !== "none" && (parseFloat(cs.strokeWidth) || 0) > 0 && parseFloat(cs.strokeOpacity) > 0.02 && parseColor(cs.stroke)[3] > 0.02;
    return fillOn || strokeOn;
  };
  /** null when the element is not SVG or paints; else a reason string */
  const svgUnpainted = (el) => {
    const t = el.tagName;
    if (!(el instanceof SVGElement)) return null;
    if (SVG_SHAPE.test(t)) return shapePaints(el) ? null : "svg fill/stroke none";
    if (/^(svg|g|defs|symbol|use|a)$/i.test(t)) {
      const shapes = [...el.querySelectorAll("path,rect,circle,ellipse,line,polyline,polygon,text,tspan,image")];
      if (shapes.length && !shapes.some(shapePaints)) return "svg fill/stroke none";
    }
    return null;
  };

  /* ---- what an element paints over the things below it (for occlusion): opacity, alpha, cumulative ---- */
  const coverAlpha = (e) => {
    const cs = csOf(e);
    if (cs.visibility === "hidden") return 0;
    const { op, hidden } = effective(e);
    if (hidden || op <= 0.01) return 0;
    const svg = svgUnpainted(e);
    if (svg) return 0;
    let a = parseColor(cs.backgroundColor)[3];
    if (cs.backgroundImage !== "none") a = Math.max(a, 0.9);
    if (/^(img|svg|canvas|video|picture|iframe|path|rect|circle|ellipse|polygon)$/i.test(e.tagName) && !(e instanceof SVGElement && !shapePaints(e))) a = Math.max(a, 1);
    if (a < 0.5) for (const ch of e.childNodes) if (ch.nodeType === 3 && ch.textContent.trim()) { a = Math.max(a, 0.5); break; }
    return Math.min(1, op * a);
  };
  /** mean cumulative alpha (0..1) of everything painted above `el` over a 3x3 grid inside rect c: five 20% overlays count as ~67%, not as nothing */
  const coveredFraction = (el, c) => {
    const w = c.r - c.l, h = c.b - c.t;
    if (w <= 0 || h <= 0) return 1;
    let sum = 0, n = 0;
    for (const fy of [0.2, 0.5, 0.8]) for (const fx of [0.2, 0.5, 0.8]) {
      n++;
      const stack = document.elementsFromPoint(c.l + w * fx, c.t + h * fy);
      let keep = 1;
      for (const e of stack) {
        if (e === el || el.contains(e)) break;
        if (e.contains(el)) continue; // an ancestor sits below its descendants
        keep *= 1 - coverAlpha(e);
      }
      sum += 1 - keep;
    }
    return sum / n;
  };
  const angleOf = (el) => {
    const t = csOf(el).transform;
    if (!t || t === "none") return 0;
    const m = t.match(/matrix\(([^)]+)\)/);
    if (!m) return 0;
    const p = m[1].split(",").map(Number);
    return (Math.atan2(p[1], p[0]) * 180) / Math.PI;
  };
  const hint = (el) => {
    const cls = typeof el.className === "string" ? el.className.trim().split(/\s+/).filter(Boolean).slice(0, 3).map((c) => `.${c}`).join("") : "";
    return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}${cls}`;
  };

  /** pointer-events:none elements are skipped by elementsFromPoint: force them on while measuring, then take the style tag away again (the page DOM stays pristine) */
  const withPointerEvents = (fn) => {
    const st = document.createElement("style");
    st.textContent = "*{pointer-events:auto !important}";
    document.head.appendChild(st);
    try { return fn(); } finally { st.remove(); }
  };

  const MIN_VISIBLE_AREA = 4; // px^2: scale(0.01) leaves a speck, not a visible element
  const inspect = (el, i, nested) => {
    const { op, hidden, blend } = effective(el);
    const r = el.getBoundingClientRect();
    const out = { i, rect: [r.left, r.top, r.width, r.height].map((v) => Math.round(v * 10) / 10), op: Math.round(op * 1000) / 1000, ang: Math.round(angleOf(el) * 10) / 10, reason: hidden, visFrac: 0, covered: 0, vis: false, pix: false };
    if (hidden) return out;
    if (op < 0.05) { out.reason = "opacity~0"; return out; }
    const sv = svgUnpainted(el);
    if (sv) { out.reason = sv; return out; }
    if (r.width < 0.5 || r.height < 0.5 || r.width * r.height < MIN_VISIBLE_AREA) {
      // a zero-size wrapper (children are absolutely positioned) is visible when any descendant is
      if (!nested) {
        const kids = el.querySelectorAll("*");
        for (let k = 0; k < kids.length && k < 250; k++) {
          const m = inspect(kids[k], -1, true);
          if (m.vis || m.pix) { out.vis = m.vis; out.pix = m.pix; out.reason = m.vis ? null : m.reason; out.viaDescendant = true; out.visFrac = m.visFrac; out.covered = m.covered; out.op = Math.min(out.op, m.op); return out; }
        }
      }
      out.reason = "zero-size or scaled to ~0";
      return out;
    }
    const c = clipped(el, r);
    const rectArea = r.width * r.height;
    const cf = clipFracOf(el, r);
    out.visFrac = Math.round((area(c) / rectArea) * cf * 1000) / 1000;
    if (area(c) <= 0) { out.reason = "outside viewport/overflow clip"; return out; }
    if (cf < 0.02) { out.reason = "clip-path hides it"; return out; }
    out.clip = [c.l, c.t, c.r - c.l, c.b - c.t].map((v) => Math.round(v * 10) / 10);
    out.covered = Math.round(coveredFraction(el, c) * 100) / 100;
    if (out.covered >= 0.98) { out.reason = "covered by another element"; out.pix = true; return out; }
    out.vis = out.visFrac * (1 - out.covered) >= 0.1;
    if (!out.vis) { out.reason = out.visFrac < 0.1 ? "mostly clipped" : "mostly covered"; if (out.visFrac >= 0.1) out.pix = true; }
    if (blend && out.vis) { out.vis = false; out.pix = true; out.reason = "mix-blend-mode: paint cannot be verified from the DOM"; }
    return out;
  };

  const sample = (selectors) => withPointerEvents(() => {
    const res = {};
    for (const sel of selectors) {
      let list = [];
      try { list = [...document.querySelectorAll(sel)]; } catch { /* invalid selector */ }
      res[sel] = { count: list.length, m: list.slice(0, 12).map((el, i) => inspect(el, i, false)) };
    }
    return res;
  });

  /** union box of the element(s) and descendants, clipped; null when nothing of it is on screen */
  const unionRect = (els) => {
    let u = null;
    for (const el of els) {
      const all = [el, ...[...el.querySelectorAll("*")].slice(0, 400)];
      for (const n of all) {
        const r = n.getBoundingClientRect();
        if (r.width < 0.5 || r.height < 0.5 || effective(n).hidden) continue;
        const c = clipped(n, r);
        if (area(c) <= 0) continue;
        u = u ? { l: Math.min(u.l, c.l), t: Math.min(u.t, c.t), r: Math.max(u.r, c.r), b: Math.max(u.b, c.b) } : c;
      }
    }
    return u ? [u.l, u.t, u.r - u.l, u.b - u.t] : null;
  };
  const union = (sel) => {
    let list = [];
    try { list = [...document.querySelectorAll(sel)].slice(0, 12); } catch { /* ignore */ }
    return unionRect(list);
  };

  /** CSS `zoom` multiplies the painted size but not getComputedStyle().fontSize: the on-screen size is fontSize x every ancestor's zoom. */
  const zoomOf = (el) => {
    let z = 1;
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const v = parseFloat(csOf(e).zoom); if (v > 0 && Number.isFinite(v)) z *= v; }
    return z;
  };
  let lastTexts = []; // elements of the last texts() call, by index
  const texts = () => withPointerEvents(() => {
    const out = [];
    lastTexts = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n && out.length < 160; n = walker.nextNode()) {
      const text = n.textContent.replace(/\s+/g, " ").trim();
      const p = n.parentElement;
      if (!text || !p || /^(script|style|noscript|title)$/i.test(p.tagName)) continue;
      const { op, hidden, blend } = effective(p);
      if (hidden || op < 0.05) continue;
      if (p instanceof SVGElement && svgUnpainted(p)) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      const r = range.getBoundingClientRect();
      if (r.width < 0.5 || r.height < 0.5) continue;
      const c = clipped(p, r);
      const frac = (area(c) / (r.width * r.height)) * clipFracOf(p, r);
      if (frac < 0.05) continue;
      const cs = csOf(p);
      const fill = cs.webkitTextFillColor && cs.webkitTextFillColor !== cs.color ? cs.webkitTextFillColor : cs.color;
      const col = parseColor(fill);
      const cov = coveredFraction(p, c);
      if (cov >= 0.9) continue;
      out.push({
        i: out.length, text: text.slice(0, 160), tag: hint(p), fontSize: Math.round(parseFloat(cs.fontSize) * zoomOf(p) * 10) / 10,
        color: [col[0], col[1], col[2], Math.round(col[3] * op * 1000) / 1000], op: Math.round(op * 1000) / 1000,
        rect: [r.left, r.top, r.width, r.height].map((v) => Math.round(v * 10) / 10),
        crect: [c.l, c.t, c.r - c.l, c.b - c.t].map((v) => Math.round(v * 10) / 10),
        visFrac: Math.round(frac * 1000) / 1000, covered: Math.round(cov * 100) / 100, blend,
        clippedByViewport: r.left < -2 || r.top < -2 || r.right > W + 2 || r.bottom > H + 2,
      });
      lastTexts.push({ el: p, rect: out[out.length - 1].crect });
    }
    return out;
  });

  /**
   * Paint-check plan. items: [{ k: "t", i }] (a text from the last texts() call) | [{ k: "s", sel }] (every element matching a selector, with descendants).
   * Returns the on-screen rectangle of each item and a partition into groups of items that do not contain one another: hiding one group at a time and diffing the
   * screenshots then tells, per item, what it really paints (pixels), including overlays above it, blend modes, clip-paths and colour-on-colour text.
   */
  let planItems = [];
  const plan = (items) => withPointerEvents(() => {
    planItems = items.map((it) => {
      if (it.k === "t") { const t = lastTexts[it.i]; return { it, els: t ? [t.el] : [], rect: t ? t.rect : null, text: true }; }
      let els = [];
      try { els = [...document.querySelectorAll(it.sel)].slice(0, 12); } catch { /* ignore */ }
      return { it, els, rect: els.length ? unionRect(els) : null, text: false };
    });
    const related = (a, b) => a.els.some((x) => b.els.some((y) => x === y || x.contains(y) || y.contains(x)));
    const groups = [];
    planItems.forEach((p, idx) => {
      if (!p.rect) return;
      const g = groups.find((grp) => !grp.some((j) => related(planItems[j], p)));
      if (g) g.push(idx); else groups.push([idx]);
    });
    return { rects: planItems.map((p) => p.rect), groups, texts: planItems.map((p) => p.text), bgSized: planItems.map((p) => (p.rect ? (p.rect[2] * p.rect[3]) / (W * H) : 0)) };
  });
  const saved = new Map();
  const setHidden = (el, on, textOnly) => {
    const props = textOnly
      ? [["-webkit-text-fill-color", "transparent"], ["color", "transparent"], ["text-shadow", "none"], ["-webkit-text-stroke", "0"], ["text-decoration-color", "transparent"], ...(csOf(el).webkitBackgroundClip === "text" || csOf(el).backgroundClip === "text" ? [["background-image", "none"]] : [])]
      : [["opacity", "0"]];
    for (const [k, v] of props) {
      const key = `${k}`;
      if (on) {
        if (!saved.has(el)) saved.set(el, new Map());
        const m = saved.get(el);
        if (!m.has(key)) m.set(key, [el.style.getPropertyValue(k), el.style.getPropertyPriority(k)]);
        el.style.setProperty(k, v, "important");
      } else if (saved.has(el) && saved.get(el).has(key)) {
        const [old, pr] = saved.get(el).get(key);
        old ? el.style.setProperty(k, old, pr) : el.style.removeProperty(k);
        saved.get(el).delete(key);
        if (!saved.get(el).size) saved.delete(el);
      }
    }
  };
  /** hide (on) / restore (off) the elements of the given plan items: whole element (opacity 0) for targets, only the glyphs (transparent fill) for texts */
  const hideItems = (idxs, on) => {
    for (const idx of idxs) {
      const p = planItems[idx];
      if (!p) continue;
      for (const el of p.els) {
        if (p.text) {
          setHidden(el, on, true);
          for (const d of el.querySelectorAll("*")) setHidden(d, on, true); // children inherit the fill but may set their own colour
        } else setHidden(el, on, false);
      }
    }
    return true;
  };
  /** old API (kept for the focal contrast step): hide/restore all elements of a selector */
  const hide = (sel, on) => {
    let list = [];
    try { list = [...document.querySelectorAll(sel)]; } catch { /* ignore */ }
    for (const el of list) setHidden(el, on, false);
    return list.length;
  };

  /** the visible text of the first element matching sel (for text-change behavior checks), with whether the element is really visible */
  const readText = (sel) => withPointerEvents(() => {
    let el = null;
    try { el = document.querySelector(sel); } catch { /* ignore */ }
    if (!el) return { text: null, vis: false };
    const m = inspect(el, 0, false);
    return { text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 200), vis: m.vis };
  });

  /** for each selector: the other selectors whose elements contain all of its elements (it is a part of that animated target) */
  const nesting = (selectors) => {
    const els = {};
    for (const sel of selectors) { try { els[sel] = [...document.querySelectorAll(sel)].slice(0, 12); } catch { els[sel] = []; } }
    const res = {};
    for (const a of selectors) res[a] = els[a].length ? selectors.filter((b) => b !== a && els[b].length && els[a].every((x) => els[b].some((y) => y !== x && y.contains(x)))) : [];
    return res;
  };

  /** a CSS path (body > :nth-child chain) to the deepest element whose text equals `text` (compared without punctuation/case), preferring a visible one; null when none */
  const normT = (t) => String(t).toLowerCase().replace(/[‘’“”]/g, "'").replace(/[.,!?;:"'`]/g, "").replace(/\s+/g, " ").trim();
  const pathOf = (el) => {
    const parts = [];
    for (let n = el; n && n !== document.body && n.nodeType === 1; n = n.parentElement) parts.unshift(`${n.tagName.toLowerCase()}:nth-child(${[...n.parentElement.children].indexOf(n) + 1})`);
    return `body > ${parts.join(" > ")}`;
  };
  const findByText = (text) => withPointerEvents(() => {
    const want = normT(text);
    const hits = [...document.body.querySelectorAll("*")].filter((el) => normT(el.textContent) === want && ![...el.children].some((c) => normT(c.textContent) === want));
    const vis = hits.find((el) => inspect(el, 0, false).vis);
    const pick = vis ?? hits[0];
    return pick ? pathOf(pick) : null;
  });

  globalThis.__probe = { nesting, findByText, sample, texts, union, plan, hideItems, hide, readText, size: [W, H] };
})();
