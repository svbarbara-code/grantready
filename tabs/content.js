/* content — owned by the spa-content session.
   Concept cards (grouped by Essentials session) + a searchable glossary.
   All wording is the study author's own paraphrase — no handout text is copied.
   Data is also exposed as SPA.content so other tabs can deep-link / reuse terms:
     SPA.content.glossary  [{id, term, aka, s, def}]
     SPA.content.concepts  [{id, s, title, sum, ...}]
     SPA.content.openTerm(id) / openCard(id)   -> jumps to the Content tab */
(function () {
  "use strict";

  /* ---------- tiny block builders for card bodies ---------- */
  const P = t => ({ k: "p", t });
  const UL = items => ({ k: "ul", items });
  const CALC = (t, lines) => ({ k: "calc", t, lines });
  const KEY = t => ({ k: "key", t });
  const TRAP = t => ({ k: "trap", t });

  /* ---------- sessions (labels for chips) ---------- */
  const SESS = [
    { id: "spa1", short: "SPA 1", name: "Proposal" },
    { id: "spa2", short: "SPA 2", name: "Budget" },
    { id: "spa3", short: "SPA 3", name: "Managing the Award", pending: true },
    { id: "spf1", short: "SPF 1", name: "Financial Mgmt", pending: true },
    { id: "spf2", short: "SPF 2", name: "Closeout", pending: true }
  ];

  /* =====================================================================
     GLOSSARY  — {id, term, aka, s: session, def}
     def supports **bold** and [[term-id]] links.
     ===================================================================== */
  const GLOSS = [
    /* ---- Session 1: Proposal ---- */
    { id: "nofo", term: "NOFO (Notice of Funding Opportunity)", short: "NOFO", aka: "FOA, PA, RFA, solicitation, announcement", s: "spa1",
      def: "The sponsor's formal public call for applications. It spells out who may apply, how applications are judged, what must be in them, how to submit and every limit to respect. Agencies use different names for the same thing. If the NOFO and the general application instructions disagree, the **NOFO wins**." },
    { id: "parent", term: "Parent announcement", short: "Parent announcement", aka: "NIH generic NOFO", s: "spa1",
      def: "A broad, standing NIH [[nofo]] that accepts investigator-initiated ideas under particular activity codes. It stays open for up to about three years and uses the standard due dates." },
    { id: "grant", term: "Grant", aka: "financial assistance award", s: "spa1",
      def: "Financial assistance where the sponsor expects **no substantial involvement**. The PI owns the concept and methods; the sponsor cares about progress and productivity, not a pre-defined end product. Governed by the [[ug]] when federal." },
    { id: "coop", term: "Cooperative agreement", aka: "coop agreement", s: "spa1",
      def: "Financial assistance like a [[grant]], except the federal agency plans **substantial scientific or programmatic involvement** (helping, guiding, coordinating, taking part). Responsibility is shared between sponsor and PI. Same rulebook as grants: the [[ug]]." },
    { id: "contract", term: "Contract (federal meaning)", short: "Contract", aka: "procurement, RFP", s: "spa1",
      def: "A binding procurement: the sponsor defines the requirements and buys a service or product **for its own benefit**. Usually answers a Request for Proposal (federal ones are posted on SAM.gov). Governed by the [[far]]. A private foundation calling something a grant or contract does not automatically mean the federal meaning; the substance decides." },
    { id: "ug", term: "Uniform Guidance (2 CFR 200)", short: "Uniform Guidance", aka: "UG", s: "spa1",
      def: "The government-wide rulebook for federal grants, cooperative agreements and other financial assistance: administrative requirements, cost principles and audit rules. It does **not** govern federal contracts. OMB has floated turning it into a binding \"Uniform Grants Regulation\"; that was still only a proposal." },
    { id: "far", term: "FAR (Federal Acquisition Regulation)", short: "FAR", aka: "contracts rulebook", s: "spa1",
      def: "The rulebook for federal [[contract]]s. Remember the pairing: grants and cooperative agreements use the [[ug]]; contracts use the FAR; private foundations use their own rules." },
    { id: "rascalpt", term: "Rascal PT (Proposal Tracking)", short: "Rascal PT", aka: "PT sheet", s: "spa1",
      def: "Columbia's internal record and approval route for a proposal. The department registers it early, completes it, adds approvers (departmental signatures), and the PI finalizes. The [[po]] may un-finalize it for edits, then the PI finalizes again. Cost-sharing source accounts are entered here too." },
    { id: "po", term: "SPA Project Officer (PO)", short: "SPA Project Officer", aka: "SPA PO", s: "spa1",
      def: "Your contact in Sponsored Projects Administration. Reviews and submits the proposal, advises on indirect rate, NOFO budget restrictions, subawards and PI eligibility, and is the **channel for anything that needs a sponsor's permission**. Not the same person as the sponsor's program officer ([[sponsorstaff]])." },
    { id: "sponsorstaff", term: "Sponsor staff: program officer vs grants management", short: "Sponsor staff", aka: "Program Officer, GMS, SRO", s: "spa1",
      def: "At the sponsor, the **program officer** handles the science or technical side; the **grants management specialist** handles business, policy, budget and award terms. At NIH a Scientific Review Officer (SRO) runs peer review. You may speak to the sponsor's program staff about the science; permission requests go through your [[po]]." },
    { id: "authsig", term: "Authorized signatory", aka: "who may sign", s: "spa1",
      def: "Only an authorized University signatory may sign grants, contracts and similar agreements (data use agreements, material transfer agreements, confidentiality agreements, service or licensing agreements). If you receive anything that wants a signature, send it to your [[po]]." },
    { id: "coi", term: "COI disclosure (conflict of interest)", short: "COI disclosure", aka: "FCOI", s: "spa1",
      def: "An annual disclosure that must be on file for **every Investigator** before the PO can submit. \"Investigator\" is about the work (design, conduct or reporting of research), not the title, so postdocs and grad students can count. [[phs]] sponsors add stricter rules, including training." },
    { id: "phs", term: "PHS agencies", aka: "Public Health Service: NIH, CDC, FDA, HRSA, AHRQ, SAMHSA…", s: "spa1",
      def: "The health-related agencies under HHS, including NIH, FDA, CDC, HRSA, AHRQ and SAMHSA. They follow PHS policies, for example stricter [[coi]] rules and the [[phscap]]." },
    { id: "trainings", term: "Sponsor-required trainings", short: "Required trainings", aka: "RECR TC7000, research security TC7550", s: "spa1",
      def: "Some sponsors require training before submission or award set-up. **NSF RECR** (Rascal TC7000) applies to faculty and senior personnel on NSF projects and holds award set-up until done. **Research security** (TC7550) is required before submitting any federal proposal, with a refresher (TC7922) if more than a year has passed. Check the Training Finder." },
    { id: "keyp", term: "Key personnel & other significant contributors", short: "Key personnel", aka: "OSC", s: "spa1",
      def: "**Key personnel** contribute to the science in a substantive, measurable way, paid or not, and must carry real effort: \"zero percent\" or \"as needed\" is not acceptable. At NIH, **Other Significant Contributors (OSCs)** commit to the work but with no measurable effort (zero person-months); anyone with measurable effort cannot be an OSC. Consultants may be either if they fit the definition, but must not be Columbia employees." },
    { id: "biosketch", term: "Biosketch (SciENcv)", short: "Biosketch", aka: "NIH/NSF biographical sketch", s: "spa1",
      def: "A short biographical sketch for each key person. Many federal agencies want it built in SciENcv, a free portal that pre-fills from ORCID, eRA Commons and others and keeps NIH and NSF formats compliant." },
    { id: "cp", term: "Current & Pending (Other) Support", short: "Current & Pending", aka: "C&P, NSF", s: "spa1",
      def: "An NSF document used to judge a person's capacity to do the work and to spot overlap with other projects. It lists all resources available to the person for research, even non-monetary ones: in-kind space, equipment or staff that carry a time commitment, and support that does not pass through Columbia." },
    { id: "subrecipient", term: "Subrecipient vs contractor", short: "Subrecipient", aka: "subaward vs vendor", s: "spa1",
      def: "A **subrecipient** takes part in the science: programmatic decision-making, effort tied to the specific aims, publication rights. A **contractor/vendor** (including most consultants) supplies goods or services only. The PI makes the call based on the nature of the work, and it matters because it changes indirect costs. The entity passing the money down is the **pass-through entity**." },
    { id: "limited", term: "Limited submission", aka: "one application per institution", s: "spa1",
      def: "A solicitation that caps how many applications an institution may send (often one). The University picks its nominee through an internal selection; the chosen nominee then submits through SPA. If you see \"one per institution\", talk to your [[po]] right away." },

    /* ---- Session 2: Budget ---- */
    { id: "direct", term: "Direct costs", aka: "TDC when summed", s: "spa2",
      def: "Costs you can tie to the specific project with a high degree of accuracy: personnel, consultants, equipment, supplies, travel, patient care, alterations and renovations, subawards/contractual, other. They flow logically from the proposal narrative." },
    { id: "fa", term: "Indirect costs / F&A / IDC", short: "F&A / indirect", aka: "IC, IDC, facilities & administrative", s: "spa2",
      def: "The cost of the infrastructure that research runs on and that can't be pinned to one project: building and equipment upkeep and depreciation, utilities, telecom, general and departmental administration, interest, library. Charged as a rate applied to the [[mtdc]] base using the [[nicra]]." },
    { id: "mtdc", term: "MTDC (Modified Total Direct Costs)", short: "MTDC", aka: "the base", s: "spa2",
      def: "The base the F&A rate is applied to. **MTDC = total direct costs minus the excludables**. Excluded: equipment, capital expenditures, patient care (ancillary tests, MRIs), tuition reimbursement, off-site rental, participant support, and the part of each subaward above $25,000. Included: salaries, fringe, supplies, services, travel, subject payments and transport, and the first $25,000 of each subaward. **F&A = MTDC × rate.**" },
    { id: "rates", term: "The three F&A rates", short: "F&A rates", aka: "on-campus, modified off-campus, off-campus", s: "spa2",
      def: "One rate per award, picked by where **more than 50% of the activity** happens (the [[preponderance]]). **On-campus**: mostly in University-owned or leased space. **Modified off-campus**: mostly in non-University space within 50 miles, where rent is charged to the award or space is donated. **Off-campus**: mostly beyond 50 miles. Research rates (FY25, until amended): 64.5% / 28.5% / 26%; Lamont on-campus is 55.5%." },
    { id: "preponderance", term: "Preponderance rule", short: "Preponderance", aka: "more than 50%", s: "spa2",
      def: "An award never gets more than one F&A rate. The rate is chosen by where the majority (>50%) of the work occurs, and that rate applies to the whole project. Only work by **Columbia personnel** counts; subawardee and collaborator work is ignored." },
    { id: "osa", term: "OSA (Other Sponsored Activity)", short: "OSA", aka: "non-research projects", s: "spa2",
      def: "Sponsored work that is neither sponsored research nor instruction: travel grants, conference support, outreach, community service, library collections. Own rates: **33% on-campus, 26% off-campus**. Ask your PO if this might apply." },
    { id: "nicra", term: "NICRA (Negotiated Indirect Cost Rate Agreement)", short: "NICRA", aka: "rate agreement", s: "spa2",
      def: "The indirect-rate (and fringe) agreement an institution negotiates with its federal cognizant agency (for Columbia, HHS). Rates are set institution-wide, not grant by grant. For a subrecipient with a NICRA, a federal prime must **accept that rate**; without one, see [[deminimis]]." },
    { id: "deminimis", term: "De minimis rate", aka: "15% of MTDC; 10% at NIH", s: "spa2",
      def: "The fallback indirect rate for a subrecipient with no NICRA: **15% of MTDC**, but **10% when the sponsor is NIH**. NIH also allows domestic subrecipients only." },
    { id: "cs", term: "Cost sharing / matching", short: "Cost sharing", aka: "cost share", s: "spa2",
      def: "The part of project cost not paid by federal funds (matching is the required level). At Columbia it is funded from departmental resources; **federal money from another project can't be used**. Comes as [[mandatory]], [[vccs]] or [[uncommitted]]. Include the minimum needed." },
    { id: "mandatory", term: "Mandatory cost sharing", aka: "required match", s: "spa2",
      def: "Committed cost sharing the sponsor requires in the NOFO as a condition of award. Needs a source account approved by whoever controls the funds (entered in [[rascalpt]]) and a Chair-signed cost-share letter to the PO, unless the sponsor has a stated salary cap." },
    { id: "vccs", term: "VCCS (voluntary committed cost sharing)", short: "VCCS", aka: "voluntary committed", s: "spa2",
      def: "Cost sharing the applicant pledges on its own in the proposal budget; once pledged, it becomes a **binding** part of the award. Very strongly discouraged, not expected under federal research grants, and **prohibited by NSF**." },
    { id: "uncommitted", term: "Uncommitted cost sharing", aka: "non-committed", s: "spa2",
      def: "Support that neither the sponsor required nor the PI pledged, but that is provided during the project anyway." },
    { id: "ibs", term: "IBS (Institutional Base Salary)", short: "IBS", aka: "base salary", s: "spa2",
      def: "Annual compensation Columbia pays for the appointment, whether time goes to research, teaching or patient care. **Excludes** bonuses, one-time and incentive pay, salary paid directly by another organisation (HHMI, NYSPI) and permitted outside income such as consulting. It can't be raised just because sponsored funds replace University funds. For CUIMC clinical faculty, IBS = base (X) + guaranteed additional compensation (Y)." },
    { id: "pm", term: "Person-months", aka: "effort conversion", s: "spa2",
      def: "**Percent effort × months in the appointment.** 25% of a 9-month year = 2.25; 10% of 12 months = 1.2; 35% of a 3-month summer = 1.05. Go back the other way by dividing by the months in the appointment. Sponsors treat proposed effort as a commitment if the award is made." },
    { id: "summer", term: "Summer salary (3/9 rule)", short: "Summer salary", aka: "academic-year appointees", s: "spa2",
      def: "For 9-month academic appointees (8 at the Business School), the most summer salary allowed is **three-ninths of academic-year salary**; each summer month is one month of full-time effort. The effort must be spent in the summer. Academic-year released time needs Chair/Dean approval. NSF separately limits senior personnel to **2 months** of salary per year across all NSF awards unless approved." },
    { id: "fringe", term: "Fringe benefits", aka: "FY27: 30.7% gov / 35% non-gov", s: "spa2",
      def: "Benefit costs added on top of salary. Budget FY27 (from 7/1/26) at **30.7% for government** and **35% for non-government** sponsors until SPA announces otherwise. Graduate research assistant salaries carry **no** fringe." },
    { id: "phscap", term: "PHS / NIH salary cap", short: "Salary cap", aka: "$228,000 (from 1/1/2026)", s: "spa2",
      def: "A legislated limit on the salary base NIH and other PHS agencies will pay for. It is **$228,000** (effective 1/1/2026). Budget to the cap and say so in the justification; the department covers the gap above it. Use actual IBS only for sponsors with no cap. Other sponsors may have their own caps." },
    { id: "gra", term: "GRA & tuition remission", short: "Graduate research assistant", aka: "grad student pay", s: "spa2",
      def: "A graduate research assistant's salary is a valid charge and carries **no fringe**. NIH limits grad-student compensation to the zero-level Kirschstein-NRSA stipend (**$63,480**). **Tuition remission** is budgeted under Other costs, and is excluded from [[mtdc]]." },
    { id: "postdoc", term: "Postdoc: salary vs stipend", short: "Postdoc", aka: "research scientist vs fellow", s: "spa2",
      def: "A postdoctoral research scientist is an employee paid salary; a postdoctoral fellow gets a sponsor stipend (pay for which no service is required). Stipends generally can't be charged to a research project unless the award itself calls for it (training grants, individual fellowships)." },
    { id: "consultant", term: "Consultant", aka: "fee-for-service", s: "spa2",
      def: "An outside expert advisor paid on a fixed hourly or daily basis, using their own equipment, paying their own taxes, not a Columbia employee, and not doing programmatic work or deliverables. Work and IP belong to Columbia. Needs the Subrecipient/Contractor Classification Form; the agreement is set up through Purchasing after award." },
    { id: "equipment", term: "Equipment ($5,000 rule) & computing devices", short: "Equipment", aka: "capital equipment", s: "spa2",
      def: "Equipment is any single item costing **$5,000 or more**; it is excluded from [[mtdc]] and the sponsor approves it line by line. Computing devices under $5,000 can be a direct charge only if essential, allocable, with no reasonable alternative, and documented (split across projects if shared). The threshold could change in future; use $5,000 now." },
    { id: "flyamerica", term: "Fly America Act", aka: "US flag carrier policy", s: "spa2",
      def: "Air travel paid with federal funds must use a U.S. flag carrier, with limited exceptions. The travel line is for project travel, **not** for study subjects. NSF wants travel itemized by destination and cost on its budget Line E." },
    { id: "twentyfive", term: "The first-$25,000 subaward rule", short: "$25K subaward rule", aka: "subaward F&A base", s: "spa2",
      def: "Columbia charges F&A on only the **first $25,000 of each subaward** (over the life of that subaward, not per year). Take the whole subaward out of the base, then add back up to $25,000 until that limit has been used. A subaward under $25,000 is wholly in the base." },
    { id: "partsupport", term: "Participant support costs", short: "Participant support", aka: "stipends, travel, registration for attendees", s: "spa2",
      def: "Direct costs that support **participants** (people attending trainings or conferences, community members, students who don't implement the award): stipends, subsistence, travel, registration, dependent care. Not for research subjects, project staff or consultants. **Excluded from MTDC.** Adding them needs no prior approval if the NOFO/NOA allow, but you can't move money *out* of the category without agency approval." },
    { id: "patientcare", term: "Research patient care costs", short: "Patient care", aka: "ancillary tests", s: "spa2",
      def: "Hospital costs of research care: outpatient ancillary tests (MRI, X-ray…) and inpatient care. They **exclude professional fees** (e.g. the radiologist reading the scan) and are excluded from [[mtdc]]." },
    { id: "modular", term: "NIH modular vs detailed budget", short: "Modular budget", aka: "R01 R03 R15 R21 R34", s: "spa2",
      def: "A simplified NIH format for research applications asking **$250,000 or less in direct costs per year** (consortium F&A not counted toward that cap), only for R01, R03, R15, R21 and R34. No category detail. Request whole **$25,000 modules**; larger or other requests use a detailed budget." },
    { id: "justification", term: "Budget justification", aka: "budget narrative", s: "spa2",
      def: "The narrative that explains each budget line. Needed for personnel, equipment, travel and anything unusual; normally-unallowable items must be justified explicitly. For NIH modular: a personnel part (name, role, person-months, no salary or fringe rate), a consortium part (totals rounded to the nearest $1,000), and an additional narrative." },

    /* ---- Session 3: Managing the Award (outline) ---- */
    { id: "noa", term: "NOA (Notice of Award)", short: "NOA", aka: "award notice", s: "spa3",
      def: "The sponsor's official document awarding the funds: amounts, budget and project periods, indirect rate, terms and conditions, special terms and reporting. Read it on arrival and compare with the proposal." },
    { id: "priorapproval", term: "Prior approval", aka: "sponsor's written OK", s: "spa3",
      def: "The sponsor's advance written permission for certain changes (scope, key personnel or big effort cuts, some rebudgeting, some extensions). Requested **through your SPA PO**, never directly by the department." },
    { id: "rebudget", term: "Rebudgeting", aka: "moving funds between categories", s: "spa3",
      def: "Shifting money between budget categories during the award. Some moves are free, some need [[priorapproval]], depending on the sponsor and size. Participant support money can't be moved out without approval." },
    { id: "nce", term: "NCE (no-cost extension)", short: "No-cost extension", aka: "extension without new money", s: "spa3",
      def: "More time to finish, with no additional funds. Under the federal baseline a one-time extension of up to 12 months can be taken with advance notice; further ones need approval. Sponsor terms can differ." },

    /* ---- Sessions 4–5: Finance & Closeout (outline) ---- */
    { id: "allowable", term: "Allowable, allocable, reasonable", short: "Cost tests", aka: "cost principles", s: "spf1",
      def: "The tests a charge must pass: **necessary and reasonable** for the work, **allocable** to this award in proportion to benefit, **consistently treated** (never direct if usually indirect), allowed by the NOA and cost principles, and **documented**." },
    { id: "costtransfer", term: "Cost transfer", aka: "journal moving charges", s: "spf1",
      def: "Moving an expense onto or off an award after it posted. It needs a timely, documented, legitimate reason (such as correcting an error), never to use up leftover money or hide an overrun. Late transfers draw extra scrutiny." },
    { id: "effort", term: "Effort certification", aka: "effort reporting", s: "spf1",
      def: "The after-the-fact confirmation that the salary charged to an award matches the work actually done. Proposed effort is treated as a commitment, so actual effort should follow it." },
    { id: "ffr", term: "FFR / drawdown", short: "Financial report", aka: "SF-425, invoicing", s: "spf1",
      def: "The financial report to a federal sponsor (the Federal Financial Report, SF-425) and the process of requesting cash (drawdown or invoice) against allowable expenses." },
    { id: "overrun", term: "Cost overrun (deficit)", aka: "overspent award", s: "spf2",
      def: "Spending beyond the award. It must be covered by department or discretionary funds; it can't be shifted onto another sponsored award." },
    { id: "closeout", term: "Closeout", aka: "end-of-award steps", s: "spf2",
      def: "The final steps after the project ends: final financial and technical reports, any inventions and property reports, paying off or liquidating obligations within the sponsor's window, clearing deficits, closing the account, and keeping records (federal baseline three years after the final report)." },
    { id: "monitoring", term: "Subrecipient monitoring", aka: "pass-through duty", s: "spf2",
      def: "The pass-through entity's duty to oversee its subrecipients: assess risk, review invoices against budget and progress, and follow up on audit findings." }
  ];

  /* =====================================================================
     CONCEPT CARDS — grouped by session
     body: array of blocks (P / UL / CALC / KEY / TRAP). Supports **bold** and [[term-id]].
     ===================================================================== */
  const CARDS = [
    /* ------------------------ SESSION 1 · PROPOSAL ------------------------ */
    { id: "mech", s: "spa1", title: "Grant, cooperative agreement or contract?",
      sum: "The label depends on how involved the sponsor is.",
      body: [
        P("Three kinds of funding, sorted by what the sponsor wants and how closely it stays involved:"),
        UL([
          "**[[grant]]**: support for your idea. The PI designs the concept and methods; the sponsor expects to stay hands-off and judges progress, not a guaranteed product.",
          "**[[coop]]**: still assistance, but the agency plans to guide, coordinate or take part. Responsibility is shared. Usually answers a specific NOFO, PA or RFA.",
          "**[[contract]]**: the sponsor buys a service or product it defined, for its own benefit, usually through an RFP."
        ]),
        P("Rulebooks: grants and cooperative agreements follow the [[ug]]; federal contracts follow the [[far]]; private foundations follow their own terms."),
        KEY("Ask two questions: who owns the idea, and who is the customer? PI-owned idea = grant. Sponsor-defined deliverable for the sponsor = contract. Shared federal involvement = cooperative agreement."),
        TRAP("Names mislead. A foundation's \"grant\" or \"contract\" doesn't automatically carry the federal meaning; the substance decides the mechanism. And the Uniform Guidance becoming a binding \"Uniform Grants Regulation\" was only proposed.")
      ] },
    { id: "nofo-read", s: "spa1", title: "Reading the NOFO",
      sum: "What it contains and how strictly to follow it.",
      body: [
        P("The [[nofo]] is the sponsor's formal announcement. Agencies may call it FOA, PA, RFA, parent announcement or solicitation, but the job is the same. Work from three documents side by side: the NOFO, the application instructions and the required forms."),
        UL([
          "**General information**: program title, synopsis, contacts.",
          "**Eligibility**: who may apply, PI limits, caps on proposals per institution.",
          "**Preparation and submission**: pre-proposal vs full, budget caps, whether a letter of intent is needed, due dates.",
          "**Review**: the sponsor's criteria and selection process.",
          "**Award administration**: conditions and reporting requirements."
        ]),
        P("Follow format rules exactly: page limits, fonts, margins, line spacing, character counts, and no hyperlinks or URLs where forbidden. Use the sponsor's own forms, the latest version, and never recycle expired ones."),
        KEY("When the NOFO and the general application instructions conflict, the NOFO supersedes."),
        TRAP("Reusing last cycle's forms or instructions is a classic error. Always verify what is current.")
      ] },
    { id: "nofo-special", s: "spa1", title: "Parent announcements, limited submissions, no NOFO",
      sum: "Three special cases around the call itself.",
      body: [
        UL([
          "**[[parent]]**: a broad NIH NOFO for investigator-initiated ideas under certain activity codes. Open for up to about three years with standard due dates.",
          "**[[limited]]**: if it says one application per institution, tell your PO. The University runs an internal selection; only the nominee then submits via SPA.",
          "**No NOFO at all** (an award arrives without a formal call): SPA still needs a scope of work, a budget, a budget justification and a completed, signed [[rascalpt]]."
        ]),
        KEY("\"Only one per institution\" is a trigger to contact the PO immediately, long before the sponsor deadline.")
      ] },
    { id: "who-sponsor", s: "spa1", title: "Who's who: sponsor staff, SPA and signatures",
      sum: "Who you may talk to, and who must ask for permission.",
      body: [
        UL([
          "**Program officer** (science side) and **grants management specialist** (business, policy, budget, terms). NIH also has a Scientific Review Officer for peer review. See [[sponsorstaff]].",
          "**Your [[po]]**: knows the indirect rate for your location, how to handle NOFO budget restrictions, subaward maths and PI eligibility. Tell them about the proposal as early as possible.",
          "**[[authsig]]**: only an authorized University signatory signs. Anything that asks for a signature (DUA, MTA, CDA, service or licensing agreement, forms) goes to the PO."
        ]),
        P("You may contact the sponsor directly for project-specific science questions, such as whether the NOFO fits your work. Anything that needs permission or a clarified term or condition goes through your SPA PO because it is a prior approval request."),
        KEY("Science questions: sponsor's program staff. Permissions, policy and terms: your SPA PO.")
      ] },
    { id: "timeline-pt", s: "spa1", title: "Timeline and Rascal Proposal Tracking",
      sum: "Submit early; the PT drives the internal route.",
      body: [
        P("Work backwards from the sponsor deadline:"),
        UL([
          "**2 to 8 weeks before**: build the application in the online system.",
          "**5 business days before**: the PO receives the complete application for review (strongly advised).",
          "**2 business days before**: the PO submits the assembled application to the sponsor."
        ]),
        P("The [[rascalpt]] runs in roughly six steps: initiate, register (it goes to SPA), complete the full PT, add approvers (Rascal runs validations), the PI finalizes, and if edits are needed the PO un-finalizes, the department edits, and the PI finalizes again."),
        P("Checklist: identify and read the NOFO; register the PT early; complete it accurately; every investigator's [[coi]] filed; signatures from all involved departments and the designated signer; PI approves and finalizes; sponsor-required training done; keep the PO updated."),
        TRAP("The PO needs the proposal 5 business days out, not on the deadline day.")
      ] },
    { id: "gates", s: "spa1", title: "Compliance gates before you submit",
      sum: "COI, trainings and documents that block submission or award set-up.",
      body: [
        UL([
          "**[[coi]]**: annual disclosure for every Investigator. It's about the role, not the title; postdocs and grad students count if they design, conduct or report research. [[phs]] sponsors apply stricter rules including training.",
          "**[[trainings]]**: NSF RECR (TC7000) for senior personnel; research security (TC7550) before any federal submission, with a refresher after a year.",
          "**NSF foreign-agreement documents**: since 10 Oct 2025 proposers must keep copies of agreements for foreign appointments, employment or talent-recruitment programs for senior/key personnel, and upload them in Rascal when asked."
        ]),
        KEY("Different sponsors, different gates: PHS, NSF and DOE each have their own training and disclosure rules. Check the Rascal Training Finder.")
      ] },
    { id: "team-docs", s: "spa1", title: "The team and its documents",
      sum: "Key personnel vs OSC; biosketch; Current & Pending.",
      body: [
        P("Decide who the PI is (and whether there are Co-PIs, collaborators, other institutions, consultants, postdocs, students, technicians) and then who counts as [[keyp]]."),
        UL([
          "**Key personnel**: substantive, measurable contribution to the science, paid or not. \"Zero percent\" or \"as needed\" is not allowed.",
          "**OSCs (NIH)**: committed but without measurable effort (zero person-months), listed after the senior/key people. Anyone with measurable effort can't be one.",
          "**Consultants** may qualify as either, but can't be Columbia employees.",
          "**[[biosketch]]**: often built in SciENcv.",
          "**[[cp]]** (NSF): all resources available to the person, including in-kind support with a time commitment and support that doesn't flow through Columbia."
        ]),
        TRAP("Don't list someone with effort as an OSC, and don't give key personnel zero effort.")
      ] },
    { id: "sub-vs-con", s: "spa1", title: "Subrecipient or contractor?",
      sum: "Classification changes the indirect costs.",
      body: [
        P("A [[subrecipient]] and a contractor are different relationships, and getting it right is important because it changes how indirect costs are handled. The PI decides, based on the nature of the work."),
        UL([
          "**Subrecipient**: programmatic involvement and decision-making, effort directly tied to the specific aims, publication rights.",
          "**Contractor/vendor**: goods or services only, under a service agreement. A consultant is in this family."
        ]),
        P("For each proposed subrecipient SPA needs at minimum: the Subrecipient/Contractor Classification Form, a statement of work, a detailed budget and justification, a biosketch (and Current & Pending if required) for each key person, and a letter of intent."),
        P("Sometimes also: a **Pre-award Assessment Form** when all proposed subrecipients together exceed **50% of the total prime award**, and an **International Research Questionnaire** for a foreign subrecipient."),
        KEY("Vendor = goods/services. Subrecipient = shares in the science and the publications.")
      ] },
    { id: "four-w", s: "spa1", title: "Plan the proposal: who, what, when, where",
      sum: "The planning questions, and why \"where\" drives the rate.",
      body: [
        UL([
          "**Who**: the research team (above).",
          "**What**: scope of work, resources needed, sponsor requirements (is cost sharing required?) and what the PI must commit to.",
          "**When**: due dates for the sponsor and for SPA, time needed to finish (sets the budget periods), any sponsor limit on budget period length, multiple due dates, and when the latest forms and policies were published.",
          "**Where**: building and room, on or off campus, U.S. or abroad, which Columbia resources (lab, office, computing)."
        ]),
        P("Typical proposal parts: cover page with signatures, abstract or scope of work, research plan, budget and justification, biosketches, compliance sections (human, animal, biosafety), a multiple-PI plan (NIH only), subcontractor information, collaborators, facilities and resources, appendices (used sparingly), Current & Pending."),
        P("Budget basics start here: find the limits (banned expense types, spending caps, overall ceiling), round to whole dollars, and use U.S. dollars."),
        KEY("\"Where\" matters because the location of the work determines which [[rates]] apply.")
      ] },

    /* ------------------------ SESSION 2 · BUDGET ------------------------ */
    { id: "bud-start", s: "spa2", title: "Budget basics: direct vs indirect",
      sum: "Know your limits, round to whole dollars, sort every cost.",
      body: [
        P("Start from the [[nofo]]: find limits on kinds of expenses, caps on a category and the overall ceiling. Always round to whole dollars, and check whether cost sharing is required."),
        P("[[direct]] costs are tied to the project: personnel, consultants, equipment, supplies, travel, patient care, alterations/renovations, subawards/contractual, and other. Under Other you will find study subject costs, pharmacy, publication fees (including data deposit and curation) and professional fees."),
        P("[[fa]] costs are the shared infrastructure that can't be assigned to one project: building and equipment, utilities, telecom, administration, interest, library."),
        KEY("If a cost is normally covered by indirect (general admin, ordinary office supplies), it is not requested as a direct cost without strong justification."),
        TRAP("Pens and paper aren't project-specific supplies. Test tubes and lab chemicals are.")
      ] },
    { id: "cost-share", s: "spa2", title: "Cost sharing: mandatory, voluntary, uncommitted",
      sum: "Which kinds are binding, who may pay, what paperwork.",
      body: [
        P("[[cs]] is the project cost not paid by federal funds. At Columbia it comes from departmental resources and may never come from another federal project."),
        UL([
          "**Committed** = documented in the proposal or agreed in the NOA:",
          "→ [[mandatory]]: required by the NOFO as a condition of award.",
          "→ [[vccs]]: offered voluntarily, then binding. **NSF prohibits it.**",
          "**[[uncommitted]]**: provided anyway, but neither required nor pledged."
        ]),
        P("Rules for committed cost sharing: offer only the minimum needed; the source account must be identified and approved by the person controlling it; unrestricted account numbers go into Rascal PT at submission; a **Chair-signed cost-share letter** goes to the PO, unless the sponsor has a stated salary cap."),
        KEY("Mandatory = sponsor made you. VCCS = you pledged. Uncommitted = just happened. Voluntary is very strongly discouraged."),
        TRAP("Voluntary committed is not 'optional' once it's in the budget; it becomes a binding requirement. A line like 'Dr. X gives 0.5 person-months, no salary requested' is VCCS.")
      ] },
    { id: "salary", s: "spa2", title: "Salary basics: IBS, summer and academic year",
      sum: "What salary can be charged, and the 3/9 and 2-month limits.",
      body: [
        P("[[ibs]] is the annual comp for the appointment, excluding bonuses, one-time pay, other organisations' salary and outside consulting. The rule of thumb: salary charged must be reasonable for the effort given, and Columbia applies the same standard to all projects. Proposed effort is a commitment if the award is made, stated in % or person-months per the sponsor's policy."),
        P("**CUIMC clinical faculty (12-month)**: IBS = X (salary) + Y (guaranteed additional comp). **Morningside, Lamont, Nevis**: 9-month year (8 at Business); academic-year released time needs Chair/Dean approval. Shifting work between summer and academic year later needs approval and a talk with the PO."),
        CALC("Summer salary maximum (example)", ["9-month academic salary $108,000", "Maximum = 3/9 × $108,000 = $36,000", "One summer month = $108,000 ÷ 9 = $12,000"]),
        KEY("[[summer]]: at most 3/9 of academic-year salary, effort must really be done in the summer. NSF: senior personnel at most 2 months a year across all NSF awards unless approved."),
        TRAP("Academic-year effort doesn't satisfy a commitment tied to summer salary.")
      ] },
    { id: "person-months", s: "spa2", title: "Percent effort ↔ person-months",
      sum: "One formula, both directions.",
      body: [
        P("[[pm]] = percent effort × months of the appointment. To go back: person-months ÷ months in the appointment."),
        CALC("Examples", [
          "20% of a 9-month year → 9 × 0.20 = 1.8 AY months",
          "15% of a 12-month year → 12 × 0.15 = 1.8 CY months",
          "50% of a 3-month summer → 3 × 0.50 = 1.5 SM",
          "20% of a 0.5 FTE 12-month → 12 × 0.5 × 0.2 = 1.2 CY",
          "Reverse: 4.8 person-months ÷ 12 = 40% effort"
        ]),
        KEY("Match the base to the appointment. The same percentage gives different person-months on a 9-, 12- or 3-month base.")
      ] },
    { id: "fringe-cap", s: "spa2", title: "Fringe and the PHS salary cap",
      sum: "FY27 fringe rates; budget to the cap and explain it.",
      body: [
        P("Budget [[fringe]] at **30.7%** for government sponsors and **35%** for non-government (FY27, from 1 July 2026) until SPA says otherwise. Fringe is part of the federally negotiated agreement."),
        P("[[phscap]]: NIH and other PHS agencies limit the salary base to **$228,000** from 1 Jan 2026. You may budget to the cap with a justification note rather than the actual IBS. For sponsors with no cap, use actual IBS."),
        CALC("Cap vs actual (example: 20% effort, 12-month, 30.7% fringe)", [
          "Actual IBS $280,000: ×0.20 = $56,000 → ×1.307 = $73,192",
          "At cap $228,000: ×0.20 = $45,600 → ×1.307 = $59,599",
          "Gap $13,593 is covered by the department"
        ]),
        TRAP("Don't calculate fringe on GRA salary: graduate research assistant pay carries none.")
      ] },
    { id: "people-other", s: "spa2", title: "Other people: admin staff, postdocs, grad students",
      sum: "What can and can't be charged.",
      body: [
        UL([
          "**Administrative/clerical salary** normally can't be a direct charge (recovered through indirect). Only if it is integral to the project, specifically identifiable, explicitly in the budget and justification (prior approval), and not already in indirect. Reconciliations, general office work and proposal prep are never allowed directly.",
          "**[[postdoc]]**: employee (salary) vs fellow (stipend). Stipends generally can't be charged to research projects unless the award requires it.",
          "**[[gra]]**: salary is chargeable, no fringe; NIH caps at $63,480. Tuition remission goes under Other costs and is allowable if the student's work is needed for the grant, the same support is given in non-sponsored work, and the student is in a degree program related to the work."
        ]),
        KEY("Salary yes, stipend usually no. GRA salary: yes, no fringe. Tuition: Other costs, outside MTDC.")
      ] },
    { id: "direct-items", s: "spa2", title: "Consultants, equipment, supplies, computers, travel",
      sum: "Definitions and thresholds that show up on tests.",
      body: [
        UL([
          "**[[consultant]]**: expert, fee-for-service, own equipment and taxes, not a Columbia employee, no deliverables. Classification form, then a Purchasing agreement after award.",
          "**[[equipment]]**: single items **≥ $5,000**; outside MTDC; sponsor approves line by line.",
          "**Supplies**: project-specific only; general office supplies don't belong.",
          "**Computing devices < $5,000**: direct only if essential and allocable, no reasonable alternative, documented by the PI/department, and split if shared.",
          "**Travel**: domestic and foreign. [[flyamerica]]: U.S. flag carriers. Not for study subjects."
        ]),
        KEY("$5,000 per item is the equipment line. Under it: supplies (with the computing-device conditions).")
      ] },
    { id: "subaward-budget", s: "spa2", title: "Subawards in the budget",
      sum: "Direct + indirect, the $25K rule, which rate to accept.",
      body: [
        P("Budget a subaward as direct plus indirect, using the sub's own detailed budget, justification and statement of work. For federal awards:"),
        UL([
          "Columbia charges F&A only on the [[twentyfive]].",
          "If the subrecipient has a [[nicra]], accept their rate. If not, [[deminimis]] (15% of MTDC; 10% at NIH).",
          "NIH accepts domestic subrecipients only.",
          "For non-federal sponsors it depends. Ask the PO."
        ]),
        CALC("Subaward worked example (research, on-campus 64.5%)", [
          "Columbia direct costs $90,000, subaward total $60,000 → TDC $150,000",
          "Remove the subaward: $90,000, add back $25,000 → MTDC $115,000",
          "F&A = $115,000 × 0.645 = $74,175"
        ]),
        CALC("Small subaward ($15,000 each in years 1 and 2)", [
          "Year 1: all $15,000 stays in the base",
          "Year 2: only $10,000 more (to reach the $25,000 lifetime limit)"
        ]),
        TRAP("The $25,000 is a per-subaward lifetime allowance, not an annual one. After it is used up, later years add back nothing.")
      ] },
    { id: "support-patient", s: "spa2", title: "Participant support and patient care",
      sum: "Two direct categories that are both excluded from MTDC.",
      body: [
        P("**[[partsupport]]** pay for attendees of trainings or conferences, community members, students who don't implement the award: stipends, subsistence, travel, registration, dependent care. They are not incentive payments for research subjects, and not for project staff or consultants."),
        UL([
          "Allowed only if the NOFO says so; must align with project goals.",
          "The justification explains the purpose and benefit to the scope.",
          "Keep records, including attendance at events.",
          "Adding them needs no prior approval (if NOFO and NOA allow); moving money out of the category does."
        ]),
        P("**[[patientcare]]**: outpatient ancillary tests and inpatient costs, excluding professional fees. Get the figures from the department providing the service; your PO can help. Note the difference between research care and standard of care."),
        KEY("Participant support and patient care are both outside MTDC (no F&A on them)."),
        TRAP("Subject payments and subject transport are in MTDC; participant support is not. Don't mix them up.")
      ] },
    { id: "fa-rates", s: "spa2", title: "F&A rates: which one applies?",
      sum: "Three rates, one per award, set by where the work happens.",
      body: [
        P("F&A rates come from the [[nicra]] with HHS, not negotiated project by project. Columbia's agreement has three: on-campus, modified off-campus and off-campus (see [[rates]]). The deciding factor is where **more than 50% of the activity** happens, the [[preponderance]] rule, counting only Columbia personnel."),
        UL([
          "Research rates (FY25, until amended): **64.5% / 28.5% / 26%**; Lamont: 55.5% / 28.5% / 26%.",
          "[[osa]] (non-research): **33% on-campus, 26% off-campus**.",
          "Non-profit foundations: the sponsor sets the rate; if silent, SPA aims for the federal rate.",
          "Some programs enforce a specific rate. Read the NOFO."
        ]),
        KEY("One rate for the whole award, decided by the preponderance of Columbia-staff activity."),
        TRAP("A subawardee's off-site work doesn't count toward the preponderance.")
      ] },
    { id: "mtdc-calc", s: "spa2", title: "Calculating F&A with MTDC",
      sum: "Formula, what's in the base, and worked examples.",
      body: [
        P("**Total direct costs − excludables = [[mtdc]]; MTDC × rate = F&A.**"),
        UL([
          "**In the base**: salaries and wages, fringe, supplies, services, travel, subject payments and transport, the first $25,000 of each subaward.",
          "**Out of the base**: equipment, capital expenditures, patient care, tuition reimbursement, off-site rental, participant support, the part of each subaward above $25,000."
        ]),
        CALC("Example A: equipment excluded (research, on-campus 64.5%)", [
          "TDC $80,000 = $60,000 salary/fringe/supplies + $20,000 equipment",
          "MTDC = $80,000 − $20,000 = $60,000",
          "F&A = $60,000 × 0.645 = $38,700"
        ]),
        CALC("Example B: subaward over $25,000, year 2 (sub $60,000/yr)", [
          "Columbia direct $90,000 + subaward $60,000 = TDC $150,000",
          "Remove the subaward and add back nothing, since the $25,000 was used in year 1",
          "MTDC = $90,000 → F&A = $90,000 × 0.645 = $58,050"
        ]),
        TRAP("Don't forget the add-back in the first year of a subaward, and don't add it again afterwards.")
      ] },
    { id: "modular", s: "spa2", title: "NIH modular vs detailed budgets",
      sum: "When modular is allowed and how to pick the number of modules.",
      body: [
        P("[[modular]] budgets are for certain research applications requesting **$250,000 or less in direct costs per year**, only for activity codes **R01, R03, R15, R21, R34**. Consortium F&A is not counted toward the cap. Otherwise NIH uses the detailed format."),
        P("To choose modules: build a detailed budget by year (with about 3% inflation where it can apply), subtract any consortium indirect, average across years, take out one-time costs (like a big piece of equipment) and round to the nearest **$25,000**. Ask for the same number of modules every year, except to add back that one-time item."),
        CALC("Example", ["Three-year direct costs $660,000 includes $20,000 consortium F&A", "$660,000 − $20,000 = $640,000 ÷ 3 = $213,333", "Nearest $25,000 → $225,000 → 9 modules each year"]),
        KEY("Modular = simplified, round to $25,000, same count each year, no category detail.")
      ] },
    { id: "bud-just", s: "spa2", title: "The budget justification",
      sum: "The narrative that explains each line.",
      body: [
        P("The [[justification]] adds detail to the line items: personnel, equipment, travel and anything else needing explanation. Normally-unallowable items must be justified explicitly. Equipment needs particular care because the sponsor approves each item."),
        UL([
          "**NIH modular personnel part**: name, role and person-months for everyone; no salary or fringe rate, but respect the cap.",
          "**Consortium part**: total (direct + F&A) per consortium rounded to the nearest $1,000 (e.g. $52,310 → $52,000); roles and person-months; say if foreign.",
          "**Additional narrative**: why the number of modules varies by year, which direct costs were left out (equipment, tuition), and any off-site or foreign work and off-site rate."
        ]),
        KEY("If you budget to the salary cap, say so in the justification.")
      ] },

    /* --------- SESSION 3 · MANAGING THE AWARD (outline, pending) --------- */
    { id: "noa-card", s: "spa3", title: "The Notice of Award",
      sum: "The binding document that sets the money and the rules.",
      body: [
        P("The [[noa]] states the amount, budget and project periods, indirect rate, standard and special terms, and reporting duties. Compare it to what was proposed and raise differences with your PO. Award set-up happens in ARC after SPA reviews it, and some awards are held until required steps (like trainings) are done."),
        KEY("The NOA, not the proposal, is what governs once the award is made.")
      ] },
    { id: "prior-card", s: "spa3", title: "Prior approval",
      sum: "Changes that need the sponsor's written OK, via your PO.",
      body: [
        P("[[priorapproval]] is how the sponsor consents to certain changes. Under the federal baseline these usually include: a change in scope or objectives; a change of PI or key person; a PI/key person stepping away for a long period or sharply cutting effort; some rebudgeting; and subawarding work not in the approved plan."),
        KEY("In every case the department asks the SPA PO, who asks the sponsor; the department never asks the sponsor directly."),
        TRAP("Sponsor terms differ from the baseline, so check the NOA. To be confirmed in class.")
      ] },
    { id: "rebudget-card", s: "spa3", title: "Rebudgeting and carryover",
      sum: "Moving money between categories.",
      body: [
        P("[[rebudget]] means moving funds between categories. Whether it needs approval depends on the sponsor, the size of the shift and the categories involved. Two things already known from Session 2: participant support money can be added without approval but not moved out without it, and equipment is approved line by line.")
      ] },
    { id: "nce-card", s: "spa3", title: "No-cost extensions",
      sum: "More time, no more money.",
      body: [
        P("An [[nce]] extends the end date without new funds. Under the federal baseline a one-time extension of up to 12 months can be taken by giving advance written notice; a second needs approval. Some sponsors (NIH, NSF) have their own procedures, so ask the PO early, well before the end date."),
        TRAP("Waiting until the last week is the usual mistake.")
      ] },
    { id: "progress-card", s: "spa3", title: "Progress reports and subawards after award",
      sum: "Reporting rhythm and pass-through duties.",
      body: [
        P("Most multi-year awards need an annual progress report (NIH calls it an RPPR) that also supports release of the next year's funds. Issuing a subaward makes Columbia the pass-through entity, with duties for amendments, funding and oversight (see closeout session)."),
        KEY("Technical progress and financial reporting are separate tracks with separate due dates.")
      ] },

    /* --------- SESSION 4 · FINANCIAL MANAGEMENT (outline, pending) --------- */
    { id: "fundacct", s: "spf1", title: "Fund accounting and monitoring",
      sum: "Every award has its own account; watch it monthly.",
      body: [
        P("Each sponsored award is tracked in its own account against its own budget and dates, so spending can always be shown against what the sponsor approved. Review the ledger regularly: unusual charges, the burn rate versus time elapsed, commitments not yet posted, and whether salary charges match effort. Catching an error early is much cheaper than fixing it at closeout.")
      ] },
    { id: "allow-card", s: "spf1", title: "Is the cost allowable?",
      sum: "The tests every charge must pass.",
      body: [
        P("The [[allowable]]: reasonable and necessary, allocable to the award, consistently treated, allowed by the NOA and the cost principles, and properly documented."),
        UL([
          "Consistency: a cost normally treated as indirect (general admin) can't be charged direct on a sponsored award.",
          "Typical unallowable items: alcohol, entertainment, fines and penalties, fundraising, general administration.",
          "Charges must fall within the award's budget period."
        ]),
        TRAP("Allowable is not the same as budgeted; a cost can be in the budget and still fail a test.")
      ] },
    { id: "transfer-card", s: "spf1", title: "Cost transfers",
      sum: "Corrections must be timely, justified, documented.",
      body: [
        P("A [[costtransfer]] moves an expense on or off an award. Acceptable reasons are things like correcting an error or reflecting actual benefit; unacceptable ones are using leftover funds or covering an overrun. Do them promptly with a written explanation."),
        KEY("The later the transfer, the harder the justification and the greater the scrutiny.")
      ] },
    { id: "effort-card", s: "spf1", title: "Effort reporting",
      sum: "Payroll charges must follow actual work.",
      body: [
        P("[[effort]] certification confirms that salary charged to awards matches the effort really given. Because the proposal's effort is treated as a commitment, big gaps need a conversation with the PO. The Foundations course on compensation and effort reporting (TC4005) covers this in depth.")
      ] },
    { id: "report-card", s: "spf1", title: "Financial reporting and drawdowns",
      sum: "Getting paid and reporting to the sponsor.",
      body: [
        P("The [[ffr]]: Columbia requests cash or sends invoices for allowable expenses and reports to the sponsor on a schedule set in the NOA. Reports must reconcile to the ledger.")
      ] },

    /* --------- SESSION 5 · ACCOUNTING & CLOSEOUT (outline, pending) --------- */
    { id: "fa-actual", s: "spf2", title: "F&A at actuals",
      sum: "The same MTDC logic, applied to what was spent.",
      body: [
        P("Indirect is calculated on actual MTDC, so the exclusions you learned in budgeting (equipment, patient care, tuition, participant support, subaward amounts above $25,000 each) apply again when checking recovery. Compare F&A charged with F&A earned and investigate differences.")
      ] },
    { id: "overrun-card", s: "spf2", title: "Overruns and cost sharing",
      sum: "Who pays when the award is overspent.",
      body: [
        P("A [[overrun]] is covered by department or discretionary funds. It is never moved to another sponsored award. Committed cost sharing must actually be provided and tracked, with documentation, because the sponsor can ask for proof.")
      ] },
    { id: "submon-card", s: "spf2", title: "Subrecipient monitoring",
      sum: "The pass-through entity's duty.",
      body: [
        P("[[monitoring]] means assessing the risk of each subrecipient, reviewing invoices against budget and progress, and following up on any audit findings. Under the federal baseline, entities spending above a threshold in federal awards must also have an audit; the 2024 revision raised that threshold to $1 million.")
      ] },
    { id: "closeout-card", s: "spf2", title: "Closeout checklist",
      sum: "What has to be done after the end date.",
      body: [
        P("Typical [[closeout]] work: final financial report, final technical report, inventions and property reporting, liquidating obligations within the sponsor's window (baseline about 120 days after the end date under the 2024 UG revision; confirm for each sponsor), clearing deficits, closing the account, and keeping records for the retention period (baseline three years after the final report is submitted)."),
        KEY("Start closeout planning before the end date, not after it.")
      ] }
  ];

  /* ---------- lookups ---------- */
  const G = {}; GLOSS.forEach(g => { G[g.id] = g; });
  const C = {}; CARDS.forEach(c => { C[c.id] = c; });
  const S = {}; SESS.forEach(x => { S[x.id] = x; });
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const esc = s => SPA.esc(s);
  /* **bold** and [[term-id|label]] on already-escaped text */
  function fmt(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
      .replace(/\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g, (m, id, label) => {
        const g = G[id];
        if (!g) return label || id;
        return '<button type="button" class="ct-link" data-act="term" data-id="' + id + '">' + (label || g.short || g.term) + "</button>";
      });
  }
  function termsIn(card) {
    const seen = [], re = /\[\[([a-z0-9-]+)/g;
    const txt = JSON.stringify(card.body);
    let m; while ((m = re.exec(txt))) if (G[m[1]] && seen.indexOf(m[1]) < 0) seen.push(m[1]);
    return seen;
  }
  function plain(s) { return String(s).replace(/\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g, (m, id, l) => l || (G[id] && (G[id].short || G[id].term)) || id).replace(/\*\*/g, ""); }
  GLOSS.forEach(g => { g._h = (g.term + " " + (g.aka || "") + " " + plain(g.def)).toLowerCase(); });

  /* ---------- state ---------- */
  function currentSession() {
    const today = new Date().toISOString().slice(0, 10);
    const list = (SPA.sessions || []);
    let cur = "spa1";
    list.forEach(s => { if (s.date <= today && S[s.id]) cur = s.id; });
    return cur;
  }
  const st = {
    view: SPA.store.get("content.view", "concepts"),
    sess: SPA.store.get("content.sess", null) || currentSession(),
    gsess: "all", q: "", focus: null,
    done: SPA.store.get("content.done", {})
  };
  if (!S[st.sess]) st.sess = "spa1";
  if (st.view !== "concepts" && st.view !== "gloss") st.view = "concepts";
  function save() { SPA.store.set("content.view", st.view); SPA.store.set("content.sess", st.sess); SPA.store.set("content.done", st.done); }

  /* ---------- rendering ---------- */
  let root;
  const $ = sel => root.querySelector(sel);

  function sessLabel(id) {
    const meta = (SPA.sessions || []).find(x => x.id === id);
    const today = new Date().toISOString().slice(0, 10);
    if (!meta) return "";
    const d = new Date(meta.date + "T12:00:00"); const nice = MONTHS[d.getMonth()] + " " + d.getDate();
    return meta.date < today ? nice + " · held" : meta.date === today ? "today" : nice;
  }
  function counts(id) {
    const cs = CARDS.filter(c => c.s === id);
    return { n: cs.length, done: cs.filter(c => st.done[c.id]).length };
  }

  function blockHTML(b) {
    switch (b.k) {
      case "p": return "<p>" + fmt(b.t) + "</p>";
      case "ul": return "<ul>" + b.items.map(i => "<li>" + fmt(i) + "</li>").join("") + "</ul>";
      case "calc": return '<div class="ct-calc"><div class="ct-calc-t">' + esc(b.t) + "</div>" + b.lines.map(l => "<div>" + fmt(l) + "</div>").join("") + "</div>";
      case "key": return '<div class="ct-key"><span class="ct-tag">Remember</span> ' + fmt(b.t) + "</div>";
      case "trap": return '<div class="ct-trap"><span class="ct-tag">Watch out</span> ' + fmt(b.t) + "</div>";
    }
    return "";
  }
  function cardHTML(c, open) {
    const rel = termsIn(c);
    return '<article class="ct-card' + (st.done[c.id] ? " is-done" : "") + '" id="ct-card-' + c.id + '" data-id="' + c.id + '">' +
      '<button type="button" class="ct-ch" data-act="card" data-id="' + c.id + '" aria-expanded="' + (open ? "true" : "false") + '" aria-controls="ct-cb-' + c.id + '">' +
      '<span class="ct-ct"><span class="ct-ctitle">' + esc(c.title) + '</span><span class="ct-csum">' + esc(c.sum) + "</span></span>" +
      '<span class="ct-chk" aria-hidden="true">✓</span><span class="ct-chev" aria-hidden="true">▾</span></button>' +
      '<div class="ct-cb" id="ct-cb-' + c.id + '"' + (open ? "" : " hidden") + ">" +
      c.body.map(blockHTML).join("") +
      (rel.length ? '<div class="ct-rel"><span class="ct-rel-l">Terms</span>' + rel.map(id => '<button type="button" class="ct-tchip" data-act="term" data-id="' + id + '">' + esc(G[id].short || G[id].term) + "</button>").join("") + "</div>" : "") +
      '<button type="button" class="ct-done" data-act="done" data-id="' + c.id + '" aria-pressed="' + (st.done[c.id] ? "true" : "false") + '">' + (st.done[c.id] ? "✓ Reviewed" : "Mark as reviewed") + "</button>" +
      "</div></article>";
  }

  function renderConcepts(openId) {
    const wrap = $(".ct-concepts");
    const chips = SESS.map(x => {
      const k = counts(x.id);
      return '<button type="button" class="ct-chip' + (x.id === st.sess ? " on" : "") + '" data-act="sess" data-id="' + x.id + '" aria-pressed="' + (x.id === st.sess) + '">' +
        '<span class="ct-chip-a">' + esc(x.short) + '</span><span class="ct-chip-b">' + esc(x.name) + '</span><span class="ct-chip-c">' + k.done + "/" + k.n + "</span></button>";
    }).join("");
    const meta = S[st.sess];
    const lab = sessLabel(st.sess);
    const code = ((SPA.sessions || []).find(x => x.id === st.sess) || {}).code || "";
    const banner = meta.pending
      ? '<div class="ct-note">📌 <b>Outline for now.</b> Built from the course agenda plus general federal-rules background, before the handout exists. Treat the details as "to be confirmed" and expect updates after the session' + (lab ? " (" + esc(lab) + ")" : "") + ".</div>"
      : "";
    wrap.innerHTML = '<div class="ct-chips" role="group" aria-label="Session">' + chips + "</div>" +
      '<div class="ct-sesshead"><b>' + esc(meta.short) + " · " + esc(meta.name) + "</b>" +
      '<span class="muted">' + esc(code) + (lab ? " · " + esc(lab) : "") + "</span></div>" + banner +
      '<div class="ct-cards">' + CARDS.filter(c => c.s === st.sess).map(c => cardHTML(c, c.id === openId)).join("") + "</div>";
  }

  function renderGloss() {
    const q = st.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let list;
    if (st.focus && G[st.focus]) list = [G[st.focus]];
    else list = GLOSS.filter(g => (st.gsess === "all" || g.s === st.gsess) && q.every(t => g._h.indexOf(t) >= 0))
      .sort((a, b) => a.term.localeCompare(b.term, "en", { sensitivity: "base" }));
    const chips = ['<button type="button" class="ct-chip ct-chip-sm' + (st.gsess === "all" ? " on" : "") + '" data-act="gsess" data-id="all" aria-pressed="' + (st.gsess === "all") + '">All</button>']
      .concat(SESS.map(x => '<button type="button" class="ct-chip ct-chip-sm' + (st.gsess === x.id ? " on" : "") + '" data-act="gsess" data-id="' + x.id + '" aria-pressed="' + (st.gsess === x.id) + '">' + esc(x.short) + "</button>")).join("");
    $(".ct-gchips").innerHTML = chips;
    $(".ct-count").textContent = st.focus ? "Showing 1 term" : list.length + " of " + GLOSS.length + " terms";
    $(".ct-showall").hidden = !st.focus;
    $(".ct-terms").innerHTML = list.length ? list.map(g => {
      const rel = (g.def.match(/\[\[([a-z0-9-]+)/g) || []).map(x => x.slice(2)).filter((v, i, a) => G[v] && a.indexOf(v) === i && v !== g.id);
      return '<article class="ct-term' + (st.focus === g.id ? " is-focus" : "") + '" id="ct-term-' + g.id + '">' +
        '<div class="ct-th"><h3>' + esc(g.term) + '</h3><span class="ct-sp">' + esc(S[g.s].short) + "</span></div>" +
        (g.aka ? '<div class="ct-aka">' + esc(g.aka) + "</div>" : "") +
        "<p>" + fmt(g.def) + "</p>" +
        (rel.length ? '<div class="ct-rel"><span class="ct-rel-l">See</span>' + rel.map(id => '<button type="button" class="ct-tchip" data-act="term" data-id="' + id + '">' + esc(G[id].short || G[id].term) + "</button>").join("") + "</div>" : "") +
        "</article>";
    }).join("") : '<div class="ct-empty">No term matches that. Try fewer letters, or a different session filter.</div>';
  }

  function setView(v) {
    st.view = v; save();
    root.querySelectorAll(".ct-seg button").forEach(b => { const on = b.dataset.v === v; b.classList.toggle("on", on); b.setAttribute("aria-selected", on ? "true" : "false"); });
    $(".ct-concepts").hidden = v !== "concepts";
    $(".ct-glossary").hidden = v !== "gloss";
  }

  function openTerm(id) {
    if (!G[id]) return;
    st.focus = id; st.q = ""; st.gsess = "all";
    const inp = $(".ct-q"); if (inp) inp.value = "";
    setView("gloss"); renderGloss();
    window.scrollTo(0, 0);
  }
  function openCard(id) {
    const c = C[id]; if (!c) return;
    st.sess = c.s; save(); setView("concepts"); renderConcepts(id);
    const el = document.getElementById("ct-card-" + id); if (el && el.scrollIntoView) el.scrollIntoView({ block: "start" });
  }

  function onClick(e) {
    const b = e.target.closest("[data-act]"); if (!b || !root.contains(b)) return;
    const act = b.dataset.act, id = b.dataset.id;
    if (act === "view") setView(b.dataset.v);
    else if (act === "sess") { st.sess = id; save(); renderConcepts(); }
    else if (act === "gsess") { st.gsess = id; st.focus = null; renderGloss(); }
    else if (act === "term") openTerm(id);
    else if (act === "showall") { st.focus = null; renderGloss(); }
    else if (act === "clear") { st.q = ""; st.focus = null; $(".ct-q").value = ""; renderGloss(); $(".ct-q").focus(); }
    else if (act === "card") {
      const open = b.getAttribute("aria-expanded") === "true";
      b.setAttribute("aria-expanded", open ? "false" : "true");
      document.getElementById("ct-cb-" + id).hidden = open;
    } else if (act === "done") {
      if (st.done[id]) delete st.done[id]; else st.done[id] = 1;
      save();
      const card = document.getElementById("ct-card-" + id);
      card.classList.toggle("is-done", !!st.done[id]);
      b.setAttribute("aria-pressed", st.done[id] ? "true" : "false");
      b.textContent = st.done[id] ? "✓ Reviewed" : "Mark as reviewed";
      const k = counts(st.sess), chip = root.querySelector('.ct-chip[data-id="' + st.sess + '"] .ct-chip-c');
      if (chip) chip.textContent = k.done + "/" + k.n;
    }
  }

  SPA.tabs.content = {
    render(panel) {
      root = panel;
      panel.innerHTML =
        '<section class="ct-head"><h2>📚 Content</h2>' +
        '<p class="muted">Key ideas from the five Essentials sessions in plain words, plus a glossary you can search.</p></section>' +
        '<div class="ct-seg" role="tablist" aria-label="Content view">' +
        '<button type="button" role="tab" data-act="view" data-v="concepts">Concepts</button>' +
        '<button type="button" role="tab" data-act="view" data-v="gloss">Glossary <span class="ct-n">' + GLOSS.length + "</span></button></div>" +
        '<div class="ct-concepts"></div>' +
        '<div class="ct-glossary" hidden>' +
        '<div class="ct-search"><input class="ct-q" type="search" inputmode="search" enterkeyhint="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Search terms: MTDC, NICRA, fringe…" aria-label="Filter glossary">' +
        '<button type="button" class="ct-x" data-act="clear" aria-label="Clear search">✕</button></div>' +
        '<div class="ct-gchips" role="group" aria-label="Filter by session"></div>' +
        '<div class="ct-meta"><span class="ct-count muted"></span><button type="button" class="ct-showall" data-act="showall" hidden>Show all terms</button></div>' +
        '<div class="ct-terms"></div></div>';
      panel.addEventListener("click", onClick);
      $(".ct-q").addEventListener("input", e => { st.q = e.target.value; st.focus = null; renderGloss(); });
      renderConcepts(); renderGloss(); setView(st.view);
    },
    onShow() { /* keep state */ }
  };

  SPA.content = {
    sessions: SESS, glossary: GLOSS, concepts: CARDS,
    openTerm(id) { SPA.go("content"); if (root) openTerm(id); },
    openCard(id) { SPA.go("content"); if (root) openCard(id); }
  };
})();
