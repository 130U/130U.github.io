# AI Research and Engineering

**Author**
Theodore Ouyang

**Updated**
2026-11-19

## Confidentiality and Disclosure Note

I conducted the following four projects through Duke University collaborations from September 2023 to September 2026. Partner names and proprietary internal system identifiers are withheld under nondisclosure agreements. The collaborators include a leading foundation model developer, a frontier AI research laboratory, and a leading global alternative asset manager with more than $300 billion in assets under management. The project titles, my role as a researcher, locations, dates, system architectures, and mathematical formulations are cleared for public disclosure. Production records and operating figures are withheld; the numerical results are closed-form values, reference runs, and worked examples with their inputs stated.

# Project 01: large-scale-domain-expert-feedback-governance-and-adaptive-review

**Article Title**
Large-Scale Domain Expert Feedback Governance and Adaptive Review

**Organization**
Duke University × Leading Foundation Model Developer

**Title**
Large-Scale Domain Expert Feedback Governance and Adaptive Review

**URL**
https://www.theodoreoy.com/experience/large-scale-domain-expert-feedback-governance-and-adaptive-review/

**Position**
Researcher

**Location**
Durham, North Carolina; Palo Alto, California

**Dates**
September 2023 – September 2026

**Read More Label**
Read More


## Summary

One pool of expert hours has to do two jobs in a post-training program: tell the team how good a batch is, and fix the data that ships. Sending the riskiest submissions to review, the usual practice, makes the dashboard overstate the batch's defect rate and spends repair capacity where a review fixes least. I derived the allocation each job calls for and one rule that prices them against each other. At the same budget and the same measurement precision, that rule ships 19% to 67% fewer defects than risk-first routing across a 20% envelope around a reference batch at the program's scale. The design coordinated more than 300 specialists on weekly batches of over 10,000 tasks and was reused in later post-training programs.

## Problem and Approach

In late 2023 I started from a question about expert capacity: how should a post-training program spend a limited pool of reviewers when each review does two jobs at once? A review reveals something about the quality of the whole batch, and a correction improves the data that ships. The two values call for different allocations of the same hours. High-risk routing shows the tension. When review succeeds in targeting the tasks with higher true error probabilities, selection is correlated with the defect it looks for ($`\mathrm{Cov}(\pi(X), q(X)) > 0`$), and on a reference batch at the program's scale the error rate in the review queue reads two to four times the batch's rate.

I separated the two jobs and then joined them under one budget. Quality is measured by independent reference audits drawn with known probabilities, so the estimate is correct whatever the risk model gets wrong. Audit effort goes where residual uncertainty per unit of expert cost is largest, and repair goes where a review removes the most defect loss per unit cost. A single rule then sets both. An audit that finds a defect has also repaired it, so risk enters the audit decision as a discount on the audit's price, and risk-first routing turns out to be this rule with the value of measurement set to zero. Costs, latencies and capacities came from production records. The design coordinated hundreds of distributed specialists and external vendor queues, and I kept refining its specifications as later programs took it up. Sections 1 through 7 give the derivations, the results on the reference batch and the operating standards.

## Key Contributions

* **I formulated expert review as a statistical decision problem in which each review has two separate values: what it reveals about the quality of the batch, and what it repairs in the data that ships.** The formulation took shape in late 2023, and I kept refining it as the program grew. For each task I defined an *initial error risk* ($`q_i`$), the *statistical information value of an independent reference audit* ($`m_i / c_i`$), and the *expected defect loss removable through additional human handling* ($`\Delta_i = r_{i0} - r_{i1}`$). A high-risk task can be worth little to audit and little to repair, so the three quantities call for different uses of the same expert capacity.
* **I derived the allocation each value calls for.** Audit probabilities follow a clipped square-root rule in residual second moment and cost, which is Neyman's allocation carried to a separate expert cost for every item, with a sampling floor. Repair is ranked by removable defect loss per unit cost under specialist-capacity limits.
* **I joined the two in one rule and located risk-first routing inside it.** A reference audit that finds a defect also corrects it, so the optimal audit probability is $`\pi_i^* = \mathrm{clip}\,\sqrt{\nu m_i / (\lambda c_i - r_i)_+}`$, in which the item's residual risk $`r_i`$ is a rebate on the audit's price $`\lambda c_i`$. With the price of precision $`\nu`$ at zero the rule becomes a threshold on risk per unit cost, which is risk-first routing. The batch program separates by price, so ten thousand tasks are solved by a search over a handful of multipliers.
* **I derived what the allocation is worth in expert hours and how accurate its inputs must be.** Every precision target costs the same fixed fraction $`\kappa = (\sum_i \sqrt{m_i c_i})^2 / (\sum_i c_i \sum_i m_i)`$ of the uniform audit budget. Errors in the residual estimates cost a quarter of their weighted variance, so a 20% relative error raises the variance by about 1%.
* **The framework supported a program of more than 300 domain experts across several specialties and an external vendor network, and later post-training programs reused its design.** I led its development and defined the mathematical specifications and operating standards for task organization, reliability calibration, acceptance adjudication and review allocation. Those procedures made distributed expert judgments traceable and open to calibration as post-training feedback.
* **I designed tiered review rules from Beta-Binomial reliability posteriors, credible intervals, verified sample counts and task-level risk priors.** In one workflow, a flagged submission was dynamically assigned to three additional specialists, and an initially accepted one went to one or two. Expert adjudications fed back into the system, updating contributor reliability posteriors, informing targeted coaching and adjusting review intensity.
* **I paired independent random reference audits with escalation of high-risk tasks, so quality could still be measured while review concentrated on the hardest work.** Recurring annotator disagreements became explicit acceptance criteria. I separated missing context from ambiguous instructions and from contributor errors, then revised the task instructions, boundary cases and shared calibration anchors accordingly. Later comparisons against reviewer-error and cost-sensitive deferral models informed the escalation thresholds.
* **I built the SQL and Python pipelines behind the allocation solvers.** They brought together task metadata, review histories, acceptance outcomes, turnaround times and behavioral logs, and reconciled platform activity with the team's KPI monitoring system. From these records the solvers took empirical estimates of unit verification costs ($`c_i`$), task-stratum latencies ($`t_{iaj}`$) and hard specialist capacity limits ($`H_j^{\text{review}}`$). I also translated client-reported model defects into reproducible engineering investigations and standard operating procedures.
* **On a reference batch at the program's scale, the joint rule ships 38.6% fewer defects than risk-first routing at the same budget and the same precision, and 19% to 67% fewer across a 20% envelope around that batch.** The uncorrected review queue reads **19.60%** where the batch's defect rate is 7.10%. The residual- and cost-aware allocation reaches any precision target with **15.2%** less audit budget than uniform sampling (7.5% to 27.3% across the envelope), and risk-first routing carries **62.7%** more variance than that allocation (14% to 137%).

## Manuscript

## 1 What a review queue measures

In a production RLHF pipeline, whatever policy routes submissions to review also changes the statistical properties of the observed sample. To see how, let $`X`$ denote observable task features, including the domain, prompt complexity and contributor history. Let $`Y \in \{0, 1\}`$ indicate whether the original submission contains an error under fixed acceptance criteria, so that the true conditional error probability is $`q(x) = P(Y = 1 \mid X = x)`$. Write $`S = 1`$ when a submission is selected for an independent reference audit. Conditional on $`X`$, selection is randomized with probability $`\pi(x) > 0`$, and it is independent of the reference label, which has not yet been observed.

Suppose an operational dashboard estimates population quality from the error fraction among verified submissions. What it actually targets is:

$$
E[Y \mid S = 1] = \frac{E[\pi(X)q(X)]}{E[\pi(X)]} \tag{1.1}
$$

$$
E[Y \mid S = 1] - E[Y] = \frac{\mathrm{Cov}(\pi(X), q(X))}{E[\pi(X)]} \tag{1.2}
$$

When review succeeds in targeting higher true error risk, the covariance between audit probability $`\pi(X)`$ and true defect probability $`q(X)`$ is strictly positive, and the dashboard reads high. A rising detection rate in the reviewed sample is what better targeting looks like, and the batch may be unchanged or improving underneath it. The identities describe a selected item; in a finite batch the observed fraction has a random denominator and converges to this value.

This is Neyman's argument against purposive selection, applied to a review queue: a sample chosen to serve one purpose fails on the quantities it was not chosen for ([Neyman 1934](https://doi.org/10.2307/2342192)). Financial auditors already act on it. Under the [GAO Financial Audit Manual](https://www.gao.gov/assets/gao-18-601g.pdf) the auditor examines large and unusual items in full, samples the remainder at random, projects only the random sample to the population and records which selection is which. The PRM800K report describes the bias and leaves it there: its authors chose convincing wrong-answer solutions for labeling and noted that the choice skewed the data set toward wrong answers ([Let's Verify Step by Step](https://arxiv.org/abs/2305.20050)).

Expert rankings suffer from the same selection mechanism. Let $`a_{jh}`$ be the probability that expert $`j`$ answers a task in stratum $`h`$ correctly, and let $`p_{jht}`$ describe that expert's assigned task mix in period $`t`$. Even if underlying ability stays constant, observed accuracy moves with the task mix:

$$
A_{jt} = \sum_h p_{jht} a_{jh}, \qquad A_{j,t+1} - A_{jt} = \sum_h (p_{jh,t+1} - p_{jht}) a_{jh} \tag{1.3}
$$

Comparisons across periods therefore require a fixed target task mix $`w_h`$ and standardized accuracy:

$$
A_j^{\text{std}} = \sum_h w_h a_{jh} \tag{1.4}
$$

Overlapping assignments or shared anchor cases support estimation within each stratum. In the project's production routing engine I used a conjugate Beta-Binomial model for each contributor's reliability within a task stratum. Given a prior $`\mathrm{Beta}(\alpha_{0h}, \beta_{0h})`$ and $`n_{jht}`$ audited tasks with $`k_{jht}`$ verified successes, the posterior $`\mathrm{Beta}(\alpha_{0h} + k_{jht}, \beta_{0h} + n_{jht} - k_{jht})`$ gives shrinkage-regularized point estimates and credible intervals that account for unequal sample sizes across comparable audits. Section 7 sets out how these records drive contributor decisions.

Each piece of this problem has a literature, and each literature stops at one of the two jobs. [Dawid-Skene](https://doi.org/10.2307/2346806) models estimate how reviewers' confusion matrices differ and carry no sampling design. [PPI++](https://arxiv.org/html/2311.01453v1) gives valid inference from a small labeled sample and a large set of predictions when the labels are drawn uniformly. [Active Statistical Inference](https://arxiv.org/html/2403.03208v3) chooses which labels to collect and prices every label the same; [cost-optimal active evaluation](https://arxiv.org/abs/2506.07949) prices two kinds of rater, at one price per kind for all items. [ActiveLab](https://arxiv.org/html/2301.11856v1) decides whether the next annotation should go to a new example or to one already labeled, with a better classifier as the goal. [DeCCaF](https://arxiv.org/html/2403.06906v1) assigns cases to experts under error costs and capacity limits, and the quality of the batch is outside its objective. A production program has to price both jobs in one unit, expert hours, and the sections below do that.

## 2 Measuring a batch with audits and predictions

Fix a production batch of $`N`$ original submissions, its acceptance criteria and its latent reference labels $`Y_1, \dots, Y_N`$. The inferential target is the finite-batch error rate $`\mu = N^{-1} \sum_{i=1}^N Y_i`$. Let $`f_i \in [0, 1]`$ be a fixed, inexpensive risk prediction that combines contributor reliability posteriors, task complexity and automated heuristic checks. Assign audit probability $`\pi_i \in [\pi_{\min}, 1]`$ and draw $`S_i \sim \mathrm{Bernoulli}(\pi_i)`$ independently across submissions, with the predictions and the sampling probabilities locked before the current batch's reference labels are revealed.

I used a prediction-assisted estimator with inverse-probability-weighted (IPW) residual correction:

$$
\hat{\mu} = \frac{1}{N} \sum_{i=1}^N \left[ f_i + \frac{S_i}{\pi_i} (Y_i - f_i) \right] \tag{2.1}
$$

Write the prediction residual as $`e_i = Y_i - f_i`$ and condition on the fixed batch, the predictions and the sampling probabilities:

$$
\hat{\mu} - \mu = \frac{1}{N} \sum_{i=1}^N \left( \frac{S_i}{\pi_i} - 1 \right) e_i, \qquad E_S[\hat{\mu} - \mu] = 0 \tag{2.2}
$$

Validity comes from the design and efficiency from the model. The inverse-probability weights restore the population representation that selective verification altered, and the estimate is unbiased for any predictions at all, because the only randomness it relies on is the audit lottery the program itself runs. Better predictions shrink the residuals and with them the number of audits a given precision needs. That division of labor suits production: the estimate stays correct while the risk model is still being improved. The form is the difference estimator of survey sampling, [Horvitz-Thompson](https://doi.org/10.1080/01621459.1952.10483446) weighting applied to residuals, and the augmented IPW estimator of [Robins, Rotnitzky and Zhao](https://doi.org/10.1080/01621459.1994.10476818); [PPI++](https://arxiv.org/html/2311.01453v1) studies it with black-box predictions.

How much the predictions can save has a known ceiling under uniform sampling: a predictor no more accurate than the work it scores can at most double the effective audit sample ([Dorner et al.](https://arxiv.org/abs/2410.13341)). The gains in Sections 3 and 4 come from where the audits are sent, which is a separate source of efficiency.

To use the estimator in production, I defined procedures for freezing the audited objects, recording rubric version histories and retaining the telemetry that optimization needs. Original and revised submissions are retained as separate database entities. Telling defects introduced during initial production apart from those corrected through review takes two estimates, $`\hat{\mu}_{\text{raw}}`$ on frozen originals and $`\hat{\mu}_{\text{final}}`$ on post-review deliverables. A change in post-training criteria causes a different confusion, since stricter acceptance standards can be misread as declining contributor ability. A shared set of anchor cases is therefore adjudicated under both rubric versions whenever the criteria change, and submissions from different periods are compared under a common reference version.

## 3 Where audits buy the most information

Because the sampling is independent Bernoulli, the cross-item covariance terms drop out and the design variance is exactly:

$$
\mathrm{Var}_S(\hat{\mu}) = \frac{1}{N^2} \sum_{i=1}^N \frac{1 - \pi_i}{\pi_i} e_i^2 \tag{3.1}
$$

This expression sets the objective for audit allocation: audit effort should go to the uncertainty that automated risk predictions leave unresolved. For a binary error label with conditional error probability $`q_i`$, the expected squared residual has two components:

$$
m_i := E[(Y_i - f_i)^2 \mid X_i] = q_i(1 - q_i) + (q_i - f_i)^2 \tag{3.2}
$$

The first is the conditional Bernoulli variance $`q_i(1 - q_i)`$ and the second is the squared calibration error $`(q_i - f_i)^2`$. A high error probability $`q_i`$ therefore need not carry high inferential value. If a task category is almost certain to contain an error ($`q_i \approx 1`$) and the predictor recognizes this ($`f_i \approx 1`$), then $`m_i \approx 0`$, and an independent reference audit of that item says less about population quality than an audit of a moderately risky item whose outcome is still open ($`q_i \approx 0.5`$). A repair model and a measurement model look at the same task and want different things from it.

Let $`c_i > 0`$ be the empirical cost of an independent reference audit, calibrated by reconciling platform review logs with active-work records from the team's KPI monitoring system, and let $`B`$ be the expected audit-cost budget. With residual second moments $`m_i > 0`$, the optimal design solves:

$$
\min_{\pi} \sum_{i=1}^N \frac{m_i}{\pi_i} \quad \text{s.t.} \quad \sum_{i=1}^N c_i \pi_i \le B, \quad \pi_{\min} \le \pi_i \le 1 \tag{3.3}
$$

The objective omits the constant $`-\sum_i m_i`$, which does not depend on the allocation. For probabilities strictly between their bounds, the Lagrangian first-order condition gives the clipped square-root allocation:

$$
-\frac{m_i}{\pi_i^2} + \lambda c_i = 0 \implies \pi_i^* = \mathrm{clip}_{[\pi_{\min}, 1]} \left( \sqrt{\frac{m_i}{\lambda c_i}} \right) \tag{3.4}
$$

The multiplier $`\lambda > 0`$ is set by the budget, feasibility requires $`B \ge \pi_{\min} \sum_i c_i`$, and a budget that covers a full audit audits everything. The rule samples harder where expected residuals are larger and more lightly where audits cost more, while the floor $`\pi_{\min}`$ keeps every part of the task space covered and bounds the IPW weights.

The square-root form has a long ancestry. With equal costs and strata it is Neyman's allocation; with stratum costs it is the optimum allocation of [Cochran's text](https://www.wiley.com/en-us/Sampling+Techniques%2C+3rd+Edition-p-9780471162407); inclusion probabilities proportional to a model's error standard deviation are the anticipated-variance optimum of [Isaki and Fuller](https://doi.org/10.1080/01621459.1982.10477770); and [Chen and Lumley](https://doi.org/10.1002/sim.8760) set such designs wave by wave from earlier waves. Machine-learning work reached the same rule for labels of equal cost. Expert audits do not cost the same: on the reference batch of Section 6, an independent reference solution for the hardest tasks costs three times a routine one. My rule carries a cost for every item.

Production allocation uses regularized stratum estimates $`\hat{m}_i > 0`$ from earlier independent audits or a pilot calibration batch, at the level of `(task stratum × criteria version × cost stratum)`, so that no parameter is fitted to an individual submission. A weekly program is a multiwave design in which each batch's audits set the next batch's allocation. The budget $`B`$ constrains expected audit cost per batch; a workflow that needs an exact audit count uses a fixed-size design with the same first-order inclusion probabilities.

## 4 What the allocation is worth, and how accurate its inputs must be

Let $`C = \sum_i c_i`$, $`M = \sum_i m_i`$ and $`S = \sum_i \sqrt{m_i c_i}`$. Uniform sampling at the same expected cost uses probability $`p = B / C`$. With no probability at a clipping boundary, averaging the design variance over the conditional label distribution gives:

$$
V_{\text{uniform}} = \frac{1}{N^2} \left[ \frac{C M}{B} - M \right], \qquad V_{\text{optimal}} = \frac{1}{N^2} \left[ \frac{S^2}{B} - M \right] \tag{4.1}
$$

If all items within a task stratum share a sampling probability, substituting that stratum's finite-batch mean squared residual for $`m_i`$ makes these exact finite-batch identities. By the Cauchy-Schwarz inequality $`S^2 \le C M`$, with equality if and only if $`m_i / c_i`$ is constant across items. The gain exists exactly where residual uncertainty per unit of audit cost varies across the batch.

**The same precision for a fixed fraction of the budget.** A program manager fixes the precision the dashboard needs and asks what it costs. Solving each variance for the budget that reaches a target $`\tau^2`$:

$$
B_{\text{optimal}}(\tau^2) = \frac{S^2}{N^2 \tau^2 + M}, \qquad B_{\text{uniform}}(\tau^2) = \frac{C M}{N^2 \tau^2 + M}, \qquad \frac{B_{\text{optimal}}}{B_{\text{uniform}}} = \kappa := \frac{S^2}{C M} \tag{4.2}
$$

The ratio $`\kappa`$ does not depend on the target. Whatever precision the program asks for, the residual- and cost-aware allocation delivers it for the same fraction of the uniform audit budget, and that fraction is a property of the batch: how unevenly residual uncertainty and audit cost are spread across it. The hours it frees, $`(1 - \kappa) B_{\text{uniform}}`$, are available for repair, which is the first link between the two jobs.

**How accurate the residual estimates must be.** The allocation is computed from estimates $`\hat{m}_i`$. Write $`\hat{m}_i = m_i (1 + \varepsilon_i)`$ and weight each item by its share $`w_i = \sqrt{m_i c_i} / S`$ of the optimal budget. With neither allocation clipped, the variance of the allocation built on the estimates exceeds the optimum by:

$$
V(\hat{\pi}) - V(\pi^*) = \frac{S^2}{N^2 B} \left[ \Big( \sum_i w_i \sqrt{1 + \varepsilon_i} \Big) \Big( \sum_i \frac{w_i}{\sqrt{1 + \varepsilon_i}} \Big) - 1 \right] = \frac{S^2}{N^2 B} \left[ \tfrac{1}{4} \mathrm{Var}_w(\varepsilon) + O(\|\varepsilon\|^3) \right] \tag{4.3}
$$

The first-order terms cancel. Three consequences follow for the specification of the estimation pipeline. Overestimating or underestimating every residual by a common factor costs nothing, since only the dispersion of the relative errors enters. A relative error of 20% across strata raises the variance by about one percent of $`S^2/(N^2 B)`$, so stratum-level estimates carried over from earlier batches need to be accurate only to that order. And the exact expression shows where the rule can be hurt: through $`1/\sqrt{1 + \varepsilon_i}`$, by a gross underestimate of a residual somewhere in the task space.

Two guards bound that last case. The floor $`\pi_{\min}`$ bounds every weight. Mixing the computed probabilities with the uniform design at the same budget,

$$
\pi_i(\rho) = (1 - \rho)\hat{\pi}_i + \rho p, \tag{4.4}
$$

bounds the variance for any estimates whatever, because every probability is then at least $`\rho p`$:

$$
\frac{V(\pi(\rho))}{V_{\text{uniform}}} \le \frac{1 - \rho p}{\rho (1 - p)} \tag{4.5}
$$

This is the defensive mixture of importance sampling ([Hesterberg 1995](https://doi.org/10.1080/00401706.1995.10484303)) written for a Bernoulli audit design. The weight $`\rho`$ is tuned on earlier batches; [robust active inference](https://arxiv.org/html/2511.08991v1) later gave an asymptotic choice of the same weight.

## 5 One budget, two products

Statistical auditing measures population quality. Operational review has a different job, removing defects from the current batch before it is delivered for training. For task $`i`$ under handling action $`a`$, such as direct acceptance, peer review, expert adjudication or contributor revision, let $`r_{ia}`$ be the expected error loss remaining after the action, $`d_{ia}`$ its operational cost, and $`t_{iaj}`$ the time required from specialist $`j`$, measured through platform records and the team's KPI monitoring system. Binary assignment decisions $`z_{ia} \in \{0, 1\}`$ solve:

$$
\min_{z} F(z) = \sum_{i,a} z_{ia}(r_{ia} + \eta d_{ia}) \quad \text{s.t.} \quad \sum_a z_{ia} = 1, \quad \sum_{i,a} z_{ia} t_{iaj} \le H_j \quad \forall j \tag{5.1}
$$

Here $`H_j`$ is the specialist's available time, and $`\eta \ge 0`$ converts resource cost to the scale of error loss.

**Repair follows removable loss.** When review costs are equal and each reviewed task uses one slot, the marginal remediation gain $`\Delta_i = r_{i0} - r_{i1}`$ determines the optimal priority order. A high-risk task may be hard to repair through one additional review because external evidence is missing, which gives a small $`\Delta_i`$. A self-contained calculation error in a moderate-risk task may be fully correctable, which gives a large $`\Delta_k`$. Moving one review slot from task $`i`$ to task $`k`$ changes total expected loss by:

$$
\Delta F = (r_{i0} + r_{k1}) - (r_{i1} + r_{k0}) = \Delta_i - \Delta_k \tag{5.2}
$$

Whenever $`\Delta_k > \Delta_i`$, the exchange strictly reduces delivered defect loss, regardless of the initial risk ordering. Optimal triage under a budget has the same threshold structure, with the human's case-level loss in place of the model's risk ([Okati et al.](https://proceedings.nips.cc/paper_files/paper/2021/file/4c4c937b67cc8d785cea1e42ccea185c-Paper.pdf)). A worked example fixes the size of the effect. Two task groups of $`100`$ items each have initial error risks of $`0.40`$ and $`0.15`$, and additional review reduces these risks to $`0.30`$ ($`\Delta_1 = 0.10`$) and $`0.01`$ ($`\Delta_2 = 0.14`$). Review costs are equal and capacity is $`100`$ items. Ranking by initial risk leaves $`100(0.30) + 100(0.15) = 45`$ expected errors; ranking by $`\Delta_i`$ leaves $`100(0.40) + 100(0.01) = 41`$, a reduction of **8.89%** at the same review volume.

The quantity that has to be calibrated is the post-action risk. Suppose $`\left\vert\hat{r}_{ia} - r_{ia}\right\vert \le \delta`$ for every feasible action, costs and capacities are known, and $`\hat{z}`$ minimizes the predicted objective $`\hat{F}(z)`$. Relative to the true optimal feasible assignment $`z^*`$:

$$
F(\hat{z}) \le \hat{F}(\hat{z}) + N\delta \le \hat{F}(z^*) + N\delta \le F(z^*) + 2N\delta \tag{5.3}
$$

That bound is the reason the program ran randomized pilot trials across the permitted review actions: they estimate $`r_{ia}`$ directly.

**The batch program.** Audits and repair draw on the same money. Let $`\tau^2`$ be the variance ceiling for the quality estimate, $`B_{\text{total}}`$ the total cost budget, and $`V_{\hat{m}}(\pi) = N^{-2}\sum_i (1 - \pi_i)\hat{m}_i / \pi_i`$ the planning variance under the calibrated residual model. A reference audit produces an independent reference solution, so an audited item found defective ships corrected. Writing $`a_i`$ for the action assigned to item $`i`$, the item ships with expected loss $`(1 - \pi_i)\, \hat{r}_{i a_i}`$, and the batch is planned by a mixed-integer convex program:

$$
\min_{z, \pi} \sum_{i,a} z_{ia} (1 - \pi_i)\, \hat{r}_{ia} \quad \text{s.t.} \quad \sum_{i,a} z_{ia} d_{ia} + \sum_i c_i \pi_i \le B_{\text{total}}, \quad V_{\hat{m}}(\pi) \le \tau^2 \tag{5.4}
$$

$$
\sum_a z_{ia} = 1, \quad z_{ia} \in \{0, 1\}, \quad \sum_{i,a} z_{ia} t_{iaj} \le H_j^{\text{review}} \ \forall j, \quad \pi_{\min} \le \pi_i \le 1 \tag{5.5}
$$

The hard capacity $`H_j^{\text{review}}`$ goes to remediation actions, and reference audits are scheduled independently on frozen original submissions.

**The joint rule.** Attach a price $`\lambda`$ to the budget, $`\nu`$ to the precision ceiling (in units of $`N^2 V`$) and $`\gamma_j`$ to each specialist's hours. At those prices the program separates into one small problem per task, and each has a closed form:

$$
\pi_i^* = \mathrm{clip}_{[\pi_{\min}, 1]} \left( \sqrt{\frac{\nu\, m_i}{\big( \lambda c_i - r_{i a_i} \big)_+}} \right), \qquad a_i^* = \arg\min_a \; (1 - \pi_i)\, r_{ia} + \lambda d_{ia} + \sum_j \gamma_j t_{iaj} \tag{5.6}
$$

with $`\pi_i^* = 1`$ when $`r_{i a_i} \ge \lambda c_i`$. Three readings of the audit rule carry the argument of this article.

1. *Risk is a rebate.* The item's residual risk $`r_{i a_i}`$ is subtracted from the audit's price $`\lambda c_i`$. Risk does not drive the audit; it makes the audit cheaper, by the repair the audit performs on the way.
2. *Measurement alone.* If audits repaired nothing, the rebate would vanish and the rule would be the $`\sqrt{m_i / c_i}`$ allocation of Section 3.
3. *Repair alone.* If nobody valued the estimate, $`\nu = 0`$, the rule audits exactly the items with $`r_{i a_i} \ge \lambda c_i`$, a threshold on risk per unit cost. That is risk-first routing. The legacy policy is the joint rule of a program that does not care what its batch quality is.

Initial risk, residual uncertainty per unit cost and removable loss now sit in one pair of formulas, and design-unbiasedness is untouched: the probabilities depend only on quantities fixed before the labels are revealed, and $`\hat{\mu}_{\text{raw}}`$ is still computed on frozen originals.

The prices also make the program cheap to solve. For fixed $`(\lambda, \nu, \gamma)`$ every task's audit probability and action follow from the two formulas above in one pass, so a weekly batch of ten thousand tasks is a search over $`\lambda`$, $`\nu`$ and one price per specialist, with a linear-time step. The linear relaxation of the assignment splits at most one task per binding budget or capacity constraint, so rounding to whole assignments moves at most that many tasks, and the gap between the priced bound and the rounded plan certifies the solution. When the program is infeasible, the price that diverges names what is short: the precision target, the specialist hours or the budget.

The ratio $`\nu / \lambda`$ is the exchange rate between the two products: the number of delivered defects the program gives up to tighten the estimate by one unit of variance. Section 6 reads it off the reference batch.

## 6 Results on a reference batch

**Reference batch.** Production records and operating figures are withheld under the nondisclosure agreement. The results below are stated on a reference batch at the program's scale: one week of work, $`N = 10{,}000`$ submissions in three strata by difficulty, most of them routine and a tenth of them hard, with defect rates and audit costs that rise with difficulty. Each headline result is given twice: at the reference batch, and as its range over an envelope in which each entry of the batch moves independently by up to 20% in either direction.

**Table 1. The reference batch in three strata by difficulty.**

| | Routine | Intermediate | Hardest |
| --- | --- | --- | --- |
| Share of the batch | 60% | 30% | 10% |
| Defect rate of original submissions ($`q`$) | 1% | 10% | 35% |
| Frozen risk prediction ($`f`$) | 2% | 8% | 30% |
| Cost of an independent reference audit ($`c`$, routine = 1) | 1 | 1.5 | 3 |
| Share of defects removed by one additional review | 80% | 80% | 30% |

The batch defect rate is $`\mu = 7.10\%`$. One review costs half of a reference audit in the same stratum. The audit budget is 2,000 cost units, 14.8% of the cost of auditing everything, with a sampling floor of $`\pi_{\min} = 3\%`$.

**Measurement at equal audit budget.** Every policy below uses the estimator of Section 2 and spends the same expected audit budget.

**Table 2. Audit policies at an equal expected audit budget.**

| Audit policy | Audit probability by stratum | Standard deviation of the estimate (percentage points) | Variance relative to uniform | Range over the envelope |
| --- | --- | --- | --- | --- |
| Uniform sampling | 14.81% / 14.81% / 14.81% | 0.568 | Baseline | Baseline |
| Risk-first (probability proportional to $`f_i`$) | 3.00% / 11.56% / 43.33% | 0.657 | +33.8% | -16% to +97% |
| Residual- and cost-aware (Section 3) | 7.89% / 19.37% / 21.84% | **0.515** | **-17.8%** | -9% to -32% |

Three results hold everywhere in the envelope. The uncorrected error rate in the risk-first queue reads **19.60%** against a batch rate of 7.10%, an overstatement of 2.76 times, and between 1.96 and 4.14 times across the envelope; the correction of Section 2 recovers 7.10% under every policy. The residual- and cost-aware allocation always measures better than uniform sampling. And risk-first routing always measures worse than that allocation, with **62.7%** more variance at the reference batch and 14% to 137% more across the envelope. How risk-first routing compares with random sampling is not stable: it is 34% worse at the reference batch and can fall on either side within the envelope. Its quality as a measurement design depends on how predicted risk happens to line up with residual uncertainty and audit cost, which nothing in the policy controls.

**The price of precision.** The budget ratio of Section 4 is $`\kappa = 0.848`$: the residual- and cost-aware allocation reaches any precision target with **15.2%** less audit budget than uniform sampling, and with 7.5% to 27.3% less across the envelope.

**Table 3. Audit budget needed to reach each precision target.**

| Target standard deviation (percentage points) | Audit budget, residual- and cost-aware | Audit budget, uniform |
| --- | --- | --- |
| 0.50 | 2,100 | 2,475 |
| 0.40 | 2,974 | 3,506 |
| 0.30 | 4,399 | 5,185 |
| 0.25 | 5,419 | 6,387 |

**Calibration tolerance.** With relative errors of alternating sign and size $`e`$ in the three stratum residual estimates, the variance rises above the optimum as follows.

**Table 4. Variance cost of errors in the stratum residual estimates.**

| Relative error in the residual estimates | Variance above the optimum | Quarter-variance law |
| --- | --- | --- |
| 10% | 0.30% | 0.30% |
| 20% | 1.23% | 1.19% |
| 30% | 2.88% | 2.68% |
| 50% | 9.2% | 7.4% |

The stress case is a residual ordering reversed across the strata, which sends the allocation to 23.00% / 11.77% / 3.00% and raises the variance to 199.7% above uniform. With a weight of $`\rho = 0.7`$ on the uniform design the same wrong estimates cost 17.1%, and the bound of Section 4 guarantees no more than 50.3% for any estimates.

**One budget, two products.** The total budget is 5,000 cost units, 37% of the cost of auditing everything, to be divided between audits and reviews. With no handling the batch ships 710 defects.

**Table 5. One budget of 5,000 cost units divided between audits and reviews.**

| Plan | Audit probability by stratum | Share of each stratum reviewed | Standard deviation of the estimate (percentage points) | Defects shipped |
| --- | --- | --- | --- | --- |
| Risk-first for audits and for reviews | 3.00% / 11.56% / 43.33% | 0% / 67% / 100% | 0.657 | 320.9 |
| Measurement rule of Section 3, then reviews by removable loss | 7.89% / 19.37% / 21.84% | 0% / 100% / 50% | 0.515 | 336.2 |
| Joint rule at the precision of risk-first routing | 3.31% / 9.57% / 100% | 0% / 61% / 0% | 0.657 | **197.1** |
| Joint rule at the precision of uniform sampling | 4.20% / 12.74% / 100% | 0% / 52% / 0% | 0.568 | **209.9** |
| Joint rule with no precision ceiling | 3.00% / 3.00% / 100% | 0% / 75% / 0% | 1.035 | 174.9 |

At the same budget and the same precision, the joint rule ships **38.6%** fewer defects than risk-first routing, and 19% to 67% fewer across the envelope. Held to the tighter precision of uniform sampling it still ships 34.6% fewer.

Table 5 also shows why the two jobs cannot be planned one after the other. Choosing audits for measurement and then spending the rest on repair gives the best estimate in the table and ships more defects than the legacy policy, because it ignores the repair that audits perform. Held to the sequential plan's own precision of 0.515 points, the joint rule ships 34.7% fewer defects than that plan, and 12.4% to 69.3% fewer across the whole envelope. The joint rule sends every item of the hardest stratum to an independent reference solution: there a review removes 30% of the defects and a reference audit removes all of them, at a risk per unit cost of $`0.35 / 3 = 0.117`$ against a budget price $`\lambda`$ of 0.093 to 0.096. In the two easier strata the audit probabilities follow the closed form of Section 5: the $`\nu`$ implied by the routine stratum and the $`\nu`$ implied by the intermediate stratum agree to six digits in both joint plans.

The last three rows are the exchange rate. Holding the estimate at 0.657 points costs 22 shipped defects relative to no ceiling, and tightening it to 0.568 costs 13 more. A program that knows this number can decide how much it wants to know.

The envelope for this table covers the eight entries that enter the comparison: the hardest stratum's share, prediction and audit cost, the defect rates and review effects of the two harder strata, and the ratio of review cost to audit cost.

## 7 Operating the design

**Contributor records.** Tiered review sends more work from weaker contributors to audit, so the number of audits a contributor has is correlated with reliability, and shrinkage toward a common prior misreads exactly that pattern ([Brown 2008](https://arxiv.org/abs/0803.3697)). The random reference audits supply the correction: their selection does not depend on the contributor's record, so reliability estimated on that stream is free of the routing effect and calibrates the posteriors built from adjudications. For decisions about coaching and review intensity the posterior is read through one number per contributor and stratum, the probability of falling below the stratum standard $`a_0`$:

$$
t_j = \Pr(a_{jh} < a_0 \mid \text{audits}) = I_{a_0}\big( \alpha_{0h} + k_j,\; \beta_{0h} + n_j - k_j \big) \tag{7.1}
$$

where $`I`$ is the regularized incomplete beta function. Contributors enter the action list in decreasing order of $`t_j`$ until the average of $`1 - t_j`$ over the list reaches a set false-selection rate, which treats selection as the compound decision it is ([Gu and Koenker](https://doi.org/10.3982/ECTA19304)). A worked example with prior $`\mathrm{Beta}(18, 2)`$ and standard $`a_0 = 0.85`$ shows what the rule corrects. A contributor with 33 of 40 audited tasks correct has $`t = 0.47`$; one with 6 of 8 correct has $`t = 0.41`$; one with 57 of 60 correct has $`t = 0.005`$. Raw accuracy would send the second contributor to coaching first on eight audits. The tail probability puts the first one ahead, on five times the evidence.

**What an auditor's error costs.** The estimator measures the rate of audit labels, and audit labels are themselves a measurement. Let the auditor's sensitivity and specificity be estimated from blind re-audits, with $`J = \text{sens} + \text{spec} - 1`$. The true rate is recovered by the classical correction $`\mu = (\tilde{\mu} - (1 - \text{spec})) / J`$ ([Rogan and Gladen](https://pubmed.ncbi.nlm.nih.gov/623091/)), at $`1/J^2`$ times the variance, and the budget identity of Section 4 converts that into audit hours. On the reference batch, holding the true rate to a standard deviation of 0.568 points:

**Table 6. Audit budget with an imperfect auditor, at a standard deviation of 0.568 points.**

| Auditor error | Audit budget relative to an error-free auditor |
| --- | --- |
| 5% of defects missed | +5.2% |
| 2% of clean items flagged | +43.8% |
| Both | +52.8% |

False flags cost about eight times what misses cost here. More than nine items in ten are clean, and a 2% false-flag rate on them nearly triples the residual variance of the routine stratum. The first target of auditor calibration is therefore the false flag.

**Comparability over time.** Each estimate belongs to one frozen criteria version. Dual-version anchors link versions when the criteria change, and the same anchor set serves to detect drift in auditors' standards between changes.

**Evaluation in production.** I defined separate production evaluations for the two jobs, because errors found in a targeted queue measure how well review locates defects and nothing else.

1. **Inference on frozen, adjudicated batches.** Uniform sampling, legacy high-risk routing, cost-aware residual allocation and defensive mixtures are each set against complete independent adjudication, and judged on bias, mean squared error (MSE) and interval coverage within task strata and rubric versions.
2. **Remediation trials at matched capacity.** Legacy tiered rules are set against marginal-gain ($`\Delta_i`$) action allocation at equal total specialist hours, and judged on the severe defects remaining in the final post-training corpus and the fully loaded cost per accepted submission.

The program worked through roughly one batch a week, with more than 10,000 tasks per batch and more than 300 specialists. Contributor reliability records, tiered review workflows and random reference audits became its operating standards for quality measurement and review allocation, and later post-training programs took over the design.

# Project 02: financial-task-design-and-synthetic-data-engineering

**Article Title**
Financial Task Design and Synthetic Data Engineering

**Organization**
Duke University × Leading Foundation Model Developer

**Title**
Financial Task Design and Synthetic Data Engineering

**URL**
https://www.theodoreoy.com/experience/financial-task-design-and-synthetic-data-engineering/

**Position**
Researcher

**Location**
Durham, North Carolina; Palo Alto, California

**Dates**
September 2023 – September 2026

**Read More Label**
Read More


## Summary

When a synthetic financial case changes one number, its reference answer, the evidence behind that answer, and the expert's preference can all go stale together. Synthetic data is judged on fidelity, utility, and privacy, and none of the three asks whether the label is still right; at a margin of a quarter of the perturbation scale, an inherited label is wrong 40% of the time. I built the rules that decide when each object has to be recomputed, and the generators that keep accounting identities exact as the data scales. I created Batch Zero to test those rules on domain experts before a task family scaled, and the partner company subsequently adopted the protocol across other post-training programs.

## Problem and Approach

In late 2023, frontier foundation models could reproduce corporate finance definitions and still made unpredictable errors in financial workflows, where a small numerical change or an accounting footnote could reverse an investment recommendation. Adding synthetic data helps only if the supervision moves with the scenario. I built the data strategy around that requirement, connecting task specifications, synthesis methods and expert calibration to the capability objectives of post-training research teams and to two problems:
1. **Diagnosing reasoning limits through task design.** I designed prompts around subtle business failure modes, including covenant breaches, off-balance-sheet adjustments and valuation differences close to a decision boundary, because simple prompts may give little basis for telling candidate responses apart. Paired with the five-level preference protocol, these prompts carry a domain judgment such as *"Response A is better because it isolates the working-capital constraint and cites Footnote 4"* into structured preference supervision for post-training.
2. **Matching the generator to the financial structure.** Synthetic financial data has to satisfy structural constraints, stay consistent with reference judgments and respect the task's information boundaries. A corporate table that violates Total Assets $`=`$ Total Liabilities $`+`$ Equity, even by a fraction of a percentage point, introduces a structural error. An interest-rate path that exposes a future terminal rate to a historical forecasting task introduces temporal leakage.

I treat the result as a fourth axis of synthetic-data quality, *supervision validity*: the share of generated cases whose scenario, reference conclusion, evidence and preference are all still correct for the case as generated. The system that maintains it works like an incremental build. The four objects form a dependency graph, a change to the scenario marks everything downstream as stale, and a certificate computed from the decision margin says which labels may be inherited without rework. Identities hold by construction in the generator, each temporal task states which information it may see, and Batch Zero checks before scale that experts who did not write a specification can execute it. Sections 1 through 6 give the conditions, analytical results and designs for each part.

The team averaged roughly 500 completed financial tasks a week. Each task combined synthetic financial data with a reference solution and expert review. A typical financial task took about three specialist-hours across drafting, three reviews and revision.

## Key Contributions

* **I framed the scaling of financial training data as a problem of keeping its supervision valid.** When a financial scenario changes, its reference conclusion, supporting evidence and expert preference can all stop being correct together. From late 2023 I treated those four objects and the dependencies among them as a single design problem, and I refined the framework through the programs that followed. For a frontier foundation model program I specified the capability taxonomy, primary evidence standards, input schemas, decisive variables and acceptance criteria. The diagnostic cases targeted high-stakes business decision boundaries where foundation models and practitioners repeatedly make errors, and they translated doctoral or CFA-level domain judgment into testable task requirements.
* **I tied reference recomputation to the decision margin of each synthetic variant.** Margin conditions certify when the decision label remains unchanged; reference calculations, supporting evidence and pairwise preferences are checked separately. Gaussian margin-to-noise analysis ($`\gamma/s`$) measures the label-flip risk, and for covenant tests, which are ratios of accounting levels, the closed form is exact. Variants below a margin-to-noise threshold are recomputed and the rest inherit their labels with a stated error bound. When a perturbation approaches or crosses a decision boundary, the workflow recomputes the reference solution and collects new five-level preference judgments on fresh model reasoning.
* **I designed a five-level pairwise preference protocol for RLHF and DPO supervision.** It records why an expert prefers one response to another. Each judgment has to cite verifiable evidence, the relevant accounting rules and the decisive variables, so the preference reaches post-training with its reasons attached and helps train models to assess whether a financial judgment has sufficient support. One graded judgment carries the information of 1.4 to 2 binary judgments about the quality gap between two responses.
* **I created Batch Zero to establish and refine these standards, and the partner company subsequently adopted the protocol across other post-training programs.** Starting from the capability objectives and data requirements of post-training research teams, I established a protocol for independent execution and expert calibration that a task family goes through before it enters large-scale data construction. Doctoral-level domain experts independently construct tasks, generate synthetic variants, solve reference cases and assign five-level pairwise preference scores. The disagreements and failure modes that appear in execution inform revisions to task specifications, boundary cases and **Batch One** data acceptance criteria. An error caught at the seed is caught once for every variant the seed would have produced.
* **I developed financial synthetic data methods for four settings.** For each task I selected a mathematical generator and adapted it to the task's structural invariants, data types and permitted information:
  * *Cross-sectional corporate fundamentals.* I used Gaussian and vine copulas with conditional sampling for company size, operating history and financial ratios. These methods preserve joint dependencies across columns and avoid the unrealistic combinations that sampling each column independently produces.
  * *Accounting identities, ratio bounds and chronological order.* Constrained sampling, variable transformations and covariance-weighted affine projections enforce balance-sheet and cash-flow identities, ratio ranges and date ordering. On a reference run of 200,000 twelve-dimensional draws under four identities, the maximum constraint residual was **$`3.0 \times 10^{-15}`$**; rejection sampling under four constraints at a tolerance of 0.05 standard deviations accepts $`0.0002529\%`$ of candidates. The distance each draw is moved is a chi-square statistic that monitors the upstream generator at no cost.
  * *Multimodal records with numerical and categorical fields.* Deep tabular generators model the multimodal empirical distributions, and business-rule checks are mandatory after generation.
  * *Continuous-time price and interest-rate paths.* SDEs, neural SDEs, Brownian bridges and stochastic interpolation generate paths for temporal financial tasks, and each method is matched to the task's permitted filtration ($`\mathcal{F}_s`$) to keep future information out of evaluation.
* **I quantified stale-label errors, temporal leakage and task-family clustering in closed form.** When labels are not recomputed, perturbations near a decision boundary produce **40.13%** inherited-label error at $`\gamma/s = 0.25`$. Undisclosed Brownian bridge endpoint conditioning creates an apparent **29.29% reduction in RMSE** at the interval midpoint through future-information leakage, and for mean-reverting rates the leak shrinks to $`1 - (1 + e^{-2\kappa h})^{-1/2}`$. With within-family correlation $`\rho = 0.5`$, 2,000 nominal synthetic variants from 100 task families amount to about **190** effective independent observations, and the same budget spent at the optimal number of variants per family has 29% less variance.

## Manuscript

## 1 Distributional fit and task validity

Modern tabular generators address different distributional problems. [CTGAN](https://arxiv.org/abs/1907.00503) handles mixed discrete and continuous data, multimodality and class imbalance through mode-specific normalization and conditional vectors, and [TabDDPM](https://proceedings.mlr.press/v202/kotelnikov23a.html) runs Gaussian diffusion on numerical fields and multinomial diffusion on categorical ones. Both learn empirical distributions effectively. A financial task can match its distribution and still be invalid, because part of what makes it valid is structural. Accounting identities have to hold exactly, fiscal periods have to run in chronological order, covenant applicability conditions have to be respected, and the numerical inputs have to agree logically with the reference judgment. Global distributional similarity metrics enforce none of this.

A simple construction shows how far apart the two can drift. Suppose valid financial inputs $`x \in \mathbb{R}^d`$ have to satisfy $`m`$ linear accounting or ratio identities $`Ax = b`$, where $`A \in \mathbb{R}^{m \times d}`$ has full row rank, so that the valid population distribution $`P`$ is supported entirely on the affine subspace $`M = \{x \in \mathbb{R}^d : Ax = b\}`$. Assume this distribution has finite second moments, and let the columns of $`N \in \mathbb{R}^{d \times m}`$ form an orthonormal basis for the normal space orthogonal to $`M`$. Now take a generator that captures $`P`$ along the manifold but adds a small amount of independent noise in the normal directions: $`X_\sigma = X + \sigma N \varepsilon`$, where $`\varepsilon \sim \mathcal{N}(0, I_m)`$ is independent of $`X \sim P`$. Writing $`Q_\sigma`$ for the generated distribution, I obtain, for every $`\sigma > 0`$,

$$
W_2(P, Q_\sigma) \le \sqrt{E\|X_\sigma - X\|^2} = \sigma \sqrt{m} \longrightarrow 0 \quad (\text{as } \sigma \to 0^+) \tag{1.1}
$$

$$
P(M) = 1, \qquad Q_\sigma(M) = 0 \tag{1.2}
$$

$$
\|P - Q_\sigma\|_{\text{TV}} := \sup_B \left\vert P(B) - Q_\sigma(B)\right\vert = 1 \tag{1.3}
$$

The first line comes from coupling $`(X, X_\sigma)`$ on the same probability space. The second holds because $`AN`$ is invertible and a continuous $`m`$-dimensional Gaussian vector equals zero with probability zero, and taking the Borel set $`B = M`$ then gives the third. So the 2-Wasserstein distance $`W_2(P, Q_\sigma)`$ can tend to zero while the acceptance rate under exact business constraints stays at zero ($`Q_\sigma(M) = 0`$) and the total variation distance stays at its maximum value of $`1`$. With a numerical tolerance the acceptance rate depends on the ratio of tolerance to off-manifold noise, and Section 2 shows that at a fixed ratio it falls geometrically with each added constraint.

The construction is one instance of a general gap. Synthetic data is evaluated on three axes, fidelity to the source distribution, utility for a downstream model and privacy, and the sample-level refinements of those metrics still score the inputs ([Alaa et al.](https://proceedings.mlr.press/v162/alaa22a.html)). None of the three has a place for the question a training team has to answer about supervision: is the label attached to this generated case still the right label? Data augmentation has the same blind spot from the other side. Counterfactual augmentation and contrast sets showed that a minimal edit can flip the gold answer, and they restore validity by having a person relabel every edited example ([Kaushik et al.](https://arxiv.org/abs/1909.12434); [Gardner et al.](https://aclanthology.org/2020.findings-emnlp.117/)), which does not scale to generated variants. I add the missing axis, supervision validity, and the remaining sections build the machinery that keeps it high at scale.

The counterexample also sets how I divided responsibilities in the synthetic data architecture ([SDV constraint-augmented generation](https://docs.sdv.dev/sdv/modeling/constraint-augmented-generation-cag)):
• Copula models and conditional sampling capture cross-sectional rank and tail dependencies among continuous corporate indicators, including company size, operating history, leverage and profit margins. They preserve the dependencies that independent column generation would discard.
• [CTGAN](https://arxiv.org/abs/1907.00503) and [TabDDPM](https://proceedings.mlr.press/v202/kotelnikov23a.html) model mixed-type and multimodal empirical distributions, and explicit business-rule checks follow them.
• Deterministic variable transformations and manifold projections enforce accounting equalities, ratio bounds and chronological order.

## 2 Preserving the conditional distribution under business constraints

Rejection sampling generates unconstrained candidates and discards those that violate the constraints, and as several financial constraints tighten its computational cost becomes prohibitive. Suppose a candidate draw produces $`m`$ standardized constraint residuals that behave as independent standard normal variables, each of which has to lie within $`[-\epsilon, \epsilon]`$. The acceptance probability and the expected number of candidate draws per valid input are

$$
\alpha_m(\epsilon) = [2\Phi(\epsilon) - 1]^m \sim \left( \sqrt{\frac{2}{\pi}} \epsilon \right)^m \quad (\epsilon \to 0^+), \qquad E[N_{\text{attempts}}] = \frac{1}{\alpha_m(\epsilon)} \tag{2.1}
$$

so each additional accounting or ratio constraint multiplies the expected candidate count. With a tolerance of $`\epsilon = 0.05`$ residual standard deviations, the exact analytical values are:

**Table 1. Acceptance rate of rejection sampling under simultaneous constraints.**

| Simultaneous constraints ($`m`$) | Rejection-sampling acceptance rate $`\alpha_m(\epsilon)`$ | Expected candidate draws per valid input |
| --- | --- | --- |
| **1** | 3.9878% | 25.08 |
| **2** | 0.1590% | 628.84 |
| **4** | **0.0002529%** | **395,442.59** |

The alternative is to condition instead of reject: draw once, then correct the draw onto the constraint. In the linear Gaussian setting the covariance-weighted correction returns a sample from the exact conditional distribution. For a Gaussian copula the result holds for constraints that are affine in the latent Gaussian coordinates, since nonlinear marginal transformations do not preserve affine constraints in the observed financial variables. Let the initial unconstrained draw be $`Z \sim \mathcal{N}(\mu, \Sigma)`$, with $`\Sigma \succ 0`$. I apply a covariance-weighted Mahalanobis projection:

$$
X = \arg\min_{x : Ax = b} \frac{1}{2}(x - Z)^\top \Sigma^{-1}(x - Z) = Z + K(b - AZ), \qquad K = \Sigma A^\top (A \Sigma A^\top)^{-1} \tag{2.2}
$$

The first-order Lagrangian stationarity condition is $`\Sigma^{-1}(X - Z) + A^\top \lambda = 0`$, and substituting $`AX = b`$ and eliminating the multiplier $`\lambda`$ gives the closed-form update. Since $`AK = I_m`$, every draw satisfies $`AX = b`$ exactly. Its mean and covariance are

$$
E[X] = \mu + K(b - A\mu) \tag{2.3}
$$

$$
\mathrm{Cov}(X) = (I - KA)\Sigma(I - KA)^\top = \Sigma - \Sigma A^\top (A \Sigma A^\top)^{-1} A\Sigma \tag{2.4}
$$

Affine transformations preserve Gaussianity, so these moments identify the exact regular conditional Gaussian distribution of $`Z \mid AZ = b`$ ([Majumdar and Majumdar](https://arxiv.org/abs/1710.09285)). The update has a long lineage. It is the sampler for a normal distribution truncated on hyperplanes ([Cong, Chen and Zhou](https://doi.org/10.1214/17-BA1052)) and Matheron's rule for pathwise conditioning on a noise-free linear observation ([Wilson et al.](https://arxiv.org/abs/2011.04026)). What I did with it is put accounting identities in the place of the hyperplanes and state where exactness holds, in the latent coordinates of the copula. That also marks the division of labor with constraint layers for deep tabular generators, which enforce linear inequalities in any generator and make no statement about the law of the corrected sample ([Stoian et al.](https://arxiv.org/abs/2402.04823)). Inequalities such as ratio ranges go to transformations and layers; identities go to the projection, which returns the right distribution as well as a feasible point.

On a reference run of the constrained generator, **200,000 twelve-dimensional balance-sheet and income vectors subject to 4 simultaneous linear identities** (assets sum to total assets, liabilities sum to total liabilities, assets equal liabilities plus equity, and receivables stand at 60 days of revenue), the maximum absolute constraint residual was **$`3.0 \times 10^{-15}`$**, and the sample covariance matched the theoretical conditional covariance to **0.359%** in relative Frobenius norm. Every draw is used; the expected 395,442.59 candidate draws per valid input in Table 1 are what rejection would have spent. Fields that accounting definitions fully determine are computed analytically. Range bounds and date ordering are enforced in the latent generation space when they admit bijective transformations, such as logarithmic transforms or positive increments $`t_{k} = t_{k-1} + \exp(\xi_k)`$.

**The correction is also a monitor.** The squared Mahalanobis distance by which the projection moves a draw has a known law:

$$
T = (b - AZ)^\top (A \Sigma A^\top)^{-1} (b - AZ) \ \sim\ \chi^2_m(\delta), \qquad \delta = (b - A\mu)^\top (A \Sigma A^\top)^{-1} (b - A\mu) \tag{2.5}
$$

When the upstream generator is consistent with the identities, $`\delta = 0`$ and $`T`$ averages $`m`$. When the upstream model drifts, $`\delta`$ grows and the average of $`T`$ rises with it. Every batch therefore tests the fit of its own generator while it is being corrected. On the reference run the average of $`T`$ was 4.01 against $`m = 4`$. A 10% drift in the upstream mean of receivables raises $`\delta`$ to 0.197 and the average to 4.20, which is two standard errors in a batch of 1,000 draws and more than six in a batch of 10,000.

## 3 Using decision margins to determine when reference judgments need recomputation

A synthetic variant of a financial reference case often keeps the business narrative and changes decisive financial figures, covenant thresholds or macroeconomic inputs. If the original reference answer stays in place after those values change, systematic label errors enter post-training, even when all accounting constraints hold. [FinQA](https://aclanthology.org/2021.emnlp-main.300/) pairs financial questions with executable reasoning programs, and synthetic preference data similarly require a maintained link between inputs, reference conclusions and the expert's explanation of a preference.

Neighboring work links data generation to feedback in other ways. [WizardMath](https://arxiv.org/pdf/2308.09583v1) couples the evolution of mathematical instructions with reinforcement feedback, and [FinGPT](https://arxiv.org/pdf/2307.10485v1) fine-tunes financial language models on feedback from the market. Templated reasoning sets recompute an answer from the template's variables for every instance ([GSM-Symbolic](https://arxiv.org/abs/2410.05229)), which works when the answer is one formula and leaves evidence and preference untouched. I make the dependencies among a financial scenario, its reference conclusion, the evidence behind that conclusion and the expert preference built on it the object of design, so that a change to the scenario reaches each of them, and only the ones it has to.

Consider a decision rule that chooses between two corporate actions, and let $`d(x)`$ denote the net valuation or metric advantage of action A over action B, so that the correct reference decision is $`\mathrm{sign}\,d(x)`$. If $`d`$ is $`L`$-Lipschitz on a feasible neighborhood, a sufficient condition for retaining the original reference decision is that the perturbation $`\Delta`$ stays strictly within the decision margin:

$$
\left\vert d(x + \Delta) - d(x)\right\vert \le L\|\Delta\|, \qquad \left\vert d(x)\right\vert > L\|\Delta\| \implies \mathrm{sign}\,d(x + \Delta) = \mathrm{sign}\,d(x) \tag{3.1}
$$

This condition certifies the decision label. A loan can stay approved while the calculation behind it, the supporting evidence and the relative quality of two responses all change, so I check reference calculations, evidence and pairwise preferences separately.

My diagnostic tasks focus on contested decision boundaries where models are prone to error, which means $`\left\vert d(x)\right\vert`$ is deliberately kept small. For a linear comparison rule $`d(x) = w^\top x - c`$ with initial margin $`\gamma = d(x) > 0`$, the stale-label error rate has an exact closed form. Let the perturbation within the feasible manifold satisfy $`\Delta \sim \mathcal{N}(0, \Omega)`$, with projected variance $`s^2 = w^\top \Omega w > 0`$. The probability that the correct label flips while the original decision is retained is

$$
\Pr\{d(x + \Delta) < 0\} = \Pr\{w^\top \Delta < -\gamma\} = \Phi\left(-\frac{\gamma}{s}\right) \tag{3.2}
$$

The closed form gives the following inherited-label error rates:
• At a margin-to-noise ratio of $`\gamma / s = 2`$, the error rate is **2.28%**.
• At $`\gamma / s = 1`$, it is **15.87%**.
• Near a diagnostic decision boundary, at $`\gamma / s = 0.25`$, it is **40.13%**.

**The formula is exact for covenants.** The linear rule is the common case in finance. A covenant test is a ratio of accounting levels against a threshold, interest coverage $`E / I \ge c`$ or leverage $`D / E \le c`$, and with a positive denominator it is the half-space $`E - cI \ge 0`$ in the levels themselves. For the covenant family the flip probability $`\Phi(-\gamma / s)`$ is the exact rate under Gaussian perturbations of the levels, with $`w = (1, -c)`$. When several covenants bind at once, the case flips if any of them does, and the rate is bounded by the sum of the individual rates: two covenants at $`\gamma / s`$ of 1.5 and 2 give at most 8.96%.

**The certificate is a cache-hit test.** Treat the four objects as nodes of a dependency graph. A perturbed scenario marks its reference conclusion, evidence and preference as stale, and the margin decides which of them a builder may reuse. With a tolerated error $`\alpha`$ on inherited labels:

$$
\text{recompute the variant when } \frac{\gamma}{s} < z_{1 - \alpha}, \qquad \text{inherit otherwise, with } \Pr(\text{stale label}) \le \alpha \tag{3.3}
$$

The thresholds are 1.645 at $`\alpha = 5\%`$ and 2.326 at $`\alpha = 1\%`$, and a variant at $`\gamma / s = 3`$ inherits its label with an error of 0.13%. Variants far from the boundary cost no expert time, and the diagnostic variants near it, which are the ones the task family exists for, are always recomputed.

I therefore tie case expansion to reference-answer recomputation and renewed five-level pairwise preference grading when perturbations approach or cross a decision boundary. In that event the workflow recomputes the reference solution and samples new candidate model reasoning trajectories. Domain experts then assess the pair on the five-level preference scale and identify which trajectory recognized the decisive variable whose change reversed the decision and supported its judgment with primary evidence. [HelpSteer2-Preference](https://arxiv.org/abs/2410.01257) gives a comparison point from the methods literature.

**What a graded preference is worth.** A five-level judgment takes an expert a few seconds longer than a binary one, on a task that has already cost about three specialist-hours. Model the judgment as an ordered response to the latent quality gap $`g`$ between two responses, measured in units of judgment noise, with cutpoints $`c_1 < \dots < c_4`$, $`c_0 = -\infty`$ and $`c_5 = +\infty`$. The Fisher information one response carries about the gap is

$$
I(g) = \sum_{k} \frac{\big( \partial_g\, p_k(g) \big)^2}{p_k(g)}, \qquad p_k(g) = \Phi(c_k - g) - \Phi(c_{k-1} - g) \tag{3.4}
$$

**Table 2. Fisher information of a binary and a five-level judgment by quality gap.**

| Quality gap $`g`$ | Binary judgment | Five-level judgment (cutpoints at $`\pm 0.5`$, $`\pm 1.5`$) | Ratio |
| --- | --- | --- | --- |
| 0 (a tie) | 0.637 | 0.912 | 1.43 |
| 0.5 | 0.581 | 0.902 | 1.55 |
| 1.0 | 0.439 | 0.863 | 1.97 |

One graded judgment is worth 1.4 to 2 binary judgments, and the advantage grows with the gap, where a binary label saturates. The same expression designs the scale: at a tie the information is largest with cutpoints at $`\pm 0.38`$ and $`\pm 1.24`$, where it reaches 0.920 of the information in a continuous response. The protocol delivers three signals that a training pipeline can consume separately: the direction of the preference, its strength, and the cited evidence and decisive variable.

## 4 Specifying the information available to each temporal task

A cross-sectional company comparison does not require continuous-time stochastic processes. Dynamic tasks such as derivatives valuation, interest-rate term-structure interpolation and liquidity stress tests over multiple periods do require path generators. For those I use SDEs and neural SDEs to model path distributions beyond single-time marginals ([Neural SDEs as Infinite-Dimensional GANs](https://proceedings.mlr.press/v139/kidger21b.html)). Brownian bridges and stochastic interpolation support conditioning on known intermediate observations or endpoints, following the constructions in [Glasserman, *Monte Carlo Methods in Financial Engineering*, Chapter 3](https://doi.org/10.1007/978-0-387-21617-1). A bridge is the conditioning of Section 2 in one dimension: draw the free path, then correct it onto the known endpoint.

That conditioning can introduce temporal leakage into evaluation, and I derive the size of the effect in closed form. Consider scaled Brownian motion $`X_u = \sigma W_u`$, where $`s < t < T`$. Under squared-error loss, the optimal predictor at time $`s`$, given only the historical filtration $`\mathcal{F}_s`$, has conditional mean squared error $`\sigma^2(t - s)`$. If the generator conditions paths on the future endpoint $`X_T`$ and inadvertently exposes that conditioning to a forecasting task, Gaussian conditioning gives ([Pitman on the Brownian bridge](https://www.stat.berkeley.edu/~pitman/s205s03/b_bridge.pdf)):

$$
\mathrm{Var}(X_t \mid \mathcal{F}_s) = \sigma^2(t - s) \tag{4.1}
$$

$$
\mathrm{Var}(X_t \mid \mathcal{F}_s, X_T) = \sigma^2(t - s) - \frac{[\sigma^2(t - s)]^2}{\sigma^2(T - s)} = \sigma^2(t - s)\frac{T - t}{T - s} \tag{4.2}
$$

At the midpoint $`t = (s + T)/2`$, conditioning on $`X_T`$ halves the conditional variance. The resulting **29.29% apparent reduction in RMSE** ($`1 - 1/\sqrt{2}`$) comes entirely from the additional endpoint information in this construction, and whether that counts as a flaw depends on the task. It is temporal leakage if the forecasting task does not permit access to that information. If instead the task gives the model both endpoints $`X_s`$ and $`X_T`$ and asks it to audit an interpolation or backcast an intervening accounting period, Brownian bridge conditioning is consistent with the specified information set.

Interest rates and spreads revert to a mean, and for them the leak has its own closed form. For an Ornstein-Uhlenbeck path with mean-reversion speed $`\kappa`$, at the midpoint of an interval of half-length $`h`$:

$$
\frac{\mathrm{Var}(X_t \mid \mathcal{F}_s, X_T)}{\mathrm{Var}(X_t \mid \mathcal{F}_s)} = \frac{1}{1 + e^{-2\kappa h}}, \qquad \text{apparent RMSE reduction} = 1 - \big( 1 + e^{-2\kappa h} \big)^{-1/2} \tag{4.3}
$$

**Table 3. Apparent RMSE reduction from endpoint leakage under mean reversion.**

| $`\kappa h`$ | 0 (Brownian) | 0.25 | 0.5 | 1 | 2 |
| --- | --- | --- | --- | --- | --- |
| Apparent RMSE reduction | 29.29% | 21.10% | 14.50% | 6.15% | 0.90% |

Mean reversion discounts the leak, because the endpoint tells less about the middle of a path that forgets. The financial reading is direct: endpoint leakage is most damaging for series close to a unit root, prices and long rates, and nearly harmless for fast-reverting spreads. The information-set rule is therefore enforced with a severity that follows the persistence of the series.

The task specification keeps three information sets apart:
1. **Construction information ($`\mathcal{F}_{\text{gen}}`$):** the complete path, endpoint or latent parameters used to generate a scenario.
2. **Permitted predictor filtration ($`\mathcal{F}_s`$):** the historical information the task allows the model to observe at decision time $`s`$.
3. **Evaluation and oracle information ($`\mathcal{F}_{\text{eval}}`$):** outcomes realized after $`s`$, reserved for scoring or for explicitly disclosed oracle baselines.

## 5 Batch Zero: independent execution and calibration for post-training data strategy

I created **Batch Zero** around the capability objectives and data requirements of post-training research teams. Before anything scales, it brings task design, synthetic data strategy and preference supervision under a common set of acceptance criteria. It tests whether domain experts can independently execute a research specification, reproduce reference solutions and calibrate their preference judgments. The resulting specifications support subsequent data construction.
• **Independent execution:** before a task family enters large-scale data construction (*Batch One*), doctoral-level domain experts independently write seed cases, generate synthetic variants, verify reference solutions and assign five-level pairwise preference scores. Implicit assumptions, missing information and ambiguities in the specification come to light this way.
• **Calibration and feedback to data strategy:** failures, expert disagreements and boundary-case errors inform revisions to task instructions, reference solutions, grading rules and Batch One data acceptance criteria. Task design, execution, revision and recalibration form an iterative process.
• **Organizational adoption:** the partner foundation model company subsequently adopted **Batch Zero** across other post-training programs.

**Why the check belongs at the seed.** Expert-written references are less reliable than their reputation. When FinanceReasoning re-examined four public financial reasoning sets, it updated 15.6% of their questions, between 9.72% and 30.00% per set ([Tang et al.](https://arxiv.org/abs/2506.05828)). A synthetic pipeline multiplies whatever error its seeds carry. If a seed's reference solution is wrong with probability $`\varepsilon`$ and the seed yields $`k`$ variants, a family carries $`k\varepsilon`$ wrong records in expectation, and they are wrong together. If an independent re-solve catches a wrong reference with probability $`d`$, then $`r`$ re-solves leave

$$
k\, \varepsilon\, (1 - d)^r \tag{5.1}
$$

wrong records per family. With $`k = 20`$, $`\varepsilon = 0.15`$ and $`d = 0.8`$, that is 3.0 with no re-solve, 0.6 after one and 0.12 after two. One re-solve at the seed does the work of reviewing twenty variants, and that multiplier is what Batch Zero is built on.

For statistical analysis and evaluation, I treat the task family as the basic unit of effective coverage and uncertainty estimation. Suppose $`G`$ independent reference-case families each yield $`k`$ synthetic variants, giving $`Gk`$ nominal records, and any two variants within a family have correlation $`\rho`$ and common variance $`\sigma_Y^2`$. The sample mean then carries the Kish design effect $`1 + (k - 1)\rho`$, which gives the effective sample size $`N_{\text{eff}}`$:

$$
\mathrm{Var}(\bar{Y}) = \frac{Gk\sigma_Y^2 + Gk(k - 1)\rho\sigma_Y^2}{(Gk)^2} = \frac{\sigma_Y^2}{Gk}[1 + (k - 1)\rho] \implies N_{\text{eff}} = \frac{Gk}{1 + (k - 1)\rho} \tag{5.2}
$$

With $`G = 100`$ independent families, $`k = 20`$ variants per family (2,000 nominal tasks) and within-family correlation $`\rho = 0.5`$, the 2,000 records provide the same precision for estimating the mean as about 190 independent records. Ignoring this correlation understates standard errors by a factor of **$`3.24\times`$**. My data workflow therefore separates training and evaluation sets at the task-family level, and all confidence intervals account for hierarchical clustering at both the family and expert levels.

**How many variants a seed should yield.** The design effect is a diagnosis; the same algebra gives the prescription. A new family costs $`c_G`$, mostly expert time on the seed and its reference, and each further variant costs $`c_v`$. At a fixed budget the variance of the family-clustered mean is proportional to $`(c_G + k c_v)[1 + (k - 1)\rho] / k`$, and it is smallest at the optimum cluster size of two-stage sampling:

$$
k^* = \sqrt{\frac{c_G}{c_v} \cdot \frac{1 - \rho}{\rho}} \tag{5.3}
$$

With a seed that costs twenty variants and $`\rho = 0.5`$, $`k^* \approx 4.5`$, and the budget that buys 20 variants per family has 40% more variance than the same budget at four or five. Read the other way, moving from 20 variants per family to the optimum cuts the variance by 29% at no cost. Variants beyond $`k^*`$ buy repeated information, and the money is better spent on new families.

## 6 Staged evaluation design and coverage efficiency

Staged, blinded comparisons across independent task families test whether constraint-preserving synthesis and preference supervision meet the data requirements of post-training research teams. The task mix, generator training budget, expert review budget and final acceptance criteria stay fixed as each method is introduced:

**Table 4. The staged evaluation design.**

| Comparison stage | Method introduced | What the stage measures |
| --- | --- | --- |
| **Current data construction baseline** | Unconstrained generation plus expert review and rework | Fully loaded cost of each valid case that is ultimately accepted |
| **Add manifold-constrained generation** | Hold the generator fixed; apply affine projections and variable transformations | Change in invalid candidates and manual repairs, with the conditional distribution preserved |
| **Add decision-margin checks and reference-answer recomputation** | Recompute reference judgments below the margin threshold; use $`\gamma/s`$ to quantify Gaussian label-flip risk | Change in stale-label errors, with valid supervision on both sides of the decision boundary |
| **Apply Batch Zero acceptance criteria and filtration rules** | Jointly check the temporal information boundaries in $`\mathcal{F}_s`$, independent execution, reproducibility of reference solutions and calibration of preference standards | Post-training gains that persist once leakage is excluded and clustering by source task family is accounted for |

Raw acceptance rates favor trivial variants of easy templates, and generation speed alone omits the cost of expert repairs, so I allocate data construction and review resources by scenario-weighted task-family coverage efficiency. Let $`j`$ index predefined cells in the financial capability matrix, with strategic weights $`w_j \ge 0`$ ($`\sum_j w_j = 1`$) and required counts of independent valid task families $`n_j^* > 0`$:

$$
\mathrm{Coverage} = \sum_j w_j \min\left(1, \frac{n_j^{\text{valid}}}{n_j^*}\right), \qquad \mathrm{Efficiency} = \frac{\mathrm{Coverage}}{C_{\text{generation}} + C_{\text{review}} + C_{\text{rework}} + C_{\text{adjudication}}} \tag{6.1}
$$

Once a cell reaches its target of $`n_j^*`$ independent task families, further variants of simple templates add no coverage. Coverage is concave and piecewise linear in the family counts, so the allocation that maximizes it per unit cost fills cells in decreasing order of $`w_j / (n_j^* c_j)`$, with $`c_j`$ the cost of one valid family in cell $`j`$. Four controls enter the efficiency: manifold constraint enforcement, decision-margin label recomputation, separation of temporal information sets and Batch Zero calibration.

The team averaged roughly 500 completed financial tasks a week under these rules, and the partner company carried Batch Zero into its other post-training programs.

# Project 03: general-reasoning-evaluation-and-layered-verification

**Article Title**
General Reasoning Evaluation and Layered Verification

**Organization**
Duke University × Frontier AI Research Laboratory

**Title**
General Reasoning Evaluation and Layered Verification

**URL**
https://www.theodoreoy.com/experience/general-reasoning-evaluation-and-layered-verification/

**Position**
Researcher

**Location**
Durham, North Carolina; Palo Alto, California

**Dates**
September 2023 – September 2026

**Read More Label**
Read More


## Summary

A model can reach the right answer through an unsupported step, and a grader that matches a reference solution will reject a correct proof that takes another route. I designed an acceptance rule that resolves both: a conclusion stands when its assumptions, derivations, and execution evidence support it, whichever valid route was taken, and a failed step removes support from everything downstream. Checkable obligations are discharged by certificates that need no reference solution, LLM-assisted screening flags possible gaps, and specialists adjudicate what remains. I also derived what a grader must achieve before its verdicts can be used. A policy trained against a grader converges to that grader's positive predictive value, which on a test set of 3,600 submissions with known verdicts is 40% for final-answer matching and 100% for certificate checking.

## Problem and Approach

The question I took up in late 2023 was what should entitle a model's reasoning to be accepted. A correct answer can coexist with unsupported assumptions, misapplied rules or tool use that violates the task specification, and a fixed reference path will reject sound work that takes another route. I designed an acceptance rule around proof obligations: a conclusion stands when its assumptions, derivations and execution evidence support it, whichever valid route the model took, and a failed obligation removes support from everything that depends on it. Programmatic certificates discharge checkable obligations, LLM-assisted screening identifies possible gaps, and specialist scholars adjudicate disputed semantic questions.

Two things follow from defining acceptance this way. A certificate bounds how far a submission is from the truth using only a residual the submission exposes and a constant the task designer has verified, so the check never consults a reference solution and inherits none of its errors. And once a grader's two error rates are named, they can be priced: I derived the false-acceptance rate below which a leaderboard lead is certified, the level of true validity a policy can reach when the grader is its reward, and the screening sensitivity at which an LLM judge may decide instead of screen. I kept refining the design through September 2026. Sections 1 through 7 set out the acceptance criteria, the certificates, the thresholds, the measurements and the related literature.

The team produced roughly 500 scientific reasoning tasks a week. Each task included a detailed, step-by-step reference solution and repeated verification of the argument.

## Key Contributions

* **I developed a proof-obligation framework that defines when a model's reasoning should be accepted.** Starting in late 2023, I organized deliverables into dependency graphs ($`\Gamma_q \vdash C_q`$) that link each conclusion to its domain assumptions, method applicability, evidentiary support, compliant execution, uniform approximation bounds and claimed strength. Valid alternative derivations pass on the same terms as the reference route. When a step fails, the graph locates the first unsupported step and what it affects downstream. For tasks that admit formalization, checking local nodes and their dependencies within a sound inference system establishes the full conclusion.
* **I developed checkable error certificates and bounds on solution quality for programmatically verifiable task families.** The projected-residual optimality bound ($`0 \le f(x) - v^* \le \|P_{\ker A} r\|_2^2 / (2\mu)`$) splits feasibility, stationarity and the accuracy of a conclusion into separate verification obligations, and different proofs can pass by satisfying the same ones. The same template, a residual the submission exposes, a constant the designer verifies and an inequality between them, covers convex programs, linear systems, eigenpairs and fixed points. None of these checks needs a reference solution.
* **I established complementary forms of verification across mathematical certificates, code and rule checks, LLM-assisted screening and specialist adjudication, and later programs reused the layered design.** Code checks directly verifiable answers, required deliverables, tool permissions and other requirements specified in advance. LLM-as-a-Judge helps flag missing evidence, misapplied rules and gaps in reasoning, and disputed domain judgments go to scholars with relevant expertise. I derived when a screen may decide: at screening sensitivity $`\text{se}`$, a share $`1 - \alpha^*/(1 - \text{se})`$ of unflagged work still has to reach specialists to hold the system's false acceptance at $`\alpha^*`$.
* **I evaluated answers, visible reasoning and execution evidence together.** I cross-checked the model's displayed CoT against its actual tool calls, return values and intermediate outputs to test whether what it claimed had observable support. From elapsed time, attempt counts and changes in intermediate results I identified repeated operations, continued use of failed assumptions and attempts that added no evidence. I recorded correctness, compliance and efficiency as separate results, and a resource limit counted toward acceptance only when the task specification set it beforehand.
* **I derived how false acceptance ($`\alpha`$) and false rejection ($`\beta`$) reverse model rankings, and the condition under which a ranking is certified.** In the worked example, models with true validity rates of 72% and 64% score 73.12% and 76.96%, so the weaker one ranks first. A lead of $`g`$ over a rival scoring $`s_B`$ certifies the order of true validity exactly when the grader's false-acceptance rate is below $`g / (1 - s_B)`$.
* **I showed that a policy optimized against a grader converges to the grader's positive predictive value.** The observed score goes to 100% while true validity stops at $`\theta(1-\beta) / [\theta(1-\beta) + (1-\theta)\alpha]`$. False acceptance sets the ceiling, and false rejection removes valid routes from what the policy produces. The same analysis gives the bias in the binary cross-entropy gradient used to train process reward models ($`E[\nabla_s \ell(s,V) - \nabla_s \ell(s,Z) \mid h] = p(h) - \tilde{p}(h)`$).
* **I gave the tolerance-propagation rule ($`a\delta + 2\varepsilon`$) for bijective task transformations and its composition law for chains of transformations.** Together they say when a transformed task still supports a valid comparison and what tolerance its solutions are owed.
* **On a test set of 3,600 exact-arithmetic submissions from 600 strongly convex quadratic task families, every verdict known, final-answer matching accepted 75.0% of the invalid submissions and strict reference-path matching rejected 50.0% of the valid proofs.** Certificate checking accepted all 1,200 valid proofs and rejected all 2,400 invalid submissions, so strict error detection and acceptance of valid alternative routes held together on the same set.

## Manuscript

## 1 Correct answers can conceal invalid reasoning and reverse model rankings

Checking the final answer is enough only when the answer is the entire deliverable. In the samples analyzed for *ProcessBench*, the share of solutions with correct final answers that still contain a process error rises with difficulty: 3.5% on GSM8K, 18.8% on MATH, 32.2% on OlympiadBench and 51.8% on Omni-MATH (*[ProcessBench, Section 3.3](https://arxiv.org/html/2412.06559v2)*). Answer accuracy and the validity of a reasoning trace are distinct evaluation targets, and they come apart fastest on the problems that matter most. For a task that also requires a derivation or a specified execution process, I examine domain assumptions, method applicability, supporting evidence, tool compliance, intermediate results and the conclusion. I treat the model's displayed CoT and visible reasoning as observable outputs and cross-check them against execution records.

To see what this does to a score, suppose problems and model trajectories are drawn from a target capability distribution. Let $`Z = 1`$ indicate that the complete solution, including its reasoning steps and tool execution, is valid, and let $`V = 1`$ indicate that the evaluation protocol accepts it. For model $`m`$, define its true validity rate as $`\theta_m = \Pr_m(Z = 1)`$, its false acceptance rate as $`\alpha_m = \Pr_m(V = 1 \mid Z = 0)`$, and its false rejection rate as $`\beta_m = \Pr_m(V = 0 \mid Z = 1)`$. False acceptance can let through an unsupported derivation, or a tool call that produces the correct answer while violating a predefined execution requirement; false rejection can exclude a valid alternative derivation. By the law of total probability:

$$
s_m = E_m[V] = \alpha_m + (1 - \alpha_m - \beta_m)\theta_m, \qquad s_m - \theta_m = \alpha_m(1 - \theta_m) - \beta_m\theta_m \tag{1.1}
$$

The term $`\alpha_m(1 - \theta_m)`$ credits invalid trajectories, while $`-\beta_m\theta_m`$ penalizes valid ones. Adding problems reduces the sampling variance of $`\hat{s}_m`$ and leaves the structural gap $`s_m - \theta_m`$ in place. Models also differ in how closely they adhere to evidence requirements, verification steps and tool permissions, and the resulting differences in $`\alpha_m`$ and $`\beta_m`$ can reverse their ranking. Suppose Models A and B have true validity rates of $`\theta_A = 72\%`$ and $`\theta_B = 64\%`$. If invalid trajectories pass the final-answer check with probabilities $`\alpha_A = 4\%`$ and $`\alpha_B = 36\%`$, with $`\beta_A = \beta_B = 0\%`$, their observed scores are $`s_A = 73.12\%`$ and $`s_B = 76.96\%`$, and the model with the lower rate of fully valid solutions ranks higher. Any $`\alpha_B`$ above 25.3% reverses this pair.

Public leaderboards have shown the effect at scale. When EvalPlus extended HumanEval's tests 80-fold, pass@k fell by up to 19.3% to 28.9%, models changed places, and 18 of the original reference solutions, 11% of the problems, were found defective ([EvalPlus](https://arxiv.org/abs/2305.01210)).

**When a lead is certified.** Equation (1.1) can be read in the other direction. If a grader's false acceptance is known to be at most $`\bar{\alpha}`$ and its false rejection at most $`\bar{\beta}`$, a score pins true validity to an interval, and with $`\bar{\beta} = 0`$ a lead of $`g = s_A - s_B`$ certifies the order of true validity under one condition:

$$
\frac{s - \bar{\alpha}}{1 - \bar{\alpha}} \le \theta \le \frac{s}{1 - \bar{\beta}}, \qquad \theta_A > \theta_B \ \text{ for every admissible grader} \iff \bar{\alpha} < \frac{g}{1 - s_B} \tag{1.2}
$$

The condition is tight: at any larger $`\bar{\alpha}`$ there are error rates within the bound that reverse the order. A lead of three points over a rival scoring 80% is certified only when the grader's false acceptance is below 15%; over a rival scoring 50%, below 6%. The harder the evaluation, the better the grader has to be before a small lead means anything. This turns the reversal above from a warning into a test that can be applied to any published ranking whose grader has a measured error rate.

Process supervision extends evaluation to intermediate steps (*[Let's Verify Step by Step, Sections 2 and 3](https://arxiv.org/html/2305.20050v1)*). When I apply it to general post-training evaluation, I account for omissions in reference solutions, accept valid alternative methods, and enforce evidence and execution requirements defined before responses are generated. Structural simplification can explain a method or reveal redundant work. A slower solution, or one that takes more attempts, is still a correct solution, and a resource-related rejection requires a hard limit specified in advance.

## 2 Proof obligations organize layered review and allow alternative solutions

A task specification defines the domain assumptions and execution constraints $`\Gamma_q`$, the target conclusion $`C_q`$, and the proof obligations needed to establish it. A model trajectory $`\tau`$, which here means its visible reasoning and observable execution records, may get there through different intermediate lemmas, representations or orders of deduction. That is allowed, because review concerns the submitted material and whether it fulfills the task's obligations. A directed acyclic dependency graph (DAG) $`G`$ organizes the local soundness check for each node $`v_j`$, together with a global tool-compliance predicate $`\mathcal{T}_{\text{comp}}(\tau) \in \{0, 1\}`$:

$$
\Gamma_q \cup \{v_k : k \in \mathrm{pa}(j)\} \vdash v_j, \qquad \Gamma_q \cup \{v_j : j \in \mathrm{sink}(G)\} \vdash C_q, \qquad \mathcal{T}_{\text{comp}}(\tau) = 1 \tag{2.1}
$$

The symbol $`\vdash`$ denotes valid derivability within a sound domain inference system, and the condition $`\mathcal{T}_{\text{comp}}(\tau) = 1`$ certifies that each external tool invocation $`t \in \tau`$ belongs to the task's permitted execution environment $`\mathcal{A}_q`$. If root nodes follow from verified assumptions $`\Gamma_q`$, every dependency is sound, with its local derivation verified in that system, and $`\mathcal{T}_{\text{comp}}(\tau) = 1`$, structural induction over a topological ordering of $`G`$ establishes the full conclusion.

This is the discipline of certifying algorithms carried over to model output. The producer may be arbitrarily complex and is not trusted; it has to hand over a witness, and the checker of that witness is simple enough to be trusted ([McConnell et al.](https://doi.org/10.1016/j.cosrev.2010.09.009)). A model is the least trusted producer there is, which makes the checker the place to spend rigor.

In production, I divided verification into three layers:
1. Code and rule checks cover the directly verifiable parts of an answer, required deliverables, and predefined restrictions on tools, execution environments and resources. Tool compliance requires $`\mathcal{T}_{\text{comp}}(\tau) = 1`$, and a call that violates an explicit hard requirement causes rejection ($`V = 0`$) even when the final answer is correct.
2. LLM-as-a-Judge assists with semantic screening. It flags insufficient evidence, misapplied rules, conclusions that exceed their premises and gaps in reasoning, and it links each concern to the relevant trace, tool response or intermediate output. The flags direct further review.
3. Scholars with relevant expertise take the questions that require domain judgment, admit several reasonable interpretations, or remain disputed after the first two checks. They examine the evidence, the applicability of the method and the conclusion, and a question that cannot be resolved from the available evidence stays open.

All three layers work from the same observable material. I cross-check the model's displayed CoT and visible reasoning against actual tool calls, intermediate outputs, elapsed time and attempt counts. For each attempt I look for new evidence, revised premises or a change in the state of the solution. That is how I identify repeated calls, continued use of failed assumptions and loops that make no progress. A conclusion whose execution records are missing is recorded as unverified. I record efficiency separately from correctness and compliance: long runtimes, repeated attempts or exhaustive methods are analyzed as efficiency, and they affect acceptance only when they violate a predefined hard limit.

Method applicability has its own check, because pointwise convergence at a fixed parameter value does not establish that an approximation remains valid within an optimization, an integral or an exchange of limits. A claim about the order of accuracy requires an approximation parameter, its domain of validity and a uniform error bound. Where such an issue cannot be decided programmatically, an LLM helps locate the concern and a specialist scholar reviews the assumptions and derivation. Specialist review settles the question with the standing of expert judgment; a certificate settles it by computation.

For feedback, I record the first failed obligation at node $`v_j`$ and mark its descendant subgraph $`\mathrm{desc}(v_j)`$ as unverified, since locally correct calculations under a false premise do not repair the full derivation. This treatment resolves the ambiguity after an error discussed in *[ProcessBench, Section 3.1](https://arxiv.org/html/2412.06559v2)*. A suspected error awaiting specialist review remains unresolved until that review is complete.

**When a screen may decide.** The division between the second and third layers has a quantitative form. Let $`\text{se}`$ be the screen's sensitivity on semantic obligations, the share of invalid steps it flags. Flagged work goes to specialists, and unflagged work goes to specialists with probability $`\rho`$. With the specialists' verdict as the reference, the system's false acceptance on those obligations, and the random escalation needed to hold it at a target $`\alpha^*`$, are:

$$
\alpha_{\text{sys}} = (1 - \text{se})(1 - \rho), \qquad \rho \ge 1 - \frac{\alpha^*}{1 - \text{se}} \tag{2.2}
$$

The best model tested by [Tyen et al.](https://arxiv.org/abs/2311.08516) located the first mistake in 52.87% of reasoning traces. At a sensitivity of that order and a target of $`\alpha^* = 5\%`$, 89% of unflagged work still has to reach a specialist, and the screen saves almost no expert time. At $`\text{se} = 0.80`$ the share is 75%, at $`0.90`$ it is 50%, and only at $`\text{se} \ge 0.95`$ can unflagged work pass without review. That is the rule behind the layer boundary: an LLM judge screens until its measured sensitivity clears $`1 - \alpha^*`$, and decides after. The randomly escalated share is also the calibration sample, because a screen whose unflagged output is never reviewed has no measured sensitivity at all. A checker earns decisive standing by a clean run: 59 known-invalid items rejected without exception bound its false acceptance at 5% with 95% confidence, and 299 bound it at 1%.

Related work approaches these questions from several directions. [ToolEval](https://arxiv.org/html/2307.16789v1) scores tool-using agents by pass rate and win rate, both assigned by an LLM evaluator, so its verdicts carry the standing of a screen. [Let's Verify Step by Step](https://arxiv.org/html/2305.20050v1) collected step-level human labels and withheld reference solutions so that labelers would not favor one route. [Math-Shepherd](https://arxiv.org/html/2312.08935v1) estimates the quality of a step from whether sampled continuations reach the correct answer, which scores a step by its outcome; the certificates of Section 3 check the mathematical validity of the evidence a submission actually presents. [ProcessBench](https://arxiv.org/html/2412.06559v2) has since measured how often correct answers conceal process errors on hard problems. My contribution is the organization of acceptance itself, through explicit proof obligations, a dependency structure over them and conditions that can be checked.

## 3 Error certificates that need no reference solution

A posteriori verification rests on one observation: to bound how far a candidate is from the truth, it is enough to have a residual the candidate exposes and a stability constant of the problem. The true solution never enters. I develop the template in full on an optimization family whose constraints and certificates can be checked explicitly, and then state it for the other task types it covers.

Consider the equality-constrained quadratic problem:

$$
v^* = \min_{Ax = b} f(x), \qquad f(x) = \frac{1}{2}x^\top H x + c^\top x, \qquad Z^\top H Z \succeq \mu I, \quad \mu > 0 \tag{3.1}
$$

Here $`H`$ is symmetric, $`Ax = b`$ is feasible, the columns of $`Z`$ form an orthonormal basis of $`\ker A`$, and $`\mu`$ is a verified lower bound on curvature along feasible directions. The objective has to be strongly convex only on the feasible manifold; $`H`$ may be indefinite across the constraints. For any feasible candidate $`x`$ satisfying $`Ax = b`$, choose any dual multiplier vector $`\nu`$ and define the stationarity residual $`r = Hx + c + A^\top \nu`$. Curvature gives the first inequality below for every feasible displacement $`d \in \ker A`$, and completing the square in $`d`$ gives an exact optimality error certificate:

$$
f(x + d) \ge f(x) + r^\top d + \frac{\mu}{2}\|d\|^2 \tag{3.2}
$$

$$
\inf_{d \in \ker A} \left( r^\top d + \frac{\mu}{2}\|d\|^2 \right) = -\frac{\|P_{\ker A} r\|_2^2}{2\mu} \tag{3.3}
$$

$$
0 \le f(x) - v^* \le \frac{\|P_{\ker A} r\|_2^2}{2\mu} \tag{3.4}
$$

The operator $`P_{\ker A}`$ is the orthogonal projection onto the space of feasible directions $`\ker A`$. It removes residual components normal to the constraints, which do not affect optimality along the feasible manifold (*[Boyd and Vandenberghe, Convex Optimization, Sections 5.5 and 9.1](https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf)*). A zero projected residual, $`P_{\ker A} r = 0`$, certifies exact optimality, and otherwise the certificate bounds the suboptimality gap in objective units. Two kinds of submission fare differently under this check:
• Solutions derived through Lagrange multipliers or by eliminating the equality constraints satisfy the same semantic obligations and pass verification.
• Reporting the correct optimal value $`v^*`$ alone leaves the obligations undischarged. Feasibility and the claimed objective value are checked separately. A submission that claims a KKT multiplier witness must also have its full stationarity equation $`Hx+c+A^\top\nu=0`$ verified, because the projected-residual bound cannot validate that multiplier: $`P_{\ker A}A^\top\nu=0`$ for every $`\nu`$. A valid equality-elimination proof need not supply a multiplier witness. Whether a checker validates the whole of a claimed witness is what the formal verification of certifying computations examines ([Alkassar et al.](https://arxiv.org/abs/1301.7462)), and Section 6 tests for it directly.

The same three parts, a residual, a verified constant and an inequality between them, give a certificate for each of the following task types.

**Table 1. Error certificates by task type.**

| Task type | Residual the submission exposes | Constant the task designer verifies | Certificate |
| --- | --- | --- | --- |
| Equality-constrained quadratic program (above) | $`P_{\ker A} r`$ | $`\mu = \lambda_{\min}(Z^\top H Z)`$ | $`f(x) - v^* \le \lVert P_{\ker A} r\rVert _2^2 / (2\mu)`$ |
| Convex program | A primal-feasible $`x`$ and a dual-feasible $`(\lambda, \nu)`$ | None | $`f(x) - v^* \le f(x) - g(\lambda, \nu)`$ |
| Linear system $`Ax = b`$ | $`b - Ax`$ | A lower bound on $`\sigma_{\min}(A)`$ | $`\lVert x - x^*\rVert _2 \le \lVert b - Ax\rVert _2 / \sigma_{\min}(A)`$ |
| Eigenpair of a symmetric matrix | $`A\hat{v} - \hat{\lambda}\hat{v}`$ | None | $`\min_i \left\lvert \lambda_i - \hat{\lambda}\right\rvert  \le \lVert A\hat{v} - \hat{\lambda}\hat{v}\rVert _2 / \lVert \hat{v}\rVert _2`$ |
| Fixed point of a contraction $`g`$ | $`g(x) - x`$ | A Lipschitz constant $`L < 1`$ | $`\lVert x - x^*\rVert  \le \lVert g(x) - x\rVert  / (1 - L)`$ |

Each row is a standard result of its field. What I take from them is the organization: every obligation type is paired with a certificate and a checker whose cost is a few matrix products, and acceptance becomes a computation on the submission alone. That removes the reference solution from the trusted base. Reference solutions are a source of grading error in their own right, as the 18 defective references found by [EvalPlus](https://arxiv.org/abs/2305.01210) show, and a grader that matches against them inherits every one.

I carry the lessons from this family over to the structure of general review: check the inputs and assumptions, compliance with the execution specification, support for the derivation, and whether the conclusion exceeds the evidence. Obligations that admit programmatic checks go to rules or certificate verifiers, and other semantic questions go through LLM-assisted screening and specialist review. Structural simplification may explain why a method needs less repeated work, and efficiency gains and validity certificates are evaluated separately.

## 4 Task transformations must propagate error bounds

Symbolic templates parameterize variable domains and answer formulas (*[GSM-Symbolic, Section 3.1](https://arxiv.org/html/2410.05229v1)*). Tasks with formalizable transformations also need verifiable rules for how those transformations affect feasible sets, objective values and acceptance tolerances. For bijective task transformations the tolerance-propagation rule below follows.

Let an original problem and its transformed variant have feasible sets $`F`$ and $`F'`$, objectives $`J`$ and $`J'`$, and finite infima $`v`$ and $`v'`$. Suppose the task designer verifies a bijection $`\Phi : F \to F'`$ such that every feasible $`u \in F`$ satisfies the uniform bound:

$$
\left\vert J'(\Phi(u)) - aJ(u) - b\right\vert \le \varepsilon, \quad a > 0 \tag{4.1}
$$

$$
av + b - \varepsilon \le v' \le av + b + \varepsilon \tag{4.2}
$$

$$
J(u) - v \le \delta \implies J'(\Phi(u)) - v' \le a\delta + 2\varepsilon \tag{4.3}
$$

Taking infima in (4.1) gives (4.2), and subtracting the lower bound on $`v'`$ from the upper bound on $`J'(\Phi(u))`$ gives (4.3). So after a unit conversion, parameter rescaling or numerical transformation with error bounded by $`\varepsilon`$, the result determines the acceptance tolerance for a previously $`\delta`$-optimal solution. Keeping the original tolerance $`\delta`$ can misclassify a valid transformed solution as a model failure, while relaxing it arbitrarily can conceal a real capability gap. When $`\varepsilon = 0`$, the bijection and positive scaling $`a > 0`$ also preserve whether an optimum is attained. Changes to boundary compactness or admissible control classes require a new attainment proof.

Variants are usually built by several transformations in a row. Applying the bound step by step to a chain with parameters $`(a_1, \varepsilon_1), \dots, (a_k, \varepsilon_k)`$ gives the composition law:

$$
a = \prod_{j=1}^{k} a_j, \qquad \varepsilon = \sum_{j=1}^{k} \Big( \prod_{l > j} a_l \Big) \varepsilon_j, \qquad J(u) - v \le \delta \implies J^{(k)} - v^{(k)} \le a\delta + 2\varepsilon \tag{4.4}
$$

Each error is magnified by every scaling applied after it, so the order of a chain is part of its specification. Take an exact unit conversion with $`a = 100`$, an exact rescaling with $`a = 0.5`$, and a numerical discretization with $`\varepsilon = 0.003`$, applied to a solution that is $`\delta = 0.01`$ optimal. With the discretization last, the chain has $`(a, \varepsilon) = (50, 0.003)`$ and the tolerance owed is $`0.506`$. With the discretization first, it has $`(50, 0.15)`$ and the tolerance is $`0.8`$. A grader that reuses the first tolerance for the second chain rejects valid work.

## 5 Grading errors change the post-training objective

Step-level labels can improve post-training only if they measure logical validity and compliance, because systematic grading errors pass into the targets used by process reward models (PRMs) and RLHF policies. Let $`h`$ denote the task input and the model's visible reasoning prefix through the current step. Let $`Z = 1`$ indicate that the step is valid under the problem's assumptions, and let $`V \in \{0, 1\}`$ be the grader's noisy acceptance label, with conditional false acceptance $`\alpha(h)`$ and false rejection $`\beta(h)`$. Writing $`p(h) = \Pr(Z = 1 \mid h)`$, a process evaluator with logit $`s`$ trained by binary cross-entropy is optimized toward the corrupted conditional target:

$$
\tilde{p}(h) = \alpha(h) + [1 - \alpha(h) - \beta(h)]p(h) \tag{5.1}
$$

$$
\frac{\partial \ell(s, V)}{\partial s} = \sigma(s) - V \tag{5.2}
$$

$$
E[\nabla_s \ell(s, V) - \nabla_s \ell(s, Z) \mid h] = p(h) - \tilde{p}(h) \tag{5.3}
$$

The expected gradient difference shows which way grading bias moves the training target:
• If false rejection dominates, $`\beta(h)p(h) > \alpha(h)[1-p(h)]`$, then $`\tilde{p}(h) < p(h)`$. The learned validity target shifts downward, which penalizes valid alternative proofs.
• If false acceptance dominates, $`\alpha(h)[1-p(h)] > \beta(h)p(h)`$, then $`\tilde{p}(h) > p(h)`$. The target shifts upward, rewarding flawed proofs or noncompliant tool calls. When the weighted contributions are equal, the effects cancel in the conditional mean.

When $`\alpha, \beta`$ are known constants with $`\alpha + \beta < 1`$, class-conditional noise correction removes the bias from the mean estimate (*[Learning with Noisy Labels, Sections 2 and 3](https://papers.nips.cc/paper_files/paper/2013/file/3871bd64012152bfb53fdf04b401193f-Paper.pdf)*). The estimator is the prevalence correction of [Rogan and Gladen](https://pubmed.ncbi.nlm.nih.gov/623091/), and it increases variance by the squared factor below:

$$
\hat{\theta}_{\text{corr}} = \frac{\bar{V} - \alpha}{1 - \alpha - \beta}, \qquad \mathrm{Var}(\hat{\theta}_{\text{corr}}) = \frac{\mathrm{Var}(\bar{V})}{(1 - \alpha - \beta)^2} \tag{5.4}
$$

For task families whose validity is exactly decidable by a sound and complete certificate verifier, $`\alpha=\beta=0`$ and there is nothing to correct.

**What a policy learns from a grader.** Equations (5.1) and (5.4) describe a grader that is only observed. Once its verdict is the reward, the policy moves toward whatever the grader accepts. Model that as reweighting the policy's trajectories by $`e^{\eta V}`$, with $`\eta`$ the strength of optimization. A policy that starts at true validity $`\theta`$ then has:

$$
\theta_\eta = \frac{\theta(1-\beta)e^{\eta} + \theta\beta}{\big[\theta(1-\beta) + (1-\theta)\alpha\big]e^{\eta} + \theta\beta + (1-\theta)(1-\alpha)} \ \xrightarrow{\ \eta \to \infty\ } \ \frac{\theta(1-\beta)}{\theta(1-\beta) + (1-\theta)\alpha} \tag{5.5}
$$

The limit is the grader's positive predictive value at the starting policy, and the observed score goes to 100% along the way. For Model B of Section 1 under final-answer matching:

**Table 2. Observed score and true validity of Model B under final-answer matching as optimization strengthens.**

| Optimization strength $`\eta`$ | 0 | 1 | 2 | 4 | Limit |
| --- | --- | --- | --- | --- | --- |
| Observed score | 77.0% | 90.1% | 96.1% | 99.5% | 100% |
| True validity | 64.0% | 74.9% | 79.9% | 82.7% | 83.2% |

Two results follow, one for each kind of error.

• *False acceptance sets the ceiling.* The policy can reach the grader's positive predictive value and no more: 83.2% for Model B, 98.5% for Model A. With $`\alpha = 0`$ the ceiling is 100% for any $`\beta < 1`$.
• *False rejection removes routes.* A valid route that the grader always rejects loses its share of valid work at rate $`e^{-\eta}`$. If two valid routes start equally common and the grader accepts only one, the other falls from 50% of valid work to 26.9%, 11.9% and 1.8% at $`\eta = 1, 2, 4`$. Training against a reference path teaches the model to stop producing correct proofs the reference did not anticipate.

The cost of false acceptance is the ceiling and the cost of false rejection is diversity. Certificate checking has neither cost on the families it decides, which is the argument for drawing process rewards from certified nodes. It also locates the limit of a theoretical result sometimes read as making process supervision unnecessary: [Jia, Rakhlin and Xie](https://arxiv.org/abs/2502.10581) show that outcome supervision is statistically no harder than process supervision, up to polynomial factors in the horizon, when the outcome reward is the objective. When a correct answer can rest on an invalid derivation, the outcome reward is wrong about validity, and a policy trained on it converges to the limit in equation (5.5).

## 6 A test set with exactly known verdicts

Measuring a grader's two error rates requires submissions whose validity is known without appeal to any grader. I built such a test set from 600 strongly convex quadratic task families. Using exact rational arithmetic, each family yields 6 algebraic submissions, for 3,600 in total:
• 1,200 valid certificates, 2 per family: one derived using Lagrange multipliers and one using equality elimination.
• 2,400 submissions with controlled defects, 4 per family: (1) an infeasible construction, $`Ax \neq b`$, that reports the exact optimal value $`v^*`$; (2) failure of stationarity along a feasible direction in $`\ker A`$ while reporting $`v^*`$; (3) a claimed multiplier that fails the stationarity equation while reporting $`v^*`$; and (4) an incorrect final objective value. The first three classes, comprising 1,800 submissions or 75% of all invalid submissions, report the correct final answer $`v^*`$.

The composition is the instrument's design: three ways of being wrong with the right answer, one way of being wrong with the wrong answer, and two ways of being right. I compared three deterministic acceptance protocols on all 3,600 submissions:

**Table 3. Three acceptance protocols on 3,600 submissions with known verdicts.**

| Acceptance protocol | False acceptance rate on invalid submissions (2,400) | False rejection rate on valid certificates (1,200) | Valid share of accepted submissions |
| --- | --- | --- | --- |
| Final-answer matching only | 75.0% (accepts 1,800 flawed solutions) | 0.0% | 40.0% |
| Strict reference-path matching | 0.0% | 50.0% (rejects 600 valid elimination proofs) | 100.0% |
| Certificate verification | 0.0% | 0.0% | 100.0% |

Certificate verification accepted 1,800 fewer invalid proofs than final-answer matching and retained 600 more valid alternative solutions than strict reference-path matching. Strict error detection and acceptance of valid alternative proofs held together on the same submissions, which neither baseline managed. The projected-residual bound in equation (3.4) also held at all 600 feasible perturbations, one per family, and the verifier rejected every submission of defect class (3), the multiplier that a partial witness check would have let through.

The last column is the ceiling of Section 5. A policy trained against final-answer matching on this mix moves from one third valid work to 40% and stops. Trained against the reference path it reaches 100% and loses the elimination route. Trained against certificate checking it reaches 100% with both routes intact.

## 7 Dependence within task families and the economics of certificates

Surface variations of one problem template do not provide independent observations of general reasoning ability. Suppose there are $`F`$ independent task families, each with $`K`$ variants, common marginal variance $`\sigma^2`$, and common pairwise within-family correlation $`\rho_w`$. The sample mean then carries the Kish design effect $`1 + (K - 1)\rho_w`$, and its variance and effective sample size $`n_{\text{eff}}`$ are:

$$
\mathrm{Var}(\bar{Z}) = \frac{\sigma^2}{FK}[1 + (K - 1)\rho_w], \qquad n_{\text{eff}} = \frac{FK}{1 + (K - 1)\rho_w} \tag{7.1}
$$

For $`F = 50`$ families with $`K = 8`$ variants each, there are $`400`$ responses, and if $`\rho_w = 0.6`$, those $`400`$ responses provide the same precision as $`n_{\text{eff}} \approx 77`$ independent observations. Training and test sets are therefore split by task family, and new tasks vary assumptions, evidentiary relationships or the structure of a derivation, beyond substituting numbers.

Certificates cost engineering once and almost nothing afterwards. Let $`C_0`$ be the upfront engineering cost of the proof-obligation certificates and verifier, $`c_e`$ the expert review cost per submission, $`c_v`$ the automated verifier's unit execution cost, and $`u`$ the fraction of submissions escalated to human adjudication at the same expert unit cost. The certificate workflow is the cheaper one when submission volume $`N`$ exceeds:

$$
C_0 + N(c_v + uc_e) < Nc_e \iff N > \frac{C_0}{(1 - u)c_e - c_v}, \qquad (1 - u)c_e > c_v \tag{7.2}
$$

For a certificate family whose engineering costs as much as 400 expert reviews, with 15% of submissions escalated and a verifier run costing 2% of a review, the break-even is 482 submissions. Past that volume every further submission releases 83% of an expert review, and those hours go to the semantic obligations that only specialists can settle. The cost model covers the certificate layer; model calls and calibration are costed with the layers they belong to.

The team produced roughly 500 scientific reasoning tasks a week under this design, and later programs reused its layered structure.

# Project 04: evidence-verification-and-robust-comparison-in-investment-research

**Article Title**
Evidence Verification and Robust Comparison in Investment Research

**Organization**
Duke University × Leading Global Alternative Asset Manager

**Title**
Evidence Verification and Robust Comparison in Investment Research

**URL**
https://www.theodoreoy.com/experience/evidence-verification-and-robust-comparison-in-investment-research/

**Position**
Researcher

**Location**
Durham, North Carolina; Washington, DC

**Dates**
September 2023 – September 2026

**Read More Label**
Read More


## Summary

Due diligence has more facts to check than analyst time to check them. I built a method that determines which investment conclusions the evidence in hand already supports and which facts are most valuable to verify next, with ranking guarantees that hold across every near-optimal scoring model and every admissible resolution of the unverified evidence. For affine scores I solved the verification problem exactly: a field has guaranteed value only when its unresolved swing exceeds the current margin, and a plan over many fields is a knapsack on swing per unit of analyst cost. I implemented the method with a leading global alternative asset manager, and subsequent research reused it.

## Problem and Approach

Due diligence has a limited budget of analyst time and a long list of facts that could be checked. In late 2023 I began treating that as a decision problem: given the evidence in hand, which conclusions does it support, and which facts would most improve the decision if they were verified? AI-polished narratives, unverified sustainability claims and common reporting errors can all move ESG and investment scores, so the answer has to account for uncertainty in the corporate evidence as well as in the scoring models. The usual guide to what deserves checking is feature attribution, which measures what the model cares about. What a diligence team needs to know is which evidence is still open and able to change the decision.

The architecture I developed takes a traceable evidence state as its input and builds in model multiplicity, joint measurement error and the costs of verification. Its guarantees need no probability that any particular disclosure is exaggerated. It returns three things an investment committee can act on: the set of pairwise rankings that hold whatever the unverified evidence turns out to be, the number of simultaneous worst-case misstatements each ranking survives, and the verification plan that removes the most decision regret for the analyst hours available. I kept refining it through 2026. Sections 1 through 6 develop the limits of attribution methods, the joint uncertainty model, ranking bounds, the verification plan, versioned updates and worked examples.

## Key Contributions

* **I framed investment due diligence as a decision problem: which conclusions does the current evidence support, and which fact is most valuable to verify next?** The framework took shape in late 2023, and I refined it through the work that followed. I represented unresolved evidence $`\mathcal{X}(E)`$ jointly with a near-optimal model set $`\mathcal{F}_\alpha`$ through $`\Omega(E) = \mathcal{F}_\alpha \times \mathcal{X}(E)`$ and derived convex support-function bounds ($`h_U(a_f)`$) that give ranking guarantees across every retained model and admissible resolution of the evidence. Under the same affine scoring model, common measurement errors cancel when the two companies have identical exposures. In a worked comparison, the joint model certified a 0.6-point advantage that the difference bound from separate company intervals ($`[-1.4, 2.6]`$) could not show.
* **I derived a query criterion that ranks verification by its effect on the decision, and solved it exactly for affine scores.** The criterion is the reduction in worst-case decision regret that a query can guarantee, and it needs no probability distribution over the scenarios inside the joint uncertainty set. With interval evidence, verifying a set of fields with combined swing $`s_J`$ leaves worst-case regret $`(h - \max(s_J, \left\vert m\right\vert))_+`$. A single field therefore has guaranteed value only if its swing exceeds the margin, fields worthless alone can be valuable together, and the best plan within an analyst budget is a knapsack on swing per unit cost.
* **I gave each certified ranking a number a committee can read: how many simultaneous worst-case misstatements it survives.** One inclusion event certifies every pairwise ranking at once, with no penalty for the number of comparisons, so the output is a certified partial order that verification can only extend.
* **I implemented the framework with a leading global alternative asset manager, and subsequent research reused it.** Institutional diligence requirements became measures of score reliability, pairwise ranking stability and verification priority. The workflow ingests evidence, scores companies across a set of near-optimal models, computes ranking bounds and allocates verification effort by minimax regret. Each correction triggers rescoring and attribution updates, so the investment committee has a traceable basis for its analysis.
* **I showed where conventional bootstrap resampling, and verification priorities based on raw SHAP magnitudes, fail when inputs contain shared reporting bias or unverified claims.** Under a fixed common bias, a nominal 95% interval loses coverage as the sample grows, and resampling the same records cannot identify the bias. A self-reported metric near the sector mean can carry a near-zero attribution and still hold enough unresolved error to reverse a ranking. I derived the sample size past which collecting more records is worth less than verifying the ones in hand.
* **I analyzed how AI-polished corporate narratives shift LLM-assisted scoring, ESG ratings and investment analysis when the claims beneath them lack factual support.** I converted operating reports, audited financial statements, sustainability disclosures, management questionnaires and third-party datasets into structured scoring rules that carry source and version records. AI-assisted checks then pick out unsupported claims and contradictions across documents, and shared reporting errors enter the same review, so that verification in private-market and ESG research can be targeted.
* **I deployed gradient-boosted trees and deep tabular models to capture nonlinear thresholds and interactions, and measured how far their explanations depend on model choice.** Attributions computed across the near-optimal set $`\mathcal{F}_\alpha`$, read together with conditional analysis of correlated features, identify the scoring factors whose contributions stay stable across models.

## Manuscript

## 1 Feature attribution and the value of verification

[SHAP](https://arxiv.org/abs/1705.07874) splits a model prediction into additive feature contributions through its local accuracy property. Conditional Shapley methods also account for dependence among features, and Rashomon-set methods check how stable explanations are across near-optimal models ([SHAP](https://arxiv.org/abs/1705.07874); [Aas et al.](https://arxiv.org/html/1903.10464v3); [Marx et al.](https://proceedings.mlr.press/v206/marx23a.html)). All of them take the corporate inputs $`x`$ as given. In investment diligence the inputs are the open question, because self-reported disclosures can be polished well past what the underlying facts support, and an analyst needs to know which corrections to the evidence could change a decision. Attribution was not built for that question, and there is now a theorem to that effect: for expressive model classes, attribution methods that are complete and linear, SHAP among them, can do no better than random guessing at inferring how the model behaves under changed inputs ([Bilodeau et al.](https://arxiv.org/abs/2212.11870)). The remedy those authors recommend is to evaluate the model directly on the changes of interest, which is what the bounds of Sections 2 to 4 do.

Neighboring work bears on other parts of the problem. [Aggregate Confusion](https://academic.oup.com/rof/article/26/6/1315/6590670) documents how widely ESG ratings diverge across agencies and traces most of the divergence to measurement. [Robust Active Preference Elicitation](https://arxiv.org/abs/2003.01899) selects pairwise comparison queries under set-based uncertainty, with worst-case utility and regret as objectives. My framework works in institutional research where the facts are still being checked, and it connects model disagreement, evidence changes, ranking stability and the choice of what to verify next.

The first failure case concerns verification priorities based on raw attribution magnitudes. Take a linear scoring model with a fixed marginal background distribution $`Q`$. The [SHAP](https://arxiv.org/abs/1705.07874) attribution for feature $`j`$ is $`\phi_j = \beta_j(x_j - E_Q X_j)`$. If the feature has unresolved factual uncertainty bounded by $`\left\vert\delta_j\right\vert \le d_j`$, its sensitivity to verification is $`\left\vert\beta_j\right\vert d_j`$, and over a box of admissible evidence errors the exact worst-case change in the company score is

$$
\sup_{\left\vert\delta_j\right\vert \le d_j} \left\vert f(x + \delta) - f(x)\right\vert = \sum_j \left\vert\beta_j\right\vert d_j \tag{1.1}
$$

The upper bound comes from the triangle inequality, and it is attained by picking the endpoint of each error interval so that every perturbation pushes the score in the same direction. Apart from the coefficient, that sum depends on how wide the errors are, whereas the attribution depends on where the feature sits relative to the background. Attribution magnitude and verification value are separate calculations. Two cases show the difference:
• A financial metric may have a large [SHAP](https://arxiv.org/abs/1705.07874) attribution $`\left\vert\phi_j\right\vert`$ and come from audited filings that have already been verified ($`d_j \approx 0`$). Further checks of that field do little to reduce score uncertainty.
• A self-reported ESG or operating metric may lie near the sector mean ($`x_j \approx E_Q X_j \implies \phi_j \approx 0`$) and so receive a near-zero [SHAP](https://arxiv.org/abs/1705.07874) attribution. Substantial unresolved reporting error ($`d_j \gg 0`$) may still be enough to reverse a company ranking.

The second failure case concerns conventional resampling: redrawing existing records cannot identify a shared reporting bias. Suppose $`n`$ reported observations satisfy $`X_i = \mu + b + \varepsilon_i`$, where $`\varepsilon_i \sim \mathcal{N}(0, \sigma^2)`$ are independent errors and $`b \neq 0`$ is an unmodeled bias common to all records, as with systematic overstatement across a sector. A conventional nominal 95% normal confidence interval centered on the sample mean $`\bar{X}`$ covers the true parameter $`\mu`$ with probability

$$
\Pr\left\{ \mu \in \left[ \bar{X} - z\frac{\sigma}{\sqrt{n}}, \ \bar{X} + z\frac{\sigma}{\sqrt{n}} \right] \right\} = \Phi\left( z - \frac{b\sqrt{n}}{\sigma} \right) - \Phi\left( -z - \frac{b\sqrt{n}}{\sigma} \right) \longrightarrow 0 \quad (\text{as } n \to \infty) \tag{1.2}
$$

where $`z = \Phi^{-1}(0.975) \approx 1.96`$. With a fixed nonzero common bias, a larger sample reduces random variance while the interval's coverage of the true parameter tends to zero, and bootstrapping the same biased records adds no information that identifies $`b`$. The effect is large in practice. A survey with about 250,000 responses a week overestimated US vaccine uptake by 17 percentage points, an estimate no more accurate than a simple random sample of size 10 ([Bradley et al.](https://arxiv.org/abs/2106.05818)). In ESG data, the association between corporate emissions and stock returns reported in earlier work was traced to emissions figures estimated by one data vendor from financial fundamentals, with minimal evidence of any association in the emissions firms disclosed themselves ([Aswani et al.](https://doi.org/10.1093/rof/rfad013)). A shared third-party estimate is the error structure the joint model of Section 2 is built to carry.

Bounding the common bias takes external evidence, and once verification supplies a bound $`\left\vert b\right\vert \le \bar{b}`$ the interval can be made both valid and short. The shortest interval with 95% coverage for every admissible bias has half-width

$$
\mathrm{cv}_{0.95}\!\Big(\frac{\bar{b}\sqrt{n}}{\sigma}\Big) \frac{\sigma}{\sqrt{n}}, \qquad \mathrm{cv}_{0.95}(t) = \text{the 95\% quantile of } \left\vert \mathcal{N}(t, 1)\right\vert \approx t + 1.645 \ \text{ for large } t \tag{1.3}
$$

which is the bias-aware critical value of [Armstrong and Kolesár](https://doi.org/10.3982/QE1199). It also says when to stop collecting. Past

$$
n^* = \Big( \frac{1.645\, \sigma}{\bar{b}} \Big)^2 \tag{1.4}
$$

records, the bias bound is the larger part of the half-width, and halving the bound shortens the interval more than doubling the sample does. From there on, analyst time buys more precision in verification than in collection.

## 2 Joint uncertainty over models and evidence

I represent model multiplicity and unresolved evidence jointly to assess whether an ESG or investment ranking stays stable under admissible changes to either.

On the model side, I fix the prediction target, input definitions and output scale, and let $`\mathcal{F}_0`$ contain $`M`$ candidate scoring models specified before examining the validation data. The validation set consists of $`n`$ i.i.d. observations from the target evaluation distribution, independent of model construction, and the loss is bounded in $`[0, 1]`$. For a failure probability $`\alpha \in (0, 1)`$, Hoeffding's inequality and a union bound give

$$
\Pr\left\{ \max_{f \in \mathcal{F}_0} \left\vert\hat{L}_n(f) - L(f)\right\vert \le t_n \right\} \ge 1 - \alpha, \qquad t_n = \sqrt{\frac{\log(2M / \alpha)}{2n}} \tag{2.1}
$$

Let $`f^*`$ minimize population loss within $`\mathcal{F}_0`$. I retain every model whose empirical validation loss is within $`2t_n`$ of the empirical minimum, which defines an empirical Rashomon set:

$$
\mathcal{F}_\alpha = \left\{ f \in \mathcal{F}_0 : \hat{L}_n(f) \le \min_{g \in \mathcal{F}_0} \hat{L}_n(g) + 2t_n \right\} \tag{2.2}
$$

On the simultaneous concentration event, $`\hat{L}_n(f^*) \le L(f^*) + t_n \le \min_g \hat{L}_n(g) + 2t_n`$, so $`f^* \in \mathcal{F}_\alpha`$ and every retained model has population excess loss at most $`4t_n`$. The construction follows [Marx et al.](https://proceedings.mlr.press/v206/marx23a.html); the finite-class radius and the excess-loss bound are the two-line derivation above.

On the evidence side, $`\mathcal{X}(E)`$ represents the questions still unresolved under the current diligence state $`E`$: entity boundaries, reporting periods, physical units, measurement definitions, shared third-party sources and suspected greenwashing claims. Each $`X \in \mathcal{X}(E)`$ specifies a joint input configuration for all candidate companies at once, and that is how error dependence across companies and fields is preserved. Over the joint space $`\Omega(E) = \mathcal{F}_\alpha \times \mathcal{X}(E)`$, the exact worst-case bounds on the score difference between companies $`i`$ and $`k`$ are

$$
\underline{\Delta}_{ik} = \inf_{(f, X) \in \Omega(E)} [f(x_i) - f(x_k)], \qquad \overline{\Delta}_{ik} = \sup_{(f, X) \in \Omega(E)} [f(x_i) - f(x_k)] \tag{2.3}
$$

If $`\underline{\Delta}_{ik} > 0`$, the ordering $`i \succ k`$ holds for every retained model in $`\mathcal{F}_\alpha`$ and every admissible resolution of the evidence in $`\mathcal{X}(E)`$. Suppose calibration establishes that $`\mathcal{X}(E)`$ contains the true inputs with probability at least $`1 - \beta`$ at the specified certification stage. A union bound then gives joint inclusion of $`f^*`$ and the true inputs with probability at least $`1 - \alpha - \beta`$, with no independence required between model validation and evidence calibration. The probability of issuing a certificate that is false for $`f^*`$ at the true inputs is at most $`\alpha + \beta`$. The object certified is the score ordering under the best model of the prespecified class at the true inputs, and for certification repeated over several stages $`\beta`$ is calibrated jointly across the stages.

**One event certifies every pair.** The guarantee is a statement about a single inclusion event, so on that event every pair with a positive lower bound is ordered correctly at once. Nothing is paid for the number of comparisons. Three consequences follow.

• The output of diligence is a certified partial order over the companies, and verification can only extend it: resolving evidence shrinks $`\mathcal{X}(E)`$, so every lower bound stays where it is or rises.
• Progress has a measure, the share of company pairs that are certified, and a diligence plan can be judged by how far it moves that share per analyst hour.
• Selecting the top $`K`$ of $`N`$ companies needs only the $`K(N - K)`$ certificates that put each selected company above each rejected one. For five of twenty that is 75 certificates in place of all 190 pairs.

Three neighboring constructions come close and stop short of this. Robust ordinal regression reports the "necessary" preferences that hold for every value function compatible with a decision maker's stated judgments, and shows that the necessary relation grows with information ([Greco et al.](https://ideas.repec.org/a/eee/ejores/v191y2008i2p416-436.html)); its uncertainty is entirely on the model side and the inputs are taken as known. Certain predictions hold for every classifier trained on every possible completion of an incomplete data set, and the companion cleaning rule chooses which row a person should fix next ([Karlaš et al.](https://arxiv.org/abs/2005.05117)); its possible worlds are independent across rows, so an error shared by two units cannot cancel, and its selection rule counts worlds, which amounts to a uniform prior over them. Confidence sets for ranks give simultaneous statistical statements about league tables ([Mogstad et al.](https://www.nber.org/papers/w26883)); they pay for simultaneity and treat each unit's estimate as a noisy draw, with no account of unverified inputs. The joint set $`\Omega(E)`$ carries model multiplicity and cross-company evidence error together, without a prior.

## 3 Computing comparison bounds with support functions

Convex support functions make the joint comparison bounds tractable ([Ben-Tal and Nemirovski](https://www2.isye.gatech.edu/~nemirovs/MOR_RCO_1998.pdf)). Let $`u \in U`$ collect the unresolved factual quantities, including common benchmark errors and company-specific allowances for reporting error, and write company inputs as $`x_i(u) = \bar{x}_i + B_i u`$. For an affine scoring model, the pairwise difference is $`\Delta_f(u) = m_f + a_f^\top u`$, where $`a_f = (B_i - B_k)^\top \beta_f`$, and the support function $`h_U(a) = \sup_{u \in U} a^\top u`$ gives exact comparison bounds:

$$
\inf_{u \in U} \Delta_f(u) = m_f - h_U(-a_f), \qquad \sup_{u \in U} \Delta_f(u) = m_f + h_U(a_f) \tag{3.1}
$$

For the ellipsoidal uncertainty set $`U = \{Cz : \|z\|_2 \le r\}`$, the Cauchy-Schwarz inequality gives $`h_U(a_f) = r\|C^\top a_f\|_2`$. For an $`\ell_\infty`$ box centered at zero with half-widths $`d_j`$, $`h_U(a_f) = \sum_j \left\vert a_{f,j}\right\vert d_j`$. I call $`s_j = \left\vert a_{f,j}\right\vert d_j`$ the *swing* of field $`j`$: the most the unresolved state of that field can move this comparison.

Keeping everything in one joint representation lets shared errors cancel exactly in a pairwise comparison. Let $`S`$ index common-source coordinates on which the two companies have identical loadings, so that $`(B_i-B_k)_{:,S}=0`$. Under the same linear scoring model,

$$
(a_f)_S=0,\qquad \Delta_f(u)=m_f+(a_f)_{S^c}^{\top}u_{S^c} \tag{3.2}
$$

The common-source contribution cancels, and company-specific uncertainty stays in the support-function bound. If every uncertain direction cancels, $`a_f=0`$ and $`h_U(\pm a_f)=0`$. Subtracting intervals constructed separately for companies $`i`$ and $`k`$ loses this, because it lets a shared source move in opposite directions at the same time. That combination is incompatible with the joint error structure, and it produces an unnecessarily wide difference bound.

**How many misstatements a ranking survives.** The box lets every unresolved field take its worst value at once. A committee is usually asking something narrower: how many things would have to be wrong together before this ranking fails? If at most $`\Gamma`$ fields are misstated simultaneously, the support function is the sum of the $`\Gamma`$ largest swings, the budgeted uncertainty set of [Bertsimas and Sim](https://ideas.repec.org/a/inm/oropre/v52y2004i1p35-53.html). Ordering the swings as $`s_{(1)} \ge s_{(2)} \ge \cdots`$, the *misstatement tolerance* of the ordering $`i \succ k`$ is

$$
\Gamma^*_{ik} = \max\Big\{ \Gamma : \sum_{j \le \Gamma} s_{(j)} < m_f \Big\} \tag{3.3}
$$

the largest number of simultaneous worst-case misstatements the ranking survives. It turns a bound into a sentence: this ranking holds against any two unverified fields being wrong at once, and three could overturn it. It also sets a target for verification, since raising $`\Gamma^*`$ to the level a committee requires is a question about which swings to remove.

For a smooth nonlinear model, set $`m_f=\Delta_f(0)`$ and $`a_f=\nabla\Delta_f(0)`$. If $`\Delta_f(u)`$ is twice continuously differentiable on $`\|u\|_2 \le r`$ and its Hessian has operator norm bounded by $`K_f`$, Taylor's theorem gives

$$
\left\vert\Delta_f(u) - m_f - a_f^\top u\right\vert \le \kappa_f, \qquad \kappa_f = \frac{1}{2}K_f r^2 \implies \underline{\Delta}_f \ge m_f - r\|a_f\|_2 - \kappa_f \tag{3.4}
$$

Nonsmooth tree ensembles get their bounds from leaf-region partitioning or mixed-integer linear programming ([Kantchelian et al.](https://proceedings.mlr.press/v48/kantchelian16.html)). The implementation spends computation first on company pairs whose difference bounds are close to the zero decision boundary.

## 4 Selecting queries by the regret they can remove

When $`\underline{\Delta}_{ik} \le 0 < \overline{\Delta}_{ik}`$, the ranking is unresolved, since a factual correction or a resolution of ambiguous evidence could change the decision. The system then prioritizes the next verification query $`q`$, such as reviewing a supplier contract, requesting original utility bills, or checking a regulatory filing.

Let $`A`$ be a finite set of institutional actions, such as advancing company $`i`$ or company $`k`$ to final diligence, or deferring a rating. Let $`W(a, \omega)`$ be the prespecified utility of an action in scenario $`\omega \in \Omega`$, where $`\Omega`$ is nonempty and utilities are uniformly bounded. The baseline minimax regret over deterministic actions is

$$
R^*(\Omega) = \min_{a \in A} \sup_{\omega \in \Omega} \left[ \max_{b \in A} W(b, \omega) - W(a, \omega) \right] \tag{4.1}
$$

A query $`q`$ returns an observation $`o \in O_q`$ and restricts the compatible scenarios to a nonempty subset $`\Omega_{q,o} \subseteq \Omega`$. I score the query by its guaranteed reduction in worst-case decision regret:

$$
V(q) = R^*(\Omega) - \sup_{o \in O_q} R^*(\Omega_{q,o}) \ge 0 \tag{4.2}
$$

Nonnegativity follows from $`\Omega_{q,o} \subseteq \Omega`$: restricting the scenario set cannot increase worst-case regret for any fixed action, and minimizing over $`a \in A`$ preserves that inequality. Calculating $`V(q)`$ uses the set of compatible scenarios and requires no prior probability that a disclosure is exaggerated. Minimax regret is Savage's criterion, and choosing queries by it comes from utility elicitation ([Boutilier et al.](https://www.cs.toronto.edu/~cebly/Papers/BPPS-aij06-abs.html); [Robust Active Preference Elicitation](https://arxiv.org/abs/2003.01899)). Those methods elicit a decision maker's preferences. Here the queries are facts about companies, their answers move the inputs of every model in $`\mathcal{F}_\alpha`$ at once, and they cost analyst hours.

**The exact plan for affine scores.** For a choice between two companies under an affine score with interval evidence, the whole problem has a closed form. Write $`m`$ for the current margin, $`h = \sum_j s_j`$ for the total swing, and $`s_J = \sum_{j \in J} s_j`$ for the swing of a set $`J`$ of fields. Verify the fields in $`J`$, let the action be chosen again once their values are known, and take the worst values they could turn out to have. The regret that remains, and the guaranteed value of the set, are

$$
R_J = \big( h - \max(s_J, \left\vert m\right\vert) \big)_+, \qquad V(J) = R_\varnothing - R_J = (s_J - \left\vert m\right\vert)_+ \quad \text{when } h > \left\vert m\right\vert \tag{4.3}
$$

The reason is that verification acts twice. It removes $`s_J`$ of swing, and it moves the margin by the revealed values, by as much as $`s_J`$ in the unfavorable direction. Until $`s_J`$ exceeds $`\left\vert m\right\vert`$ the two effects cancel in the worst case. Four results follow.

1. *The pivot rule.* A single field has guaranteed value only if $`s_j > \left\vert m\right\vert`$, that is, only if that field alone could reverse the decision, and its value is then $`s_j - \left\vert m\right\vert`$. Checking a field whose swing is below the margin guarantees nothing by itself, however large its attribution.
2. *Complementarity, exactly.* Two fields that are each worthless alone are worth $`s_J - \left\vert m\right\vert`$ together as soon as their combined swing passes the margin. A rule that scores one query at a time ranks them last; the closed form shows what such a rule gives up.
3. *The plan is a knapsack.* With verification costs $`c_j`$ and a budget of analyst hours, the plan that leaves the least regret maximizes verified swing within the budget. That is a knapsack on the swings, and ordering fields by $`s_j / c_j`$ solves its relaxation.
4. *Shared sources are worth nothing to a pairwise choice.* A common-source field on which the two companies load identically has $`a_j = 0`$ and zero swing. This is the cancellation of Section 3 read as scheduling advice: when choosing between two companies, analyst hours spent on the benchmark they share cannot move the choice.

Across the model set $`\mathcal{F}_\alpha`$ the same expressions apply with the least favorable model for each action.

Verification narrows an allowance and seldom removes it. In a field experiment on third-party environmental audits, auditors chosen and paid by the audited plants systematically reported readings just below the regulatory standard ([Duflo et al.](https://ideas.repec.org/a/oup/qjecon/v128y2013i4p1499-1545.html)). I therefore let a verified field keep a fraction $`\lambda_j`$ of its half-width, set by the standing of the source: self-reported, limited assurance, reasonable assurance or primary document. The swing a check removes is $`(1 - \lambda_j) s_j`$, and that is the quantity that enters the knapsack.

With two-point evidence in place of intervals the worst observation cannot land in the middle of the range, so a check guarantees more; the third example of Section 6 is of that kind. The interval case is the conservative one. And because a verification rule the scored companies can anticipate invites embellishment where checks are unlikely ([Lyon and Maxwell](https://ideas.repec.org/a/bla/jemstr/v20y2011i1p3-41.html)), the plan is held inside the diligence team and combined with a share of checks drawn at random.

## 5 Propagating factual corrections through scores and attributions

When diligence resolves a query and the verified evidence vector changes from $`x`$ to $`x'`$, the system follows versioned dependencies to recompute the affected scores, peer rankings and [SHAP](https://arxiv.org/abs/1705.07874) explanations. With the scoring function $`f`$, background reference $`Q`$ and rubric version held fixed, Shapley efficiency gives the exact identity ([SHAP local accuracy](https://arxiv.org/abs/1705.07874)):

$$
f(x) = \phi_0 + \sum_j \phi_j(f, Q, x), \qquad \sum_j [\phi_j(f, Q, x') - \phi_j(f, Q, x)] = f(x') - f(x) \tag{5.1}
$$

Approximate Shapley outputs meet this up to a residual. Suppose their efficiency residuals are $`\left\vert\phi_0+\sum_j\phi_j-f(x)\right\vert\le\eta`$ and $`\left\vert\phi_0+\sum_j\phi'_j-f(x')\right\vert\le\eta'`$ under the same baseline $`\phi_0`$. The triangle inequality then gives the recomputation check $`\left\vert\sum_j \Delta \phi_j - \Delta f\right\vert \le \eta + \eta'`$, which every update has to pass before its explanations reach the committee.

Every database update records `(field version, evidence document ID, model version, background Q, rubric version)`. With these identifiers, a change caused by a factual correction is told apart from one caused by a model update or a change to the background distribution.

## 6 Worked examples

Five worked examples fix the size of each effect under stated inputs.

1. **Confidence interval coverage under common reporting bias.**
• Set the shared bias to $`b = 0.2`$ and independent noise to $`\sigma = 1`$. If the common bias $`b`$ is ignored, a nominal 95% interval has actual coverage of 48.40% at $`n = 100`$ records and 0.000637% at $`n = 1{,}000`$. Once targeted verification shows $`\left\vert b\right\vert \le 0.2`$, the half-width $`0.2 + 1.96/\sqrt{n}`$ gives 97.50% coverage at $`n = 100`$, and the bias-aware half-width of Section 1 is $`0.3645`$ against $`0.396`$: 8.0% shorter at exactly 95%. The threshold is $`n^* \approx 68`$ records. Past it, verification is the better use of the next analyst hour.
2. **Cancellation of shared errors in pairwise rankings.**
• Two companies have a nominal score difference of $`0.6`$ points and share an additive sector-benchmark error in $`[-1, 1]`$. Subtracting separately constructed company intervals gives $`[-1.4, 2.6]`$, which cannot certify the ordering, whereas the joint support-function calculation cancels the shared error and gives $`[0.6, 0.6]`$, which certifies the ranking.
3. **Minimax-regret verification compared with [SHAP](https://arxiv.org/abs/1705.07874) magnitude.**
• Consider a single query, with the same cost for each query option. The example has eight scenarios, which come from two candidate models in the Rashomon set ($`\theta \in \{-1, 1\}`$) and four unresolved evidence configurations ($`z_1 \in \{-0.4, 0.4\}`$, $`z_2 \in \{-0.2, 0.2\}`$). The pairwise score difference is $`\Delta_\theta = 0.15\theta + z_1 + 0.3\theta z_2`$. A further shared feature has a large [SHAP](https://arxiv.org/abs/1705.07874) attribution but is already verified ($`d_0 = 0`$). The action is to select company $`i`$ or company $`k`$, and regret is measured in model-score units.

**Table 1. Guaranteed regret reduction of each verification query.**

| Verification query | Remaining regret under the worst observation | Guaranteed regret reduction $`V(q)`$ |
| --- | --- | --- |
| Recheck the verified field with a large [SHAP](https://arxiv.org/abs/1705.07874) attribution | 0.61 | 0 |
| Verify the smaller unresolved variable $`z_2`$ | 0.61 | 0 |
| Verify $`z_1`$, which determines the sign of the score difference | 0 | 0.61 |

Enumerating the eight scenarios shows that rechecking the verified field with a large [SHAP](https://arxiv.org/abs/1705.07874) attribution produces no regret reduction ($`V(q) = 0`$), while verifying $`z_1`$ takes worst-case regret from 0.61 to zero.

4. **A verification plan under an analyst budget.**
• One company leads another by $`m = 0.6`$ score points. Five fields are unresolved, with swings $`0.9, 0.5, 0.4, 0.3, 0.2`$ and verification costs of $`4, 1, 2, 1, 1`$ analyst hours. The total swing is $`2.3`$, so the ranking is open and the worst-case regret is $`1.7`$. Only the first field passes the pivot rule, with guaranteed value $`0.3`$; each of the others alone guarantees nothing, and the second and third together are worth $`0.3`$. With four hours available:

**Table 2. Two verification plans under a budget of four analyst hours.**

| Plan | Fields verified | Hours | Regret remaining |
| --- | --- | --- | --- |
| Largest swing first | 1 | 4 | 1.4 |
| Swing per hour (the knapsack plan) | 2, 3, 4 | 4 | **1.1** |

The knapsack plan is the optimum over all plans within the budget, and it leaves 21% less regret than checking the largest field.

5. **Misstatement tolerance.**
• A ranking has margin $`m = 1.0`$ and six unresolved fields with swings $`0.4, 0.3, 0.3, 0.2, 0.2, 0.1`$. The box bound does not certify it, since the swings sum to $`1.5`$. The two largest sum to $`0.7`$ and the three largest to $`1.0`$, so $`\Gamma^* = 2`$: the ranking holds against any two of the six fields being misstated at once, and that sentence is what the committee receives.

In the implementation with the asset manager, institutional diligence requirements became measures of score reliability, pairwise ranking stability and verification priority. The workflow ingests evidence, scores companies across the near-optimal model set, computes the certified partial order and its tolerances, and allocates verification by the plan of Section 4. Each correction triggers rescoring and the recomputation check of Section 5, so the investment committee has a traceable basis for every conclusion it is shown.
