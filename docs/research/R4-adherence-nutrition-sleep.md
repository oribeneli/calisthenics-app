# R4 — Adherence, Nutrition & Sleep for an Untrained BMI 30–35 Beginner

Scope: home calisthenics 3 × 20–25 min/week, fat loss + basic strength, no calorie counting, motivation collapses on vagueness and shame.

Evidence ratings: **[PR]** peer-reviewed primary/meta · **[G]** guideline/consensus body · **[E]** expert or practitioner source, not peer-reviewed · **[C]** my own inference from the above, no direct study.

---

## PART A — Habit & adherence science

### A1. Streaks vs. rolling consistency

- Lally et al. tracked 96 adults forming one daily habit: automaticity plateaued at a mean of **66 days** (individual range 18–254), and critically, "[missing the occasional opportunity to perform the behaviour did not seriously impair the habit formation process: automaticity gains soon resumed after one missed performance](https://pmc.ncbi.nlm.nih.gov/articles/PMC3505409/)" ([Lally 2010, Eur J Soc Psychol](https://onlinelibrary.wiley.com/doi/abs/10.1002/ejsp.674)). **[PR]** A streak counter encodes the opposite belief — that one miss is a reset.
- The **what-the-hell effect** (Polivy & Herman's abstinence-violation effect): once restrained eaters believe the rule is already broken, they [escalate rather than return to the middle ground](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7096476/). **[PR]** A zeroed streak is exactly the "rule already broken" signal.
- Streaks do drive engagement via loss aversion, but practitioner analyses report the predictable failure mode: [high engagement for 2–3 weeks, one missed day, immediate disengagement](https://thedecisionlab.com/insights/consumer-insights/streak-creep-the-perils-of-too-much-gamification), which is why Duolingo-style products add streak freezes and repairs. **[E]**
- Clear's ["never miss twice"](https://jamesclear.com/three-steps-habit-change) reframes the unit of failure from one session to two consecutive. **[E]**
- Monitoring progress itself works: 138 experiments, N ≈ 20,000, progress monitoring raised goal attainment **d = 0.40**, larger when [the information is physically recorded](https://pubmed.ncbi.nlm.nih.gov/26479070/). **[PR]** So *show* a metric — just not a brittle one.

**Rule for our app:** Primary metric = **rolling 28-day consistency: sessions done ÷ sessions scheduled, shown as a % and as a 28-dot grid**; secondary = count of weeks hitting ≥2 of 3. No streak counter anywhere; a missed day dims one dot and moves the % by ~3 points, and nothing resets.

### A2. Minimum viable session ("2-minute rule")

- The 2018 US Physical Activity Guidelines **removed the 10-minute bout minimum**: "[bouts of a prescribed duration are not essential](https://odphp.health.gov/sites/default/files/2019-09/Physical_Activity_Guidelines_2nd_edition.pdf)" — any duration counts toward the total. **[G]**
- "Exercise snacks" (bursts ≤5 min): a systematic review of 11 trials, 414 participants, found [82.8% adherence](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12732512/), and 12 weeks of remotely delivered snacks were [feasible for inactive adults in the real world](https://pmc.ncbi.nlm.nih.gov/articles/PMC12330779/). **[PR]**
- Habit formation is driven by **repetition in a consistent context**, not by session volume ([Gardner/Lally/Wardle](https://pmc.ncbi.nlm.nih.gov/articles/PMC3505409/)). Cutting duration preserves the cue–repetition pairing; cancelling destroys it. **[PR]**
- Fogg's Tiny Habits shrinks the behaviour until motivation is no longer the binding constraint ([Fogg Behavior Model](https://behaviormodel.org/)). **[E]**

**Rule for our app:** Every session offers a one-tap **"Short version (5 min)"**. The short version **counts as done** for the consistency metric — logged with a small badge, never as a partial or a half-dot. It is surfaced *before* the user quits: at session open, and again if a set is stopped twice.

### A3. Failure framing

- Self-compassion is [associated with health-promoting behaviour across 94 studies](https://self-compassion.org/wp-content/uploads/2022/08/PsychReviewInPress.pdf) (small-to-medium effects, Neff's review) and a dedicated [meta-analysis links it to physical activity and PA intention](https://www.researchgate.net/publication/346150380_The_Relationship_Between_Physical_Activity_and_Self-Compassion_a_Systematic_Review_and_Meta-analysis). **[PR]**
- A 2025 systematic review (10 studies, n = 6,808) found self-compassion "[associated with adaptive responses to exercise lapse](https://pmc.ncbi.nlm.nih.gov/articles/PMC11733102/)" and intrinsic PA motivation — while being honest that intervention evidence is mixed (2 of 3 raised self-compassion; only 1 of 3 changed PA behaviour). **[PR]**
- Self-criticism after a slip is demotivating; the workable alternative is treating the lapse as ordinary rather than diagnostic. **[PR]**

**Rule for our app:** A failed set is logged with **neutral, quantitative language only** — "8 of 10 reps", "stopped at 0:22" — never "failed", "missed", "incomplete", and never red. The default action after a stopped set is **"Log what you did"**, pre-filled with actual reps, not "Retry" or "Skip". After a missed session the app's only message is the next scheduled slot plus the 28-day % — no guilt copy, no "get back on track!".

### A4. Realistic weekly fat loss and the honest 8-week promise

- NHLBI/NIH: "[Weight loss should be about 1 to 2 lb/week for a period of 6 months](https://www.ncbi.nlm.nih.gov/books/NBK2009/)", with an initial goal of "[approximately 10 percent from baseline](https://www.ncbi.nlm.nih.gov/books/NBK2009/)". **[G]** For a 95–105 kg adult that is ~0.45–0.9 kg/wk ≈ **0.5–0.9 %/wk**, matching the commonly used 0.5–1 %/wk rule. **[C]**
- Early strength gains in untrained people are **largely neural, not muscle size**: neural factors dominate the first ~3–5 weeks of an 8-week programme ([Moritani & deVries 1979](https://pubmed.ncbi.nlm.nih.gov/453338/)). **[PR]** Reps rise fast while the mirror and the scale lag.
- 3 × 20–25 min/week is a training stimulus, not a meaningful calorie sink; scale movement comes from intake and steps. **[C]**

**Rule for our app:** Onboarding states one honest sentence: **"Expect roughly 0.5–1% of your bodyweight per week, and in the first 8 weeks expect your reps to roughly double while the scale moves slowly."** Goal-setting caps the chosen rate at 1%/wk and refuses faster. The week-8 review leads with the **strength delta** (reps and holds), not the weight delta.

### A5. Daily weigh-in + 7-day trailing average

- Day-to-day weight noise is large relative to weekly fat loss: structured within-week fluctuation alone is **~0.35% of bodyweight** (weekend gain, weekday compensation) in a multi-centre cohort ([PLOS ONE 2020](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0232152)), before water, food and glycogen noise. A 0.5%/wk signal is therefore comparable to or smaller than daily noise — **a single reading cannot show progress; a trailing average can.** **[PR]/[C]**
- Daily self-weighing improves outcomes and does **not** cause psychological harm: an RCT found [no differences in depressive symptoms, anorectic cognitions, disinhibition, hunger or binge eating](https://pubmed.ncbi.nlm.nih.gov/24355668/) (Steinberg 2014); [Pacanowski, Bertz & Levitsky 2014](https://journals.sagepub.com/doi/10.1177/2158244014556992) reach the same conclusion. **[PR]**
- Countervailing evidence: in emerging-adult women, daily weighing produced [greater negative affective lability](https://pmc.ncbi.nlm.nih.gov/articles/PMC11351998/) than an active control. **[PR]** Daily weighing should be offered, not imposed.

**Rule for our app:** Weigh-in is a **daily optional checkbox**. The chart shows **only the 7-day trailing average** as the bold line, with raw dots faded and un-annotated. Never comment on a single day's change. If the user skips ≥3 days, offer a weekly-only mode rather than nagging.

### A6. Waist circumference and progress photos

- Waist circumference has formal risk cut-offs: **>102 cm (40 in) men, >88 cm (35 in) women** mark high risk, and at BMI 30–34.9 an elevated waist moves risk from "High" to "Very High" ([NIH/NHLBI classification table](https://www.ncbi.nlm.nih.gov/books/NBK2004/table/A242/); WHO uses the same thresholds). **[G]**
- Protocol (NHANES III, the NIH method): mark the point just above the **uppermost lateral border of the right iliac crest**; tape horizontal and **parallel to the floor**, snug without compressing the skin; read to 0.1 cm **at the end of a normal expiration** ([NIH instructions](https://www.ncbi.nlm.nih.gov/books/NBK2004/box/A236/)). **[G]** Same time of day, ideally fasted, to control the same noise sources as weight. **[C]**
- **Progress photos → adherence: no credible evidence found.** Every supporting claim located was practitioner or marketing content, not a trial. Treat as unproven. **[E]/[C]**

**Rule for our app:** Waist is measured **every 2 weeks**, with an illustrated 3-line protocol (iliac crest · parallel to floor · breathe out normally) shown at every entry, and displayed alongside weight as an equal-weight metric. Progress photos are **off by default, opt-in, stored locally, never shown next to a number** — and we make no claim that they help.

### A7. Reminders and implementation intentions

- Gollwitzer & Sheeran's meta-analysis (94 tests, N > 8,000) found if-then plans specifying **when, where and how** improved goal attainment at **d = .65** — medium-to-large ([Adv Exp Soc Psychol 2006](https://www.sciencedirect.com/science/chapter/bookseries/abs/pii/S0065260106380021)). **[PR]**
- Habit formation requires the behaviour to be repeated in a **consistent context** ("after breakfast") — exactly what a fixed slot encodes ([Gardner/Lally/Wardle](https://pmc.ncbi.nlm.nih.gov/articles/PMC3505409/)). **[PR]**

**Rule for our app:** Onboarding **forces** three named slots in if-then form — "**If it's Tuesday 07:30, then I train in the living room**" — day + clock time + place. "3× a week, whenever" is not an allowed answer. Reminders fire at the slot and the notification repeats the plan sentence verbatim rather than a generic nudge; changing a slot is one tap.

---

## PART B — Minimal nutrition & sleep

### B1. Protein target

- Meta-analysis of 49 studies / 1,863 participants: protein-driven gains in fat-free mass plateau at **~1.6 g/kg/day**, with the CI extending to ~2.2 ([Morton 2018, BJSM](https://pubmed.ncbi.nlm.nih.gov/28698222/)). **[PR]**
- ISSN position stand: **1.4–2.0 g/kg/d** for exercising individuals; during hypocaloric periods **2.3–3.1 g/kg fat-free mass/d**; per meal **0.25 g/kg or an absolute 20–40 g**, distributed **every 3–4 h** ([Jäger 2017](https://pmc.ncbi.nlm.nih.gov/articles/PMC5477153/)). **[G]**
- For weight loss specifically, **1.2–1.6 g/kg/d with ≥25–30 g per meal** improves appetite and body-weight outcomes ([Leidy 2015, AJCN](https://ajcn.nutrition.org/article/S0002-9165(23)27427-4/fulltext)). **[PR]**
- **The obesity correction matters:** protein need tracks lean mass, not total mass, so g/kg of *actual* bodyweight overestimates requirements in obesity ([protein requirement in obesity, 2024](https://pubmed.ncbi.nlm.nih.gov/39514335/)). **[PR]** The ISSN's fat-free-mass anchoring makes the same point.

**Rule for our app:** Target = **1.6 g per kg of GOAL bodyweight** (a BMI-25 weight for the user's height), surfaced as **"about 30 g of protein at each of your 3 meals"** — never as a daily gram total to count. Show the number once at setup; after that, only the per-meal checkbox.

### B2. The six daily checkboxes

| # | Checkbox | Evidence | Rating |
|---|---|---|---|
| 1 | **Protein at every meal (palm-sized portion, ~30 g)** | ≥25–30 g/meal threshold for appetite and body-weight benefit ([Leidy 2015](https://ajcn.nutrition.org/article/S0002-9165(23)27427-4/fulltext)); even distribution every 3–4 h ([ISSN](https://pmc.ncbi.nlm.nih.gov/articles/PMC5477153/)) | [PR]/[G] |
| 2 | **Vegetables or fruit at 2 meals (fibre)** | A **single** goal of ≥30 g fibre/day produced −2.1 kg at 12 months vs −2.7 kg for the 13-component AHA diet — comparable, far simpler ([Ma 2015, Ann Intern Med](https://www.acpjournals.org/doi/10.7326/M14-0611)) | [PR] |
| 3 | **No sugary drinks today** | Adding SSBs caused +0.83 kg and removing them −0.49 kg in RCTs ([Nguyen/Malik 2023, AJCN](https://ajcn.nutrition.org/article/S0002-9165(22)10529-0/fulltext)); free-sugar intake determines body weight via energy intake ([Te Morenga, BMJ 2013](https://pubmed.ncbi.nlm.nih.gov/23321486/)) | [PR] |
| 4 | **A large glass of water before each main meal** | 500 ml pre-meal water added ~2 kg extra loss over 12 weeks ([Dennis 2010, Obesity](https://onlinelibrary.wiley.com/doi/full/10.1038/oby.2009.235)); replicated in primary care ([Parretti 2015](https://onlinelibrary.wiley.com/doi/10.1002/oby.21167)) | [PR] |
| 5 | **7+ hours in bed** | [AASM/SRS consensus](https://aasm.org/aasm-and-srs-publish-new-sleep-duration-consensus-statement/), plus the fat-loss and injury evidence in B3 | [G]/[PR] |
| 6 | **Walk / step target hit** | Step dose-response, B4 | [PR] |

**Rule for our app:** Exactly these six, on one screen, all binary, **no calorie or macro entry anywhere**. Checkboxes feed the same rolling-% treatment as workouts (28-day rate, no streak).

### B3. Sleep

- **7 or more hours per night** for adults 18–60 ([AASM/SRS joint consensus](https://aasm.org/aasm-and-srs-publish-new-sleep-duration-consensus-statement/)); benefit above 9 h is uncertain. **[G]**
- Same diet, less sleep, worse composition: in a crossover trial, 5.5 h vs 8.5 h in bed cut the **proportion of weight lost as fat by 55%** (0.6 vs 1.4 kg) and **increased fat-free mass loss by 60%** (2.4 vs 1.5 kg) ([Nedeltcheva 2010, Ann Intern Med](https://www.acpjournals.org/doi/abs/10.7326/0003-4819-153-7-201010050-00006)). **[PR]** Short sleep does not merely slow fat loss — it redirects the loss into muscle.
- Injury: athletes sleeping <8 h/night were **1.7× more likely to be injured**, with sleep hours the strongest independent predictor ([Milewski 2014, J Pediatr Orthop](https://www.ovid.com/jnls/pedorthopaedics/fulltext/10.1097/bpo.0000000000000151~chronic-lack-of-sleep-is-associated-with-increased-sports)) — an adolescent-athlete cohort, so extrapolation to a 35-year-old beginner is indirect. **[PR]/[C]**

**Rule for our app:** The checkbox is **"7+ hours in bed"** — self-reported time in bed, no tracker integration, no sleep score. If it is unchecked on ≥3 nights in a rolling week, the app suggests **taking the short session**; it never suggests skipping.

### B4. Steps as the aerobic base

- All-cause mortality falls with steps and plateaus at **~8,000–10,000/day under age 60** (and ~6,000–8,000 at 60+) across 15 cohorts, 47,471 adults ([Paluch 2022, Lancet Public Health](https://www.thelancet.com/journals/lanpub/article/PIIS2468-2667(21)00302-9/fulltext)); a 2025 dose-response review confirms [most of the benefit accrues well below 10,000](https://www.thelancet.com/journals/lanpub/article/PIIS2468-2667(25)00164-1/fulltext). **[PR]** 10,000 is not a clinical threshold — the steep part of the curve runs 4,000 → 7,000.
- Pedometer interventions reliably move sedentary adults by **+2,000–2,500 steps/day**, the standard achievable increment ([pedometer pilot in overweight/obese women, BMC Public Health](https://link.springer.com/article/10.1186/1471-2458-9-309)). **[PR]**
- NIH's own starting prescription for deconditioned adults is [moderate activity 30–45 min, 3–5 days/week, built up gradually](https://www.ncbi.nlm.nih.gov/books/NBK2009/). **[G]**

**Rule for our app:** **Measure baseline steps for 7 days before setting any target.** Then ramp **+1,000/day every 2 weeks** from that personal baseline, capped at **8,000**. Show the target as an added daily walk ("about 10 minutes more than last fortnight"), and never display 10,000 as the goal.

---

## Open / weak evidence, stated honestly

- **Progress photos → adherence:** no trial located. Ship as opt-in; make no efficacy claim. **[E]**
- **Rolling % vs. streak as an in-app metric:** no head-to-head app RCT located. The recommendation is an inference from Lally (single lapses don't impair habit formation), the abstinence-violation literature (framing a lapse as total failure drives escalation and disengagement), and practitioner reports of streak-break churn. **[C]**
- **Milewski injury data** come from adolescent athletes, not overweight beginners; the direction is plausible, the magnitude is not transferable. **[C]**
- **Water preload** trials used 500 ml and a concurrent hypocaloric diet; the effect without deliberate energy restriction is untested. **[C]**
