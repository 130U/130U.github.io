# AI Research and Engineering

**Author**
Theodore Ouyang

**Updated**
2026-10-27

## Confidentiality & Disclosure Note

The following four research and engineering initiatives were conducted between September 2023 and September 2026 through university–industry collaborations at Duke University. Pursuant to strict non-disclosure agreements (NDAs) with our industry partners—comprising a flagship multimodal foundation model developer, a frontier AI research laboratory, and a leading global alternative asset manager overseeing more than $300 billion in AUM—partner corporate names and proprietary internal system identifiers are anonymized on this public site. Project titles, my role (*Researcher*), geographic locations, dates, architectural paradigms, and self-contained mathematical formulations with reproducible synthetic benchmarks are authorized for public presentation.

# Project 01: statistical-inference-and-resource-allocation-in-expert-data-production

**Article Title**
Statistical inference and resource allocation in expert data production

**Organization**
Duke University × Top-Tier Foundation Model Company

**Title**
Scalable Expert Quality Control and Adaptive Review

**URL**
https://www.theodoreoy.com/past-experience/artificial-intelligence/statistical-inference-and-resource-allocation-in-expert-data-production/

**Position**
Researcher

**Location**
Durham, NC; Palo Alto, CA

**Dates**
September 2023 – September 2026

**Read More Label**
Read More

## Summary

Launched in September 2023 for a flagship multimodal foundation model program, this initiative established the project’s statistical governance and resource-allocation framework for reinforcement learning from human feedback (RLHF) across more than 300 domain specialists in travel, food delivery, consumer goods, and e-commerce advertising *(partner corporate identity anonymized under NDA; role, scope, and mathematical design disclosed)*. Rather than executing routine vendor quality assurance, I architected the pilot’s mathematical and operational framework for governing external expert networks, calibrating evolving acceptance standards, and allocating review capacity at scale. By uniting hierarchical Beta-Binomial reliability modeling, prediction-assisted active statistical inference (inverse-probability-weighted residual correction), and capacity-constrained mixed-integer programming, the framework strictly separates *epistemic measurement value* from *defect remediation value*. In a 10,000-submission synthetic benchmark verified across 200,000 independent sampling repetitions with ideal residual calibration, this allocation architecture reduced population quality estimation variance by **17.79%** versus uniform sampling at equal expected audit cost. A separate 200-item analytical example reduced post-review expected error loss by **8.89%** at equal review volume.

## Confidentiality & Scope Disclosure

Conducted through a university–industry research collaboration with a flagship multimodal foundation model developer. While the corporate partner's name is withheld pursuant to non-disclosure agreements, my role, project scope, operational scale, and the underlying mathematical and engineering frameworks are authorized for public disclosure.

## Key Contributions

* **Established the Pilot Statistical Governance Framework for Expert Post-Training Data (September 2023 Launch)**: Starting in September 2023, I architected a pilot system governing more than 300 domain contributors across travel, food delivery, consumer goods, and e-commerce advertising. My work defined the project’s mathematical and operational standards for structuring, auditing, and scaling its external expert and outsourcing networks.
* **Bayesian Adaptive Review Routing & Hierarchical Contributor Calibration**: Designed multi-tier adaptive review rules parameterized by Beta-Binomial reliability posteriors, credible intervals, verified sample counts, and task-level risk priors. In a flagship e-commerce advertising workflow, dynamically routed flagged submissions to three additional specialists and initially accepted submissions to one or two; closed the feedback loop by feeding expert adjudications directly back into contributor reliability posteriors, targeted coaching, and dynamic review intensity.
* **Taxonomic Defect Disentanglement & Rubric Evolution**: Combined independent random reference audits with targeted high-risk escalations to convert recurring inter-annotator disagreements into unambiguous acceptance criteria. Formally separated missing context, ambiguous prompt instructions, and genuine contributor defects; systematically revised task instructions, boundary cases, and shared calibration anchors and subsequently compared Dawid-Skene reviewer-error models with cost-sensitive deferral rules (DeCCaF) to inform escalation thresholds.
* **Empirical Cost-Latency Telemetry & Production Data Engineering**: Built end-to-end SQL and Python data pipelines unifying task metadata, review trajectories, acceptance outcomes, turnaround times, and behavioral logs, reconciling platform activity with Hubstaff operational telemetry. Crucially, this cross-system reconciliation served not as clerical time-tracking, but to empirically calibrate unit verification costs ($c_i$), task-stratum latencies ($t_{iaj}$), and hard specialist capacity constraints ($H_j^{\text{review}}$) for our mathematical allocation solvers, while translating client-reported model defects into reproducible engineering investigations and operating SOPs.
* **Econometric Analysis of Exploratory Choice Architecture**: Analyzed user decision behavior across curated (approximately 20 hotels) versus expanded (100+ eligible options) recommendation sets using logistic regression with decision-stage interactions, dwell-time transformations, and distributional modeling. Demonstrated that expanding the choice set increased deliberation browsing time significantly more clearly than click-through conversion, establishing quantitative product guidance for exploratory assistant settings.
* **Unified Mathematical Theory Separating Audit Measurement from Defect Remediation**: Extended our production procedures into a rigorous joint mathematical design connecting prediction-assisted active statistical inference, cost-aware audit allocation, and capacity-constrained review assignment. Proved that optimal operations must separate three distinct quantities that standard QA pipelines conflate: a task's *initial error risk* ($q_i$), the *statistical information value of an independent reference audit* ($m_i / c_i$), and the *expected defect loss that additional human handling can remove* ($\Delta_i = r_{i0} - r_{i1}$).
* **Reproducible Large-Scale Monte Carlo & Remediation Validation**: Validated the estimator and allocation algorithms on a stratified synthetic benchmark of 10,000 submissions checked across 200,000 independent Monte Carlo sampling repetitions. Under ideal residual calibration and an identical expected audit budget, cost-aware residual allocation reduced population quality estimation variance by **17.79%** (cutting standard deviation by **9.33%**) relative to uniform sampling. In a separate 200-item analytical example, marginal-gain review ranking reduced expected post-review defect loss by **8.89%** at equal review volume.

## Architectural Context: Statistical Governance for Expert Data Production

As the project scaled multi-domain post-training work from September 2023 onward, it faced a statistical problem: coordinating hundreds of distributed domain specialists and external vendor queues while keeping quality measurements interpretable under selective review. Concentrating human review on heuristic high-risk flags created severe selection bias ($\operatorname{Cov}(\pi(X), q(X)) > 0$) that made raw inspection error rates uninterpretable, while auditing tasks whose errors were already predictable wasted senior specialist capacity without improving statistical visibility. The seven sections below formalize the production design and compare it with subsequent literature. The September 2023 start date describes the collaboration; references published in 2024–2026 provide later methodological context.

## Manuscript

## 1 The observation mechanism creates its own failure modes

In production RLHF pipelines, the routing policy used to inspect submissions alters the statistical properties of the observed sample. Let $`X`$ denote observable task features (encoding domain vertical, prompt complexity, and contributor history) and $`Y \in \{0, 1\}`$ indicate an error in the original submission under fixed acceptance criteria. The true conditional error probability is $`q(x) = P(Y = 1 \mid X = x)`$. Let $`S = 1`$ indicate selection for an independent reference audit. Conditional on $`X`$, selection is randomized with probability $`\pi(x) > 0`$, independently of the reference label that has yet to be observed.

When operational dashboards use the error fraction among verified submissions to assess the full population, they actually target:

$$
E[Y \mid S = 1] = \frac{E[\pi(X)q(X)]}{E[\pi(X)]}
$$

$$
E[Y \mid S = 1] - E[Y] = \frac{\operatorname{Cov}(\pi(X), q(X))}{E[\pi(X)]}
$$

When review priorities successfully target high-risk tasks, the covariance between audit probability $`\pi(X)`$ and true defect probability $`q(X)`$ is strictly positive. A higher error detection rate in the reviewed sample cannot then be read directly as a deterioration in overall production quality; it often reflects sharper risk targeting. This identity describes the distribution of a selected item. In a finite batch, the ratio of observed errors to selected items also has a random denominator, so the two quantities should not be conflated.

Expert rankings are affected by the exact same mechanism. Let $`a_{jh}`$ be the probability that expert $`j`$ is correct on task stratum $`h`$, and let $`p_{jht}`$ describe the mix of tasks assigned to that expert in period $`t`$. Even with unchanged underlying ability, observed accuracy shifts whenever task routing changes:

$$
A_{jt} = \sum_h p_{jht} a_{jh}, \qquad A_{j,t+1} - A_{jt} = \sum_h (p_{jh,t+1} - p_{jht}) a_{jh}
$$

Valid cross-period comparisons therefore require a fixed target task mix $`w_h`$, reporting standardized accuracy:

$$
A_j^{\text{std}} = \sum_h w_h a_{jh}
$$

with overlapping assignments or shared anchor cases to support estimation within each stratum. In our production routing engine, we model each contributor's stratum-level reliability via a conjugate Beta-Binomial scheme: given prior $`\operatorname{Beta}(\alpha_{0h}, \beta_{0h})`$ and $`n_{jht}`$ audited tasks with $`k_{jht}`$ verified successes, the posterior reliability distribution $`\operatorname{Beta}(\alpha_{0h} + k_{jht}, \beta_{0h} + n_{jht} - k_{jht})`$ yields shrinkage-regularized point estimates and credible intervals that account for unequal sample sizes across comparable audits. Pooling different difficulty levels, criteria versions, and selection mechanisms into a single unstratified binomial sample leaves the preceding selection bias unresolved.

These distinctions also guide algorithmic method selection. **[Dawid-Skene](https://doi.org/10.2307/2346806)** models represent differences in reviewer confusion matrices across latent ground truth, whereas **[DeCCaF](https://arxiv.org/html/2403.06906v1)** incorporates task conditions, error costs, and reviewer capacity into human-AI deferral and highlights how assigning difficult cases distorts naive evaluations of expert performance. The architecture developed here addresses the critical interface between selective operational deferral and unbiased population quality inference in ongoing post-training production (*[Dawid-Skene](https://doi.org/10.2307/2346806); [DeCCaF](https://arxiv.org/html/2403.06906v1)*).

## 2 Correct predictions with audits to recover the population target

Fix a production batch of $`N`$ original submissions, its acceptance criteria, and its latent reference labels $`Y_1, \dots, Y_N`$. The inferential target is the finite-batch error rate $`\mu = N^{-1} \sum_{i=1}^N Y_i`$. Let $`f_i \in [0, 1]`$ be a fixed, inexpensive risk prediction (synthesized from contributor posterior reliability, task complexity features, and automated heuristic checks) and $`\pi_i \in [\pi_{\min}, 1]`$ be the assigned audit probability, with independent draws $`S_i \sim \operatorname{Bernoulli}(\pi_i)`$. Both predictions and sampling probabilities are locked before the current batch's reference labels are revealed.

We deploy a prediction-assisted, inverse-probability-weighted (IPW) residual-corrected estimator:

$$
\hat{\mu} = \frac{1}{N} \sum_{i=1}^N \left[ f_i + \frac{S_i}{\pi_i} (Y_i - f_i) \right]
$$

Its design-based validity follows directly. Write the prediction residual as $`e_i = Y_i - f_i`$ and condition on the fixed batch, predictions, and sampling probabilities:

$$
\hat{\mu} - \mu = \frac{1}{N} \sum_{i=1}^N \left( \frac{S_i}{\pi_i} - 1 \right) e_i, \qquad E_S[\hat{\mu} - \mu] = 0
$$

Inverse-probability weighting restores the population representation altered by selective verification, while predictions reduce the residual variation that expensive human expert audits must resolve. Crucially for production robustness, **this design-based unbiasedness does not require $`f_i = q(X_i)`$**: inaccurate predictions can reduce statistical efficiency, but they never introduce selection bias under the specified Bernoulli sampling design. While the estimator builds on established active statistical inference principles (*[Active Statistical Inference: mean estimation and sampling design](https://arxiv.org/html/2403.03208v3)*), our production architecture specifies the exact immutable objects being audited, the rubric version lineage, and the telemetry records required for downstream optimization.

Specifically, original and revised submissions must be retained as separate database entities. Estimating $`\hat{\mu}_{\text{raw}}`$ on frozen originals and $`\hat{\mu}_{\text{final}}`$ on post-review deliverables cleanly distinguishes *defects generated in initial production* from *defects corrected by review*. Furthermore, whenever post-training criteria evolve, a shared set of anchor cases is adjudicated under both rubric versions; submissions from different periods are then compared under a common reference version, preventing stricter acceptance standards from being mistaken for declining contributor capability.

## 3 Allocate audit effort according to residuals and cost

Independent Bernoulli sampling eliminates cross-item covariance terms, yielding the exact design variance:

$$
\operatorname{Var}_S(\hat{\mu}) = \frac{1}{N^2} \sum_{i=1}^N \frac{1 - \pi_i}{\pi_i} e_i^2
$$

This expression identifies the true mathematical objective of audit allocation: **audit effort should address what the automated risk predictions have not resolved**. For a binary error label with conditional error probability $`q_i`$, the expected squared residual decomposes into two components:

$$
m_i := E[(Y_i - f_i)^2 \mid X_i] = q_i(1 - q_i) + (q_i - f_i)^2
$$

The two terms are intrinsic conditional Bernoulli variance $`q_i(1 - q_i)`$ and squared prediction calibration error $`(q_i - f_i)^2`$. This identity establishes a counter-intuitive operational principle: **a high error probability $`q_i`$ does not necessarily imply high inferential value**. If a task category is almost certain to contain an error ($`q_i \approx 1`$) and the predictor correctly recognizes that fact ($`f_i \approx 1`$), then $`m_i \approx 0`$—spending an independent reference audit on that item yields less statistical information about population quality than auditing a moderately risky task whose outcome is genuinely uncertain ($`q_i \approx 0.5`$). The high-risk task still merits operational correction, which is precisely why the *value of measurement* and the *value of remediation* require separate mathematical models.

Let $`c_i > 0`$ be the empirical cost of an independent reference audit (calibrated by reconciling platform review logs with Hubstaff active-work telemetry) and $`B`$ be the expected audit-cost budget. First consider the optimal design when the true residual second moments $`m_i > 0`$ are known:

$$
\min_{\pi} \sum_{i=1}^N \frac{m_i}{\pi_i} \quad \text{s.t.} \quad \sum_{i=1}^N c_i \pi_i \le B, \quad \pi_{\min} \le \pi_i \le 1
$$

The omitted constant $`-\sum_i m_i`$ in the numerator of the variance does not depend on the allocation $`\pi`$. For probabilities strictly between their lower and upper bounds, the Lagrangian first-order condition yields the clipped square-root allocation law:

$$
-\frac{m_i}{\pi_i^2} + \lambda c_i = 0 \implies \pi_i^* = \operatorname{clip}_{[\pi_{\min}, 1]} \left( \sqrt{\frac{m_i}{\lambda c_i}} \right)
$$

for budgets below the cost of a full audit, $`\lambda > 0`$ is chosen to satisfy the budget constraint (the multiplier need not be unique when clipping is active), and feasibility requires $`B \ge \pi_{\min} \sum_i c_i`$. If the budget covers a full audit, every item is audited ($`\pi_i^* = 1`$). The square-root law increases sampling intensity for larger expected residuals while penalizing expensive audits, and the positive probability floor $`\pi_{\min}`$ preserves observation coverage and bounded IPW weights across the entire task space.

Production implementation substitutes regularized stratum estimates $`\hat{m}_i > 0`$ obtained from earlier independent audits or a pilot calibration batch. True $`m_i`$ defines the optimality analysis; estimated values $`\hat{m}_i`$ determine the operational allocation. By estimating residuals at the level of `(task stratum × criteria version × cost stratum)`, the pipeline avoids fitting unstable parameters to individual submissions. (Note that $`B`$ constrains *expected* audit cost per batch. Workflows requiring an exact integer count must use a feasible fixed-size sampling design: its first-order inclusion probabilities sum to that integer, and its variance depends on joint inclusion probabilities. These probabilities need not equal the Bernoulli optimum $`\pi_i^*`$.)

## 4 Derive the gain and identify when it disappears

We now derive the exact analytical efficiency gain of cost-aware residual allocation over uniform sampling using the same predictor, and characterize when active allocation fails. Let $`C = \sum_{i=1}^N c_i`$, so that the budget-equivalent uniform sampling probability is $`p = B / C`$. When true residual second moments $`m_i`$ are available and no optimal probability reaches a clipping boundary, averaging design variance over the conditional label distribution gives:

$$
V_{\text{uniform}} = \frac{1}{N^2} \left[ \frac{C \sum_i m_i}{B} - \sum_i m_i \right]
$$

$$
V_{\text{optimal}} = \frac{1}{N^2} \left[ \frac{\left(\sum_i \sqrt{m_i c_i}\right)^2}{B} - \sum_i m_i \right]
$$

(If a common sampling probability is used within each fixed task stratum, substituting that stratum's finite-batch mean squared residual for $`m_i`$ makes these expressions exact finite-batch identities.) By the Cauchy-Schwarz inequality:

$$
V_{\text{uniform}} - V_{\text{optimal}} = \frac{C \sum_i m_i - \left(\sum_i \sqrt{m_i c_i}\right)^2}{N^2 B} \ge 0
$$

Equality holds **if and only if $`m_i / c_i`$ is constant across all items**. Efficiency gains therefore depend strictly on identifiable heterogeneity in residual second moment per unit audit cost; with homogeneous residuals and costs, optimal allocation reduces to uniform sampling. When clipping is active at $`\pi_{\min}`$ or $`1`$, constrained optimization is still no worse than feasible uniform policies, with the exact gain evaluated directly at the clipped primal objective.

Crucially, the same analysis exposes the exact variance penalty of model misspecification. If the allocation uses inaccurate residual estimates $`\hat{m}_i`$ and neither allocation is clipped, the excess variance relative to the true optimum is:

$$
V(\hat{\pi}) - V(\pi^*) = \frac{1}{N^2 B} \left[ \left( \sum_i \sqrt{\hat{m}_i c_i} \right) \left( \sum_i \frac{m_i \sqrt{c_i}}{\sqrt{\hat{m}_i}} \right) - \left( \sum_i \sqrt{m_i c_i} \right)^2 \right] \ge 0
$$

Severely underestimating $`\hat{m}_i`$ in any region of the task space inflates the penalty through the $`\sqrt{\hat{m}_i}`$ denominator. Enforcing a positive sampling floor $`\pi_{\min}`$ caps this worst-case blowup, while mixing active and uniform probabilities via the budget-preserving defensive convex combination:

$$
\pi_i(\rho) = (1 - \rho)\hat{\pi}_i + \rho p
$$

allows the shrinkage weight $`\rho \in [0, 1]`$ to be tuned across independent calibration batches (*[Robust Sampling for Active Statistical Inference](https://arxiv.org/html/2511.08991v1)*).

## 5 Allocate review by expected loss reduction

Whereas statistical auditing seeks to *measure* population quality with minimum variance, operational review seeks to *remove defects* from the current batch before training handoff. For task $`i`$ under handling action $`a`$ (e.g., accept directly, route to peer review, escalate to expert adjudication, or request contributor revision), let $`r_{ia}`$ be the expected error loss remaining *after* the action, $`d_{ia}`$ its operational cost, and $`t_{iaj}`$ the time required from specialist $`j`$ (measured via platform and Hubstaff telemetry). Binary assignment decisions $`z_{ia} \in \{0, 1\}`$ solve:

$$
\min_{z} F(z) = \sum_{i,a} z_{ia}(r_{ia} + \eta d_{ia}) \quad \text{s.t.} \quad \sum_a z_{ia} = 1, \quad \sum_{i,a} z_{ia} t_{iaj} \le H_j \quad \forall j
$$

where $`H_j`$ is available specialist time and $`\eta \ge 0`$ converts resource cost to the scale of error loss (*[DeCCaF: capacity constraints and global assignment](https://arxiv.org/html/2403.06906v1)*).

When review costs are equal and each reviewed task consumes one slot, **the optimal priority ranking is by marginal remediation gain $`\Delta_i = r_{i0} - r_{i1}`$, not by initial risk $`r_{i0}`$**. Missing external evidence may make a high-risk task difficult to repair through one additional review ($`\Delta_i`$ small), whereas a self-contained calculation error in a moderate-risk task can be completely eliminated ($`\Delta_k`$ large). Moving a single review slot from task $`i`$ to task $`k`$ changes total expected loss by:

$$
\Delta F = (r_{i0} + r_{k1}) - (r_{i1} + r_{k0}) = \Delta_i - \Delta_k
$$

Whenever $`\Delta_k > \Delta_i`$, the exchange strictly reduces delivered defect loss, regardless of the tasks' initial risk ordering.

We can also state the exact calibration precision required of the action-risk estimators. Suppose $`|\hat{r}_{ia} - r_{ia}| \le \delta`$ for every feasible action, costs and capacities are known, and $`\hat{z}`$ minimizes the predicted objective $`\hat{F}(z)`$. Relative to the true optimal feasible assignment $`z^*`$:

$$
F(\hat{z}) \le \hat{F}(\hat{z}) + N\delta \le \hat{F}(z^*) + N\delta \le F(z^*) + 2N\delta
$$

This bound identifies *post-action residual loss* $`r_{ia}`$ as the critical empirical calibration target, motivating randomized pilot trials across permitted review actions.

Finally, both budgets—remediation and statistical measurement—combine into a single batch-level **Mixed-Integer Convex Program (MICP)**. Let $`\tau^2`$ be the target variance ceiling for the quality estimate, $`B_{\text{total}}`$ the combined cost budget, and $`V_{\hat{m}}(\pi) = N^{-2}\sum_i (1 - \pi_i)\hat{m}_i / \pi_i`$ the planning variance under the calibrated residual model:

$$
\min_{z, \pi} \sum_{i,a} z_{ia}\hat{r}_{ia} \quad \text{s.t.} \quad \sum_{i,a} z_{ia} d_{ia} + \sum_i c_i \pi_i \le B_{\text{total}}, \quad V_{\hat{m}}(\pi) \le \tau^2
$$

$$
\sum_a z_{ia} = 1, \quad z_{ia} \in \{0, 1\}, \quad \sum_{i,a} z_{ia} t_{iaj} \le H_j^{\text{review}} \ \forall j, \quad \pi_{\min} \le \pi_i \le 1
$$

Here $`H_j^{\text{review}}`$ is hard capacity allocated to remediation actions while reference audits are scheduled independently on frozen original submissions. The precision ceiling is model-based: independent audits must check residual calibration, and expected audit cost does not impose a hard limit on realized audit hours. Infeasibility exposes a conflict between the planning precision target, feasible review assignments, and available engineering budget.

## 6 Reproducible experiments at equal cost

The following self-contained synthetic experiments test the mathematical mechanisms derived above (they validate algorithmic behavior on specified public parameters rather than reporting proprietary client telemetry). A fixed batch contains $`N = 10,000`$ submissions partitioned into three strata of $`6,000`$, $`3,000`$, and $`1,000`$ items, containing $`60`$, $`300`$, and $`350`$ errors respectively (true batch defect rate $`\mu = 7.10\%`$). Unit audit costs are $`1`$, $`1.5`$, and $`3`$ units across the three strata. Every policy operates under an expected audit budget of $`B = 2,000`$ units and a minimum sampling floor of $`\pi_{\min} = 3\%`$.

Risk predictions for the three strata are $`2\%`$, $`8\%`$, and $`30\%`$ (batch average $`6.60\%`$, differing from the true defect rate by $`0.50`$ percentage points). Cost-aware allocation uses the true within-stratum mean squared residuals (ideal calibration), while the misspecified policy reverses the residual ordering across strata. Holding predictions, budget, and submissions fixed, $`200,000`$ independent Monte Carlo repetitions verify the analytical variance formulas:

<table header-row="true">
<tr><td>Audit Policy</td><td>Sampling Probabilities Across the Three Strata</td><td>Std. Dev. of Corrected Estimate (pct. points)</td><td>Variance Change Relative to Uniform Sampling</td></tr>
<tr><td>**Uniform sampling with the same residual correction**</td><td>14.81% / 14.81% / 14.81%</td><td>0.568</td><td>Baseline</td></tr>
<tr><td>**Prioritize predicted error probability ($`f_i`$)**</td><td>3.00% / 11.56% / 43.33%</td><td>0.657</td><td>+33.77% increase</td></tr>
<tr><td>**Residual- and cost-aware allocation with ideal calibration**</td><td>7.89% / 19.37% / 21.84%</td><td>**0.515**</td><td>**-17.79% reduction**</td></tr>
<tr><td>**Misspecified residual ordering (reversed)**</td><td>23.00% / 11.77% / 3.00%</td><td>0.983</td><td>+199.66% increase</td></tr>
<tr><td>**Misspecified allocation with 70% weight on uniform sampling**</td><td>17.27% / 13.90% / 11.27%</td><td>0.615</td><td>+17.07% increase</td></tr>
</table>

Under ideal residual calibration, the standard deviation of the population quality estimate falls by **9.33%** (a **17.79% variance reduction**). Notice that for the naive high-risk-first policy, the uncorrected raw error detection rate averages **19.60%** (wildly distorting true quality), whereas our IPW residual-corrected estimator recovers **7.1015%** while exposing that naive risk-prioritization actually *inflates* estimation variance by **33.77%** due to over-sampling the expensive third stratum. Across all five policies, Monte Carlo variances match analytical formulas to within $`0.5\%`$.

A separate, exact allocation experiment isolates remediation gains. Two task groups contain $`100`$ items each, with initial error risks of $`0.40`$ and $`0.15`$. Additional review reduces those risks to $`0.30`$ ($`\Delta_1 = 0.10`$) and $`0.01`$ ($`\Delta_2 = 0.14`$), respectively. Review costs are equal and capacity is $`100`$ items. Ranking by initial risk leaves $`100(0.30) + 100(0.15) = 45`$ expected errors; ranking by expected loss reduction ($`\Delta_i`$) leaves $`100(0.40) + 100(0.01) = 41`$ expected errors—cutting expected defect loss by **8.89%** at the exact same review volume.

## 7 Establish whether the design improves production

Production deployment tests statistical quality inference and operational defect control separately, recognizing that *detecting more errors in a targeted queue is never, by itself, evidence of better delivered quality*:
1. **Inferential Validation on Frozen Adjudicated Batches**: Compare uniform sampling, legacy high-risk routing, cost-aware residual allocation, and defensive mixtures against complete independent adjudication—evaluating bias, MSE, and interval coverage across individual task strata and rubric versions.
2. **Capacity-Matched Remediation Trials**: Compare legacy tiered rules against marginal-gain ($`\Delta_i`$) action allocation at equal total specialist hours, measuring severe defects surviving into final post-training corpora and total fully-loaded cost per accepted submission.

The contributor reliability records, tiered review workflows, and random reference audits I established from September 2023 provided the operational foundation for this architecture. The mathematical analysis above states the sampling, calibration, and capacity assumptions under which quality estimation is unbiased and audit allocation is optimal when residual second moments are correctly specified; the synthetic benchmarks test those mechanisms under their stated conditions.

# Project 02: task-validity-in-financial-synthetic-data

**Article Title**
Task validity in financial synthetic data

**Organization**
Duke University × Top-Tier Foundation Model Company

**Title**
Financial Task Design and Synthetic Data Engineering

**URL**
https://www.theodoreoy.com/past-experience/artificial-intelligence/task-validity-in-financial-synthetic-data/

**Position**
Researcher

**Location**
Durham, NC; Palo Alto, CA

**Dates**
September 2023 – September 2026

**Read More Label**
Read More

## Summary

Initiated in September 2023 for a frontier foundation model program *(partner identity anonymized under NDA)*, this project defined what constitutes high-signal financial post-training data and established an end-to-end paradigm for adversarial task design, constraint-preserving synthetic data engineering, and structured preference supervision. To expose subtle reasoning blind spots where base models and practitioners systematically stumble, I engineered diagnostic, error-inducing financial decision tasks and a five-level pairwise preference protocol that translates doctoral- and CFA-level expert judgments into evidence-grounded training signals for RLHF and direct preference optimization. I paired these task specifications with a four-regime mathematical synthesis architecture—Gaussian copulas for cross-sectional corporate fundamentals, covariance-weighted affine projections enforcing exact accounting identities ($1.21 \times 10^{-14}$ maximum residual across 200,000 12-dimensional draws), CTGAN and TabDDPM for multimodal tables, with Lipschitz margin checks and Gaussian margin-to-noise ($\gamma/s$) analysis to guide label recomputation, and SDEs, neural SDEs, and Brownian bridges with strict temporal filtration isolation ($\mathcal{F}_s$) for continuous-time price and interest-rate trajectories. To bridge research design and massive vendor scale-up, I created **Batch Zero**—an independent execution and calibration gate subsequently adopted across the company for new post-training tracks.

## Confidentiality & Scope Disclosure

Conducted through a university–industry research collaboration with a flagship foundation model developer. While the corporate partner's name is withheld pursuant to non-disclosure agreements, my role, project scope, organizational protocols (*Batch Zero*), and mathematical synthesis frameworks are authorized for public disclosure.

## Key Contributions

* **Defined the Financial Post-Training Task Environment & Adversarial Diagnostic Paradigm (Sept 2023)**: Led financial and business decision task design for a frontier foundation model program, specifying capability taxonomies, primary evidence standards, input schemas, decisive variables, and acceptance conditions. Rather than authoring routine textbook prompts, I deliberately engineered **error-inducing diagnostic cases** targeting high-risk business decision boundaries where base models and practitioners systematically stumble—ensuring every task required genuine doctoral- or CFA-level domain judgment.
* **Architected the Five-Level Pairwise Preference Protocol for RLHF / DPO Supervision**: To convert tacit human domain expertise into actionable post-training gradients, I designed a structured **five-level pairwise preference protocol** that captures *why* an expert judges one response superior to another. By requiring experts to bind every preference judgment to verifiable evidence citations, accounting rules, and decisive variables, the protocol transformed subjective expert comparisons into high-signal preference data that teaches models which financial judgments are evidence-backed.
* **Principled Four-Regime Financial Synthetic Data Engineering**: Selected and customized mathematical synthesis engines around the exact structural relationships each financial task had to preserve, avoiding naive one-size-fits-all tabular generation:
  * *Cross-Sectional Corporate Fundamentals*: Applied **Gaussian and vine copulas alongside conditional sampling** across company scale, operating vintage, and financial ratios to preserve joint cross-column dependencies and prevent unrealistic column-independent random generation.
  * *Hard Accounting Identities, Ratio Bounds & Chronological Order*: Deployed **constrained sampling, variable transformations, and covariance-weighted affine manifold projections** to enforce exact balance-sheet/cash-flow identities, ratio ranges, and date ordering—achieving a maximum constraint residual of **$1.21 \times 10^{-14}$** across 200,000 12-dimensional synthetic draws. A separate standardized-residual rejection model yields a $0.0002529\%$ acceptance rate.
  * *Multimodal & Mixed Numerical/Categorical Records*: Utilized **CTGAN and TabDDPM** to model multimodal empirical distributions, paired with mandatory post-generation business rule validation and Lipschitz margin checks and Gaussian margin-to-noise ($\gamma/s$) analysis to guide reference recomputation and reduce stale supervision labels.
  * *Continuous-Time Price & Interest-Rate Trajectories*: Developed dynamic paths for temporal financial tasks (as distinct from static cross-sectional company comparisons) using **stochastic differential equations (SDEs), neural SDEs, Brownian bridges, and stochastic interpolation** (extending MathWorks-style stochastic interest-rate path constructions), matching each construction to the task's permitted filtration ($\mathcal{F}_s$) to prevent future-information evaluation leakage.
* **Created the "Batch Zero" Pre-Scaling Execution Gate (Adopted Company-Wide)**: Before scaling task families to external vendor production, I created **Batch Zero**—a pilot verification protocol in which doctoral-level specialists independently executed task construction, synthetic expansion, reference solving, and pairwise preference grading. Pilot disagreements and failure modes directly drove instruction revisions, boundary-case refinements, and **Batch One** entry criteria. The foundation model company subsequently adopted **Batch Zero** as a standard organizational gate across other new post-training tracks.
* **Quantified Stale-Label Corruption, Temporal Leakage & Family Clustering**: Proved analytically and via simulation how synthetic perturbations near decision boundaries cause **40.13%** inherited-label error at $\gamma/s = 0.25$ without recomputation, how undisclosed Brownian bridge endpoint conditioning creates an artificial **29.29% RMSE reduction** via future leakage, and how within-family correlation ($\rho = 0.5$) reduces 2,000 nominal synthetic variants across 100 families to **$N_{\text{eff}} \approx 190.48$** effective independent observations.

## Architectural Context: Why Frontier Financial Post-Training Requires Diagnostic Traps & Manifold-Exact Synthesis

In September 2023, frontier foundation models could already recite corporate finance definitions, yet they failed unpredictably on real-world financial workflows where small numerical shifts or accounting footnotes reverse an investment recommendation. Our architecture solved two foundational challenges in post-training data engineering:
1. **Why We Engineer "Error-Prone" Prompts**: Easy prompts may yield less discriminative comparisons between candidate responses. By designing prompts specifically around subtle business failure modes—such as covenant breaches, off-balance-sheet adjustments, or near-boundary valuation spreads—we force reasoning errors into the open. Pairing these diagnostic prompts with our five-level pairwise preference protocol translates a specialist's domain intuition (*"Response A is superior because it isolates the working-capital constraint and cites Footnote 4"*) into structured preference supervision that directly steers post-training.
2. **Matching the Mathematical Generator to the Financial Structure**: Generating synthetic financial data is fundamentally different from generating synthetic images or unconstrained text. If a synthetic corporate table violates Total Assets $=$ Total Liabilities $+$ Equity by even a fraction of a percent, or if a synthetic interest-rate trajectory leaks future terminal rates into a historical forecasting prompt, the resulting training data actively corrupts model reasoning. Sections I–VI below establish the complete mathematical framework we built to guarantee constraint validity, label stability, and filtration integrity across scaled synthetic production.

## Manuscript

## 1 Why better distributional fit may leave task validity unchanged

Modern tabular generative models address distinct distributional challenges: **[CTGAN](https://arxiv.org/abs/1907.00503)** handles mixed discrete-continuous types, multimodality, and class imbalance via mode-specific normalization and conditional vectors, while **[TabDDPM](https://proceedings.mlr.press/v202/kotelnikov23a.html)** applies Gaussian and multinomial diffusion to numerical and categorical fields (*[CTGAN](https://arxiv.org/abs/1907.00503); [TabDDPM](https://proceedings.mlr.press/v202/kotelnikov23a.html)*). However, while both learn empirical distributions effectively, **financial task validity requires strict structural invariants that global distributional similarity metrics cannot enforce**: exact accounting identities, chronological ordering of fiscal periods, covenant applicability conditions, and logical consistency between numerical inputs and reference judgments.

Consider a failure mode that admits an exact mathematical proof. Valid financial inputs $`x \in \mathbb{R}^d`$ must satisfy $`m`$ linear accounting or ratio identities $`Ax = b`$, where $`A \in \mathbb{R}^{m \times d}`$ has full row rank. The valid population distribution $`P`$ is supported entirely on the affine subspace $`M = \{x \in \mathbb{R}^d : Ax = b\}`$ and has finite second moments. Let the columns of $`N \in \mathbb{R}^{d \times m}`$ form an orthonormal basis for the normal space orthogonal to $`M`$. Suppose a generative model captures $`P`$ tangential to the manifold but adds a tiny amount of independent noise in the normal directions: $`X_\sigma = X + \sigma N \varepsilon`$, where $`\varepsilon \sim \mathcal{N}(0, I_m)`$ is independent of $`X \sim P`$. Writing the generated distribution as $`Q_\sigma`$, we have for every $`\sigma > 0`$:

$$
W_2(P, Q_\sigma) \le \sqrt{E\|X_\sigma - X\|^2} = \sigma \sqrt{m} \longrightarrow 0 \quad (\text{as } \sigma \to 0^+)
$$

$$
P(M) = 1, \qquad Q_\sigma(M) = 0
$$

$$
\|P - Q_\sigma\|_{\text{TV}} := \sup_B |P(B) - Q_\sigma(B)| = 1
$$

The first line follows from the coupling $`(X, X_\sigma)`$ constructed on the same probability space. The second follows because $`AN`$ is invertible and a continuous $`m`$-dimensional Gaussian vector equals zero with probability zero. The third follows by taking the Borel set $`B = M`$. Thus, **the 2-Wasserstein distance $`W_2(P, Q_\sigma)`$ can converge to zero while the acceptance rate under exact business constraints remains identically zero ($`Q_\sigma(M) = 0`$) and Total Variation distance remains at its maximum of $`1`$**.

This counterexample dictates how responsibilities must be partitioned in a production synthetic data architecture (*[SDV constraint-augmented generation](https://docs.sdv.dev/sdv/modeling/constraint-augmented-generation-cag)*):
• **Copula models and conditional sampling** capture cross-sectional rank and tail dependencies across continuous corporate indicators (company scale, operating history, leverage, and margin ratios) so columns are never generated independently.
• **[CTGAN](https://arxiv.org/abs/1907.00503) and [TabDDPM](https://proceedings.mlr.press/v202/kotelnikov23a.html)** model complex mixed-type and multimodal empirical distributions, followed by explicit business-rule validation.
• **Deterministic variable transformations and manifold projections** enforce hard accounting equalities, ratio bounds, and chronological sequences exactly.

## 2 Enforce business constraints while preserving the correct conditional distribution

Enforcing hard constraints by generating unconstrained candidates and discarding violations (post-hoc rejection sampling) becomes computationally intractable as multiple financial constraints tighten simultaneously. Suppose a candidate draw has $`m`$ standardized constraint residuals that behave as independent standard normal variables, and each must lie within a tight tolerance $`[-\epsilon, \epsilon]`$. The acceptance probability and expected candidate draws required per valid input are:

$$
\alpha_m(\epsilon) = [2\Phi(\epsilon) - 1]^m \sim \left( \sqrt{\frac{2}{\pi}} \epsilon \right)^m \quad (\epsilon \to 0^+), \qquad E[N_{\text{attempts}}] = \frac{1}{\alpha_m(\epsilon)}
$$

Each additional accounting or ratio constraint multiplies the expected candidate count. Setting each tolerance to $`\epsilon = 0.05`$ residual standard deviations yields the following exact analytical scaling:

<table header-row="true">
<tr><td>Simultaneous Constraints ($`m`$)</td><td>Rejection Sampling Acceptance Rate $`\alpha_m(\epsilon)`$</td><td>Expected Candidate Draws per Valid Input</td></tr>
<tr><td>**1**</td><td>3.9878%</td><td>25.08</td></tr>
<tr><td>**2**</td><td>0.1590%</td><td>628.84</td></tr>
<tr><td>**4**</td><td>**0.0002529%**</td><td>**395,442.59**</td></tr>
</table>

Generating directly through the degrees of freedom permitted by the constraints eliminates these wasted draws. In the linear Gaussian regime, covariance-weighted affine projection also preserves the exact theoretical conditional distribution. For a Gaussian copula, this result applies only when the constraints are affine in its latent Gaussian coordinates; nonlinear marginal transformations do not generally preserve affine constraints in the observed financial variables. Let the initial unconstrained draw be $`Z \sim \mathcal{N}(\mu, \Sigma)`$ with $`\Sigma \succ 0`$. Rather than overwriting a single balance-sheet line item (which corrupts covariance structure), we apply a **covariance-weighted Mahalanobis projection**:

$$
X = \arg\min_{x : Ax = b} \frac{1}{2}(x - Z)^\top \Sigma^{-1}(x - Z) = Z + K(b - AZ), \qquad K = \Sigma A^\top (A \Sigma A^\top)^{-1}
$$

The first-order Lagrangian stationarity condition is $`\Sigma^{-1}(X - Z) + A^\top \lambda = 0`$; substituting $`AX = b`$ and eliminating the multiplier $`\lambda`$ yields the closed-form update. Since $`AK = I_m`$, every draw satisfies $`AX = b`$ exactly, with mean and covariance:

$$
E[X] = \mu + K(b - A\mu)
$$

$$
\operatorname{Cov}(X) = (I - KA)\Sigma(I - KA)^\top = \Sigma - \Sigma A^\top (A \Sigma A^\top)^{-1} A\Sigma
$$

Because an affine transformation preserves Gaussianity, these moments match the exact regular conditional Gaussian law of $`Z \mid AZ = b`$ (*[Majumdar and Majumdar on Gaussian distributions under linear conditioning](https://arxiv.org/abs/1710.09285)*).

In our synthetic verification benchmark, generating **200,000 synthetic 12-dimensional financial vectors under 4 simultaneous linear constraints** achieved a **maximum absolute constraint residual of $`1.21 \times 10^{-14}`$** and a **relative Frobenius covariance error of 0.662%** against the theoretical conditional covariance—using direct constrained draws without post-hoc rejection. The nearly 400,000 candidate count above belongs to the separate standardized-residual rejection model. Fields fully determined by accounting definitions are computed analytically; range bounds and chronological date orderings that admit bijective transformations (such as log-transforms or positive increments $`t_{k} = t_{k-1} + \exp(\xi_k)`$) are enforced in latent generation space.

## 3 Use decision margins to determine when reference judgments must be recomputed

Synthetic expansion of a golden financial case often preserves the qualitative business narrative while perturbing decisive financial figures, covenant thresholds, or macroeconomic inputs. **Retaining the original golden-case reference answer after perturbing the numbers injects systematic label corruption into post-training**, even when every synthetic input satisfies all accounting constraints. Just as *[FinQA](https://aclanthology.org/2021.emnlp-main.300/)* pairs financial questions with executable reasoning programs, synthetic preference engineering requires the link between inputs, reference conclusions, and expert preference explanations to update dynamically (*[FinQA](https://aclanthology.org/2021.emnlp-main.300/)*).

Consider a formal decision rule for choosing between two corporate actions. Let $`d(x)`$ denote the net valuation or metric advantage of Action A over Action B, so the true reference decision is $`\operatorname{sign} d(x)`$. If $`d`$ is $`L`$-Lipschitz on a feasible neighborhood, a sufficient condition for retaining the original reference decision without recomputation is that the perturbation $`\Delta`$ remains strictly within the decision margin:

$$
|d(x + \Delta) - d(x)| \le L\|\Delta\|, \qquad |d(x)| > L\|\Delta\| \implies \operatorname{sign} d(x + \Delta) = \operatorname{sign} d(x)
$$

Because our diagnostic tasks deliberately target **contested decision boundaries** where models are most prone to error, $`|d(x)|`$ is intentionally small! We can derive the exact closed-form rate of **stale-label error** for a linear comparison rule $`d(x) = w^\top x - c`$ with initial margin $`\gamma = d(x) > 0`$. Under a feasible manifold perturbation $`\Delta \sim \mathcal{N}(0, \Omega)`$ with projected variance $`s^2 = w^\top \Omega w > 0`$, the probability that retaining the original decision reverses the true ground-truth label is:

$$
\Pr\{d(x + \Delta) < 0\} = \Pr\{w^\top \Delta < -\gamma\} = \Phi\left(-\frac{\gamma}{s}\right)
$$

Verified across $`1,000,000`$ Monte Carlo draws:
• When the margin-to-noise ratio $`\gamma / s = 2`$, the inherited-label error rate is **2.28%**.
• When $`\gamma / s = 1`$, the inherited-label error rate jumps to **15.87%**.
• Near diagnostic decision boundaries where $`\gamma / s = 0.25`$, **40.13% of retained labels are false!**

This analytical result explains why our pipeline links case expansion directly to reference recomputation and fresh **five-level pairwise preference grading** (see the later methodological comparison in *[HelpSteer2-Preference](https://arxiv.org/abs/2410.01257)*). Whenever a synthetic perturbation crosses or approaches a decision boundary, the reference solution is recomputed, fresh candidate model trajectories are sampled, and domain experts evaluate the pair on our five-level preference scale—explicitly annotating which trajectory identified the flipped decisive variable and supported its judgment with primary evidence.

## 4 Define the information available for each temporal task

While cross-sectional corporate comparisons do not require continuous-time stochastic processes, dynamic financial tasks—such as derivatives valuation, interest-rate term-structure interpolation, and multi-period liquidity stress testing—require path generators. In these temporal regimes, we deploy **stochastic differential equations (SDEs)** and **neural SDEs** to model path distributions beyond single-time marginals (*[Neural SDEs as Infinite-Dimensional GANs](https://proceedings.mlr.press/v139/kidger21b.html)*), alongside **Brownian bridges** and **stochastic interpolation** (aligning with classical MathWorks stochastic interest-rate path constructions) when conditioning on known intermediate observations or endpoints.

However, path conditioning introduces a severe **temporal evaluation leakage hazard** whose magnitude can be derived in closed form. Consider a scaled Brownian motion $`X_u = \sigma W_u`$ over $`s < t < T`$. Under squared error loss, the optimal squared-error predictor acting at time $`s`$ with access only to the historical filtration $`\mathcal{F}_s`$ has conditional mean squared error $`\sigma^2(t - s)`$. If a synthetic pipeline conditions path generation on the future terminal endpoint $`X_T`$ and inadvertently exposes that conditioned structure to a forecasting task, Gaussian conditioning gives (*[Pitman on the Brownian bridge](https://www.stat.berkeley.edu/~pitman/s205s03/b_bridge.pdf)*):

$$
\operatorname{Var}(X_t \mid \mathcal{F}_s) = \sigma^2(t - s)
$$

$$
\operatorname{Var}(X_t \mid \mathcal{F}_s, X_T) = \sigma^2(t - s) - \frac{[\sigma^2(t - s)]^2}{\sigma^2(T - s)} = \sigma^2(t - s)\frac{T - t}{T - s}
$$

When $`t = (s + T)/2`$ is the midpoint of the forecasting horizon, conditioning on $`X_T`$ halves the conditional variance, producing an **apparent 29.29% reduction in RMSE** ($`1 - 1/\sqrt{2}`$) that is 100% attributable to future information leakage rather than model capability! (By contrast, if the task explicitly supplies both endpoints $`X_s`$ and $`X_T`$ and asks the model to audit an *interpolation* or back-cast an intervening accounting period, Brownian bridge conditioning is mathematically appropriate.)

Our task environment specification therefore enforces a strict separation across three information sets:
1. **Construction Information ($`\mathcal{F}_{\text{gen}}`$)**: Complete paths, terminal endpoints, or latent parameters used by the generator to synthesize the scenario.
2. **Permitted Predictor Filtration ($`\mathcal{F}_s`$)**: The exact historical information legally visible to the model at decision time $`s`$.
3. **Evaluation & Oracle Information ($`\mathcal{F}_{\text{eval}}`$)**: Realized post-$`s`$ outcomes reserved strictly for scoring or explicitly disclosed oracle baselines.

## 5 Test independent execution through Batch Zero and retain the task family as a statistical unit

Even when constraint projections, decision-margin recomputations, and filtration rules are mathematically sound, a post-training specification must remain reproducible when executed by hundreds of external specialists. To solve this organizational scaling bottleneck, I created **Batch Zero**:
• **The Batch Zero Protocol**: Prior to launching scaled vendor production (*Batch One*), a select cohort of doctoral-level domain specialists with proven delivery records independently executed the entire specification—authoring seed cases, running synthetic expansions, verifying reference solutions, and assigning five-level pairwise preference scores. Every failed case or inter-expert disagreement in Batch Zero triggered surgical revisions to prompt instructions, boundary definitions, and calibration rubrics. Following the pilot’s use in preparing external vendor workflows, **the partner foundation model company adopted Batch Zero as a standard pre-scaling gate across other new post-training tracks**.

Simultaneously, our statistical governance prevents **synthetic sample-size overstatement**. Suppose $`G`$ independent golden-case families are each expanded into $`k`$ synthetic variants ($`Gk`$ nominal records), where any two variants within a family share correlation $`\rho`$ and common variance $`\sigma_Y^2`$. Expanding the covariance sum for the sample mean yields the exact **effective sample size** $`N_{\text{eff}}`$:

$$
\operatorname{Var}(\bar{Y}) = \frac{Gk\sigma_Y^2 + Gk(k - 1)\rho\sigma_Y^2}{(Gk)^2} = \frac{\sigma_Y^2}{Gk}[1 + (k - 1)\rho] \implies N_{\text{eff}} = \frac{Gk}{1 + (k - 1)\rho}
$$

With $`G = 100`$ independent families, $`k = 20`$ synthetic variants per family ($`2,000`$ nominal tasks), and within-family correlation $`\rho = 0.5`$, **the nominal 2,000 records provide the exact same statistical precision for the mean as just $`190.48`$ independent records**—and ignoring within-family correlation understates standard errors by a factor of **$`3.24\times`$**! Consequently, our production pipeline enforces strict family-level train/evaluation splits and computes all confidence intervals with family-level and expert-level hierarchical clustering.

## 6 Establish whether the complete method justifies scaled production

To evaluate whether our constraint-preserving synthesis and preference architecture justifies scaled production, we hold the task mix, generator training budget, expert review budget, and final acceptance criteria fixed, introducing each methodological layer in staged blind comparisons evaluated across independent task families:

<table header-row="true">
<tr><td>Comparison Stage</td><td>Methodological Upgrade Introduced</td><td>Core Research & Production Question</td></tr>
<tr><td>**Existing production baseline**</td><td>Unconstrained generation + manual expert review & rework</td><td>What is the true fully-loaded cost per finally accepted, valid case?</td></tr>
<tr><td>**Add manifold-constrained generation**</td><td>Fix generator; enforce affine projections & variable transforms</td><td>Do invalid candidates and manual expert repairs drop while preserving conditional distributions?</td></tr>
<tr><td>**Add margin-aware reference recomputation**</td><td>Recompute reference judgments when the sufficient Lipschitz margin check fails; use $`\gamma/s`$ to quantify Gaussian label-flip risk</td><td>Do stale-label errors decline, producing valid supervision on both sides of decision boundaries?</td></tr>
<tr><td>**Apply complete Batch Zero & filtration criteria**</td><td>Jointly check $`\mathcal{F}_s`$ timing conditions and independent execution</td><td>Do post-training gains persist after excluding leakage and clustering by source family?</td></tr>
</table>

Because raw acceptance rates reward generating trivial variants of easy templates, and raw generation speed ignores manual expert repair costs, we govern production decisions via **Scenario-Weighted Family Coverage Efficiency**. Let $`j`$ index predefined cells in the financial capability matrix with strategic weights $`w_j \ge 0`$ ($`\sum_j w_j = 1`$) and required independent valid family counts $`n_j^* > 0`$:

$$
\operatorname{Coverage} = \sum_j w_j \min\left(1, \frac{n_j^{\text{valid}}}{n_j^*}\right), \qquad \operatorname{Efficiency} = \frac{\operatorname{Coverage}}{C_{\text{generation}} + C_{\text{review}} + C_{\text{rework}} + C_{\text{adjudication}}}
$$

Once a cell reaches its target $`n_j^*`$ independent families, repeatedly expanding easy templates yields zero marginal coverage gain (*[Alaa et al. on synthetic data evaluation](https://proceedings.mlr.press/v162/alaa22a.html)*). Together, manifold constraint enforcement, decision-margin label recomputation, temporal filtration isolation, and **Batch Zero** calibration establish a rigorous engineering standard for synthetic preference data in frontier model post-training.

# Project 03: verification-and-supervision-in-scientific-reasoning-tasks

**Article Title**
Verification and supervision in scientific reasoning tasks

**Organization**
Duke University × Top-Tier AI Research Lab

**Title**
Scientific Reasoning Evaluation and Task Design

**URL**
https://www.theodoreoy.com/past-experience/artificial-intelligence/verification-and-supervision-in-scientific-reasoning-tasks/

**Position**
Researcher

**Location**
Durham, NC; Palo Alto, CA

**Dates**
September 2023 – September 2026

**Read More Label**
Read More

## Summary

Launched in September 2023 through an early academic collaboration with a frontier AI research laboratory *(partner identity anonymized under NDA)*, this work developed a three-pillar evaluation and process-supervision framework for scientific, mathematical, and quantitative risk reasoning. Recognizing in our earliest experiments that simply stumping frontier models on Olympiad- or graduate-level STEM final answers yields minimal actionable feedback for model iteration, I built an acceptance and diagnostic architecture that audits **(1) Chain-of-Thought (CoT) trajectory soundness** via acyclic proof-obligation dependency graphs ($\Gamma_q \vdash C_q$), **(2) strict compliance in sandboxed tool invocation** (requiring execution within auditable enterprise toolkits such as Excel rather than unauthorized Python virtual machines in regulated workflows, and rejecting numerically correct answers obtained via non-compliant tools), and **(3) structural mathematical reduction over brute-force computation**. In an exact-arithmetic stress test of 3,600 constructed submissions across 600 strongly convex quadratic problem families, semantic certificate verification accepted all **1,200 valid submissions (0.0% false rejection, preserving valid alternative Lagrangian and elimination proofs)** and rejected all **2,400 invalid submissions (0.0% false acceptance, compared to 75.0% false acceptance under answer-only checking)**.

## Confidentiality & Scope Disclosure

Conducted through an early university–industry research partnership with a frontier AI research laboratory beginning in September 2023. While the partner laboratory's name is withheld pursuant to non-disclosure agreements, my role, evaluation methodology, proof-obligation verification architecture, and exact-arithmetic stress tests are authorized for public disclosure.

## Key Contributions

* **Developed Three-Pillar Process and Tool Evaluation from September 2023**: During a university collaboration aimed at stress-testing frontier models with Olympiad- and graduate-level STEM tasks, I identified the limitations of final-answer checks in our workflow and developed an evaluation framework covering reasoning validity, compliance with task-specific tool policies, and structural mathematical insight.
  1. *Chain-of-Thought (CoT) Trajectory & Proof-Obligation Auditing*: Verifying whether intermediate reasoning steps follow a sound logical trajectory rather than reaching a lucky final number through compensating errors or unverified leaps.
  2. *Enterprise-Compliant Tool-Invocation Governance*: Auditing whether the model selects and executes tools strictly within regulatory and institutional compliance boundaries. When a task’s specified data-governance policy permits only the approved Excel environment, an unauthorized Python virtual machine violates that execution policy. Under our acceptance standard, **even if a model computes the exact right numerical answer, invoking a non-compliant tool (e.g., Python instead of mandated Excel) results in immediate failure**.
  3. *Penalizing Brute-Force Compute in Favor of Structural Mathematical Insight*: Designing tasks and scoring rubrics that discourage models from burning inference compute on brute-force algebraic or numerical exhaustion, rewarding instead the identification of domain invariants and structural reductions.
* **Translated Physics, Mathematics & Risk Engineering into Proof-Obligation DAGs**: Formalized task deliverables as directed acyclic dependency graphs ($\Gamma_q \vdash C_q$) that separate physical model formulation, theorem applicability, compliant tool execution, uniform approximation bounds, and conclusion strength—accommodating legitimate alternative proof paths (such as Lagrangian duality versus variable elimination) that brittle reference-matching pipelines falsely reject.
* **Derived Projected-Residual Optimality Certificates for Convex Optimization**: Formulated exact KKT projected-residual bounds ($0 \le f(x) - v^* \le \|P_{\ker A} r\|_2^2 / (2\mu)$) on the optimality gap for equality-constrained strongly convex quadratic programs, replacing heuristic numerical proximity checks with mathematical certificates of solution quality.
* **Engineered Original Kinematics Benchmarks via Path Invariance & Harmonic Asymptotics**: Created original physics and risk-engineering tasks that test deep structural reasoning—using the path invariance of vertical travel time to reduce a 2D kinematics problem to 1D horizontal scheduling, proving an attained minimum completion time and an unattained supremum, and deriving harmonic-number ($H_n$) asymptotics for staircase trajectories approaching the upper bound.
* **Quantified Biased Supervision Gradients & Task-Transformation Error Propagation**: Proved mathematically how false acceptance ($\alpha$) and false rejection ($\beta$) reverse model rankings on leaderboards and bias the binary cross-entropy training gradient of Process Reward Models ($E[\nabla_s \ell(s,V) - \nabla_s \ell(s,Z) \mid h] = p(h) - \tilde{p}(h)$), and derived exact tolerance propagation laws ($a\delta + 2\varepsilon$) under bijective task transformations.
* **Achieved 0.0% False Acceptance and 0.0% False Rejection Across 3,600 Exact-Arithmetic Stress Tests**: Constructed 600 strongly convex quadratic problem families (3,600 exact rational arithmetic submissions) where 75% of invalid proofs report the exact right optimal value $v^*$. Semantic certificate checking accepted all **1,200 valid proofs (0.0% false rejection)** and rejected all **2,400 invalid submissions (0.0% false acceptance)**, outperforming answer-only checking (**75.0% false acceptance**) and strict reference-path matching (**50.0% false rejection**).

## Architectural Context: From "Stumping Models on Final Answers" to Verifiable Trajectory & Tool Governance

The collaboration began in autumn 2023 with scientific-reasoning tasks for frontier models. Initial experiments in our workflow showed why final-answer matching was insufficient: a correct number could coexist with an invalid physical assumption, an unsupported computational shortcut, or a tool call that violated the task’s specified execution policy. Sections I–VII formalize the resulting acceptance architecture and relate it to subsequent process-evaluation research; the project start date does not imply that every later citation or mathematical formulation was part of the initial workflow.

## Manuscript

## 1 Correct final answers can conceal invalid reasoning and reverse model rankings

Checking only the final answer is appropriate only when that final value constitutes the entire deliverable. In scientific reasoning, quantitative finance, and risk engineering, the model formulation, theorem assumptions, compliant tool invocation, intermediate derivations, and conclusion must hold together. In the OlympiadBench and Omni-MATH samples later analyzed to construct *ProcessBench*, **32.2% and 51.8% of solutions with correct final answers still contained process errors** (*[ProcessBench, Section 3.3](https://arxiv.org/html/2412.06559v2)*). Answer checking and trajectory validity measure fundamentally different things.

Suppose problems and model trajectories are drawn from a target capability distribution. Let $`Z = 1`$ indicate that the complete solution (including reasoning steps and compliant tool execution) is valid, and let $`V = 1`$ indicate that the evaluation protocol passes it. For model $`m`$, let $`\theta_m = \Pr_m(Z = 1)`$ be its true validity rate, $`\alpha_m = \Pr_m(V = 1 \mid Z = 0)`$ its **false acceptance rate** on invalid solutions (e.g., passing a flawed proof, a brute-force guess, or a non-compliant Python tool call that yields the right number), and $`\beta_m = \Pr_m(V = 0 \mid Z = 1)`$ its **false rejection rate** on valid solutions (e.g., rejecting a valid alternative derivation). The law of total probability gives:

$$
(1) \qquad s_m = E_m[V] = \alpha_m + (1 - \alpha_m - \beta_m)\theta_m, \qquad s_m - \theta_m = \alpha_m(1 - \theta_m) - \beta_m\theta_m
$$

The first bias term $`\alpha_m(1 - \theta_m)`$ credits invalid trajectories; the second term $`-\beta_m\theta_m`$ penalizes valid ones. **Adding more benchmark problems reduces sampling variance in $`\hat{s}_m`$, but never removes the structural gap $`s_m - \theta_m`$**. Because different models exhibit different failure modes (e.g., one model adheres strictly to compliant tools and rigorous deduction, while another aggressively invokes unauthorized code interpreters or heuristic shortcuts), their $`\alpha_m`$ and $`\beta_m`$ can differ enough to **strictly reverse their leaderboard ranking**:
• In a concrete arithmetic scenario, suppose Model A and Model B have true validity rates of $`\theta_A = 72\%`$ and $`\theta_B = 64\%`$, respectively.
• If their invalid trajectories pass a final-answer check with probabilities $`\alpha_A = 4\%`$ and $`\alpha_B = 36\%`$ (while $`\beta_A = \beta_B = 0\%`$), their observed benchmark scores become **$`s_A = 73.12\%`$** and **$`s_B = 76.96\%`$**—ranking the less capable, shortcut-prone model higher!

While process supervision extends evaluation to intermediate steps (*[Let's Verify Step by Step, Sections 2 and 3](https://arxiv.org/html/2305.20050v1)*), the architecture formalized here addresses three practical requirements in scientific post-training: omissions in reference solutions, valid alternative proof methods, and strict enforcement of tool-compliance and structural-insight obligations defined *before* model responses are generated.

## 2 Define acceptance through proof obligations and allow valid alternative solutions

A complete task deliverable specifies its domain assumptions and environmental compliance constraints $`\Gamma_q`$, the target conclusion $`C_q`$, and the proof obligations required to establish it. A model trajectory $`\tau`$ may choose its own intermediate lemmas, coordinate representations, or order of deduction; acceptance depends strictly on whether it fulfills the obligations while obeying tool governance. Organizing the response as a directed acyclic dependency graph (DAG) $`G`$ yields the local soundness check for every node $`v_j`$ alongside the global tool-compliance predicate $`\mathcal{T}_{\text{comp}}(\tau) \in \{0, 1\}`$:

$$
(2) \qquad \Gamma_q \cup \{v_k : k \in \operatorname{pa}(j)\} \vdash v_j, \qquad \Gamma_q \cup \{v_j : j \in \operatorname{sink}(G)\} \vdash C_q, \qquad \mathcal{T}_{\text{comp}}(\tau) = 1
$$

Here $`\vdash`$ denotes valid derivability within the sound domain inference system, and $`\mathcal{T}_{\text{comp}}(\tau) = 1`$ certifies that every external tool invocation $`t \in \tau`$ belongs to the task's permitted compliance sandbox $`\mathcal{A}_q`$ (for instance, $`\mathcal{A}_q = \{\text{Excel Audited Workbook}\}`$ and $`\text{Python VM} \notin \mathcal{A}_q`$). If the root nodes follow from verified assumptions $`\Gamma_q`$, each dependency edge is sound, and $`\mathcal{T}_{\text{comp}}(\tau) = 1`$, structural induction over a topological ordering of $`G`$ establishes the complete conclusion from local checks.

In production implementation, I organized the central obligations around five verifiable gates:
1. **Valid Model Formulation**: Checking that physical, financial, or probabilistic state spaces are well-defined.
2. **Compliant Tool Selection ($`\mathcal{T}_{\text{comp}}(\tau) = 1`$)**: When a task’s specified data-governance policy permits only the approved Excel environment, trajectories that invoke an unauthorized Python virtual machine are rejected immediately ($`V = 0`$), even if the final numerical calculation is exact.
3. **Method Applicability & Uniform Error Control**: In physics tasks, pointwise convergence at a fixed parameter value does not establish that an approximation remains valid inside an optimization, an integral, or an exchange of limits. Authors and models must specify the approximation parameter, its domain of validity, and uniform error bounds before claiming an order of accuracy. In risk engineering, the corresponding obligations govern distributional and tail-dependence assumptions behind extreme-value bounds.
4. **Structural Insight vs. Brute-Force Penalization**: Obligations require identifying the governing mathematical invariant rather than exhausting finite grids via raw compute.
5. **First-Error Localization in Feedback**: Algebra that is locally correct under a false premise does not restore proof validity. Recording the first failed obligation node $`v_j`$ and marking its descendant subgraph $`\operatorname{desc}(v_j)`$ as unverified resolves the post-error ambiguity highlighted in *[ProcessBench, Section 3.1](https://arxiv.org/html/2412.06559v2)*.

## 3 Produce an error certificate as part of acceptance

An executable optimization subfamily illustrates how formal mathematical certificates replace brittle string matching. Consider the equality-constrained strongly convex quadratic problem:

$$
(3) \qquad v^* = \min_{Ax = b} f(x), \qquad f(x) = \frac{1}{2}x^\top H x + c^\top x, \qquad H \succeq \mu I, \quad \mu > 0
$$

where $`H`$ is symmetric, $`Ax = b`$ is feasible, and $`\mu > 0`$ is a verified lower bound on curvature. For any feasible candidate $`x`$ ($`Ax = b`$), choose any dual multiplier vector $`\nu`$ and define the stationarity residual $`r = Hx + c + A^\top \nu`$. Strong convexity gives the first inequality below for every feasible displacement $`d \in \ker A`$; completing the square in $`d`$ yields an exact **optimality error certificate**:

$$
(4) \qquad f(x + d) \ge f(x) + r^\top d + \frac{\mu}{2}\|d\|^2
$$

$$
\inf_{d \in \ker A} \left( r^\top d + \frac{\mu}{2}\|d\|^2 \right) = -\frac{\|P_{\ker A} r\|_2^2}{2\mu}
$$

$$
0 \le f(x) - v^* \le \frac{\|P_{\ker A} r\|_2^2}{2\mu}
$$

The operator $`P_{\ker A}`$ is the orthogonal projection onto the null space of feasible directions $`\ker A`$, removing residual components normal to the constraints that do not affect optimality along the feasible manifold (*[Boyd and Vandenberghe, Convex Optimization, Sections 5.5 and 9.1](https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf)*). A zero projected residual ($`P_{\ker A} r = 0`$) certifies exact optimality; otherwise, the certificate bounds the suboptimality gap in objective units:
• Solutions obtained via **Lagrange multipliers** or by **first eliminating the equality constraints** map seamlessly to the exact same semantic obligations and pass verification.
• Conversely, merely reporting the correct optimal value $`v^*`$ does not satisfy the certificate obligations: feasibility and the claimed objective value must be checked independently. If a submission asserts a KKT multiplier witness, the full stationarity equation $`Hx+c+A^\top\nu=0`$ must also be verified. The projected-residual bound alone cannot validate the claimed multiplier, because $`P_{\ker A}A^\top\nu=0`$ for every $`\nu`$; a valid equality-elimination proof need not submit such a witness.

Optimization certificates are one instance of our broader obligation design. In an original kinematics benchmark I created for the project, I used the **path invariance of vertical travel time** to reduce a 2D trajectory problem to 1D horizontal scheduling—separately proving an **attained minimum completion time**, an **unattained supremum**, and **harmonic-number ($`H_n = \sum_{k=1}^n k^{-1}`$) asymptotics** for a staircase path construction approaching the supremum. This benchmark demonstrates why feasibility, optimal bounds, structural reduction, and attainment require separate proof obligations even when a model guesses the final limiting value correctly.

## 4 Task expansion must propagate mathematical error

While symbolic templates (*[GSM-Symbolic, Section 3.1](https://arxiv.org/html/2410.05229v1)*) parameterize variable domains and answer formulas, scientific and engineering benchmarks also require verifiable laws governing how a transformation changes feasible sets, objective values, and acceptance tolerances.

Let the original problem and its transformed variant have feasible sets $`F`$ and $`F'`$ with objectives $`J`$ and $`J'`$ and finite infima $`v`$ and $`v'`$. Suppose the task designer verifies a bijection $`\Phi : F \to F'`$ satisfying the uniform bound for every feasible $`u \in F`$:

$$
(5) \qquad |J'(\Phi(u)) - aJ(u) - b| \le \varepsilon, \quad a > 0
$$

$$
av + b - \varepsilon \le v' \le av + b + \varepsilon
$$

$$
J(u) - v \le \delta \implies J'(\Phi(u)) - v' \le a\delta + 2\varepsilon
$$

Taking infima across the first line yields the second; subtracting the lower bound on $`v'`$ from the upper bound on $`J'(\Phi(u))`$ yields the third. This theorem answers an essential engineering question: after a unit conversion, parameter rescaling, or numerical transformation with bounded error $`\varepsilon`$, what acceptance tolerance must apply to a previously $`\delta`$-optimal solution? Retaining the raw tolerance $`\delta`$ can misclassify valid transformed solutions as model failures, while relaxing tolerances ad-hoc conceals genuine capability gaps. Moreover, when $`\varepsilon = 0`$, the bijection and positive scaling $`a > 0`$ preserve whether an optimum is attained; variants that alter boundary compactness or admissible control classes require fresh attainment proofs.

## 5 Label quality determines what post-training research optimizes

Granular step-level process labels improve post-training only if they measure true logical and compliance validity; systematic grading errors are directly absorbed by downstream Process Reward Models (PRMs) and RLHF policies. Let $`h`$ denote the problem and reasoning prefix through the current step, $`Z = 1`$ indicate true step validity under the problem's assumptions, and $`V \in \{0, 1\}`$ be the noisy acceptance label produced by the grader with conditional false acceptance $`\alpha(h)`$ and false rejection $`\beta(h)`$. Writing $`p(h) = \Pr(Z = 1 \mid h)`$, a process evaluator with logit $`s`$ trained via binary cross-entropy optimizes toward the corrupted conditional target:

$$
(6) \qquad \tilde{p}(h) = \alpha(h) + [1 - \alpha(h) - \beta(h)]p(h)
$$

$$
\frac{\partial \ell(s, V)}{\partial s} = \sigma(s) - V
$$

$$
E[\nabla_s \ell(s, V) - \nabla_s \ell(s, Z) \mid h] = p(h) - \tilde{p}(h)
$$

This expected gradient bias formula proves mathematically why naive evaluation pipelines damage post-training:
• **When false rejection dominates ($`\beta(h)p(h) > \alpha(h)[1-p(h)]`$)**: $`\tilde{p}(h) < p(h)`$, shifting the learned validity target downward and penalizing valid alternative proofs.
• **When false acceptance dominates ($`\alpha(h)[1-p(h)] > \beta(h)p(h)`$)**: $`\tilde{p}(h) > p(h)`$, shifting the learned validity target upward and rewarding flawed proofs or non-compliant tool calls. The two effects cancel in the conditional mean when their weighted contributions are equal.

Furthermore, while class-conditional noise correction (*[Learning with Noisy Labels, Sections 2 and 3](https://papers.nips.cc/paper_files/paper/2013/file/3871bd64012152bfb53fdf04b401193f-Paper.pdf)*) can unbias the mean estimate when $`\alpha, \beta`$ are known constants ($`\alpha + \beta < 1`$), it inflates estimation variance quadratically:

$$
(7) \qquad \hat{\theta}_{\text{corr}} = \frac{\bar{V} - \alpha}{1 - \alpha - \beta}, \qquad \operatorname{Var}(\hat{\theta}_{\text{corr}}) = \frac{\operatorname{Var}(\bar{V})}{(1 - \alpha - \beta)^2}
$$

For task families whose validity is exactly decidable by a sound and complete certificate verifier, $`\alpha=\beta=0`$ removes this noise-correction variance penalty. The zero observed error rates in the constructed stress test below do not establish zero population error on unrestricted scientific reasoning.

## 6 Reproducible stress tests for false acceptance and false rejection

To validate our certificate verifier reproducibly, I constructed **600 strongly convex quadratic task families** and generated **6 algebraic submissions per family (3,600 total submissions)** using **exact rational arithmetic**:
• **1,200 Valid Certificates (2 per family)**: One derived in Lagrangian multiplier form and one in equality-elimination form.
• **2,400 Controlled-Defect Submissions (4 per family)**: (1) An infeasible construction ($`Ax \neq b`$) yielding the exact optimal value $`v^*`$; (2) failed stationarity along a feasible direction in $`\ker A`$ while reporting $`v^*`$; (3) a claimed multiplier that fails the stationarity equation while reporting $`v^*`$; and (4) an incorrect final objective value. Crucially, the first three defect classes (1,800 submissions, or **75% of all invalid submissions**) report the exact right final answer $`v^*`$!

We benchmarked three deterministic acceptance protocols across all 3,600 submissions:

<table header-row="true">
<tr><td>Acceptance Protocol</td><td>False Acceptance Rate on Invalid Certificates ($`2,400`$)</td><td>False Rejection Rate on Valid Certificates ($`1,200`$)</td><td>Valid Share of Accepted Submissions</td></tr>
<tr><td>**Final-answer matching only**</td><td>**75.0%** (admits 1,800 flawed solutions)</td><td>0.0%</td><td>40.0%</td></tr>
<tr><td>**Strict reference path (ablation)**</td><td>0.0%</td><td>**50.0%** (rejects 600 valid elimination proofs)</td><td>100.0%</td></tr>
<tr><td>**Semantic certificate verification (Ours)**</td><td>**0.0%**</td><td>**0.0%**</td><td>**100.0%**</td></tr>
</table>

Within this exact-arithmetic benchmark, semantic certificate verification admitted **1,800 fewer invalid proofs** than final-answer matching and retained **600 more valid alternative solutions** than strict reference-path matching, while passing all 600 feasible-perturbation checks on the projected-residual bound in Equation (4).

## 7 Account for dependence within task families and the full cost of expert review

Generating surface variants of a single problem template does not yield independent observations of scientific capability. Across $`F`$ independent task families with $`K`$ variants per family, common marginal variance $`\sigma^2`$, and common pairwise within-family correlation $`\rho`$, the variance of the sample mean and effective sample size $`n_{\text{eff}}`$ are:

$$
(8) \qquad \operatorname{Var}(\bar{Z}) = \frac{\sigma^2}{FK}[1 + (K - 1)\rho], \qquad n_{\text{eff}} = \frac{FK}{1 + (K - 1)\rho}
$$

If $`F = 50`$ task families each have $`K = 8`$ variants ($`400`$ total responses) with $`\rho = 0.6`$, the $`400`$ responses provide the same precision as just **$`n_{\text{eff}} \approx 77`$ independent observations**—mandating family-level train/test partitioning and new combinations of physical and mathematical principles rather than superficial numerical templating.

Finally, full production cost accounting determines when automated certificate verification outperforms manual PhD review. Let $`C_0`$ be the upfront engineering cost of building the proof-obligation certificates and verifier, $`c_e`$ the legacy workflow's expert review cost per submission, $`c_v`$ the automated verifier's unit execution cost, and $`u`$ the fraction of submissions escalated to human adjudication. Once false acceptance and false rejection standards are met, the certificate architecture reduces total cost whenever submission volume $`N`$ exceeds:

$$
(9) \qquad C_0 + N(c_v + uc_e) < Nc_e \iff N > \frac{C_0}{(1 - u)c_e - c_v}, \qquad (1 - u)c_e > c_v
$$

By connecting capability specifications, CoT proof obligations, tool-compliance sandboxes, and exact optimality certificates, the framework developed from this collaboration provides a rigorous blueprint for verifiable reasoning evaluation and post-training supervision.

# Project 04: evidence-uncertainty-and-decision-guarantees-in-investment-research

**Article Title**
Evidence uncertainty and decision guarantees in investment research

**Organization**
Duke University × Leading Global Alternative Asset Manager

**Title**
AI-Driven Investment Research and Explainable Risk Analysis

**URL**
https://www.theodoreoy.com/past-experience/artificial-intelligence/evidence-uncertainty-and-decision-guarantees-in-investment-research/

**Position**
Researcher

**Location**
Durham, NC; Washington, DC

**Dates**
September 2023 – September 2026

**Read More Label**
Read More

## Summary

Developed in a multi-year collaboration between Duke University and a leading global alternative asset manager overseeing more than $300 billion in assets under management *(partner identity anonymized under NDA)*, this project built an AI-native investment-research and epistemic-verification workflow designed to counter **AI-era corporate greenwashing and adversarial narrative manipulation**. The workflow addresses the risk that AI-polished corporate disclosures and PR narratives can influence automated ESG and investment-research scores without strengthening the underlying evidence; document-level checks alone may miss shared reporting errors and unsupported claims. Rather than building a black-box system that tells deal teams which company to fund, I architected a decision-guarantee engine (`Multi-Source Ingestion → Multi-Model Rashomon Scoring → Support-Function Ranking Stability Certification → Minimax-Regret Verification Routing → Versioned SHAP Propagation`) that measures **how trustworthy an AI-assisted assessment actually is** and identifies **which exact factual claim analysts should verify next**. In reproducible analytical benchmarks, joint support-function modeling certified a **0.6-point pairwise company advantage** completely obscured by independent confidence intervals, while a single minimax-regret query reduced worst-case decision regret from **0.61 score units to zero**.

## Confidentiality & Scope Disclosure

Conducted through a university–industry collaboration with a leading global alternative asset manager overseeing more than $300 billion in assets under management as of June 2026. While the partner institution's name is withheld pursuant to non-disclosure agreements, my role, system architecture, anti-greenwashing methodology, and analytical benchmarks are authorized for public disclosure.

## Key Contributions

* **Designed Institutional Controls for AI-Era Greenwashing and Narrative Manipulation**: Addressed the risk that polished corporate disclosures and sustainability narratives can influence automated LLM and ESG scores without corresponding factual support. Designed evidence-tracing and verification controls for private-market and ESG research, where report-level review alone may leave shared-source errors and unresolved factual claims undetected.
* **Built an Epistemic Decision-Support Engine Rather Than a Black-Box Deal Picker**: Designed the internal AI workflow around a strict institutional mandate—**never replace the investment committee by outputting a black-box "invest / pass" verdict; instead, quantify how trustworthy the current score is and prescribe which exact factual claim analysts must verify next to minimize misjudgment**. Implemented the complete closed-loop pipeline: `Multi-Source Evidence Ingestion → Multi-Model Rashomon Scoring → Ranking Stability Certification → Minimax-Regret Verification Routing → Automated Post-Correction Re-scoring & Attribution Propagation`.
* **Converted Heterogeneous Disclosures into Traceable Scoring Rules & Contradiction Detectors**: Transformed operating reports, audited financial statements, sustainability disclosures, management questionnaires, and third-party datasets into structured scoring rubrics with strict evidence lineage. Directed AI-assisted verification specifically toward unsubstantiated corporate claims and cross-document contradictions—signals that warrant targeted factual review.
* **Combined Tree Ensembles, Conditional SHAP & Rashomon Model Multiplicity**: Deployed gradient-boosted tree models and tabular deep learning to capture nonlinear thresholds and interaction effects, paired with SHAP attributions and conditional Shapley analyses across Rashomon sets of near-optimal models ($\mathcal{F}_\alpha$) to distinguish stable score contributors from model-selection artifacts.
* **Formulated Joint Model-and-Evidence Uncertainty Bounds via Convex Support Functions**: Derived failure cases for standard bootstrap resampling and raw SHAP-based verification priorities under shared reporting bias or unverified corporate claims. Represented unresolved company evidence $\mathcal{X}(E)$ and Rashomon model sets $\mathcal{F}_\alpha$ jointly ($\Omega(E) = \mathcal{F}_\alpha \times \mathcal{X}(E)$) and derived convex support-function bounds ($h_U(a_f)$) that cancel shared-source measurement errors when the two companies have identical exposures—certifying, in a synthetic comparison, a **0.6-point pairwise company advantage** that separate company confidence intervals ($[-1.4, 2.6]$) failed to resolve.
* **Derived Minimax-Regret Active Verification Routing ($V(q)/c_q$)**: Formulated a distribution-free verification criterion that prioritizes diligence queries by the **worst-case decision regret they remove** rather than by naive SHAP magnitude. In an eight-scenario benchmark, a single targeted verification query reduced worst-case decision regret from **0.61 score units to zero**, whereas rechecking an already-verified high-SHAP feature yielded zero regret reduction.

## Architectural Context: Countering Adversarial AI Greenwashing in $300B+ Institutional Diligence

In private-equity and impact-investment diligence, fluent summaries do not establish the truth of corporate disclosures. The workflow treats AI-polished narratives, unsupported sustainability claims, and shared reporting errors as risks to the credibility of automated ESG and investment scores. Existing disclosure and antifraud obligations do not remove the analyst’s need to verify material evidence. Sections I–VI present the mathematical and systems architecture I developed to audit score credibility, account for shared measurement errors, and route human diligence toward claims capable of changing the comparison.

## Manuscript

## 1 Where existing methods leave the decision unresolved

[SHAP](https://arxiv.org/abs/1705.07874)'s local accuracy property decomposes a given model prediction into additive feature contributions, while conditional Shapley methods address feature dependence and Rashomon-set methods examine explanation stability across near-optimal models (*[SHAP](https://arxiv.org/abs/1705.07874); [Aas et al.](https://arxiv.org/html/1903.10464v3); [Marx et al.](https://proceedings.mlr.press/v206/marx23a.html)*). However, **these explainability methods impose zero requirement that the underlying corporate input facts $`x`$ be true**. In institutional investment diligence—where self-reported disclosures may contain AI-polished greenwashing—a further mathematical layer is required to determine *which factual correction to the evidence could flip the current investment decision*.

For a linear scoring model under a fixed marginal background $`Q`$, the [SHAP](https://arxiv.org/abs/1705.07874) attribution assigned to feature $`j`$ is $`\phi_j = \beta_j(x_j - E_Q X_j)`$. Suppose feature $`j`$ carries an unresolved factual or greenwashing uncertainty bounded by $`|\delta_j| \le d_j`$. Its true sensitivity to factual verification is $`|\beta_j|d_j`$, and over a box of admissible evidence errors, the exact worst-case swing in the company's score is:

$$
\sup_{|\delta_j| \le d_j} |f(x + \delta) - f(x)| = \sum_j |\beta_j| d_j
$$

The triangle inequality gives the upper bound, which is attained by choosing the endpoint of each error interval so that all perturbations push the score in the same direction. This identity exposes a fundamental flaw in standard XAI-driven diligence:
• A core financial metric with a massive [SHAP](https://arxiv.org/abs/1705.07874) bar $`|\phi_j|`$ may come from audited statutory filings that have already been thoroughly verified ($`d_j \approx 0`$); re-auditing it wastes diligence budget.
• Conversely, a self-reported ESG or operational metric whose current claimed value sits near the sector average ($`x_j \approx E_Q X_j \implies \phi_j \approx 0`$) appears completely unimportant on a [SHAP](https://arxiv.org/abs/1705.07874) chart, yet may harbor substantial unresolved greenwashing error ($`d_j \gg 0`$) capable of reversing the deal ranking!

Naive bootstrap resampling of existing records fails for a parallel reason: it cannot detect a shared reporting or AI-marketing bias. Suppose $`n`$ reported observations satisfy $`X_i = \mu + b + \varepsilon_i`$, where $`\varepsilon_i \sim \mathcal{N}(0, \sigma^2)`$ are independent random errors and $`b \neq 0`$ is an unmodeled systemic bias shared across records (such as sector-wide self-reporting inflation or coordinated AI-PR sentiment manipulation). A conventional nominal 95% normal confidence interval centered on the sample mean $`\bar{X}`$ covers the true fundamental parameter $`\mu`$ with probability:

$$
\Pr\left\{ \mu \in \left[ \bar{X} - z\frac{\sigma}{\sqrt{n}}, \ \bar{X} + z\frac{\sigma}{\sqrt{n}} \right] \right\} = \Phi\left( z - \frac{b\sqrt{n}}{\sigma} \right) - \Phi\left( -z - \frac{b\sqrt{n}}{\sigma} \right) \longrightarrow 0 \quad (\text{as } n \to \infty)
$$

where $`z = \Phi^{-1}(0.975) \approx 1.96`$. **Collecting more biased documents ($`n \to \infty`$) shrinks random variance while driving true confidence coverage to zero!** A bootstrap that resamples the same biased disclosures has no statistical leverage to identify $`b`$. Active evidence verification must therefore bound input uncertainty before stability analysis can provide valid decision guarantees.

## 2 Joint uncertainty over models and evidence

To evaluate whether an ESG or investment ranking is genuinely trustworthy, our engine represents **model-selection multiplicity** and **unresolved evidence uncertainty** jointly.

Fix the prediction target, input definitions, and output scale. Consider $`M`$ candidate scoring models $`\mathcal{F}_0`$ specified before examining a validation set of $`n`$ i.i.d. observations from the target evaluation distribution, independent of model construction, with loss bounded in $`[0, 1]`$. For failure probability $`\alpha \in (0, 1)`$, Hoeffding's inequality and a union bound guarantee:

$$
\Pr\left\{ \max_{f \in \mathcal{F}_0} |\hat{L}_n(f) - L(f)| \le t_n \right\} \ge 1 - \alpha, \qquad t_n = \sqrt{\frac{\log(2M / \alpha)}{2n}}
$$

Let $`f^*`$ minimize true population loss within $`\mathcal{F}_0`$, and retain the empirical **Rashomon set** of all near-optimal models within $`2t_n`$ of the empirical validation minimum:

$$
\mathcal{F}_\alpha = \left\{ f \in \mathcal{F}_0 : \hat{L}_n(f) \le \min_{g \in \mathcal{F}_0} \hat{L}_n(g) + 2t_n \right\}
$$

On the simultaneous concentration event, $`\hat{L}_n(f^*) \le L(f^*) + t_n \le \min_g \hat{L}_n(g) + 2t_n`$, guaranteeing $`f^* \in \mathcal{F}_\alpha`$ while every retained model has population excess loss at most $`4t_n`$ (*[Marx et al.](https://proceedings.mlr.press/v206/marx23a.html)*).

Simultaneously, the **evidence uncertainty set** $`\mathcal{X}(E)`$ encodes all unresolved questions regarding entity boundaries, reporting periods, physical units, measurement definitions, shared third-party data sources, and suspected greenwashing claims under current diligence state $`E`$. Crucially, each element $`X \in \mathcal{X}(E)`$ specifies a *joint* input configuration across all candidate companies—preserving cross-company error dependencies rather than treating each company field as an isolated error bar. Defining the joint uncertainty space $`\Omega(E) = \mathcal{F}_\alpha \times \mathcal{X}(E)`$, we compute the exact worst-case pairwise comparison bounds for Companies $`i`$ and $`k`$:

$$
\underline{\Delta}_{ik} = \inf_{(f, X) \in \Omega(E)} [f(x_i) - f(x_k)], \qquad \overline{\Delta}_{ik} = \sup_{(f, X) \in \Omega(E)} [f(x_i) - f(x_k)]
$$

Whenever $`\underline{\Delta}_{ik} > 0`$, the strict ordering $`i \succ k`$ is certified across every defensible model in $`\mathcal{F}_\alpha`$ and every admissible factual resolution in $`\mathcal{X}(E)`$. If calibration establishes that $`\mathcal{X}(E)`$ contains the true ground-truth inputs with probability at least $`1 - \beta`$ at the specified certification stage, a union bound guarantees joint inclusion of $`f^*`$ and the true inputs with probability at least $`1 - \alpha - \beta`$. Thus the unconditional probability of issuing a ranking certificate that is false for $`f^*`$ evaluated at the true inputs is at most $`\alpha + \beta`$, without requiring independence between model validation and evidence calibration. This guarantee concerns the best model in the prespecified class; it does not certify model-class adequacy or realized investment outcomes. Repeated adaptive certification requires calibration valid across the stages being reported.

## 3 Computing comparison bounds with support functions

Our joint evidence representation also makes worst-case comparison bounds computationally tractable via **convex support functions** (*[Ben-Tal and Nemirovski](https://www2.isye.gatech.edu/~nemirovs/MOR_RCO_1998.pdf), Robust Optimization*). Let $`u \in U`$ collect shared and company-specific unresolved factual quantities (including both shared benchmark errors and company-specific greenwashing tolerances), parameterizing company inputs as $`x_i(u) = \bar{x}_i + B_i u`$. Under affine scoring models, the pairwise score difference between Company $`i`$ and Company $`k`$ takes the form $`\Delta_f(u) = m_f + a_f^\top u`$, where $`a_f = (B_i - B_k)^\top \beta_f`$. Introducing the support function $`h_U(a) = \sup_{u \in U} a^\top u`$ yields exact closed-form comparison bounds:

$$
\inf_{u \in U} \Delta_f(u) = m_f - h_U(-a_f), \qquad \sup_{u \in U} \Delta_f(u) = m_f + h_U(a_f)
$$

For an ellipsoidal uncertainty set $`U = \{Cz : \|z\|_2 \le r\}`$, the Cauchy-Schwarz inequality yields $`h_U(a_f) = r\|C^\top a_f\|_2`$; when $`U`$ is an $`\ell_\infty`$ box centered at zero, $`h_U(a_f)`$ reduces to a weighted sum of absolute values.

This formulation delivers a major operational advantage over naive company-by-company confidence intervals: **Exact Cancellation of Shared-Source Errors**. Let $`S`$ index shared-source coordinates on which the two companies have identical loadings, so $`(B_i-B_k)_{:,S}=0`$. Under the same linear scoring model:

$$
(a_f)_S=0,\qquad \Delta_f(u)=m_f+(a_f)_{S^c}^{\top}u_{S^c}
$$

The shared-source contribution cancels identically in the pairwise comparison; company-specific uncertainty remains in the support-function bound. If all uncertain directions cancel, then $`a_f=0`$ and $`h_U(\pm a_f)=0`$. Constructing separate uncertainty intervals for Company $`i`$ and Company $`k`$ and subtracting them falsely allows the shared source to vary in opposite directions simultaneously, manufacturing a spurious worst case that paralyzes investment decisions.

Set $`m_f=\Delta_f(0)`$ and $`a_f=\nabla\Delta_f(0)`$.

For smooth nonlinear models where $`\Delta_f(u)`$ is twice continuously differentiable on $`\|u\|_2 \le r`$ with Hessian operator norm bounded by $`K_f`$, Taylor's remainder theorem gives the certified lower bound:

$$
|\Delta_f(u) - m_f - a_f^\top u| \le \kappa_f, \qquad \kappa_f = \frac{1}{2}K_f r^2 \implies \underline{\Delta}_f \ge m_f - r\|a_f\|_2 - \kappa_f
$$

while non-smooth tree ensembles are bounded via leaf-region partitioning or mixed-integer linear programming, concentrating compute strictly on company pairs near the zero decision boundary.

## 4 Choosing verification queries by the regret they can remove

When $`\underline{\Delta}_{ik} \le 0 < \overline{\Delta}_{ik}`$, the ranking between candidate investments remains unresolved—indicating that suspected greenwashing or data ambiguity could flip the decision. Rather than telling the investor which company to pick, our system recommends **which specific verification query $`q`$ (e.g., auditing a supplier contract, requesting raw utility bills, or cross-checking a regulatory filing) to execute next**.

Let $`A`$ be the finite set of institutional actions (such as advancing Company $`i`$ to final diligence, advancing Company $`k`$, or deferring rating) and $`U(a, \omega)`$ be the pre-specified decision utility under scenario $`\omega \in \Omega`$, with nonempty $`\Omega`$ and uniformly bounded utilities. The baseline **minimax decision regret** over deterministic actions is:

$$
R^*(\Omega) = \min_{a \in A} \sup_{\omega \in \Omega} \left[ \max_{b \in A} U(b, \omega) - U(a, \omega) \right]
$$

Executing a verification query $`q`$ produces an observation $`o \in O_q`$ that restricts the compatible scenario set to a nonempty subset $`\Omega_{q,o} \subseteq \Omega`$. The **guaranteed worst-case reduction in decision regret** provided by query $`q`$ is:

$$
V(q) = R^*(\Omega) - \sup_{o \in O_q} R^*(\Omega_{q,o}) \ge 0
$$

The non-negativity of $`V(q)`$ follows immediately from set inclusion $`\Omega_{q,o} \subseteq \Omega`$: shrinking the set of plausible greenwashing/evidence scenarios cannot increase worst-case regret for any fixed action, and minimizing over actions $`a \in A`$ preserves the inequality (*[Robust Active Preference Elicitation](https://arxiv.org/html/2003.01899)*). Crucially, **$`V(q)`$ requires no subjective probability prior over whether a corporate disclosure is exaggerated**. At a fixed evidence state, maximizing $`V(q)`$ among affordable queries minimizes worst-case regret after one query. With positive unequal query costs $`c_q`$, $`V(q)/c_q`$ is a one-step efficiency heuristic; complementary or sequential queries require joint or adaptive optimization under the total diligence budget $`B`$.

## 5 Checking that corrections propagate through attribution

Once diligence resolves a query and updates a company's verified evidence vector from $`x`$ to $`x'`$, our pipeline guarantees that the factual correction propagates deterministically through all downstream scores, peer rankings, and [SHAP](https://arxiv.org/abs/1705.07874) explanations. Holding the scoring function $`f`$, background reference $`Q`$, and rubric version fixed, **Shapley efficiency** enforces the exact conservation identity (*[SHAP local accuracy property](https://arxiv.org/pdf/1705.07874)*):

$$
f(x) = \phi_0 + \sum_j \phi_j(f, Q, x), \qquad \sum_j [\phi_j(f, Q, x') - \phi_j(f, Q, x)] = f(x') - f(x)
$$

If approximate Shapley outputs have efficiency residuals $`|\phi_0+\sum_j\phi_j-f(x)|\le\eta`$ and $`|\phi_0+\sum_j\phi'_j-f(x')|\le\eta'`$ under the same baseline $`\phi_0`$, the triangle inequality gives $`|\sum_j \Delta \phi_j - \Delta f| \le \eta + \eta'`$ for the recomputation gate. This checks aggregate conservation, not the accuracy of each attribution or the truth of the input evidence. Every database update logs explicit version identifiers for `(Field Version, Evidence Document ID, Model Version, Background Q, Rubric Version)` so that changes driven by factual diligence corrections are never conflated with model retraining.

## 6 Reproducible quantitative comparisons

Three reproducible analytical experiments verify the mathematical mechanisms derived above:

1. **Collapse of Conventional Confidence Intervals Under Shared Greenwashing / Reporting Bias**:
• Set shared reporting bias $`b = 0.2`$ and independent noise $`\sigma = 1`$. Ignoring the common bias $`b`$, a nominal 95% confidence interval achieves actual coverage of only **48.40% at $`n = 100`$ records**, collapsing to **0.000637% at $`n = 1,000`$ records**. When targeted verification establishes the bias bound $`|b| \le 0.2`$, expanding the interval half-width to $`0.2 + 1.96/\sqrt{n}`$ restores **97.50% actual coverage**.
2. **Shared-Source Error Cancellation in Pairwise Company Ranking**:
• Two target companies have a nominal score difference of $`0.6`$ points and share an additive sector-benchmark error in $`[-1, 1]`$. Subtracting independently constructed company intervals gives **$`[-1.4, 2.6]`$**, failing to certify an ordering. Our joint support-function model cancels the incompatible error combinations identically, yielding **$`[0.6, 0.6]`$** and certifying the ranking.
3. **Minimax-Regret Verification Routing vs. Naive [SHAP](https://arxiv.org/abs/1705.07874) Attribution Ranking**:
• Consider one verification query of equal cost across 8 scenarios formed from 2 Rashomon-set candidate models ($`s \in \{-1, 1\}`$) and 4 unresolved evidence configurations ($`z_1 \in \{-0.4, 0.4\}`$, $`z_2 \in \{-0.2, 0.2\}`$), with pairwise score difference $`\Delta_s = 0.15s + z_1 + 0.3s z_2`$. A further shared feature has a large [SHAP](https://arxiv.org/abs/1705.07874) attribution but has already been verified ($`d_0 = 0`$). The decision action is to select Company $`i`$ or Company $`k`$, with regret measured in model-score units:

<table header-row="true">
<tr><td>Verification Query</td><td>Remaining Regret After Worst Possible Observation</td><td>Guaranteed Reduction in Regret $`V(q)`$</td></tr>
<tr><td>**Recheck the already-resolved field with a large [SHAP](https://arxiv.org/abs/1705.07874) attribution**</td><td>0.61</td><td>**0**</td></tr>
<tr><td>**Verify the smaller unresolved variable $`z_2`$**</td><td>0.61</td><td>**0**</td></tr>
<tr><td>**Verify $`z_1`$, which determines the sign of the score difference**</td><td>**0**</td><td>**0.61**</td></tr>
</table>

Enumerating all eight scenarios proves that ranking diligence work by raw [SHAP](https://arxiv.org/abs/1705.07874) magnitude wastes 100% of the query budget ($`V(q) = 0`$), whereas our minimax-regret criterion isolates $`z_1`$ and reduces worst-case decision regret from **0.61 to zero** in a single query. By uniting **Rashomon model multiplicity**, **support-function evidence bounds**, and **minimax-regret verification routing**, this architecture provides institutional investors with a rigorous, auditable defense against AI-era greenwashing.
