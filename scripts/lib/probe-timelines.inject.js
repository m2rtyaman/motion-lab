/*
 * Evaluated by scripts/browser-probe.mjs in the page's OWN JS world as a throw-away expression `(<this file>)(selectors)` (no global is created):
 * a summary of the browser-side GSAP master timeline and which of the Node selectors its tweens really touch. GSAP installs `window.gsap` itself in the
 * render only after a tween wakes the ticker, so the entry hands the instance over through a `let __mlGsap` script-scope binding (not a window/globalThis property).
 */
(function (selectors) {
  const g = __mlGsap; // a script-scope binding declared by the probe (not a window property)
  if (!g) return { ok: false, reason: "gsap instance not handed over" };
  const hint = (el) => {
    const cls = typeof el.className === "string" ? el.className.trim().split(/\s+/).filter(Boolean).slice(0, 3).map((c) => "." + c).join("") : "";
    return el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + cls;
  };
  const CONTROL = new Set(["ease", "duration", "delay", "data", "id", "paused", "overwrite", "stagger", "repeat", "yoyo", "repeatDelay", "immediateRender", "lazy", "startAt", "runBackwards", "inherit", "keyframes", "defaults", "scrollTrigger", "force3D", "transformOrigin"]);
  let masters = [];
  try { masters = g.globalTimeline.getChildren(false, false, true).filter((t) => t.getChildren); } catch (e) { return { ok: false, reason: "cannot read globalTimeline" }; }
  const leavesOf = (tl) => {
    const leaves = [];
    const walk = (parent, off) => {
      for (const c of parent.getChildren(false, true, true)) {
        const start = off + c.startTime();
        if (c.getChildren) { walk(c, start); continue; }
        leaves.push({ c, start, dur: c.duration(), end: c.vars && c.vars.repeat === -1 ? Infinity : start + c.totalDuration() });
      }
    };
    walk(tl, 0);
    return leaves;
  };
  let best = null;
  for (const m of masters) {
    const l = leavesOf(m);
    if (!best || l.length > best.leaves.length) best = { m, leaves: l };
  }
  if (!best) return { ok: true, masters: 0, tweenCount: 0, totalDuration: 0, leaves: [], selectorHits: {}, orphans: [] };
  const sets = {};
  for (const s of selectors) { try { sets[s] = new Set(document.querySelectorAll(s)); } catch (e) { sets[s] = new Set(); } }
  const selectorHits = Object.fromEntries(selectors.map((s) => [s, 0]));
  const orphanMap = new Map();
  const leaves = best.leaves.map((L) => {
    let targets = [];
    try { targets = L.c.targets(); } catch (e) { /* ignore */ }
    const els = targets.filter((t) => t instanceof Element);
    const hit = new Set();
    let orphanCount = 0;
    for (const el of els) {
      let matched = false;
      for (const s of selectors) if (sets[s].has(el)) { hit.add(s); matched = true; }
      if (!matched) { orphanCount++; const h = hint(el); orphanMap.set(h, (orphanMap.get(h) || 0) + 1); }
    }
    for (const s of hit) selectorHits[s]++;
    const props = Object.keys(L.c.vars || {}).filter((k) => !CONTROL.has(k) && !/^on[A-Z]/.test(k)).slice(0, 8);
    return { start: L.start, end: L.end === Infinity ? null : L.end, dur: L.dur, elements: els.length, objects: targets.length - els.length, sels: [...hit], orphans: orphanCount, props };
  });
  return {
    ok: true, masters: masters.length, tweenCount: leaves.length, totalDuration: best.m.duration(),
    elementTweens: leaves.filter((l) => l.elements > 0).length,
    leaves: leaves.slice(0, 600), selectorHits,
    orphans: [...orphanMap].map(([h, n]) => ({ target: h, tweens: n })).slice(0, 20),
  };
})
