---
description: How much dependence stress erases a diversification gain under fixed marginals: a variational limit, a quadratic critical budget, the marginal-restoration premium and projected flow duality.
---

## Abstract

We ask how much dependence uncertainty a diversification benefit can withstand when every marginal loss law is fixed. Our measure is the smallest weighted $`1`$-Wasserstein perturbation that reverses the Expected Shortfall ranking of two nearby allocations evaluated under a common stressed law. For a positive continuous density on a compact box, exchangeability of the two traded positions eliminates the first-order gain, so the stress radius to study is $`\rho=s\varepsilon^2`$ for trade size $`\varepsilon`$. At this scale we obtain a $`\Gamma`$-limit for the rescaled transport energies and prove convergence of the paired risk differences, with the two ES thresholds optimized separately. Coordinatewise quantile restoration incurs a marginal-flux cost, although its leading effects on the two ES values cancel in their difference. The limiting risk profile is continuous and strictly increasing, and its unique zero is the common leading coefficient of the budgets for a tie and for a strict reversal. We introduce the *marginal-restoration premium*, the excess of that coefficient over the local-efficiency lower bound, and prove that it vanishes exactly when background displacement is cheapest per unit change in portfolio loss. Otherwise it is strictly positive, even when the profile is exactly linear on an initial interval. For independent uniform losses on $`[0,2]^3`$ with $`\beta=1`$, $`p=1/2`$, and $`\gamma=(1,1,2)`$, the premium is at least $`30\%`$ of the local-efficiency bound. At equal effective costs, we characterize the right derivative of the critical coefficient with respect to the background penalty by continuous maximum-flow/minimum-cut duality.

<a id="dep-dependence-risk-in-a-reallocation-with-unchanged-acquisition-cost"></a>

## 1. Introduction

A risk desk may have agreed marginal models for its individual positions without an equally well-determined model for their joint losses with the background book [[31](#ref-pflugpohl2018)]. That leaves open how much of a portfolio's diversification benefit survives uncertainty about dependence. We study the question by keeping the marginal models, letting the coupling change, and looking for the smallest dependence perturbation that reverses the Expected Shortfall (ES) advantage of a proposed reallocation when both allocations face the same stressed law. We develop a variational framework for this critical stress. It yields a critical-scale $`\Gamma`$-limit, a common critical coefficient for a tie and a strict reversal, the marginal-restoration premium with its zero-premium classification, a flow–cut characterization, at equal effective costs, of the premium's sensitivity to background cost, and a uniform benchmark in which the asymptotic reversal budget is at least $`30\%`$ above the initial-slope prediction.

Let $`X_1,X_2`$ be the unit losses of two positions of equal initial cost. A transfer from holdings $`(1+\varepsilon,1-\varepsilon)`$ to $`(1,1)`$, with an unchanged background loss $`\beta X_3`$, changes the portfolio loss from $`A_\varepsilon=(1+\varepsilon)X_1+(1-\varepsilon)X_2+\beta X_3=B+\varepsilon H`$ to $`B`$, where

$$
B=X_1+X_2+\beta X_3,\qquad H=X_1-X_2,\qquad \beta>0.
$$

At upper-tail probability $`p\in(0,1)`$, we compare them through $`\Phi_\varepsilon(P)=ES_p^P(B)-ES_p^P(A_\varepsilon)`$, optimizing the two ES thresholds separately under $`P`$ [[32](#ref-rockafellar2002)], so that $`\Phi_\varepsilon(P)<0`$ favors the transfer under that law. The background term $`\beta X_3`$ cancels from the payoff difference $`A_\varepsilon-B`$, yet we cannot drop it, because its dependence with the traded positions determines which states enter each portfolio's upper tail. A trade assessed in isolation can therefore rank differently once embedded in the whole book [[8](#ref-brandtner2018)].

Writing $`\Pi`$ for the Fréchet class of joint laws with these marginals, we measure distance from the reference law $`P_0`$ by weighted $`W_1`$ with ground cost $`c_\gamma(x,y)=|y-x|_\gamma=\sum_i\gamma_i|y_i-x_i|`$, where each $`\gamma_i>0`$ sets the budget penalty per unit coordinate loss displacement as losses are re-paired across joint states. At budget $`\rho`$, the stress problem is

$$
D_\varepsilon(\rho)
=\sup_{\substack{P\in\Pi\\ W_\gamma(P,P_0)\le\rho}}
\bigl\{ES_p^P(B)-ES_p^P(A_\varepsilon)\bigr\},
\qquad m_\varepsilon=-D_\varepsilon(0).
$$

Under an exchangeable reference law the traded positions have equal marginal ES contributions, so the nominal gain is of second order: $`m_\varepsilon=(J/p)\varepsilon^2+o(\varepsilon^2)`$, with $`J>0`$. When $`\gamma_1\le\min\{\gamma_2,\gamma_3/\beta\}`$, for example, the local exchange in Proposition [2.2](#dep-prop-nominal-benchmark) attains an initial stress derivative $`K_\varepsilon`$ of order one, which suggests the reversal budget $`r_{0,\varepsilon}=m_\varepsilon/K_\varepsilon=O(\varepsilon^2)`$. The derivative at zero budget does not determine whether this efficiency persists until the nominal gain is exhausted. The predicted reversal already sits at scale $`\rho=s\varepsilon^2`$, so the tangent at zero is not enough, and we need the risk profile over a nonvanishing interval of the rescaled budget $`s`$.

Three effects contribute at the critical scale. Moving the $`O(\varepsilon)`$ mass in an $`O(\varepsilon)`$-layer around the reference tail boundary by distances of order $`\varepsilon`$ changes both transport cost and tail expectation by $`O(\varepsilon^2)`$, which matches the nominal gain. That local movement need not preserve the marginals, and restoring them has its own price. For a fixed regular local plan the marginal CDF discrepancies are $`O(\varepsilon^2)`$, and by Vallender's formula [[39](#ref-vallender1974)] their $`L^1`$ norms give the one-dimensional restoration costs, even when compensation occurs far from the tail boundary. An $`O(\varepsilon)`$ shift of either ES threshold also contributes at order $`\varepsilon^2`$ through the curvature of its objective. Since all three enter at the same order, we have to optimize the local displacement, marginal restoration, and both thresholds together.

Our main contributions are the following.

*The critical-scale limit.* When the reference law has a positive continuous density on a compact box $`I^2\times I_3`$ and is exchangeable in its first two coordinates, Theorem [3.1](#dep-thm-critical-limit) proves that the rescaled stress profile converges to a finite, continuous limit

$$
F(s)=\lim_{\varepsilon\downarrow0}\varepsilon^{-2}D_\varepsilon(s\varepsilon^2),
\qquad F(0)=-J/p,
$$

with convergence locally uniform in $`s\ge0`$. The proof rests on a $`\Gamma`$-limit [[11](#ref-dalmaso1993)] of the transport energies that charges both for the local displacement and for restoring its marginal projections. In the recovery argument, coordinatewise quantile maps attain the restoration cost for each fixed regular local plan. This correction moves losses throughout the box, but its leading effects on the two ES values cancel outside the threshold layer, and approximation then extends the paired-risk convergence to kernels with finite displacement moment.

*A common critical coefficient.* Let $`\rho^-_\varepsilon`$ and $`\rho^+_\varepsilon`$ be the infima of budgets permitting a tie and a strict reversal. Theorem [3.3](#dep-thm-strict-crossing) proves that $`F`$ is strictly increasing with a unique zero $`s^*>0`$, and that this zero is the common leading coefficient of both budgets, which gives the quadratic law for the critical stress:

$$
\rho^-_\varepsilon=s^*\varepsilon^2+o(\varepsilon^2),\qquad
\rho^+_\varepsilon=s^*\varepsilon^2+o(\varepsilon^2).
$$

*The marginal-restoration premium.* The effective unit costs are $`\gamma_1,\gamma_2`$, and $`c_3=\gamma_3/\beta`$, with $`c_{\min}=\min\{\gamma_1,\gamma_2,c_3\}`$. If the first traded coordinate is cheapest, Proposition [3.2](#dep-prop-balanced-linear-profile) constructs a positive interval $`[0,s_{\rm lin}]`$ on which $`F(s)=-J/p+s/(p\gamma_1)`$. To reach zero at this rate, however, efficient displacement would have to stay possible throughout the required interval. We introduce the *marginal-restoration premium*, the nonnegative gap $`s^*-Jc_{\min}`$ between the critical coefficient and the universal efficiency bound (normalized by $`Jc_{\min}`$ when reported as a percentage), and Theorem [4.2](#dep-thm-zero-premium) classifies exactly when it vanishes:

$$
s^*=Jc_{\min}\quad\Longleftrightarrow\quad
c_3\le\min\{\gamma_1,\gamma_2\}.
$$

When background displacement is cheapest, exchangeability lets opposite shifts balance on every fixed-background slice. When only traded directions are cheapest, a corner region needs a displacement moment of order $`\delta^2`$, while its coordinate projections admit only $`O(\delta^4)`$ of compensating moment near the diagonal (Figure [2](#dep-fig-corner)), so the premium is strictly positive. Under the attained-slope condition of Proposition [2.2](#dep-prop-nominal-benchmark), with $`c_{\min}=\gamma_1<c_3`$, this mismatch gives $`\rho^\pm_\varepsilon/r_{0,\varepsilon}\to s^*/(\gamma_1J)>1`$, and [(4.10)](#dep-eq-legacy-6-2) bounds this limit explicitly.

*The uniform benchmark.* Take independent uniform losses on $`[0,2]^3`$, with $`\beta=1`$, $`p=1/2`$, and $`\gamma=(1,1,2)`$. Then $`g=3/8`$ and $`J=5/32`$, so Proposition [2.2](#dep-prop-nominal-benchmark) gives $`m_\varepsilon=(5/16)\varepsilon^2+o(\varepsilon^2)`$. Corollary [5.2](#dep-prop-uniform-variable-cost) proves that the profile is exactly $`F(s)=2s-5/16`$ for $`0\le s\le1/96`$, yet its zero satisfies $`13/64\le s^*\le29/96`$. So even in this uniform model, and despite an attainable initial slope, the marginal-restoration premium is at least $`30\%`$: the lower bound we prove on reversal is $`30\%`$ above the local-efficiency prediction $`5/32`$.

*Flow–cut sensitivity at equal effective costs.* Along the cost family $`\gamma_1=\gamma_2=\gamma`$, $`c_3=\gamma(1+\eta)`$ for $`\eta\ge0`$, the baseline $`Jc_{\min}=\gamma J`$ stays constant, so $`s^*`$ and the marginal-restoration premium have the same right derivative $`\gamma Ja_+`$ at $`\eta=0`$. Here $`a_+\in(0,1)`$ is the least background share among efficient stresses. Theorem [4.3](#dep-prop-boundary-sensitivity) characterizes it by continuous maximum-flow/minimum-cut duality and writes it as a normalized supremum of projected cut deficits, and Section 5 shows how this share and the budget sensitivity $`\gamma Ja_+`$ can move in opposite directions as the reference dependence changes.

Our question lies between extremal risk aggregation and local distributional sensitivity. On the aggregation side, subadditivity bounds aggregate risk [[1](#ref-artzner1999), [25](#ref-mcneil2015)], and rearrangements within a Fréchet class describe how diversification depends on the coupling [[33](#ref-ruschendorf2013), [15](#ref-embrechts2013), [5](#ref-bernard2014), [16](#ref-embrechts2015), [41](#ref-wang2015superadditive)]. Partial information leads to convex-order and mixability constraints [[22](#ref-li2018partial)] but can still permit comonotonic upper tails [[12](#ref-devecchinendelstreicher2026)], and fixed-marginal MES bounds quantify uncertainty in individual tail contributions [[9](#ref-chenfurmanlin2026)]. In allocation comparisons, the symmetry imposed on the candidate laws is decisive. Chen et al. [[10](#ref-chen2022)] and Liu and Liu [[23](#ref-liu2026)] use exchangeability and majorization to identify diversification protection, and Liu and Liu also analyze when complete dependence ambiguity favors concentration and how Wasserstein uncertainty modifies that conclusion. We impose exchangeability at the reference law alone: stressed couplings need not remain exchangeable, and the stationarity that symmetry gives at the reference does not by itself protect the reallocation once stress breaks the symmetry. We use this setting to measure the distance to a specified decision reversal, in the spirit of reverse sensitivity analysis [[28](#ref-pesenti2019), [29](#ref-pesenti2022)].

Transport duality is a natural way to preserve the marginal information [[40](#ref-villani2003), [34](#ref-santambrogio2015)]. In Wasserstein robust optimization [[7](#ref-blanchet2019), [19](#ref-gao2023)], adding marginal constraints confines the perturbation to dependence changes [[18](#ref-gao2017), [13](#ref-eckstein2020)]; such constraints encode calibrated risk-neutral laws in multiasset robust pricing [[14](#ref-eckstein2021multiasset)], and Wasserstein and copula restrictions also arise in benchmark portfolio optimization [[30](#ref-pesentijaimungal2023)]. Here the constraint acts on a common stressed loss law for two allocations. After rescaling, its full coordinate projections remain as a transport penalty, and at equal effective costs we show that the efficient allocation of displacement reduces to a capacity-constrained flow problem [[20](#ref-korman2015)].

Local Wasserstein expansions relate the sensitivity of optimized decisions and AVaR criteria to changes in the reference law [[2](#ref-bartl2021)], and adapted transport brings in the information available in multiperiod decisions [[4](#ref-bartlwiesel2023)]. When a first-order term vanishes, one turns to higher-order expansions: Fiechtner and Blanchet [[17](#ref-fiechtner2026)] derive a second-order regret expansion under a unique empirical-risk minimizer in this situation, and Sauldubois [[35](#ref-sauldubois2026)] develops higher-order Wasserstein and adapted-Wasserstein expansions, including martingale constraints. Dependence restrictions also affect local sensitivity, as in Lam [[21](#ref-lam2018)], while Namkoong [[26](#ref-namkoong2026)] evaluates the first-order response over restricted transport directions. In our problem the trade size and stress radius vanish together, so locating a decision reversal at scale $`\rho=s\varepsilon^2`$ takes the full rescaled profile, which Theorem [3.1](#dep-thm-critical-limit) gives with global marginal compensation and both optimized ES thresholds retained over the budget interval needed to reach zero.

Section 2 derives the nominal gain and the initial stress slope, and Section 3 takes the variational limit at scale $`\rho=s\varepsilon^2`$ and identifies the unique zero of the limiting profile. Section 4 characterizes zero premium and represents the boundary derivative by continuous projected flow–cut duality. Section 5 works through analytical examples and what they imply for reverse stress testing. The analytic proofs are in Appendix A, and the potential estimates and section calculations for the examples are in Appendix B.

**Notation and conventions**  We write $`T_\#\mu`$ for a pushforward and measure displacements by $`|d|_\gamma=\sum_i\gamma_i|d_i|`$. The constant in $`O_\alpha(\varepsilon^k)`$ may depend on the fixed kernel and model, but not on $`\varepsilon`$. Scalar section integrands are extended by zero outside their domains, and projection identities are equalities of finite signed Borel measures. We use $`\inf\varnothing=+\infty`$; allocation ratios are assigned the value zero where both numerator and denominator vanish.

<a id="dep-the-model-and-ranking-thresholds"></a>

## 2. Model formulation and the local benchmark

We first formulate the comparison for arbitrary integrable marginal laws, which are enough for a worst stressed model to exist. The critical-scale analysis will use a positive continuous density and exchangeability of the two traded positions, both introduced in Section 2.2.

### 2.1 Fixed marginals and a common stress law

Let $`n\ge2`$, let $`\mu_1,\ldots,\mu_n`$ have finite first moments, and fix $`P_0`$ in the Fréchet class $`\Pi(\mu_1,\ldots,\mu_n)=\{P\in\mathcal P(\mathbb R^n):P_i=\mu_i,\ 1\le i\le n\}`$.

For exposure vectors $`b,h\in\mathbb R^n`$, the losses before and after the proposed reallocation are $`A_\varepsilon=B+\varepsilon H`$ and $`B`$, with $`B=b\cdot X`$ and $`H=h\cdot X`$. We use the upper-tail mass $`p\in(0,1)`$ and the Expected Shortfall representation of Rockafellar and Uryasev [[32](#ref-rockafellar2002)],

<a id="dep-eq-legacy-2-1"></a>

$$
ES_p^P(L)=\min_{t\in\mathbb R}
\left\{t+\frac1pE_P(L-t)_+\right\}.
\tag{2.1}
$$

We write $`\mathscr E_L(P;t)=t+p^{-1}E_P(L-t)_+`$ for the threshold objective. For an integrable loss, its minimum is attained on the nonempty compact interval characterized by

<a id="dep-eq-legacy-A-1"></a>

$$
t\in\arg\min_{u}\mathscr E_L(P;u)
\quad\Longleftrightarrow\quad P(L>t)\le p\le P(L\ge t).
\tag{2.2}
$$

Without a continuity assumption on the stressed loss law, support gaps can leave a nondegenerate interval of minimizing thresholds. We therefore keep the set-valued characterization [(2.2)](#dep-eq-legacy-A-1), so that subsequent estimates apply to every minimizer, including for laws with atoms.

Under a common candidate law $`P\in\Pi`$, we compare $`\Phi_\varepsilon(P)=ES_p^P(B)-ES_p^P(A_\varepsilon)`$, minimizing each loss over its own threshold. Maximizing this paired difference tests whether a single dependence scenario can erase the nominal gain, whereas separate maximizations of the two ES values may select different joint laws. We measure changes in dependence with positive weights $`\gamma_i`$ and ground cost

$$
c_\gamma(x,y)=\sum_{i=1}^n\gamma_i|y_i-x_i|,
\qquad W_\gamma(P,P_0)=\min_{\pi\in\Gamma(P_0,P)}\int c_\gamma\,d\pi.
$$

Within $`\Pi=\Pi(\mu_1,\ldots,\mu_n)`$, transport changes how component losses are paired across joint states. With the weights and all marginal laws held fixed, we define the worst comparison at budget $`\rho`$ and the nominal gain by

<a id="dep-eq-legacy-2-2"></a>

$$
\mathcal A_\rho=\{P\in\Pi:W_\gamma(P,P_0)\le\rho\},\quad
D_\varepsilon(\rho)=\max_{P\in\mathcal A_\rho}\Phi_\varepsilon(P),\quad
m_\varepsilon=-\Phi_\varepsilon(P_0).
\tag{2.3}
$$

Proposition [2.1](#dep-prop-general-wellposedness) guarantees attainment in [(2.3)](#dep-eq-legacy-2-2), allowing atoms, singular dependence, and unbounded marginal supports. A nondecreasing profile can vanish on a whole interval, so we distinguish the infimal budgets for a tie and a strict reversal,

<a id="dep-eq-legacy-2-3"></a>

$$
\rho^-_\varepsilon=\inf\{\rho\ge0:D_\varepsilon(\rho)\ge0\},
\qquad
\rho^+_\varepsilon=\inf\{\rho\ge0:D_\varepsilon(\rho)>0\},
\tag{2.4}
$$

which, by Theorem [3.3](#dep-thm-strict-crossing), have the same leading asymptotics in the exchangeable box model of Section 2.2.

<a id="dep-prop-general-wellposedness"></a>

**Proposition 2.1 (Existence under integrable marginal laws).** Let $`n\ge2`$, let $`\mu_1,\ldots,\mu_n`$ have finite first moments, and fix $`P_0\in\Pi(\mu_1,\ldots,\mu_n)`$, positive weights $`\gamma_i`$, exposure vectors $`b,h\in\mathbb R^n`$, and $`p\in(0,1)`$. Then $`\Pi`$ and every $`\mathcal A_\rho`$ are compact for $`W_\gamma`$, and the maximum in [(2.3)](#dep-eq-legacy-2-2) is attained. For each fixed $`\varepsilon`$, the profile $`D_\varepsilon`$ is nondecreasing and Lipschitz on $`[0,\infty)`$.

*Proof.* The fixed-marginal class is tight and weakly closed. Moreover, along any weakly convergent sequence $`P_k\to P`$ in $`\Pi`$, the first moments satisfy $`\int|x|_\gamma\,dP_k=\sum_i\gamma_i\int|x_i|\,d\mu_i=\int|x|_\gamma\,dP`$, so the Wasserstein convergence criterion [[40](#ref-villani2003)] implies $`W_\gamma`$-compactness of $`\Pi`$ and its closed subsets $`\mathcal A_\rho`$. For a linear loss $`L=a\cdot X`$, coupling the laws and minimizing the uniformly Lipschitz hinges over their thresholds gives

$$
|ES_p^P(L)-ES_p^Q(L)|\le p^{-1}\|a\|_{\gamma,*}W_\gamma(P,Q),
\qquad \|a\|_{\gamma,*}=\max_i|a_i|/\gamma_i.
$$

Applying this bound to $`B=b\cdot X`$ and $`A_\varepsilon=(b+\varepsilon h)\cdot X`$, we find that their ES difference $`\Phi_\varepsilon`$ is Lipschitz with constant $`C_\varepsilon=p^{-1}(\|b\|_{\gamma,*}+\|b+\varepsilon h\|_{\gamma,*})`$. Compactness of $`\mathcal A_\rho`$ then ensures attainment. To compare two budgets $`\rho_2>\rho_1`$, take a maximizer $`P`$ at $`\rho_2`$. The mixture $`P_a=(1-a)P_0+aP`$, $`a=\rho_1/\rho_2`$, satisfies $`W_\gamma(P_a,P_0)\le a\rho_2`$ and $`W_\gamma(P_a,P)\le(1-a)\rho_2`$, by mixing an optimal plan with the corresponding identity plans. Comparing $`\Phi_\varepsilon(P_a)`$ and $`\Phi_\varepsilon(P)`$ yields $`0\le D_\varepsilon(\rho_2)-D_\varepsilon(\rho_1)\le C_\varepsilon(\rho_2-\rho_1)`$. ∎

For a transfer $`H=X_i-X_j`$ between positions with the same marginal law, replacing $`X_j`$ by $`X_i`$ preserves every marginal and gives $`A_\varepsilon=B`$ at cost $`\gamma_jE_{P_0}|X_i-X_j|`$; reversing their roles yields

$$
0\le\rho^-_\varepsilon
\le\min\{\gamma_i,\gamma_j\}\,E_{P_0}|X_i-X_j|<\infty.
$$

So the tie budget is finite, but this bound leaves its small-trade scale open. Under the exchangeable box assumptions introduced next, Section 3 shows that both critical budgets are of order $`\varepsilon^2`$.

<a id="dep-model-critical-box"></a>

### 2.2 The exchangeable box model

To isolate how dependence with the rest of a portfolio affects a small reallocation, we keep the two traded losses separate and collect all unchanged positions into their aggregate loss $`\beta X_3`$. The marginal law of $`X_3`$ counts as retained information, and we specify the transport metric directly on $`(X_1,X_2,X_3)`$. This aggregate model fixes the information used in the stress test: the retained marginal and displacement cost are those of the aggregate loss, a different specification from fixing separately the marginals and transport costs of every underlying background position.

<a id="dep-assumption-critical-box"></a>

**Standing assumptions (exchangeable box model)** Let

$$
I=[\ell,r],\qquad I_3=[\ell_3,r_3],\qquad
S=I^2\times I_3,\qquad \Delta_I=r-\ell>0,\quad \Delta_3=r_3-\ell_3>0.
$$

We also write $`I_1=I_2=I`$ when treating coordinate projections together. The reference law has a continuous density $`f>0`$ on the closed box $`S`$, normalized to integrate to one and satisfying $`f(x,y,z)=f(y,x,z)`$. We take

$$
B=X_1+X_2+\beta X_3,\qquad H=X_1-X_2,\qquad
A_\varepsilon=B+\varepsilon H,\qquad
\beta>0,\quad 0<\varepsilon<1,
$$

with arbitrary $`p\in(0,1)`$ and $`\gamma_i>0`$, so that $`b=(1,1,\beta)`$ and $`h=(1,-1,0)`$ in the preceding notation. All model parameters remain fixed as $`\varepsilon\downarrow0`$. The first two unit positions are expressed at equal initial cost, allowing the trade to change their holdings from $`(1+\varepsilon,1-\varepsilon)`$ to $`(1,1)`$ without changing the initial outlay. The position $`\beta X_3`$ represents the background book, whose holding remains unchanged during the trade.

The stressed law may be any coupling in $`\Pi((P_0)_1,(P_0)_2,(P_0)_3)`$; exchangeability and absolute continuity are assumptions on the reference law only. Reference symmetry makes the equal allocation stationary under $`P_0`$, and equality of the first two marginals gives $`E_P[A_\varepsilon]-E_P[B]=\varepsilon(E_P[X_1]-E_P[X_2])=0`$ under every candidate, so before implementation costs the ES comparison distinguishes tail risks between portfolios with the same expected loss.

We work on a compact box with a positive continuous density because that lets us study this dependence mechanism with uniform control of marginal restoration. Positivity on the closed box gives both the interior mass that local exchanges need and lower bounds on the marginal densities, hence Lipschitz bounds for their inverse CDFs, and these bounds enter the quantile recovery in Section 3.2 and Appendix A.5. Section 5.3 takes up the additional difficulties posed by unbounded marginals.

<a id="dep-m-units"></a>

**Loss units and effective stress costs** A shift $`\Delta X_3`$ changes the portfolio loss by $`\beta\Delta X_3`$ at cost $`\gamma_3|\Delta X_3|=(\gamma_3/\beta)|\beta\Delta X_3|`$. So $`c_1=\gamma_1`$, $`c_2=\gamma_2`$, and $`c_3=\gamma_3/\beta`$ are the costs per unit change of $`B`$ along the three coordinate axes, and the ratio $`c_3/\gamma_1`$ compares a background displacement with a first-position displacement having the same effect on portfolio loss.

**Canonical box normalization**  Writing the original coordinates as $`X=T_{\rm box}(u)=(\ell+\kappa u_1,\ell+\kappa u_2,\ell_3+\kappa_3u_3)`$, with $`\kappa=\Delta_I/2`$ and $`\kappa_3=\Delta_3/2`$, gives a normalized model on $`[0,2]^3`$ with $`\widehat\beta=\beta\kappa_3/\kappa`$ and $`\widehat\gamma=(\kappa\gamma_1,\kappa\gamma_2,\kappa_3\gamma_3)`$. By cash invariance and positive homogeneity of ES, the original paired risk is $`\kappa`$ times its normalized counterpart, while corresponding transport plans have equal cost; hence the critical budgets agree and $`p`$ is unchanged. A common rescaling of all transport weights rescales those budgets.

<a id="dep-nominal-improvement-initial-slope-and-the-protection-benchmark"></a>

### 2.3 Nominal curvature and the exact initial slope

Under the reference model of Section 2.2, let $`v`$ be the upper-tail $`p`$ threshold of $`B`$. The marginal expected shortfall (MES) of a unit position $`X_i`$, namely $`E_{P_0}[X_i\mid B>v]`$, is the ES derivative with respect to its holding, and multiplying by that holding gives its Euler contribution [[36](#ref-scaillet2004), [38](#ref-tasche2001)]. The first two holdings in $`B`$ both equal one, so the directional derivative along $`H=X_1-X_2`$ is their MES difference: with $`T_H=E_{P_0}[H1_{\{B>v\}}]`$, it equals $`p^{-1}T_H=E_{P_0}[X_1-X_2\mid B>v]=0`$ by exchangeability. To find the gain from a nonzero trade we then have to differentiate the moving tail boundary, which leads to a conditional variance on the tail section.

We record the classical section differentiation formula under our continuity assumptions in Lemma [A.1](https://github.com/130U/mathematical-finance-project/blob/3cc4c7e9b36e77027962999b932a1df7972cd2ed/paper/source/technical-reference.tex#L4).

The tail boundary can be parameterized by

$$
\Omega=\{(x,y)\in(\ell,r)^2:\ell_3<z_v(x,y)<r_3\},\qquad
z_v(x,y)=\frac{v-x-y}{\beta},\qquad
\xi=(x,y,z_v(x,y)).
$$

<a id="dep-geometry-interior-diagonal"></a>

Since $`p\in(0,1)`$ and $`f>0`$, the threshold satisfies $`2\ell+\beta\ell_3<v<2r+\beta r_3`$. To locate a nondegenerate part of the section, follow the segment joining the lower and upper vertices of $`S`$. The loss increases strictly along it and crosses $`v`$ at an interior point $`(x_*,x_*,z_*)`$, so a neighborhood of $`(x_*,x_*)`$ lies in $`\Omega`$, and its points off the diagonal have $`H=x-y\ne0`$.

By the coarea formula, integration in the normal coordinate $`B-v`$ gives the section measure $`d\sigma=f(\xi)\,dx\,dy/\beta`$. We denote the density of $`B`$ at $`v`$ and the nominal gain coefficient by

<a id="dep-eq-legacy-3-1"></a>

$$
g=\sigma(\Omega)>0,\qquad J=\frac12\int_\Omega H^2\,d\sigma>0.
\tag{2.5}
$$

Here $`g=f_B(v)`$ is the loss density at the threshold, and $`d\sigma/g`$ is its normalized conditional section law. Exchangeability makes the conditional mean of $`H`$ zero, giving $`2J/g=\operatorname{Var}_{P_0}(H\mid B=v)`$, so the second-order diversification gain is governed by the conditional variance of the trade payoff on $`\{B=v\}`$, weighted by the threshold density $`g`$.

<a id="dep-prop-nominal-benchmark"></a>

**Proposition 2.2 (Nominal benchmark and exact initial efficiency).** In the exchangeable box model of Section 2.2:

(i)  *Nominal gain and threshold curvature.* The reference thresholds and nominal gain satisfy

<a id="dep-eq-legacy-3-2"></a>

$$
t_\varepsilon-v=o(\varepsilon),\qquad
m_\varepsilon=\frac Jp\varepsilon^2+o(\varepsilon^2).
\tag{2.6}
$$

The threshold of $`B+\eta H`$ is unique for every $`|\eta|<1`$, and $`m_\varepsilon>0`$ for $`0<\varepsilon<1`$. With $`L_{c,\varepsilon}=B+c\varepsilon H`$, the unoptimized objective satisfies, uniformly for $`c=0,1`$ and $`|\tau|\le T<\infty`$,

<a id="dep-eq-legacy-B-2"></a>

$$
\mathscr E_{L_{c,\varepsilon}}(P_0;v+\varepsilon\tau)
=ES_p^{P_0}(B)+\frac{\varepsilon^2}{p}
\left(c^2J+\frac g2\tau^2\right)+o(\varepsilon^2).
\tag{2.7}
$$

(ii)  *Fixed-marginal Lipschitz bound and initial slope.* For every $`P,Q\in\Pi`$,

<a id="dep-eq-legacy-3-3"></a>

$$
|\Phi_\varepsilon(P)-\Phi_\varepsilon(Q)|\le \kappa_\varepsilon W_\gamma(P,Q),\quad
\kappa_\varepsilon=\frac1p\max\left\{\frac{1+\varepsilon/2}{\gamma_1},
\frac{1-\varepsilon/2}{\gamma_2},\frac\beta{\gamma_3}\right\}.
\tag{2.8}
$$

For fixed $`0<\varepsilon<1`$, if

<a id="dep-eq-legacy-3-4"></a>

$$
\frac{1+\varepsilon/2}{\gamma_1}
\ge\max\left\{\frac{1-\varepsilon/2}{\gamma_2},\frac\beta{\gamma_3}\right\},
\tag{2.9}
$$

then there exists $`r_\varepsilon>0`$ such that

<a id="dep-eq-legacy-3-5"></a>

$$
K_\varepsilon=\frac{1+\varepsilon/2}{p\gamma_1},\qquad
D_\varepsilon(\rho)=-m_\varepsilon+K_\varepsilon\rho
\quad(0\le\rho\le r_\varepsilon).
\tag{2.10}
$$

*Proof.* For part (i), the coefficients of $`B+\eta H`$ are positive whenever $`|\eta|<1`$, and its support is $`[2\ell+\beta\ell_3,2r+\beta r_3]`$. Since every interior level meets $`\operatorname{int}S`$, Lemma [A.1](https://github.com/130U/mathematical-finance-project/blob/3cc4c7e9b36e77027962999b932a1df7972cd2ed/paper/source/technical-reference.tex#L4) gives a positive continuous loss density and a unique threshold. The gradients of $`H`$ and $`B+\eta H`$ are linearly independent, so $`H`$ is nonconstant on each such section. Its conditional variance is therefore strictly positive, and the same lemma implies strict convexity of $`\eta\mapsto ES_p^{P_0}(B+\eta H)`$ on $`(-1,1)`$.

At $`\eta=0`$, exchanging the first two coordinates preserves both the reference tail and its boundary measure and reverses $`H`$, giving $`T_H=m_1=0`$. In the notation of Lemma [A.1](https://github.com/130U/mathematical-finance-project/blob/3cc4c7e9b36e77027962999b932a1df7972cd2ed/paper/source/technical-reference.tex#L4), the remaining section moments at $`(0,v)`$ are $`m_0=g`$ and $`m_2=2J`$. Thus the threshold derivative vanishes and the optimized second derivative is $`2J/p`$, which yield [(2.6)](#dep-eq-legacy-3-2) by Taylor expansion at zero. Strict convexity makes this stationary point the strict minimum, so $`m_\varepsilon>0`$ for all $`0<\varepsilon<1`$. For the unoptimized objective $`\Psi`$, the Hessian at $`(0,v)`$ is $`\operatorname{diag}(2J/p,g/p)`$. Expanding at the trade size and threshold displacement $`(c\varepsilon,\varepsilon\tau)`$ gives [(2.7)](#dep-eq-legacy-B-2), uniformly on bounded $`\tau`$-intervals.

*The fixed-marginal Lipschitz bound.* We next establish the uniform Lipschitz bound over $`\Pi`$. Given any minimizing $`u`$ for $`B`$ under $`Q`$ and any minimizing $`t`$ for $`A_\varepsilon`$ under $`P`$, let

$$
\begin{aligned}
h_{u,t}&=(B-u)_+-(A_\varepsilon-t)_+,\\
\Delta_B&=\mathscr E_B(P;u)-ES_p^P(B),&
\Delta_A&=\mathscr E_{A_\varepsilon}(Q;t)-ES_p^Q(A_\varepsilon).
\end{aligned}
$$

Both gaps are nonnegative, and direct subtraction gives

<a id="dep-eq-legacy-A-14"></a>

$$
\Phi_\varepsilon(P)-\Phi_\varepsilon(Q)
=p^{-1}\int h_{u,t}\,d(P-Q)-\Delta_B-\Delta_A.
\tag{2.11}
$$

A direct bound on $`h_{u,t}`$ would use its largest absolute $`x_1`$-slope, $`1+\varepsilon`$. Because $`P`$ and $`Q`$ share their marginals, adding an integrable separable potential does not change the integral against $`P-Q`$. We can thus choose a representative of $`h_{u,t}`$ modulo marginal potentials with a smaller Lipschitz bound. Here the required adjustment is linear: since $`\int H\,d(P-Q)=0`$, we may add any scalar multiple of $`H=X_1-X_2`$. The extreme $`x_1`$-slopes, $`-(1+\varepsilon)`$ and $`1`$, have midpoint $`-\varepsilon/2`$, so adding $`\varepsilon H/2`$ minimizes their largest absolute value among constant shifts and simultaneously centers the $`x_2`$-slopes. Away from the two tail planes, the four regime slopes are

$$
\begin{array}{c|rrrr}
(1_{\{B>u\}},1_{\{A_\varepsilon>t\}})&(0,0)&(1,0)&(0,1)&(1,1)\\
\partial_{x_1}h_{u,t}&0&1&-(1+\varepsilon)&-\varepsilon\\
\partial_{x_1}(h_{u,t}+\varepsilon H/2)&\varepsilon/2&1+\varepsilon/2&-1-\varepsilon/2&-\varepsilon/2.
\end{array}
$$

With the extreme $`x_1`$-slopes centered at zero, their largest absolute value drops to $`1+\varepsilon/2`$, while the corresponding bounds for $`x_2`$ and $`x_3`$ are $`1-\varepsilon/2`$ and $`\beta`$. Setting $`G_{u,t}=h_{u,t}+\varepsilon H/2`$, which is absolutely continuous along coordinate lines, we obtain

$$
|G_{u,t}(Y)-G_{u,t}(X)|
\le(1+\varepsilon/2)|Y_1-X_1|
+(1-\varepsilon/2)|Y_2-X_2|+\beta|Y_3-X_3|.
$$

Integrating against an optimal transport plan and then interchanging $`P,Q`$ proves [(2.8)](#dep-eq-legacy-3-3). The mixing argument in Proposition [2.1](#dep-prop-general-wellposedness), now with this sharp constant, also gives

<a id="dep-eq-sharp-budget-continuity"></a>

$$
0\le D_\varepsilon(\rho_2)-D_\varepsilon(\rho_1)
\le \kappa_\varepsilon(\rho_2-\rho_1)\qquad(0\le\rho_1<\rho_2).
\tag{2.12}
$$

<a id="dep-a-3-an-interior-intersection-and-attainment-of-the-initial-slope"></a>

*Attaining the initial slope.* Under [(2.9)](#dep-eq-legacy-3-4), we construct an attaining exchange near an interior intersection of the reference tail planes $`\{B=v\}`$ and $`\{A_\varepsilon=t_\varepsilon\}`$. To locate such an intersection, fix $`\varepsilon\in(0,1)`$ and let $`[m_F,M_F]`$ be the nondegenerate range of $`A_\varepsilon`$ on $`F_v=\{B=v\}\cap S`$. Both losses increase along each nonconstant segment from the lower vertex $`x_{\min}=(\ell,\ell,\ell_3)`$. Any point with $`B>v`$ lies beyond an intersection of that segment with $`F_v`$, so $`t_\varepsilon\le m_F`$ would imply $`\{B>v\}\subset\{A_\varepsilon>t_\varepsilon\}`$. Since $`A_\varepsilon`$ is nonconstant on $`F_v`$, the second tail would also contain an open set below $`B=v`$, contradicting the equal tail probabilities and $`f>0`$. Rays toward the upper corner similarly exclude $`t_\varepsilon\ge M_F`$, which leaves $`t_\varepsilon\in(m_F,M_F)`$. The relative-interior property of a linear map on a convex section gives an intersection $`c=(x_*,y_*,z_*)\in\operatorname{int}S`$.

To exchange the first-coordinate marginal intervals of two small source cubes in opposite disagreement regions along $`e_1`$, we first choose reference points with the same coordinate $`x_*`$ and seek equal and opposite changes in the two losses. From the interior intersection $`c`$, a displacement $`(0,-\zeta_0,a\zeta_0)`$ changes $`B`$ by $`(-1+\beta a)\zeta_0`$ and $`A_\varepsilon`$ by $`(-(1-\varepsilon)+\beta a)\zeta_0`$. Equating their sum to zero determines $`a=(1-\varepsilon/2)/\beta`$. Thus the points

$$
c_\pm=(x_*,y_*\mp \zeta_0,z_*\pm(1-\varepsilon/2)\zeta_0/\beta)
$$

have opposite strict tail memberships for small $`\zeta_0>0`$: at $`c_+`$, the losses differ from their thresholds by $`-\varepsilon \zeta_0/2`$ for $`B`$ and $`\varepsilon \zeta_0/2`$ for $`A_\varepsilon`$, with both signs reversed at $`c_-`$. Choosing $`0<\delta_x<\varepsilon\zeta_0/(1+\varepsilon)`$ bounds the loss change along either half-translation by the strict tail margin. With this margin fixed, we can take $`\eta_0>0`$ small enough that the cubes $`E_\pm`$ of half-width $`\eta_0`$, centered at $`c_\pm\pm(\delta_x/2)e_1`$, have disjoint second-coordinate intervals and remain inside $`S`$ and their respective tail regions throughout translation by $`\mp\delta_xe_1`$.

The uniform subdensities $`\nu_\pm=\lambda1_{E_\pm}\,dx\,dy\,dz`$, where $`\lambda=\min_Sf`$, have equal mass $`\mu=\lambda(2\eta_0)^3`$ and sum at most $`P_0`$. The translations $`T_\pm(x)=x\mp\delta_xe_1`$ therefore define the admissible perturbation

<a id="dep-eq-legacy-A-16a"></a>

$$
P_\theta=P_0-\theta(\nu_++\nu_-)
+\theta(T_+)_\#\nu_++\theta(T_-)_\#\nu_-,\qquad 0\le\theta\le1.
\tag{2.13}
$$

The translations exchange the first-coordinate marginal intervals, fix the other coordinates, and cross neither tail plane. Thus $`P_\theta`$ preserves all marginals and both reference tail probabilities, leaving $`v`$ and $`t_\varepsilon`$ optimal. Integrating the affine hinges on the two cubes gives

<a id="dep-eq-legacy-A-16b"></a>

$$
\Phi_\varepsilon(P_\theta)-\Phi_\varepsilon(P_0)
=\frac{(2+\varepsilon)\theta\mu\delta_x}{p}
=K_\varepsilon(2\gamma_1\theta\mu\delta_x).
\tag{2.14}
$$

The plan has cost $`2\gamma_1\theta\mu\delta_x`$, and the sharp bound [(2.8)](#dep-eq-legacy-3-3) forces this to equal $`W_\gamma(P_\theta,P_0)`$. Varying $`\theta\in[0,1]`$ proves [(2.10)](#dep-eq-legacy-3-5) with $`r_\varepsilon=2\gamma_1\mu\delta_x>0`$. ∎

If $`\gamma_2\ge\gamma_1`$ and $`\gamma_3\ge\beta\gamma_1`$, condition [(2.9)](#dep-eq-legacy-3-4) holds for every $`\varepsilon\in(0,1)`$, which suggests the extrapolated reversal budget $`r_{0,\varepsilon}=m_\varepsilon/K_\varepsilon`$. The construction gives $`r_\varepsilon>0`$ for each fixed trade size, but the disagreement regions narrow with $`\varepsilon`$, so it leaves $`r_\varepsilon/\varepsilon^2`$ uncontrolled. Indeed, the unscaled bound $`|D_\varepsilon(\rho)|\le\varepsilon\|H\|_\infty`$ makes both iterated limits in $`(\rho,\varepsilon)`$ vanish even though $`K_\varepsilon\to1/(p\gamma_1)>0`$, which is why Section 3 tracks the profile under the joint scaling $`\rho=s\varepsilon^2`$.

<a id="dep-prop-exchangeable-protection"></a>

**Reference symmetry and stressed dependence** Our stress class allows asymmetric dependence between the two traded positions. If every candidate law were exchangeable, the losses $`B-\varepsilon H`$ and $`B+\varepsilon H`$ would have the same distribution, and convexity of ES would give

<a id="dep-eq-legacy-3-6"></a>

$$
ES_p^P(B)\le\tfrac12 ES_p^P(B-\varepsilon H)+\tfrac12 ES_p^P(B+\varepsilon H)
=ES_p^P(A_\varepsilon).
\tag{2.15}
$$

Requiring exchangeability of every stressed law would thus protect this reallocation [[10](#ref-chen2022), [23](#ref-liu2026)]. We impose it only at the reference, which gives stationarity there while permitting dependence stresses that test the persistence of the gain. Identical marginal laws alone do not imply stationarity. For example, on $`S=[0,2]^3`$ with $`\beta=1`$ and $`p=1/2`$, the perturbation $`f_\delta=[1+\delta(x-y)(z-1)]/8`$, with $`0<|\delta|<1/2`$, preserves uniform marginals but gives a nonzero tail expectation $`T_H`$. Antisymmetry in $`x,y`$ preserves the law of $`B=x+y+z`$, hence $`v=3`$. Pairing $`z=1\pm t`$ leaves the strip $`2-t<x+y\le2+t`$, so

$$
T_H=\frac{\delta}{8}\int_0^1 t\int_{\{2-t<x+y\le2+t\}\cap[0,2]^2}(x-y)^2\,dx\,dy\,dt\ne0.
$$

<a id="dep-critical-cost-and-recovery-under-full-marginal-constraints"></a>

## 3. Variational limit and the critical profile

Under the traded-coordinate condition of Proposition [2.2](#dep-prop-nominal-benchmark), a local exchange attains the initial slope. To find out how far that efficiency persists toward reversal, we now hold $`s=\rho/\varepsilon^2`$ fixed. The limiting objects introduced below connect the stress profile to its reversal coefficient:

$$
\varepsilon^{-2}D_\varepsilon(s\varepsilon^2)
\xrightarrow{\text{locally uniformly}}
F(s)
\xrightarrow{\text{unique zero}}
s^*.
$$

The first passage comes from Theorem [3.1](#dep-thm-critical-limit), which combines convergence of the transport energies with exact marginal recovery and convergence of the paired risk. Strict growth in Theorem [3.3](#dep-thm-strict-crossing) then identifies the common critical coefficient.

<a id="dep-sec-limit-geometry"></a>

### 3.1 Local transport and marginal compensation

An $`O(\varepsilon)`$-layer around $`\{B=v\}`$ contains $`O(\varepsilon)`$ reference mass, so displacements of order $`\varepsilon`$ change both the transport cost and the paired hinge expectation at order $`\varepsilon^2`$. We resolve this layer through the normal coordinate $`u=(B(X)-v)/\varepsilon`$ and displacement $`d=(Y-X)/\varepsilon`$, while keeping the cost of any transport outside bounded windows that is needed to restore the marginals.

**Definition (Marginal flux and effective energy)**  On bounded $`u`$-windows the rescaled source converges to $`d\nu=d\sigma\,du`$. We disintegrate a limiting plan with this source into a probability kernel $`\alpha_{\xi,u}(dd)`$, specifying the rescaled displacement at surface point $`\xi`$ and normal coordinate $`u`$; stationary sources have kernel $`\delta_0`$. Writing $`d\Pi_\alpha(\xi,u,d)=\alpha_{\xi,u}(dd)\,d\nu(\xi,u)`$, we require a finite weighted displacement moment even though the source measure $`\nu=\sigma\otimes du`$ has infinite total mass:

$$
I(\alpha)=\int|d|_\gamma\,d\Pi_\alpha<\infty,
\qquad |d|_\gamma=\sum_i\gamma_i|d_i|.
$$

Across a coordinate cut $`\{X_i\le q\}`$, upward movements remove mass from below the cut and downward movements add mass to it. The resulting signed flux has a Lebesgue density $`j_i\in L^1(I_i)`$, as shown by the section formulas in Appendix A.3, and we define

<a id="dep-eq-legacy-4-1"></a>

$$
j_i(q)dq=(\xi_i)_\#(d_i\,d\Pi_\alpha),\qquad
\mathcal C(\alpha)=I(\alpha)+\sum_{i=1}^3\gamma_i\|j_i\|_{L^1(I_i)}.
\tag{3.1}
$$

In words, $`j_i`$ is the signed displacement moment projected onto the $`i`$-th coordinate, and its negative is the leading marginal CDF discrepancy produced by a regular local plan. The full plan preserves each marginal, so transport outside a bounded normal and displacement window has to compensate the discrepancy within it, and the one-dimensional CDF formula for $`W_1`$ [[39](#ref-vallender1974)] turns that compensation into a cost lower bound. The energy $`\mathcal C`$ adds this limiting restoration cost to $`I`$ (Figure [1](#dep-fig-tail-layer)). Projection contracts total variation, giving $`I\le\mathcal C\le2I`$, with $`\mathcal C=I`$ when all projected fluxes vanish and $`\mathcal C=2I`$ when each $`d_i`$ has a fixed sign $`\Pi_\alpha`$-almost everywhere, so that $`\|j_i\|_1=\int|d_i|\,d\Pi_\alpha`$.

<a id="dep-fig-tail-layer"></a>

![Figure 1. Local transport and full marginal compensation (schematic). A layer with thickness and mass of order $`O(\varepsilon)`$, transported over distances of order $`O(\varepsilon)`$, incurs second-order cost. The remaining nonnegative plan must cancel the local plan's coordinate CDF discrepancies. Their integrated absolute values give the compensation lower bound, with leading coefficients $`\|j_i\|_1`$; a zero flux requires no corresponding leading-order compensation. The shaded discrepancy illustrates this mechanism.](/assets/research/dependence/tail-layer-repair.png)

<a id="dep-sec-limit-risk"></a>

### 3.2 The limiting risk and convergence theorem

Under the same local plan, each loss has its own minimizing threshold. At threshold $`v+\varepsilon\tau`$, a displacement $`d`$ changes the leading centered and rescaled loss of $`L_{c,\varepsilon}=B+c\varepsilon H`$ from $`u+cH`$ to $`u+b\cdot d+cH`$. Denote the corresponding hinge increment by $`\mathfrak q_c(\tau)=(u+b\cdot d+cH-\tau)_+-(u+cH-\tau)_+`$. We write $`T_c^\alpha(\tau)=\int\mathfrak q_c(\tau)\,d\Pi_\alpha`$ for its integral.

**Definition (Limiting paired risk)**  Moving the threshold away from $`v`$ contributes the curvature term $`g\tau^2/2`$ from [(2.7)](#dep-eq-legacy-B-2). Adding the local transport increment gives the two limiting threshold objectives, which must still be minimized separately:

<a id="dep-eq-legacy-4-2"></a>

$$
G_c^\alpha(\tau)=\frac g2\tau^2+T_c^\alpha(\tau),\qquad
\mathcal V(\alpha)=-\frac Jp+
\frac{\min_{\tau_B}G_0^\alpha(\tau_B)-\min_{\tau_A}G_1^\alpha(\tau_A)}p.
\tag{3.2}
$$

The energy $`\mathcal C`$ depends only on the absolute displacement moment and the signed coordinate projections, and it is convex under mixtures of kernels. The paired risk also depends on how the displacements are distributed relative to the normal coordinate $`u`$: each of the two hinge objectives optimizes its own threshold, so their difference need not be concave in the common kernel.

We omit the superscript $`\alpha`$ when the kernel is clear, and write $`\kappa_B=\max_i b_i/\gamma_i`$, $`\kappa_H=\max\{\gamma_1^{-1},\gamma_2^{-1}\}`$. Since $`|T_c^\alpha|\le\kappa_BI`$, the quadratic term gives coercivity and confines every minimizer to $`g\tau^2/2\le2\kappa_BI`$. Together with convexity from Lemma [A.4](https://github.com/130U/mathematical-finance-project/blob/3cc4c7e9b36e77027962999b932a1df7972cd2ed/paper/source/technical-limit.tex#L103), these properties justify the threshold minimizations in $`\mathcal V`$. We then optimize the paired value over the energy budget, with attainment proved in Theorem [3.1](#dep-thm-critical-limit):

<a id="dep-eq-legacy-4-3"></a>

$$
F(s)=\max_{\mathcal C(\alpha)\le s}\mathcal V(\alpha),\qquad s\ge0.
\tag{3.3}
$$

We use vague convergence on $`\mathscr X=\mathcal M^+_{\rm loc}(Z)`$, testing against compactly supported continuous functions on $`Z=I^2\times\mathbb R\times\mathbb R^3`$, so that compensation may occur outside bounded windows. We lift a plan $`\pi`$ from $`P_0`$ to a law in $`\Pi`$ by

$$
\mathscr T_\varepsilon\pi=\varepsilon^{-1}
\left(X_1,X_2,\frac{B(X)-v}{\varepsilon},\frac{Y-X}{\varepsilon}\right)_\#\pi.
$$

Here the factor $`\varepsilon^{-1}`$ compensates for the thickness of the source layer. The lifted coordinates determine $`(X,Y)`$ for fixed $`\varepsilon`$, so the rescaled energy can retain the cost of the entire original plan:

$$
\begin{aligned}
\mathcal E_\varepsilon(\Lambda)
&=\begin{cases}
\displaystyle\int |d|_\gamma\,d\Lambda
=\varepsilon^{-2}\int c_\gamma\,d\pi,
&\begin{gathered}\Lambda=\mathscr T_\varepsilon\pi,\\ \pi\in\Gamma(P_0,P),\ P\in\Pi,\end{gathered}\\
+\infty,&\text{otherwise},
\end{cases}\\
\mathcal E(\Lambda)
&=\begin{cases}
\mathcal C(\alpha),&\Lambda=\Pi_\alpha,\ I(\alpha)<\infty,\\
+\infty,&\text{otherwise}.
\end{cases}
\end{aligned}
$$

Here we identify $`\Pi_\alpha`$ with a measure on $`Z`$ through $`(\xi,u,d)\mapsto(\xi_1,\xi_2,u,d)`$, using $`\xi=(x,y,z_v(x,y))`$ on $`\Omega`$ and assigning zero measure to $`(I^2\setminus\Omega)\times\mathbb R\times\mathbb R^3`$. Because $`\mathcal E_\varepsilon`$ includes the whole plan, including transport outside bounded normal windows, minimizing it over plans with target law $`P`$ gives $`\varepsilon^{-2}W_\gamma(P,P_0)`$. We formulate the following $`\Gamma`$-convergence statement in this vague topology [[11](#ref-dalmaso1993)].

<a id="dep-thm-critical-limit"></a>

**Theorem 3.1 ($`\Gamma`$-convergence and the critical risk profile).** Consider the exchangeable box model of [Section 2.2](#dep-model-critical-box).

(i)  *Transport plans and compactness.* $`\mathcal E_\varepsilon`$ $`\Gamma`$-converges to $`\mathcal E`$ as $`\varepsilon\downarrow0`$ in the vague topology on $`\mathscr X`$. Every sequence $`\varepsilon_n\downarrow0`$, $`\Pi_n\in\mathscr X`$, with bounded $`\mathcal E_{\varepsilon_n}(\Pi_n)`$ has a vaguely convergent subsequence. If $`\Pi_n=\mathscr T_{\varepsilon_n}\pi_n\to\Pi_\alpha`$ has bounded energy and $`P_n`$ is the target law of $`\pi_n`$, then $`\Phi_{\varepsilon_n}(P_n)/\varepsilon_n^2\to\mathcal V(\alpha)`$.

(ii)  *Target laws and exact recovery.* For every sequence $`\varepsilon_n\downarrow0`$ and every feasible sequence satisfying $`W_\gamma(P_n,P_0)=O(\varepsilon_n^2)`$, there are a subsequence and a kernel with finite $`I`$ such that

<a id="dep-eq-legacy-4-5"></a>

$$
\mathcal C(\alpha)\le\liminf_n\frac{W_\gamma(P_n,P_0)}{\varepsilon_n^2},\qquad
\frac{\Phi_{\varepsilon_n}(P_n)}{\varepsilon_n^2}\longrightarrow\mathcal V(\alpha).
\tag{3.4}
$$

Conversely, every kernel with finite $`I`$ admits a recovery sequence of distributions preserving the original three full marginals, with

<a id="dep-eq-legacy-4-6"></a>

$$
\limsup_{\varepsilon\downarrow0}\frac{W_\gamma(P_\varepsilon,P_0)}{\varepsilon^2}\le\mathcal C(\alpha),\qquad
\frac{\Phi_\varepsilon(P_\varepsilon)}{\varepsilon^2}\longrightarrow\mathcal V(\alpha).
\tag{3.5}
$$

(iii)  *The stress profile.* The maximum in [(3.3)](#dep-eq-legacy-4-3) is attained. The function $`F`$ is finite, continuous, and nondecreasing, with $`F(0)=-J/p`$ and $`F>0`$ at some finite budget. For every finite $`S_0`$,

<a id="dep-eq-legacy-4-4"></a>

$$
\sup_{0\le s\le S_0}\left|\frac{D_\varepsilon(s\varepsilon^2)}{\varepsilon^2}-F(s)\right|\longrightarrow0.
\tag{3.6}
$$

**Proof strategy** Theorem [3.1](#dep-thm-critical-limit)(i) gives $`\Gamma`$-convergence of the transport energy and convergence of the paired risk along bounded-energy plans, and the exact marginal recovery in part (ii) makes the limiting kernel values asymptotically attainable in $`\Pi`$. Part (iii) gives uniform convergence of the optimized profiles on compact budget intervals, which, together with the strict crossing in Theorem [3.3](#dep-thm-strict-crossing), locates the reversal budget $`s^*`$.

*Step 1: Localization and the energy lower bound.* Because the two ES thresholds are optimized independently, comparison of the objectives requires a common threshold window for stresses with bounded rescaled energy. In Appendix [A.2](https://github.com/130U/mathematical-finance-project/blob/3cc4c7e9b36e77027962999b932a1df7972cd2ed/paper/source/technical-limit.tex#L2), Lemma [A.2](https://github.com/130U/mathematical-finance-project/blob/3cc4c7e9b36e77027962999b932a1df7972cd2ed/paper/source/technical-threshold-statement.tex#L1) places every minimizing threshold in an $`O_M(\varepsilon)`$ window. On bounded windows the lifted plans are locally compact; outside them, marginal conservation requires compensation for the projected local flux. The compensation bound above then gives the energy lower bound for arbitrary admissible plans. Choosing optimal plans yields the corresponding Wasserstein bound for their target laws.

*Step 2: Convergence of the paired risk.* Bounded first moments make each hinge increment integrable, but need not give uniform integrability along convergent plans. The two objectives share the same large-displacement contribution, so we subtract $`\mathfrak q_0(0)`$ from both. The relative increments are bounded on the common threshold window. Outside a normal window enlarged to account for the bounded reallocation $`H`$, a nonzero relative increment requires a sufficiently large displacement, so the first moment controls the far-field contributions. The baseline integral is finite but need not converge. Since it translates both threshold objectives by the same amount independently of the threshold, it cancels exactly from their difference of minima.

*Step 3: Exact marginal recovery.* Let $`\mathcal K_{\rm fin}^c`$ denote probability kernels with compactly supported continuous weights on finitely many fixed displacement vectors and the remaining mass at zero, as in [(A.13)](https://github.com/130U/mathematical-finance-project/blob/3cc4c7e9b36e77027962999b932a1df7972cd2ed/paper/source/technical-limit.tex#L136). For a fixed kernel in this class, local translations yield a preliminary law $`Q_\varepsilon`$ with uniform marginal CDF expansion $`F_{i,\varepsilon}-F_i=-\varepsilon^2j_i+o(\varepsilon^2)`$, where $`F_i`$ is the reference CDF. The quantile maps $`F_i^{-1}\circ F_{i,\varepsilon}`$ restore all three marginals at cost $`\varepsilon^2\sum_i\gamma_i\|j_i\|_1+o(\varepsilon^2)`$, with $`O_\alpha(\varepsilon^2)`$ displacements.

To see why this correction does not alter the leading paired risk, compare its displacement scale with the $`O_\alpha(\varepsilon)`$ threshold band. Outside a sufficiently wide band, the paired hinge has gradient $`-\varepsilon h`$ above both thresholds and zero below both, so multiplying by the restoration displacement gives an $`O_\alpha(\varepsilon^3)`$ contribution. Inside the band the gradient is bounded, but the $`Q_\varepsilon`$-mass is only $`O_\alpha(\varepsilon)`$, giving the same order after integration. The restoration error is therefore $`O_\alpha(\varepsilon^3)`$, uniformly over all minimizing threshold pairs.

Approximation by $`\mathcal K_{\rm fin}^c`$ in cost, paired risk, and the vague plan topology (Appendix A.4), followed by diagonal recovery, gives the general $`o(\varepsilon^2)`$ error. Compactness, contraction toward the identity, and the common budget-Lipschitz bound then give locally uniform convergence of the optimized profiles.

<a id="dep-sec-balanced-profile"></a>

### 3.3 Initial linearity and the critical budget

<a id="dep-g-4-balanced-source-selection-and-the-limiting-linear-segment"></a>

At zero threshold shifts, the portfolios disagree on tail membership precisely on $`W=\{u(u+H)<0\}`$. The displacement $`\zeta=-(u+H)1_W`$ moves a source in this wedge to the limiting $`A_\varepsilon`$-boundary and attains the maximal paired hinge increment per unit of normal movement. When $`c_{\min}=\gamma_1`$, we can assign this movement along $`e_1`$ provided its downward and upward moments balance on each $`x`$-fiber. On active sources in $`W`$, $`\zeta<0`$ for $`y<x`$ and $`\zeta>0`$ for $`y>x`$, with $`\int\zeta\,du=-H|H|/2`$. Writing $`k(x,y)=f(x,y,(v-x-y)/\beta)1_{\{\beta\ell_3<v-x-y<\beta r_3\}}`$, the available fiber moments are

<a id="dep-eq-legacy-A-19"></a>

$$
\ell_-(x)=\frac1{2\beta}\int_I(x-y)_+^2k(x,y)\,dy,\qquad
\ell_+(x)=\frac1{2\beta}\int_I(y-x)_+^2k(x,y)\,dy.
\tag{3.7}
$$

Exchangeability gives $`\int_I\ell_-=\int_I\ell_+=J/2`$, but the two moments need not agree on each fiber. Matching their pointwise minimum cancels the projected flux and gives the budget

$$
\begin{aligned}
q_{\rm bal}(x)&=\min\{\ell_-(x),\ell_+(x)\},&
Q_{\rm bal}&=\int_I q_{\rm bal}(x)\,dx,\\
s_{\rm lin}&=2\gamma_1Q_{\rm bal}=\gamma_1J(1-\chi)>0,&
\chi&=\|\ell_--\ell_+\|_{L^1(I)}/J.
\end{aligned}
$$

<a id="dep-prop-balanced-linear-profile"></a>

**Proposition 3.2 (Capacity of the initial linear segment).** In the exchangeable box model of Section 2.2, suppose $`\gamma_1=\min\{\gamma_1,\gamma_2,\gamma_3/\beta\}`$. With $`\ell_\pm`$ as in [(3.7)](#dep-eq-legacy-A-19) and $`s_{\rm lin}=\gamma_1J(1-\chi)>0`$ as above,

$$
F(s)=-J/p+s/(p\gamma_1),\qquad 0\le s\le s_{\rm lin}.
$$

*Proof.* For $`W=\{u(u+H)<0\}`$ and $`\zeta=-(u+H)1_W`$, select the proportion

$$
a(\xi)=
\begin{cases}
q_{\rm bal}(x)/\ell_-(x),&H>0,\ \ell_-(x)>0,\\
q_{\rm bal}(x)/\ell_+(x),&H<0,\ \ell_+(x)>0,\\
0,&\text{otherwise},
\end{cases}
$$

and define $`\alpha^\theta_{\xi,u}=\theta a(\xi)\delta_{\zeta e_1}+(1-\theta a(\xi))\delta_0`$ for $`0\le\theta\le1`$. Because $`0\le a\le1`$ and the active sources satisfy $`|u|,|\zeta|\le\Delta_I`$, this is a finite-first-moment probability kernel. Its opposite first-coordinate fluxes equal $`-\theta q_{\rm bal}(x)`$ and $`\theta q_{\rm bal}(x)`$, while the other coordinates remain fixed, so $`j_i=0`$ for all $`i`$ and $`I(\alpha^\theta)=\mathcal C(\alpha^\theta)=2\theta\gamma_1Q_{\rm bal}=\theta s_{\rm lin}`$.

Under this displacement, an active source has target normal losses $`-H`$ for $`B`$ and zero for $`A_\varepsilon`$. Because $`\operatorname{sgn}u=\operatorname{sgn}(-H)\ne0`$ on $`W`$, its strict $`B`$-tail membership is unchanged and no mass is placed at the $`B`$-threshold. For $`A_\varepsilon`$, however, the active sources from the two signs of $`H`$ arrive at the kink itself. The resulting atom accounts for the jump between the one-sided derivatives: with $`\mathfrak m_\pm=\int_{\{\pm H>0\}}a(\xi)|H|\,d\sigma`$,

$$
G'_{0,-}(0)=G'_{0,+}(0)=0,\qquad
G'_{1,-}(0)=-\theta \mathfrak m_-\le0,\qquad
G'_{1,+}(0)=\theta \mathfrak m_+\ge0.
$$

By Lemma [A.4](https://github.com/130U/mathematical-finance-project/blob/3cc4c7e9b36e77027962999b932a1df7972cd2ed/paper/source/technical-limit.tex#L103), zero is globally optimal for both objectives. Evaluating the nonzero wedge integrals, $`H^2/2`$ for $`B`$ on $`H<0`$ and $`-H^2/2`$ for $`A_\varepsilon`$ on $`H>0`$, we obtain $`T_0(0)=\theta Q_{\rm bal}`$ and $`T_1(0)=-\theta Q_{\rm bal}`$, which yield $`\mathcal V(\alpha^\theta)=-J/p+\theta s_{\rm lin}/(p\gamma_1)`$. Since $`0<\chi<1`$ by Lemma [A.3](https://github.com/130U/mathematical-finance-project/blob/3cc4c7e9b36e77027962999b932a1df7972cd2ed/paper/source/technical-limit.tex#L54), we may choose $`\theta=s/s_{\rm lin}`$ to attain the upper bound inherited from Proposition [2.2](#dep-prop-nominal-benchmark). ∎

**Strict growth**  To identify a common leading budget for a tie and a strict reversal, we improve every bounded-first-moment kernel at arbitrarily small additional cost. If the paired risk were concave in the kernel, mixing with a kernel of larger paired risk would do this directly, but the two threshold objectives are minimized separately and their difference need not be concave along mixtures. We also cannot assume that a kernel leaves stationary mass available for an added displacement, since an everywhere nonzero shift proportional to $`e^{-u^2}e_1`$ already has finite first moment.

We instead replace a small fraction of the existing kernel on two exchanged normal bands beyond the common threshold window. Reflecting $`u`$ to $`-u`$ crosses that window. Pairing the bands cancels their $`B`$-increments, while opposite signs of $`H`$ produce a positive paired gain per unit replacement fraction, independent of the distance $`U`$. After subtraction of the common baseline the old kernel contributes only an $`O_M(U^{-1})`$ remainder, because it takes a large displacement to affect the threshold window from those bands. So we first choose $`U`$ to make this remainder smaller than the reflection gain, and then reduce the replacement fraction to meet the additional budget. Appendix A.6 verifies the mixing obstruction and carries out this comparison uniformly over the original and modified minimizing thresholds.

<a id="dep-thm-strict-crossing"></a>

**Theorem 3.3 (Strict improvement by local replacement and a common critical coefficient).** Consider the exchangeable box model of [Section 2.2](#dep-model-critical-box). The limiting profile $`F`$ is strictly increasing and has a unique zero $`s^*>0`$, which gives the common leading coefficient of both pre-limit critical budgets at scale $`\varepsilon^2`$. More precisely:

(i)  *Quantitative local improvement.* For every $`0\le M<\infty`$ there exists $`c_M>0`$ such that every kernel satisfying $`I(\alpha)\le M`$ and every $`0<\delta\le1`$ admit a feasible kernel $`\widehat\alpha`$ with

<a id="dep-eq-legacy-5-1"></a>

$$
\mathcal C(\widehat\alpha)\le\mathcal C(\alpha)+\delta,\qquad
\mathcal V(\widehat\alpha)\ge\mathcal V(\alpha)+c_M\delta.
\tag{3.8}
$$

These kernels can be chosen as a family $`(\widehat\alpha_\delta)_{0<\delta\le1}`$ satisfying

$$
\int |d|_\gamma\,|\widehat\alpha_\delta-\alpha|(dd)\,d\nu
\xrightarrow[\delta\downarrow0]{}0,
\qquad
\lim_{\delta\downarrow0}
\frac{\mathcal V(\widehat\alpha_\delta)-\mathcal V(\alpha)}{\delta}
\ge c_M>0.
$$

For every finite $`S_0>0`$,

<a id="dep-eq-legacy-5-2"></a>

$$
F(t)-F(s)\ge c_{S_0}(t-s)>0\qquad(0\le s<t\le S_0).
\tag{3.9}
$$

(ii)  *Critical budgets.* Together with the continuity, negative initial value, and positive value at a finite budget in Theorem [3.1](#dep-thm-critical-limit)(iii), strict growth of $`F`$ gives a unique zero $`s^*>0`$. Over the finite-first-moment kernel class,

<a id="dep-eq-legacy-5-3"></a>

$$
s^*=\min_{\alpha:\,\mathcal V(\alpha)\ge0}\mathcal C(\alpha)
=\min_{\alpha:\,\mathcal V(\alpha)=0}\mathcal C(\alpha)
=\inf_{\alpha:\,\mathcal V(\alpha)>0}\mathcal C(\alpha).
\tag{3.10}
$$

The corresponding pre-limit critical budgets satisfy

<a id="dep-eq-legacy-5-4"></a>

$$
\rho^-_\varepsilon=s^*\varepsilon^2+o(\varepsilon^2),\qquad
\rho^+_\varepsilon=s^*\varepsilon^2+o(\varepsilon^2).
\tag{3.11}
$$

The first two minima are attained, whereas the infimum over strictly positive risk values is not.

<a id="dep-cor-m-c1"></a>

**Execution costs** A positive execution cost proportional to $`\varepsilon`$ exceeds the second-order nominal gain for small trades. To retain a critical-budget comparison, suppose instead that the deterministic cost paid to implement the new allocation $`B`$ satisfies $`c_{\mathrm{exec},\varepsilon}\ge0`$ and $`c_{\mathrm{exec},\varepsilon}/\varepsilon^2\to\theta\in[0,J/p)`$. With the stress class and metric fixed, cash invariance gives $`D^{\rm net}_\varepsilon=D_\varepsilon+c_{\mathrm{exec},\varepsilon}`$, whose rescaled profile converges locally uniformly to $`F+\theta`$.

Applying the tie and strict-reversal definitions in [(2.4)](#dep-eq-legacy-2-3) to the net profile, we obtain by strict growth and local uniform convergence $`\rho^{\pm,\rm net}_\varepsilon=s_\theta\varepsilon^2+o(\varepsilon^2)`$, where $`s_\theta`$ is the unique solution of $`F(s_\theta)=-\theta`$. As the rescaled execution cost $`\theta`$ increases to $`J/p`$, this solution decreases continuously from $`s^*`$ to zero. For example, in the cheap-background case of Section 4.1, the explicit linear profile gives $`s_\theta=c_3(J-p\theta)`$.

<a id="dep-background-substitutability-and-minimum-cost-feasibility"></a>

## 4. Efficiency premiums and projected flow duality

We now ask when the critical coefficient reaches the local-efficiency lower bound and when a strict marginal-restoration premium remains. A locally efficient displacement need not preserve the marginal projections, so any unbalanced moment has to be compensated elsewhere. We measure this obstruction by testing each projected flux against a bounded measurable coordinate potential, using the $`L^1`$ dual representation of the restoration cost:

$$
\mathcal C(\alpha)-I(\alpha)
=\sup_{|\phi_i|\le\gamma_i}\sum_i\int_{I_i}\phi_i(q)j_i(q)\,dq
=\sup_{|\phi_i|\le\gamma_i}\int\sum_i\phi_i(\xi_i)d_i\,d\Pi_\alpha.
$$

Here $`\phi_i(q)`$ acts as a dual shadow price for the projected displacement moment at coordinate level $`q`$. For the projections to vanish, opposite signed displacements have to balance at each coordinate level, and then the leading restoration penalty disappears. We first identify the pointwise displacement required for equality in the efficiency bound, and then test its projections near an off-diagonal corner to rule out equality when only traded coordinates are cheapest. At equal effective costs, continuous potentials lead to the flow–cut duality of Section 4.2, and allowing nonzero projected fluxes in the restoration-cost bound leads to the piecewise-constant potential estimates of Section 5.1.

<a id="dep-a-necessary-and-sufficient-condition-for-zero-premium"></a>

### 4.1 Local efficiency and the zero-premium classification

With $`c_1=\gamma_1`$, $`c_2=\gamma_2`$, $`c_3=\gamma_3/\beta`$, and $`c_{\min}=\min\{c_1,c_2,c_3\}`$, Proposition [2.2](#dep-prop-nominal-benchmark) and Theorem [3.1](#dep-thm-critical-limit) already give $`F(s)\le-J/p+s/(pc_{\min})`$. The issue at zero risk difference is whether a kernel can satisfy the pointwise efficiency conditions while conserving every marginal projection, and we characterize those simultaneous equality conditions below.

Proposition [2.2](#dep-prop-nominal-benchmark) gives initial efficiency at each fixed trade size under [(2.9)](#dep-eq-legacy-3-4), and when $`\gamma_1=c_{\min}`$, Proposition [3.2](#dep-prop-balanced-linear-profile) separately realizes the limiting slope by matching opposite first-coordinate moments on each fiber. When only traded coordinates are cheapest, that matching is enough for the initial linear segment but cannot cover the whole tail section. If the background coordinate is cheapest, exchanging $`x,y`$ and reversing $`u`$ instead balances the required displacement on every background slice, which sustains the efficiency bound up to zero risk.

<a id="dep-lem-efficiency-bound"></a>

**Lemma 4.1 (Local-efficiency bound and critical-level optimality).** In the exchangeable box model of Section 2.2, every kernel with $`I(\alpha)<\infty`$ satisfies $`p\mathcal V(\alpha)+J\le\mathcal C(\alpha)/c_{\min}`$, so $`s^*\ge c_{\min}J`$. Set $`b=(1,1,\beta)`$ and $`\zeta=-(u+H)1_{\{u(u+H)<0\}}`$. Then $`s^*=c_{\min}J`$ if and only if there is a measurable probability kernel satisfying

<a id="dep-eq-legacy-6-3"></a>

$$
\begin{aligned}
b\cdot d=\zeta,\qquad |d|_\gamma=c_{\min}|\zeta|
&\quad\Pi_\alpha\text{-almost everywhere},\\
(\xi_i)_\#(d_i\,d\Pi_\alpha)=0
&\quad i=1,2,3.
\end{aligned}
\tag{4.1}
$$

Such a kernel has $`\mathcal C=I=c_{\min}J`$ and $`\mathcal V=0`$; every kernel with $`\mathcal V\ge0`$ and $`\mathcal C\le c_{\min}J`$ satisfies these conditions.

*Proof.* Set $`w=b\cdot d`$, $`\Delta_+(t,w)=(t+w)_+-t_+`$, and choose any $`\tau_A\in\arg\min G_1`$. To compare the risk gain with its transport cost, we evaluate the $`B`$-objective at zero, bound the difference of hinge increments by $`|w|`$, and use $`c_{\min}|w|\le |d|_\gamma`$. Recording the loss in each comparison gives

<a id="dep-eq-legacy-E-5"></a>

$$
\begin{aligned}
\frac{\mathcal C}{c_{\min}}-(p\mathcal V+J)
={}&\underbrace{\frac{\mathcal C-I}{c_{\min}}}_{\mathrm{I}}
+\underbrace{\left(\frac I {c_{\min}}-\int |w|\,d\Pi_\alpha\right)}_{\mathrm{II}}
+\underbrace{\frac g2\tau_A^2}_{\mathrm{III}}\\
&+\underbrace{\int[|w|-\Delta_+(u,w)+\Delta_+(u+H-\tau_A,w)]\,d\Pi_\alpha}_{\mathrm{IV}}\\
&+\underbrace{G_0(0)-\min_{\tau_B}G_0(\tau_B)}_{\mathrm{V}}.
\end{aligned}
\tag{4.2}
$$

The five terms (I)–(V) in [(4.2)](#dep-eq-legacy-E-5) have distinct roles: (I) the marginal-restoration penalty; (II) the excess transport cost over the cheapest normal movement, including cancellation between coordinate displacements; (III) the curvature cost of shifting the $`A_\varepsilon`$-threshold; (IV) the unsaturated hinge gain; and (V) the gap from evaluating the $`B`$-objective at zero instead of its minimum. For the fourth term, $`\Delta_+(t,w)\in[\min\{0,w\},\max\{0,w\}]`$, an interval of length $`|w|`$, so the difference of the two hinge increments cannot exceed $`|w|`$. All five terms are consequently nonnegative, proving the efficiency bound. Since $`\tau_A`$ was an arbitrary minimizer, equality forces each defect to vanish for every optimal $`A_\varepsilon`$-threshold.

To reach zero risk at the local-efficiency budget, none of these defects can remain. Indeed, if $`\mathcal V\ge0`$ and $`\mathcal C\le c_{\min}J`$, the left side of [(4.2)](#dep-eq-legacy-E-5) is nonpositive, so every nonnegative term must vanish and

<a id="dep-eq-legacy-E-7"></a>

$$
\mathcal V=0,\qquad \mathcal C=I=c_{\min}J,\qquad
\int|w|\,d\Pi_\alpha=J,\qquad j_i=0\quad(i=1,2,3).
\tag{4.3}
$$

In addition, $`\arg\min G_1=\{0\}`$ and $`0\in\arg\min G_0`$. The vanishing metric defect

<a id="dep-eq-legacy-E-8"></a>

$$
|d|_\gamma-c_{\min}|b\cdot d|
=\sum_i(\gamma_i-c_{\min}b_i)|d_i|
+c_{\min}\left(\sum_i b_i|d_i|-\left|\sum_i b_id_i\right|\right)
\tag{4.4}
$$

allows only cheapest coordinates, with all nonzero components having the sign of $`w`$. At $`\tau_A=0`$, equality in the hinge bound requires $`u\ge0`$, $`u+H\le-w`$ if $`w>0`$, and $`u\le0`$, $`u+H\ge-w`$ if $`w<0`$. Thus $`|w|\le K:=|u+H|1_{\{u(u+H)<0\}}`$, with the sign of $`\zeta`$ wherever $`w\ne0`$. Since

<a id="dep-eq-legacy-E-12"></a>

$$
\int_{\mathbb R}K\,du=H^2/2,\qquad
\int_{\mathbb R}\zeta\,du=-H|H|/2,
\tag{4.5}
$$

and every conditional kernel has mass one, $`\int K\,d\Pi_\alpha=J=\int|w|\,d\Pi_\alpha`$. Saturation of this nonnegative bound forces

<a id="dep-eq-legacy-6-4"></a>

$$
b\cdot d=\zeta\quad\Pi_\alpha\text{-almost everywhere},
\tag{4.6}
$$

which, with the metric and flux equalities, proves necessity.

For the converse, the threshold calculation depends only on the normal displacement $`w=\zeta`$. We integrate over the disagreement wedge and use exchangeability to obtain

<a id="dep-eq-legacy-D-2"></a>

$$
T_0(0)=J/2,\qquad T_1(0)=-J/2,\qquad
\int_{H>0}H^2\,d\sigma=\int_{H<0}H^2\,d\sigma=J.
\tag{4.7}
$$

Because the transformed $`B`$-loss retains its strict tail sign and places no atom at zero, we have $`G_0'(0)=0`$. With $`m_\pm=\int(\pm H)_+\,d\sigma>0`$, the mass placed at the $`A_\varepsilon`$-threshold kink gives

<a id="dep-eq-legacy-D-3"></a>

$$
G_{1,-}'(0)=-m_-<0,\qquad G_{1,+}'(0)=m_+>0.
\tag{4.8}
$$

By convexity, these strict one-sided inequalities make zero the unique minimizer of $`G_1`$. For $`G_0`$, the stationary regions $`\{H>0,u>0\}`$ and $`\{H<0,u<0\}`$ each have section mass $`g/2`$, and their unchanged normal coordinates cover the positive and negative half-lines, respectively. Hence $`\lambda_0\ge(g/2)\,dt`$ on $`\mathbb R`$, and Lemma [A.4](https://github.com/130U/mathematical-finance-project/blob/3cc4c7e9b36e77027962999b932a1df7972cd2ed/paper/source/technical-limit.tex#L103) yields $`G_0(\tau)-G_0(0)\ge g\tau^2/4`$, so zero is also the unique minimizer of $`G_0`$. Combining these minima with [(4.7)](#dep-eq-legacy-D-2) gives $`\mathcal V=0`$. Under [(4.1)](#dep-eq-legacy-6-3), we have $`I=c_{\min}J`$ and vanishing fluxes, so $`\mathcal C=c_{\min}J`$. Together with attainment of the critical cost in Theorem [3.3](#dep-thm-strict-crossing), this proves the equivalence. ∎

<a id="dep-thm-zero-premium"></a>

**Theorem 4.2 (Zero-premium classification).** For the exchangeable box model of [Section 2.2](#dep-model-critical-box) and every positive weight vector,

<a id="dep-eq-legacy-6-1"></a>

$$
s^*=Jc_{\min}\quad\Longleftrightarrow\quad
c_3\le\min\{\gamma_1,\gamma_2\}.
\tag{4.9}
$$

If $`c_3=c_{\min}`$, the profile is explicitly $`F(s)=-J/p+s/(pc_3)`$ for $`0\le s\le c_3J`$.

If $`\gamma_2\ge\gamma_1`$ and $`c_3>\gamma_1`$, then

<a id="dep-eq-legacy-6-2"></a>

$$
1<\frac{s^*}{\gamma_1J}\le\min\{1+\chi,c_3/\gamma_1\}<2,
\tag{4.10}
$$

where $`\chi=\|\ell_--\ell_+\|_{L^1(I)}/J\in(0,1)`$ is the projected imbalance of Section 3.3.

*Proof of Theorem [4.2](#dep-thm-zero-premium).*

By Lemma [4.1](#dep-lem-efficiency-bound), it suffices to allocate the prescribed displacement $`\zeta`$ among cheapest coordinates while preserving every marginal projection. The background coordinate admits such a balance because exchanging the traded losses and reversing the normal coordinate leaves each background slice fixed and reverses the required displacement. For the traded coordinates, the corresponding balance must instead be found along each $`x`$- or $`y`$-fiber. Near an off-diagonal corner, the required moment is bounded below by a positive multiple of $`\delta^2`$, whereas the opposite-side sources available at those coordinate levels have capacity only $`O(\delta^4)`$. We prove the background construction first and then use this discrepancy to exclude even randomized splitting among the traded directions.

<a id="dep-d-1-three-zero-risk-difference-kernels-scores-and-optimal-thresholds"></a>

**Comparison kernels and the sufficient direction** Assigning the prescribed displacement to one coordinate gives

<a id="dep-eq-legacy-D-1"></a>

$$
\alpha^{(1)}=\delta_{\zeta e_1},\qquad
\alpha^{(2)}=\delta_{\zeta e_2},\qquad
\alpha^{(3)}=\delta_{(\zeta/\beta)e_3}
\tag{4.11}
$$

with finite first moments and zero risk differences by the normal-displacement calculation [(4.7)](#dep-eq-legacy-D-2)–[(4.8)](#dep-eq-legacy-D-3) in Lemma [4.1](#dep-lem-efficiency-bound). The first two kernels have respective fluxes $`j_1=\ell_+-\ell_-`$ and $`j_2=\ell_--\ell_+`$, all other fluxes being zero. To verify the background projection, we use the exchange $`(x,y,u)\mapsto(y,x,-u)`$, which preserves $`\nu,\xi_3`$ and reverses $`\zeta`$. Absolute integrability then allows us to test against every bounded measurable $`\varphi`$, obtaining

<a id="dep-eq-legacy-D-6"></a>

$$
\int\varphi(\xi_3)d_3^{(3)}d\nu
=-\int\varphi(\xi_3)d_3^{(3)}d\nu=0.
\tag{4.12}
$$

All three projections of $`\alpha^{(3)}`$ vanish, yielding

<a id="dep-eq-legacy-D-7"></a>

$$
\mathcal C(\alpha^{(1)})=\gamma_1J(1+\chi),\quad
\mathcal C(\alpha^{(2)})=\gamma_2J(1+\chi),\quad
\mathcal C(\alpha^{(3)})=c_3J.
\tag{4.13}
$$

The background kernel proves sufficiency, including ties, and the least of these costs gives $`s^*\le J\min\{\gamma_1(1+\chi),\gamma_2(1+\chi),c_3\}`$, which yields the upper bound in [(4.10)](#dep-eq-legacy-6-2) when $`\gamma_2\ge\gamma_1`$ and $`c_3>\gamma_1`$.

When $`c_3=c_{\min}`$, mix the background kernel $`\alpha^{(3)}`$ with the identity using weight $`\theta=s/(c_3J)\in[0,1]`$. Both kernels have zero projected flux and both threshold objectives attain their minima at zero, by [(4.7)](#dep-eq-legacy-D-2)–[(4.8)](#dep-eq-legacy-D-3) and $`G_c^{\delta_0}(\tau)=g\tau^2/2`$, so cost and paired risk are affine along the mixture. Its cost is $`\theta c_3J=s`$, and [(4.7)](#dep-eq-legacy-D-2) gives

<a id="dep-eq-legacy-D-9"></a>

$$
\mathcal V=-(1-\theta)J/p.
\tag{4.14}
$$

Thus the mixture attains the efficiency bound on the stated interval.

<a id="dep-e-3-a-local-obstruction-to-zero-flux-in-the-two-asset-directions"></a>

**The obstruction for arbitrary randomized kernels** For necessity, suppose $`c_3>c_{\min}`$ and a kernel with $`\mathcal V\ge0`$ attains cost $`c_{\min}J`$. Lemma [4.1](#dep-lem-efficiency-bound) then requires $`d_3=0`$, $`d_1+d_2=\zeta`$, and both traded components to have the sign of $`\zeta`$. Since the kernel has finite first moment, its averaged displacement fields $`m_i(x,y)=\int_{\mathbb R}\int d_i\,\alpha_{\xi,u}(dd)\,du`$, $`i=1,2`$, are integrable on the section and satisfy, by [(4.1)](#dep-eq-legacy-6-3),

<a id="dep-eq-legacy-E-15"></a>

$$
\begin{aligned}
&m_1+m_2=-H|H|/2,\qquad |m_i|\le H^2/2,\\
&m_i\ge0\quad\text{for}\ x<y,\qquad
m_i\le0\quad\text{for}\ x>y.
\end{aligned}
\tag{4.15}
$$

Projected conservation gives, for every pair of Borel sets $`A,B\subset I`$,

<a id="dep-eq-legacy-E-16"></a>

$$
\int_{\Omega\cap\{x\in A\}}m_1d\sigma=0,\qquad
\int_{\Omega\cap\{y\in B\}}m_2d\sigma=0.
\tag{4.16}
$$

We test [(4.15)](#dep-eq-legacy-E-15)–[(4.16)](#dep-eq-legacy-E-16) near the upper-left off-diagonal corner of $`\Omega`$, where $`x`$ is small, $`y`$ is large, and the positive moment $`(y-x)^2/2`$ is bounded away from zero. Compensating this moment at the same coordinate levels requires negative moment from $`\{x>y\}`$, where the small value of $`x`$ or large value of $`y`$ confines available sources to a small triangle near the diagonal (Figure [2](#dep-fig-corner)).

<a id="dep-lem-v21-corner-geometry"></a>

The section base is the intersection of an open square with a diagonal strip, $`\Omega=(\ell,r)^2\cap\{q_-<x+y<q_+\}`$, whose boundaries and coordinate projection endpoints are

$$
\begin{gathered}
q_-=v-\beta r_3,\qquad q_+=v-\beta\ell_3,\\
\xi_-=\max\{\ell,q_--r\},\qquad
\xi_+=\min\{r,q_+-\ell\},\qquad \Delta=\xi_+-\xi_->0.
\end{gathered}
$$

Both coordinate projections of $`\Omega`$ equal $`(\xi_-,\xi_+)`$, and the interior diagonal point from [Section 2.3](#dep-geometry-interior-diagonal) satisfies $`\xi_-<x_*<\xi_+`$, confirming $`\Delta>0`$. In addition, $`q_*:=\xi_-+\xi_+\in[q_-,q_+]`$, so the corner $`(\xi_-,\xi_+)`$ lies in the closed strip, possibly on its boundary. The square diagonal through that corner runs parallel to the strip boundaries. On the corner square $`(x,y)=(\xi_-+t,\xi_+-z)`$, $`0<t,z<\delta`$, the strip condition reads $`-(q_*-q_-)<t-z<q_+-q_*`$. Because the two nonnegative slacks sum to $`\beta\Delta_3`$, at least one is at least $`\beta\Delta_3/2`$. Choosing $`\delta<\beta\Delta_3/2`$ therefore includes one of the triangles $`z<t`$ and $`t<z`$. If we also choose $`\delta<\Delta/4`$, we obtain

$$
E_\delta=\Omega\cap((\xi_-,\xi_-+\delta)\times(\xi_+-\delta,\xi_+)),
\qquad |E_\delta|\ge\delta^2/2,
\qquad y-x\ge\Delta/2\quad\hbox{on }E_\delta.
$$

Because $`f`$ is bounded below on $`S`$ and $`y-x\ge\Delta/2`$ on this region, there is a constant $`c_\Omega>0`$, independent of $`\delta`$, such that

<a id="dep-eq-legacy-E-20"></a>

$$
M_\delta:=\int_{E_\delta}(m_1+m_2)d\sigma
\ge c_\Omega\delta^2.
\tag{4.17}
$$

Testing [(4.16)](#dep-eq-legacy-E-16) on $`A_\delta=(\xi_-,\xi_-+\delta)`$ and $`B_\delta=(\xi_+-\delta,\xi_+)`$ requires $`M_\delta\le N_1+N_2`$, where

$$
N_1=\int_{\Omega\cap\{x\in A_\delta,\ x>y\}}(-m_1)d\sigma,
\qquad
N_2=\int_{\Omega\cap\{y\in B_\delta,\ x>y\}}(-m_2)d\sigma.
$$

In $`N_1`$, the conditions $`x\in A_\delta`$ and $`y<x`$ force $`\xi_-<y<x<\xi_-+\delta`$; in $`N_2`$, the sources similarly satisfy $`\xi_+-\delta<y<x<\xi_+`$. Each triangle has area $`O(\delta^2)`$, and [(4.15)](#dep-eq-legacy-E-15) bounds the corresponding displacement moment by $`-m_i\le H^2/2=(x-y)^2/2=O(\delta^2)`$. Applying the upper density bound gives

<a id="dep-eq-legacy-E-22"></a>

$$
N_1+N_2\le C_\Omega\int_0^\delta\int_0^x(x-y)^2\,dy\,dx
=\frac{C_\Omega}{12}\delta^4.
\tag{4.18}
$$

Here $`C_\Omega<\infty`$ is independent of $`\delta`$. For small $`\delta`$, the bound contradicts $`c_\Omega\delta^2\le M_\delta\le N_1+N_2`$. Attainment of the critical cost then implies $`s^*>Jc_{\min}`$ when $`c_3>c_{\min}`$, and [(4.13)](#dep-eq-legacy-D-7) gives [(4.10)](#dep-eq-legacy-6-2). ∎

<a id="dep-fig-corner"></a>

![Figure 2. Corner demand and return capacity, illustrated on $`I=I_3=[0,2]`$ for $`\beta=7/4`$, $`v=15/4`$, $`\delta=0.35`$. The blue region $`E_\delta`$ stays away from the diagonal and has demand at least a positive multiple of $`\delta^2`$. Return sources lie in the hatched triangles, which may extend beyond $`\Omega`$; their area and squared displacement are both $`O(\delta^2)`$, giving capacity $`O(\delta^4)`$. The bounds shown, with $`\lambda=\min f`$, $`\Lambda=\max f`$, and $`\Delta=\xi_+-\xi_-`$, violate $`M_\delta\le N_1+N_2`$ for sufficiently small positive $`\delta`$.](/assets/research/dependence/corner-capacity.png)

<a id="dep-required-background-share-and-the-boundary-response"></a>

### 4.2 Boundary sensitivity and the flow–cut representation

At equal effective costs, every efficient kernel has total required displacement $`J`$. At this critical level, the equality conditions and total-moment saturation in Lemma [4.1](#dep-lem-efficiency-bound) fix $`b\cdot d=\zeta`$ pointwise almost everywhere, so normal integration and exchange symmetrization reduce the remaining minimum-background allocation problem to shares on the two-dimensional half-section. Raising only the background penalty selects, to first order, the kernels that use the least background displacement, and we can calculate that amount by assigning as much displacement as possible to the traded coordinates under their projected conservation law. On $`D=\Omega\cap\{x<y\}`$, the measure $`d\mu=w\,d\sigma=w_\sigma(x,y)\,dx\,dy`$, where $`w=(y-x)^2/2`$, has mass $`J/2`$ and a continuous density, positive in the interior.

<a id="dep-prop-boundary-sensitivity"></a>

**Theorem 4.3 (Boundary derivative and projected flow duality).** Fix the reference model and $`p,\beta,\gamma`$, and set

$$
\boldsymbol\gamma(\eta)=(\gamma,\gamma,\beta\gamma(1+\eta)),\quad
\pi(\eta)=s^*(\boldsymbol\gamma(\eta))/(\gamma J)-1,\quad \eta\ge0.
$$

Let $`\mathcal C_0`$ be the cost at $`\eta=0`$, and let $`\mathcal Z_0=\{\alpha:I(\alpha)<\infty,\ \mathcal V(\alpha)=0,\ \mathcal C_0(\alpha)=\gamma J\}`$. When kernels are identified with their measures $`\Pi_\alpha`$, the set $`\mathcal Z_0`$ is nonempty and compact in the vague topology on $`\mathscr X`$ from Section 3.2. The following minimum is attained, and

<a id="dep-eq-legacy-6-5"></a>

$$
\pi(\eta)=a_+\eta+o(\eta),\qquad
a_+=\frac\beta J\min_{\alpha\in\mathcal Z_0}
\int|d_3|\,d\Pi_\alpha\in[0,1].
\tag{4.19}
$$

On $`D=\Omega\cap\{x<y\}`$, equip the half-section with $`d\mu=\frac12(y-x)^2\,d\sigma`$. For measurable shares $`a,b`$, define

$$
\mathfrak F_\mu=\max\left\{\int_D(a+b)d\mu:
a,b\ge0,\ a+b\le1,\ (x)_\#(a\mu)=(y)_\#(b\mu)\right\}.
$$

The optimum is attained and satisfies $`0<\mathfrak F_\mu<J/2`$. Moreover,

<a id="dep-eq-legacy-6-8"></a>

$$
a_+=1-\frac{2\mathfrak F_\mu}{J}\in(0,1),\qquad
\mathfrak F_\mu=\inf_{\substack{\varphi\text{ measurable}\\|\varphi|\le1}}
\int_D\max\{0,1-\varphi(x),1+\varphi(y)\}\,d\mu.\tag{4.20}
$$

Equivalently, $`a_+`$ is the supremum of the projected cut deficits

<a id="dep-eq-legacy-6-9"></a>

$$
a_+=\frac2J\sup_{U\cap V=\varnothing}
\left[\mu(D\cap(U\times V))-
\mu\bigl(D\cap((V\times I)\cup(I\times U))\bigr)\right].\tag{4.21}
$$

Here $`U,V\subset I`$ are disjoint measurable sets.

In words, $`2\mathfrak F_\mu`$ is the largest normal-displacement moment that the traded coordinates can accommodate while balancing their marginal projections. The cut formula [(4.21)](#dep-eq-legacy-6-9) writes $`a_+`$ as $`2/J`$ times the maximal deficit between the moment required on $`D\cap(U\times V)`$ and the compensating capacity on $`D\cap((V\times I)\cup(I\times U))`$.

*Proof sketch.* For $`\alpha\in\mathcal Z_0`$, normal integration and exchange symmetrization yield shares satisfying $`(x)_\#(a\mu)=(y)_\#(b\mu)`$ and background amount $`\beta\int|d_3|\,d\Pi_\alpha=J-2\int_D(a+b)\,d\mu`$. Conversely, every feasible pair of shares lifts to a kernel in $`\mathcal Z_0`$, so the minimum background amount is $`J-2\mathfrak F_\mu`$ (Appendix [A.8](https://github.com/130U/mathematical-finance-project/blob/3cc4c7e9b36e77027962999b932a1df7972cd2ed/paper/source/technical-flow-proof.tex#L1)). Dividing by $`J`$ gives $`a_+`$, and Appendix [A.7](https://github.com/130U/mathematical-finance-project/blob/3cc4c7e9b36e77027962999b932a1df7972cd2ed/paper/source/technical-cost-proof.tex#L1) establishes [(4.19)](#dep-eq-legacy-6-5) by comparing perturbed minimizers with a least-background kernel. Sion's theorem with continuous coordinate potentials gives [(4.20)](#dep-eq-legacy-6-8); signed layer-cake reduction then gives [(4.21)](#dep-eq-legacy-6-9).

<a id="dep-d-4-weights-the-tail-surface-and-the-order-of-limits"></a>

**Dependence on the transport weights** Varying the positive transport weights leaves the finite-first-moment kernel class and $`\mathcal V`$ unchanged. With $`A_i(\alpha)=\int|d_i|\,d\Pi_\alpha+\|j_i\|_1`$, the coordinate cost including marginal restoration, we may therefore write

<a id="dep-eq-legacy-D-11"></a>

$$
s^*(\gamma)=\inf_{\mathcal V(\alpha)\ge0}\sum_i\gamma_i A_i(\alpha).
\tag{4.22}
$$

Because the feasible class is independent of $`\gamma`$, this infimum of nonnegative linear functions is positively homogeneous, coordinatewise nondecreasing, and concave. In particular, $`r_-\gamma\le\widetilde\gamma\le r_+\gamma`$, with $`0<r_-\le r_+`$, implies $`r_-s^*(\gamma)\le s^*(\widetilde\gamma)\le r_+s^*(\gamma)`$, ensuring stability under relative weight perturbations.

The strict-premium classification also persists as long as the perturbed background cost remains above the cheapest traded cost. For example, equal effective costs $`\gamma=(1,1,\beta)`$ lie on the zero-premium boundary. Starting instead from $`\beta=1`$ and $`\gamma=(1,1,2)`$, any perturbation with $`r_+<2r_-`$ satisfies $`\widetilde\gamma_3>\max\{\widetilde\gamma_1,\widetilde\gamma_2\}`$ and therefore retains a strict premium.

<a id="dep-critical-cost-premia-background-dependence-and-finite-reallocations"></a>

## 5. Analytical illustrations and financial implications

<a id="dep-strict-premium-despite-equal-efficiency"></a>

### 5.1 Projection potentials and a uniform reference

Assigning a bounded shadow price $`\phi_i`$ to each marginal flux lets us bound the strict premium without solving the full risk optimization. For a prescribed normal displacement we first minimize the adjusted coordinate costs $`\gamma_i\pm\phi_i(\xi_i)`$, and then we compare that minimum with the paired hinge gain.

<a id="dep-prop-projection-potential-bound"></a>

**Proposition 5.1 (A projection-potential bound).** In the exchangeable box model, let $`b=(1,1,\beta)`$ and let $`|\phi_i|\le\gamma_i`$ be bounded measurable potentials on the coordinate intervals such that $`k_\pm(\xi)=\min_{1\le i\le3}(\gamma_i\pm\phi_i(\xi_i))/b_i`$ are bounded below by a positive constant. For every finite-first-moment kernel, every $`\tau\in\arg\min G_1`$, and every $`\lambda>0`$,

<a id="dep-eq-legacy-J-6"></a>

$$
\mathcal C(\alpha)\ge
\lambda\left(J+p\mathcal V+\frac g2\tau^2\right)
-\frac{\lambda}{2}\int_\Omega(H-\tau)^2
\left(\frac{\lambda}{k(\xi,H-\tau)}-1\right)_+\,d\sigma,
\tag{5.1}
$$

where $`k(\xi,h)=k_+(\xi)`$ for $`h<0`$ and $`k_-(\xi)`$ for $`h>0`$. The integrand is zero when $`h=0`$.

The proof in [Appendix B.1](https://github.com/130U/mathematical-finance-project/blob/3cc4c7e9b36e77027962999b932a1df7972cd2ed/paper/source/technical-quantitative.tex#L3) optimizes the hinge gain against the adjusted cost $`k_+w_++k_-(-w)_+`$, where $`w=b\cdot d`$. To quantify how far the reversal budget can exceed the initial-slope prediction, we use an analytically tractable reference with independent uniform losses on $`[0,2]`$, $`\beta=1`$, $`p=1/2`$, and $`\gamma=(\gamma_0,\gamma_0,2\gamma_0)`$. Equal exposures and the median tail make the section invariant under central reflection, so $`v=3`$, $`d\sigma=dx\,dy/8`$, $`g=3/8`$, and $`J=5/32`$.

In the cut representation of Theorem [4.3](#dep-prop-boundary-sensitivity), the midpoint partition corresponds to $`\varphi(q)=1_{[0,1)}(q)-1_{(1,2]}(q)`$. Scaling this potential by $`\gamma_0/2`$ and using opposite signs on the two traded coordinates carries the same partition over to the marginal-flux penalty in Proposition [5.1](#dep-prop-projection-potential-bound), giving the admissible two-level potentials

$$
\phi_1(x)=\frac{\gamma_0}{2}\operatorname{sgn}(1-x),\qquad
\phi_2(y)=\frac{\gamma_0}{2}\operatorname{sgn}(y-1),\qquad \phi_3=0.
$$

Their signs distinguish low-loss from high-loss coordinate halves. At zero threshold shift, a positive paired hinge gain requires normal movement $`w=b\cdot d>0`$ when $`x<y`$, and $`w<0`$ when $`x>y`$. With amplitude $`\gamma_0/2`$, the effective cost in this direction across the midpoint is $`k(\xi,H)=3\gamma_0/2`$, and both directional costs on either same-side region are $`\gamma_0/2`$. Choosing $`\lambda=3\gamma_0/2`$ in [(5.1)](#dep-eq-legacy-J-6) therefore removes the cross-region penalty at zero threshold. The proof below keeps the correction for shifted minimizing thresholds, which makes the bound valid without prescribing either ES threshold.

<a id="dep-prop-uniform-variable-cost"></a>

**Corollary 5.2 (Uniform reference with costly background displacement).** For this uniform reference,

<a id="dep-eq-legacy-7-1"></a>

$$
\frac{13}{64}\le\frac{s^*}{\gamma_0}\le\frac{29}{96},
\qquad \frac{s^*}{\gamma_0J}\ge\frac{13}{10}.
\tag{5.2}
$$

The initial linear profile holds on $`0\le s\le\gamma_0/96`$.

*Proof.* For $`1/2\le x\le1`$, the negative-moment section has $`1-x<y<x`$, so integrating $`(x-y)^2/16`$ over this interval gives $`\ell_-(x)=(2x-1)^3/48`$. For $`0\le x\le1/2`$, the section is empty and $`\ell_-(x)=0`$. Reflection gives $`\ell_+(x)=\ell_-(2-x)`$. On the lower half of $`I`$, $`\ell_-`$ is the smaller moment, which gives $`Q_{\rm bal}=2\int_{1/2}^1\ell_-(x)\,dx=1/192`$. Using $`\int_I(\ell_-+\ell_+)\,dx=J`$ then gives $`\|\ell_--\ell_+\|_1=J-2Q_{\rm bal}=7/48`$, and Proposition [3.2](#dep-prop-balanced-linear-profile) yields $`s_{\rm lin}=\gamma_0/96`$. The first-coordinate kernel $`\delta_{\zeta e_1}`$ from [(4.11)](#dep-eq-legacy-D-1) reaches zero risk at cost $`\gamma_0(J+\|\ell_--\ell_+\|_1)=29\gamma_0/96`$. For the lower bound, the midpoint potentials with $`\lambda=3\gamma_0/2`$ give

$$
\frac{\mathcal C}{\gamma_0}\ge
\begin{cases}
\displaystyle \frac34\mathcal V+\frac{13}{64}
+\frac{\tau^2(6-\tau^2)}{64},& |\tau|\le1,\\[2pt]
\displaystyle \frac12\mathcal V+\frac{11}{32},& |\tau|\ge1.
\end{cases}
$$

For $`|\tau|\le1`$, the section integrations in [Appendix B.2](https://github.com/130U/mathematical-finance-project/blob/3cc4c7e9b36e77027962999b932a1df7972cd2ed/paper/source/technical-quantitative.tex#L32) give the first line. For $`|\tau|\ge1`$, the efficiency decomposition [(4.2)](#dep-eq-legacy-E-5) gives the second. Every kernel with $`\mathcal V\ge0`$ therefore costs at least $`13\gamma_0/64`$, which is $`30\%`$ above $`\gamma_0J`$. ∎

<a id="dep-app-quantitative-benchmarks"></a>

Setting $`\gamma_0=1`$, we obtain analytical envelopes for $`F(s)`$ on $`[0,U]`$, where $`U=29/96`$. The balanced kernel has cost $`s_0=1/96`$, zero projected flux, and risk $`-7/24`$, and the first-coordinate comparison kernel has cost $`U`$ and risk zero. Their convex mixtures have affine paired risk because zero minimizes both threshold objectives for each kernel, and affine cost because the balanced kernel has zero flux. Joining these mixtures to the exact initial linear segment realizes the lower envelope

$$
\underline F(s)=
\begin{cases}
2s-5/16,&0\le s\le1/96,\\
s-29/96,&1/96\le s\le29/96.
\end{cases}
$$

To bound $`F`$ from above, we invert the two threshold estimates and combine them with the efficiency bound:

$$
\begin{aligned}
F(s)&\le\min\left\{2s-\frac5{16},
\max\left\{\frac43s-\frac{13}{48},2s-\frac{11}{16}\right\}\right\}
\\
&=\overline F(s):=\min\left\{2s-\frac5{16},\frac43s-\frac{13}{48}\right\}
\qquad(0\le s\le U).
\end{aligned}
$$

The last equality holds because the branches inside the maximum meet only at $`s=5/8>U`$. Figure [3](#dep-fig-budget) plots the analytical envelopes $`\underline F\le F\le\overline F`$ on $`[0,U]`$. The guaranteed linear segment $`[0,s_{\rm lin}]`$ covers one fifteenth of the tangent prediction $`J=5/32`$, whereas the critical coefficient $`s^*`$ lies between $`13/10`$ and $`29/15`$ times $`J`$. So the initial slope is attained on a positive interval, and the required reversal budget is still at least $`30\%`$ higher than its tangent prediction.

<a id="dep-fig-budget"></a>

![Figure 3. Proved risk envelopes for the independent uniform model with $`\beta=1`$, $`p=1/2`$, and $`\gamma=(1,1,2)`$. Explicit mixtures attain the lower envelope; the upper envelope follows from midpoint potentials and the efficiency bound. The inset shows the exact initial interval $`[0,1/96]`$ in green. The dashed line extrapolates its slope to $`J=5/32`$, whereas the critical budget lies in $`[13/64,29/96]`$. Both plotted envelopes are piecewise linear analytical formulas.](/assets/research/dependence/budget-comparison.png)

<a id="dep-background-dependence-changes-substitutability-even-with-identical-marginals"></a>

### 5.2 A dependence family with fixed marginal laws

Section 5.1 used an independent uniform reference with background displacement twice as costly as either traded direction. We now move to the equal-effective-cost boundary to see how changing the reference dependence affects the required background share $`a_+`$ and the budget derivative $`\gamma_0Ja_+`$. Keeping uniform marginals, $`\beta=1`$, and $`p=1/2`$, we perturb the independent density by the product of the centered losses $`x+y-2`$ and $`z-1`$:

$$
f_\vartheta(x,y,z)=\frac{1+\vartheta(x+y-2)(z-1)}8,\qquad
|\vartheta|<\frac12,\qquad
E_\vartheta[(X_1+X_2-2)(X_3-1)]=\frac{2\vartheta}{9}.
$$

After rescaling the losses to $`[0,1]`$, this is a one-parameter subfamily of the trivariate Farlie–Gumbel–Morgenstern family [[27](#ref-otakimura2021), Section 2]: the interactions between each traded coordinate and the background have parameter $`\vartheta`$, and the other interaction parameters are zero. Centering preserves every marginal, and the parameter restriction keeps the density strictly positive on the cube. Central reflection fixes $`v=3`$, where the section density is $`[1-\vartheta(x+y-2)^2]/8`$, so increasing $`\vartheta`$ reduces the section mass away from $`x+y=2`$ even as covariance increases. On the unchanged half-section $`D`$, let $`d\mu_\vartheta=w_{\sigma,\vartheta}(x,y)\,dx\,dy`$, where $`w_{\sigma,\vartheta}(x,y)=(y-x)^2\{1-\vartheta(x+y-2)^2\}/16`$. Set $`D_-=D\cap\{y<1\}`$, $`D_+=D\cap\{x>1\}`$, and denote the same-side masses by $`M_{\vartheta,\pm}=\mu_\vartheta(D_\pm)`$.

<a id="dep-prop-dependence-family"></a>

**Proposition 5.3 (Background share along the dependence family).** For $`|\vartheta|<1/2`$, the boundary flow is attained and

<a id="dep-eq-legacy-K-9"></a>

$$
J_\vartheta=\frac{75-14\vartheta}{480},\qquad
M_{\vartheta,-}=M_{\vartheta,+}=\frac{3-2\vartheta}{1152},
\qquad
a_{+,\vartheta}
=1-\frac{4(M_{\vartheta,-}+M_{\vartheta,+})}{J_\vartheta}.
\tag{5.3}
$$

In particular,

$$
J_\vartheta a_{+,\vartheta}=\frac{195-22\vartheta}{1440},\qquad
\frac{d a_{+,\vartheta}}{d\vartheta}
=\frac{360}{(75-14\vartheta)^2}>0,\qquad
\frac{d(J_\vartheta a_{+,\vartheta})}{d\vartheta}
=-\frac{11}{720}.
$$

To obtain the explicit value, we use all the mass in $`D_-`$ and $`D_+`$ and match their projections in two disjoint parts of the cross-region. The section inequalities in [Appendix B.3](https://github.com/130U/mathematical-finance-project/blob/3cc4c7e9b36e77027962999b932a1df7972cd2ed/paper/source/technical-quantitative.tex#L49) give the required capacity throughout $`|\vartheta|<1/2`$, and the midpoint potential gives the same value in the dual problem, so this feasible flow is optimal.

As reference dependence varies through $`0<\vartheta<1/2`$, the minimum background share and the corresponding unnormalized displacement moment move in opposite directions:

<a id="dep-eq-legacy-7-2"></a>

$$
a_{+,\vartheta}-a_{+,0}
=\frac{24\vartheta}{5(75-14\vartheta)}>0,\qquad
J_\vartheta a_{+,\vartheta}-J_0a_{+,0}
=-\frac{11\vartheta}{720}<0.
\tag{5.4}
$$

The contrast comes from the median plane $`x+y+z=3`$, on which the centered factors satisfy $`z-1=-(x+y-2)`$. Increasing $`\vartheta`$ thus favors equal signs in the full box but reduces the section density away from $`x+y=2`$ by the factor $`1-\vartheta(x+y-2)^2`$. Across both exchanged half-sections, the traded-coordinate matching capacity is $`4(M_{\vartheta,-}+M_{\vartheta,+})`$. By [(5.3)](#dep-eq-legacy-K-9), $`J_\vartheta`$ decreases faster in absolute units than this capacity, so their difference $`J_\vartheta a_{+,\vartheta}`$ declines. In proportion, though, the matching capacity falls faster than $`J_\vartheta`$ throughout $`0<\vartheta<1/2`$, which leaves a larger relative share for the background coordinate.

Figure [4](#dep-fig-flow-shares) compares two examples: independence ($`\vartheta=0`$, model U) and $`\vartheta=1/4`$ (model D). The triples $`(J_\vartheta,a_{+,\vartheta},J_\vartheta a_{+,\vartheta})`$ are $`(5/32,13/15,13/96)`$ and $`(143/960,379/429,379/2880)`$, so the minimum background share rises from about $`0.8667`$ to $`0.8834`$ while its unnormalized displacement moment falls from about $`0.1354`$ to $`0.1316`$.

<a id="dep-fig-flow-shares"></a>

![Figure 4. An optimal allocation of normal displacement on the tail surface $`D`$, at the equal-cost boundary, for $`\vartheta=0`$ (U, top) and $`\vartheta=1/4`$ (D, bottom). The panels evaluate the explicit shares $`a,b,1-a-b`$ in [(B.2)](https://github.com/130U/mathematical-finance-project/blob/3cc4c7e9b36e77027962999b932a1df7972cd2ed/paper/source/technical-quantitative.tex#L80); all use the same scale from zero to one. On each same-side section we allocate displacement to a rebalanced coordinate and match its projection using the cross-region. We allocate the remainder to the background coordinate. Blank regions lie outside $`D`$.](/assets/research/dependence/optimal-flow-shares.png)

<a id="dep-conclusions"></a>

### 5.3 Implications for reverse stress testing and further questions

Theorem [4.2](#dep-thm-zero-premium) shows that an exact initial sensitivity need not predict how much dependence stress is required to reverse a diversification trade. This bears on reverse sensitivity analysis [[28](#ref-pesenti2019), [29](#ref-pesenti2022)], where the quantity of interest is the distance to a decision reversal. Under the traded-coordinate dominance condition [(2.9)](#dep-eq-legacy-3-4), $`r_{0,\varepsilon}=m_\varepsilon/K_\varepsilon`$ extrapolates an attained initial slope, yet if $`\gamma_1=c_{\min}<c_3`$,

$$
\frac{\rho^\pm_\varepsilon}{r_{0,\varepsilon}}\longrightarrow\frac{s^*}{\gamma_1J}>1.
$$

Proposition [3.2](#dep-prop-balanced-linear-profile) attains the initial slope by balancing opposite movements on selected fibers. Equality in the efficiency bound at reversal would require balancing cheapest-coordinate projections across the entire tail section, and under the stated cost condition the corner obstruction of Theorem [4.2](#dep-thm-zero-premium) excludes that. Unlike optimal allocation across full Fréchet or Wasserstein ambiguity sets [[23](#ref-liu2026)], our reverse stress test fixes a proposed trade and measures the least perturbation of a common reference law that reverses its paired ES ranking.

A whole-book comparison across reference dependence structures also has to account for the size of the nominal advantage. In the family of Section 5.2, consider the boundary perturbation $`\boldsymbol\gamma(\eta)=(\gamma_0,\gamma_0,\gamma_0(1+\eta))`$. The gain-normalized critical budget and its right derivative at equal effective costs satisfy

$$
\mathcal R_\vartheta(\eta):=\lim_{\varepsilon\downarrow0}
\frac{\rho^\pm_{\varepsilon,\vartheta}(\eta)}{m_{\varepsilon,\vartheta}}
=\frac{p\,s^*_\vartheta(\eta)}{J_\vartheta},\qquad
\mathcal R_\vartheta'(0+)=p\gamma_0a_{+,\vartheta}.
$$

Theorem [4.3](#dep-prop-boundary-sensitivity) gives the absolute right derivative $`(s^*_\vartheta)'(0+)=\gamma_0J_\vartheta a_{+,\vartheta}`$. By [(5.4)](#dep-eq-legacy-7-2), increasing $`\vartheta`$ raises the gain-normalized response $`\mathcal R_\vartheta'(0+)`$ but lowers the absolute response: $`\frac{d}{d\vartheta}(\gamma_0J_\vartheta a_{+,\vartheta})=\gamma_0(J_\vartheta'a_{+,\vartheta}+J_\vartheta a_{+,\vartheta}')<0`$, so the decline in the nominal-gain scale outweighs the increase in background share. Reporting both boundary sensitivities to a risk committee separates a greater relative need for background displacement from a smaller absolute response in budget units.

Characterizing the boundaries between the active and stationary regions of an optimal kernel could help determine the full profile $`F`$ between the analytical envelopes, beyond the guaranteed initial linear interval. A uniform rate for $`\sup_{s\le S_0}|\varepsilon^{-2}D_\varepsilon(s\varepsilon^2)-F(s)|`$, combined with the lower growth estimate in Theorem [3.3](#dep-thm-strict-crossing), would yield finite-trade error bounds for the critical budgets.

In the compact-box benchmark, a restoration premium can arise from dependence geometry and full marginal conservation even with bounded marginal tails. For unbounded marginals such as integrable Pareto or lognormal laws, the inverse-CDF derivative is unbounded near probability one, so the uniform displacement estimate in the recovery argument would need a tail-weighted substitute. Since one-dimensional $`W_1`$ remains the $`L^1`$ integral of the CDF discrepancy, this loss of a uniform quantile bound does not by itself imply a different restoration-cost exponent. The open problem is to control that integral jointly with the paired-risk error and determine whether the $`\varepsilon^2`$ critical scale persists under suitable tail assumptions. Higher-dimensional projected-flow representations and estimation of critical budgets from loss data raise related questions, alongside recent work on ES estimation under weak tail assumptions [[3](#ref-bartleckstein2026)].

## Appendices and supporting material

This page includes the complete abstract, five main sections, all four main-text figures, and references. Technical appendices and declarations are available in the [full manuscript](https://github.com/130U/mathematical-finance-project/blob/3cc4c7e9b36e77027962999b932a1df7972cd2ed/paper/paper.pdf) and the [GitHub repository](https://github.com/130U/mathematical-finance-project).

## References

<a id="ref-artzner1999"></a>

1. P. Artzner, F. Delbaen, J.-M. Eber, and D. Heath, *Coherent measures of risk*, Math. Finance, 9(3) (1999), pp. 203–228, [doi:10.1111/1467-9965.00068](https://doi.org/10.1111/1467-9965.00068).

<a id="ref-bartl2021"></a>

2. D. Bartl, S. Drapeau, J. Obłój, and J. Wiesel, *Sensitivity analysis of Wasserstein distributionally robust optimization problems*, Proc. R. Soc. A, 477(2256) (2021), article 20210176, [doi:10.1098/rspa.2021.0176](https://doi.org/10.1098/rspa.2021.0176).

<a id="ref-bartleckstein2026"></a>

3. D. Bartl and S. Eckstein, *Optimal nonparametric estimation of the expected shortfall risk*, preprint (2026), to appear in SIAM J. Financial Math., [arXiv:2405.00357v2](https://arxiv.org/abs/2405.00357v2).

<a id="ref-bartlwiesel2023"></a>

4. D. Bartl and J. Wiesel, *Sensitivity of multiperiod optimization problems with respect to the adapted Wasserstein distance*, SIAM J. Financial Math., 14(2) (2023), pp. 704–720, [doi:10.1137/22M1537746](https://doi.org/10.1137/22M1537746).

<a id="ref-bernard2014"></a>

5. C. Bernard, X. Jiang, and R. Wang, *Risk aggregation with dependence uncertainty*, Insur. Math. Econ., 54 (2014), pp. 93–108, [doi:10.1016/j.insmatheco.2013.11.005](https://doi.org/10.1016/j.insmatheco.2013.11.005).

<a id="ref-bertsekas2009"></a>

6. D. P. Bertsekas, *Convex Optimization Theory*, Athena Scientific, Belmont, MA, 2009, [author's online edition](https://web.mit.edu/dimitrib/www/Convex_Theory_Entire_Book.pdf).

<a id="ref-blanchet2019"></a>

7. J. Blanchet and K. Murthy, *Quantifying distributional model risk via optimal transport*, Math. Oper. Res., 44(2) (2019), pp. 565–600, [doi:10.1287/moor.2018.0936](https://doi.org/10.1287/moor.2018.0936).

<a id="ref-brandtner2018"></a>

8. M. Brandtner, *Expected shortfall, spectral risk measures, and the aggravating effect of background risk, or: risk vulnerability and the problem of subadditivity*, J. Bank. Financ., 89 (2018), pp. 138–149, [doi:10.1016/j.jbankfin.2018.02.002](https://doi.org/10.1016/j.jbankfin.2018.02.002).

<a id="ref-chenfurmanlin2026"></a>

9. J. Chen, E. Furman, and X. S. Lin, *Static marginal expected shortfall: Systemic risk measurement under dependence uncertainty*, Insur. Math. Econ., 130 (2026), article 103285, [doi:10.1016/j.insmatheco.2026.103285](https://doi.org/10.1016/j.insmatheco.2026.103285).

<a id="ref-chen2022"></a>

10. Y. Chen, P. Liu, Y. Liu, and R. Wang, *Ordering and inequalities for mixtures on risk aggregation*, Math. Finance, 32(1) (2022), pp. 421–451, [doi:10.1111/mafi.12323](https://doi.org/10.1111/mafi.12323).

<a id="ref-dalmaso1993"></a>

11. G. Dal Maso, *An Introduction to $`\Gamma`$-Convergence*, Progress in Nonlinear Differential Equations and Their Applications 8, Birkhäuser, Boston, 1993, [doi:10.1007/978-1-4612-0327-8](https://doi.org/10.1007/978-1-4612-0327-8).

<a id="ref-devecchinendelstreicher2026"></a>

12. C. De Vecchi, M. Nendel, and J. Streicher, *Upper comonotonicity and risk aggregation under dependence uncertainty*, Math. Finance, 36(1) (2026), pp. 118–139, [doi:10.1111/mafi.70008](https://doi.org/10.1111/mafi.70008).

<a id="ref-eckstein2020"></a>

13. S. Eckstein, M. Kupper, and M. Pohl, *Robust risk aggregation with neural networks*, Math. Finance, 30(4) (2020), pp. 1229–1272, [doi:10.1111/mafi.12280](https://doi.org/10.1111/mafi.12280).

<a id="ref-eckstein2021multiasset"></a>

14. S. Eckstein, G. Guo, T. Lim, and J. Obłój, *Robust pricing and hedging of options on multiple assets and its numerics*, SIAM J. Financial Math., 12(1) (2021), pp. 158–188, [doi:10.1137/19M1286256](https://doi.org/10.1137/19M1286256).

<a id="ref-embrechts2013"></a>

15. P. Embrechts, G. Puccetti, and L. Rüschendorf, *Model uncertainty and VaR aggregation*, J. Bank. Financ., 37(8) (2013), pp. 2750–2764, [doi:10.1016/j.jbankfin.2013.03.014](https://doi.org/10.1016/j.jbankfin.2013.03.014).

<a id="ref-embrechts2015"></a>

16. P. Embrechts, B. Wang, and R. Wang, *Aggregation-robustness and model uncertainty of regulatory risk measures*, Finance Stoch., 19(4) (2015), pp. 763–790, [doi:10.1007/s00780-015-0273-z](https://doi.org/10.1007/s00780-015-0273-z).

<a id="ref-fiechtner2026"></a>

17. L.-B. Fiechtner and J. Blanchet, *Wasserstein distributionally robust regret optimization*, preprint, 2025, revised 2026, [arXiv:2504.10796v5](https://arxiv.org/abs/2504.10796v5).

<a id="ref-gao2017"></a>

18. R. Gao and A. J. Kleywegt, *Data-driven robust optimization with known marginal distributions*, working paper, 2017, [https://faculty.mccombs.utexas.edu/rui.gao/copula.pdf](https://faculty.mccombs.utexas.edu/rui.gao/copula.pdf).

<a id="ref-gao2023"></a>

19. R. Gao and A. J. Kleywegt, *Distributionally robust stochastic optimization with Wasserstein distance*, Math. Oper. Res., 48(2) (2023), pp. 603–655, [doi:10.1287/moor.2022.1275](https://doi.org/10.1287/moor.2022.1275).

<a id="ref-korman2015"></a>

20. J. Korman, R. J. McCann, and C. Seis, *Dual potentials for capacity constrained optimal transport*, Calc. Var. Partial Differential Equations, 54 (2015), pp. 573–584, [doi:10.1007/s00526-014-0795-9](https://doi.org/10.1007/s00526-014-0795-9).

<a id="ref-lam2018"></a>

21. H. Lam, *Sensitivity to serial dependency of input processes: A robust approach*, Manage. Sci., 64(3) (2018), pp. 1311–1327, [doi:10.1287/mnsc.2016.2667](https://doi.org/10.1287/mnsc.2016.2667).

<a id="ref-li2018partial"></a>

22. L. Li, H. Shao, R. Wang, and J. Yang, *Worst-case Range Value-at-Risk with partial information*, SIAM J. Financial Math., 9(1) (2018), pp. 190–218, [doi:10.1137/17M1126138](https://doi.org/10.1137/17M1126138).

<a id="ref-liu2026"></a>

23. P. Liu and Y. Liu, *Portfolio diversification and concentration under dependence uncertainty: A majorization approach*, preprint, 2026, [arXiv:2609.04496v1](https://arxiv.org/abs/2609.04496v1).

<a id="ref-martin2011"></a>

24. R. J. Martin, *Saddlepoint methods in portfolio theory*, in The Oxford Handbook of Credit Derivatives, A. Lipton and A. Rennie, eds., Oxford University Press, Oxford (2011), pp. 533–569, [doi:10.1093/oxfordhb/9780199546787.013.0015](https://doi.org/10.1093/oxfordhb/9780199546787.013.0015).

<a id="ref-mcneil2015"></a>

25. A. J. McNeil, R. Frey, and P. Embrechts, *Quantitative Risk Management: Concepts, Techniques and Tools*, revised ed., Princeton University Press, Princeton, NJ, 2015.

<a id="ref-namkoong2026"></a>

26. H. Namkoong, *Local sensitivity under transport restrictions*, preprint, 2026, [arXiv:2606.04276v1](https://arxiv.org/abs/2606.04276v1).

<a id="ref-otakimura2021"></a>

27. S. Ota and M. Kimura, *Effective estimation algorithm for parameters of multivariate Farlie–Gumbel–Morgenstern copula*, Jpn. J. Stat. Data Sci., 4 (2021), pp. 1049–1078, [doi:10.1007/s42081-021-00118-y](https://doi.org/10.1007/s42081-021-00118-y).

<a id="ref-pesenti2019"></a>

28. S. M. Pesenti, P. Millossovich, and A. Tsanakas, *Reverse sensitivity testing: What does it take to break the model?*, European J. Oper. Res., 274(2) (2019), pp. 654–670, [doi:10.1016/j.ejor.2018.10.003](https://doi.org/10.1016/j.ejor.2018.10.003).

<a id="ref-pesenti2022"></a>

29. S. M. Pesenti, *Reverse sensitivity analysis for risk modelling*, Risks, 10(7) (2022), article 141, [doi:10.3390/risks10070141](https://doi.org/10.3390/risks10070141).

<a id="ref-pesentijaimungal2023"></a>

30. S. M. Pesenti and S. Jaimungal, *Portfolio optimization within a Wasserstein ball*, SIAM J. Financial Math., 14(4) (2023), pp. 1175–1214, [doi:10.1137/22M1496803](https://doi.org/10.1137/22M1496803).

<a id="ref-pflugpohl2018"></a>

31. G. Ch. Pflug and M. Pohl, *A review on ambiguity in stochastic portfolio optimization*, Set-Valued Var. Anal., 26(4) (2018), pp. 733–757, [doi:10.1007/s11228-017-0458-z](https://doi.org/10.1007/s11228-017-0458-z).

<a id="ref-rockafellar2002"></a>

32. R. T. Rockafellar and S. Uryasev, *Conditional value-at-risk for general loss distributions*, J. Bank. Financ., 26(7) (2002), pp. 1443–1471, [doi:10.1016/S0378-4266(02)00271-6](https://doi.org/10.1016/S0378-4266%2802%2900271-6).

<a id="ref-ruschendorf2013"></a>

33. L. Rüschendorf, *Mathematical Risk Analysis: Dependence, Risk Bounds, Optimal Allocations and Portfolios*, Springer Series in Operations Research and Financial Engineering, Springer, Berlin, Heidelberg, 2013, [doi:10.1007/978-3-642-33590-7](https://doi.org/10.1007/978-3-642-33590-7).

<a id="ref-santambrogio2015"></a>

34. F. Santambrogio, *Optimal Transport for Applied Mathematicians: Calculus of Variations, PDEs, and Modeling*, Progress in Nonlinear Differential Equations and Their Applications 87, Birkhäuser, Cham, 2015, [doi:10.1007/978-3-319-20828-2](https://doi.org/10.1007/978-3-319-20828-2).

<a id="ref-sauldubois2026"></a>

35. N. Sauldubois, *Higher-order sensitivity analysis of Wasserstein and adapted Wasserstein distributionally robust optimization problems*, preprint, 2026, [arXiv:2609.25345v1](https://arxiv.org/abs/2609.25345v1).

<a id="ref-scaillet2004"></a>

36. O. Scaillet, *Nonparametric estimation and sensitivity analysis of expected shortfall*, Math. Finance, 14(1) (2004), pp. 115–129, [doi:10.1111/j.0960-1627.2004.00184.x](https://doi.org/10.1111/j.0960-1627.2004.00184.x).

<a id="ref-sion1958"></a>

37. M. Sion, *On general minimax theorems*, Pacific J. Math., 8(1) (1958), pp. 171–176, [doi:10.2140/pjm.1958.8.171](https://doi.org/10.2140/pjm.1958.8.171).

<a id="ref-tasche2001"></a>

38. D. Tasche, *Conditional expectation as quantile derivative*, preprint, 2001, [arXiv:math/0104190v1](https://arxiv.org/abs/math/0104190v1).

<a id="ref-vallender1974"></a>

39. S. S. Vallender, *Calculation of the Wasserstein distance between probability distributions on the line*, Theory Probab. Appl., 18(4) (1974), pp. 784–786, [doi:10.1137/1118101](https://doi.org/10.1137/1118101).

<a id="ref-villani2003"></a>

40. C. Villani, *Topics in Optimal Transportation*, Graduate Studies in Mathematics 58, American Mathematical Society, Providence, RI, 2003.

<a id="ref-wang2015superadditive"></a>

41. R. Wang, V. Bignozzi, and A. Tsanakas, *How superadditive can a risk measure be?*, SIAM J. Financial Math., 6(1) (2015), pp. 776–803, [doi:10.1137/140981046](https://doi.org/10.1137/140981046).
