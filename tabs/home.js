/* home — HUB-owned. Countdown to the next session + progress glance. */
SPA.tabs.home = {
  render(panel) {
    const S = SPA.sessions, esc = SPA.esc;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const d = iso => { const [y, m, day] = iso.split("-").map(Number); return new Date(y, m - 1, day); };
    const days = iso => Math.round((d(iso) - today) / 86400000);
    const next = S.find(s => days(s.date) >= 0);
    const done = S.filter(s => days(s.date) < 0).length;
    const relText = n => n === 0 ? "Today" : n === 1 ? "Tomorrow" : "in " + n + " days";
    const fmt = iso => d(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

    let nextHtml;
    if (next) {
      const n = days(next.date);
      nextHtml =
        '<div class="hm-next">' +
          '<div class="hm-when">' + esc(relText(n)) + (n > 1 ? '' : ' · 12:00 ET') + '</div>' +
          '<div class="hm-title">' + esc(next.title) + '</div>' +
          '<div class="hm-meta">' + esc(next.code) + ' · ' + esc(fmt(next.date)) + ' · Zoom</div>' +
          (n <= 1 ? '<div class="hm-sign">✍️ Sign in: type your name + <b>bsv2116@cumc.columbia.edu</b> in the Zoom chat. Miss ≤ 20 min or you lose credit.</div>' : '') +
        '</div>';
    } else {
      nextHtml = '<div class="hm-next"><div class="hm-title">Essentials sessions complete 🎉</div>' +
        '<div class="hm-meta">Next: Foundations (winter) + the Rascal tests.</div></div>';
    }

    const dots = S.map(s => {
      const past = days(s.date) < 0, isNext = next && s.id === next.id;
      return '<div class="hm-dot ' + (past ? 'past' : isNext ? 'now' : '') + '" title="' + esc(s.title) + '">' +
        '<span class="hm-code">' + esc(s.code.replace("TC40", "")) + '</span></div>';
    }).join("");

    panel.innerHTML =
      '<section class="hm-hero">' +
        '<h2>GrantReady</h2>' +
        '<p class="muted">Your Columbia <b>Certificate in Administration of Sponsored Projects</b> — in your pocket.</p>' +
      '</section>' +
      nextHtml +
      '<div class="card hm-prog">' +
        '<div class="hm-prog-top"><span class="pill">Essentials</span><span class="muted">' + done + ' / ' + S.length + ' attended</span></div>' +
        '<div class="hm-dots">' + dots + '</div>' +
      '</div>' +
      '<div class="card hm-tip">📲 <b>Add to Home Screen</b> to open GrantReady like an app — Share → “Add to Home Screen”.</div>' +
      '<p class="muted hm-foot">Study aid built from the course — your own notes, not the official handouts.</p>';
  }
};
