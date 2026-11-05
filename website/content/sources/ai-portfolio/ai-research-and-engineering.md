# AI Research and Engineering

**Author**
Theodore Ouyang

**Updated**
2026-11-02

## Confidentiality & Disclosure Note

I conducted the following four projects through Duke University collaborations from September 2023 to September 2026. Partner names and proprietary internal system identifiers are withheld under nondisclosure agreements. The collaborators include a leading multimodal foundation model developer, a frontier AI research laboratory, and a leading global alternative asset manager with more than $300 billion in assets under management. The project titles, my role as a researcher, locations, dates, system architectures, mathematical formulations, and reproducible synthetic benchmarks are cleared for public disclosure.

# Project 01: statistical-inference-and-resource-allocation-in-expert-data-production

**Article Title**
Statistical inference and resource allocation in expert data production

**Organization**
Duke University × Leading Foundation Model Developer

**Title**
Large-scale domain expert feedback governance and adaptive review

**URL**
https://www.theodoreoy.com/past-experience/artificial-intelligence/statistical-inference-and-resource-allocation-in-expert-data-production/

**Position**
Researcher

**Location**
Durham, North Carolina; Palo Alto, California

**Dates**
September 2023 to September 2026

**Read More Label**
Read More

## Summary

I led the statistical system behind expert feedback for LLM post-training, one of the first engineering implementations of prediction-assisted statistical inference and capacity-constrained review allocation in expert data production. It coordinated more than 300 specialists across several domains and an external vendor network, and it optimizes measuring population quality and correcting defects as separate decisions.

## Key Contributions

* **Starting in September 2023, I led the development of a collaboration system spanning more than 300 domain experts across several specialties.** Across the project's external expert and vendor networks, I defined the mathematical specifications and operating standards for task organization, reliability calibration, acceptance adjudication and review allocation. These procedures made distributed expert judgments traceable and subject to calibration as post-training feedback. This was among the first engineering implementations of prediction-assisted statistical inference and capacity-constrained review allocation in expert data production.
* **I designed tiered review rules from Beta-Binomial reliability posteriors, credible intervals, verified sample counts and task-level risk priors.** In one workflow, a flagged submission was dynamically assigned to three additional specialists, and an initially accepted one went to one or two. The expert adjudications then fed back into the system, updating contributor reliability posteriors, informing targeted coaching and adjusting review intensity.
* **I combined independent random reference audits with escalation of high-risk tasks to turn recurring annotator disagreements into explicit acceptance criteria.** I separated missing context from ambiguous instructions and from contributor errors, then revised the task instructions, boundary cases and shared calibration anchors accordingly. Later comparisons of Dawid-Skene reviewer-error models and cost-sensitive deferral rules (DeCCaF) informed the escalation thresholds.
* **I built SQL and Python pipelines that brought together task metadata, review histories, acceptance outcomes, turnaround times and behavioral logs, and reconciled platform activity with Hubstaff operational telemetry.** The allocation solvers took their empirical estimates of unit verification costs ($c_i$), task-stratum latencies ($t_{iaj}$) and hard specialist capacity limits ($H_j^{\text{review}}$) from these records. I also translated client-reported model defects into reproducible engineering investigations and standard operating procedures.
* **I formalized the production procedures by connecting prediction-assisted active statistical inference, cost-aware audit allocation and capacity-constrained review assignment.** For each task I defined an *initial error risk* ($q_i$), the *statistical information value of an independent reference audit* ($m_i / c_i$), and the *expected defect loss removable through additional human handling* ($\Delta_i = r_{i0} - r_{i1}$). I derived the sampling and review decisions that go with each quantity, which gave a reusable allocation method for expert feedback across domains.
* **I tested the estimator and allocation algorithms on a stratified synthetic benchmark of 10,000 submissions, using 200,000 independent Monte Carlo sampling repetitions.** Under ideal residual calibration and an equal expected audit budget, allocating by residuals and costs cut population quality estimation variance by **17.79%** relative to uniform sampling, equivalent to a **9.33%** reduction in standard deviation. In a separate analytical example with 200 tasks, ranking reviews by marginal gain cut expected post-review defect loss by **8.89%** at the same review volume.

## Architectural Context: Statistical governance for expert data production

When review succeeds in targeting the tasks with higher true error probabilities, the resulting selection bias is positive ($\operatorname{Cov}(\pi(X), q(X)) > 0$), so a raw inspection error rate has to be corrected before it can support population quality inference. Audit allocation has a related problem, since directing expert capacity toward the tasks that improve estimation precision means accounting for residual uncertainty and verification cost. The project's expert feedback governance framework for post-training had to deal with both across multiple domains. I began leading its development in September 2023. I coordinated hundreds of distributed specialists and external vendor queues and defined the mathematical specifications for quality measurement and resource allocation under selective review. The seven sections below formalize the production design and compare it with the methods literature, including references published from 2024 to 2026.

## Manuscript

## 1 How selective review changes quality measurement

In a production RLHF pipeline, whatever policy routes submissions to review also changes the statistical properties of the observed sample. To see how, let $`X`$ denote observable task features, including the domain, prompt complexity and contributor history. Let $`Y \in \{0, 1\}`$ indicate whether the original submission contains an error under fixed acceptance criteria, so that the true conditional error probability is $`q(x) = P(Y = 1 \mid X = x)`$. Write $`S = 1`$ when a submission is selected for an independent reference audit. Conditional on $`X`$, selection is randomized with probability $`\pi(x) > 0`$, and it is independent of the reference label, which has not yet been observed.

Suppose an operational dashboard estimates population quality from the error fraction among verified submissions. What it actually targets is:

$$
E[Y \mid S = 1] = \frac{E[\pi(X)q(X)]}{E[\pi(X)]}
$$

$$
E[Y \mid S = 1] - E[Y] = \frac{\operatorname{Cov}(\pi(X), q(X))}{E[\pi(X)]}
$$

When review does succeed in targeting higher true error risk, the covariance between audit probability $`\pi(X)`$ and true defect probability $`q(X)`$ is strictly positive, and the dashboard reads high. A higher error detection rate in the reviewed sample can therefore reflect more effective risk targeting. By itself it does not establish that production quality has deteriorated. These identities describe the distribution of a selected item. In a finite batch the observed error fraction also has a random denominator, so it has to be kept distinct from the population expression above.

Expert rankings suffer from the same selection mechanism. Let $`a_{jh}`$ be the probability that expert $`j`$ answers a task in stratum $`h`$ correctly, and let $`p_{jht}`$ describe that expert's assigned task mix in period $`t`$. Even if underlying ability stays constant, observed accuracy moves with the task mix:

$$
A_{jt} = \sum_h p_{jht} a_{jh}, \qquad A_{j,t+1} - A_{jt} = \sum_h (p_{jh,t+1} - p_{jht}) a_{jh}
$$

Comparisons across periods therefore require a fixed target task mix $`w_h`$ and standardized accuracy:

$$
A_j^{\text{std}} = \sum_h w_h a_{jh}
$$

Overlapping assignments or shared anchor cases support estimation within each stratum. Pooling tasks of different difficulty, rubric versions and selection mechanisms into a single unstratified binomial sample leaves the selection bias unresolved. In the project's production routing engine I used a conjugate Beta-Binomial model for each contributor's reliability within a task stratum. Given a prior $`\operatorname{Beta}(\alpha_{0h}, \beta_{0h})`$ and $`n_{jht}`$ audited tasks with $`k_{jht}`$ verified successes, the posterior $`\operatorname{Beta}(\alpha_{0h} + k_{jht}, \beta_{0h} + n_{jht} - k_{jht})`$ gives shrinkage-regularized point estimates and credible intervals that account for unequal sample sizes across comparable audits.

The same statistical requirements guide the choice of reviewer models and allocation methods. [Dawid-Skene](https://doi.org/10.2307/2346806) models describe how reviewer confusion matrices differ relative to latent ground truth. [DeCCaF](https://arxiv.org/html/2403.06906v1) brings task conditions, error costs and reviewer capacity into human-AI deferral, including what difficult assignments do to naive evaluations of expert performance. The production architecture ties selective review assignment to unbiased population quality inference in ongoing post-training work ([Dawid-Skene](https://doi.org/10.2307/2346806); [DeCCaF](https://arxiv.org/html/2403.06906v1)).

## 2 Correcting predictions with audits to estimate population quality

Fix a production batch of $`N`$ original submissions, its acceptance criteria and its latent reference labels $`Y_1, \dots, Y_N`$. The inferential target is the finite-batch error rate $`\mu = N^{-1} \sum_{i=1}^N Y_i`$. Let $`f_i \in [0, 1]`$ be a fixed, inexpensive risk prediction that combines contributor reliability posteriors, task complexity and automated heuristic checks. Assign audit probability $`\pi_i \in [\pi_{\min}, 1]`$ and draw $`S_i \sim \operatorname{Bernoulli}(\pi_i)`$ independently across submissions, with the predictions and the sampling probabilities locked before the current batch's reference labels are revealed.

I used a prediction-assisted estimator with inverse-probability-weighted (IPW) residual correction:

$$
\hat{\mu} = \frac{1}{N} \sum_{i=1}^N \left[ f_i + \frac{S_i}{\pi_i} (Y_i - f_i) \right]
$$

Its validity is design-based, and the conditional expectation below shows why. Write the prediction residual as $`e_i = Y_i - f_i`$ and condition on the fixed batch, the predictions and the sampling probabilities:

$$
\hat{\mu} - \mu = \frac{1}{N} \sum_{i=1}^N \left( \frac{S_i}{\pi_i} - 1 \right) e_i, \qquad E_S[\hat{\mu} - \mu] = 0
$$

The inverse-probability weights restore the population representation that selective verification altered, and the predictions reduce the residual variation that human expert audits have to resolve. Design-based unbiasedness does not require $`f_i = q(X_i)`$: inaccurate predictions may reduce efficiency, but the estimator remains unbiased under the specified Bernoulli sampling design. The estimator follows active statistical inference principles ([Active Statistical Inference: mean estimation and sampling design](https://arxiv.org/html/2403.03208v3)). To use it in production, I defined procedures for freezing the audited objects, recording rubric version histories and retaining the telemetry that optimization needs.

Original and revised submissions have to be retained as separate database entities. Telling defects introduced during initial production apart from those corrected through review takes two estimates, $`\hat{\mu}_{\text{raw}}`$ on frozen originals and $`\hat{\mu}_{\text{final}}`$ on post-review deliverables. A change in post-training criteria causes a different confusion, since stricter acceptance standards can be misread as declining contributor ability. To prevent that, a shared set of anchor cases is adjudicated under both rubric versions whenever the criteria change, and submissions from different periods can then be compared under a common reference version.

## 3 Allocating audit effort by residual uncertainty and cost

Because the sampling is independent Bernoulli, the cross-item covariance terms drop out and the design variance is exactly:

$$
\operatorname{Var}_S(\hat{\mu}) = \frac{1}{N^2} \sum_{i=1}^N \frac{1 - \pi_i}{\pi_i} e_i^2
$$

This expression sets the objective for audit allocation: audit effort should go to the uncertainty that automated risk predictions leave unresolved. For a binary error label with conditional error probability $`q_i`$, the expected squared residual has two components:

$$
m_i := E[(Y_i - f_i)^2 \mid X_i] = q_i(1 - q_i) + (q_i - f_i)^2
$$

The first is the conditional Bernoulli variance $`q_i(1 - q_i)`$ and the second is the squared calibration error $`(q_i - f_i)^2`$. It follows that a high error probability $`q_i`$ need not imply high inferential value. If a task category is almost certain to contain an error ($`q_i \approx 1`$) and the predictor recognizes this ($`f_i \approx 1`$), then $`m_i \approx 0`$. An independent reference audit of that item contributes less information about population quality than an audit of a moderately risky item whose outcome remains uncertain ($`q_i \approx 0.5`$). So a remediation model and a measurement model look at the same task differently, the first measuring the benefit of correcting high-risk tasks and the second evaluating how audits improve population estimates.

Let $`c_i > 0`$ be the empirical cost of an independent reference audit, calibrated by reconciling platform review logs with Hubstaff active-work telemetry, and let $`B`$ be the expected audit-cost budget. When the true residual second moments $`m_i > 0`$ are known, the optimal design solves:

$$
\min_{\pi} \sum_{i=1}^N \frac{m_i}{\pi_i} \quad \text{s.t.} \quad \sum_{i=1}^N c_i \pi_i \le B, \quad \pi_{\min} \le \pi_i \le 1
$$

The objective omits the constant $`-\sum_i m_i`$ from the variance numerator because that constant does not depend on the allocation $`\pi`$. For probabilities strictly between their bounds, the Lagrangian first-order condition gives the clipped square-root allocation:

$$
-\frac{m_i}{\pi_i^2} + \lambda c_i = 0 \implies \pi_i^* = \operatorname{clip}_{[\pi_{\min}, 1]} \left( \sqrt{\frac{m_i}{\lambda c_i}} \right)
$$

For a budget below the cost of a full audit, $`\lambda > 0`$ is chosen to satisfy the budget constraint. The multiplier need not be unique when clipping is active, and feasibility requires $`B \ge \pi_{\min} \sum_i c_i`$. If the budget does cover a full audit, every item is audited ($`\pi_i^* = 1`$). The square-root rule samples harder where expected residuals are larger and more lightly where audits cost more, while the positive probability floor $`\pi_{\min}`$ maintains coverage across the task space and bounds the IPW weights.

Production allocation uses regularized stratum estimates $`\hat{m}_i > 0`$ from earlier independent audits or a pilot calibration batch. The true $`m_i`$ defines the optimality analysis, and the estimates $`\hat{m}_i`$ determine operational allocation. Residuals are estimated at the level of `(task stratum × criteria version × cost stratum)` to avoid fitting unstable parameters to individual submissions. The budget $`B`$ constrains expected audit cost per batch. A workflow requiring an exact integer audit count needs a feasible fixed-size sampling design whose first-order inclusion probabilities sum to that count. The variance of such a design depends on joint inclusion probabilities, and its inclusion probabilities need not equal the Bernoulli optimum $`\pi_i^*`$.

## 4 Allocation gains and the conditions they require

Holding the predictor fixed, I derive what allocation based on residuals and costs gains over uniform sampling. The same derivation shows when that gain vanishes or the allocation fails. Let $`C = \sum_{i=1}^N c_i`$, so the uniform sampling probability at the same expected cost is $`p = B / C`$. If the true residual second moments $`m_i`$ are available and no optimal probability reaches a clipping boundary, averaging the design variance over the conditional label distribution gives:

$$
V_{\text{uniform}} = \frac{1}{N^2} \left[ \frac{C \sum_i m_i}{B} - \sum_i m_i \right]
$$

$$
V_{\text{optimal}} = \frac{1}{N^2} \left[ \frac{\left(\sum_i \sqrt{m_i c_i}\right)^2}{B} - \sum_i m_i \right]
$$

If all items within a fixed task stratum share a sampling probability, substituting that stratum's finite-batch mean squared residual for $`m_i`$ turns these expressions into exact finite-batch identities. By the Cauchy-Schwarz inequality:

$$
V_{\text{uniform}} - V_{\text{optimal}} = \frac{C \sum_i m_i - \left(\sum_i \sqrt{m_i c_i}\right)^2}{N^2 B} \ge 0
$$

Equality holds if and only if $`m_i / c_i`$ is constant across items. The efficiency gain therefore depends on identifiable variation in residual second moment per unit audit cost, and with homogeneous residuals and costs the optimal allocation is uniform. If clipping is active at $`\pi_{\min}`$ or $`1`$, constrained optimization remains no worse than a feasible uniform policy, and the gain can be evaluated directly from the clipped primal objective.

The analysis also puts a number on the variance penalty from model misspecification. If allocation uses inaccurate residual estimates $`\hat{m}_i`$ and neither allocation is clipped, the excess variance relative to the true optimum is:

$$
V(\hat{\pi}) - V(\pi^*) = \frac{1}{N^2 B} \left[ \left( \sum_i \sqrt{\hat{m}_i c_i} \right) \left( \sum_i \frac{m_i \sqrt{c_i}}{\sqrt{\hat{m}_i}} \right) - \left( \sum_i \sqrt{m_i c_i} \right)^2 \right] \ge 0
$$

The dangerous term is the denominator $`\sqrt{\hat{m}_i}`$, through which a severe underestimate of $`\hat{m}_i`$ in any part of the task space increases the penalty. A positive sampling floor $`\pi_{\min}`$ limits the worst-case variance increase. Active and uniform sampling probabilities can also be combined without changing the budget:

$$
\pi_i(\rho) = (1 - \rho)\hat{\pi}_i + \rho p
$$

The shrinkage weight $`\rho \in [0, 1]`$ can be tuned using independent calibration batches ([Robust Sampling for Active Statistical Inference](https://arxiv.org/html/2511.08991v1)).

## 5 Allocating review by expected loss reduction

Statistical auditing measures population quality with minimum variance. Operational review has a different job, removing defects from the current batch before it is delivered for training, so one objective is estimation precision and the other is delivered quality. For task $`i`$ under handling action $`a`$, such as direct acceptance, peer review, expert adjudication or contributor revision, let $`r_{ia}`$ be the expected error loss remaining after the action, $`d_{ia}`$ its operational cost, and $`t_{iaj}`$ the time required from specialist $`j`$, measured through platform and Hubstaff telemetry. Binary assignment decisions $`z_{ia} \in \{0, 1\}`$ solve:

$$
\min_{z} F(z) = \sum_{i,a} z_{ia}(r_{ia} + \eta d_{ia}) \quad \text{s.t.} \quad \sum_a z_{ia} = 1, \quad \sum_{i,a} z_{ia} t_{iaj} \le H_j \quad \forall j
$$

Here $`H_j`$ is the specialist's available time, and $`\eta \ge 0`$ converts resource cost to the scale of error loss ([DeCCaF: capacity constraints and global assignment](https://arxiv.org/html/2403.06906v1)).

When review costs are equal and each reviewed task uses one slot, the marginal remediation gain $`\Delta_i = r_{i0} - r_{i1}`$ determines the optimal priority order. Initial risk $`r_{i0}`$ measures the risk before review. A high-risk task may be difficult to repair through one additional review because external evidence is missing, which gives a small $`\Delta_i`$. A self-contained calculation error in a moderate-risk task may be fully correctable, which gives a large $`\Delta_k`$. Moving one review slot from task $`i`$ to task $`k`$ changes total expected loss by:

$$
\Delta F = (r_{i0} + r_{k1}) - (r_{i1} + r_{k0}) = \Delta_i - \Delta_k
$$

Whenever $`\Delta_k > \Delta_i`$, the exchange strictly reduces delivered defect loss, regardless of the initial risk ordering.

Error in the action-risk estimates also determines a performance bound for review allocation. Suppose $`|\hat{r}_{ia} - r_{ia}| \le \delta`$ for every feasible action, costs and capacities are known, and $`\hat{z}`$ minimizes the predicted objective $`\hat{F}(z)`$. Relative to the true optimal feasible assignment $`z^*`$:

$$
F(\hat{z}) \le \hat{F}(\hat{z}) + N\delta \le \hat{F}(z^*) + N\delta \le F(z^*) + 2N\delta
$$

The bound identifies post-action residual loss $`r_{ia}`$ as the empirical quantity that must be calibrated, which provides a basis for randomized pilot trials across permitted review actions.

The remediation and measurement budgets can be combined in a batch-level mixed-integer convex program (MICP). Let $`\tau^2`$ be the target variance ceiling for the quality estimate, $`B_{\text{total}}`$ the total cost budget, and $`V_{\hat{m}}(\pi) = N^{-2}\sum_i (1 - \pi_i)\hat{m}_i / \pi_i`$ the planning variance under the calibrated residual model:

$$
\min_{z, \pi} \sum_{i,a} z_{ia}\hat{r}_{ia} \quad \text{s.t.} \quad \sum_{i,a} z_{ia} d_{ia} + \sum_i c_i \pi_i \le B_{\text{total}}, \quad V_{\hat{m}}(\pi) \le \tau^2
$$

$$
\sum_a z_{ia} = 1, \quad z_{ia} \in \{0, 1\}, \quad \sum_{i,a} z_{ia} t_{iaj} \le H_j^{\text{review}} \ \forall j, \quad \pi_{\min} \le \pi_i \le 1
$$

The hard capacity $`H_j^{\text{review}}`$ goes to remediation actions, while reference audits are scheduled independently on frozen original submissions. The precision ceiling is model-based, so it requires independent audits to check residual calibration. An expected audit-cost constraint imposes no hard limit on realized audit hours. If the program is infeasible, the precision target, the feasible review assignments and the available engineering budget are in conflict.

## 6 Reproducible experiments at equal cost

I tested the mechanisms above in synthetic experiments with publicly specified parameters. A fixed batch contains $`N = 10,000`$ submissions in three strata of $`6,000`$, $`3,000`$ and $`1,000`$ items, with $`60`$, $`300`$ and $`350`$ errors, respectively, so the true batch defect rate is $`\mu = 7.10\%`$. Unit audit costs across the three strata are $`1`$, $`1.5`$ and $`3`$. Every policy gets an expected audit budget of $`B = 2,000`$ units and a minimum sampling probability of $`\pi_{\min} = 3\%`$.

Risk predictions for the three strata are $`2\%`$, $`8\%`$ and $`30\%`$. Their batch average of $`6.60\%`$ differs from the true defect rate by $`0.50`$ percentage points. The cost-aware allocation uses the true within-stratum mean squared residuals, which represents ideal calibration, and the misspecified policy reverses the residual ordering across strata. With predictions, budget and submissions held fixed, $`200,000`$ independent Monte Carlo repetitions verify the analytical variance formulas:

<table header-row="true">
<tr><td>Audit policy</td><td>Sampling probabilities across the three strata</td><td>Standard deviation of corrected estimate (percentage points)</td><td>Variance change relative to uniform sampling</td></tr>
<tr><td>**Uniform sampling with the same residual correction**</td><td>14.81% / 14.81% / 14.81%</td><td>0.568</td><td>Baseline</td></tr>
<tr><td>**Prioritize predicted error probability ($`f_i`$)**</td><td>3.00% / 11.56% / 43.33%</td><td>0.657</td><td>+33.77% increase</td></tr>
<tr><td>**Residual- and cost-aware allocation with ideal calibration**</td><td>7.89% / 19.37% / 21.84%</td><td>**0.515**</td><td>**-17.79% reduction**</td></tr>
<tr><td>**Misspecified residual ordering (reversed)**</td><td>23.00% / 11.77% / 3.00%</td><td>0.983</td><td>+199.66% increase</td></tr>
<tr><td>**Misspecified allocation with 70% weight on uniform sampling**</td><td>17.27% / 13.90% / 11.27%</td><td>0.615</td><td>+17.07% increase</td></tr>
</table>

Under ideal residual calibration, the standard deviation of the population quality estimate falls by **9.33%**, a **17.79%** reduction in variance. The high-risk-first policy fares worse. Its uncorrected error detection rate averages **19.60%**, overstating the population defect rate. IPW residual correction recovers **7.1015%**, but the policy oversamples the more expensive third stratum, which increases estimation variance by **33.77%**. Across all five policies, Monte Carlo variances differ from the analytical formulas by no more than $`0.5\%`$.

A separate exact allocation experiment isolates the effect of remediation. Two task groups of $`100`$ items each have initial error risks of $`0.40`$ and $`0.15`$, and additional review reduces these risks to $`0.30`$ ($`\Delta_1 = 0.10`$) and $`0.01`$ ($`\Delta_2 = 0.14`$), respectively. Review costs are equal, and capacity is $`100`$ items. Ranking by initial risk leaves $`100(0.30) + 100(0.15) = 45`$ expected errors, while ranking by expected loss reduction ($`\Delta_i`$) leaves $`100(0.40) + 100(0.01) = 41`$, which reduces expected defect loss by **8.89%** at the same review volume.

## 7 Production validation and evaluation criteria

I defined separate production evaluations for statistical quality inference and operational defect control. Errors detected in a targeted queue indicate how well review locates defects, but an improvement in delivered quality has to be assessed through the defects that remain and the associated costs.

1. **Inference on frozen, adjudicated batches.** Compare uniform sampling, legacy high-risk routing, cost-aware residual allocation and defensive mixtures against complete independent adjudication, assessing bias, mean squared error (MSE) and interval coverage within task strata and rubric versions.
2. **Remediation trials at matched capacity.** Compare legacy tiered rules with marginal-gain ($`\Delta_i`$) action allocation at equal total specialist hours, measuring the severe defects remaining in the final post-training corpus and the fully loaded cost per accepted submission.

From September 2023 I led the development of the contributor reliability records, tiered review workflows and random reference audits that established the project's operating standards for expert collaboration, quality measurement and resource allocation. I specified the sampling, calibration and capacity assumptions under which quality estimation is unbiased and, when residual second moments are correctly specified, audit allocation is optimal. The synthetic benchmarks test these mechanisms under their stated conditions.

# Project 02: task-validity-in-financial-synthetic-data

**Article Title**
Task validity in financial synthetic data

**Organization**
Duke University × Leading Foundation Model Developer

**Title**
Financial task design and synthetic data engineering

**URL**
https://www.theodoreoy.com/past-experience/artificial-intelligence/task-validity-in-financial-synthetic-data/

**Position**
Researcher

**Location**
Durham, North Carolina; Palo Alto, California

**Dates**
September 2023 to September 2026

**Read More Label**
Read More

## Summary

I designed the data strategy for financial post-training in a frontier foundation model program, one of the first engineering implementations of constraint-preserving synthetic data and structured expert preference supervision for financial LLM post-training. Diagnostic decision tasks, exact accounting constraints and a five-level preference protocol feed **Batch Zero**, the calibration protocol the company later extended to other post-training programs.

## Key Contributions

* **Beginning in September 2023, I led financial and business decision task design for a frontier foundation model program, specifying the capability taxonomy, primary evidence standards, input schemas, decisive variables, and acceptance criteria.** The diagnostic cases targeted high-stakes business decision boundaries where foundation models and practitioners repeatedly make errors. They translated doctoral or CFA-level domain judgment into testable task requirements. Together with the synthesis methods and Batch Zero below, this work was among the first engineering implementations of constraint-preserving synthetic data and structured expert preference supervision for financial LLM post-training.
* **I designed a five-level pairwise preference protocol for RLHF and DPO supervision.** It records why an expert prefers one response to another, and that record is how domain knowledge becomes post-training supervision. Each judgment has to cite verifiable evidence, the relevant accounting rules, and the decisive variables. The annotations keep the evidence and reasoning behind each preference and support training models to assess whether a financial judgment has sufficient support.
* **I developed financial synthetic data methods for four settings.** For each task I selected a mathematical generator and adapted it to the task's structural invariants, data types, and permitted information:
  * *Cross-sectional corporate fundamentals.* I used Gaussian and vine copulas with conditional sampling for company size, operating history, and financial ratios. These methods preserve joint dependencies across columns and avoid the unrealistic combinations that sampling each column independently produces.
  * *Accounting identities, ratio bounds, and chronological order.* Constrained sampling, variable transformations, and covariance-weighted affine projections enforce balance-sheet and cash-flow identities, ratio ranges, and date ordering. Across 200,000 12-dimensional synthetic draws, the maximum constraint residual was **$1.21 \times 10^{-14}$**. A separate standardized-residual rejection model had an acceptance rate of $0.0002529\%$.
  * *Multimodal records with numerical and categorical fields.* CTGAN and TabDDPM model the multimodal empirical distributions. Business-rule checks are mandatory after generation, and together with Lipschitz decision-margin tests and Gaussian margin-to-noise analysis ($\gamma/s$) they guide reference-answer recomputation and reduce stale supervision labels.
  * *Continuous-time price and interest-rate paths.* SDEs, neural SDEs, Brownian bridges, and stochastic interpolation generate paths for temporal financial tasks, while static cross-sectional company comparisons do not require these constructions. The work extends MathWorks-style stochastic interest-rate path construction and matches each method to the task's permitted filtration ($\mathcal{F}_s$), to keep future information from leaking into evaluation.
* **I created Batch Zero to implement post-training data strategy.** Starting from the capability objectives and data requirements of post-training research teams, I established a protocol for independent execution and expert calibration that a task family goes through before it enters large-scale data construction. Doctoral-level domain experts independently construct tasks, generate synthetic variants, solve reference cases, and assign five-level pairwise preference scores. The disagreements and failure modes that appear in execution inform revisions to task specifications, boundary cases, and **Batch One** data acceptance criteria. The foundation model company subsequently extended **Batch Zero** to other new post-training programs.
* **I quantified stale-label errors, temporal leakage, and task-family clustering.** Analytical derivations and simulations show that when labels are not recomputed, synthetic perturbations near a decision boundary produce **40.13%** inherited-label error at $\gamma/s = 0.25$. Undisclosed Brownian bridge endpoint conditioning creates an apparent **29.29% reduction in RMSE** at the interval midpoint through future-information leakage. And with within-family correlation $\rho = 0.5$, 2,000 nominal synthetic variants from 100 task families amount to only **$N_{\text{eff}} \approx 190.48$** effective independent observations.

## Architectural Context: Task specifications and data strategy for financial post-training

In September 2023, frontier foundation models could reproduce corporate finance definitions and still made unpredictable errors in financial workflows, where a small numerical change or an accounting footnote could reverse an investment recommendation. I developed a data strategy around the capability objectives and data requirements of post-training research teams, connecting task specifications, synthesis methods, and expert calibration to address two problems:
1. **Diagnosing reasoning limits through task design.** I designed prompts around subtle business failure modes, including covenant breaches, off-balance-sheet adjustments, and valuation differences close to a decision boundary, because simple prompts may give little basis for telling candidate responses apart. Paired with the five-level preference protocol, these prompts turn a domain judgment such as *"Response A is better because it isolates the working-capital constraint and cites Footnote 4"* into structured preference supervision for post-training.
2. **Matching the generator to the financial structure.** Synthetic financial data has to satisfy structural constraints, stay consistent with reference judgments, and respect the task's information boundaries. A corporate table that violates Total Assets $=$ Total Liabilities $+$ Equity, even by a fraction of a percentage point, introduces a structural error. An interest-rate path that exposes a future terminal rate to a historical forecasting task introduces temporal leakage. Sections 1 through 6 give the conditions, analytical results, and validation designs for each method. Batch Zero then turns these requirements into acceptance criteria, under which experts have to be able to execute the task specification independently, reproduce reference solutions, and calibrate their judgments.

## Manuscript

## 1 Distributional fit and task validity

Modern tabular generators address different distributional problems. [CTGAN](https://arxiv.org/abs/1907.00503) handles mixed discrete and continuous data, multimodality, and class imbalance through mode-specific normalization and conditional vectors, and [TabDDPM](https://proceedings.mlr.press/v202/kotelnikov23a.html) runs Gaussian diffusion on numerical fields and multinomial diffusion on categorical ones ([CTGAN](https://arxiv.org/abs/1907.00503); [TabDDPM](https://proceedings.mlr.press/v202/kotelnikov23a.html)). Both can learn empirical distributions effectively. A financial task can match its distribution and still be invalid, though, because part of what makes it valid is structural. Accounting identities have to hold exactly, fiscal periods have to run in chronological order, covenant applicability conditions have to be respected, and the numerical inputs have to agree logically with the reference judgment. Global distributional similarity metrics cannot enforce any of this.

A simple construction shows how far apart the two can drift. Suppose valid financial inputs $`x \in \mathbb{R}^d`$ have to satisfy $`m`$ linear accounting or ratio identities $`Ax = b`$, where $`A \in \mathbb{R}^{m \times d}`$ has full row rank, so that the valid population distribution $`P`$ is supported entirely on the affine subspace $`M = \{x \in \mathbb{R}^d : Ax = b\}`$. Assume this distribution has finite second moments, and let the columns of $`N \in \mathbb{R}^{d \times m}`$ form an orthonormal basis for the normal space orthogonal to $`M`$. Now take a generator that captures $`P`$ along the manifold but adds a small amount of independent noise in the normal directions: $`X_\sigma = X + \sigma N \varepsilon`$, where $`\varepsilon \sim \mathcal{N}(0, I_m)`$ is independent of $`X \sim P`$. Writing $`Q_\sigma`$ for the generated distribution, I obtain, for every $`\sigma > 0`$,

$$
W_2(P, Q_\sigma) \le \sqrt{E\|X_\sigma - X\|^2} = \sigma \sqrt{m} \longrightarrow 0 \quad (\text{as } \sigma \to 0^+)
$$

$$
P(M) = 1, \qquad Q_\sigma(M) = 0
$$

$$
\|P - Q_\sigma\|_{\text{TV}} := \sup_B |P(B) - Q_\sigma(B)| = 1
$$

The first line comes from coupling $`(X, X_\sigma)`$ on the same probability space. The second holds because $`AN`$ is invertible and a continuous $`m`$-dimensional Gaussian vector equals zero with probability zero, and taking the Borel set $`B = M`$ then gives the third. So the 2-Wasserstein distance $`W_2(P, Q_\sigma)`$ can tend to zero while the acceptance rate under exact business constraints stays at zero ($`Q_\sigma(M) = 0`$) and the total variation distance stays at its maximum value of $`1`$.

This counterexample motivates how I divided responsibilities in the synthetic data architecture ([SDV constraint-augmented generation](https://docs.sdv.dev/sdv/modeling/constraint-augmented-generation-cag)):
• Copula models and conditional sampling capture cross-sectional rank and tail dependencies among continuous corporate indicators, including company size, operating history, leverage, and profit margins. They preserve the dependencies that independent column generation would discard.
• [CTGAN](https://arxiv.org/abs/1907.00503) and [TabDDPM](https://proceedings.mlr.press/v202/kotelnikov23a.html) model mixed-type and multimodal empirical distributions, and explicit business-rule checks follow them.
• Deterministic variable transformations and manifold projections enforce accounting equalities, ratio bounds, and chronological order.

## 2 Preserving the conditional distribution under business constraints

Rejection sampling generates unconstrained candidates and discards those that violate the constraints, and as several financial constraints tighten its computational cost can become prohibitive. Suppose a candidate draw produces $`m`$ standardized constraint residuals that behave as independent standard normal variables, each of which has to lie within $`[-\epsilon, \epsilon]`$. The acceptance probability and the expected number of candidate draws per valid input are

$$
\alpha_m(\epsilon) = [2\Phi(\epsilon) - 1]^m \sim \left( \sqrt{\frac{2}{\pi}} \epsilon \right)^m \quad (\epsilon \to 0^+), \qquad E[N_{\text{attempts}}] = \frac{1}{\alpha_m(\epsilon)}
$$

so each additional accounting or ratio constraint multiplies the expected candidate count. With a tolerance of $`\epsilon = 0.05`$ residual standard deviations, the exact analytical values are:

<table header-row="true">
<tr><td>Simultaneous constraints ($`m`$)</td><td>Rejection-sampling acceptance rate $`\alpha_m(\epsilon)`$</td><td>Expected candidate draws per valid input</td></tr>
<tr><td>**1**</td><td>3.9878%</td><td>25.08</td></tr>
<tr><td>**2**</td><td>0.1590%</td><td>628.84</td></tr>
<tr><td>**4**</td><td>**0.0002529%**</td><td>**395,442.59**</td></tr>
</table>

Generating directly along the degrees of freedom the constraints permit avoids these rejected draws, and in the linear Gaussian setting covariance-weighted affine projection also preserves the exact theoretical conditional distribution. For a Gaussian copula, this result requires constraints that are affine in the latent Gaussian coordinates, since nonlinear marginal transformations generally do not preserve affine constraints in the observed financial variables. Let the initial unconstrained draw be $`Z \sim \mathcal{N}(\mu, \Sigma)`$, with $`\Sigma \succ 0`$. To satisfy the linear constraints while preserving the theoretical conditional covariance, I apply a covariance-weighted Mahalanobis projection:

$$
X = \arg\min_{x : Ax = b} \frac{1}{2}(x - Z)^\top \Sigma^{-1}(x - Z) = Z + K(b - AZ), \qquad K = \Sigma A^\top (A \Sigma A^\top)^{-1}
$$

The first-order Lagrangian stationarity condition is $`\Sigma^{-1}(X - Z) + A^\top \lambda = 0`$, and substituting $`AX = b`$ and eliminating the multiplier $`\lambda`$ gives the closed-form update. Since $`AK = I_m`$, every draw satisfies $`AX = b`$ exactly. Its mean and covariance are

$$
E[X] = \mu + K(b - A\mu)
$$

$$
\operatorname{Cov}(X) = (I - KA)\Sigma(I - KA)^\top = \Sigma - \Sigma A^\top (A \Sigma A^\top)^{-1} A\Sigma
$$

Affine transformations preserve Gaussianity, so these moments identify the exact regular conditional Gaussian distribution of $`Z \mid AZ = b`$ ([Majumdar and Majumdar on Gaussian distributions under linear conditioning](https://arxiv.org/abs/1710.09285)).

My synthetic validation benchmark generated **200,000 12-dimensional financial vectors subject to 4 simultaneous linear constraints**. The maximum absolute constraint residual was **$`1.21 \times 10^{-14}`$**, and the relative Frobenius covariance error against the theoretical conditional covariance was **0.662%**. These were direct constrained draws with no subsequent rejection; the nearly 400,000 candidate draws reported above belong to the separate standardized-residual rejection model. Fields that accounting definitions fully determine are computed analytically. Range bounds and date ordering are enforced in the latent generation space when they admit bijective transformations, such as logarithmic transforms or positive increments $`t_{k} = t_{k-1} + \exp(\xi_k)`$.

## 3 Using decision margins to determine when reference judgments need recomputation

A synthetic variant of a financial reference case often keeps the business narrative and changes decisive financial figures, covenant thresholds, or macroeconomic inputs. If the original reference answer stays in place after those values change, systematic label errors enter post-training, even when all accounting constraints hold. [FinQA](https://aclanthology.org/2021.emnlp-main.300/) pairs financial questions with executable reasoning programs, and synthetic preference data similarly require a maintained link between inputs, reference conclusions, and the expert's explanation of a preference ([FinQA](https://aclanthology.org/2021.emnlp-main.300/)).

Consider a decision rule that chooses between two corporate actions, and let $`d(x)`$ denote the net valuation or metric advantage of action A over action B, so that the correct reference decision is $`\operatorname{sign} d(x)`$. If $`d`$ is $`L`$-Lipschitz on a feasible neighborhood, a sufficient condition for retaining the original reference decision is that the perturbation $`\Delta`$ stays strictly within the decision margin:

$$
|d(x + \Delta) - d(x)| \le L\|\Delta\|, \qquad |d(x)| > L\|\Delta\| \implies \operatorname{sign} d(x + \Delta) = \operatorname{sign} d(x)
$$

My diagnostic tasks focus on contested decision boundaries where models are prone to error, which means $`|d(x)|`$ is deliberately kept small. For a linear comparison rule $`d(x) = w^\top x - c`$ with initial margin $`\gamma = d(x) > 0`$, the stale-label error rate has an exact closed form. Let the perturbation within the feasible manifold satisfy $`\Delta \sim \mathcal{N}(0, \Omega)`$, with projected variance $`s^2 = w^\top \Omega w > 0`$. The probability that the correct label flips while the original decision is retained is

$$
\Pr\{d(x + \Delta) < 0\} = \Pr\{w^\top \Delta < -\gamma\} = \Phi\left(-\frac{\gamma}{s}\right)
$$

Validation with $`1,000,000`$ Monte Carlo draws gave the following inherited-label error rates:
• At a margin-to-noise ratio of $`\gamma / s = 2`$, the error rate was **2.28%**.
• At $`\gamma / s = 1`$, it was **15.87%**.
• Near a diagnostic decision boundary, at $`\gamma / s = 0.25`$, it was **40.13%**.

I therefore tie case expansion to reference-answer recomputation and renewed five-level pairwise preference grading when perturbations approach or cross a decision boundary. In that event the workflow recomputes the reference solution and samples new candidate model reasoning trajectories. Domain experts then assess the pair on the five-level preference scale and identify which trajectory recognized the decisive variable whose change reversed the decision and supported its judgment with primary evidence. [HelpSteer2-Preference](https://arxiv.org/abs/2410.01257) gives a comparison point from the methods literature.

## 4 Specifying the information available to each temporal task

A cross-sectional company comparison does not require continuous-time stochastic processes. Dynamic tasks such as derivatives valuation, interest-rate term-structure interpolation, and liquidity stress tests over multiple periods do require path generators. For those I use SDEs and neural SDEs to model path distributions beyond single-time marginals ([Neural SDEs as Infinite-Dimensional GANs](https://proceedings.mlr.press/v139/kidger21b.html)). Brownian bridges and stochastic interpolation support conditioning on known intermediate observations or endpoints, following classical MathWorks stochastic interest-rate path constructions.

That conditioning can introduce temporal leakage into evaluation, and I derive the size of the effect in closed form. Consider scaled Brownian motion $`X_u = \sigma W_u`$, where $`s < t < T`$. Under squared-error loss, the optimal predictor at time $`s`$, given only the historical filtration $`\mathcal{F}_s`$, has conditional mean squared error $`\sigma^2(t - s)`$. If the generator conditions paths on the future endpoint $`X_T`$ and inadvertently exposes that conditioning to a forecasting task, Gaussian conditioning gives ([Pitman on the Brownian bridge](https://www.stat.berkeley.edu/~pitman/s205s03/b_bridge.pdf)):

$$
\operatorname{Var}(X_t \mid \mathcal{F}_s) = \sigma^2(t - s)
$$

$$
\operatorname{Var}(X_t \mid \mathcal{F}_s, X_T) = \sigma^2(t - s) - \frac{[\sigma^2(t - s)]^2}{\sigma^2(T - s)} = \sigma^2(t - s)\frac{T - t}{T - s}
$$

At the midpoint $`t = (s + T)/2`$, conditioning on $`X_T`$ halves the conditional variance. The resulting **29.29% apparent reduction in RMSE** ($`1 - 1/\sqrt{2}`$) comes entirely from the additional endpoint information in this construction, and whether that counts as a flaw depends on the task. It is temporal leakage if the forecasting task does not permit access to that information. If instead the task gives the model both endpoints $`X_s`$ and $`X_T`$ and asks it to audit an interpolation or backcast an intervening accounting period, Brownian bridge conditioning is consistent with the specified information set.

The task specification therefore keeps three information sets apart:
1. **Construction information ($`\mathcal{F}_{\text{gen}}`$):** the complete path, endpoint, or latent parameters used to generate a scenario.
2. **Permitted predictor filtration ($`\mathcal{F}_s`$):** the historical information the task allows the model to observe at decision time $`s`$.
3. **Evaluation and oracle information ($`\mathcal{F}_{\text{eval}}`$):** outcomes realized after $`s`$, reserved for scoring or for explicitly disclosed oracle baselines.

## 5 Batch Zero: independent execution and calibration for post-training data strategy

I created **Batch Zero** around the capability objectives and data requirements of post-training research teams. Before anything scales, it brings task design, synthetic data strategy, and preference supervision under a common set of acceptance criteria. It tests whether domain experts can independently execute a research specification, reproduce reference solutions, and calibrate their preference judgments. The resulting specifications support subsequent data construction.
• **Independent execution:** before a task family enters large-scale data construction (*Batch One*), doctoral-level domain experts independently write seed cases, generate synthetic variants, verify reference solutions, and assign five-level pairwise preference scores. Implicit assumptions, missing information, and ambiguities in the specification come to light this way.
• **Calibration and feedback to data strategy:** failures, expert disagreements, and boundary-case errors inform revisions to task instructions, reference solutions, grading rules, and Batch One data acceptance criteria. Task design, execution, revision, and recalibration form an iterative process.
• **Organizational adoption:** the partner foundation model company subsequently extended **Batch Zero** to other new post-training programs.

For statistical analysis and evaluation, I treat the task family as the basic unit of effective coverage and uncertainty estimation. Suppose $`G`$ independent reference-case families each yield $`k`$ synthetic variants, giving $`Gk`$ nominal records, and any two variants within a family have correlation $`\rho`$ and common variance $`\sigma_Y^2`$. Expanding the covariance sum for the sample mean gives the exact effective sample size $`N_{\text{eff}}`$:

$$
\operatorname{Var}(\bar{Y}) = \frac{Gk\sigma_Y^2 + Gk(k - 1)\rho\sigma_Y^2}{(Gk)^2} = \frac{\sigma_Y^2}{Gk}[1 + (k - 1)\rho] \implies N_{\text{eff}} = \frac{Gk}{1 + (k - 1)\rho}
$$

With $`G = 100`$ independent families, $`k = 20`$ variants per family ($`2,000`$ nominal tasks), and within-family correlation $`\rho = 0.5`$, the 2,000 records provide the same precision for estimating the mean as $`190.48`$ independent records. Ignoring this correlation understates standard errors by a factor of **$`3.24\times`$**. My data workflow therefore separates training and evaluation sets at the task-family level, and all confidence intervals account for hierarchical clustering at both the family and expert levels.

## 6 Staged validation and coverage efficiency

I evaluate whether constraint-preserving synthesis and preference supervision meet the data requirements of post-training research teams through staged, blinded comparisons across independent task families. The task mix, generator training budget, expert review budget, and final acceptance criteria stay fixed as each method is introduced:

<table header-row="true">
<tr><td>Comparison stage</td><td>Method introduced</td><td>Research and data strategy question</td></tr>
<tr><td>**Current data construction baseline**</td><td>Unconstrained generation plus expert review and rework</td><td>What is the fully loaded cost of each valid case that is ultimately accepted?</td></tr>
<tr><td>**Add manifold-constrained generation**</td><td>Hold the generator fixed; apply affine projections and variable transformations</td><td>Do invalid candidates and manual repairs decrease while the conditional distribution is preserved?</td></tr>
<tr><td>**Add decision-margin checks and reference-answer recomputation**</td><td>Recompute reference judgments when the sufficient Lipschitz margin condition fails; use $`\gamma/s`$ to quantify Gaussian label-flip risk</td><td>Do stale-label errors decrease, with valid supervision on both sides of the decision boundary?</td></tr>
<tr><td>**Apply Batch Zero acceptance criteria and filtration rules**</td><td>Jointly check the temporal information boundaries in $`\mathcal{F}_s`$, independent execution, reproducibility of reference solutions, and calibration of preference standards</td><td>Do post-training gains persist after leakage is excluded and clustering by source task family is accounted for?</td></tr>
</table>

Raw acceptance rates favor trivial variants of easy templates, and generation speed alone omits the cost of expert repairs, so I allocate data construction and review resources by scenario-weighted task-family coverage efficiency. Let $`j`$ index predefined cells in the financial capability matrix, with strategic weights $`w_j \ge 0`$ ($`\sum_j w_j = 1`$) and required counts of independent valid task families $`n_j^* > 0`$:

$$
\operatorname{Coverage} = \sum_j w_j \min\left(1, \frac{n_j^{\text{valid}}}{n_j^*}\right), \qquad \operatorname{Efficiency} = \frac{\operatorname{Coverage}}{C_{\text{generation}} + C_{\text{review}} + C_{\text{rework}} + C_{\text{adjudication}}}
$$

Once a cell reaches its target of $`n_j^*`$ independent task families, further variants of simple templates add no coverage ([Alaa et al. on synthetic data evaluation](https://proceedings.mlr.press/v162/alaa22a.html)). I combine four controls: manifold constraint enforcement, decision-margin label recomputation, separation of temporal information sets, and Batch Zero calibration. Together they define task-validity standards, execution protocols, and evaluation methods for synthetic financial preference data used in post-training.

# Project 03: verification-and-supervision-in-scientific-reasoning-tasks

**Article Title**
Verification and supervision in reasoning tasks

**Organization**
Duke University × Frontier AI Research Laboratory

**Title**
General reasoning evaluation and layered verification

**URL**
https://www.theodoreoy.com/past-experience/artificial-intelligence/verification-and-supervision-in-scientific-reasoning-tasks/

**Position**
Researcher

**Location**
Durham, North Carolina; Palo Alto, California

**Dates**
September 2023 to September 2026

**Read More Label**
Read More

## Summary

I developed a framework for evaluating and supervising general reasoning with a frontier AI research laboratory, among the first engineering implementations of joint verification across final answers, visible reasoning and execution evidence in frontier model evaluation. Code checks, LLM-as-a-Judge screening and specialist scholars work in three layers, and checkable mathematical certificates keep the supervision signals traceable.

## Key Contributions

* **I developed a joint evaluation method for answers, visible reasoning, and execution evidence.** Beginning in September 2023, I brought the model's displayed CoT, its actual tool calls and its intermediate outputs into the review workflow. I assessed the validity of conclusions, compliance with task requirements and progress during problem solving as separate dimensions. This was among the first engineering implementations of joint verification across final answers, visible reasoning and execution evidence in frontier model evaluation.
  1. I cross-check the displayed CoT against actual tool calls, return values and intermediate outputs to see whether what the model claims in its reasoning has observable support.
  2. Code or rules check directly verifiable answers, required deliverables, and approved tools and execution environments, with compliance judged against the requirements specified for the task.
  3. From elapsed time, attempt counts and changes in intermediate results I identify repeated operations, continued use of failed assumptions and attempts that add no evidence. These findings inform efficiency analysis even when the final answer is correct, and any resource limit used to determine acceptance has to be defined in the task specification beforehand.
* **I organized deliverables into proof-obligation dependency graphs ($\Gamma_q \vdash C_q$).** The graphs track domain assumptions, method applicability, evidentiary support, compliant execution, uniform approximation bounds and the strength of each conclusion. They help me locate the first unsupported step and what it affects downstream, and they allow valid alternative derivations. For tasks that admit formalization, checking local nodes and their dependencies within a sound inference system establishes the full conclusion.
* **I developed checkable error certificates and bounds on solution quality for programmatically verifiable task families under explicit mathematical assumptions.** The projected-residual optimality bound ($0 \le f(x) - v^* \le \|P_{\ker A} r\|_2^2 / (2\mu)$) splits feasibility, stationarity and the accuracy of a conclusion into separate verification obligations, and different proofs can pass by satisfying the same ones. Section 3 gives the assumptions, certificate construction and problem class.
* **I established a division of work among code or rule checks, LLM-assisted screening, and review by scholars with relevant expertise.** Code checks directly verifiable answers, tool permissions and other requirements specified in advance. LLM-as-a-Judge helps flag missing evidence, misapplied rules and gaps in reasoning, and disputed domain judgments go to specialist scholars. I also compare elapsed time, attempt counts, changes in intermediate outputs and the use of tool results to find redundant work and loops without progress, keeping those efficiency findings apart from correctness judgments.
* **I derived how false acceptance ($\alpha$) and false rejection ($\beta$) can reverse model rankings and bias the binary cross-entropy gradient used to train process reward models ($E[\nabla_s \ell(s,V) - \nabla_s \ell(s,Z) \mid h] = p(h) - \tilde{p}(h)$).** I also derived the exact tolerance-propagation rule ($a\delta + 2\varepsilon$) for bijective task transformations. Between them, these results specify when grading labels and transformed tasks support valid comparisons.
* **I tested false acceptance and false rejection on 3,600 exact-arithmetic submissions from 600 constructed strongly convex quadratic task families.** In this benchmark, 75% of invalid proofs reported the correct final value. Certificate checking accepted all 1,200 valid proofs (0.0% false rejection) and rejected all 2,400 invalid submissions (0.0% false acceptance). Final-answer matching had a 75.0% false acceptance rate and strict reference-path matching a 50.0% false rejection rate. The constructed families, defined in Section 6, test both error detection and the retention of valid alternative proofs.

## Architectural Context: Visible reasoning and execution evidence

The collaboration began in fall 2023 with an evaluation of general reasoning in frontier models. In my workflow a correct answer could coexist with unsupported assumptions, misapplied rules, or tool use that violated the task specification. Repeated calls that left the evidence and intermediate results unchanged exposed opportunities to improve execution as well. So I cross-checked final answers, the model's visible reasoning, execution records and efficiency measures, and divided the responsibilities among programmatic checks, LLM-assisted semantic screening and review by specialist scholars. The project ran to September 2026. Sections 1 through 7 describe the acceptance criteria, the mathematical certificates for a programmatically verifiable subfamily, and the associated experiments, and compare them with the methods literature, including papers published during the project.

## Manuscript

## 1 Correct answers can conceal invalid reasoning and reverse model rankings

Checking the final answer is enough only when the answer is the entire deliverable. In the OlympiadBench and Omni-MATH samples analyzed for *ProcessBench*, 32.2% and 51.8% of solutions with correct final answers still contained process errors (*[ProcessBench, Section 3.3](https://arxiv.org/html/2412.06559v2)*). Answer accuracy and the validity of a reasoning trace are distinct evaluation targets. For a task that also requires a derivation or a specified execution process, I examine domain assumptions, method applicability, supporting evidence, tool compliance, intermediate results and the conclusion. The model's displayed CoT and visible reasoning traces enter that examination as observable outputs that I cross-check against execution records. They are not direct records of its internal reasoning.

To see what this does to a score, suppose problems and model trajectories are drawn from a target capability distribution. Let $`Z = 1`$ indicate that the complete solution, including its reasoning steps and tool execution, is valid, and let $`V = 1`$ indicate that the evaluation protocol accepts it. For model $`m`$, define its true validity rate as $`\theta_m = \Pr_m(Z = 1)`$, its false acceptance rate as $`\alpha_m = \Pr_m(V = 1 \mid Z = 0)`$, and its false rejection rate as $`\beta_m = \Pr_m(V = 0 \mid Z = 1)`$. False acceptance can let through an unsupported derivation, or a tool call that produces the correct answer while violating a predefined execution requirement; false rejection can exclude a valid alternative derivation. By the law of total probability:

$$
(1) \qquad s_m = E_m[V] = \alpha_m + (1 - \alpha_m - \beta_m)\theta_m, \qquad s_m - \theta_m = \alpha_m(1 - \theta_m) - \beta_m\theta_m
$$

The term $`\alpha_m(1 - \theta_m)`$ credits invalid trajectories, while $`-\beta_m\theta_m`$ penalizes valid ones. Adding benchmark problems helps with only part of this: it reduces the sampling variance of $`\hat{s}_m`$ and leaves the structural gap $`s_m - \theta_m`$ in place. Models can also differ in how closely they adhere to evidence requirements, verification steps and tool permissions, and the resulting differences in $`\alpha_m`$ and $`\beta_m`$ can reverse their ranking. Suppose Models A and B have true validity rates of $`\theta_A = 72\%`$ and $`\theta_B = 64\%`$. If invalid trajectories pass the final-answer check with probabilities $`\alpha_A = 4\%`$ and $`\alpha_B = 36\%`$, with $`\beta_A = \beta_B = 0\%`$, their observed scores are $`s_A = 73.12\%`$ and $`s_B = 76.96\%`$, and the model with the lower rate of fully valid solutions ranks higher.

Process supervision extends evaluation to intermediate steps (*[Let's Verify Step by Step, Sections 2 and 3](https://arxiv.org/html/2305.20050v1)*). When I apply it to general post-training evaluation, I account for omissions in reference solutions, accept valid alternative methods, and enforce evidence and execution requirements defined before responses are generated. Structural simplification can explain a method or reveal redundant work. Being slower or taking more attempts, however, does not by itself make a solution incorrect, so a resource-related rejection requires a hard limit specified in advance.

## 2 Proof obligations organize layered review and allow alternative solutions

A task specification defines the domain assumptions and execution constraints $`\Gamma_q`$, the target conclusion $`C_q`$, and the proof obligations needed to establish it. A model trajectory $`\tau`$, which here means its visible reasoning and observable execution records, may get there through different intermediate lemmas, representations or orders of deduction. That is allowed, because review concerns the submitted material and whether it fulfills the task's obligations. A directed acyclic dependency graph (DAG) $`G`$ organizes the local soundness check for each node $`v_j`$, together with a global tool-compliance predicate $`\mathcal{T}_{\text{comp}}(\tau) \in \{0, 1\}`$:

$$
(2) \qquad \Gamma_q \cup \{v_k : k \in \operatorname{pa}(j)\} \vdash v_j, \qquad \Gamma_q \cup \{v_j : j \in \operatorname{sink}(G)\} \vdash C_q, \qquad \mathcal{T}_{\text{comp}}(\tau) = 1
$$

The symbol $`\vdash`$ denotes valid derivability within a sound domain inference system, and the condition $`\mathcal{T}_{\text{comp}}(\tau) = 1`$ certifies that each external tool invocation $`t \in \tau`$ belongs to the task's permitted execution environment $`\mathcal{A}_q`$. If root nodes follow from verified assumptions $`\Gamma_q`$, every dependency is sound, with its local derivation verified in that system, and $`\mathcal{T}_{\text{comp}}(\tau) = 1`$, structural induction over a topological ordering of $`G`$ establishes the full conclusion.

In production, I divided verification into three layers:
1. Code and rule checks cover the directly verifiable parts of an answer, required deliverables, and predefined restrictions on tools, execution environments and resources. Tool compliance requires $`\mathcal{T}_{\text{comp}}(\tau) = 1`$, and a call that violates an explicit hard requirement causes rejection ($`V = 0`$) even when the final answer is correct.
2. LLM-as-a-Judge assists with semantic screening. It flags insufficient evidence, misapplied rules, conclusions that exceed their premises and gaps in reasoning, and it links each concern to the relevant trace, tool response or intermediate output. These flags help direct further review.
3. Scholars with relevant expertise take the questions that require domain judgment, admit several reasonable interpretations, or remain disputed after the first two checks. They examine the evidence, the applicability of the method and the conclusion, and a question that cannot be resolved from the available evidence stays open.

All three layers work from the same observable material. I cross-check the model's displayed CoT and visible reasoning against actual tool calls, intermediate outputs, elapsed time and attempt counts. For each attempt I look for new evidence, revised premises or a change in the state of the solution. That is how I identify repeated calls, continued use of failed assumptions and loops that make no progress. Where the necessary execution records are missing, conclusions remain unverified. I record efficiency separately from correctness and compliance. Long runtimes, repeated attempts or exhaustive methods can warrant efficiency analysis, but they affect acceptance only when they violate a predefined hard limit.

Method applicability also needs its own check, because pointwise convergence at a fixed parameter value does not establish that an approximation remains valid within an optimization, an integral or an exchange of limits. A claim about the order of accuracy requires an approximation parameter, its domain of validity and a uniform error bound. When such issues cannot be decided programmatically, an LLM can help locate a concern and a specialist scholar can review the assumptions and derivation. That review carries a different evidentiary status from a checkable formal certificate.

For feedback, I record the first failed obligation at node $`v_j`$ and mark its descendant subgraph $`\operatorname{desc}(v_j)`$ as unverified, since locally correct calculations under a false premise do not repair the full derivation. This treatment addresses the ambiguity after an error discussed in *[ProcessBench, Section 3.1](https://arxiv.org/html/2412.06559v2)*. A suspected error awaiting specialist review remains unresolved until that review is complete.

## 3 Error certificates for a programmatically verifiable subfamily

To test the programmatic layer, I use an optimization subfamily whose constraints and certificates can be checked explicitly. It shows whether certificate checks reject invalid submissions while retaining valid alternative proofs. Consider the equality-constrained strongly convex quadratic problem:

$$
(3) \qquad v^* = \min_{Ax = b} f(x), \qquad f(x) = \frac{1}{2}x^\top H x + c^\top x, \qquad H \succeq \mu I, \quad \mu > 0
$$

Here $`H`$ is symmetric, $`Ax = b`$ is feasible, and $`\mu > 0`$ is a verified lower bound on curvature. For any feasible candidate $`x`$ satisfying $`Ax = b`$, choose any dual multiplier vector $`\nu`$ and define the stationarity residual $`r = Hx + c + A^\top \nu`$. Strong convexity gives the first inequality below for every feasible displacement $`d \in \ker A`$, and completing the square in $`d`$ gives an exact optimality error certificate:

$$
(4) \qquad f(x + d) \ge f(x) + r^\top d + \frac{\mu}{2}\|d\|^2
$$

$$
\inf_{d \in \ker A} \left( r^\top d + \frac{\mu}{2}\|d\|^2 \right) = -\frac{\|P_{\ker A} r\|_2^2}{2\mu}
$$

$$
0 \le f(x) - v^* \le \frac{\|P_{\ker A} r\|_2^2}{2\mu}
$$

The operator $`P_{\ker A}`$ is the orthogonal projection onto the space of feasible directions $`\ker A`$. It removes residual components normal to the constraints, which do not affect optimality along the feasible manifold (*[Boyd and Vandenberghe, Convex Optimization, Sections 5.5 and 9.1](https://web.stanford.edu/~boyd/cvxbook/bv_cvxbook.pdf)*). A zero projected residual, $`P_{\ker A} r = 0`$, certifies exact optimality, and otherwise the certificate bounds the suboptimality gap in objective units. Two kinds of submission fare differently under this check:
• Solutions derived through Lagrange multipliers or by eliminating the equality constraints can satisfy the same semantic obligations and pass verification.
• Reporting the correct optimal value $`v^*`$ alone does not fulfill these obligations. Feasibility and the claimed objective value have to be checked separately. A submission that claims a KKT multiplier witness must also have its full stationarity equation $`Hx+c+A^\top\nu=0`$ verified, because the projected-residual bound cannot validate that multiplier, given that $`P_{\ker A}A^\top\nu=0`$ for every $`\nu`$. A valid equality-elimination proof need not supply a multiplier witness.

I carry the lessons from this subfamily over to the structure of general review: check the inputs and assumptions, compliance with the execution specification, support for the derivation, and whether the conclusion exceeds the evidence. Obligations that admit programmatic checks go to rules or certificate verifiers, and other semantic questions go through LLM-assisted screening and specialist review. Structural simplification may explain why a method needs less repeated work, but efficiency gains and validity certificates are evaluated separately.

## 4 Task transformations must propagate error bounds

Symbolic templates parameterize variable domains and answer formulas (*[GSM-Symbolic, Section 3.1](https://arxiv.org/html/2410.05229v1)*). Tasks with formalizable transformations also need verifiable rules for how those transformations affect feasible sets, objective values and acceptance tolerances. I derived the exact tolerance-propagation rule below for bijective task transformations.

Let an original problem and its transformed variant have feasible sets $`F`$ and $`F'`$, objectives $`J`$ and $`J'`$, and finite infima $`v`$ and $`v'`$. Suppose the task designer verifies a bijection $`\Phi : F \to F'`$ such that every feasible $`u \in F`$ satisfies the uniform bound:

$$
(5) \qquad |J'(\Phi(u)) - aJ(u) - b| \le \varepsilon, \quad a > 0
$$

$$
av + b - \varepsilon \le v' \le av + b + \varepsilon
$$

$$
J(u) - v \le \delta \implies J'(\Phi(u)) - v' \le a\delta + 2\varepsilon
$$

Taking infima in the first line gives the second, and subtracting the lower bound on $`v'`$ from the upper bound on $`J'(\Phi(u))`$ gives the third. So after a unit conversion, parameter rescaling or numerical transformation with error bounded by $`\varepsilon`$, the result determines the acceptance tolerance for a previously $`\delta`$-optimal solution. Keeping the original tolerance $`\delta`$ can misclassify a valid transformed solution as a model failure, while relaxing it arbitrarily can conceal a real capability gap. When $`\varepsilon = 0`$, the bijection and positive scaling $`a > 0`$ also preserve whether an optimum is attained. Changes to boundary compactness or admissible control classes require a new attainment proof.

## 5 Grading errors change the post-training objective

Step-level labels can improve post-training only if they measure logical validity and compliance, because systematic grading errors pass into the targets used by process reward models (PRMs) and RLHF policies. Let $`h`$ denote the task input and the model's visible reasoning prefix through the current step. Let $`Z = 1`$ indicate that the step is valid under the problem's assumptions, and let $`V \in \{0, 1\}`$ be the grader's noisy acceptance label, with conditional false acceptance $`\alpha(h)`$ and false rejection $`\beta(h)`$. Writing $`p(h) = \Pr(Z = 1 \mid h)`$, a process evaluator with logit $`s`$ trained by binary cross-entropy is optimized toward the corrupted conditional target:

$$
(6) \qquad \tilde{p}(h) = \alpha(h) + [1 - \alpha(h) - \beta(h)]p(h)
$$

$$
\frac{\partial \ell(s, V)}{\partial s} = \sigma(s) - V
$$

$$
E[\nabla_s \ell(s, V) - \nabla_s \ell(s, Z) \mid h] = p(h) - \tilde{p}(h)
$$

The expected gradient difference shows which way grading bias moves the training target:
• If false rejection dominates, $`\beta(h)p(h) > \alpha(h)[1-p(h)]`$, then $`\tilde{p}(h) < p(h)`$. The learned validity target shifts downward, which penalizes valid alternative proofs.
• If false acceptance dominates, $`\alpha(h)[1-p(h)] > \beta(h)p(h)`$, then $`\tilde{p}(h) > p(h)`$. The target shifts upward, rewarding flawed proofs or noncompliant tool calls. When the weighted contributions are equal, the effects cancel in the conditional mean.

When $`\alpha, \beta`$ are known constants with $`\alpha + \beta < 1`$, class-conditional noise correction can remove bias from the mean estimate (*[Learning with Noisy Labels, Sections 2 and 3](https://papers.nips.cc/paper_files/paper/2013/file/3871bd64012152bfb53fdf04b401193f-Paper.pdf)*), at the cost of increasing variance by the following squared factor:

$$
(7) \qquad \hat{\theta}_{\text{corr}} = \frac{\bar{V} - \alpha}{1 - \alpha - \beta}, \qquad \operatorname{Var}(\hat{\theta}_{\text{corr}}) = \frac{\operatorname{Var}(\bar{V})}{(1 - \alpha - \beta)^2}
$$

For task families whose validity is exactly decidable by a sound and complete certificate verifier, $`\alpha=\beta=0`$ removes this variance penalty. The stress test below evaluates the certificate method within such a programmatically decidable subfamily. Error rates for LLM-assisted labels and specialist review require separate calibration samples.

## 6 Reproducible tests of false acceptance and false rejection

I constructed 600 strongly convex quadratic task families to test the certificate verifier within this subfamily. Using exact rational arithmetic, I generated 6 algebraic submissions per family, for 3,600 submissions in total:
• 1,200 valid certificates, 2 per family: one derived using Lagrange multipliers and one using equality elimination.
• 2,400 submissions with controlled defects, 4 per family: (1) an infeasible construction, $`Ax \neq b`$, that yields the exact optimal value $`v^*`$; (2) failure of stationarity along a feasible direction in $`\ker A`$ while reporting $`v^*`$; (3) a claimed multiplier that fails the stationarity equation while reporting $`v^*`$; and (4) an incorrect final objective value. The first three classes, comprising 1,800 submissions or 75% of all invalid submissions, report the correct final answer $`v^*`$.

I compared three deterministic acceptance protocols on all 3,600 submissions:

<table header-row="true">
<tr><td>Acceptance protocol</td><td>False acceptance rate on invalid certificates ($`2,400`$)</td><td>False rejection rate on valid certificates ($`1,200`$)</td><td>Valid share of accepted submissions</td></tr>
<tr><td>Final-answer matching only</td><td>75.0% (accepts 1,800 flawed solutions)</td><td>0.0%</td><td>40.0%</td></tr>
<tr><td>Strict reference-path matching (ablation)</td><td>0.0%</td><td>50.0% (rejects 600 valid elimination proofs)</td><td>100.0%</td></tr>
<tr><td>Semantic certificate verification (programmatic checks for this subfamily)</td><td>0.0%</td><td>0.0%</td><td>100.0%</td></tr>
</table>

Within this exact-arithmetic benchmark, semantic certificate verification accepted 1,800 fewer invalid proofs than final-answer matching and retained 600 more valid alternative solutions than strict reference-path matching. It also passed all 600 feasible-perturbation checks on the projected-residual bound in Equation (4). Semantic certificate verification here means checking the constraints, objective value and certificate conditions explicitly. The reported error rates are those of the certificate verifier on this constructed benchmark, and LLM-assisted screening and review by specialist scholars are evaluated separately.

## 7 Dependence within task families and the cost of expert review

Surface variations of one problem template do not provide independent observations of general reasoning ability. Suppose there are $`F`$ independent task families, each with $`K`$ variants, common marginal variance $`\sigma^2`$, and common pairwise within-family correlation $`\rho`$. The variance of the sample mean and the effective sample size $`n_{\text{eff}}`$ are:

$$
(8) \qquad \operatorname{Var}(\bar{Z}) = \frac{\sigma^2}{FK}[1 + (K - 1)\rho], \qquad n_{\text{eff}} = \frac{FK}{1 + (K - 1)\rho}
$$

For $`F = 50`$ families with $`K = 8`$ variants each, there are $`400`$ responses, and if $`\rho = 0.6`$, those $`400`$ responses provide the same precision as $`n_{\text{eff}} \approx 77`$ independent observations. Training and test sets therefore need to be split by task family, and new tasks should vary assumptions, evidentiary relationships or the structure of a derivation, beyond simply substituting numbers.

Within the programmatically verifiable subfamily, I account for the cost of certificate verification and human review separately. The following model compares automated certificate checking with the original workflow of reviewing every submission; the full three-layer process also incurs costs for model calls, calibration and review of disputed cases. Let $`C_0`$ be the upfront engineering cost of the proof-obligation certificates and verifier, $`c_e`$ the original expert review cost per submission, $`c_v`$ the automated verifier's unit execution cost, and $`u`$ the fraction of submissions escalated to human adjudication. Once false acceptance and false rejection standards are met, assume unit costs are stable and the same expert unit cost applies to escalated cases. The certificate workflow then reduces total cost when submission volume $`N`$ exceeds:

$$
(9) \qquad C_0 + N(c_v + uc_e) < Nc_e \iff N > \frac{C_0}{(1 - u)c_e - c_v}, \qquad (1 - u)c_e > c_v
$$

The evaluation workflow I developed combines task specifications, visible reasoning, execution evidence and layered review, with exact certificates where the problem class permits them. I report correctness, compliance and efficiency separately, which preserves the scope and evidentiary status of each assessment.

# Project 04: evidence-uncertainty-and-decision-guarantees-in-investment-research

**Article Title**
Evidence uncertainty and decision guarantees in investment research

**Organization**
Duke University × Leading Global Alternative Asset Manager

**Title**
Evidence verification and robust comparison in investment research

**URL**
https://www.theodoreoy.com/past-experience/artificial-intelligence/evidence-uncertainty-and-decision-guarantees-in-investment-research/

**Position**
Researcher

**Location**
Durham, North Carolina; Washington, DC

**Dates**
September 2023 to September 2026

**Read More Label**
Read More

## Summary

I developed and implemented a framework for evidence verification and decision assurance with a leading global alternative asset manager, one of the first engineering implementations in institutional investment research to treat model multiplicity, unverified evidence and the cost of verification jointly. It scores companies across a Rashomon model set, bounds ranking stability and tells analysts which fact to verify next.

## Key Contributions

* **I studied what AI-polished corporate narratives do to LLM-assisted scoring, ESG ratings and investment analysis when the claims underneath them lack factual support.** I brought corporate claims, cross-document contradictions and shared reporting errors into a common review process so that verification in private-market and ESG research could be targeted.
* **I turned institutional diligence requirements into measures of score reliability, pairwise ranking stability and verification priority.** The workflow I implemented ingests evidence, scores companies across a Rashomon model set, computes ranking bounds, and allocates verification effort by minimax regret. Each correction triggers rescoring and attribution updates, so the investment committee has a traceable basis for its analysis. This was among the first engineering implementations in institutional investment research to treat model multiplicity, unverified evidence and the cost of verification jointly.
* **I converted operating reports, audited financial statements, sustainability disclosures, management questionnaires and third-party datasets into structured scoring rules that carry source and version records.** AI-assisted checks then pick out unsupported claims and contradictions across documents for targeted factual review.
* **I deployed gradient-boosted trees and deep learning models for tabular data to capture nonlinear thresholds and interactions.** SHAP attributions across a near-optimal Rashomon set ($\mathcal{F}_\alpha$), read together with conditional Shapley analysis, measure sensitivity to model choice and identify the scoring factors whose contributions stay stable across models.
* **I derived failure cases for conventional bootstrap resampling, and for verification priorities based on raw SHAP magnitudes, when inputs contain shared reporting bias or unverified claims.** I represented unresolved evidence $\mathcal{X}(E)$ jointly with the Rashomon set $\mathcal{F}_\alpha$ through $\Omega(E) = \mathcal{F}_\alpha \times \mathcal{X}(E)$ and derived convex support-function bounds ($h_U(a_f)$). Common measurement errors cancel when the two companies have identical exposures. In a synthetic comparison, the joint model certified a 0.6-point advantage that the difference bound from separate company intervals ($[-1.4, 2.6]$) could not show.
* **I derived a query criterion that needs no probability distribution over the scenarios inside the specified joint uncertainty set.** It prioritizes the reduction in worst-case decision regret that a query can guarantee. For unequal query costs, $V(q)/c_q$ gives a one-step efficiency measure. In an eight-scenario benchmark with one equal-cost query, targeted verification cut worst-case regret from 0.61 score units to zero, whereas rechecking an already verified feature with a large SHAP attribution reduced regret by zero.

## Architectural Context: Corporate evidence and the allocation of verification effort

AI-polished narratives, unverified sustainability claims and common reporting errors can all move ESG and investment scores, so institutional diligence has to account for uncertainty in the corporate evidence as well as in the scoring models. The architecture I developed takes a traceable evidence state as its input and builds in model multiplicity, joint measurement error and the costs of verification. Sections 1 through 6 go through the limits of attribution methods, the joint uncertainty model, ranking bounds, the query criterion, versioned updates, and analytical benchmarks.

## Manuscript

## 1 Feature attribution and the value of verification

[SHAP](https://arxiv.org/abs/1705.07874) splits a model prediction into additive feature contributions through its local accuracy property. Conditional Shapley methods also account for dependence among features, and Rashomon-set methods check how stable explanations are across near-optimal models ([SHAP](https://arxiv.org/abs/1705.07874); [Aas et al.](https://arxiv.org/html/1903.10464v3); [Marx et al.](https://proceedings.mlr.press/v206/marx23a.html)). None of them establishes whether the corporate inputs $`x`$ are factually correct, and in investment diligence that is an open question, because self-reported disclosures may contain AI-polished greenwashing. So an analyst also needs to know which corrections to the evidence could change a decision, and my framework is built to answer that question.

The first failure case I derive concerns verification priorities based on raw attribution magnitudes. Take a linear scoring model with a fixed marginal background distribution $`Q`$. The [SHAP](https://arxiv.org/abs/1705.07874) attribution for feature $`j`$ is $`\phi_j = \beta_j(x_j - E_Q X_j)`$. If the feature has unresolved factual uncertainty bounded by $`|\delta_j| \le d_j`$, its sensitivity to verification is $`|\beta_j|d_j`$, and over a box of admissible evidence errors the exact worst-case change in the company score is

$$
\sup_{|\delta_j| \le d_j} |f(x + \delta) - f(x)| = \sum_j |\beta_j| d_j
$$

The upper bound comes from the triangle inequality, and it is attained by picking the endpoint of each error interval so that every perturbation pushes the score in the same direction. Apart from the coefficient, that sum depends on how wide the errors are, whereas the attribution depends on where the feature sits relative to the background. Attribution magnitude and verification value therefore need separate calculations. Two cases show the difference:
• A financial metric may have a large [SHAP](https://arxiv.org/abs/1705.07874) attribution $`|\phi_j|`$ and come from audited filings that have already been verified ($`d_j \approx 0`$). Further checks of that field then do little to reduce score uncertainty.
• A self-reported ESG or operating metric may lie near the sector mean ($`x_j \approx E_Q X_j \implies \phi_j \approx 0`$) and so receive a near-zero [SHAP](https://arxiv.org/abs/1705.07874) attribution. Substantial unresolved reporting error ($`d_j \gg 0`$) may still be enough to reverse a company ranking.

The second failure case concerns conventional resampling: redrawing existing records cannot, by itself, identify a shared reporting or AI-marketing bias. Suppose $`n`$ reported observations satisfy $`X_i = \mu + b + \varepsilon_i`$, where $`\varepsilon_i \sim \mathcal{N}(0, \sigma^2)`$ are independent errors and $`b \neq 0`$ is an unmodeled bias common to all records, as with systematic overstatement across a sector or coordinated AI-assisted public relations. A conventional nominal 95% normal confidence interval centered on the sample mean $`\bar{X}`$ covers the true parameter $`\mu`$ with probability

$$
\Pr\left\{ \mu \in \left[ \bar{X} - z\frac{\sigma}{\sqrt{n}}, \ \bar{X} + z\frac{\sigma}{\sqrt{n}} \right] \right\} = \Phi\left( z - \frac{b\sqrt{n}}{\sigma} \right) - \Phi\left( -z - \frac{b\sqrt{n}}{\sigma} \right) \longrightarrow 0 \quad (\text{as } n \to \infty)
$$

where $`z = \Phi^{-1}(0.975) \approx 1.96`$. With a fixed nonzero common bias, a larger sample ($`n \to \infty`$) reduces random variance while the interval's coverage of the true parameter tends to zero. Bootstrapping the same biased records adds no information that identifies $`b`$. Bounding the common bias takes external evidence, and the ranking analysis then has to retain the resulting uncertainty.

## 2 Joint uncertainty over models and evidence

I represent model multiplicity and unresolved evidence jointly to assess whether an ESG or investment ranking stays stable under admissible changes to either.

On the model side, I fix the prediction target, input definitions and output scale, and let $`\mathcal{F}_0`$ contain $`M`$ candidate scoring models specified before examining the validation data. The validation set consists of $`n`$ i.i.d. observations from the target evaluation distribution, independent of model construction, and the loss is bounded in $`[0, 1]`$. For a failure probability $`\alpha \in (0, 1)`$, Hoeffding's inequality and a union bound give

$$
\Pr\left\{ \max_{f \in \mathcal{F}_0} |\hat{L}_n(f) - L(f)| \le t_n \right\} \ge 1 - \alpha, \qquad t_n = \sqrt{\frac{\log(2M / \alpha)}{2n}}
$$

Let $`f^*`$ minimize population loss within $`\mathcal{F}_0`$. I retain every model whose empirical validation loss is within $`2t_n`$ of the empirical minimum, which defines an empirical Rashomon set:

$$
\mathcal{F}_\alpha = \left\{ f \in \mathcal{F}_0 : \hat{L}_n(f) \le \min_{g \in \mathcal{F}_0} \hat{L}_n(g) + 2t_n \right\}
$$

On the simultaneous concentration event, $`\hat{L}_n(f^*) \le L(f^*) + t_n \le \min_g \hat{L}_n(g) + 2t_n`$, so $`f^* \in \mathcal{F}_\alpha`$ and every retained model has population excess loss at most $`4t_n`$ ([Marx et al.](https://proceedings.mlr.press/v206/marx23a.html)).

On the evidence side, $`\mathcal{X}(E)`$ represents the questions still unresolved under the current diligence state $`E`$: entity boundaries, reporting periods, physical units, measurement definitions, shared third-party sources and suspected greenwashing claims. Each $`X \in \mathcal{X}(E)`$ specifies a joint input configuration for all candidate companies at once, and that is how error dependence across companies and fields is preserved. Over the joint space $`\Omega(E) = \mathcal{F}_\alpha \times \mathcal{X}(E)`$, the exact worst-case bounds on the score difference between companies $`i`$ and $`k`$ are

$$
\underline{\Delta}_{ik} = \inf_{(f, X) \in \Omega(E)} [f(x_i) - f(x_k)], \qquad \overline{\Delta}_{ik} = \sup_{(f, X) \in \Omega(E)} [f(x_i) - f(x_k)]
$$

If $`\underline{\Delta}_{ik} > 0`$, the ordering $`i \succ k`$ holds for every retained model in $`\mathcal{F}_\alpha`$ and every admissible resolution of the evidence in $`\mathcal{X}(E)`$. Turning that into a probability statement takes an assumption about the evidence set. Suppose calibration establishes that $`\mathcal{X}(E)`$ contains the true inputs with probability at least $`1 - \beta`$ at the specified certification stage. A union bound then gives joint inclusion of $`f^*`$ and the true inputs with probability at least $`1 - \alpha - \beta`$. The unconditional probability of issuing a certificate that is false for $`f^*`$ at the true inputs is therefore at most $`\alpha + \beta`$. The union bound needs no independence between model validation and evidence calibration.

That guarantee covers the score ordering of the best model in the prespecified class at the true inputs. The adequacy of that class and realized investment outcomes lie outside it. If certification is adaptive and repeated over several stages, the calibration has to be jointly valid across those stages.

## 3 Computing comparison bounds with support functions

I derive the joint comparison bounds with convex support functions, which make them tractable ([Ben-Tal and Nemirovski](https://www2.isye.gatech.edu/~nemirovs/MOR_RCO_1998.pdf)). Let $`u \in U`$ collect the unresolved factual quantities, including common benchmark errors and company-specific allowances for reporting error, and write company inputs as $`x_i(u) = \bar{x}_i + B_i u`$. For an affine scoring model, the pairwise difference is $`\Delta_f(u) = m_f + a_f^\top u`$, where $`a_f = (B_i - B_k)^\top \beta_f`$, and the support function $`h_U(a) = \sup_{u \in U} a^\top u`$ gives exact comparison bounds:

$$
\inf_{u \in U} \Delta_f(u) = m_f - h_U(-a_f), \qquad \sup_{u \in U} \Delta_f(u) = m_f + h_U(a_f)
$$

For the ellipsoidal uncertainty set $`U = \{Cz : \|z\|_2 \le r\}`$, the Cauchy-Schwarz inequality gives $`h_U(a_f) = r\|C^\top a_f\|_2`$. For an $`\ell_\infty`$ box centered at zero, $`h_U(a_f)`$ reduces to a weighted sum of absolute values.

Keeping everything in one joint representation lets shared errors cancel exactly in a pairwise comparison. Let $`S`$ index common-source coordinates on which the two companies have identical loadings, so that $`(B_i-B_k)_{:,S}=0`$. Under the same linear scoring model,

$$
(a_f)_S=0,\qquad \Delta_f(u)=m_f+(a_f)_{S^c}^{\top}u_{S^c}
$$

The common-source contribution cancels, and company-specific uncertainty stays in the support-function bound. If every uncertain direction cancels, $`a_f=0`$ and $`h_U(\pm a_f)=0`$. Subtracting intervals constructed separately for companies $`i`$ and $`k`$ loses this, because it lets a shared source move in opposite directions at the same time. That combination is incompatible with the joint error structure, and it produces an unnecessarily wide difference bound.

For a smooth nonlinear model, set $`m_f=\Delta_f(0)`$ and $`a_f=\nabla\Delta_f(0)`$. If $`\Delta_f(u)`$ is twice continuously differentiable on $`\|u\|_2 \le r`$ and its Hessian has operator norm bounded by $`K_f`$, Taylor's theorem gives

$$
|\Delta_f(u) - m_f - a_f^\top u| \le \kappa_f, \qquad \kappa_f = \frac{1}{2}K_f r^2 \implies \underline{\Delta}_f \ge m_f - r\|a_f\|_2 - \kappa_f
$$

Nonsmooth tree ensembles get their bounds from leaf-region partitioning or mixed-integer linear programming. The implementation spends computation first on company pairs whose difference bounds are close to the zero decision boundary.

## 4 Selecting queries by the regret they can remove

When $`\underline{\Delta}_{ik} \le 0 < \overline{\Delta}_{ik}`$, the ranking is unresolved, since a factual correction or a resolution of ambiguous evidence could change the decision. The system then prioritizes the next verification query $`q`$, such as reviewing a supplier contract, requesting original utility bills, or checking a regulatory filing.

Let $`A`$ be a finite set of institutional actions, such as advancing company $`i`$ or company $`k`$ to final diligence, or deferring a rating. Let $`U(a, \omega)`$ be the prespecified utility of an action in scenario $`\omega \in \Omega`$, where $`\Omega`$ is nonempty and utilities are uniformly bounded. The baseline minimax regret over deterministic actions is

$$
R^*(\Omega) = \min_{a \in A} \sup_{\omega \in \Omega} \left[ \max_{b \in A} U(b, \omega) - U(a, \omega) \right]
$$

A query $`q`$ returns an observation $`o \in O_q`$ and restricts the compatible scenarios to a nonempty subset $`\Omega_{q,o} \subseteq \Omega`$. I score the query by its guaranteed reduction in worst-case decision regret:

$$
V(q) = R^*(\Omega) - \sup_{o \in O_q} R^*(\Omega_{q,o}) \ge 0
$$

Nonnegativity follows from $`\Omega_{q,o} \subseteq \Omega`$: restricting the scenario set cannot increase worst-case regret for any fixed action, and minimizing over $`a \in A`$ preserves that inequality ([Robust Active Preference Elicitation](https://arxiv.org/html/2003.01899)). Calculating $`V(q)`$ uses the set of compatible scenarios and requires no prior probability that a disclosure is exaggerated. At a fixed evidence state, maximizing $`V(q)`$ over affordable queries minimizes worst-case regret after one query. With positive, unequal costs $`c_q`$, the ratio $`V(q)/c_q`$ is a one-step efficiency heuristic. Complementary or sequential queries require joint or adaptive optimization under the total diligence budget $`B`$.

## 5 Propagating factual corrections through scores and attributions

When diligence resolves a query and the verified evidence vector changes from $`x`$ to $`x'`$, the system follows versioned dependencies to recompute the affected scores, peer rankings and [SHAP](https://arxiv.org/abs/1705.07874) explanations. With the scoring function $`f`$, background reference $`Q`$ and rubric version held fixed, Shapley efficiency gives the exact identity ([SHAP local accuracy](https://arxiv.org/pdf/1705.07874)):

$$
f(x) = \phi_0 + \sum_j \phi_j(f, Q, x), \qquad \sum_j [\phi_j(f, Q, x') - \phi_j(f, Q, x)] = f(x') - f(x)
$$

Approximate Shapley outputs meet this only up to a residual. Suppose their efficiency residuals are $`|\phi_0+\sum_j\phi_j-f(x)|\le\eta`$ and $`|\phi_0+\sum_j\phi'_j-f(x')|\le\eta'`$ under the same baseline $`\phi_0`$. The triangle inequality then gives the recomputation check $`|\sum_j \Delta \phi_j - \Delta f| \le \eta + \eta'`$. A pass verifies aggregate conservation. The accuracy of individual attributions and the truth of the evidence are separate questions.

Every database update records `(field version, evidence document ID, model version, background Q, rubric version)`. With these identifiers, a change caused by a factual correction can be told apart from one caused by a model update or a change to the background distribution.

## 6 Reproducible quantitative comparisons

I tested the mechanisms in the analytical benchmarks below, under explicit model and parameter settings.

1. **Confidence interval coverage under common reporting bias.**
• Set the shared bias to $`b = 0.2`$ and independent noise to $`\sigma = 1`$. If the common bias $`b`$ is ignored, a nominal 95% interval has actual coverage of 48.40% at $`n = 100`$ records and 0.000637% at $`n = 1,000`$. Once targeted verification shows $`|b| \le 0.2`$, raising the half-width to $`0.2 + 1.96/\sqrt{n}`$ gives 97.50% actual coverage.
2. **Cancellation of shared errors in pairwise rankings.**
• Two companies have a nominal score difference of $`0.6`$ points and share an additive sector-benchmark error in $`[-1, 1]`$. Subtracting separately constructed company intervals gives $`[-1.4, 2.6]`$, which cannot certify the ordering, whereas the joint support-function calculation cancels the shared error and gives $`[0.6, 0.6]`$, which certifies the ranking.
3. **Minimax-regret verification compared with [SHAP](https://arxiv.org/abs/1705.07874) magnitude.**
• Consider a single query, with the same cost for each query option. The benchmark has 8 scenarios, which come from 2 candidate models in the Rashomon set ($`s \in \{-1, 1\}`$) and 4 unresolved evidence configurations ($`z_1 \in \{-0.4, 0.4\}`$, $`z_2 \in \{-0.2, 0.2\}`$). The pairwise score difference is $`\Delta_s = 0.15s + z_1 + 0.3s z_2`$. A further shared feature has a large [SHAP](https://arxiv.org/abs/1705.07874) attribution but is already verified ($`d_0 = 0`$). The action is to select company $`i`$ or company $`k`$, and regret is measured in model-score units.

<table header-row="true">
<tr><td>Verification query</td><td>Remaining regret under the worst observation</td><td>Guaranteed regret reduction $`V(q)`$</td></tr>
<tr><td>Recheck the verified field with a large [SHAP](https://arxiv.org/abs/1705.07874) attribution</td><td>0.61</td><td>0</td></tr>
<tr><td>Verify the smaller unresolved variable $`z_2`$</td><td>0.61</td><td>0</td></tr>
<tr><td>Verify $`z_1`$, which determines the sign of the score difference</td><td>0</td><td>0.61</td></tr>
</table>

Enumerating the eight scenarios shows that rechecking the verified field with a large [SHAP](https://arxiv.org/abs/1705.07874) attribution produces no regret reduction ($`V(q) = 0`$), while verifying $`z_1`$ takes worst-case regret from 0.61 to zero. So in this benchmark, verification value depends on how unresolved evidence can affect the decision. The Rashomon model set, support-function bounds and minimax-regret criterion make that relationship computable under the specified uncertainty model, and versioned data updates carry the result into the research workflow.
