/* practice — spa-practice. Leitner flashcard drill. Cards are original paraphrases, not handout text. */
SPA.tabs.practice = (function () {
  const esc = SPA.esc;
  const KEY = "practice";
  const BOXES = 5;
  const GAP = [0, 1, 2, 4, 8, 16];   // days until next review, by box (index = box); box 1 = every day
  const NEW_PER_DAY = 12;

  const SESS = {
    spa1: { label: "Session 1", sub: "Proposal" },
    spa2: { label: "Session 2", sub: "Budget" }
  };

  // ---- the deck ---------------------------------------------------------------------------
  // s = session, t = topic tag, q/a = front/back (my own wording)
  const DECK = [
    // Session 1 — preparing the proposal
    { id: "p01", s: "spa1", t: "Mechanisms", q: "How does a cooperative agreement differ from a plain grant?",
      a: "Both are financial assistance. With a grant the sponsor stays hands-off and the PI shapes the approach. In a cooperative agreement, sponsor staff take a real, substantial role: they guide, coordinate or join in the work, so responsibility is shared." },
    { id: "p02", s: "spa1", t: "Mechanisms", q: "What marks a contract (in the sponsor sense) and what governs a federal one?",
      a: "It is a procurement deal: the sponsor sets the requirements and buys a specific product or service for its own use, usually answering an RFP. Federal contracts follow the FAR; federal grants and cooperative agreements follow the Uniform Guidance (2 CFR 200); private foundations follow their own terms." },
    { id: "p03", s: "spa1", t: "Mechanisms", q: "A foundation calls its award a “grant.” Does that label settle which mechanism it is?",
      a: "No. What the award actually requires decides it, not the name on the cover. Labels from private sponsors don’t always match the federal meanings." },
    { id: "p04", s: "spa1", t: "NOFO", q: "What is a NOFO, and what other names does it go by?",
      a: "It is the formal announcement that funding is available. It tells you who is eligible, how applications are judged, what must be included and how to submit. Also seen as FOA, PA, RFA, parent announcement or solicitation." },
    { id: "p05", s: "spa1", t: "NOFO", q: "The NOFO and the sponsor’s general application guide say different things. Which one wins?",
      a: "The NOFO. Keep the NOFO, the application instructions and the required forms in front of you, follow them exactly, and never reuse old or expired forms." },
    { id: "p06", s: "spa1", t: "Roles", q: "When can the PI contact the sponsor directly, and when must the request go through the SPA Project Officer?",
      a: "Direct contact is fine for science questions, such as asking the scientific contact whether the NOFO fits. Anything that asks permission or clarifies policy or terms (prior approvals, reduced effort, carryover) goes through the SPA Project Officer." },
    { id: "p07", s: "spa1", t: "Timeline", q: "What is the proposal timeline to work backward from the sponsor’s deadline?",
      a: "Build the application 2–8 weeks ahead. SPA wants the complete package about 5 business days before the deadline for review, and the PO submits it roughly 2 business days before. Submit early." },
    { id: "p08", s: "spa1", t: "Rascal", q: "What does a PI or department register in Rascal before a proposal goes out?",
      a: "A Rascal Proposal Tracking (PT) sheet. It is completed, routed to every involved department for approval, and finalized by the PI. The SPA PO can un-finalize it for edits, then the PI finalizes again." },
    { id: "p09", s: "spa1", t: "COI", q: "Who has to file a conflict-of-interest disclosure, and how often?",
      a: "Every Investigator: the PI plus anyone responsible for the design, conduct or reporting of the research, whatever their title (this can include postdocs and students). Disclosures are annual and must be current before SPA can submit the proposal." },
    { id: "p10", s: "spa1", t: "Personnel", q: "Who counts as key personnel, and can one be listed at “zero” or “as needed” effort?",
      a: "People who contribute to the science in a substantive, measurable way, paid or not. Zero or as-needed effort is not acceptable for them. (On NIH forms, people with no measurable effort go under Other Significant Contributors.) Consultants can be key personnel but can’t be Columbia employees." },
    { id: "p11", s: "spa1", t: "Subawards", q: "Subrecipient or contractor: how do you tell?",
      a: "A subrecipient makes programmatic decisions, contributes effort tied directly to the project’s aims and holds publication rights. A contractor only provides goods or services. The PI decides from the nature of the work, and the choice matters because it affects indirect costs." },
    { id: "p12", s: "spa1", t: "Subawards", q: "What does SPA need at minimum for each proposed subrecipient?",
      a: "A subrecipient/contractor classification form, a statement of work, a detailed budget and justification, biosketches for its key people, current & pending support if required, and a letter of intent from the subrecipient." },
    { id: "p13", s: "spa1", t: "NOFO", q: "A solicitation says “one application per institution.” What now?",
      a: "That’s a limited submission. Tell your SPA PO right away: the institution picks its nominee internally (through the Office of Research Initiatives and Development), and only the nominee may apply, through SPA." },
    { id: "p14", s: "spa1", t: "Agreements", q: "A collaborator emails you a DUA or MTA to sign. What do you do?",
      a: "Don’t sign it. Only an authorized signatory of the University can sign any agreement, including data use, material transfer and confidentiality agreements. Send it to your SPA Project Officer." },

    // Session 2 — preparing the budget
    { id: "b01", s: "spa2", t: "Cost sharing", q: "What is cost sharing?",
      a: "The part of a project’s cost that is not paid with sponsor (federal) money. The institution or a third party covers it." },
    { id: "b02", s: "spa2", t: "Cost sharing", q: "Mandatory, voluntary committed (VCCS) and uncommitted cost sharing: what separates them?",
      a: "Mandatory: the NOFO requires it. Voluntary committed: offered and written into the proposal or award although nobody required it. Uncommitted: contributed, but neither required nor promised. The first two are “committed.”" },
    { id: "b03", s: "spa2", t: "Cost sharing", q: "Which sponsor flatly prohibits voluntary committed cost sharing, and what is the general advice on it?",
      a: "NSF prohibits it. Elsewhere it is very strongly discouraged, so only offer it when the NOFO requires it." },
    { id: "b04", s: "spa2", t: "Cost sharing", q: "What paperwork backs a cost-share commitment at submission?",
      a: "The funding source account must be identified and approved and entered in Rascal PT, and the Chair signs a cost-share/guarantee letter to the SPA PO. (No letter is needed when the sponsor applies a salary cap.)" },
    { id: "b05", s: "spa2", t: "Basics", q: "Sort these: PI salary, travel, lab supplies, utilities, library, equipment. Direct or indirect?",
      a: "Direct: salary, travel, supplies, equipment (also consultants, patient care, renovations, consortium costs). Indirect (F&A): utilities, library and the like, i.e. building, admin and infrastructure costs that can’t be traced to one project." },
    { id: "b06", s: "spa2", t: "Basics", q: "Two housekeeping rules when you start a budget?",
      a: "Read the NOFO for budget limits first (banned expense types, category caps, an overall ceiling) and check whether cost sharing is required. Then round every figure to whole dollars." },
    { id: "b07", s: "spa2", t: "Salary", q: "What is IBS (Institutional Base Salary), and what stays out of it?",
      a: "The annual pay Columbia sets for the appointment. It leaves out bonuses and one-time or incentive pay, outside salary such as HHMI or NYSPI, and consulting income. You can’t raise it by swapping University funds for grant funds." },
    { id: "b08", s: "spa2", t: "Salary", q: "How is IBS built for CUIMC clinical faculty?",
      a: "Base salary plus any guaranteed additional compensation: IBS = X + Y." },
    { id: "b09", s: "spa2", t: "Salary", q: "How much summer salary can a 9-month academic appointee charge, and what has to happen?",
      a: "At most three-ninths (3/9) of the academic-year salary, each summer month being one month of full-time effort. The effort must really be spent in the summer. Released time needs Chair/Dean approval." },
    { id: "b10", s: "spa2", t: "Salary", q: "What salary limit does NSF place on senior personnel?",
      a: "No more than 2 months of salary per year in total across all their NSF grants. Going beyond that needs NSF approval through the award notice." },
    { id: "b11", s: "spa2", t: "Person-months", q: "How do you convert percent effort into person-months? Try 25% of a 9-month appointment.",
      a: "Percent effort × months in the appointment. 25% × 9 = 2.25 person-months. (Other checks: 10% of 12 months = 1.2; 35% of a 3-month summer = 1.05.)" },
    { id: "b12", s: "spa2", t: "Salary", q: "Can you direct-charge administrative or clerical salaries?",
      a: "Normally no, since they’re recovered through indirect costs. The exception is when the work is integral and identifiable to the project, is shown in the budget and justification (it counts as a prior-approval item), and isn’t also in the indirect pool." },
    { id: "b13", s: "spa2", t: "Fringe", q: "What are the FY27 fringe rates (from 7/1/2026)?",
      a: "30.7% on government-funded salaries and 35% on non-government. Use these for budgeting until SPA announces a change." },
    { id: "b14", s: "spa2", t: "Salary", q: "What is the PHS/NIH salary cap now, and how do you budget a person whose IBS exceeds it?",
      a: "$228,000 (effective Jan 2026). Budget at the cap and explain that in the justification; use the person’s true IBS only for sponsors with no cap. Example: $300k IBS at 10% + 30.7% fringe comes to about $29,800 under the cap vs $39,210 actual, so the department absorbs about $9,410." },
    { id: "b15", s: "spa2", t: "Students", q: "Graduate research assistants: fringe, and the NIH compensation ceiling?",
      a: "Their salary is chargeable to the project and carries no fringe. NIH limits grad-student pay to the zero-level NRSA stipend, $63,480. Tuition remission is not part of salary: it goes under Other costs." },
    { id: "b16", s: "spa2", t: "Students", q: "Postdoc stipend versus salary: why does it matter?",
      a: "A postdoc paid as an employee (Research Scientist) receives salary, which can go on a project. A fellow receives a stipend, which generally can’t be charged to a research project unless the award itself calls for it." },
    { id: "b17", s: "spa2", t: "Consultants", q: "What makes someone a consultant rather than staff or a subrecipient?",
      a: "An outside expert paid a fee for service who uses their own equipment, handles their own taxes, isn’t a Columbia employee and doesn’t do programmatic work or deliverables. Columbia keeps the IP. A classification form is needed and the agreement is set up via Purchasing after award." },
    { id: "b18", s: "spa2", t: "Equipment", q: "What is the equipment threshold, and what about a $3,000 laptop?",
      a: "Equipment is $5,000 or more per unit and is left out of MTDC. Computing devices under $5,000 can still be charged directly if they are essential, allocable and documented." },
    { id: "b19", s: "spa2", t: "Travel", q: "Which airline rule applies to federally funded travel, and where does NSF want travel itemized?",
      a: "The Fly America Act: use U.S. flag carriers. NSF wants it itemized by destination on Line E. The travel line is also not the place for study-subject costs." },
    { id: "b20", s: "spa2", t: "Subawards", q: "How do you budget a subaward’s indirect costs?",
      a: "Show direct and indirect separately, backed by the sub’s detailed budget, justification and SOW. Columbia charges its own indirect on only the first $25,000 of the subaward. The sub’s rate is its negotiated rate (NICRA) if it has one; otherwise the 15% de minimis of MTDC, or 10% under NIH." },
    { id: "b21", s: "spa2", t: "Subawards", q: "A $40,000 subaward in year 1 and Columbia direct costs of $100,000: what is the year-1 MTDC? (assume nothing else is excluded)",
      a: "$100,000 + $25,000 (the first $25k of the subaward counts in the base) = $125,000. At the 64.5% on-campus rate, F&A is $80,625. Once $25k has been counted, later years add nothing further for that subaward." },
    { id: "b22", s: "spa2", t: "Participant support", q: "What are participant support costs and what treatment do they get?",
      a: "Money for people attending a conference or training: stipends, subsistence, travel, registration, dependent care. Not for research subjects, staff or consultants. They are excluded from MTDC, may be added without prior approval if the NOFO/award allows, but can’t be rebudgeted out of that category without agency approval." },
    { id: "b23", s: "spa2", t: "Patient care", q: "What goes into research patient care costs?",
      a: "Outpatient items (such as MRI or X-ray) and inpatient care. Professional fees are left out. Patient care is excluded from MTDC." },
    { id: "b24", s: "spa2", t: "F&A", q: "What are Columbia’s three research F&A rate types, and how is the one for an award chosen?",
      a: "On-campus (64.5%), modified off-campus (28.5%) and off-campus (26%), rates for FY25 until amended; Lamont on-campus is 55.5%. One rate applies per award, set by where more than half of the activity happens. Only Columbia personnel count, not subawardees." },
    { id: "b25", s: "spa2", t: "F&A", q: "Where does the F&A rate itself come from?",
      a: "A federally negotiated agreement (the NICRA, negotiated with HHS), not something set grant by grant. Non-research (OSA) rates are 33% on-campus and 26% off-campus. For non-profit foundations the sponsor’s rate applies, or SPA aims for the federal rate." },
    { id: "b26", s: "spa2", t: "MTDC", q: "Define MTDC and give the formula.",
      a: "Modified Total Direct Costs: total direct costs minus excluded items (equipment, capital expenditures, patient care, tuition remission, off-site rent, and any subaward portion past $25k). F&A = MTDC × F&A rate. It does include salaries, fringe, supplies, services, travel, subject payments and the first $25k of each subaward." },
    { id: "b27", s: "spa2", t: "MTDC", q: "Total direct costs $200,000 include $20,000 of equipment and a $40,000 subaward. On-campus F&A?",
      a: "$200,000 − $20,000 equipment − ($40,000 − $25,000 = $15,000 of the subaward over the line) = $165,000 MTDC. × 64.5% = $106,425." },
    { id: "b28", s: "spa2", t: "Modular", q: "When may an NIH application use a modular budget?",
      a: "For research applications asking $250,000 or less in direct costs per year, under activity codes R01, R03, R15, R21 or R34. Consortium F&A isn’t counted toward the cap." },
    { id: "b29", s: "spa2", t: "Modular", q: "How do you size a modular request?",
      a: "Build the detailed budget by year with about 3% annual inflation, subtract consortium F&A, then round to the nearest $25,000 module. Keep the module count the same each year, except to add back one-time equipment. Justify personnel, consortium (rounded to $1,000) and additional narrative." },
    { id: "b30", s: "spa2", t: "Justification", q: "What does the budget justification do?",
      a: "It explains every budget line in words: why each person, item and trip is needed. Items that are normally unallowable must be justified explicitly, and equipment is approved line by line by the sponsor." }
  ];
  const BY_ID = {}; DECK.forEach(c => { BY_ID[c.id] = c; });

  // ---- state ------------------------------------------------------------------------------
  const iso = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const todayStr = () => iso(new Date());
  const addDays = (s, n) => { const [y, m, d] = s.split("-").map(Number); return iso(new Date(y, m - 1, d + n)); };

  function load() {
    let st = SPA.store.get(KEY);
    if (!st || typeof st !== "object") st = {};
    if (!st.cards || typeof st.cards !== "object") st.cards = {};
    if (!st.intro || st.intro.day !== todayStr()) st.intro = { day: todayStr(), ids: [] };
    if (!st.log || typeof st.log !== "object") st.log = {};
    return st;
  }
  let st = load();
  const save = () => SPA.store.set(KEY, st);

  const ui = { view: "home", scope: "due", queue: [], idx: 0, flipped: false, total: 0, again: 0, got: 0, relapsed: {}, panel: null };

  const isNew = id => !st.cards[id];
  const dueNow = id => { const c = st.cards[id]; return c && c.due <= todayStr(); };

  function pool(scope) {
    if (scope === "all") return DECK.slice();
    if (scope === "due") return dueQueue(DECK);
    return DECK.filter(c => c.s === scope);
  }
  // due cards (oldest due first, then lowest box), plus new cards up to the daily allowance
  function dueQueue(list) {
    const due = list.filter(c => dueNow(c.id)).sort((x, y) => {
      const a = st.cards[x.id], b = st.cards[y.id];
      return a.due < b.due ? -1 : a.due > b.due ? 1 : a.box - b.box;
    });
    const fresh = list.filter(c => isNew(c.id));
    const carried = fresh.filter(c => st.intro.ids.indexOf(c.id) >= 0);          // started today, not yet answered
    const slots = Math.max(0, NEW_PER_DAY - st.intro.ids.length);
    const extra = fresh.filter(c => st.intro.ids.indexOf(c.id) < 0).slice(0, slots);
    return due.concat(carried, extra);
  }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  function counts() {
    const box = [0, 0, 0, 0, 0, 0]; let fresh = 0, due = 0;
    DECK.forEach(c => { const s = st.cards[c.id]; if (!s) { fresh++; return; } box[s.box]++; if (s.due <= todayStr()) due++; });
    const toDo = dueQueue(DECK).length;
    return { box, fresh, due, toDo };
  }

  // ---- views ------------------------------------------------------------------------------
  function scopeCount(key) { return key === "due" ? dueQueue(DECK).length : key === "all" ? DECK.length : DECK.filter(c => c.s === key).length; }

  function renderHome() {
    const n = counts();
    const total = DECK.length, learnt = n.box[4] + n.box[5];
    const maxBox = Math.max(1, n.fresh, n.box[1], n.box[2], n.box[3], n.box[4], n.box[5]);
    const bar = (lbl, v, cls, hint) =>
      '<div class="pr-row"><span class="pr-lbl">' + lbl + '</span><span class="pr-track"><span class="pr-fill ' + cls + '" style="width:' + Math.round(v / maxBox * 100) + '%"></span></span><span class="pr-num">' + v + '</span></div>';
    const streak = streakDays();
    const scopes = [["due", "Due today", scopeCount("due")], ["all", "All cards", scopeCount("all")]]
      .concat(Object.keys(SESS).map(k => [k, SESS[k].label, scopeCount(k)]));
    const chips = scopes.map(s =>
      '<button type="button" class="pr-chip' + (ui.scope === s[0] ? ' on' : '') + '" data-scope="' + s[0] + '" aria-pressed="' + (ui.scope === s[0]) + '">' +
      esc(s[1]) + ' <span class="pr-chip-n">' + s[2] + '</span></button>').join("");
    const picked = scopeCount(ui.scope);
    const subline = ui.scope === "due" ? (n.toDo ? n.toDo + ' card' + (n.toDo === 1 ? '' : 's') + ' ready — up to ' + NEW_PER_DAY + ' new a day.' : 'You’re all caught up. Come back tomorrow, or drill a scope below anyway.')
      : ui.scope === "all" ? 'Every card in shuffled order — extra practice, due dates stay as they are for cards you already know.'
      : SESS[ui.scope].label + ' · ' + SESS[ui.scope].sub + ' — practice this session’s cards.';
    ui.panel.innerHTML =
      '<section class="pr-hero"><h2>🎴 Practice</h2><p class="muted">Leitner boxes: miss a card and it returns tomorrow; get it right and it waits longer each time.</p></section>' +
      '<div class="card pr-sum">' +
        '<div class="pr-sum-top"><span class="pill">Mastery</span><span class="muted">' + learnt + ' of ' + total + ' in boxes 4–5' + (streak ? ' · 🔥 ' + streak + '-day streak' : '') + '</span></div>' +
        bar('New', n.fresh, 'f0', '') + bar('Box 1', n.box[1], 'f1', '') + bar('Box 2', n.box[2], 'f2', '') + bar('Box 3', n.box[3], 'f3', '') + bar('Box 4', n.box[4], 'f4', '') + bar('Box 5', n.box[5], 'f5', '') +
        '<p class="pr-hint muted">Box 1 returns daily · 2 every 2 days · 3 every 4 · 4 every 8 · 5 every 16.</p>' +
      '</div>' +
      '<div class="card pr-pick"><div class="pr-pick-h">Scope</div><div class="pr-chips" role="group" aria-label="Choose cards">' + chips + '</div>' +
        '<p class="muted pr-sub">' + esc(subline) + '</p>' +
        '<button type="button" class="pr-btn pr-go" data-act="start"' + (picked ? '' : ' disabled') + '>' + (picked ? 'Start · ' + (ui.scope === "due" ? n.toDo : picked) + ' cards' : 'Nothing due') + '</button></div>' +
      '<div class="pr-foot"><button type="button" class="pr-link" data-act="reset">Reset all progress</button></div>';
  }

  function streakDays() {
    let d = todayStr(), n = 0;
    if (!st.log[d]) d = addDays(d, -1);        // today not started yet — streak still alive from yesterday
    while (st.log[d]) { n++; d = addDays(d, -1); }
    return n;
  }

  function startDrill() {
    let list = pool(ui.scope);
    if (!list.length) return;
    list = shuffle(list.slice());
    ui.queue = list.map(c => c.id); ui.idx = 0; ui.flipped = false; ui.total = ui.queue.length; ui.again = 0; ui.got = 0; ui.relapsed = {};
    ui.view = "drill";
    list.forEach(c => { if (isNew(c.id) && st.intro.ids.indexOf(c.id) < 0 && ui.scope === "due") st.intro.ids.push(c.id); });
    save(); renderDrill();
  }

  function renderDrill() {
    if (ui.idx >= ui.queue.length) return renderDone();
    const c = BY_ID[ui.queue[ui.idx]], cs = st.cards[c.id];
    const boxLbl = cs ? 'Box ' + cs.box : 'New';
    const pct = Math.round(ui.idx / Math.max(1, ui.queue.length) * 100);
    ui.panel.innerHTML =
      '<div class="pr-top"><button type="button" class="pr-back" data-act="quit" aria-label="Back to Practice">‹ Back</button>' +
        '<span class="pr-count">' + (ui.idx + 1) + ' / ' + ui.queue.length + '</span></div>' +
      '<div class="pr-prog" aria-hidden="true"><span style="width:' + pct + '%"></span></div>' +
      '<div class="pr-meta"><span class="pill">' + esc(SESS[c.s].label) + ' · ' + esc(c.t) + '</span><span class="pr-box b' + (cs ? cs.box : 0) + '">' + boxLbl + '</span></div>' +
      '<div class="pr-stage"><div class="pr-card' + (ui.flipped ? ' flip' : '') + '" role="button" tabindex="0" data-act="flip" aria-label="Flip card" aria-pressed="' + ui.flipped + '">' +
        '<div class="pr-face pr-front"><div class="pr-tag">Question</div><div class="pr-text">' + esc(c.q) + '</div><div class="pr-tap">Tap to reveal</div></div>' +
        '<div class="pr-face pr-back"><div class="pr-tag">Answer</div><div class="pr-text pr-ans">' + esc(c.a) + '</div></div>' +
      '</div></div>' +
      '<div class="pr-actions' + (ui.flipped ? ' on' : '') + '">' +
        '<button type="button" class="pr-btn pr-again" data-act="again"' + (ui.flipped ? '' : ' disabled') + '>↺ Again<small>' + (counted(c.id) ? 'back to box 1' : 'try again soon') + '</small></button>' +
        '<button type="button" class="pr-btn pr-got" data-act="got"' + (ui.flipped ? '' : ' disabled') + '>✓ Got it<small>' + gotHint(c.id) + '</small></button>' +
      '</div>' +
      '<button type="button" class="pr-btn pr-show' + (ui.flipped ? ' gone' : '') + '" data-act="flip"' + (ui.flipped ? ' tabindex="-1" aria-hidden="true"' : '') + '>Show answer</button>';
    const card = ui.panel.querySelector(".pr-card");
    if (card) card.focus({ preventScroll: true });
  }

  function counted(id) { return ui.scope === "due" || isNew(id) || dueNow(id); }   // practice-only passes leave not-yet-due cards alone

  function gotHint(id) {
    if (ui.relapsed[id]) return 'stays in box 1';
    if (!counted(id)) return 'extra practice';
    const cs = st.cards[id], nbox = cs ? Math.min(BOXES, cs.box + 1) : 2;
    return 'to box ' + nbox + ' · back in ' + GAP[nbox] + ' day' + (GAP[nbox] === 1 ? '' : 's');
  }

  function flip() {
    ui.flipped = !ui.flipped;
    const card = ui.panel.querySelector(".pr-card"); if (!card) return;
    card.classList.toggle("flip", ui.flipped);
    card.setAttribute("aria-pressed", String(ui.flipped));
    ui.panel.querySelectorAll(".pr-actions .pr-btn").forEach(b => { b.disabled = !ui.flipped; });
    const act = ui.panel.querySelector(".pr-actions"); if (act) act.classList.toggle("on", ui.flipped);
    const show = ui.panel.querySelector(".pr-show"); if (show) { show.classList.toggle("gone", ui.flipped); show.tabIndex = ui.flipped ? -1 : 0; }
  }

  function answer(ok) {
    if (!ui.flipped) return;
    const id = ui.queue[ui.idx], t = todayStr(), cs = st.cards[id];
    if (ok) {
      ui.got++;
      if (!ui.relapsed[id] && counted(id)) {
        const box = cs ? Math.min(BOXES, cs.box + 1) : 2;
        st.cards[id] = { box: box, due: addDays(t, GAP[box]), seen: (cs ? cs.seen : 0) + 1, last: t };
      }
    } else {
      ui.again++;
      if (counted(id)) {
        st.cards[id] = { box: 1, due: addDays(t, 1), seen: (cs ? cs.seen : 0) + 1, last: t };
      }
      ui.relapsed[id] = (ui.relapsed[id] || 0) + 1;
      if (ui.relapsed[id] <= 2) ui.queue.push(id);   // retry later this round (twice at most)
    }
    st.log[t] = (st.log[t] || 0) + 1;
    save();
    ui.idx++; ui.flipped = false;
    renderDrill();
  }

  function renderDone() {
    const n = counts(), streak = streakDays();
    ui.view = "done";
    const first = ui.total ? Math.round((ui.total - Object.keys(ui.relapsed).length) / ui.total * 100) : 0;
    ui.panel.innerHTML =
      '<section class="pr-hero"><h2>' + (ui.again === 0 ? '🎉 Clean sweep' : '✅ Round done') + '</h2>' +
      '<p class="muted">' + ui.total + ' card' + (ui.total === 1 ? '' : 's') + ' · ' + ui.got + ' marked “Got it”' + (ui.again ? ' · ' + ui.again + ' to retry tomorrow' : '') + (streak ? ' · 🔥 ' + streak + '-day streak' : '') + '</p></section>' +
      '<div class="card"><div class="pr-big">' + first + '%</div><p class="muted">right on the first try</p>' +
      '<p class="pr-sub">' + (n.toDo ? n.toDo + ' more card' + (n.toDo === 1 ? ' is' : 's are') + ' due today.' : 'Nothing else due today. Cards you missed come back tomorrow.') + '</p></div>' +
      '<button type="button" class="pr-btn pr-go" data-act="home">Back to Practice</button>';
  }

  function resetAll() {
    st = { cards: {}, intro: { day: todayStr(), ids: [] }, log: st.log }; save();
    ui.view = "home"; renderHome();
  }

  // ---- wiring -----------------------------------------------------------------------------
  function onClick(e) {
    const el = e.target.closest("[data-act],[data-scope]"); if (!el || !ui.panel.contains(el)) return;
    if (el.dataset.scope) { ui.scope = el.dataset.scope; return renderHome(); }
    switch (el.dataset.act) {
      case "start": return startDrill();
      case "flip": return flip();
      case "got": return answer(true);
      case "again": return answer(false);
      case "quit": ui.view = "home"; return renderHome();
      case "home": ui.view = "home"; return renderHome();
      case "reset":
        if (el.dataset.arm) return resetAll();
        el.dataset.arm = "1"; el.textContent = "Tap again to erase every box"; el.classList.add("armed");
        setTimeout(() => { if (el.isConnected) { delete el.dataset.arm; el.textContent = "Reset all progress"; el.classList.remove("armed"); } }, 4000);
    }
  }
  function onKey(e) {
    if (ui.view !== "drill" || !ui.panel.classList.contains("on")) return;
    if (e.target.closest && e.target.closest("button") && e.key !== "1" && e.key !== "2") return;
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); flip(); }
    else if (e.key === "1" || e.key === "ArrowLeft") answer(false);
    else if (e.key === "2" || e.key === "ArrowRight") answer(true);
  }

  return {
    render(panel) {
      ui.panel = panel; panel.addEventListener("click", onClick);
      document.addEventListener("keydown", onKey);
      renderHome();
    },
    onShow(panel) {
      // a new day may have started while the app stayed open
      if (!st.intro || st.intro.day !== todayStr()) { st.intro = { day: todayStr(), ids: [] }; save(); }
      if (ui.view !== "drill") { ui.view = "home"; renderHome(); }
    }
  };
})();
