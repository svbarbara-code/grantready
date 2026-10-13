/* exercises — spa-exercises. Interactive budget practice for Session 2 (Preparing the Budget).
   Pure calc helpers live in `calc` (exposed as SPA.tabs.exercises._calc so they can be unit-tested). */
(function () {
  const SUB_CAP = 25000, MOD = 25000, MOD_MAX = 250000, PHS_CAP = 228000;
  const RATES = [
    { k: "on",     l: "On-campus 64.5%",       n: "On-campus research",           r: 64.5 },
    { k: "moff",   l: "Mod. off-campus 28.5%", n: "Modified off-campus research", r: 28.5 },
    { k: "off",    l: "Off-campus 26%",        n: "Off-campus research",          r: 26 },
    { k: "osa_on", l: "OSA on-campus 33%",     n: "OSA on-campus",                r: 33 },
    { k: "osa_off",l: "OSA off-campus 26%",    n: "OSA off-campus",               r: 26 },
    { k: "custom", l: "Other rate",            n: "Other rate",                   r: 0 }
  ];
  const FRINGE = { gov: 30.7, non: 35 };

  /* ---------- pure calculations ---------- */
  const sum = a => a.reduce((s, x) => s + x, 0);
  const calc = {
    mtdc(i) {
      const subEx = i.subs.map(s => Math.max(0, s - SUB_CAP));
      const subExTot = sum(subEx);
      const exTot = i.equip + i.cap + i.pat + i.tui + i.rent + subExTot;
      return { subEx, subExTot, exTot, mtdc: i.tdc - exTot };
    },
    fa(base, ratePct) { return Math.round(base * ratePct / 100); },
    // first $25k of a subaward counts once across the whole project (per entity), not once per year
    subYears(cols, subs, ratePct) {
      let used = 0;
      const rows = cols.map((c, y) => {
        const inc = Math.min(subs[y], Math.max(0, SUB_CAP - used));
        used += inc;
        const base = c + inc;
        return { inc, out: subs[y] - inc, base, fa: calc.fa(base, ratePct), used };
      });
      return { rows, baseT: sum(rows.map(r => r.base)), faT: sum(rows.map(r => r.fa)), outT: sum(rows.map(r => r.out)) };
    },
    pmFromPct(pct, months, fte) { return pct / 100 * months * fte / 100; },
    pctFromPm(pm, months, fte) { return months * fte ? pm / (months * fte / 100) * 100 : 0; },
    modular(tdcs, cfs, one) {
      const caps = tdcs.map((t, y) => t - cfs[y]);
      const total = sum(caps), net = total - one, n = tdcs.length;
      const avg = n ? net / n : 0;
      const mods = Math.floor(avg / MOD + 0.5);
      return { caps, total, net, avg, mods, amount: mods * MOD, eligible: mods >= 1 && mods <= MOD_MAX / MOD };
    },
    phs(ibs, effPct, frPct) {
      const one = base => {
        const sal = Math.round(base * effPct / 100), fr = Math.round(sal * frPct / 100);
        return { sal, fr, tot: sal + fr };
      };
      const cap = one(Math.min(ibs, PHS_CAP)), act = one(ibs);
      return { cap, act, gap: act.tot - cap.tot, over: ibs > PHS_CAP };
    }
  };

  /* ---------- formatting helpers ---------- */
  const num = v => { const n = parseFloat(String(v == null ? "" : v).replace(/[^0-9.\-]/g, "")); return isFinite(n) ? n : 0; };
  const has = v => String(v == null ? "" : v).replace(/[^0-9]/g, "") !== "";
  const money = n => { n = Math.round(n); return (n < 0 ? "−" : "") + "$" + Math.abs(n).toLocaleString("en-US"); };
  const trim = (n, d) => String(+n.toFixed(d == null ? 2 : d));
  const row = (l, v, c) => '<tr class="' + (c || "") + '"><td>' + l + "</td><td>" + v + "</td></tr>";
  const tbl = rows => '<table class="ex-tbl"><tbody>' + rows.join("") + "</tbody></table>";
  const note = (m, k) => '<div class="ex-note ' + (k || "") + '">' + m + "</div>";
  const big = (l, v) => '<div class="ex-big"><span>' + l + "</span><b>" + v + "</b></div>";
  const wasp = () => '<p class="ex-ph">Fill in the numbers above and your result shows up here.</p>';

  /* ---------- state ---------- */
  const five = () => ["", "", "", "", ""];
  const DEF = () => ({
    tdc: "", equip: "", cap: "", pat: "", tui: "", rent: "", subs: [""],
    fa_mtdc: "", fa_tdc: "", fa_rate: "on", fa_custom: "",
    sy_n: "3", sy_col: five(), sy_sub: five(), sy_rate: "on", sy_custom: "",
    pm_mode: "fwd", pm_months: "12", pm_cm: "", pm_fte: "100", pm_pct: "", pm_pm: "",
    md_n: "5", md_tdc: five(), md_cf: five(), md_one: "",
    ph_ibs: "", ph_eff: "", ph_fr: "gov"
  });
  let S = DEF();
  function load() {
    const saved = SPA.store.get("ex:v1", {}) || {};
    const d = DEF();
    for (const k in d) {
      if (!(k in saved)) continue;
      if (k === "subs") { if (Array.isArray(saved.subs) && saved.subs.length) d.subs = saved.subs.slice(0, 6).map(String); }
      else if (Array.isArray(d[k])) { if (Array.isArray(saved[k])) d[k] = d[k].map((_, i) => String(saved[k][i] || "")); }
      else d[k] = String(saved[k]);
    }
    S = d;
  }
  let saveT = 0;
  const save = () => { clearTimeout(saveT); saveT = setTimeout(() => SPA.store.set("ex:v1", S), 250); };

  const rateOf = p => { const k = S[p + "_rate"]; const r = RATES.find(x => x.k === k) || RATES[0]; return k === "custom" ? num(S[p + "_custom"]) : r.r; };
  const rateName = p => { const k = S[p + "_rate"]; return k === "custom" ? trim(num(S[p + "_custom"]), 2) + "%" : (RATES.find(x => x.k === k) || RATES[0]).r + "%"; };

  /* ---------- form builders ---------- */
  function fld(k, label, o) {
    o = o || {};
    const i = o.i, val = i != null ? S[k][i] : S[k];
    const pre = o.pre === false ? "" : '<span class="ex-pre">' + (o.pre || "$") + "</span>";
    return '<label class="ex-f"><span class="ex-l">' + label + "</span>" +
      '<span class="ex-in">' + pre + '<input data-k="' + k + '"' + (i != null ? ' data-i="' + i + '"' : "") +
      ' inputmode="decimal" autocomplete="off" enterkeyhint="done" value="' + SPA.esc(val) + '">' +
      (o.suf ? '<span class="ex-suf">' + o.suf + "</span>" : "") + "</span>" +
      (o.hint ? '<span class="ex-hint">' + o.hint + "</span>" : "") + "</label>";
  }
  const pct = (k, label, o) => fld(k, label, Object.assign({ pre: false, suf: "%" }, o));
  const r2 = (a, b) => '<div class="ex-r2">' + a + b + "</div>";
  function seg(k, opts, label) {
    return '<div class="ex-seg-w">' + (label ? '<span class="ex-l">' + label + "</span>" : "") +
      '<div class="ex-seg" role="radiogroup"' + (label ? "" : "") + ">" +
      opts.map(o => '<button type="button" role="radio" class="ex-chip" data-act="seg" data-k="' + k + '" data-v="' + o.v +
        '" aria-checked="' + (String(S[k]) === o.v) + '">' + o.l + "</button>").join("") + "</div></div>";
  }
  const rateSeg = p => seg(p + "_rate", RATES.map(r => ({ v: r.k, l: r.l })), "F&A rate") +
    (S[p + "_rate"] === "custom" ? pct(p + "_custom", "Your rate", { hint: "e.g. a sponsor-set rate" }) : "");

  /* ---------- worked-example data (my own numbers, not the handout's) ---------- */
  const EX = {
    mtdc: { tdc: 480000, equip: 38000, cap: 0, pat: 0, tui: 22000, rent: 0, subs: [60000] },
    fa:   { mtdc: 385000, tdc: 480000, rate: "on" },
    sy:   { n: 3, col: [80000, 80000, 80000], sub: [14000, 14000, 14000], rate: "on" },
    pm:   { fwd: { pct: 40, months: 9 }, rev: { pm: 2.4, months: 12 } },
    md:   { n: 5, tdc: [214000, 218000, 222000, 226000, 230000], cf: [8000, 8000, 8000, 8000, 8000] },
    ph:   { ibs: 265000, eff: 15, fr: "gov" }
  };
  const eg = (intro, rows, w, loadTxt) =>
    '<p class="ex-eg-i">' + intro + "</p>" + tbl(rows) +
    '<button type="button" class="ex-btn ghost" data-act="load" data-w="' + w + '">' + (loadTxt || "Load these numbers into the calculator") + "</button>";

  /* ---------- widgets ---------- */
  const W = {};

  W.mtdc = {
    n: 1, title: "MTDC calculator",
    why: "F&amp;A is charged on the base, not on everything you spend, so putting one equipment line or one big subaward on the wrong side of the line shifts the indirect cost of the whole proposal.",
    form() {
      return fld("tdc", "Total direct costs (TDC)", { hint: "Everything direct in the budget, including the full subaward amounts." }) +
        '<p class="ex-sub">Subtract these excludables</p>' +
        fld("equip", "Equipment", { hint: "Only items of $5,000 or more each. Cheaper items are supplies and stay in the base." }) +
        r2(fld("cap", "Capital expenditures"), fld("pat", "Patient care costs", { hint: "MRIs, ancillary tests…" })) +
        r2(fld("tui", "Tuition reimbursement"), fld("rent", "Off-site rent")) +
        '<p class="ex-sub">Subawards (full amount: its direct + its own F&amp;A)</p>' +
        S.subs.map((v, i) => '<div class="ex-subrow">' + fld("subs", "Subaward " + (i + 1), { i }) +
          (S.subs.length > 1 ? '<button type="button" class="ex-x" data-act="rm-sub" data-i="' + i + '" aria-label="Remove subaward ' + (i + 1) + '">✕</button>' : "") + "</div>").join("") +
        (S.subs.length < 6 ? '<button type="button" class="ex-btn ghost" data-act="add-sub">+ Add a subaward</button>' : "") +
        '<p class="ex-hint">Read as a Year-1 budget: the first $25,000 of each subaward stays in the base. For later years see calculator 3.</p>';
    },
    out() {
      if (!has(S.tdc)) return wasp();
      const i = { tdc: num(S.tdc), equip: num(S.equip), cap: num(S.cap), pat: num(S.pat), tui: num(S.tui), rent: num(S.rent), subs: S.subs.map(num) };
      const c = calc.mtdc(i);
      const rows = [row("Total direct costs", money(i.tdc))];
      [["Equipment", i.equip], ["Capital expenditures", i.cap], ["Patient care", i.pat], ["Tuition reimbursement", i.tui], ["Off-site rent", i.rent]]
        .forEach(x => { if (x[1]) rows.push(row("− " + x[0], money(x[1]), "sub")); });
      if (c.subExTot) rows.push(row("− Subaward portions over $25k", money(c.subExTot), "sub"));
      rows.push(row("= MTDC (the base)", money(c.mtdc), "tot"));
      const inW = Math.max(0, Math.min(100, i.tdc ? c.mtdc / i.tdc * 100 : 0));
      return big("MTDC (the base)", money(c.mtdc)) +
        '<div class="ex-bar" aria-hidden="true"><i style="width:' + inW + '%"></i></div>' +
        '<p class="ex-hint">' + trim(inW, 0) + "% of your direct costs are in the base.</p>" + tbl(rows) +
        (c.mtdc < 0 ? note("The excludables add up to more than your total direct costs. Check your entries.", "warn") : "");
    },
    eg() {
      const e = EX.mtdc, c = calc.mtdc(e);
      return eg("A research budget has $480,000 in direct costs. Inside it: one $38,000 instrument, $22,000 of tuition reimbursement, and a $60,000 subaward.",
        [row("Total direct costs", money(e.tdc)), row("− Equipment (one item over $5k)", money(e.equip), "sub"), row("− Tuition reimbursement", money(e.tui), "sub"),
         row("− Subaward over $25k ($60,000 − $25,000)", money(c.subExTot), "sub"), row("= MTDC", money(c.mtdc), "tot")], "mtdc");
    },
    load() { Object.assign(S, { tdc: "480000", equip: "38000", cap: "", pat: "", tui: "22000", rent: "", subs: ["60000"] }); }
  };

  W.fa = {
    n: 2, title: "F&A calculator",
    why: "One rate applies to the whole award. It is picked by where more than half of Columbia's own project activity happens, and subrecipient work does not count toward that.",
    form() {
      return r2(fld("fa_mtdc", "MTDC (the base)"), fld("fa_tdc", "Total direct costs", { hint: "Optional, for the total." })) +
        '<button type="button" class="ex-btn ghost" data-act="pull">↧ Use the numbers from calculator 1</button>' +
        rateSeg("fa") +
        '<p class="ex-hint">Research rates here are the FY25 values from the course (in effect until amended); confirm against the current NICRA. Some programs fix their own rate.</p>';
    },
    out() {
      if (!has(S.fa_mtdc)) return wasp();
      const base = num(S.fa_mtdc), r = rateOf("fa"), f = calc.fa(base, r), tdc = num(S.fa_tdc);
      const rows = [row("MTDC", money(base)), row("× rate", rateName("fa")), row("= F&amp;A (indirect) costs", money(f), "tot")];
      if (has(S.fa_tdc)) { rows.push(row("Total direct costs", money(tdc))); rows.push(row("= Total request (direct + F&amp;A)", money(tdc + f), "tot")); }
      return big("F&amp;A costs", money(f)) + tbl(rows) +
        (has(S.fa_tdc) && tdc && base > tdc ? note("The base can never be larger than total direct costs. Check the two numbers.", "warn") : "");
    },
    eg() {
      const e = EX.fa, f = calc.fa(e.mtdc, 64.5);
      return eg("Take the $385,000 base from example 1 on an on-campus research award. For comparison, the same base at the other research rates is below.",
        [row("MTDC", money(e.mtdc)), row("× 64.5% on-campus", money(f), "tot"), row("Total request ($480,000 + F&amp;A)", money(e.tdc + f)),
         row("Same base × 28.5% mod. off-campus", money(calc.fa(e.mtdc, 28.5)), "sub"), row("Same base × 26% off-campus", money(calc.fa(e.mtdc, 26)), "sub")], "fa");
    },
    load() { Object.assign(S, { fa_mtdc: "385000", fa_tdc: "480000", fa_rate: "on" }); }
  };

  W.sy = {
    n: 3, title: "Subaward first-$25k rule",
    why: "Federal F&amp;A touches only the first $25,000 of each subaward across the life of the project. Once a subaward has used up its $25k, none of it counts in the base in later years.",
    form() {
      const n = +S.sy_n;
      let h = seg("sy_n", [1, 2, 3, 4, 5].map(x => ({ v: String(x), l: x + (x === 1 ? " yr" : " yrs") })), "Project length") + rateSeg("sy");
      for (let y = 0; y < n; y++) {
        h += '<div class="ex-yr"><b>Year ' + (y + 1) + "</b>" +
          r2(fld("sy_col", "Columbia direct costs", { i: y, hint: y ? "" : "Excluding the subaward." }), fld("sy_sub", "Subaward total", { i: y, hint: y ? "" : "Direct + its own F&A." })) + "</div>";
      }
      return h + '<p class="ex-hint">One subaward entity here. Each additional subaward gets its own $25k.</p>';
    },
    out() {
      const n = +S.sy_n;
      const cols = [], subs = [];
      for (let y = 0; y < n; y++) { cols.push(num(S.sy_col[y])); subs.push(num(S.sy_sub[y])); }
      if (!sum(cols) && !sum(subs)) return wasp();
      const r = rateOf("sy"), c = calc.subYears(cols, subs, r);
      const body = c.rows.map((x, y) => "<tr><td>Y" + (y + 1) + "</td><td>" + money(x.inc) + "</td><td>" + money(x.out) + "</td><td>" + money(x.base) + "</td><td>" + money(x.fa) + "</td></tr>").join("");
      const used = Math.min(SUB_CAP, sum(subs));
      return big("F&amp;A over " + n + (n === 1 ? " year" : " years"), money(c.faT)) +
        '<div class="ex-scroll"><table class="ex-tbl grid"><thead><tr><th>Yr</th><th>Sub in base</th><th>Sub out</th><th>Base</th><th>F&amp;A @ ' + rateName("sy") + "</th></tr></thead><tbody>" + body +
        '<tr class="tot"><td>All</td><td>' + money(sum(c.rows.map(x => x.inc))) + "</td><td>" + money(c.outT) + "</td><td>" + money(c.baseT) + "</td><td>" + money(c.faT) + "</td></tr></tbody></table></div>" +
        '<p class="ex-hint">The $25k allowance is shared across the years: ' + money(used) + " of it is used by this subaward.</p>";
    },
    eg() {
      const e = EX.sy, c = calc.subYears(e.col, e.sub, 64.5);
      const body = c.rows.map((x, y) => "<tr><td>Y" + (y + 1) + "</td><td>" + money(x.inc) + "</td><td>" + money(x.out) + "</td><td>" + money(x.base) + "</td><td>" + money(x.fa) + "</td></tr>").join("");
      return '<p class="ex-eg-i">Columbia spends $80,000 a year; a subaward costs $14,000 a year for 3 years; on-campus rate. Year 1 uses $14,000 of the $25k allowance, Year 2 uses the remaining $11,000, and from Year 3 the whole subaward is out of the base.</p>' +
        '<div class="ex-scroll"><table class="ex-tbl grid"><thead><tr><th>Yr</th><th>Sub in base</th><th>Sub out</th><th>Base</th><th>F&amp;A</th></tr></thead><tbody>' + body + "</tbody></table></div>" +
        '<button type="button" class="ex-btn ghost" data-act="load" data-w="sy">Load these numbers into the calculator</button>';
    },
    load() { Object.assign(S, { sy_n: "3", sy_col: ["80000", "80000", "80000", "", ""], sy_sub: ["14000", "14000", "14000", "", ""], sy_rate: "on" }); }
  };

  W.pm = {
    n: 4, title: "Person-months converter",
    why: "Sponsors treat the effort in a proposal budget as a commitment, so the percent in your budget and the person-months in your justification have to tell the same story.",
    form() {
      return seg("pm_mode", [{ v: "fwd", l: "% effort → months" }, { v: "rev", l: "months → % effort" }], "Direction") +
        seg("pm_months", [{ v: "12", l: "12 mo (calendar)" }, { v: "9", l: "9 mo (academic)" }, { v: "3", l: "3 mo (summer)" }, { v: "x", l: "Other" }], "Appointment length") +
        (S.pm_months === "x" ? fld("pm_cm", "Appointment months", { pre: false, suf: "mo" }) : "") +
        fld("pm_fte", "Appointment FTE", { pre: false, suf: "%", hint: "100% unless the appointment is part-time (e.g. 50% for a 0.5 FTE)." }) +
        (S.pm_mode === "fwd" ? pct("pm_pct", "Effort on the project") : fld("pm_pm", "Person-months on the project", { pre: false, suf: "PM" }));
    },
    out() {
      const months = S.pm_months === "x" ? num(S.pm_cm) : +S.pm_months, fte = has(S.pm_fte) ? num(S.pm_fte) : 100;
      const unit = { 12: "CY", 9: "AY", 3: "SM" }[S.pm_months] || "";
      if (!months) return wasp();
      if (S.pm_mode === "fwd") {
        if (!has(S.pm_pct)) return wasp();
        const p = num(S.pm_pct), v = calc.pmFromPct(p, months, fte);
        return big("Person-months", trim(v) + (unit ? " " + unit : "")) +
          tbl([row("Effort", trim(p) + "%"), row("× appointment", trim(months) + " months" + (fte !== 100 ? " × " + trim(fte) + "% FTE" : "")), row("= Person-months", trim(v), "tot")]) +
          (p > 100 ? note("More than 100% effort. Check the entry.", "warn") : "");
      }
      if (!has(S.pm_pm)) return wasp();
      const pm = num(S.pm_pm), p = calc.pctFromPm(pm, months, fte);
      return big("Effort", trim(p) + "%") +
        tbl([row("Person-months", trim(pm)), row("÷ appointment", trim(months * fte / 100) + " months"), row("= Effort", trim(p) + "%", "tot")]) +
        (p > 100 ? note("That would be more than 100% effort. Check the entry.", "warn") : "");
    },
    eg() {
      const a = EX.pm.fwd, b = EX.pm.rev;
      return '<p class="ex-eg-i">% → months: someone on a 9-month academic appointment gives 40% effort. Months → %: someone on a 12-month appointment is shown at 2.4 person-months.</p>' +
        tbl([row("40% × 9 months", trim(calc.pmFromPct(a.pct, a.months, 100)) + " AY person-months", "tot"),
             row("2.4 PM ÷ 12 months", trim(calc.pctFromPm(b.pm, b.months, 100)) + "% effort", "tot")]) +
        '<p class="ex-hint">Summer salary is capped at 3/9 of the academic-year salary, and NSF limits senior personnel to 2 salary months a year across all NSF awards.</p>' +
        '<button type="button" class="ex-btn ghost" data-act="load" data-w="pm">Load the first example</button>';
    },
    load() { Object.assign(S, { pm_mode: "fwd", pm_months: "9", pm_fte: "100", pm_pct: "40" }); }
  };

  W.md = {
    n: 5, title: "Modular budget helper",
    why: "A modular request is a count of $25,000 blocks, the same in every year. The average-then-round step fixes your ask for the whole project, and consortium F&amp;A sits outside it.",
    form() {
      const n = +S.md_n;
      let h = seg("md_n", [1, 2, 3, 4, 5].map(x => ({ v: String(x), l: x + (x === 1 ? " yr" : " yrs") })), "Project length");
      for (let y = 0; y < n; y++) {
        h += '<div class="ex-yr"><b>Year ' + (y + 1) + "</b>" +
          r2(fld("md_tdc", "Total direct costs", { i: y }), fld("md_cf", "of which consortium F&amp;A", { i: y })) + "</div>";
      }
      h += fld("md_one", "One-time costs to set aside (all years combined)", { hint: "For example a piece of equipment you will add back in its year." }) +
        '<button type="button" class="ex-btn ghost" data-act="infl">Fill years 2–' + n + " from Year 1 at +3%</button>" +
        '<p class="ex-hint">Plan on about 3% inflation a year for lines that can inflate. Salaries at the cap and fringe cannot.</p>';
      return h;
    },
    out() {
      const n = +S.md_n, t = [], c = [];
      for (let y = 0; y < n; y++) { t.push(num(S.md_tdc[y])); c.push(num(S.md_cf[y])); }
      if (!sum(t)) return wasp();
      const m = calc.modular(t, c, num(S.md_one));
      const rows = [row("Direct costs, all years", money(sum(t)))];
      if (sum(c)) rows.push(row("− Consortium F&amp;A", money(sum(c)), "sub"));
      if (num(S.md_one)) rows.push(row("− One-time costs", money(num(S.md_one)), "sub"));
      rows.push(row("÷ " + n + " years = average", money(m.avg)));
      rows.push(row("Rounds to " + m.mods + (m.mods === 1 ? " module" : " modules") + " × $25,000", money(m.amount), "tot"));
      return big("Request per year", money(m.amount)) + tbl(rows) +
        (m.mods > MOD_MAX / MOD ? note("That is over the $250,000-a-year limit, so a modular format is not available. A detailed budget is needed.", "warn")
          : m.mods < 1 ? note("The average is less than one $25,000 module. Check the entries.", "warn")
          : note("Under the $250,000-a-year limit, so a modular budget can work (R01, R03, R15, R21, R34). Request " + m.mods + " modules in every year" + (num(S.md_one) ? ", adding back the one-time item in its year" : "") + ".", "ok"));
    },
    eg() {
      const e = EX.md, m = calc.modular(e.tdc, e.cf, 0);
      return eg("A 5-year budget with direct costs of $214,000 rising to $230,000, each year including $8,000 of consortium F&amp;A.",
        [row("Direct costs, 5 years", money(sum(e.tdc))), row("− Consortium F&amp;A (5 × $8,000)", money(sum(e.cf)), "sub"), row("Subtotal", money(m.total)),
         row("÷ 5 = average", money(m.avg)), row("Nearest $25k module (" + trim(m.avg / MOD) + " → " + m.mods + ")", money(m.amount) + " per year", "tot")], "md");
    },
    load() {
      Object.assign(S, { md_n: "5", md_tdc: EX.md.tdc.map(String), md_cf: EX.md.cf.map(String), md_one: "" });
    }
  };

  W.ph = {
    n: 6, title: "PHS salary-cap example",
    why: "NIH and other PHS agencies pay salary only up to the cap ($228,000 from 1/1/2026). If someone earns more, budget the capped amount, say so in the justification, and know the department absorbs the gap.",
    form() {
      return fld("ph_ibs", "Institutional base salary (IBS)", { hint: "Annual. Leave out bonuses and one-time pay." }) +
        pct("ph_eff", "Effort on the project") +
        seg("ph_fr", [{ v: "gov", l: "Government 30.7%" }, { v: "non", l: "Non-government 35%" }], "Fringe rate (FY27)");
    },
    out() {
      if (!has(S.ph_ibs) || !has(S.ph_eff)) return wasp();
      const fr = FRINGE[S.ph_fr] || 30.7, ibs = num(S.ph_ibs), e = num(S.ph_eff), p = calc.phs(ibs, e, fr);
      const head = "<thead><tr><th></th><th>At the cap</th><th>At actual IBS</th></tr></thead>";
      return big("Charged to the PHS award", money(p.cap.tot)) +
        '<div class="ex-scroll"><table class="ex-tbl grid">' + head + "<tbody>" +
        "<tr><td>Salary</td><td>" + money(p.cap.sal) + "</td><td>" + money(p.act.sal) + "</td></tr>" +
        "<tr><td>Fringe " + trim(fr) + "%</td><td>" + money(p.cap.fr) + "</td><td>" + money(p.act.fr) + "</td></tr>" +
        '<tr class="tot"><td>Total</td><td>' + money(p.cap.tot) + "</td><td>" + money(p.act.tot) + "</td></tr></tbody></table></div>" +
        (p.over ? note("IBS is above the cap, so " + money(p.gap) + " of this effort is not payable by the sponsor. The department covers it. Add a sentence in the budget justification saying the cap is used for budgeting.", "warn")
          : note("IBS is at or under the cap, so the actual IBS is used and nothing is lost.", "ok")) +
        '<p class="ex-hint">Sponsors with no cap: budget the actual IBS.</p>';
    },
    eg() {
      const e = EX.ph, p = calc.phs(e.ibs, e.eff, 30.7);
      return eg("IBS of $265,000 with 15% effort on an NIH award, government fringe 30.7%.",
        [row("Cap $228,000 × 15%", money(p.cap.sal)), row("+ fringe 30.7%", money(p.cap.fr)), row("= Charged to the award", money(p.cap.tot), "tot"),
         row("Actual IBS would cost", money(p.act.tot), "sub"), row("Gap the department covers", money(p.gap), "tot")], "ph");
    },
    load() { Object.assign(S, { ph_ibs: "265000", ph_eff: "15", ph_fr: "gov" }); }
  };

  /* ---------- practice problems (widget 7) ---------- */
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const rr = (a, b, st) => a + st * Math.floor(Math.random() * ((b - a) / st + 1));
  let P = null, Pdone = false;
  function genProblem() {
    const hasSub = Math.random() < 0.75, hasEq = Math.random() < 0.55, hasTui = Math.random() < 0.4;
    const sub = hasSub ? pick([12000, 18000, 22000, 40000, 65000, 90000]) : 0;
    const equip = hasEq ? rr(6000, 60000, 1000) : 0, tui = hasTui ? rr(8000, 30000, 1000) : 0;
    const rate = pick(["on", "on", "moff", "off", "osa_on"]);
    return { tdc: rr(150000, 500000, 5000) + sub + equip + tui, equip, tui, sub, year: hasSub ? pick([1, 1, 2, 3]) : 1, rate };
  }
  function solve(p) {
    const r = RATES.find(x => x.k === p.rate).r;
    const prior = Math.min(SUB_CAP, p.sub * (p.year - 1));
    const inc = Math.min(p.sub, SUB_CAP - prior), subEx = p.sub - inc;
    const mtdc = p.tdc - p.equip - p.tui - subEx;
    return { r, prior, inc, subEx, mtdc, fa: calc.fa(mtdc, r) };
  }
  function practiceHtml() {
    if (!P) P = genProblem();
    const s = solve(P), r = RATES.find(x => x.k === P.rate);
    const sc = SPA.store.get("ex:score", { t: 0, r: 0 });
    const bits = [];
    if (P.equip) bits.push(money(P.equip) + " for a single piece of equipment");
    if (P.tui) bits.push(money(P.tui) + " of tuition reimbursement");
    if (P.sub) bits.push("a subaward budgeted at " + money(P.sub) + " in each year of the project");
    let q = "This is <b>Year " + P.year + "</b> of a federal research grant at the <b>" + r.n.toLowerCase() + "</b> rate (" + r.r + "%). Total direct costs this year are <b>" + money(P.tdc) + "</b>" +
      (bits.length ? ", which include " + bits.join(", ") : ", with nothing to exclude") + ". What are the F&amp;A costs this year?";
    let h = '<p class="ex-q">' + q + "</p>" +
      '<label class="ex-f"><span class="ex-l">Your answer</span><span class="ex-in"><span class="ex-pre">$</span><input id="ex-pr-in" inputmode="decimal" autocomplete="off" enterkeyhint="done"' + (Pdone ? " disabled" : "") + "></span></label>" +
      '<div class="ex-btns"><button type="button" class="ex-btn" data-act="pr-check"' + (Pdone ? " disabled" : "") + '>Check</button>' +
      '<button type="button" class="ex-btn ghost" data-act="pr-show">Show solution</button>' +
      '<button type="button" class="ex-btn ghost" data-act="pr-new">New problem</button></div>' +
      '<div class="ex-fb" id="ex-pr-fb" aria-live="polite"></div>' +
      '<p class="ex-hint" id="ex-pr-sc">Score on this phone: ' + sc.r + " right out of " + sc.t + " tried.</p>";
    return h;
  }
  function solutionHtml(s) {
    const rows = [row("Total direct costs", money(P.tdc))];
    if (P.equip) rows.push(row("− Equipment", money(P.equip), "sub"));
    if (P.tui) rows.push(row("− Tuition reimbursement", money(P.tui), "sub"));
    if (P.sub) rows.push(row("Subaward: " + money(s.prior) + " of the $25k already used, " + money(s.inc) + " counts now", "− " + money(s.subEx), "sub"));
    rows.push(row("= MTDC", money(s.mtdc), "tot"), row("× " + s.r + "%", money(s.fa), "tot"));
    return tbl(rows);
  }
  function checkAnswer(panel) {
    const inp = panel.querySelector("#ex-pr-in"), fb = panel.querySelector("#ex-pr-fb");
    if (!inp || !has(inp.value) || Pdone) { if (inp && !has(inp.value)) fb.innerHTML = note("Type a dollar amount first.", "warn"); return; }
    const a = num(inp.value), s = solve(P);
    const ok = Math.abs(a - s.fa) <= 1;
    Pdone = true;
    const sc = SPA.store.get("ex:score", { t: 0, r: 0 });
    sc.t += 1; if (ok) sc.r += 1;
    SPA.store.set("ex:score", sc);
    const rate = s.r;
    let hint = "";
    if (!ok) {
      if (Math.abs(a - calc.fa(P.tdc, rate)) <= 1) hint = "That is F&amp;A on all direct costs. Remember to take the excludables out first. ";
      else if (P.sub && Math.abs(a - calc.fa(P.tdc - P.equip - P.tui - P.sub, rate)) <= 1) hint = "You left out the whole subaward. Part of it (up to the first $25k, shared across years) still counts in the base. ";
      else if (P.sub && Math.abs(a - calc.fa(P.tdc - P.equip - P.tui, rate)) <= 1) hint = "You kept the whole subaward in the base. Only the first $25k of it counts. ";
    }
    fb.innerHTML = note(ok ? "Correct. F&amp;A is " + money(s.fa) + "." : hint + "Not quite. The answer is " + money(s.fa) + ".", ok ? "ok" : "warn") + (ok ? "" : solutionHtml(s));
    const sp = panel.querySelector("#ex-pr-sc"); if (sp) sp.textContent = "Score on this phone: " + sc.r + " right out of " + sc.t + " tried.";
    panel.querySelector('[data-act="pr-check"]').disabled = true; inp.disabled = true;
  }
  W.pr = {
    n: 7, title: "Practice problems",
    why: "Random F&amp;A problems that mix equipment, tuition and a subaward in different years. Working them cold is the fastest way to get the base right on the Rascal test.",
    form() { return practiceHtml(); },
    out: null
  };

  /* ---------- panel plumbing ---------- */
  const IDS = ["mtdc", "fa", "sy", "pm", "md", "ph", "pr"];
  const SHORT = { mtdc: "MTDC", fa: "F&amp;A", sy: "Subawards", pm: "Person-months", md: "Modular", ph: "Salary cap", pr: "Practice" };

  function shell(id) {
    const w = W[id];
    return '<section class="card ex-w" id="ex-' + id + '" data-w="' + id + '">' +
      '<div class="ex-h"><span class="ex-n">' + w.n + "</span><h3>" + w.title + "</h3></div>" +
      '<p class="ex-why"><b>Why this matters:</b> ' + w.why + "</p>" +
      '<div class="ex-form"></div>' + (w.out ? '<div class="ex-out" aria-live="polite"></div>' : "") +
      (w.eg ? '<button type="button" class="ex-tog" data-act="eg" aria-expanded="false">Show worked example</button><div class="ex-eg" hidden></div>' : "") +
      "</section>";
  }
  function refresh(panel, id, full) {
    const el = panel.querySelector("#ex-" + id), w = W[id];
    if (!el) return;
    if (full) el.querySelector(".ex-form").innerHTML = w.form();
    if (w.out) el.querySelector(".ex-out").innerHTML = w.out();
    if (full && w.eg) el.querySelector(".ex-eg").innerHTML = w.eg();
  }

  SPA.tabs.exercises = {
    _calc: calc,
    render(panel) {
      load();
      panel.innerHTML =
        '<section class="ex-hero"><h2>🧮 Exercises</h2>' +
        '<p class="muted">Budget skills from Session 2 as small calculators, each with a worked example. Type your own numbers or load the example. Your last entries are kept on this phone.</p></section>' +
        '<nav class="ex-index" aria-label="Jump to a calculator">' +
        IDS.map(id => '<button type="button" data-act="jump" data-t="' + id + '"><span>' + W[id].n + "</span>" + SHORT[id] + "</button>").join("") + "</nav>" +
        IDS.map(shell).join("") +
        '<p class="ex-foot muted">A study aid built from the course materials. Real budgets need your SPA project officer and the current rates.</p>';
      IDS.forEach(id => refresh(panel, id, true));

      panel.addEventListener("input", e => {
        const t = e.target, k = t.dataset && t.dataset.k;
        if (!k) return;
        if (t.dataset.i != null) S[k][+t.dataset.i] = t.value; else S[k] = t.value;
        save();
        const w = t.closest(".ex-w"); if (w) refresh(panel, w.dataset.w, false);
      });
      panel.addEventListener("keydown", e => {
        if (e.key === "Enter" && e.target.id === "ex-pr-in") { e.preventDefault(); checkAnswer(panel); }
      });
      panel.addEventListener("click", e => {
        const b = e.target.closest("[data-act]"); if (!b) return;
        const act = b.dataset.act, wEl = b.closest(".ex-w"), id = wEl && wEl.dataset.w;
        if (act === "jump") { const t = panel.querySelector("#ex-" + b.dataset.t); t && t.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
        if (act === "eg") {
          const box = wEl.querySelector(".ex-eg"), open = box.hidden;
          box.hidden = !open; b.setAttribute("aria-expanded", String(open)); b.textContent = open ? "Hide worked example" : "Show worked example"; return;
        }
        if (act === "seg") { S[b.dataset.k] = b.dataset.v; save(); refresh(panel, id, true); return; }
        if (act === "add-sub") { if (S.subs.length < 6) S.subs.push(""); save(); refresh(panel, id, true); return; }
        if (act === "rm-sub") { S.subs.splice(+b.dataset.i, 1); if (!S.subs.length) S.subs = [""]; save(); refresh(panel, id, true); return; }
        if (act === "pull") { S.fa_mtdc = has(S.tdc) ? String(calc.mtdc({ tdc: num(S.tdc), equip: num(S.equip), cap: num(S.cap), pat: num(S.pat), tui: num(S.tui), rent: num(S.rent), subs: S.subs.map(num) }).mtdc) : S.fa_mtdc; S.fa_tdc = S.tdc || S.fa_tdc; save(); refresh(panel, id, true); return; }
        if (act === "load") { W[b.dataset.w].load(); save(); refresh(panel, b.dataset.w, true); const o = panel.querySelector("#ex-" + b.dataset.w + " .ex-out"); o && o.scrollIntoView({ behavior: "smooth", block: "nearest" }); return; }
        if (act === "infl") {
          const base = num(S.md_tdc[0]); if (!base) return;
          for (let y = 1; y < +S.md_n; y++) S.md_tdc[y] = String(Math.round(base * Math.pow(1.03, y)));
          save(); refresh(panel, id, true); return;
        }
        if (act === "pr-check") { checkAnswer(panel); return; }
        if (act === "pr-show") {
          const fb = panel.querySelector("#ex-pr-fb"), s = solve(P);
          fb.innerHTML = note("The answer is " + money(s.fa) + ".", "") + solutionHtml(s);
          return;
        }
        if (act === "pr-new") { P = genProblem(); Pdone = false; refresh(panel, "pr", true); const i = panel.querySelector("#ex-pr-in"); i && i.focus(); return; }
      });
    }
  };
})();
