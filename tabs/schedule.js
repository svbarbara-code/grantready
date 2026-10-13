/* schedule — owned by spa-schedule. Dated timeline, attendance rules, São Paulo times,
   the 3-year clock and the whole certificate roadmap. All wording is original/paraphrased. */
SPA.tabs.schedule = {
  render(panel) {
    const esc = SPA.esc, store = SPA.store;
    const EMAIL = "bsv2116@cumc.columbia.edu";
    const CLOCK_DEFAULT = "2026-10-06";   // assumed start of the 3-year window = first Essentials session
    const BUFFER = { id: "buf", code: "", title: "Buffer date", date: "2026-11-17" };

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const toDate = iso => { const p = iso.split("-").map(Number); return new Date(p[0], p[1] - 1, p[2]); };
    const days = iso => Math.round((toDate(iso) - today) / 86400000);
    const fmtLong = iso => toDate(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    const fmtShort = iso => toDate(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const dow = iso => toDate(iso).toLocaleDateString("en-US", { weekday: "short" });
    // US clocks change on Nov 1 2026; São Paulo has no DST -> offset ET→SP is +1h before, +2h after
    const spTime = iso => iso < "2026-11-01" ? "1:00–2:30 pm" : "2:00–3:30 pm";
    const relText = n => n === 0 ? "Today" : n === 1 ? "Tomorrow" : "in " + n + " days";

    const S = SPA.sessions;
    const held = S.filter(s => days(s.date) < 0).length;
    const nextS = S.find(s => days(s.date) >= 0);

    /* ---------- state kept on this phone ---------- */
    const reg = store.get("sched.reg", {});      // Zoom registered, per session id
    const att = store.get("sched.att", {});      // signed in + stayed, per session id
    let clockStart = store.get("sched.clockStart", CLOCK_DEFAULT);

    /* ---------- pieces ---------- */
    function nextUp() {
      if (!nextS) {
        return '<div class="sc-next"><div class="sc-next-title">All five Essentials sessions are behind you 🎉</div>' +
          '<div class="sc-next-meta">What is left: Foundations, the case studies and two Rascal tests (see the roadmap below).</div></div>';
      }
      const n = days(nextS.date);
      return '<div class="sc-next">' +
        '<div class="sc-next-when">' + esc(relText(n)) + ' · next live session</div>' +
        '<div class="sc-next-title">' + esc(nextS.title) + '</div>' +
        '<div class="sc-next-meta">' + esc(nextS.code) + ' · ' + esc(fmtLong(nextS.date)) + '</div>' +
        '<div class="sc-next-times">' +
          '<span><b>12:00–1:30 pm</b> New York</span>' +
          '<span><b>' + spTime(nextS.date) + '</b> São Paulo</span>' +
        '</div></div>';
    }

    function rules() {
      const R = [
        ["📡", "Live only", "Sessions are not recorded. Credit comes only from being on the Zoom while it runs."],
        ["⏱️", "Twenty-minute limit", "Join more than 20 minutes late or leave more than 20 minutes early and that session earns no credit."],
        ["✍️", "Sign in every session", "As soon as you join, type your name and your CUIMC email in the Zoom chat."],
        ["⚠️", "Be honest in the chat", "If you arrive late or leave early, say so in the chat. Hiding it counts as misrepresenting attendance, and that disqualifies you from the certificate."],
        ["🔁", "Make-ups", "Register for a later offering and attend the session with the same title. Titles matter, not the week. Only formally registered people are guaranteed a seat."]
      ];
      return '<section class="sc-rules" aria-labelledby="sc-rules-h">' +
        '<h3 id="sc-rules-h">Attendance rules</h3>' +
        '<p class="sc-rules-lead">Strict, and tied directly to the certificate.</p>' +
        '<ol class="sc-rule-list">' +
          R.map(r => '<li><span class="sc-rule-ic" aria-hidden="true">' + r[0] + '</span><div><b>' + esc(r[1]) + '</b><p>' + esc(r[2]) + '</p></div></li>').join("") +
        '</ol>' +
        '<div class="sc-signin"><div class="sc-signin-l">Sign-in email</div>' +
          '<div class="sc-signin-row"><code>' + esc(EMAIL) + '</code>' +
          '<button type="button" class="sc-btn" data-act="copy">Copy</button></div></div>' +
        '<p class="sc-rules-foot">Your attendance record lives in Rascal: My Rascal → My Test History.</p>' +
      '</section>';
    }

    function tlItem(s, isBuffer) {
      const n = days(s.date);
      const st = n < 0 ? "past" : n === 0 ? "today" : "upcoming";
      const stLabel = isBuffer ? (n < 0 ? "Not needed" : "Hold free") : (st === "past" ? "Past" : st === "today" ? "Today" : "Upcoming");
      const sp = spTime(s.date);
      let h = '<li class="sc-tl ' + st + (isBuffer ? ' buf' : '') + '" data-id="' + esc(s.id) + '">' +
        '<span class="sc-tl-dot" aria-hidden="true"></span>' +
        '<div class="sc-tl-card">' +
          '<div class="sc-tl-top">' +
            '<span class="sc-date"><b>' + esc(fmtShort(s.date)) + '</b> ' + esc(dow(s.date)) + '</span>' +
            '<span class="sc-chip sc-chip-' + st + '">' + esc(stLabel) + (st === "upcoming" && n <= 7 && !isBuffer ? ' · ' + esc(relText(n)) : '') + '</span>' +
          '</div>' +
          '<div class="sc-tl-title">' + esc(s.title) + '</div>' +
          (isBuffer
            ? '<div class="sc-tl-meta">Used only if a session gets rescheduled. Keep the slot open anyway.</div>'
            : '<div class="sc-tl-meta">' + esc(s.code) + ' · Zoom</div>') +
          '<div class="sc-tl-times"><span>12:00–1:30 pm ET</span><span>' + esc(sp) + ' SP</span></div>';
      if (!isBuffer) {
        h += '<div class="sc-tl-acts">' +
          '<button type="button" class="sc-tog' + (reg[s.id] ? ' on' : '') + '" data-tog="reg" data-id="' + esc(s.id) + '" aria-pressed="' + (!!reg[s.id]) + '">' +
            '<span class="sc-tog-box" aria-hidden="true">' + (reg[s.id] ? '✓' : '') + '</span>Zoom registered</button>' +
          '<button type="button" class="sc-tog' + (att[s.id] ? ' on' : '') + '" data-tog="att" data-id="' + esc(s.id) + '" aria-pressed="' + (!!att[s.id]) + '">' +
            '<span class="sc-tog-box" aria-hidden="true">' + (att[s.id] ? '✓' : '') + '</span>Signed in &amp; stayed</button>' +
        '</div>';
      }
      return h + '</div></li>';
    }

    function timeline() {
      return '<section aria-labelledby="sc-tl-h"><h3 id="sc-tl-h">Fall 2026 Essentials</h3>' +
        '<p class="muted sc-sub">Tuesdays on Zoom. Each session has its own registration link and password.</p>' +
        '<ol class="sc-timeline">' + S.map(s => tlItem(s, false)).join("") + tlItem(BUFFER, true) + '</ol>' +
        '<p class="muted sc-note">Tick the boxes to track yourself; they are saved on this phone only. Note the gap: there is no session on Nov 3, and the last one is Nov 10.</p>' +
      '</section>';
    }

    function spCard() {
      return '<section class="card sc-sp" aria-labelledby="sc-sp-h"><h3 id="sc-sp-h">🌎 São Paulo time</h3>' +
        '<div class="sc-sp-grid">' +
          '<div><div class="sc-sp-k">Oct 6 – Oct 27</div><div class="sc-sp-v">1:00–2:30 pm</div><div class="sc-sp-s">New York is 1 h ahead</div></div>' +
          '<div><div class="sc-sp-k">From Nov 1</div><div class="sc-sp-v">2:00–3:30 pm</div><div class="sc-sp-s">gap grows to 2 h</div></div>' +
        '</div>' +
        '<p class="muted sc-note">New York always starts at noon. The US moves its clocks back on Nov 1; Brazil stays put, so your afternoon slot slides one hour later for Nov 10 and Nov 17.</p>' +
      '</section>';
    }

    function clock() {
      const end = toDate(clockStart); end.setFullYear(end.getFullYear() + 3);
      const start = toDate(clockStart);
      const total = end - start, used = Math.max(0, Math.min(total, today - start));
      const pct = Math.round(used / total * 100);
      const left = Math.max(0, Math.round((end - today) / 86400000));
      const mo = Math.floor(left / 30.44);
      const endIso = end.getFullYear() + "-" + String(end.getMonth() + 1).padStart(2, "0") + "-" + String(end.getDate()).padStart(2, "0");
      return '<section class="card sc-clock" aria-labelledby="sc-clock-h"><h3 id="sc-clock-h">⏳ The 3-year clock</h3>' +
        '<p class="sc-clock-p">All five requirements have to be finished within three years of starting, and you must stay employed by Columbia the whole time.</p>' +
        '<div class="sc-bar" role="img" aria-label="' + pct + ' percent of the three years used"><span style="width:' + Math.max(pct, 1) + '%"></span></div>' +
        '<div class="sc-bar-l"><span>' + esc(fmtShort(clockStart)) + ', ' + start.getFullYear() + '</span><span><b>' + esc(fmtLong(endIso)) + '</b></span></div>' +
        '<div class="sc-clock-big"><b>' + mo + '</b> months left <span class="muted">(' + left + ' days)</span></div>' +
        '<label class="sc-field"><span>Clock start (assumed, not confirmed)</span>' +
          '<input type="date" id="sc-cs" value="' + esc(clockStart) + '"></label>' +
        '<p class="muted sc-note">I counted from the first Essentials session. Ask the program office which date they count from, then set it here.</p>' +
      '</section>';
    }

    function roadmap() {
      const prereq = (held >= S.length) ? "done" : "prog";
      const items = [
        { n: 1, t: "Research Compliance Foundations", st: "todo", lab: "To do",
          d: "10 sessions in general, 11 for CUIMC. Offered summer and winter. Plan: winter 2026–27, dates to be announced about two months before.",
          note: "Email the program office to get invited. Four of its sessions (TC4002–TC4005) are the stated prerequisites for Essentials." },
        { n: 2, t: "Sponsored Projects Essentials", st: prereq, lab: held >= S.length ? "Done" : "In progress",
          d: "Five Tuesday sessions, spring and fall. You joined by exception, before Foundations.",
          note: held + " of " + S.length + " sessions held so far (see timeline)." },
        { n: 3, t: "Review of online case studies", st: "wait", lab: "After Foundations", code: "TC0504",
          d: "Research-conduct case studies completed in Rascal." },
        { n: 4, t: "Post-Foundations test", st: "wait", lab: "After Foundations", code: "TC0097",
          d: "The CUIMC version of the Rascal test taken once Foundations is finished." },
        { n: 5, t: "Post-Essentials test", st: "next", lab: "Next once Essentials ends", code: "TC4017",
          d: "The CUIMC version of the Rascal test for Essentials. Confirm the test is open to you right after Nov 10." }
      ];
      const owed = items.filter(i => i.st !== "done");
      return '<section aria-labelledby="sc-rm-h"><h3 id="sc-rm-h">Certificate roadmap</h3>' +
        '<p class="muted sc-sub">Five requirements. Essentials alone does not earn the certificate.</p>' +
        '<div class="sc-owed"><b>' + owed.length + ' of 5 still open.</b> Beyond Essentials you still owe Foundations, the case studies and two Rascal tests.</div>' +
        '<ol class="sc-road">' + items.map(i =>
          '<li class="sc-req sc-req-' + i.st + '">' +
            '<span class="sc-req-n" aria-hidden="true">' + (i.st === "done" ? "✓" : i.n) + '</span>' +
            '<div class="sc-req-b">' +
              '<div class="sc-req-top"><b>' + esc(i.t) + '</b></div>' +
              '<div class="sc-req-tags"><span class="sc-chip sc-chip-' + i.st + '">' + esc(i.lab) + '</span>' +
                (i.code ? '<span class="sc-code">' + esc(i.code) + '</span>' : '') + '</div>' +
              '<p>' + esc(i.d) + '</p>' +
              (i.note ? '<p class="sc-req-note">' + esc(i.note) + '</p>' : '') +
            '</div></li>').join("") +
        '</ol>' +
        '<div class="card sc-todo"><h4>Next moves</h4><ul>' +
          '<li>Register on Zoom for each remaining session, one link per session.</li>' +
          '<li>Keep Tue Nov 17 free as the buffer.</li>' +
          '<li>Ask <a href="mailto:RCtraining@columbia.edu">RCtraining@columbia.edu</a> for the winter Foundations dates.</li>' +
          '<li>Certificates are issued in batches about twice a year, soon after Essentials ends, and the process is manual, so expect a wait.</li>' +
        '</ul></div>' +
      '</section>';
    }

    panel.innerHTML =
      '<section class="sc-hero"><h2>🗓️ Schedule</h2>' +
        '<p class="muted">Dates, attendance rules, São Paulo times and the road to the certificate.</p></section>' +
      nextUp() + rules() + timeline() + spCard() + clock() + roadmap();

    /* ---------- interactions ---------- */
    if (!panel._scBound) { panel._scBound = true; panel.addEventListener("click", ev => {
      const reg = store.get("sched.reg", {}), att = store.get("sched.att", {});
      const t = ev.target.closest("button"); if (!t) return;
      if (t.dataset.act === "copy") {
        const done = () => { t.textContent = "Copied ✓"; setTimeout(() => { t.textContent = "Copy"; }, 1600); };
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(EMAIL).then(done, done);
          else done();
        } catch (e) { done(); }
        return;
      }
      if (t.dataset.tog) {
        const map = t.dataset.tog === "reg" ? reg : att, id = t.dataset.id;
        map[id] = !map[id];
        store.set(t.dataset.tog === "reg" ? "sched.reg" : "sched.att", map);
        t.classList.toggle("on", !!map[id]);
        t.setAttribute("aria-pressed", String(!!map[id]));
        t.querySelector(".sc-tog-box").textContent = map[id] ? "✓" : "";
      }
    }); }
    const inp = panel.querySelector("#sc-cs");
    if (inp) inp.addEventListener("change", () => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(inp.value)) return;
      store.set("sched.clockStart", inp.value);
      SPA.tabs.schedule.render(panel);
    });
  },
  onShow(panel) { this.render(panel); }   // re-evaluate past/today/upcoming each visit
};
