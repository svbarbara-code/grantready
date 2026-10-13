/* methods — spa-methods. Strategy tab: HOW to study (Homework = to-dos between sessions, Practice = daily drill). */
SPA.tabs.methods = (function () {
  const KEY = "methods:chk";   // { itemId: true }
  const OPEN = "methods:open"; // { sectionId: true }

  // ---- checklists (tick state persisted per phone) ----
  const LISTS = {
    zoom: { title: "Every live session", items: [
      ["z1", "Registered for this session's own Zoom link (each one is separate)"],
      ["z2", "Joined on time, typed name + work email in the chat right away"],
      ["z3", "Notes page ready: cues on the left, notes right, summary line at the bottom"],
      ["z4", "Phone on silent, one tab only, charger plugged in"],
      ["z5", "If I was late or left early: said so in the chat, with the time"],
      ["z6", "Within 10 minutes after: wrote down everything I remember, from memory"]
    ]},
    t4017: { title: "Countdown to TC4017 (after Essentials)", items: [
      ["a1", "Found out the test format, time limit, pass mark, attempts (ask RCtraining)"],
      ["a2", "Five sessions attended, all confirmed in My Test History"],
      ["a3", "~2 weeks out: every session has its flashcards made and in the drill"],
      ["a4", "~10 days out: one full mixed run-through, no notes, scored honestly"],
      ["a5", "~7 days out: wrote my top-5 weak spots and re-learned them"],
      ["a6", "~3 days out: light review only, number facts + definitions"],
      ["a7", "Night before: stopped early, set out what I need, slept"]
    ]},
    t0097: { title: "Countdown to TC0097 (after Foundations)", items: [
      ["b1", "Foundations dates found and registered (winter offering, dates TBD)"],
      ["b2", "Same routine per Foundations session: brain dump, cards, weekly mixed quiz"],
      ["b3", "Case studies (TC0504) done after Foundations, not left to the end"],
      ["b4", "Found out the TC0097 format and rules (it is the CUIMC version)"],
      ["b5", "Full mixed run-through a week before; weak-spot sweep after it"]
    ]},
    day: { title: "Exam-day checklist", items: [
      ["d1", "Read the test's own instructions first (what is allowed, how long, what happens on a timeout)"],
      ["d2", "Laptop charged or plugged in, stable internet, UNI login works"],
      ["d3", "Calendar blocked, quiet room, phone away, water nearby"],
      ["d4", "Paper + pen for working out numbers"],
      ["d5", "Ate something; no new cramming in the last hour, only my weak-spot list"],
      ["d6", "Skim every question once, answer the sure ones, flag the rest"],
      ["d7", "Read for NOT / EXCEPT / ALWAYS / ONLY before choosing"],
      ["d8", "Budget questions: write the formula, do the arithmetic, sanity-check the size"],
      ["d9", "Kept an eye on time at the halfway point"],
      ["d10", "Reviewed flagged items; changed an answer only with a concrete reason"],
      ["d11", "After: noted the result and checked it shows in My Test History"]
    ]}
  };

  const MIX = [
    "Person-months: turn a % effort and an appointment length into person-months.",
    "MTDC: start from total direct costs, take out the excluded pieces, then apply the rate.",
    "Which F&A rate applies? Decide by where more than half of the activity happens.",
    "Modular budget: round to modules, add the inflation step, check it fits under the limit.",
    "Subaward: which part counts toward the base, and which part falls out?",
    "Fringe: pick the right rate for government vs non-government sponsor.",
    "Salary cap: budget at the cap, then work out what the department covers.",
    "Cost sharing: classify it (mandatory, voluntary committed, uncommitted) and say what has to be documented.",
    "Equipment vs supplies: decide by the unit-cost threshold and where it lands in MTDC.",
    "Participant support vs research subjects vs consultants: sort the cost into the right bucket."
  ];

  const WEEK = [
    { d: "Mon", n: 1, t: "Preview (10 min)", s: "Register for Tuesday's Zoom if not done. Read the session title, write 3 questions you hope it answers." },
    { d: "Tue", n: 2, live: true, t: "Live session + brain dump", s: "12:00 ET (1:00 pm São Paulo in October; 2:00 pm from November). Sign in. After: 10 minutes writing what you remember, before touching the notes." },
    { d: "Wed", n: 3, t: "Tidy + make cards (25 min)", s: "Fix your notes while they're fresh. Turn 5 to 8 things you got wrong or fuzzy into cards. Do the Homework tab items." },
    { d: "Thu", n: 4, t: "Drill + 1 problem (20 min)", s: "Practice-tab drill, then one budget problem from Exercises." },
    { d: "Fri", n: 5, t: "Floor day (10 min)", s: "Just the drill. Nothing more is needed. Resting is part of the plan." },
    { d: "Sat", n: 6, t: "Mixed quiz (30-40 min)", s: "Interleaved: random topics, no notes, then mark yourself honestly. List weak spots." },
    { d: "Sun", n: 0, t: "Weak spots (10 min)", s: "Re-learn the list from Saturday. Then you're done for the week." }
  ];

  let state;
  const loadState = () => (state = SPA.store.get(KEY, {}) || {});
  const saveState = () => SPA.store.set(KEY, state);
  const isOpen = (id, dflt) => { const o = SPA.store.get(OPEN, {}) || {}; return id in o ? !!o[id] : !!dflt; };
  const setOpen = (id, v) => { const o = SPA.store.get(OPEN, {}) || {}; o[id] = v; SPA.store.set(OPEN, o); };

  function listHTML(key) {
    const L = LISTS[key];
    const done = L.items.filter(i => state[i[0]]).length;
    return '<div class="mt-chk-top"><h4>' + SPA.esc(L.title) + '</h4><span class="mt-count" data-count="' + key + '">' + done + '/' + L.items.length + '</span></div>' +
      '<ul class="mt-chk">' + L.items.map(i =>
        '<li><label><input type="checkbox" data-chk="' + i[0] + '" data-list="' + key + '"' + (state[i[0]] ? ' checked' : '') + '><span>' + SPA.esc(i[1]) + '</span></label></li>'
      ).join("") + '</ul>' +
      '<button class="mt-reset" data-reset="' + key + '">Clear ticks</button>';
  }

  function sec(id, icon, title, sub, body, dflt) {
    return '<details class="mt-sec" data-sec="' + id + '"' + (isOpen(id, dflt) ? ' open' : '') + '>' +
      '<summary><span class="mt-ic">' + icon + '</span><span class="mt-sum">' + title + '<small>' + sub + '</small></span><span class="mt-chev">›</span></summary>' +
      '<div class="mt-body">' + body + '</div></details>';
  }

  function nextLine() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (const s of SPA.sessions) {
      const d = new Date(s.date + "T12:00:00"); d.setHours(0, 0, 0, 0);
      const n = Math.round((d - today) / 86400000);
      if (n >= 0) {
        const when = n === 0 ? "today" : n === 1 ? "tomorrow" : "in " + n + " days";
        return 'Next live session: <b style="color:#fff">' + SPA.esc(s.code) + ' · ' + SPA.esc(s.title) + '</b> ' + when + '.';
      }
    }
    return "All five Essentials sessions are behind you. Now it's about TC4017.";
  }

  function body() {
    const dow = new Date().getDay();
    const week = '<ul class="mt-week">' + WEEK.map(w =>
      '<li class="' + (w.n === dow ? 'today ' : '') + (w.live ? 'live' : '') + '"><div class="mt-day">' + w.d + (w.n === dow ? '<small>today</small>' : '') + '</div>' +
      '<div class="mt-what"><b>' + SPA.esc(w.t) + '</b><span>' + SPA.esc(w.s) + '</span></div></li>').join("") + '</ul>';

    return '' +
      '<section class="mt-hero"><h2>🧭 Methods</h2>' +
      '<p class="muted">How to study for this certificate, in plain steps. This is the strategy; <b>Homework</b> has the to-dos between sessions and <b>Practice</b> is your daily drill.</p></section>' +

      '<div class="mt-three"><h3>The whole method in three lines</h3><ol>' +
      '<li><b>Retrieve, don\'t reread.</b> Close the notes and pull it out of your head first.</li>' +
      '<li><b>Space it.</b> Short and often beats long and once. Ten minutes a day is the floor.</li>' +
      '<li><b>Mix it.</b> Shuffle topics and budget problems so you learn to choose the method, not just run it.</li></ol>' +
      '<div class="mt-next">' + nextLine() + '</div></div>' +

      sec("recall", "🧠", "Active recall", "Test yourself instead of rereading",
        '<p>Rereading feels productive because the page looks familiar. Familiar is not the same as remembered. A test only measures what you can produce yourself, so practise producing it.</p>' +
        '<h4>Four ways, easiest first</h4><ol>' +
        '<li><b>Cover and say it.</b> Hide the answer, say it out loud, then check.</li>' +
        '<li><b>Blank page.</b> Write everything you know about a topic. Then open the notes and add what you missed in a different colour.</li>' +
        '<li><b>Teach it.</b> Explain the idea to an imaginary new colleague in 60 seconds, no jargon.</li>' +
        '<li><b>Ask the exam question.</b> "Which rate applies here and why?" beats "what is F&amp;A?"</li></ol>' +
        '<div class="mt-tip">Getting it wrong is useful. A miss tells you exactly what to put in tomorrow\'s drill. Score yourself honestly, nobody else sees it.</div>' +
        '<button class="mt-btn" data-go="practice">Open the daily drill →</button>', true) +

      sec("spaced", "📆", "Spaced repetition", "When to see each card again",
        '<p>Memory fades fast right after learning and slower each time you retrieve it. So revisit things just before you\'d forget them, and stretch the gap every time you get it right.</p>' +
        '<div class="mt-ladder"><div><b>1</b>day</div><div><b>3</b>days</div><div><b>1</b>week</div><div><b>2</b>weeks</div><div><b>1</b>month</div></div>' +
        '<ul><li><b>Got it?</b> Move it one step to the right.</li><li><b>Missed it?</b> Back to day 1. No guilt, that\'s the system working.</li>' +
        '<li>The Practice tab does the scheduling for you; your job is to show up for ten minutes.</li>' +
        '<li>Make the card the <b>same day</b> as the session, while you can still tell what mattered.</li></ul>' +
        '<h4>A good card</h4><ul><li>One fact or one decision per card.</li><li>The question forces a choice or a number, e.g. "which one applies when…?"</li><li>Written in your own words, so you actually understand it.</li></ul>' +
        '<button class="mt-btn" data-go="practice">Go to Practice →</button>') +

      sec("inter", "🔀", "Interleave the budget math", "Mix problem types on purpose",
        '<p>Doing ten of the same problem in a row feels smooth, but you only practise the arithmetic. On the test, nobody tells you which formula to use. Choosing the method is half the skill.</p>' +
        '<p class="muted" style="margin:0">Blocked (feels easy, sticks less):</p><div class="mt-seq"><i class="a">A</i><i class="a">A</i><i class="a">A</i><i class="b">B</i><i class="b">B</i><i class="b">B</i><i class="c">C</i><i class="c">C</i><i class="c">C</i></div>' +
        '<p class="muted" style="margin:0">Interleaved (feels harder, sticks more):</p><div class="mt-seq"><i class="a">A</i><i class="b">B</i><i class="c">C</i><i class="b">B</i><i class="c">C</i><i class="a">A</i><i class="c">C</i><i class="a">A</i><i class="b">B</i></div>' +
        '<ul><li>First learn each type once with a worked example. Then stop practising them in separate blocks.</li>' +
        '<li>Before computing, say out loud: <i>what kind of problem is this, and why?</i></li>' +
        '<li>Do the arithmetic on paper and check if the answer is a believable size.</li></ul>' +
        '<h4>Shuffle me a mixed set</h4><p class="muted" style="font-size:.84rem">Five problem types, random order. Solve one of each, then check.</p>' +
        '<ol class="mt-mix" id="mt-mix"></ol>' +
        '<button class="mt-btn ghost" id="mt-shuffle">🔀 Shuffle again</button><button class="mt-btn" data-go="exercises">Open Exercises →</button>') +

      sec("zoom", "🎧", "Notes in the live Zoom sessions", "Live only, not recorded, ≤ 20 min missed",
        '<div class="mt-warn"><b>The rules shape the method.</b> Credit needs you live, missing no more than 20 minutes in total. Sessions are not recorded and sign-in is typed in the chat. If you join late or leave early, say so in the chat. Hiding it risks the whole certificate.</div>' +
        '<h4>Before</h4><ul><li>Your three preview questions, written at the top.</li><li>Notes page split: <b>cues</b> on the left, <b>notes</b> on the right, <b>summary</b> at the bottom.</li></ul>' +
        '<div class="mt-page"><div class="l">Cues / questions<br><span class="muted">"Why 25k?"</span></div><div>Notes in your own words. ★ mark every number, threshold and "must".</div><div class="b">Summary in one sentence, written in the last 5 minutes</div></div>' +
        '<h4>During</h4><ul><li><b>Don\'t transcribe.</b> Capture rules, thresholds, exceptions and the examples the speaker works through.</li>' +
        '<li>Put a <b>?</b> where you lose the thread and keep going; sort it out afterwards.</li>' +
        '<li>Fewer, better notes. You can\'t replay anything, so presence beats completeness.</li>' +
        '<li>If you drop off for a technical reason, note the time and tell the chat when you\'re back.</li></ul>' +
        '<h4>After (the part that matters most)</h4><ul><li><b>Brain dump</b> within 10 minutes: close the notes, write what you remember. Then compare.</li>' +
        '<li>Fill gaps from the handout and the Content tab, in a different colour.</li>' +
        '<li>Same day: turn the ? marks and the misses into cards.</li></ul>' +
        listHTML("zoom")) +

      sec("week", "🗓️", "A simple weekly rhythm", "Built around the Tuesday sessions",
        '<p>About <b>2 hours a week</b>, in small pieces. If a day falls apart, skip that day and keep the next one.</p>' + week +
        '<div class="mt-tip">The minimum that keeps you on track is 10 minutes of drill. Everything else is a bonus. <b>Homework</b> lists the specific things to do between each pair of sessions.</div>' +
        '<button class="mt-btn" data-go="homework">Open Homework →</button><button class="mt-btn ghost" data-go="schedule">Dates &amp; Zoom →</button>') +

      sec("rascal", "🎯", "Preparing for the Rascal tests", "TC4017 (CUIMC, after Essentials) · TC0097 (after Foundations)",
        '<p>Two tests, two moments. Both are the CUIMC versions. Aim to be calm and well-spaced, not cramming.</p>' +
        '<ul><li><b>TC4017</b> comes after Essentials. The last session is Tuesday 10 November.</li>' +
        '<li><b>TC0097</b> comes after Foundations (winter, dates TBD). Case studies in TC0504 sit in between.</li></ul>' +
        '<div class="mt-warn"><b>Find out first, don\'t guess.</b> Check the test\'s format, time limit, pass mark, number of attempts and whether notes are allowed. Ask RCtraining if the Rascal page doesn\'t say. This app doesn\'t assume any of it.</div>' +
        '<h4>How to study for it</h4><ul><li>Treat it as <b>retrieval practice with a deadline</b>: mixed questions, no notes, honest scoring.</li>' +
        '<li>Expect applied questions ("a PI wants to…, which applies?") more than word-for-word definitions. Know the <i>why</i>.</li>' +
        '<li>Keep a running <b>weak-spot list</b>. The final week is for that list, not for rereading everything.</li>' +
        '<li>Your attendance record (My Test History) is where credit shows up. Check it after every session.</li></ul>' +
        listHTML("t4017") + listHTML("t0097")) +

      sec("exam", "✅", "Exam-day checklist", "Calm, boring and prepared",
        '<p>The point of a checklist is to remove decisions on the day. Tick as you go.</p>' + listHTML("day") +
        '<div class="mt-tip">Blank on a question? Write down anything related you do remember (rule, number, definition), then re-read the question. It often unlocks the rest.</div>') +

      sec("keep", "🌱", "When it gets hard", "Keep it small, keep it going",
        '<ul><li><b>You are doing this alongside a full job.</b> A 10-minute day counts. A missed week doesn\'t erase anything; just restart at the next Tuesday.</li>' +
        '<li>Out of time? Do <i>only</i> the brain dump after each session. It\'s the highest-value ten minutes.</li>' +
        '<li>Foundations still has to come. The habit you build now carries over, so this is not wasted effort.</li>' +
        '<li>Stuck on a concept? Check the Content tab, then ask in the session or email RCtraining. Asking is part of the study.</li></ul>') +

      '<p class="muted mt-foot">Study tips here are general evidence-based practice (retrieval, spacing, interleaving) written for this course. Always follow the official rules for attendance and testing.</p>';
  }

  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function fillMix(panel) {
    const ol = panel.querySelector("#mt-mix"); if (!ol) return;
    ol.innerHTML = shuffle(MIX).slice(0, 5).map(t => '<li>' + SPA.esc(t) + '</li>').join("");
  }
  function refreshCount(panel, key) {
    const el = panel.querySelector('[data-count="' + key + '"]'); if (!el) return;
    el.textContent = LISTS[key].items.filter(i => state[i[0]]).length + "/" + LISTS[key].items.length;
  }

  return {
    render(panel) {
      loadState();
      panel.innerHTML = body();
      fillMix(panel);
      panel.addEventListener("change", e => {
        const c = e.target.closest("[data-chk]"); if (!c) return;
        if (c.checked) state[c.dataset.chk] = true; else delete state[c.dataset.chk];
        saveState(); refreshCount(panel, c.dataset.list);
      });
      panel.addEventListener("click", e => {
        const g = e.target.closest("[data-go]"); if (g) { SPA.go(g.dataset.go); return; }
        if (e.target.closest("#mt-shuffle")) { fillMix(panel); return; }
        const r = e.target.closest("[data-reset]");
        if (r) {
          const k = r.dataset.reset;
          LISTS[k].items.forEach(i => delete state[i[0]]);
          saveState();
          panel.querySelectorAll('[data-list="' + k + '"]').forEach(x => { x.checked = false; });
          refreshCount(panel, k);
        }
      });
      panel.addEventListener("toggle", e => {
        const d = e.target; if (d.matches && d.matches("details[data-sec]")) setOpen(d.dataset.sec, d.open);
      }, true);
    },
    onShow(panel) {
      // keep "today" highlight and next-session line fresh when reopened on a new day
      const keep = panel.querySelectorAll("details[data-sec]");
      const open = Array.from(keep).map(d => d.open);
      loadState(); panel.innerHTML = body();
      panel.querySelectorAll("details[data-sec]").forEach((d, i) => { d.open = open[i]; });
      fillMix(panel);
    }
  };
})();
