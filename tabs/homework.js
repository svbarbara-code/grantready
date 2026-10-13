/* homework — owned by the spa-homework session.
   Between-session to-dos: (1) prep for the next session, (2) a tickable review list per session,
   (3) open admin items for the certificate. Ticks persist via SPA.store ("hw").
   Strategy lives in Methods, the daily drill in Practice, worked problems in Exercises — this tab only links to them. */
SPA.tabs.homework = (function () {
  const esc = (s) => SPA.esc(s);
  const SHORT = { spa1: "SPA 1", spa2: "SPA 2", spa3: "SPA 3", spf1: "SPF 1", spf2: "SPF 2" };

  /* ---------- content (own words; paraphrased from the course outline + her notes) ---------- */
  const REVIEW = {
    spa1: {
      focus: "Know the landscape before you touch a number: who funds what, under which rules, and what the announcement is really telling you.",
      items: [
        { id: "r1a", t: "Say in one sentence each what a grant, a cooperative agreement and a contract are — and which rulebook sits behind them (Uniform Guidance vs. the FAR)." },
        { id: "r1b", t: "List what a funding announcement (NOFO) settles for you: who may apply, how it is scored, what must be in the package, how to submit." },
        { id: "r1c", t: "Recognise the other names for a NOFO (FOA, RFA, solicitation, parent announcement…)." },
        { id: "r1d", t: "Name the limits to hunt for in every announcement: page counts, budget ceilings, banned costs, deadlines." },
        { id: "r1e", t: "Sketch the route a proposal takes through the University, and where conflict-of-interest disclosures fit in." },
        { id: "r1f", t: "Remember the tools for finding funding that were suggested (GrantForward, the grants.gov learning pages)." },
        { id: "r1g", t: "Flag the subaward forms that came up — they return in the budget session." }
      ]
    },
    spa2: {
      focus: "The number-heavy one. Redo the sums with your own figures until they come out without peeking.",
      items: [
        { id: "r2a", t: "Sort a few sample costs (a laptop, lab electricity, a postdoc, a flight) into direct vs. facilities & administrative." },
        { id: "r2b", t: "Tell apart mandatory, voluntary-committed and uncommitted cost sharing — and which big sponsor bans the voluntary-committed kind." },
        { id: "r2c", t: "State what is inside institutional base salary and what is left out (bonuses, one-off pay, outside consulting…)." },
        { id: "r2d", t: "Recall the summer-salary ceiling for 9-month appointees and what “must actually be worked” means." },
        { id: "r2e", t: "Convert efforts to person-months: 20% of a 12-month year, 30% of a 9-month year, 50% of a 3-month summer.", math: true,
          chk: "2.4 · 2.7 · 1.5 person-months" },
        { id: "r2f", t: "Salary-cap drill: someone earns more than the $228,000 cap and is on the project at 15%. Work out the salary plus FY27 government fringe (30.7%) you can charge.", math: true,
          chk: "$228,000 × 15% = $34,200; fringe ≈ $10,499; total ≈ $44,699" },
        { id: "r2g", t: "Build an MTDC: $400,000 direct, including $60,000 equipment and one $90,000 subaward. Then apply the on-campus rate (64.5%).", math: true,
          chk: "MTDC = 400,000 − 60,000 − 65,000 = $275,000 → F&A ≈ $177,375" },
        { id: "r2h", t: "Explain how the on-campus / modified off-campus / off-campus rate is picked (where most of Columbia’s own activity happens)." },
        { id: "r2i", t: "Modular budget drill: a request of $178,000 a year in direct costs — which module count, and does it qualify (≤ $250,000)?", math: true,
          chk: "178 ÷ 25 ≈ 7.1 → 7 modules = $175,000; qualifies" },
        { id: "r2j", t: "Pin down the thresholds: equipment ≥ $5,000 per unit; IC on only the first $25,000 of each subaward; the de minimis rate for subawardees with no negotiated rate." },
        { id: "r2k", t: "Separate participant support, research subjects and consultants — and which of them stay out of MTDC." }
      ]
    },
    spa3: {
      focus: "Outline-based draft — sharpen it with your own notes right after class.",
      items: [
        { id: "r3a", t: "Walk through what a Notice of Award contains and what you check first when one lands." },
        { id: "r3b", t: "Describe what happens at award set-up in ARC and who does what." },
        { id: "r3c", t: "Explain how subawards get issued once the prime award exists." },
        { id: "r3d", t: "List which changes need the sponsor’s prior approval and which stay inside the University." },
        { id: "r3e", t: "Rebudgeting: when you can move money freely and when you can’t (remember the participant-support rule from budget creation)." },
        { id: "r3f", t: "Know what progress reports are due, when, and who signs off." },
        { id: "r3g", t: "No-cost extension: what it is, when to ask, how much lead time to leave — write down what the instructor said." },
        { id: "r3h", t: "Jot one scenario from class that surprised you (use the notes box below)." }
      ]
    },
    spf1: {
      focus: "Outline-based draft — fill the specifics in from class.",
      items: [
        { id: "r4a", t: "Explain in plain words how a sponsored project gets its own account and why the money is tracked separately." },
        { id: "r4b", t: "Run any cost through the four tests: allowable, allocable, reasonable, treated consistently." },
        { id: "r4c", t: "List what you look at when monitoring a project ledger, and two red flags." },
        { id: "r4d", t: "Cost transfers: when one is justified, what the justification must say, and why timing matters." },
        { id: "r4e", t: "Know which financial reports exist and who produces them." },
        { id: "r4f", t: "Balance drill: budget minus spent minus committed = what’s truly left. Do it for one project you know.", math: true }
      ]
    },
    spf2: {
      focus: "Outline-based draft — closes the loop on F&A and wraps the award lifecycle.",
      items: [
        { id: "r5a", t: "Redo an F&A calculation end to end: total direct → MTDC → F&A → total.", math: true },
        { id: "r5b", t: "Cost overruns: who covers them and how you handle one." },
        { id: "r5c", t: "Cost sharing: how commitments get tracked and reported." },
        { id: "r5d", t: "Subrecipient monitoring: what you check on an invoice and why." },
        { id: "r5e", t: "Put the closeout steps in order, with the deadlines you’d watch." },
        { id: "r5f", t: "Skim your own notes from all five sessions once, top to bottom." }
      ]
    }
  };

  const PREP = {
    spa1: { sum: "Proposal preparation: funding types, announcements, routing.",
      items: [["pa1", "Open one real funding announcement you know and see how it is laid out."], ["pa2", "Have a notebook ready for the forms and routing steps."]] },
    spa2: { sum: "Budget creation — the numeric heavyweight.",
      items: [["pb1", "Re-read your Session 1 review points (or tick them off in the list below)."], ["pb2", "Calculator and scratch paper at hand."], ["pb3", "Warm up: one person-months conversion in Exercises.", "exercises"]] },
    spa3: { sum: "Managing the award once it’s in hand.",
      items: [["pc1", "Finish the Session 2 math drills below."], ["pc2", "Think of one real award change you’ve seen — ask how it would be handled."]] },
    spf1: { sum: "Financial management: allowable costs, monitoring, cost transfers.",
      items: [["pd1", "Skim your Session 3 notes."], ["pd2", "Pull up a project ledger you know, to compare against."]] },
    spf2: { sum: "Project accounting, monitoring and closeout — the last session.",
      items: [["pe1", "Redo one F&A calculation in Exercises.", "exercises"], ["pe2", "Write the one question you most want answered before the course ends."]] }
  };

  const OPEN = [
    { g: "This month", items: [
      { id: "o_z2", t: "Zoom registration for SPA 2 (Oct 13)", sid: "spa2" },
      { id: "o_z3", t: "Zoom registration for SPA 3 (Oct 20)", sid: "spa3" },
      { id: "o_z4", t: "Zoom registration for SPF 1 (Oct 27)", sid: "spf1" },
      { id: "o_z5", t: "Zoom registration for SPF 2 (Nov 10)", sid: "spf2" },
      { id: "o_buf", t: "Keep Tue Nov 17 free — it’s only used if a session gets rescheduled" },
      { id: "o_hist", t: "After Nov 10: check all five sessions show in Rascal → My Test History" }
    ]},
    { g: "Winter", items: [
      { id: "o_win1", t: "Ask RCtraining to be invited to the winter Foundations (dates are set about two months ahead)" },
      { id: "o_win2", t: "Find the winter Foundations dates and block them (11 sessions for CUIMC)" }
    ]},
    { g: "After that", items: [
      { id: "o_cs", t: "TC0504 online case studies — after Foundations" },
      { id: "o_t97", t: "Post-Foundations test: TC0097 (CUIMC)" },
      { id: "o_t17", t: "Post-Essentials test: TC4017 (CUIMC) — confirm in Rascal when it opens", to: "methods", toLabel: "Test strategy" }
    ]}
  ];
  const OPEN_NOTE = "Everything has to land within 3 years of starting, while you remain a Columbia employee.";

  /* ---------- state ---------- */
  const SS = SPA.sessions;
  let S = SPA.store.get("hw", null) || { c: {}, n: {}, sel: null };
  if (!S.c) S.c = {}; if (!S.n) S.n = {};
  const save = () => SPA.store.set("hw", S);

  const dt = (iso) => { const p = iso.split("-").map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  const todayD = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const daysTo = (iso) => Math.round((dt(iso) - todayD()) / 86400000);
  const fmt = (iso) => dt(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const spTime = (iso) => iso < "2026-11-01" ? "1:00–2:30 pm" : "2:00–3:30 pm";
  const rel = (n) => n === 0 ? "today" : n === 1 ? "tomorrow" : "in " + n + " days";
  const nextSess = () => SS.find((s) => daysTo(s.date) >= 0);
  const lastPast = () => { const p = SS.filter((s) => daysTo(s.date) < 0); return p.length ? p[p.length - 1] : null; };
  const done = (id) => !!S.c[id];
  const reviewCnt = (sid) => { const it = REVIEW[sid].items; return [it.filter((x) => done(x.id)).length, it.length]; };
  const openAll = () => OPEN.reduce((a, g) => a.concat(g.items), []);
  const allCnt = () => {
    let d = 0, n = 0;
    SS.forEach((s) => { const c = reviewCnt(s.id); d += c[0]; n += c[1]; });
    openAll().forEach((x) => { n++; if (done(x.id)) d++; });
    return [d, n];
  };

  /* ---------- html ---------- */
  function item(id, text, extra) {
    extra = extra || {};
    return '<div class="hw-row">' +
      '<label class="hw-item' + (done(id) ? ' on' : '') + '">' +
        '<input type="checkbox" data-id="' + id + '"' + (done(id) ? ' checked' : '') + '>' +
        '<span class="hw-box" aria-hidden="true"></span>' +
        '<span class="hw-txt">' + esc(text) + (extra.tag ? ' <span class="hw-tag">' + esc(extra.tag) + '</span>' : '') + '</span>' +
      '</label>' +
      (extra.chk ? '<details class="hw-chk"><summary>Check my answer</summary><div>' + esc(extra.chk) + '</div></details>' : '') +
      (extra.go ? '<button type="button" class="hw-go" data-go="' + extra.go + '">' + esc(extra.goLabel || "Open") + ' →</button>' : '') +
    '</div>';
  }

  function prepHtml() {
    const nx = nextSess();
    if (!nx) {
      return '<div class="card hw-prep"><div class="hw-eyebrow">Before next session</div>' +
        '<h3>Essentials sessions are done 🎉</h3><p class="muted">Work the open items below — winter Foundations is next.</p></div>';
    }
    const n = daysTo(nx.date), P = PREP[nx.id];
    const idx = SS.indexOf(nx), prev = idx > 0 ? SS[idx - 1] : null;
    let carry = "";
    if (prev) {
      const c = reviewCnt(prev.id), left = c[1] - c[0];
      carry = left > 0
        ? '<div class="hw-carry">📝 ' + left + ' review point' + (left === 1 ? '' : 's') + ' still open from ' + SHORT[prev.id] + '. <button type="button" class="hw-link" data-sel="' + prev.id + '">Jump to them</button></div>'
        : '<div class="hw-carry ok">✅ ' + SHORT[prev.id] + ' review is all ticked.</div>';
    }
    const zoomId = openAll().filter((x) => x.sid === nx.id)[0];
    const items = [];
    if (zoomId) items.push(item(zoomId.id, "Zoom registration done for this session"));
    P.items.forEach((p) => items.push(item(p[0], p[1], p[2] ? { go: p[2], goLabel: "Open " + p[2] } : {})));
    items.push(item("psign_" + nx.id, "On the day: join early, and sign in by typing your name + your CUIMC email in the Zoom chat (≤ 20 min missed or no credit)"));
    return '<div class="card hw-prep"><div class="hw-eyebrow">Before next session</div>' +
      '<h3>' + esc(SHORT[nx.id]) + ' · ' + esc(nx.title) + '</h3>' +
      '<div class="hw-when">' + esc(fmt(nx.date)) + ' · ' + esc(spTime(nx.date)) + ' São Paulo · <b>' + esc(rel(n)) + '</b></div>' +
      '<p class="muted hw-sum">' + esc(P.sum) + '</p>' + carry +
      '<div class="hw-prep-list">' + items.join("") + '</div></div>';
  }

  function reviewHtml() {
    const sel = S.sel && REVIEW[S.sel] ? S.sel : (lastPast() ? lastPast().id : SS[0].id);
    S.sel = sel;
    const s = SS.filter((x) => x.id === sel)[0], R = REVIEW[sel];
    const chips = SS.map((x) => {
      const c = reviewCnt(x.id), full = c[0] === c[1];
      return '<button type="button" class="hw-chip' + (x.id === sel ? ' sel' : '') + (full ? ' full' : '') + '" data-sel="' + x.id + '" aria-pressed="' + (x.id === sel) + '">' +
        '<b>' + SHORT[x.id] + '</b><span data-k="chip:' + x.id + '">' + (full ? '✓' : c[0] + '/' + c[1]) + '</span></button>';
    }).join("");
    const n = daysTo(s.date);
    const note = n >= 0 ? '<div class="hw-later">Session ' + esc(rel(n)) + ' (' + esc(fmt(s.date)) + ') — come back after class and tick through this.</div>' : '';
    return '<h3 class="hw-h">Review after each session</h3>' +
      '<div class="hw-chips" role="group" aria-label="Choose a session">' + chips + '</div>' +
      '<div class="card hw-rev">' +
        '<div class="hw-rev-top"><b>' + esc(SHORT[sel]) + ' · ' + esc(s.title) + '</b><span class="pill" data-k="rev"></span></div>' +
        '<p class="muted hw-focus">' + esc(R.focus) + '</p>' + note +
        R.items.map((it) => item(it.id, it.t, it.math ? { tag: "🧮 math", chk: it.chk, go: "exercises", goLabel: "Practise" } : {})).join("") +
        '<div class="hw-win" data-k="win"></div>' +
        '<label class="hw-notes"><span>My notes for this session</span>' +
          '<textarea data-note="' + sel + '" rows="3" placeholder="What surprised you? What to ask next time?">' + esc(S.n[sel] || "") + '</textarea></label>' +
      '</div>';
  }

  function openHtml() {
    return '<h3 class="hw-h">Certificate to-dos</h3>' +
      '<div class="card hw-open">' +
      OPEN.map((g) =>
        '<div class="hw-grp">' + esc(g.g) + '</div>' +
        g.items.map((x) => {
          return item(x.id, x.t, x.to ? { go: x.to, goLabel: x.toLabel || "Open" } : {});
        }).join("")
      ).join("") +
      '<p class="muted hw-fine">' + esc(OPEN_NOTE) + '</p></div>';
  }

  function draw(panel) {
    panel.innerHTML =
      '<section class="hm-hero hw-hero"><h2>📝 Homework</h2>' +
      '<p class="muted">Between-session to-dos. Tick things off — they stay ticked on this phone.</p>' +
      '<div class="hw-all"><div class="hw-bar"><i data-k="bar"></i></div><span data-k="all"></span></div></section>' +
      prepHtml() + reviewHtml() + openHtml();
    refresh(panel);
  }

  /* update counts without re-rendering lists */
  function refresh(panel) {
    const a = allCnt();
    const all = panel.querySelector('[data-k="all"]'); if (all) all.textContent = a[0] + " of " + a[1] + " done";
    const bar = panel.querySelector('[data-k="bar"]'); if (bar) bar.style.width = (a[1] ? Math.round(100 * a[0] / a[1]) : 0) + "%";
    SS.forEach((x) => {
      const el = panel.querySelector('[data-k="chip:' + x.id + '"]'); if (!el) return;
      const c = reviewCnt(x.id); el.textContent = c[0] === c[1] ? "✓" : c[0] + "/" + c[1];
      el.parentNode.classList.toggle("full", c[0] === c[1]);
    });
    const sel = S.sel, c = reviewCnt(sel);
    const rv = panel.querySelector('[data-k="rev"]'); if (rv) rv.textContent = c[0] + " / " + c[1];
    const win = panel.querySelector('[data-k="win"]');
    if (win) win.innerHTML = c[0] === c[1] ? "🎉 " + esc(SHORT[sel]) + " reviewed — nicely done." : "";
    panel.querySelectorAll("label.hw-item").forEach((l) => {
      const cb = l.querySelector("input"); l.classList.toggle("on", cb.checked);
    });
  }

  function wire(panel) {
    panel.addEventListener("change", (e) => {
      const cb = e.target.closest("input[data-id]"); if (!cb) return;
      if (cb.checked) S.c[cb.dataset.id] = 1; else delete S.c[cb.dataset.id];
      save();
      // same item can appear twice (e.g. Zoom registration): keep copies in sync
      panel.querySelectorAll('input[data-id="' + cb.dataset.id + '"]').forEach((o) => { o.checked = cb.checked; });
      const lab = cb.closest("label"); if (cb.checked && lab) { lab.classList.remove("pop"); void lab.offsetWidth; lab.classList.add("pop"); }
      refresh(panel);
    });
    panel.addEventListener("click", (e) => {
      const sel = e.target.closest("[data-sel]");
      if (sel) { S.sel = sel.dataset.sel; save(); draw(panel); const r = panel.querySelector(".hw-chips"); if (r) r.scrollIntoView({ block: "start", behavior: "smooth" }); return; }
      const go = e.target.closest("[data-go]"); if (go) SPA.go(go.dataset.go);
    });
    let tm = null;
    panel.addEventListener("input", (e) => {
      const ta = e.target.closest("textarea[data-note]"); if (!ta) return;
      S.n[ta.dataset.note] = ta.value;
      clearTimeout(tm); tm = setTimeout(save, 300);
    });
  }

  return {
    render(panel) { wire(panel); draw(panel); },
    onShow(panel) { S = SPA.store.get("hw", null) || S; draw(panel); }   // re-evaluate "next session" against today's date
  };
})();
