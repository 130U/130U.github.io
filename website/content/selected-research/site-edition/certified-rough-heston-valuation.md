---
description: A method for certifying portfolio valuation errors in rough Heston, carrying continuous Riccati residual bounds through to complete pricing guarantees.
---

## Abstract

How much numerical uncertainty remains in a portfolio of options when every strike is priced from the same approximate transform? In the rough Heston model, separate price intervals lose the common complex error at each Fourier frequency. We construct a joint error set by first deriving a residual bound for the fractional Riccati equation and then applying the portfolio pricing functional to the shared transform errors. The propagation kernel is determined by the forward variance curve and the positive fractional resolvent; it retains the full history and the initial curve term. The resulting support formula gives a precise equality condition for the loss incurred by separate price bounds. It also encloses an already computed pricing output, including its displacement from a certified reference, quadrature, the infinite tail and arithmetic. On twelve half-year strikes, the joint bounds bring all 28 fixed spread, butterfly and basket directions within a half-point error budget, against 13 for separate bounds. A matched quarter-year call spread, in a refinement specified after the first bound exceeded a quarter-point budget, shows the same distinction at a single decision: the complete joint upper bound is 0.233318843 index points, compared with 0.252393939 from signed marginal aggregation. Further experiments separate the effects of history weighting, reference refinement and output replacement. The method certifies numerical error relative to the specified model, which is a separate question from market mispricing.

**Keywords:** rough Heston; fractional Riccati equation; a posteriori error; portfolio valuation; shared Fourier errors.

## 1. Introduction

A portfolio is often valued by adding prices that were computed separately. Its numerical uncertainty need not add in the same way. Options with a common maturity and model parameter use the same characteristic function, so an error in that function enters every strike through a known Fourier coefficient. For a call spread, these coefficients can nearly cancel. A sum of separate absolute error bounds discards this information before the portfolio is formed.

We study the following question. Given a stored vector of rough Heston option prices, can its error in a specified portfolio direction be certified below a monetary tolerance? The output is held fixed. The task is to bound its difference from the exact model value, rather than to infer accuracy from agreement with another numerical solver. This distinction matters when a valuation must be checked as delivered, or when several portfolio directions must be assessed from one common pricing calculation.

Let \(c^*\) be the vector of exact, normalized model prices, \(c^{\rm fast}\) the stored output, and \(\bar c\) a finite reference sum. For a real portfolio vector \(w\), forward \(F_T\), discount factor \(D\), and tolerance \(\tau\), the question is whether

\[
DF_T\left|w^\top(c^*-c^{\rm fast})\right|\le\tau.
\]

The reference is useful only if its own uncertainty is controlled. Subtracting and adding that reference gives the exact decomposition

\[
c^*-c^{\rm fast}=d+\operatorname{Re}(A\delta)+r,
\qquad d=\bar c-c^{\rm fast}.
\tag{1.1}
\]

Here \(A\) contains the known pricing coefficients and \(\delta_n\) is the single transform error at frequency \(u_n\), common to all strikes. The remainder \(r\) contains the discrepancies outside this finite transform representation. Thus two questions arise in a definite order: how can the transform errors be bounded, and what is the correct way to combine those bounds for the portfolio?

### 1.1. From the Riccati equation to the portfolio error

The transform is determined by a nonlinear fractional Riccati equation. We first specify its unique exact solution and the pricing functional. The fractional derivative prevents the usual ordinary-differential-equation argument from being restarted at an intermediate time: the accumulated history remains part of the equation. For an absolutely continuous reference trajectory, subtraction nevertheless gives an exact linear error equation with a state-dependent coefficient. Its real part is controlled by the left half-plane geometry of the Riccati flow.

The exponent error has a second useful identity. Integration by parts transfers the fractional derivative from the state error to the forward variance curve. Combining this identity with the positive scalar resolvent produces a history weight for the residual. The weight is fixed by the equation and the payoff transform; it is not chosen to reproduce a numerical price. Theorem 3.1 gives the resulting bound, with nonexpansion as a limiting case and a sharper bound when there is positive dissipation.

Once a complex disk encloses each transform error, (1.1) determines a convex set of possible price errors. Evaluating its support in direction \(w\) combines the Fourier coefficients before taking their moduli. Theorem 5.1 gives the exact support of this outer set. The equality case of the complex triangle inequality then identifies precisely when separate price bounds lose nothing and when retaining the common errors gives a strictly smaller width. The condition is structural and is established before any numerical example is considered.

This leads to a complete certificate for the stored output. The centre displacement \(d\), finite omitted frequencies, strip quadrature, the true infinite tail and arithmetic all remain in the bound. A smaller transform radius alone need not improve the error of the stored output if the reference centre also changes. Keeping these terms explicit is therefore part of the mathematical construction, rather than an implementation detail.

### 1.2. The role of approximation

The error theorem is stated for a general reference trajectory satisfying its hypotheses. For computation we use a fractional integral of a piecewise affine function after removing the first startup powers forced by the Riccati equation. This choice has two purposes: it represents the singular behaviour at time zero explicitly, and it permits continuous residual bounds by exact fractional integration. Section 4 derives the startup coefficients before introducing their stored numerical counterparts. The certificate concerns the full residual on closed time cells; a small residual at sampled nodes is insufficient.

The output checked in the principal example uses the established third-order rational approximation of Gatheral and Radoicic. Its endpoint matching gives a compact production formula, and Section 6 proves structural properties on a specified parameter domain. Those properties do not by themselves establish pricing accuracy. The independent reference supplies the error enclosure, which is then translated to the production output by (1.1). The two constructions consequently have distinct mathematical roles.

The quarter-year spread in Section 7 uses the same stored output, reference centre, node radii and remaining error terms in the joint and marginal calculations. Only the aggregation changes. The complete bounds fall on opposite sides of a quarter-point budget. Other examples expose the limits of the improvement: reference generation has a cost, returning the reference is an alternative when output replacement is permitted, and a numerical-error certificate does not establish agreement with market quotes. The finite-candidate experiment keeps the forward variance curve fixed and reports quote compatibility separately from objective ranking.

### 1.3. Relation to the literature

Gatheral and Radoicic [GR2019, GR2023] derive rational approximations by matching the short- and long-time behaviour of the fractional Riccati solution. Jeng and Kilicman [JK2020, JK2021] study global Padé approximations and SPX pricing data. We use their approximation framework. The structural results here concern the raw matching system on an explicitly stated domain; they are separate from the residual certificate.

Abi Jaber and El Euch [AbiJaberElEuch2018] provide the Volterra model and affine transform used in Section 2. The analytical ingredients for error propagation are also established: Caputo convexity [LiLiu2018], positive fractional residual comparison [Kopteva2021], Mittag-Leffler positivity [SimonCM2015], and strip trapezoidal analysis [TrefethenWeideman2014]. We apply these results to the model's exponent functional, retain its initial curve term and physical scaling, and propagate the resulting common transform errors to portfolio directions. Appendix C gives the regularity and endpoint arguments required for this composition.

Bayer and Breneis [BBWeak2023, BBSimulation2023] study Markovian kernel approximations and simulation methods. Boyarchenko, de Innocentis and Levendorskii [BL2025] study reliable rough Heston pricing and calibration; their modified Adams method is one of our numerical controls. Ben Hammouda et al. [BenHammouda2026] allocate time-discretization and Fourier-quadrature errors in single- and multilevel methods. Hager and Kreher [HK2026] study expansions in the Hurst parameter. Our question concerns a posteriori enclosure of a specified output, including its complete remainder. This scope differs from a complexity bound, an observed convergence rate, or a comparison between nominal solvers.

Section 2 defines the exact problem. Sections 3 and 4 pass from the continuous residual to certified transform values. Section 5 derives the portfolio error set and its financial consequences. Section 6 records the rational output used in the experiments, and Section 7 presents the matched comparisons. Appendices A–E contain the model justification, detailed proofs and reproducibility record.

## 2. The exact pricing problem

Our conventions for the fractional integral and Caputo derivative are
\[
I^\alpha f(t)=\frac1{\Gamma(\alpha)}\int_0^t(t-s)^{\alpha-1}f(s)\,ds,
\qquad D_C^\alpha v=I^{1-\alpha}v',\quad v\in AC.
\tag{2.1}
\]
Under the regularity of the trajectories used below, \(I^\alpha f\in AC\) with zero initial value, so \(D_C^\alpha I^\alpha f=f\). The Caputo operator and all time scalings keep their fractional definitions. With \(a=u-i/2\), the physical Riccati state \(h\) satisfies
\[
D_{C,t}^\alpha h=-\frac{a^2+ia}{2}
 +(i\rho\nu a-\lambda_R)h+\frac{\nu^2}{2}h^2,\qquad h(0)=0.
\tag{2.2}
\]
Define
\[
x=\nu^{1/\alpha}t,\quad y=x^\alpha=\nu t^\alpha,\quad
H(x)=\nu h(t),\quad Z(t)=H(\nu^{1/\alpha}t),\quad
\kappa=\lambda_R/\nu,
\tag{2.3}
\]
\[
b=(u^2+1/4)/2,\quad s_0=\kappa-\rho/2,\quad d=-s_0+i\rho u,\quad
F(z)=-b+dz+z^2/2.
\]
Then \(D_{C,x}^\alpha H=F(H)\) and \(D_{C,t}^\alpha Z=\nu F(Z)\). Dividing the normalised state error by \(\nu\) gives the physical \(h\) error, and dividing the physical residual \(r_t=D_t^\alpha\widehat Z-\nu F(\widehat Z)\) by \(\nu\) gives the residual bound for the normalised equation.

For the probability model and the numerical examples, we fix \(\kappa=0\) and the entire forward variance curve
\[
\xi_*(t)=\theta+(V_0-\theta)E_{\alpha_0}(-\lambda_\xi t^{\alpha_0}),
\quad
(\alpha_0,V_0,\theta,\lambda_\xi)=(.5286,.0262,.0721,.5037).
\tag{2.4}
\]
The curve parameter \(\lambda_\xi\) and Riccati parameter \(\lambda_R\) are defined separately. Curve (2.4) remains fixed when the candidate \(\alpha\) changes. The probability model is
\[
V_t=\xi_*(t)+\nu\int_0^tK_\alpha(t-s)\sqrt{V_s}\,dW_s,\quad
K_\alpha(t)=t^{\alpha-1}/\Gamma(\alpha),\qquad
dS_t=S_t\sqrt{V_t}\,dB_t,\quad d\langle B,W\rangle_t=\rho\,dt.
\tag{2.5}
\]
Equation (2.5) is the forward variance representation with zero Riccati mean reversion. Appendix A verifies the probability model and affine transform associated with this curve using Theorems 2.1 and 2.3 and Example 2.2 of Abi Jaber and El Euch.

Let \(M_T=S_T/F_T\) be the normalised positive martingale and write \(\phi_T(a)=\mathbb E M_T^{ia}\). The exact characteristic exponent is
\[
L_T(u)=\int_0^T\xi_*(T-t)F(Z(t,u))\,dt,\quad
\phi_T(u-i/2)=e^{L_T(u)}.
\tag{2.6}
\]
With \(m=K/F_T,k=\log m,c=C/(DF_T)\), the model European call price is
\[
c=1-\frac{\sqrt m}{\pi}\int_0^\infty
\operatorname{Re}\frac{e^{-iuk}\phi_T(u-i/2)}{u^2+1/4}\,du.
\tag{2.7}
\]
The model specification, decimal inputs, and normalisation jointly define the prices considered below. The deterministic propagation theorem allows the more general coefficient in (2.2); the stochastic valuation and experiments in this paper use the zero-mean-reversion forward variance model (2.5).

### 2.1. The solution to be approximated

The exact object is the solution of the Volterra equation

\[
H(x)=\frac{1}{\Gamma(\alpha)}\int_0^x(x-s)^{\alpha-1}F(H(s))\,ds.
\tag{2.8}
\]

**Proposition 2.1 (the exact Riccati trajectory).** Let \(\alpha\in(1/2,1)\), \(|\rho|\le1\), \(s_0\ge0\), and \(u\in\mathbb R\). Equation (2.8) has a unique global solution. It is absolutely continuous on every finite interval, locally continuously differentiable at positive times, and satisfies \(\operatorname{Re}H(x)<0\) for \(x>0\). If \(s_0>0\),

\[
|H(x)|\le\frac b{s_0}\{1-E_\alpha(-s_0x^\alpha)\}
\le\min\left\{\frac b{s_0},\frac{bx^\alpha}{\Gamma(1+\alpha)}\right\}.
\tag{2.9}
\]

For \(s_0=0\), the last time-dependent bound remains valid.

**Proof.** Local Volterra contraction gives existence and uniqueness. On the boundary of the left half-plane, completing the square in \(\operatorname{Re}F\) gives a strictly negative term. The fractional maximum principle therefore prevents exit. Convexity of a regularized modulus and comparison with the scalar linear equation give (2.9), which excludes finite-time blow-up. The continuation retains the preceding history. Appendix C.1 proves these steps and the absolute-continuity assertion. \(\square\)

This proposition identifies the solution independently of any numerical construction. We use its integral representation and invariant half-plane; no closed-form solution of the general nonlinear fractional equation is assumed. The distinction between existence of the exact solution and construction of an approximation is maintained throughout.

### 2.2. The financial quantity

The state is an intermediate object. The quantity to be bounded is the error after applying the exponent functional (2.6), the Fourier price (2.7), and finally the portfolio vector. A uniform state estimate can discard the time weights in that sequence. The next section keeps those weights by deriving an exact identity for the exponent error before taking absolute values.

## 3. Finite-history propagation: nonexpansion and dissipation

Let \(\widehat Z\) be a zero-initial-value reference trajectory and define its physical residual by \(r=D_C^\alpha\widehat Z-\nu F(\widehat Z)\). Subtraction of the exact and reference equations gives, for \(e=Z-\widehat Z\),

\[
D_C^\alpha e=\nu\left[d+\frac{Z+\widehat Z}{2}\right]e-r,
\qquad e(0)=0.
\tag{3.1}
\]

This identity uses the quadratic structure of the Riccati equation. The unknown exact state remains in the coefficient, but Proposition 2.1 controls the real part that matters for stability. If \(\operatorname{Re}\widehat Z\le\epsilon_R\), the coefficient has real part at most \(-\nu(s_0-\epsilon_R/2)\). Thus a bound on the reference half-plane is sufficient; a fitted approximation to the exact coefficient is unnecessary.

The second identity concerns the pricing functional. For \(\beta>0\), write \(g_\beta(t)=t^{\beta-1}/\Gamma(\beta)\), with all convolutions starting at zero. Define the reference exponent using its fractional derivative, and write \(q_\alpha=(I^{1-\alpha}\xi)'\). Under the regularity assumptions of Theorem 3.1, Fubini's theorem and integration by parts give

\[
L_T-\widehat L_T=\nu^{-1}(q_\alpha*e)(T),
\qquad q_\alpha=\xi(0)g_{1-\alpha}+g_{1-\alpha}*\xi'.
\tag{3.2}
\]

The initial curve value survives the integration by parts. It cannot be removed by differentiating the curve only at positive times. These identities determine the subsequent construction: compare (3.1) with a positive scalar fractional equation, then apply the nonnegative weight in (3.2). Caputo convexity and positive-resolvent comparison are established tools [LiLiu2018; Kopteva2021; SimonCM2015]; Appendix C supplies the regularity and endpoint details needed here.


Define \(k_\lambda(t)=t^{\alpha-1}E_{\alpha,\alpha}(-\lambda t^\alpha)\), with \(k_0=g_\alpha\). All convolutions below start at time zero.

**Theorem 3.1 (finite-history pricing envelope).** Let \(0<\alpha<1\), \(\nu>0\), \(T>0\), and \(Z,\widehat Z\in AC([0,T];\mathbb C)\) have zero initial value. Let

\[
D_C^\alpha Z=\nu F(Z),\quad
r=D_C^\alpha\widehat Z-\nu F(\widehat Z),\quad
|r|\le R\in L^\infty(0,T),\qquad R\ge0,
\tag{3.3}
\]

where \(F(z)=-b+dz+z^2/2\), \(\Re d=-s_0\), \(\Re Z\le0\), \(\Re\widehat Z\le\epsilon_R\), and \(\sigma=s_0-\epsilon_R/2\ge0\). These equations and inequalities hold almost everywhere; the state bounds hold everywhere by continuity. Let \(\xi\in AC[0,T]\), \(\xi(0)=V_0\ge0\), and assume

\[
q_\alpha=(I^{1-\alpha}\xi)'
=V_0g_{1-\alpha}+g_{1-\alpha}*\xi'\ge0\quad\text{a.e.}
\tag{3.4}
\]

Define \(L_T\) and \(\widehat L_T\) from \(\nu^{-1}\int_0^T\xi(T-t)D_C^\alpha Z(t)\,dt\) and the same expression with \(\widehat Z\). With \(\lambda=\nu\sigma\),

\[
|Z-\widehat Z|\le k_\lambda*R,
\qquad
|L_T-\widehat L_T|
\le\nu^{-1}(q_\alpha*k_\lambda*R)(T)
\le\nu^{-1}(\xi*R)(T).
\tag{3.5}
\]

In particular, \(R/\nu\le\delta_F\) implies

\[
|L_T-\widehat L_T|\le\delta_F\int_0^T\xi(s)\,ds.
\tag{3.6}
\]

**Proof route.** Set \(e=Z-\widehat Z\); the physical equation's divided-difference coefficient has real part at most \(-\nu\sigma\). The AC convexity lemma applied to a smooth modulus and the positive zero-initial inverse gives the state bound, including its continuous endpoint. Absolute Fubini and AC integration by parts then express the exponent difference as \(\nu^{-1}(q_\alpha*e)(T)\), retaining the zero state initial values and the curve term \(V_0g_{1-\alpha}\). Positivity of \(q_\alpha\) propagates that state bound, and \(0\le q_\alpha*k_\lambda\le\xi\) gives the curve envelope. The argument keeps the entire fractional history and removes \(\nu^{-1}\) only upon normalizing the physical residual by \(\nu\); Appendix C.1–C.2 gives the full proof.

At \(\sigma=0\), set \(k_0=g_\alpha\); the two exponent envelopes coincide. Positive dissipation permits further reduction. The initial term \(V_0g_{1-\alpha}\) and the factor \(\nu^{-1}\) remain in both bounds. Stochastic admissibility of the experimental curve is verified separately in Appendix A.

For a full-history residual envelope \(R\le R_j\) on each closed cell \([a_j,b_j]\), the computable cell-weight form is

\[
|L_T-\widehat L_T|
\le\nu^{-1}\sum_jR_j\int_{a_j}^{b_j}(q_\alpha*k_\lambda)(T-s)\,ds
\le\nu^{-1}\sum_jR_j\int_{a_j}^{b_j}\xi(T-s)\,ds.
\tag{3.7}
\]

Every weight integrates the history from time zero, and an integration bin takes the maximum over every closed residual cell it intersects, boundary cells included. Section 7 compares curve and dissipative-kernel weights on matched inputs. Appendix C.3–C.4 proves decreasing-curve and constant-curve variants and a complementary global-state bound.


### 3.1. The pricing kernel and its computation

Theorem 3.1 determines the pricing kernel by convolution. Its dependence on the forward curve and dissipation is explicit, and its cumulative weights can be enclosed directly. For \(\sigma\ge0\), set \(\lambda=\nu\sigma\) and

\[
K_\lambda=q_\alpha*k_\lambda,\qquad
\eta_{\rm res}=\nu^{-1}(K_\lambda*R)(T),\qquad
0\le K_\lambda=\xi-\lambda\,\xi*k_\lambda\le\xi.
\tag{3.8}
\]

The assumptions and scaling are those of Theorem 3.1, and the positive fractional inverse follows from [Kopteva2021, SimonCM2015]. We enclose the pricing-kernel weights and use them in the same actual-output certificate.

**Zero-damping special case of Theorem 3.1.** If \(\sigma=0\),

\[
k_0=g_\alpha,\qquad K_0=\xi,\qquad
|L_T-\widehat L_T|\le\nu^{-1}(\xi*R)(T).
\tag{3.9}
\]

The estimate uses \(q_\alpha\ge0\) and preserves the physical scaling at zero damping. Appendix C gives the AC regularity and comparison proofs; Appendix A treats the stochastic-model hypotheses.

For the fixed curve in (2.4), write \(A_0=\alpha_0\) and \(\lambda_\xi\) for its own curve parameter. On the computational domain \(\lambda T^\alpha<1\), define

\[
W_\lambda(t)=\int_0^tK_\lambda(s)\,ds
=\sum_{n=0}^\infty(-\lambda)^n t^{1+n\alpha}
\left[
\frac{\theta}{\Gamma(2+n\alpha)}
+(V_0-\theta)E_{A_0,2+n\alpha}
(-\lambda_\xi t^{A_0})
\right].
\tag{3.10}
\]

A cell \([a_j,b_j]\) has weight \(W_\lambda(T-a_j)-W_\lambda(T-b_j)\); Appendix C gives the absolute series tails and the interval-difference proof. The implementation, with twelve outer terms, sixty-four inner curve terms and 100-bit outward dyadic primitives, is an enclosure of the full Mittag–Leffler kernel functional with explicit truncation and rounding remainders. Ordinary floating-point Mittag–Leffler values do not enter a guarantee.

## 4. From a reference trajectory to transform disks

### 4.1. A reference dictated by the startup expansion

The preceding theorem separates the choice of reference from the validity of its certificate. A useful computational reference should make the fractional derivative and its residual accessible on a whole time interval. It should also retain the startup singularity of the exact solution.

Write \(G=\nu F(Z)\), so that \(Z=I^\alpha G\). For fixed model parameters and Fourier frequency, successive substitution into the Volterra equation gives, as \(t\downarrow0\),

\[
G(t)=G_0+A_1t^\alpha+A_2t^{2\alpha}+O(t^{3\alpha}),
\qquad G_0=-\nu b,
\tag{4.1}
\]

where the coefficients are determined recursively by

\[
\begin{aligned}
B_1&=\frac{G_0}{\Gamma(1+\alpha)},&
A_1&=\nu d B_1,\\
B_2&=\frac{A_1\Gamma(1+\alpha)}{\Gamma(1+2\alpha)},&
A_2&=\nu\left(dB_2+\frac{B_1^2}{2}\right).
\end{aligned}
\tag{4.2}
\]

Indeed \(Z=O(t^\alpha)\) locally by Proposition 2.1. Substitution first gives \(G=G_0+O(t^\alpha)\), then \(Z=B_1t^\alpha+O(t^{2\alpha})\), and successive substitution gives the displayed coefficients. The identity \(I^\alpha t^\beta=\Gamma(1+\beta)t^{\alpha+\beta}/\Gamma(1+\alpha+\beta)\) controls each remainder. This is a local finite-order expansion at a fixed frequency; it is neither a uniform all-frequency statement nor a global error estimate for a truncated series.

We therefore represent \(\bar G\) by these startup powers and a continuous piecewise affine remainder, and set \(\widehat Z=I^\alpha\bar G\). The powers come from the equation; the piecewise affine part permits explicit integration against the fractional kernel. It represents the remaining trajectory rather than an additional fitted price correction. Its nodal values may be generated by a numerical solver, but their accuracy is not an assumption of Theorem 3.1.

In the implementation, all saved nodes and coefficients, including the startup coefficients, are interpreted as exact dyadic numbers. They need not equal their ideal analytical counterparts. The full residual

\[
r_t=\bar G-\nu F(I^\alpha\bar G)
\]

includes these coefficient discrepancies. Appendix D.1 bounds it on the startup interval and every subsequent closed cell, and verifies the reference half-plane. The certificate belongs to this continuous trajectory, rather than merely to the nominal solver's nodal states. Four-subcell and two-subcell banks are distinguished in Section 7.

### 4.2. Completing the transform and price bound

The derivative-based reference exponent is \(\widehat L_T=\nu^{-1}\int_0^T\xi(T-t)\bar G(t)dt\). Once \(\eta_n\) encloses its exponent error, the transform disk follows by the exponential difference and the true half-shift modulus bound. If the substitution-based exponent is \(\widehat L_T^F=\int_0^T\xi(T-t)F(\widehat Z(t))dt\), then \(\widehat L_T-\widehat L_T^F=\nu^{-1}(\xi*r_t)(T)\). Using \(\widehat L_T^F\) therefore requires this additional conversion term to be enclosed.

\[
|\phi_n-\widehat\phi_n|\le \min\{1,|\widehat\phi_n|\}(e^{\eta_n}-1).\tag{4.3}
\]

**Theorem 4.1.** Suppose \(M_T>0,\mathbb E M_T=1\). For any \(0<a_*<1/2,h_*>0\), let
\(g(z)=e^{-ikz}\phi_T(z-i/2)/(z^2+1/4)\). Replacing the integral in (2.7) by the infinite trapezoidal sum incurs a price error of at most
\[
\epsilon_{\rm grid}
=\frac{\sqrt m\,e^{a_*|k|}}
{(1/2-a_*)(e^{2\pi a_*/h_*}-1)}.
\tag{4.4}
\]

Appendix D.2 contains the strip proof and the exact-solution high-frequency comparison. A finite omitted reference value is charged explicitly, independently of the true infinite tail.

Suppose the node values \(\widehat\phi_n\) have exact-error bounds \(\varepsilon_n\). The finite price sum
\[
\widehat c_{N_u}=1-\frac{h_*\sqrt m}{\pi}
\left(2\operatorname{Re}\widehat\phi_0+
\sum_{n=1}^{N_u}\frac{\operatorname{Re}(e^{-inh_*k}\widehat\phi_n)}
{(nh_*)^2+1/4}\right)
\tag{4.5}
\]
satisfies
\[
|c-\widehat c_{N_u}|\le\epsilon_{\rm grid}+\epsilon_{\rm tail}
 +\frac{h_*\sqrt m}{\pi}
\left(2\varepsilon_0+
\sum_{n=1}^{N_u}\frac{\varepsilon_n}{(nh_*)^2+1/4}\right)
 +\epsilon_{\rm arithmetic}.
\tag{4.6}
\]

In these equations \(N_u\) is the Fourier sum cutoff, whereas \(N_t\) denotes time-grid cells. The origin coefficient is the trapezoidal half-weight multiplied by \(1/(1/4)\). The exact arithmetic remainder encloses the phase, square root, exponential and summation operations.

## 5. Portfolio errors from a common transform

### 5.1. The joint error set and the loss from separate bounds

The transform disks now have a mathematical justification. The remaining question is how to use them for several contracts. Fix one model parameter, maturity, contour, and reference grid. Let \(c^*\in\mathbb R^p\) be the continuous-model price vector, \(\bar c\) the exact finite reference sum, and \(c^{\rm fast}\) the frozen rational output. For each included frequency let \(\bar\phi_n\) be the reference transform and put \(z_n=\phi(u_n-i/2)-\bar\phi_n\). Appendix D.1 supplies bounds \(|z_n|\le\epsilon_n\); at a deliberately omitted finite node \(\bar\phi_n=0\), the true-transform envelope supplies the radius. The same \(z_n\) enters every strike at this parameter and maturity.

For the Lewis rule in Section 4, set \(m_i=K_i/F\), \(k_i=\log m_i\), and
\[
a_{in}=-\frac{h\sqrt{m_i}}{\pi}\frac{e^{-iu_nk_i}}{u_n^2+1/4}\quad(n>0),\qquad
a_{i0}=-\frac{2h\sqrt{m_i}}{\pi}.
\tag{5.1}
\]
The half weight at zero is already included in \(a_{i0}\). The complete error is
\[
c^*-\bar c=\Re\sum_{n=0}^{N}a_{\cdot n}z_n+R,
\qquad R\in\mathcal R,
\tag{5.2}
\]
where \(\mathcal R\) includes the true infinite-grid tail and analytic-strip discretisation error. When a numerical representative of \(\bar c\) is used, a finite reference sum enclosed by interval arithmetic contributes its centre uncertainty. Omitted finite nodes remain in (5.2), so we do not also charge them as an infinite tail. This representation uses no stochastic covariance.

**Theorem 5.1 (complete shared-node inclusion).** Suppose (5.2) holds, all radii are nonnegative, and \(\mathcal R\) is a nonempty compact convex outer set. Define
\[
\mathcal E_F=\left\{\Re\sum_na_{\cdot n}z_n:|z_n|\le\epsilon_n\right\}+\mathcal R,
\qquad d=\bar c-c^{\rm fast}.
\tag{5.3}
\]
Then \(c^*-c^{\rm fast}\in d+\mathcal E_F\), and, for real \(w\),
\[
h_{d+\mathcal E_F}(w)=w^\top d+
\sum_n\epsilon_n\left|\sum_iw_i a_{in}\right|+h_{\mathcal R}(w).
\tag{5.4}
\]
If the centre shift is supplied as a box \(d\in[d^-,d^+]\), replace the first term by the support of that box. All numerical evaluations of (5.4) must be outward enclosures.

**Proof.** Substituting the actual transform errors in (5.2) gives inclusion. The product of complex disks is compact and convex and its real-linear image has those properties. A disk \(|z|\le\epsilon\) has real-linear support \(\epsilon|b|\) for the functional \(\Re(bz)\): Cauchy–Schwarz gives the upper bound, attained at \(z=\epsilon\overline b/|b|\) when \(b\ne0\); when \(b=0\), every feasible point attains it. Independent disks and Minkowski addition give (5.4). Translation gives the signed centre term. A box enclosing \(d\) provides a further valid Minkowski outer enclosure even if its coordinates are dependent. \(\square\)

If \(\mathcal R=\prod_i[-\rho_i,\rho_i]\), the smallest coordinate box of this same set has support
\[
h_{\operatorname{rect}(\mathcal E_F)}(w)=
\sum_i|w_i|\left(\sum_n\epsilon_n|a_{in}|+\rho_i\right).
\tag{5.5}
\]
Consequently its excess over (5.4), before translation, is
\[
G_F(w)=\sum_n\epsilon_n\left(
\sum_i|w_i a_{in}|-\left|\sum_iw_i a_{in}\right|\right)\ge0.
\tag{5.6}
\]
The equality case of the complex triangle inequality, applied node by node, shows that this excess is strictly positive exactly when one positive-radius node has nonzero coefficients \(w_i a_{in}\) that do not all lie on a common nonnegative complex ray. Translation does not change widths. The criterion compares the constructed set with its own coordinate box, so the strict improvement it detects is relative to that box, not to every independently available signed price enclosure.

Any separately established signed model-price box \(\mathcal I\) can be intersected with \(\bar c+\mathcal E_F\), and the actual model vector belongs to the intersection. We need not solve the intersection support problem to use it, because the minimum of the two valid directional upper bounds remains valid, and likewise the maximum of the lower bounds. A computation can thus retain the best signed marginal information while using node cancellation where it improves the complete bound. Nonemptiness of the mathematical intersection comes from inclusion, rather than from empirical agreement between numerical approximations.

**Proposition 5.2 (nonzero omitted-node reference at an unchanged fast output).** Fix the actual fast output, including its zero contribution at omitted finite nodes. For the same finite pricing map, select a possibly nonzero reference \(\psi_n\) at those nodes, and prove \(|\phi_n-\psi_n|\le\rho_n\). Let \(\bar c'=c_0+\Re(A\psi)\), \(d'=\bar c'-c^{\rm fast}\), and let \(\mathcal R\) include the complete strip, true infinite tail, and newly enclosed reference arithmetic. Then

\[
c^*-c^{\rm fast}\in d'
+\{\Re(Az):|z_n|\le\rho_n\}\oplus\mathcal R.
\tag{5.7}
\]

For a symmetric remainder and direction \(w\), the complete absolute budget uses

\[
DF\left(|w^\top d'|+
\sum_n\rho_n\left|\sum_iw_ia_{in}\right|
+h_{\mathcal R}(w)\right)\le\tau.
\tag{5.8}
\]

For a nonsymmetric remainder, both support directions must be bounded. A changed reference centre does not change the fixed fast output, but it does change \(d'\) and requires new centre arithmetic.

**Proof.** Subtract and add the new finite reference in the exact finite pricing map; its transform error is \(z=\phi-\psi\). The complete remainder contains the other discrepancies. Directional support of the shared complex disks gives (5.8). ∎

Radii attached to different centres cannot be minimized directly. Take an old zero-centred certificate \(|\phi_n|\le\varepsilon_n^0\) and a new certificate centred at \(\psi_n\). At the new centre the old certificate only gives \(|\phi_n-\psi_n|\le\varepsilon_n^0+|\psi_n|\), so a safe radius is \(\min\{\rho_n,\varepsilon_n^0+|\psi_n|\}\), or one can retain the two transform disks' intersection. A new disk is nested in the old disk only if \(|\psi_n|+\rho_n\le\varepsilon_n^0\). Otherwise, independently valid complete price intervals may still be intersected, but same-centre monotonicity is not automatic. For example, \(\phi=0\) lies in \(D(0,.1)\) and \(D(1,2)\), but not in \(D(1,\min(.1,2))\). Marginal and joint comparisons have to use the same updated centre, node radii and complete remainder, and any additional reference evaluation and certification is part of the reported cost.

### 5.2. Directional and finite-objective certificates

For \(w=e_i-e_j\), the node coefficient is
\[
|a_{in}-a_{jn}|=\frac{h}{\pi(u_n^2+1/4)}
\left|\sqrt{m_i}e^{-iu_nk_i}-\sqrt{m_j}e^{-iu_nk_j}\right|\quad(n>0).
\tag{5.9}
\]
Cancellation survives because we combine the coefficients before taking their modulus. With \(b_i=\sqrt{m_i}\), an analytic bound is
\[
|b_ie^{-iuk_i}-b_je^{-iuk_j}|
\le |b_i-b_j|+\min(b_i,b_j)\min\{2,|u|\,|k_i-k_j|\}.
\tag{5.10}
\]
To prove it, separate the difference in amplitudes from the phase difference using the smaller amplitude, then apply \(|e^{ix}-e^{iy}|\le\min(2,|x-y|)\). At zero, the spread coefficient is \(2h|b_i-b_j|/\pi\), so low-frequency error cancels for nearby strikes even when the individual node radii are large. High-frequency and tail contributions are still retained.

A simple limiting case explains the mechanism without a numerical fit. Fix the model, maturity, node radius and frequency, and let two positive normalized strikes coalesce. With \(\Delta k=\log(m_j/m_i)\), the pricing coefficients satisfy

\[
a_{jn}=a_{in}e^{(1/2-iu_n)\Delta k},\qquad
|a_{in}-a_{jn}|=|a_{in}|\left|1-e^{(1/2-iu_n)\Delta k}\right|.
\tag{5.11}
\]

The identity also holds at the half-weighted zero node. Thus the shared spread contribution \(\epsilon_n|a_{in}-a_{jn}|\) tends to zero, whereas the separate contribution \(\epsilon_n(|a_{in}|+|a_{jn}|)\) tends to \(2\epsilon_n|a_{in}|\). For a positive radius this latter limit is strictly positive. At coincident strikes the two payoff functions agree, so the cancellation is already present in the contract. The joint representation preserves it. This statement concerns each fixed finite node; the complete output bound still includes its centre displacement and remainder.

The implementation below uses rational outward bounds for logarithms, trigonometric functions, square roots and the circle constant, and it encloses the exact coefficient difference before multiplying by the saved radius. The signed centre comes from reference-sum and frozen-output intervals. Interval midpoints taken for display never stand in for the outward endpoint arithmetic used in a decision.

If the target quote \(m^*\) is enclosed around a stored centre \(\bar m\) with \(m^*-\bar m\in\mathcal M\), use \(r=c^{\rm fast}-\bar m\) and replace the output-error set by \(\mathcal E-\mathcal M\), which brings in quote-conversion arithmetic with the correct sign. Otherwise the following formulas take \(m\) to be exact.

Let \(J(e)=(r+e)^\top W(r+e)/(2p)\), where \(r=c^{\rm fast}-m\), \(W\succeq0\), and the complete output error belongs to a compact convex set \(\mathcal E\). For any trial vector \(e_0\), put \(g_0=W(r+e_0)/p\). Convexity gives the certified lower bound
\[
\inf_{e\in\mathcal E}J(e)\ge
J(e_0)-g_0^\top e_0-h_{\mathcal E}(-g_0).
\tag{5.12}
\]
This follows by taking the infimum of the supporting affine function \(J(e_0)+g_0^\top(e-e_0)\). Feasibility of \(e_0\) is unnecessary for validity; it affects sharpness. A numerical primal minimizer becomes a lower-bound certificate only after its support or dual obligation has also been bounded correctly.

If \(M^2\ge\sup_{e\in\mathcal E}e^\top We\), expansion yields
\[
\sup_{e\in\mathcal E}J(e)\le
J(0)+\frac{h_{\mathcal E}(Wr)}p+\frac{M^2}{2p}.
\tag{5.13}
\]
A safe choice is any valid coordinate box \(|e_i|\le b_i\): with \(W\) represented exactly, \(M^2=\sum_{ij}|W_{ij}|b_i b_j\) is sufficient. Tighter validated norm bounds may replace it. Maximization of this convex quadratic is not certified by a local stationary point. A supporting function, norm bound, interval subdivision, or valid relaxation must establish the upper direction.

For a finite candidate collection, form valid objective intervals by intersecting (5.12)–(5.13), when used, with the original interval-square bounds in Theorem 5.3. A unique candidate is certified only if its upper endpoint is smaller than every competing lower endpoint. If this condition is absent, return the nonempty set of candidates whose lower endpoint is at most the least upper endpoint. It contains every exact minimizer. Different candidates have different transform errors; (5.4) does not identify their error variables.

We join the model-specific continuous residual certificate to the actual multi-strike pricing output through the established support formula, equality case of the triangle inequality and convexity bounds, preserving every required budget and its centre. The numerical comparison in Section 7 is our evidence for the resulting financial improvement.

For Theorem 5.3 we specialize the preceding general objective to \(p=12,W=I_{12}\) and sum exactly twelve normalized call prices, so \(J=\frac1{24}\sum_{i=1}^{12}(c_i-M_i)^2\). Quote-conversion half-widths concern the input midpoint arithmetic and are distinct from the resulting objective half-width.

**Theorem 5.3 (finite-objective intervals and selection stability).** For each \(\alpha_j\in\Theta_{\rm finite}\), suppose all model prices have certified enclosures
\[
c_i(\alpha_j)\in[p^-_{ij},p^+_{ij}],\quad
B_i\in[b_i^-,b_i^+],\quad
A_i\in[a_i^-,a_i^+],\quad
M_i\in[m_i^-,m_i^+].
\tag{5.14}
\]
Assume \(b_i^-\le b_i^+\le a_i^-\le a_i^+\). Define
\[
\ell(x,y)=
\begin{cases}0,&x\le0\le y,\\
\min(x^2,y^2),&\text{otherwise},\end{cases}
\quad v(x,y)=\max(x^2,y^2).
\]
\[
L_j=\frac1{24}\sum_i
\ell(p^-_{ij}-m_i^+,p^+_{ij}-m_i^-),\qquad
U_j=\frac1{24}\sum_i
v(p^-_{ij}-m_i^+,p^+_{ij}-m_i^-).
\tag{5.15}
\]
Then \(J(\alpha_j)\in[L_j,U_j]\). Writing \(L_*=\min_jL_j,U_*=\min_jU_j\), the exact finite-set optimum satisfies
\[
J_*=\min_{\Theta_{\rm finite}}J\in[L_*,U_*].
\tag{5.16}
\]
For \(\varepsilon\ge0\), every exact \(\varepsilon\)-near-optimal candidate belongs to
\[
\{\alpha_j:L_j\le U_*+\varepsilon\};
\tag{5.17}
\]
The condition \(U_j-L_*\le\varepsilon\) is sufficient for that candidate to be near-optimal for the exact objective. If
\[
g:=\min_{j\ne j_0}L_j-U_{j_0}>0,
\tag{5.18}
\]
then \(\alpha_{j_0}\) is the unique minimiser of the model objective on the finite set. If
\[
\min_{\alpha_j\ge.6}L_j>U_*+\varepsilon,
\tag{5.19}
\]
then every exact near-optimal candidate in the finite set satisfies \(\alpha_j<.6\).

Quote consistency is checked separately. If any row satisfies \(p^+_{ij}<b_i^-\) or \(p^-_{ij}>a_i^+\), the candidate cannot lie in all quote bands simultaneously. Conversely, if every row satisfies \(p^-_{ij}\ge b_i^+\) and \(p^+_{ij}\le a_i^-\), then quote consistency is certified. Overlapping intervals without this inner-band condition retain possible consistency; overlap alone does not certify it.

Appendix D.4 contains the interval-square and finite-selection proof. Theorem 5.3 certifies objective intervals and selection statements on the finite set from each candidate's own enclosures; a continuous parameter optimum, market identification and dependence across candidate errors lie outside it.

## 6. A rational output with a separate structural guarantee

The certificate above can be applied to any stored price output once its displacement from the reference is enclosed. To make the distinction concrete, we use the Gatheral–Radoicic third-order rational construction. Matching both endpoints reflects two analytical constraints: the fractional startup expansion and the large-time Riccati behaviour. The approximation is thus selected by known features of the equation, while its pricing accuracy is assessed separately.

The construction matches three startup and three large-time coefficients. Write \(\widehat H(y)=P(y)/Q(y)\), \(Q=1+q_1y+q_2y^2+q_3y^3\), with \(y=\nu t^\alpha\). Appendix B.1 defines the raw matching matrix, determinant and numerator polynomials, proves their exact identities and gives the full sign proof. No numerical division precedes the determinant lower bound.

**Theorem 6.1 (full-frequency structure).** For
\[
\alpha\in[13/25,3/5],\quad \rho=-1489/2000,\quad \kappa=0,\quad
u\in\mathbb R,\quad \nu>0,
\tag{6.1}
\]
the established matching system (B.4) is nonsingular. Its normalised denominator satisfies
\[
\operatorname{Re}q_j>0\ (j=1,2,3),\qquad
\operatorname{Re}Q(y)\ge1,\quad |Q(y)|\ge1\quad(y\ge0).
\tag{6.2}
\]
Moreover, for \(y>0\), \(\operatorname{Re}\widehat H(y)<0\). The result holds at every positive time and every finite real frequency. Its domain is the stated parameter set; \(\alpha>.6\), a continuous \(\rho\) domain, and nonzero \(\kappa\) are outside the scope of this theorem.

**Theorem 6.2 (certified correlation persistence).** The conclusions of Theorem 6.1 hold for

\[
\alpha\in[13/25,3/5],\qquad
\rho\in[-744501/10^6,-744499/10^6],\qquad
\kappa=0,
\tag{6.3}
\]

at every real Fourier frequency and every positive time.

The correlation width quantifies local persistence around the public-data parameter. Appendix B.2 gives the complete closed cover and the derivative/direct fallback, with derivative bounds for the compactified quantities. For prices we use the independent reference residual in Section 4.

**Table 1. Dependencies of the rational-output and independent-reference proof chains.**

| Proof chain | Inputs and conclusion | Role in the price certificate |
|---|---|---|
| Rational construction | Endpoint matching, raw determinant and numerator signs; well-defined Padé output and left-half-plane structure | Defines and checks the specified production formula on its stated domain |
| Independent reference | Fixed field, full continuous residual, dissipation, finite-history exponent and complete Fourier error | Certifies the reference transform and model-price inclusion |
| Output translation | Stored fast values and independently enclosed reference centre | Converts the reference inclusion into error of the actual output |

## 7. Matched decisions and scientific controls

The experiments address three distinct questions: whether preserving shared errors changes a portfolio tolerance decision; how much the complete bound changes under a different history weight or reference; and whether the resulting model prices agree with the quote bands. A comparison isolates one mechanism only when its remaining inputs are held fixed.

All experiments use model parameter $\nu=0.2897$, $\rho=-0.7445$, Riccati mean reversion zero, Fourier step $1/8$, a finite reference/error grid through 128 (1025 nodes), 100-bit outward dyadic arithmetic and 64 forward-moment series terms. The stored Padé output uses composite Gauss–Legendre order 8 through 200 (352 nodes) and Jacobi order 256; its Fourier cutoff is distinct from the certificate cutoff. $N_t$ counts source time cells. The number of frequency nodes is written explicitly to avoid confusing it with $\nu$.

**Table 2. Fixed configurations: maturity in years; time cells, reference nodes, residual subcells and history bins are counts.**

| ID | T | alpha | N_t source cells | nonzero ref nodes | zero finite nodes | subcells | history bins |
| --- | --- | --- | --- | --- | --- | --- | --- |
| H0 | 1/2 | 13/25, 3/5, 9/10 | 2048 / 2048 / 1024 | 513 | 512 | 4 | 0 |
| H1 | 1/2 | 13/25, 3/5, 9/10 | 2048 / 2048 / 1024 | 513 | 512 | 4 | 1 |
| H2 | 1/2 | 13/25 | 2048 | 513 | 512 | 4 | 128 |
| H3 | 1/2 | 13/25 | 2048 | 1025 | 0 | 4 | low128; high1 |
| H4 | 1/2 | 13/25 | 2048 | 1025 | 0 | 4 | 128 |
| Q0 | 1/4 | 13/25, 3/5, 9/10 | 1429 / 1352 / 549 | 513 | 512 | 4 | 1 |
| Q1 | 1/4 | 13/25 | 1429 | 1025 | 0 | 4 | 1 |
| Q2 | 1/4 | 13/25 | 1429 | 1025 | 0 | 4 | 128 |
| N1 | 1/2 | 13/25, 21/40, 53/100, 27/50, 11/20 | 1024 | 513 | 512 | 2 | 1 |
| N2 | 1/2 | 13/25, 21/40, 53/100, 27/50, 11/20 | 2048 | 513 | 512 | 2 | 1 |
| N2L | 1/2 | 13/25 | 2048 | 513 | 512 | 2 | 128 |

H0 uses uniform-state propagation; H1 uses finite-horizon global propagation on the same field. H2 uses the low-frequency 128-bin bank. H3/H4 extend the reference through 128, retaining that low bank and using global/128-bin propagation for the high bank. Q0/Q1/Q2 retain the full history from zero and use exact quarter-terminal interpolation of the half-year field: Q0 has 1430/1353/550 time knots, and Q1/Q2 have 1430 knots. They reuse the larger-horizon continuous banks and recompute quarter moments, output and tails. The alpha=.9 source field has 1025 time knots and 641 stored frequencies through 80; 513 of these are nonzero reference nodes in H0/H1/Q0. The .52/.60 fields have 2049 knots and 1025 stored frequencies through 128.

N1/N2 generate each five-point field and continuous residual bank, using two nonstartup subcells (2047/4095 closed cells). N2L is a separate descriptive 128-bin reuse of N2 at alpha=.52. The nearby-grid objective experiment uses N1/N2. The H low and high banks each have 8189 closed cells (four nonstartup subcells), for 513 and 512 frequencies respectively. Thus the 0.115215934-point H4 certificate and 0.394999331-point N2L certificate use different reference centres, node coverage and residual banks; their difference includes more than 128-bin propagation. BL-core512/1024 are nominal history-stepping controls whose complete guarantees use the identified N1/N2/N2L reference bank.

The H and N field generators use a uniform auxiliary grid \(y_j\) from zero to \(\nu T^\alpha\), followed by \(x_j=y_j^{1/\alpha}\) and \(t_j=x_j/\nu^{1/\alpha}\). In exact arithmetic this is the graded rule \(t_j=T(j/N_t)^{1/\alpha}\). Generation uses binary64 arithmetic and forces the endpoints to zero and one half; certification uses the saved nodes as exact dyadics, rather than identifying them with the analytical rule. For quarter-year restriction it keeps every original knot strictly below \(T_q=1/4\), appends the exact endpoint, and encloses the linear interpolation of the original bracketing field coefficients in rational interval arithmetic. All preceding history is retained.


### 7.1. Fixed contracts, units and complete ablation

The six-month contract uses twelve strikes \(K_i=3700+100i\), \(0\le i\le11\), forward \(F=4221.86\), discount \(D=1\), and the fixed forward-variance curve (2.4). Prices and task errors are in index points, with position multiplier one and no exchange-specific currency notional assigned. For scale, the bid/ask widths of the twelve half-year quotes run from about 0.80 to 2.51 index points and are about 1.30 and 1.21 points at the 4400 and 4500 strikes, so a quarter-point budget is roughly a fifth of the quoted width at the strikes of the spread studied below. Moving between candidates changes \(\alpha\) while the curve and other parameters remain fixed. The three-candidate profile \(.52,.60,.90\) compares this finite set, and each candidate is incompatible with several market bid/ask bands.

Table 3 compares the complete \(K=4400\) minus \(K=4500\) task bound. Rows H0–H4 and Q0–Q2 are the configurations of Table 2. Each row retains its stored output, signed centre, included finite frequencies, strip, true tail and arithmetic. Displayed upper bounds are rounded upward. The quarter-year study reuses no six-month exponent or tail value. It recomputes its maturity-specific reference integral, true-transform envelopes and tails, and its upstream full-history certificate restricts validly to the shorter horizon.

**Table 3. H0–H4 and Q0–Q2 complete unit-spread certificates, in index points; outputs and reference changes are identified by configuration.**

| Maturity and stage | Complete joint bound, points | Matched signed marginal bound, points | Interpretation |
|---|---:|---:|---|
| H0: Six months: global state propagation | 1.397612096 | — | One-point budget not met |
| H1: Six months: finite history, same global residual | 0.378598956 | — | Principal propagation improvement; unchanged output and centre |
| H2: Six months: local envelope, same reference nodes | 0.367258782 | — | About 3% further bound reduction |
| H3: Six months: all finite high nodes, global envelope | 0.132245064 | 0.158585551 | High-frequency certification and centre change are included |
| H4: Six months: all finite high nodes, local envelope | 0.115215934 | 0.137896018 | Both methods certify 0.25 points |
| Q0: Three months: through 64, global envelope | 1.207557898 | 1.545191542 | 0.25-point budget not met |
| Q1: Three months: through 128, global envelope | 0.351318692 | 0.408293698 | 0.25-point budget not met |
| Q2: Three months: through 128, local envelope | 0.233318843 | 0.252393939 | Only the joint method certifies 0.25 points |

Finite-history propagation reduces the H0 complete bound by about 72.91%, and this figure measures a guaranteed upper bound. The six-month high-frequency refinement also changes the centre from approximately \(-0.166762218\) to \(-0.081698202\) points, so its reduction combines centre and uncertainty changes. In Q2, by contrast, the output, centre, node radii and remainders are all matched, and retaining the shared errors changes the decision. We specified the time-local quarter-year refinement after the global-envelope bound exceeded the budget, so Q2 is a post hoc transfer experiment and the prespecified tests are those of Sections 7.2 and 7.3.

### 7.2. Twenty-eight portfolio directions

Let \(e_i\) select strike \(K_i\). We keep the exact holdings below, without rescaling them to make a budget pass, so every threshold is an absolute error in index points for the specified holding vector. Gross weight means \(\sum_i|w_i|\).

**Table 4. The 28 fixed portfolio directions on the twelve strikes; gross weight is the sum of absolute position weights.**

| Family | Exact direction | Count | Gross weight |
|---|---|---:|---:|
| Adjacent spreads | \(e_i-e_{i+1},\ 0\le i\le10\) | 11 | 2 |
| Adjacent butterflies | \(e_i-2e_{i+1}+e_{i+2},\ 0\le i\le9\) | 10 | 4 |
| Wide spreads | \(e_0-e_3,e_3-e_6,e_6-e_9,e_0-e_{11}\) | 4 | 2 |
| Positive baskets | \(\frac1{12}\sum_{i=0}^{11}e_i,\ \frac16\sum_{i=0}^5e_i,\ \frac16\sum_{i=6}^{11}e_i\) | 3 | 1 |

The pass counts use configuration H1 at each stated alpha, and all methods in each matched comparison use identical upstream radii. At a 0.5-point budget and \(\alpha=.52\), finite-history joint bounds certify 28/28 portfolios, compared with 13/28 for signed marginal bounds. At a 0.25-point budget the counts are 10/28 against 1/28 for \(\alpha=.60\), and 20/28 against 13/28 for \(\alpha=.90\). The one-point budget for \(.52\) does not distinguish the shared structure, because both finite-history methods certify 28/28 there. A valid payoff intersection gives no further tightening in this setting. Failure to certify leaves the budget unresolved.

### 7.3. Prespecified nearby candidates under fixed quotes

The twelve half-year quotes, forward F=4221.86, discount D=1 and all other model parameters are fixed. Before computing these results we fixed alpha={0.520,0.525,0.530,0.540,0.550}, a first layer N_t=1024 (N1), and an upgrade of all five candidates to N_t=2048 (N2) if any adjacent joint comparison remained unresolved. Every point has a newly generated continuous reference field and a complete closed-time residual bank, and the budget includes Fourier nodes through 64, all omitted finite nodes through 128, true infinite tails, strip remainder, reference arithmetic and the quote-conversion intervals.

The objective is the normalized midpoint loss \(J=\frac1{24}\sum_i(c_i-m_i)^2\), using normalized calls; index-point squared units would require multiplication by \(F^2\). The tiny target interval halfwidth here consists of outward arithmetic error in converting the fixed bid/ask-price midpoint, and it is distinct from the market bid/ask halfwidth. The ranking is certified for that fixed midpoint target and establishes no uniform winner for arbitrary quote targets inside those market bands. A Taylor support enclosure preserves common Fourier disks in its linear term and charges the full coordinate-radius quadratic remainder, and its same-radius marginal comparison uses the identical upstream certificate. The comparison across alpha candidates uses each candidate's own enclosure, so it requires no assumption about correlation between their errors.

**Table 5. N1 and N2 five-candidate objective enclosures under the fixed quotes; displayed values are normalized J multiplied by 10^8.**

| alpha | N_t=1024 joint J ×10^8 | N_t=2048 joint J ×10^8 |
|---:|---:|---:|
| 0.520 | [4.825094, 6.778350] | [5.293449, 6.024095] |
| 0.525 | [5.645378, 7.501414] | [6.097920, 6.798485] |
| 0.530 | [6.748974, 8.517584] | [7.187004, 7.859529] |
| 0.540 | [9.807435, 11.422182] | [10.218707, 10.839486] |
| 0.550 | [14.000658, 15.482012] | [14.387007, 14.960680] |

**Table 6. N1 and N2 strict separations among the ten pairs of five fixed candidates, using matched joint and marginal inputs.**

| Generated layer | Joint strictly separated pairs | Matched marginal pairs |
|---|---:|---:|
| N_t=1024 | 7/10 | 3/10 |
| N_t=2048 | 10/10 | 7/10 |

The first layer retained its unresolved close pairs, which triggered the prespecified all-candidate upgrade. On the final grid we certify alpha=0.520 as the strict minimizer of the midpoint objective among the five fixed points. The comparison is over a finite set under the midpoint loss: all five candidates, alpha=0.520 included, lie outside at least one bid/ask row, so the result ranks these candidates and selects no market-calibrated model or continuous calibration optimum.

The two layers generate every closed-cell residual entry: 15,754,230 entries, 5,130 reference exponents and 10,250 true-transform envelopes in total. Separate readers check complete coverage and maxima, reconstruct the exponents, coefficients and objectives, and reject deliberate corruptions. They share the rigorous arithmetic primitives and the generator's residual-derivative bounds.

### 7.4. Certifying stored and replaceable outputs

A stored-output certificate applies to pricing-library audits, historical calculations and production outputs fixed by the task. If replacement is allowed and the reference is available, returning its certified centre gives a direct control; correcting the fast output by that centre also requires the rounding of the stored correction and final addition. The experiments compare these choices, and any assessment of an online workload has to include the reference construction and verification.

A separately fixed control, N2L, reuses the complete \(N_t=2048,\alpha=.52\) residual bank with 128 history bins and leaves the prespecified nearby-grid experiment unchanged. Every intersected closed source cell contributes to each bin maximum, and all weights are outwardly enclosed. All five methods below use the same model, six-month \(4400-4500\) spread, 0.25-point tolerance, reference centre, node radii, strip and true-tail budget.

**Table 7. N2L stored-output controls for the half-year unit 4400–4500 spread; complete bounds and the budget are in index points.**

| Output | Complete joint, points | Matched marginal, points | Joint 0.25-point decision |
|---|---:|---:|---|
| Stored Padé output | 0.394999331 | 0.514096070 | Unresolved |
| Direct reference (binary64) | 0.228237113 | 0.347333852 | Pass |
| Fast + stored correction | 0.228237113 | 0.347333852 | Pass |
| BL core, 512 steps | 0.229082759 | 0.348179497 | Pass |
| BL core, 1024 steps | 0.228534686 | 0.347631424 | Pass |

All five matched marginal bounds remain above 0.25 points, so the joint structure still changes the decision for the reference and BL outputs. Direct reference and corrected fast values have the same complete bound here, and their stored values are checked separately. Exact dyadic arithmetic charges the reference return, stored correction and final addition. The BL 512-to-1024 difference is a diagnostic, not its certified error.

Certificate generation encloses 2,100,735 continuous frequency-by-cell residual entries, 513 reference exponents and 1,025 true-transform node bounds, together with the infinite tail and 12,300 price coefficients. Reading checks every entry and reconstructs the exponents, coefficients and decisions. The 28 portfolios reuse the same bank at one parameter and maturity, and an additional portfolio needs 1,025 shared-disk support terms and the complete remainder.

**Table 8. Typed deterministic work for the additional output constructions; these counts do not measure total computational cost.**

| Additional output construction | Deterministic mathematical work |
|---|---|
| Stored Padé output | 352 Fourier values; 256 Jacobi samples per frequency |
| Direct returned reference | Return the already generated, fully charged centre with binary64 rounding |
| Corrected fast output | Store one correction and perform one binary64 addition per price |
| BL core, 512 steps | 67,371,264 history scalar-vector products; 2,626,560 transformed Riccati evaluations |
| BL core, 1024 steps | 269,222,400 history scalar-vector products; 5,253,120 transformed Riccati evaluations |

These counts measure different operations. We record reference generation, outward transcendental evaluations and verification separately from nominal-output construction, and the complete ledger also includes exponent quadrature and the two coarse-envelope stages.

### 7.5. Matched dissipative-kernel evaluation

We fixed the six-month configuration at \(\alpha=13/25\), \(\nu=2897/10000\), \(\rho=-1489/2000\), and \(\sigma=1489/4000\) before computing the resolvent weights, so the physical damping is \(\lambda=\nu\sigma=4313633/40000000\). All four comparisons reuse the same N2L (N_t=2048) closed-cell residual bank, the same stored binary64 fast prices, the same reference exponents and signed centres, and the same finite omission, analytic strip, true infinite tail and reference arithmetic terms. The financial direction is the unit 4400–4500 call spread. The full finite grid contains 1025 frequencies, including 513 used reference frequencies and 512 retained finite omitted frequencies. We reconstruct the complete twelve-price certificate for every method.

For N2L, the dimensionless damping is \(\lambda T^\alpha\approx0.075205\) (about 0.075205153821), so dissipation is weak over this horizon, consistent with the kernel gain of about 0.485% of the complete frozen-fast bound reported below. The complete budget also contains the fixed centre, finite omitted nodes and other remainders.

Table 9 reports upper endpoints in index points, rounded upward to nine decimals. "Global state" first bounds the state by its global residual and then applies the exponent functional; "global curve" propagates that same residual maximum directly through the curve. The final two rows use the identical 128 binwise envelopes and differ only in the pricing kernel.

**Table 9. N2L matched propagation for the half-year unit 4400–4500 spread, in index points; the residual bank and all other inputs are fixed.**

| Propagation | Frozen fast marginal | Frozen fast joint | Stored reference joint | Used-node joint radius |
| --- | ---: | ---: | ---: | ---: |
| Global state | 3.690877564 | 1.829428107 | 1.662665889 | 1.476801373 |
| Global curve | 0.589267065 | 0.428570987 | 0.261808769 | 0.075944253 |
| Local curve | 0.514096070 | 0.394999331 | 0.228237113 | 0.042372598 |
| Local dissipative resolvent | 0.509733613 | 0.393082828 | 0.226320610 | 0.040456094 |

In this configuration the binary64 corrected-fast output has the same certified bounds as the stored reference, conversion and rounding included. The exact rational reduction from local curve to local resolvent is positive and approximately 0.001916504 points, about 0.485% of the complete frozen-fast bound and 4.523% of its used-node joint radius; these percentages compare upper bounds. The one-point and half-point frozen-output tasks pass, and the quarter-point task remains unresolved. Both local methods certify the stored reference and corrected output at a quarter point, so dissipation does not change that decision.

The fixed terms limit further reduction. Even if all 513 used reference-node contributions vanished, the same symmetric budget would retain the absolute centre, the finite omitted-node radius and the other remainders, and their exact rational sum is strictly greater than the downward decimal endpoint 0.352626733 points. This lower limit belongs to the stated budget formula. With those terms fixed, refining used nodes alone cannot certify a quarter point, so the omitted finite frequencies and the reference centre have to be addressed as well.

The reconstructed global-curve and local-curve endpoints agree exactly with the saved baseline rational endpoints, including all twelve individual radii and frozen-output bounds; the table displays strict nine-decimal upward endpoints.

### Verification scope and mathematical work

The separate reader reads all 2,100,735 entries of the complete residual bank, checks closed-cell coverage from zero, and recomputes the maxima for all 128 propagation bins. It expands the cumulative resolvent independently by the direct double Gamma series with fourteen outer terms, whereas the producer uses twelve outer terms and a strict power-field moment; both enclose all inner tails with sixty-four retained terms. The reader then checks all 513 transform-radius minima in all four comparisons and rebuilds all twelve prices with all 1025 finite frequencies. At \(\sigma=0\), it replays all 129 cumulative endpoints and all 128 cell weights against the curve-kernel conclusion. It rejects eight negative controls: negative damping, an incorrect physical \(\nu\) scale, a missing initial closed cell, a removed finite omitted node, an erased true infinite tail, an altered signed centre, an understated resolvent exponent enclosure, and a zero-damping weight that does not reproduce the curve kernel.

The reader reconstructs the cumulative-weight algebra and certificate assembly, but it shares the dyadic arithmetic, Gamma, logarithm and exponential primitives, together with the validated residual-derivative bounds and reference exponents. The execution receipts record these dependencies.

This propagation reuses the residual bank. Its weighted sum contains \(513\times128=65,664\) terms and 129 cumulative endpoint enclosures, with twelve outer series terms per producer endpoint and sixty-four inner curve terms. These counts describe that calculation; workloads that generate residuals or reference prices perform additional work. The kernel evidence component contains the fixed contract, interval outputs and separate reader.

### 7.6. Matched ledgers and certificate resolution

We can attribute the quarter-maturity decision to shared aggregation, because Q2 uses identical stored output, reference centre, 1025 node radii and all remainders in both columns. Every finite node has a nonzero reference, so finite omitted-node support is zero. Values below are in index points, and exact fractions are retained in quarter-exact-ledger.json.

**Table 10. Q2 quarter-year unit-spread ledger, in index points; only aggregation of the shared node errors differs between columns.**

| Component | Joint | Signed marginal |
| --- | --- | --- |
| Signed centre | -0.149775146827 | -0.149775146827 |
| Absolute centre charge | 0.149775146827 | 0.149775146827 |
| Used-node support | 0.045461793432 | 0.064536889507 |
| Finite omitted-node support | 0.000000000000 | 0.000000000000 |
| Strip remainder | 0.000026654230 | 0.000026654230 |
| True infinite-tail remainder | 0.038055248032 | 0.038055248032 |
| Reference arithmetic | 4.148871871727e-16 | 4.148871871727e-16 |
| Complete upper bound | 0.233318843 | 0.252393939 |

The joint complete bound is 0.233318843 points against 0.252393939 points for signed marginal aggregation, and only the joint certificate passes the 0.25-point budget. The difference of 0.019075095 points is entirely the node-support aggregation difference. Complete-bound displays are rounded upward to nine decimal places and component/centre and gap displays are approximate, but every decision and ledger identity uses exact fractional endpoints. Tiny reference arithmetic is displayed separately. The signed centre is a locator, not an extra additive charge on top of its absolute value.

Every portfolio curve uses the 28 originally fixed and fully specified directions. The files portfolio-exact-thresholds.csv and portfolio-budget-counts.json hold the exact endpoints, all threshold breakpoints and the pass counts. Certification uses the complete rational endpoint condition $B\leq\tau$, including equality. Between-bank plots show descriptive changes, whereas joint versus signed marginal within one bank uses matched radii. We infer no 28-direction quarterly dataset from the single quarter spread.

**Table 11. Complete-budget pass counts for all 28 fixed half-year directions; budgets are in index points and equality is included.**

| Bank | alpha | Budget points | Marginal | Joint |
| --- | --- | --- | --- | --- |
| H0 | 13/25 | 1/4 | 0/28 | 0/28 |
| H0 | 13/25 | 1/2 | 0/28 | 0/28 |
| H0 | 13/25 | 1 | 0/28 | 3/28 |
| H1 | 13/25 | 1/4 | 0/28 | 2/28 |
| H1 | 13/25 | 1/2 | 13/28 | 28/28 |
| H1 | 13/25 | 1 | 28/28 | 28/28 |
| H1 | 3/5 | 1/4 | 1/28 | 10/28 |
| H1 | 3/5 | 1/2 | 22/28 | 28/28 |
| H1 | 3/5 | 1 | 28/28 | 28/28 |
| H1 | 9/10 | 1/4 | 13/28 | 20/28 |
| H1 | 9/10 | 1/2 | 25/28 | 25/28 |
| H1 | 9/10 | 1 | 27/28 | 28/28 |
| N1 | 13/25 | 1/4 | 0/28 | 0/28 |
| N1 | 13/25 | 1/2 | 0/28 | 4/28 |
| N1 | 13/25 | 1 | 15/28 | 28/28 |
| N2 | 13/25 | 1/4 | 0/28 | 0/28 |
| N2 | 13/25 | 1/2 | 6/28 | 23/28 |
| N2 | 13/25 | 1 | 28/28 | 28/28 |
| N2L | 13/25 | 1/4 | 0/28 | 1/28 |
| N2L | 13/25 | 1/2 | 11/28 | 26/28 |
| N2L | 13/25 | 1 | 28/28 | 28/28 |

The two nearby levels retain all ten unordered pairs, including unresolved ones:

**Table 12. Complete unresolved-pair lists for N1 and N2 under the fixed quotes, alongside strict separation counts.**

| N_t | Method | Separated pairs | Complete unresolved list |
| --- | --- | --- | --- |
| 1024 | joint | 7/10 | (0.520, 0.525), (0.520, 0.530), (0.525, 0.530) |
| 1024 | marginal | 3/10 | (0.520, 0.525), (0.520, 0.530), (0.520, 0.540), (0.525, 0.530), (0.525, 0.540), (0.530, 0.540), (0.540, 0.550) |
| 2048 | joint | 10/10 | none |
| 2048 | marginal | 7/10 | (0.520, 0.525), (0.520, 0.530), (0.525, 0.530) |

The closest N2 joint separation, alpha=.520 versus .525, is a positive gap of approximately 7.382643478687e-10 in normalized squared-midpoint loss. Its endpoint identity is $J_{0, B}-J_{0, A}-H_B-H_A-Q_A$ plus any box-intersection endpoint adjustment. The gap decomposition, including used nodes, finite zero nodes, reference strip/tail/arithmetic and midpoint-conversion arithmetic, is recorded exactly in nearby-pair-resolution.json.

The complete centre accounting for the stored half-year 4400–4500 output follows. Signed centres are approximate displays and the radius and complete-bound columns are decimal upper endpoints, so independently rounded columns need not add exactly:

**Table 13. Half-year frozen-output centre accounting for H2–H4, N2 and N2L, in index points; upper-endpoint rounding is applied independently.**

| Bank | Signed centre points | Complete radius points | Complete bound points |
| --- | --- | --- | --- |
| H2 | -0.166762218 | 0.200496564 | 0.367258782 |
| H3 | -0.081698202 | 0.050546863 | 0.132245064 |
| H4 | -0.081698202 | 0.033517732 | 0.115215934 |
| N2 | -0.166762218 | 0.261808769 | 0.428570987 |
| N2L | -0.166762218 | 0.228237113 | 0.394999331 |

Expanding H2 to H3 changes the absolute centre charge as well as the reference radius in the budget, and H3 to H4 retains that new centre. N2 to N2L retains its own reference centre and full remainders. H4 to N2L is a descriptive cross-bank identity, not an ablation. These transitions are exact in frozen-output-centre-account.json, which also reports the common strict-reference certificate floor as a fraction of each BL-core bound; a dominant floor limits what this comparison can establish about intrinsic solver accuracy.

### 7.7. Scope of the experiments

The modern-method comparison reimplements the modified-Adams Riccati core described by Boyarchenko et al., without reproducing their full SINH deformation or Conformal Bootstrap. Agreement between two discretizations is a numerical diagnostic, not an interval certificate, and any comparison to a complete certified output has to include the independent reference, tails, arithmetic and verification that the guarantee requires.

The fixed refinement menu terminates reliably when the complete task radius meets the budget. Its minimum action count assumes that all alternative radii have been certified and that each action has unit cost, and constructing those alternatives is part of certificate generation. The experiments certify numerical-error bounds and budget and finite-candidate decisions under the stated model and quotes; model fit, market uncertainty, transaction costs and continuous calibration require additional analysis.

## 8. Conclusion and reproducibility

The construction follows the valuation map. The Riccati equation determines the exact state and its stability; the forward variance curve determines the residual's history weight; and the portfolio determines the linear functional applied to the common transform errors. Each stage retains information that would be lost by an earlier absolute-value bound. The resulting certificate is independent of how the reference trajectory was generated, provided that its continuous residual, half-plane and arithmetic obligations are verified.

The matched spread shows that retaining shared Fourier errors can change a complete tolerance decision without changing the stored prices. It does not show that every portfolio improves, that the upper bound is the actual error, or that a numerically certified model fits market quotes. The finite-candidate comparison is confined to its declared set, and the rational structural theorem is confined to its stated parameter domain. When output replacement is allowed, a certified reference is itself a valid pricing alternative.

The [online article](https://github.com/130U/certified-rough-heston-valuation/blob/main/ARTICLE.md), scientific source and verification commands accompany the paper. All 27 numerical banks are identified by size and SHA-256 in `SCIENTIFIC-MANIFEST.json`. `verify_source.py` checks the publication identities. `reproduce.py` reads the saved banks and reconstructs downstream prices, objectives and decisions; `--full` additionally recomputes the structural-sign cover. These modes do not regenerate every continuous residual derivative bound. Appendix E and `COMMANDS.md` distinguish the generators, readers and shared arithmetic dependencies.

## Appendices and Supporting Material

This page includes the complete main text and references. Appendices, supplementary proofs, code, and verification material are available in the [GitHub repository](https://github.com/130U/certified-rough-heston-valuation) and the [full manuscript](https://github.com/130U/certified-rough-heston-valuation/blob/V_20261101/manuscript/merged-heston-en.md#appendix-a-probability-model-and-strip-transform).

## References

1. **GR2019.** Gatheral, Jim and Radoičić, Radoš. *Rational Approximation of the Rough Heston Solution*. International Journal of Theoretical and Applied Finance 22(3), 1950010, 2019. DOI [10.1142/S0219024919500109](https://doi.org/10.1142/S0219024919500109). The SSRN manuscript dated January 29, 2019 is used.

2. **GR2023.** Gatheral, Jim and Radoičić, Radoš. *A Generalization of the Rational Rough Heston Approximation*. Quantitative Finance 24(2), 329–335, 2024. DOI [10.1080/14697688.2024.2302055](https://doi.org/10.1080/14697688.2024.2302055). [Source](https://arxiv.org/abs/2310.09181v1). Preprint consulted: arXiv:2310.09181.

3. **JK2020.** Siow Woon Jeng and Adem Kiliçman. *Series Expansion and Fourth-Order Global Padé Approximation for a Rough Heston Solution*. Mathematics 8(11), 1968, 2020. DOI [10.3390/math8111968](https://doi.org/10.3390/math8111968).

4. **JK2021.** Siow Woon Jeng and Adem Kiliçman. *SPX Calibration of Option Approximations under Rough Heston Model*. Mathematics 9(21), 2675, 2021. DOI [10.3390/math9212675](https://doi.org/10.3390/math9212675).

5. **AbiJaberElEuch2018.** Abi Jaber, Eduardo and El Euch, Omar. *Markovian structure of the Volterra Heston model*. Statistics & Probability Letters 149, 63–72, 2019. DOI [10.1016/j.spl.2019.01.024](https://doi.org/10.1016/j.spl.2019.01.024). Preprint consulted: arXiv:1803.00477.

6. **LiLiu2018.** Li, Lei and Liu, Jian-Guo. *A Generalized Definition of Caputo Derivatives and Its Application to Fractional ODEs*. SIAM Journal on Mathematical Analysis 50(3), 2867–2900, 2018. DOI [10.1137/17M1160318](https://doi.org/10.1137/17M1160318). The convexity result is Proposition 3.11.

7. **Simon2014.** Simon, Thomas. *Comparing Fréchet and positive stable laws*. 2014. [Source](https://arxiv.org/abs/1310.1888v2). Preprint consulted: arXiv:1310.1888.

8. **TrefethenWeideman2014.** Trefethen, Lloyd N. and Weideman, J. A. C. *The Exponentially Convergent Trapezoidal Rule*. SIAM Review 56(3), 385–458, 2014. DOI [10.1137/130932132](https://doi.org/10.1137/130932132). Strip quadrature is covered by Theorem 5.1.

9. **NIST2010.** Olver, Frank W. J. and Lozier, Daniel W. and Boisvert, Ronald F. and Clark, Charles W. *NIST Handbook of Mathematical Functions*. Cambridge University Press, 2010. [Source](https://dlmf.nist.gov/).

10. **BBWeak2023.** Bayer, Christian and Breneis, Simon. *Weak Markovian Approximations of Rough Heston*. 2023. [Preprint](https://arxiv.org/abs/2309.07023v1), [original PDF](https://arxiv.org/pdf/2309.07023v1). Preprint consulted: arXiv:2309.07023, submitted 13 September 2023. The characteristic-function and European-payoff error results are Theorems 2.2 and 2.7.

11. **BBSimulation2023.** Bayer, Christian and Breneis, Simon. *Efficient option pricing in the rough Heston model using weak simulation schemes*. 2023. [Preprint](https://arxiv.org/abs/2310.04146v1), [original PDF](https://arxiv.org/pdf/2310.04146v1). Preprint consulted: arXiv:2310.04146, submitted 6 October 2023. The cited preprint reports second-order weak convergence numerically on p. 4.

12. **Kopteva2021.** Kopteva, Natalia. *Pointwise-in-time a posteriori error control for time-fractional parabolic equations*. Applied Mathematics Letters 123, 107515, 2022. DOI [10.1016/j.aml.2021.107515](https://doi.org/10.1016/j.aml.2021.107515). [Preprint](https://arxiv.org/abs/2105.05848v2), [original PDF](https://arxiv.org/pdf/2105.05848v2). Preprint consulted: arXiv:2105.05848, revised 5 July 2021; first submitted 12 May 2021. The pointwise residual bound and norm inequality are Theorem 2.2 and Lemma 2.8.

13. **ElEuchRosenbaum2017.** El Euch, Omar and Rosenbaum, Mathieu. *Perfect hedging in rough Heston models*. arXiv:1703.05049, 2017. [Paper](https://arxiv.org/abs/1703.05049v1). The analytical decreasing-curve example is not a new model-admissibility theorem.

14. **SimonCM2015.** Simon, Thomas. *Mittag-Leffler functions and complete monotonicity*. Integral Transforms and Special Functions 26(1), 36–50, 2015. DOI [10.1080/10652469.2014.965704](https://doi.org/10.1080/10652469.2014.965704). [Paper](https://arxiv.org/abs/1312.4513v2).

15. **BL2025.** Boyarchenko, Svetlana; de Innocentis, Marco; and Levendorskii, Sergei. *Fast reliable pricing and calibration of the rough Heston model*. arXiv:2508.15080, 2025. [Paper](https://arxiv.org/abs/2508.15080v1). Modified Adams is Section 3.2; Conformal Bootstrap is Section 4.10.

16. **BenHammouda2026.** Ben Hammouda, Chiheb; Ben Romdhane, Abderrahmene; Samet, Michael; and Tempone, Raul F. *Single- and Multilevel Quadrature with Error Control for Fourier Pricing under the Rough Heston Model*. arXiv:2609.00438, 2026. [Paper](https://arxiv.org/abs/2609.00438v1). Practical tolerance interpretation: Section 3.2.

17. **HK2026.** Hager, Paul P. and Kreher, Dörte. *Expanding the rough Heston model in H*. arXiv:2606.16619, 2026. [Paper](https://arxiv.org/abs/2606.16619v1).
