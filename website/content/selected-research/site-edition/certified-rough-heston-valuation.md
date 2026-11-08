---
description: Deterministic joint pricing-error certificates for stored rough Heston outputs, covering finite-history propagation, portfolios and finite-candidate decisions.
---

## Abstract

We give deterministic bounds on the numerical error of stored rough Heston pricing outputs relative to the model price, and we keep the complex Fourier perturbation that different strikes share. A finite-history theorem carries a continuous fractional Riccati residual into the pricing exponent with the curve initial term and physical scaling intact; under nonexpansion it gives a curve-weighted bound, and under positive dissipation a sharper resolvent bound. Certified transform disks, finite omitted frequencies, strip quadrature, the infinite tail and arithmetic then combine into complete price, portfolio and finite-candidate objective enclosures. For a quarter-year spread the joint bound is 0.233318843 index points and the marginal bound is 0.252393939, so retaining the shared errors changes the decision at a quarter-point budget. A fixed five-point roughness grid and direct-reference, corrected-output and modified-Adams controls use the same market quotes. Their error accounts separate history weighting, shared geometry, reference uncertainty and changes of centre; market fit and the true error of a nominal solver are assessed separately. An exact algebraic cover also establishes the specified rational construction on a continuous parameter domain with fractional order in an interval, zero mean reversion and correlation in a narrow window around the public-data value, while the price certificate uses an independent reference field. Appendices give the regularity and residual proofs, verification procedures, and classical common-state extensions.

**Keywords:** rough Heston; continuous residual; finite history; actual output; joint pricing error; deterministic certification.

Sections 2–5 develop the pricing certificate and Sections 7.1 and 7.5–7.6 give the matched experiments, with the proofs, residual construction and verification procedures in Appendices C–E. Section 6 and Appendix B treat the rational construction, Appendices F–G the classical extensions, and Appendix H the research timeline.

## 1. Introduction

At a fixed model parameter and maturity, every strike is priced from the same Fourier transform values, so the error at each frequency is one common complex number. Bounding each price separately discards that constraint. We retain these common variables in the price-error set and ask whether they can change a financial certification decision. The resulting dependence is deterministic and comes from the pricing formula.

Write \(c^*\) for the model-price vector, \(c^{\rm fast}\) for the stored pricing output, and \(\bar c\) for an independent reference centre. The complete inclusion is

\[
c^*-c^{\rm fast}=d+\operatorname{Re}(A\delta)+r,
\qquad d=\bar c-c^{\rm fast}.
\tag{1.1}
\]

Each component of \(\delta\) is a rigorously enclosed common Fourier error. Finite omitted frequencies stay in \(\delta\), which lets the remainder \(r\) retain strip quadrature, the true infinite tail and arithmetic without charging those finite nodes twice. When the reference is refined, \(d\) and its certified uncertainty change together. We identify neither the reference price nor the fast output with the exact model price.

### 1.1. Contributions and dependencies

Our main analytical result takes a complex Riccati residual to the Heston exponent through a finite-history kernel. Theorem 3.1 gives both the nonexpansive curve bound and the positive-dissipation envelope, with the initial curve term and the physical factor \(\nu^{-1}\) included. We compose the underlying comparison, which uses established Caputo convexity and positive-resolvent results, with the model's pricing functional, certify the history weights, and put them into the complete output budget.

The second result certifies the actual pricing output. We translate the shared transform disks to that output (Theorem 5.1) and evaluate them in portfolio and finite-objective directions (Section 5.2, including Theorem 5.3), working with support functions, convexity and the sorting of a fully known unit-cost menu. A matched quarter-year comparison isolates what the shared errors contribute to the budget decision, while the ablation separates propagation, time-local envelopes, omitted-frequency certification and recentering.

The third result, Theorems 6.1 and 6.2, certifies a structural domain for the Gatheral–Radoicic rational construction, and its all-frequency statement carries explicit restrictions on correlation, fractional order and mean reversion. Prices use a different object, the residual certificate from an independently generated reference field. Nearby candidates and output controls then test the financial decisions and the reuse of that certificate.

In the matched experiments, finite-history propagation reduces the complete six-month spread bound by about 72.91% with output and centre unchanged (Table 3). At a 0.5-point budget and alpha=.52, finite-history joint bounds certify 28/28 fixed portfolio directions, compared with 13/28 for signed marginal bounds (Table 11). For the quarter-year spread, the joint bound is 0.233318843 points against 0.252393939 points for signed marginal aggregation with every other input matched, so only the joint certificate passes a 0.25-point budget (Table 10). On a prespecified five-point roughness grid under the original quotes, joint bounds strictly separate 10/10 candidate pairs at N_t=2048, against 7/10 for matched marginal bounds, and alpha=0.520 is the strict minimizer of the midpoint objective on that grid (Tables 5 and 6). All five candidates remain incompatible with at least one original bid/ask row, so this result is a certified midpoint-loss ranking of a finite set and it identifies no market-calibrated model.

**Table 1. Dependencies of the rational-output and independent-reference proof chains.**

| Proof chain | Inputs and conclusion | Role in the price certificate |
|---|---|---|
| Rational construction | Endpoint matching, raw determinant and numerator signs; well-defined Padé output and left-half-plane structure | Defines and checks the specified production formula on its stated domain |
| Independent reference | Fixed field, full continuous residual, dissipation, finite-history exponent and complete Fourier error | Certifies the reference transform and model-price inclusion |
| Output translation | Stored fast values and independently enclosed reference centre | Converts the reference inclusion into error of the actual output |

The two proof chains share the model but certify different objects. The algebraic signs settle the structural properties of the rational output, the continuous residual settles the reference error, and output translation connects the latter to the stored Padé price.

### 1.2. Related work

Gatheral--Radoicic [GR2019, GR2023] construct two-end rational approximations, and Jeng--Kilicman [JK2020, JK2021] analyse global Padé approximations and public SPX data. The formula and endpoint-matching method used here are theirs. What we add is a structural statement about the raw matching system throughout its explicitly certified domain.

Abi Jaber–El Euch [AbiJaberElEuch2018] give the Volterra model and affine transform. Li–Liu [LiLiu2018] establish Caputo convexity through regularization, Kopteva [Kopteva2021] propagates a time-dependent residual with a positive fractional inverse, Simon [SimonCM2015] gives Mittag–Leffler positivity, and Trefethen–Weideman [TrefethenWeideman2014] give strip trapezoidal analysis. We prove in Appendix C the regularity statements needed to apply these results to the pricing functional.

Ben Hammouda et al. [BenHammouda2026, Section 3.2] develop error-controlled multilevel rough-Heston quadrature. Their practical tolerance procedure replaces unavailable constants with numerical error indicators and assesses numerically whether the tolerance was attained, whereas our certificate encloses a stored output a posteriori, tails and arithmetic included.

Boyarchenko–de Innocentis–Levendorskii [BL2025] study reliable pricing, numerical bias and incorrect calibration, and we use their modified Adams method as a numerical control. They describe Conformal Bootstrap as an ad-hoc principle; it gives no deterministic interval enclosure. Hager–Kreher [HK2026] study analytic expansions in the Hurst parameter and local convergence, while Bayer–Breneis [BBWeak2023, BBSimulation2023] bound Markovian kernel approximations and investigate low-dimensional simulation. Each comparison below specifies the model, the numerical output and the error guarantee.

Appendices F–G give a separate classical Heston extension based on common occupation probabilities and an inexact trial field. Its terminal witness establishes strict improvement of an outer error set; a complete annual monetary certificate remains open.

## 2. Model, units and fixed configurations

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

For pricing and the numerical example, we fix \(\kappa=0\) and the entire forward variance curve
\[
\xi_*(t)=\theta+(V_0-\theta)E_{\alpha_0}(-\lambda_\xi t^{\alpha_0}),
\quad
(\alpha_0,V_0,\theta,\lambda_\xi)=(.5286,.0262,.0721,.5037).
\tag{2.4}
\]
The curve parameter \(\lambda_\xi\) and the Riccati parameter \(\lambda_R\) are defined separately, and curve (2.4) stays fixed when the candidate \(\alpha\) changes. The probability model is
\[
V_t=\xi_*(t)+\nu\int_0^tK_\alpha(t-s)\sqrt{V_s}\,dW_s,\quad
K_\alpha(t)=t^{\alpha-1}/\Gamma(\alpha),\qquad
dS_t=S_t\sqrt{V_t}\,dB_t,\quad d\langle B,W\rangle_t=\rho\,dt.
\tag{2.5}
\]
Equation (2.5) is the forward variance representation with zero Riccati mean reversion. For this curve, Appendix A verifies the probability model and the associated affine transform using Theorems 2.1 and 2.3 and Example 2.2 of Abi Jaber and El Euch.

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
The prices considered below are defined jointly by the model specification, the decimal inputs and the normalisation.

All experiments use model parameter $\nu=0.2897$, $\rho=-0.7445$, Riccati mean reversion zero, Fourier step $1/8$, a finite reference/error grid through 128 (1025 nodes), 100-bit outward dyadic arithmetic and 64 forward-moment series terms. The actual Padé output instead uses composite Gauss–Legendre order 8 through 200 (352 nodes) and Jacobi order 256, and its Fourier cutoff is distinct from the certificate cutoff. $N_t$ counts source time cells; we write out the number of frequency nodes explicitly so that it cannot be confused with $\nu$.

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

H0 uses uniform-state propagation, and H1 uses finite-horizon global propagation on the same field. H2 uses the low-frequency 128-bin bank. H3/H4 extend the reference through 128, retaining that low bank and using global/128-bin propagation for the high bank. Q0/Q1/Q2 retain the full history from zero and use exact quarter-terminal interpolation of the half-year field. Q0 has 1430/1353/550 time knots and Q1/Q2 have 1430 knots; they reuse the larger-horizon continuous banks and recompute quarter moments, output and tails. The alpha=.9 source field has 1025 time knots and 641 stored frequencies through 80, of which 513 are nonzero reference nodes in H0/H1/Q0, while the .52/.60 fields have 2049 knots and 1025 stored frequencies through 128.

N1/N2 generate each five-point field and continuous residual bank, using two nonstartup subcells (2047/4095 closed cells), and the nearby-grid objective experiment runs on these two. N2L is a separate descriptive 128-bin reuse of N2 at alpha=.52. The H low and high banks have four nonstartup subcells and 8189 closed cells each, for 513 and 512 frequencies respectively. So the 0.115215934-point H4 certificate and the 0.394999331-point N2L certificate use different reference centres, node coverage and residual banks, and their difference includes more than 128-bin propagation. BL-core512/1024 are nominal history-stepping controls whose complete guarantees use the identified N1/N2/N2L reference bank.

The H and N field generators begin with a uniform auxiliary grid \(y_j\) from zero to \(\nu T^\alpha\) and then set \(x_j=y_j^{1/\alpha}\) and \(t_j=x_j/\nu^{1/\alpha}\), which in exact arithmetic is the graded rule \(t_j=T(j/N_t)^{1/\alpha}\). Generation runs in binary64 arithmetic and forces the endpoints to zero and one half, so certification takes the saved nodes as exact dyadics rather than identifying them with the analytical rule. The quarter-year restriction keeps every original knot strictly below \(T_q=1/4\), appends the exact endpoint, encloses the linear interpolation of the original bracketing field coefficients in rational interval arithmetic, and retains all preceding history.

## 3. Finite-history propagation: nonexpansion and dissipation

We apply the established tools of Caputo comparison and norm convexity [LiLiu2018; Kopteva2021; SimonCM2015], and Appendix C.1 proves the absolute-continuity statement they require here, including almost-everywhere passage and the continuous endpoint. Under the hypotheses below, the complex divided difference has real part at most \(-\nu\sigma\), and composing its error bound with the pricing functional gives Theorem 3.1, whose proof is in Appendix C.2.

For \(\beta>0\), write \(g_\beta(t)=t^{\beta-1}/\Gamma(\beta)\). Define \(k_\lambda(t)=t^{\alpha-1}E_{\alpha,\alpha}(-\lambda t^\alpha)\), with \(k_0=g_\alpha\). All convolutions below start at time zero.

**Theorem 3.1 (finite-history pricing envelope).** Let \(0<\alpha<1\), \(\nu>0\), \(T>0\), and \(Z,\widehat Z\in AC([0,T];\mathbb C)\) have zero initial value. Let

\[
D_C^\alpha Z=\nu F(Z),\quad
r=D_C^\alpha\widehat Z-\nu F(\widehat Z),\quad
|r|\le R\in L^\infty(0,T),\qquad R\ge0,
\tag{3.1}
\]

where \(F(z)=-b+dz+z^2/2\), \(\Re d=-s_0\), \(\Re Z\le0\), \(\Re\widehat Z\le\epsilon_R\), and \(\sigma=s_0-\epsilon_R/2\ge0\). These equations and inequalities hold almost everywhere; the state bounds hold everywhere by continuity. Let \(\xi\in AC[0,T]\), \(\xi(0)=V_0\ge0\), and assume

\[
q_\alpha=(I^{1-\alpha}\xi)'
=V_0g_{1-\alpha}+g_{1-\alpha}*\xi'\ge0\quad\text{a.e.}
\tag{3.2}
\]

Define \(L_T\) and \(\widehat L_T\) from \(\nu^{-1}\int_0^T\xi(T-t)D_C^\alpha Z(t)\,dt\) and the same expression with \(\widehat Z\). With \(\lambda=\nu\sigma\),

\[
|Z-\widehat Z|\le k_\lambda*R,
\qquad
|L_T-\widehat L_T|
\le\nu^{-1}(q_\alpha*k_\lambda*R)(T)
\le\nu^{-1}(\xi*R)(T).
\tag{3.3}
\]

In particular, \(R/\nu\le\delta_F\) implies

\[
|L_T-\widehat L_T|\le\delta_F\int_0^T\xi(s)\,ds.
\tag{3.4}
\]

**Proof route.** Set \(e=Z-\widehat Z\); the physical equation's divided-difference coefficient has real part at most \(-\nu\sigma\). The AC convexity lemma applied to a smooth modulus and the positive zero-initial inverse gives the state bound, including its continuous endpoint. Absolute Fubini and AC integration by parts then express the exponent difference as \(\nu^{-1}(q_\alpha*e)(T)\), retaining the zero state initial values and the curve term \(V_0g_{1-\alpha}\). Positivity of \(q_\alpha\) propagates that state bound, and \(0\le q_\alpha*k_\lambda\le\xi\) gives the curve envelope. The argument keeps the entire fractional history and removes \(\nu^{-1}\) only upon normalizing the physical residual by \(\nu\); Appendix C.1–C.2 gives the full proof.

At \(\sigma=0\), set \(k_0=g_\alpha\); the two exponent envelopes coincide. Positive dissipation permits further reduction. The initial term \(V_0g_{1-\alpha}\) and the factor \(\nu^{-1}\) remain in both bounds. Stochastic admissibility of the experimental curve is verified separately in Appendix A.

For a full-history residual envelope \(R\le R_j\) on each closed cell \([a_j,b_j]\), the computable cell-weight form is

\[
|L_T-\widehat L_T|
\le\nu^{-1}\sum_jR_j\int_{a_j}^{b_j}(q_\alpha*k_\lambda)(T-s)\,ds
\le\nu^{-1}\sum_jR_j\int_{a_j}^{b_j}\xi(T-s)\,ds.
\tag{3.5}
\]

Every weight integrates the history from time zero, and an integration bin takes the maximum over every closed residual cell it intersects, boundary cells included. Section 7 compares curve and dissipative-kernel weights on matched inputs. Appendix C.3–C.4 proves decreasing-curve and constant-curve variants and a complementary global-state bound.

### Strict computation of the dissipative pricing kernel

The positive kernel in Theorem 3.1 can be handled by a direct interval calculation. For \(\sigma\ge0\), set \(\lambda=\nu\sigma\) and

\[
K_\lambda=q_\alpha*k_\lambda,\qquad
\eta_{\rm res}=\nu^{-1}(K_\lambda*R)(T),\qquad
0\le K_\lambda=\xi-\lambda\,\xi*k_\lambda\le\xi.
\tag{3.6}
\]

The assumptions and scaling are those of Theorem 3.1, and the positive fractional inverse follows from [Kopteva2021, SimonCM2015]. We enclose the pricing-kernel weights and use them in the same actual-output certificate.

**Zero-damping special case of Theorem 3.1.** If \(\sigma=0\),

\[
k_0=g_\alpha,\qquad K_0=\xi,\qquad
|L_T-\widehat L_T|\le\nu^{-1}(\xi*R)(T).
\tag{3.7}
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
\tag{3.8}
\]

A cell \([a_j,b_j]\) has weight \(W_\lambda(T-a_j)-W_\lambda(T-b_j)\); Appendix C gives the absolute series tails and the interval-difference proof. The implementation, with twelve outer terms, sixty-four inner curve terms and 100-bit outward dyadic primitives, is an enclosure of the full Mittag–Leffler kernel functional with explicit truncation and rounding remainders. Ordinary floating-point Mittag–Leffler values do not enter a guarantee.

## 4. Continuous certificates and complete Fourier prices

The reference is a fixed \(\widehat Z=I^\alpha\bar G\), a continuous field whose recorded coefficients we interpret as exact dyadics; the nominal nodal solver states are not the reference. A startup power expansion and closed-cell derivative bounds certify its full physical residual; Appendix D.1 gives the construction, arithmetic and history integrals. The configuration table distinguishes the four-subcell H/Q banks from the two-subcell nearby banks.

We use the derivative-based reference exponent \(\widehat L_T=\nu^{-1}\int_0^T\xi(T-t)\bar G(t)dt\); a substitution-based exponent would require an additional residual-conversion term. Once \(\eta_n\) encloses the error of the derivative-based exponent, the exponential difference and the true half-shift modulus bound give the transform disk
\[
|\phi_n-\widehat\phi_n|\le \min\{1,|\widehat\phi_n|\}(e^{\eta_n}-1).\tag{4.1}
\]

**Theorem 4.1.** Suppose \(M_T>0,\mathbb E M_T=1\). For any \(0<a_*<1/2,h_*>0\), let
\(g(z)=e^{-ikz}\phi_T(z-i/2)/(z^2+1/4)\). Replacing the integral in (2.7) by the infinite trapezoidal sum incurs a price error of at most
\[
\epsilon_{\rm grid}
=\frac{\sqrt m\,e^{a_*|k|}}
{(1/2-a_*)(e^{2\pi a_*/h_*}-1)}.
\tag{4.2}
\]

Appendix D.2 contains the strip proof and the exact-solution high-frequency comparison. A finite omitted reference value is charged explicitly, independently of the true infinite tail.

Suppose the node values \(\widehat\phi_n\) have exact-error bounds \(\varepsilon_n\). The finite price sum
\[
\widehat c_{N_u}=1-\frac{h_*\sqrt m}{\pi}
\left(2\operatorname{Re}\widehat\phi_0+
\sum_{n=1}^{N_u}\frac{\operatorname{Re}(e^{-inh_*k}\widehat\phi_n)}
{(nh_*)^2+1/4}\right)
\tag{4.3}
\]
satisfies
\[
|c-\widehat c_{N_u}|\le\epsilon_{\rm grid}+\epsilon_{\rm tail}
 +\frac{h_*\sqrt m}{\pi}
\left(2\varepsilon_0+
\sum_{n=1}^{N_u}\frac{\varepsilon_n}{(nh_*)^2+1/4}\right)
 +\epsilon_{\rm arithmetic}.
\tag{4.4}
\]

In these equations \(N_u\) is the Fourier sum cutoff, whereas \(N_t\) denotes time-grid cells. The origin coefficient is the trapezoidal half-weight multiplied by \(1/(1/4)\). The exact arithmetic remainder encloses the phase, square root, exponential and summation operations.

## 5. Shared errors and financial decisions

### 5.1. Joint inclusion at the frozen output

Fix one model parameter, maturity, contour and reference grid. Let \(c^*\in\mathbb R^p\) be the continuous-model price vector, \(\bar c\) the exact finite reference sum, and \(c^{\rm fast}\) the frozen rational output. For each included frequency let \(\bar\phi_n\) be the reference transform and put \(z_n=\phi(u_n-i/2)-\bar\phi_n\). Appendix D.1 gives bounds \(|z_n|\le\epsilon_n\), and at a deliberately omitted finite node \(\bar\phi_n=0\) the radius comes from the true-transform envelope. The same \(z_n\) enters every strike at this parameter and maturity.

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

**Proof.** Substituting the actual transform errors in (5.2) gives inclusion. The product of complex disks is compact and convex and its real-linear image has those properties. A disk \(|z|\le\epsilon\) has real-linear support \(\epsilon|b|\) for the functional \(\Re(bz)\): Cauchy--Schwarz gives the upper bound, attained at \(z=\epsilon\overline b/|b|\) when \(b\ne0\); when \(b=0\), every feasible point attains it. Independent disks and Minkowski addition give (5.4). Translation gives the signed centre term. A box enclosing \(d\) provides a further valid Minkowski outer enclosure even if its coordinates are dependent. \(\square\)

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

The implementation below uses rational outward bounds for logarithms, trigonometric functions, square roots and the circle constant, and it encloses the exact coefficient difference before multiplying by the saved radius. The signed centre comes from reference-sum and frozen-output intervals. Interval midpoints taken for display never stand in for the outward endpoint arithmetic used in a decision.

If the target quote \(m^*\) is enclosed around a stored centre \(\bar m\) with \(m^*-\bar m\in\mathcal M\), use \(r=c^{\rm fast}-\bar m\) and replace the output-error set by \(\mathcal E-\mathcal M\), which brings in quote-conversion arithmetic with the correct sign. Otherwise the following formulas take \(m\) to be exact.

Let \(J(e)=(r+e)^\top W(r+e)/(2p)\), where \(r=c^{\rm fast}-m\), \(W\succeq0\), and the complete output error belongs to a compact convex set \(\mathcal E\). For any trial vector \(e_0\), put \(g_0=W(r+e_0)/p\). Convexity gives the certified lower bound
\[
\inf_{e\in\mathcal E}J(e)\ge
J(e_0)-g_0^\top e_0-h_{\mathcal E}(-g_0).
\tag{5.11}
\]
This follows by taking the infimum of the supporting affine function \(J(e_0)+g_0^\top(e-e_0)\). Validity does not need \(e_0\) to be feasible, though feasibility affects sharpness. A numerical primal minimizer, on the other hand, becomes a lower-bound certificate only after its support or dual obligation has also been bounded correctly.

If \(M^2\ge\sup_{e\in\mathcal E}e^\top We\), expansion yields
\[
\sup_{e\in\mathcal E}J(e)\le
J(0)+\frac{h_{\mathcal E}(Wr)}p+\frac{M^2}{2p}.
\tag{5.12}
\]
Any valid coordinate box \(|e_i|\le b_i\) gives a safe choice: with \(W\) represented exactly, \(M^2=\sum_{ij}|W_{ij}|b_i b_j\) is sufficient, and tighter validated norm bounds may replace it. A local stationary point does not certify maximization of this convex quadratic, so the upper direction has to be established by a supporting function, norm bound, interval subdivision or valid relaxation.

For a finite candidate collection, form valid objective intervals by intersecting (5.11)--(5.12), when used, with the original interval-square bounds in Theorem 5.3. A unique candidate is certified only if its upper endpoint is smaller than every competing lower endpoint. Failing that, return the nonempty set of candidates whose lower endpoint is at most the least upper endpoint, which contains every exact minimizer. Different candidates have different transform errors, and (5.4) does not identify their error variables.

We join the model-specific continuous residual certificate to the actual multi-strike pricing output through the established support formula, equality case of the triangle inequality and convexity bounds, preserving every required budget and its centre. The numerical comparison in Section 7 is our evidence for the resulting financial improvement.

For Theorem 5.3 we specialize the preceding general objective to \(p=12,W=I_{12}\) and sum exactly twelve normalized call prices, so \(J=\frac1{24}\sum_{i=1}^{12}(c_i-M_i)^2\). Quote-conversion half-widths concern the input midpoint arithmetic and are distinct from the resulting objective half-width.

**Theorem 5.3 (finite-objective intervals and selection stability).** For each \(\alpha_j\in\Theta_{\rm finite}\), suppose all model prices have certified enclosures
\[
c_i(\alpha_j)\in[p^-_{ij},p^+_{ij}],\quad
B_i\in[b_i^-,b_i^+],\quad
A_i\in[a_i^-,a_i^+],\quad
M_i\in[m_i^-,m_i^+].
\tag{5.13}
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
\tag{5.14}
\]
Then \(J(\alpha_j)\in[L_j,U_j]\). Writing \(L_*=\min_jL_j,U_*=\min_jU_j\), the exact finite-set optimum satisfies
\[
J_*=\min_{\Theta_{\rm finite}}J\in[L_*,U_*].
\tag{5.15}
\]
For \(\varepsilon\ge0\), every exact \(\varepsilon\)-near-optimal candidate belongs to
\[
\{\alpha_j:L_j\le U_*+\varepsilon\};
\tag{5.16}
\]
The condition \(U_j-L_*\le\varepsilon\) is sufficient for that candidate to be near-optimal for the exact objective. If
\[
g:=\min_{j\ne j_0}L_j-U_{j_0}>0,
\tag{5.17}
\]
then \(\alpha_{j_0}\) is the unique minimiser of the model objective on the finite set. If
\[
\min_{\alpha_j\ge.6}L_j>U_*+\varepsilon,
\tag{5.18}
\]
then every exact near-optimal candidate in the finite set satisfies \(\alpha_j<.6\).

Quote consistency is checked separately. If any row satisfies \(p^+_{ij}<b_i^-\) or \(p^-_{ij}>a_i^+\), the candidate cannot lie in all quote bands simultaneously. Conversely, if every row satisfies \(p^-_{ij}\ge b_i^+\) and \(p^+_{ij}\le a_i^-\), then quote consistency is certified. Overlapping intervals without this inner-band condition retain possible consistency; overlap alone does not certify it.

Appendix D.4 contains the interval-square and finite-selection proof. Theorem 5.3 certifies objective intervals and selection statements on the finite set from each candidate's own enclosures; a continuous parameter optimum, market identification and dependence across candidate errors lie outside it.

## 6. Structure of the specified rational output

The Gatheral–Radoicic third-order construction matches three startup and three large-time coefficients. Write \(\widehat H(y)=P(y)/Q(y)\), \(Q=1+q_1y+q_2y^2+q_3y^3\), with \(y=\nu t^\alpha\). Appendix B.1 defines the raw matching matrix, determinant and numerator polynomials, proves their exact identities and gives the full sign proof. No numerical division precedes the determinant lower bound.

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

## 7. Matched decisions and scientific controls

### 7.1. Fixed contracts, units and complete ablation

The six-month contract uses twelve strikes \(K_i=3700+100i\), \(0\le i\le11\), forward \(F=4221.86\), discount \(D=1\), and the fixed forward-variance curve (2.4). Prices and task errors are in index points, with position multiplier one and no exchange-specific currency notional assigned. Moving between candidates changes \(\alpha\) while the curve and other parameters remain fixed. The three-candidate profile \(.52,.60,.90\) compares this finite set, and each candidate is incompatible with several market bid/ask bands.

Table 3 compares the complete \(K=4400\) minus \(K=4500\) task bound. Each row retains its actual output, signed centre, included finite frequencies, strip, true tail and arithmetic. Displayed upper bounds are rounded upward. The quarter-year study reuses no six-month exponent or tail value. It recomputes its maturity-specific reference integral, true-transform envelopes and tails, while its upstream full-history certificate is lawfully restricted to the shorter horizon.

**Table 3. H0–H4 and Q0–Q2 complete unit-spread certificates, in index points; outputs and reference changes are identified by configuration.**

| Maturity and stage | Complete joint bound, points | Matched signed marginal bound, points | Interpretation |
|---|---:|---:|---|
| H0: Six months: global state propagation | 1.397612096 | — | Original failed one-point task |
| H1: Six months: finite history, same global residual | 0.378598956 | — | Principal propagation improvement; unchanged output and centre |
| H2: Six months: local envelope, original used nodes | 0.367258782 | — | About 3% further bound reduction |
| H3: Six months: all finite high nodes, global envelope | 0.132245064 | 0.158585551 | High-frequency certification and centre change are included |
| H4: Six months: all finite high nodes, local envelope | 0.115215934 | 0.137896018 | Both methods certify 0.25 points |
| Q0: Three months: through 64, global envelope | 1.207557898 | 1.545191542 | Failed 0.25-point task |
| Q1: Three months: through 128, global envelope | 0.351318692 | 0.408293698 | Failed 0.25-point task |
| Q2: Three months: through 128, local envelope | 0.233318843 | 0.252393939 | Only the joint method certifies 0.25 points |

Finite-history propagation reduces the H0 complete bound by about 72.91%, and this figure measures a guaranteed upper bound. The six-month high-frequency refinement also changes the centre from approximately \(-0.166762218\) to \(-0.081698202\) points, so its reduction combines centre and uncertainty changes. In Q2, by contrast, the output, centre, node radii and remainders are all matched, and retaining the shared errors changes the decision. The time-local quarter-year refinement was specified after the global budget failed and is an exploratory transfer experiment.

### 7.2. Twenty-eight portfolio directions

The following matched pass-count table uses H1 at each stated alpha.

Let \(e_i\) select strike \(K_i\). We keep the exact holdings below, without rescaling them to make a budget pass, so every threshold is an absolute error in index points for the specified holding vector. Gross weight means \(\sum_i|w_i|\).

**Table 4. The 28 fixed portfolio directions on the twelve strikes; gross weight is the sum of absolute position weights.**

| Family | Exact direction | Count | Gross weight |
|---|---|---:|---:|
| Adjacent spreads | \(e_i-e_{i+1},\ 0\le i\le10\) | 11 | 2 |
| Adjacent butterflies | \(e_i-2e_{i+1}+e_{i+2},\ 0\le i\le9\) | 10 | 4 |
| Wide spreads | \(e_0-e_3,e_3-e_6,e_6-e_9,e_0-e_{11}\) | 4 | 2 |
| Positive baskets | \(\frac1{12}\sum_{i=0}^{11}e_i,\ \frac16\sum_{i=0}^5e_i,\ \frac16\sum_{i=6}^{11}e_i\) | 3 | 1 |

All methods in each matched comparison use identical upstream radii. At a 0.5-point budget and \(\alpha=.52\), finite-history joint bounds certify 28/28 portfolios, compared with 13/28 for signed marginal bounds. At a 0.25-point budget the counts are 10/28 against 1/28 for \(\alpha=.60\), and 20/28 against 13/28 for \(\alpha=.90\). The one-point budget for \(.52\) does not distinguish the shared structure, because both finite-history methods certify 28/28 there. A valid payoff intersection gives no further tightening in this setting. Failure to certify leaves the budget unresolved.

### 7.3. Prespecified nearby candidates under the original quotes

The two objective columns refer to N1 and N2 respectively.

The original twelve half-year quotes, forward F=4221.86, discount D=1 and all other model parameters are fixed. Before computing new results we froze alpha={0.520,0.525,0.530,0.540,0.550}, a first layer N_t=1024, and an upgrade of **all five** candidates to N_t=2048 if any adjacent joint comparison remained unresolved. Every point has a newly generated continuous reference field and a complete closed-time residual bank, and we pay for Fourier nodes through 64, all omitted finite nodes through 128, true infinite tails, strip remainder, reference arithmetic and the original quote-conversion intervals.

The objective is the original normalized midpoint loss \(J=\frac1{24}\sum_i(c_i-m_i)^2\), using normalized calls; index-point squared units would require multiplication by \(F^2\). The tiny target interval halfwidth here consists of outward arithmetic error in converting the fixed bid/ask-price midpoint, and it is distinct from the market bid/ask halfwidth. The ranking is certified for that fixed midpoint target and establishes no uniform winner for arbitrary quote targets inside those market bands. A Taylor support enclosure preserves common Fourier disks in its linear term and charges the full coordinate-radius quadratic remainder, and its same-radius marginal comparison uses the identical upstream certificate. The comparison across alpha candidates uses each candidate's own enclosure, so it requires no assumption about correlation between their errors.

**Table 5. N1 and N2 five-candidate objective enclosures under the original quotes; displayed values are normalized J multiplied by 10^8.**

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

The first layer retained its unresolved close pairs, which triggered the frozen all-candidate upgrade. On the final grid we certify alpha=0.520 as the strict minimizer of the midpoint objective among the five fixed points, which is a finite-set comparison and gives no continuous calibration optimum. All five candidates, alpha=0.520 included, remain incompatible with at least one original bid/ask row, so the certified object is this midpoint-loss ranking and the finite-set result identifies no market-calibrated model.

The two layers generate every closed-cell residual entry: 15,754,230 entries, 5,130 reference exponents and 10,250 true-transform envelopes in total. Separate readers check complete coverage and maxima, reconstruct the exponents, coefficients and objectives, and reject deliberate corruptions, although they use common rigorous primitives and the generator's residual-derivative bounds.

### 7.4. Why certify a frozen fast output?

The detailed matched output table uses N2L; the preceding failed levels are N1 and N2.

A stored-output certificate applies to pricing-library audits, historical calculations and production outputs fixed by the task. If replacement is allowed and the reference is available, returning its certified centre gives a direct control; correcting the fast output by that centre also requires the rounding of the stored correction and final addition. The experiments compare these choices, and any assessment of an online workload has to include the reference construction and verification.

A separately frozen descriptive control reuses the complete \(N_t=2048,\alpha=.52\) residual bank with 128 history bins, and it does not change the prespecified nearby-grid experiment. Every intersected closed source cell contributes to each bin maximum, and all weights are outwardly enclosed. All five methods below use the same model, six-month \(4400-4500\) spread, 0.25-point tolerance, reference centre, node radii, strip and true-tail budget.

**Table 7. N2L actual-output controls for the half-year unit 4400–4500 spread; complete bounds and the budget are in index points.**

| Output | Complete joint, points | Matched marginal, points | Joint 0.25-point decision |
|---|---:|---:|---|
| Frozen Padé | 0.394999331 | 0.514096070 | UNRESOLVED |
| Direct reference (binary64) | 0.228237113 | 0.347333852 | PASS |
| Fast + stored correction | 0.228237113 | 0.347333852 | PASS |
| BL core, 512 steps | 0.229082759 | 0.348179497 | PASS |
| BL core, 1024 steps | 0.228534686 | 0.347631424 | PASS |

All five matched marginal bounds remain above 0.25 points, so the joint structure still changes the decision for the reference and BL outputs. Direct reference and corrected fast values happen to have the same complete bound in this instance, and their actual stored values are checked separately. Exact dyadic arithmetic charges the reference return, stored correction and final addition. For these freely replaceable outputs, the reference is simpler than delivering the unchanged fast result. The BL 512-to-1024 difference is a diagnostic, not its certified error.

Certificate generation encloses 2,100,735 continuous frequency-by-cell residual entries, 513 reference exponents and 1,025 true-transform node bounds, together with the infinite tail and 12,300 price coefficients. Reading checks every entry and reconstructs the exponents, coefficients and decisions. The 28 portfolios reuse the same bank at one parameter and maturity, and an additional portfolio needs 1,025 shared-disk support terms and the complete remainder.

**Table 8. Typed deterministic work for the additional output constructions; these counts do not measure total computational cost.**

| Additional output construction | Deterministic mathematical work |
|---|---|
| Original Padé output | 352 Fourier values; 256 Jacobi samples per frequency |
| Direct returned reference | Return the already generated, fully charged centre with binary64 rounding |
| Corrected fast output | Store one correction and perform one binary64 addition per price |
| BL core, 512 steps | 67,371,264 history scalar-vector products; 2,626,560 transformed Riccati evaluations |
| BL core, 1024 steps | 269,222,400 history scalar-vector products; 5,253,120 transformed Riccati evaluations |

These counts measure different operations. We record reference generation, outward transcendental evaluations and verification separately from nominal-output construction, and the complete ledger also includes exponent quadrature and the two failed coarse-envelope stages. Actual online cost has not been measured.

### 7.5. Matched dissipative-kernel evaluation

We froze the six-month configuration at \(\alpha=13/25\), \(\nu=2897/10000\), \(\rho=-1489/2000\), and \(\sigma=1489/4000\) before computing the resolvent weights, so the physical damping is \(\lambda=\nu\sigma=4313633/40000000\). All four comparisons reuse the same N2L (N_t=2048) closed-cell residual bank, the same stored binary64 fast prices, the same reference exponents and signed centres, and the same finite omission, analytic strip, true infinite tail and reference arithmetic terms. The financial direction is the unit 4400–4500 call spread. The full finite grid contains 1025 frequencies, including 513 used reference frequencies and 512 retained finite omitted frequencies. We reconstruct the complete twelve-price certificate for every method.

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

The separate reader actually reads all 2,100,735 entries of the complete residual bank, checks closed-cell coverage from zero, and recomputes the maxima for all 128 propagation bins. It expands the cumulative resolvent independently by the direct double Gamma series with fourteen outer terms, whereas the producer uses twelve outer terms and a strict power-field moment; both enclose all inner tails with sixty-four retained terms. The reader then checks all 513 transform-radius minima in all four comparisons and rebuilds all twelve prices with all 1025 finite frequencies. At \(\sigma=0\), it replays all 129 cumulative endpoints and all 128 cell weights against the curve-kernel conclusion. It rejects eight actual negative controls: negative damping, an incorrect physical \(\nu\) scale, a missing initial closed cell, a removed finite omitted node, an erased true infinite tail, an altered signed centre, an understated resolvent exponent enclosure, and a zero-damping weight that does not reproduce the curve kernel.

The reader reconstructs the cumulative-weight algebra and certificate assembly, but it shares the dyadic arithmetic, Gamma, logarithm and exponential primitives, together with the validated residual-derivative bounds and reference exponents. The execution receipts record these dependencies.

This propagation reuses the residual bank. Its weighted sum contains \(513\times128=65,664\) terms and 129 cumulative endpoint enclosures, with twelve outer series terms per producer endpoint and sixty-four inner curve terms. These counts describe that calculation; workloads that generate residuals or reference prices perform additional work. The kernel evidence component contains the fixed contract, interval outputs and separate reader.

### 7.6. Matched ledgers and certificate resolution

We can attribute the quarter-maturity decision to shared aggregation, because Q2 uses identical actual output, reference centre, 1025 node radii and all remainders in both columns. Every finite node has a nonzero reference, so finite omitted-node support is zero. Values below are in index points, and exact fractions are retained in quarter-exact-ledger.json.

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

**Table 12. Complete unresolved-pair lists for N1 and N2 under the original quotes, alongside strict separation counts.**

| N_t | Method | Separated pairs | Complete unresolved list |
| --- | --- | --- | --- |
| 1024 | joint | 7/10 | (0.520, 0.525), (0.520, 0.530), (0.525, 0.530) |
| 1024 | marginal | 3/10 | (0.520, 0.525), (0.520, 0.530), (0.520, 0.540), (0.525, 0.530), (0.525, 0.540), (0.530, 0.540), (0.540, 0.550) |
| 2048 | joint | 10/10 | none |
| 2048 | marginal | 7/10 | (0.520, 0.525), (0.520, 0.530), (0.525, 0.530) |

The closest N2 joint separation, alpha=.520 versus .525, is a positive gap of approximately 7.382643478687e-10 in normalized squared-midpoint loss. Its endpoint identity is $J_{0, B}-J_{0, A}-H_B-H_A-Q_A$ plus any box-intersection endpoint adjustment. The gap decomposition, including used nodes, finite zero nodes, reference strip/tail/arithmetic and midpoint-conversion arithmetic, is recorded exactly in nearby-pair-resolution.json. This is the same fixed original midpoint-loss ranking, with the same arithmetic-only midpoint-conversion interval and the same separate bid/ask incompatibility of all five candidates.

The complete centre accounting for the unchanged actual half-year 4400–4500 output follows. Signed centres are approximate displays and the radius and complete-bound columns are decimal upper endpoints, so independently rounded columns need not add exactly:

**Table 13. Half-year frozen-output centre accounting for H2–H4, N2 and N2L, in index points; upper-endpoint rounding is applied independently.**

| Bank | Signed centre points | Complete radius points | Complete bound points |
| --- | --- | --- | --- |
| H2 | -0.166762218 | 0.200496564 | 0.367258782 |
| H3 | -0.081698202 | 0.050546863 | 0.132245064 |
| H4 | -0.081698202 | 0.033517732 | 0.115215934 |
| N2 | -0.166762218 | 0.261808769 | 0.428570987 |
| N2L | -0.166762218 | 0.228237113 | 0.394999331 |

Expanding H2 to H3 changes the absolute centre charge as well as the paid reference radius, and H3 to H4 retains that new centre. N2 to N2L retains its own reference centre and full remainders. H4 to N2L is a descriptive cross-bank identity, not an ablation. These transitions are exact in frozen-output-centre-account.json, which also reports the common strict-reference certificate floor as a fraction of each BL-core bound; a dominant floor limits what this comparison can establish about intrinsic solver accuracy. When replacement is permitted and the strict reference is already available, returning that reference directly is the simpler workload; frozen-output audit and free replacement answer different tasks.

### 7.7. Scope of the experiments

The modern-method comparison reimplements the modified-Adams Riccati core described by Boyarchenko et al., without reproducing their full SINH deformation or Conformal Bootstrap. Agreement between two discretizations is a numerical diagnostic, not an interval certificate, and any comparison to a complete certified output has to pay the independent reference, tails, arithmetic and verification costs required by that guarantee.

The fixed refinement menu terminates reliably when the complete task radius meets the budget. Its minimum action count assumes that all alternative radii have been certified and that each action has unit cost, and constructing those alternatives is part of certificate generation. The experiments certify numerical-error bounds and budget and finite-candidate decisions under the stated model and quotes; model fit, market uncertainty, transaction costs and continuous calibration require additional analysis.

## 8. Scope and reproducibility

The certificate uses the stated model, affine transform, regular reference and outward enclosures. Appendix A establishes stochastic admissibility for the experimental curve, and Theorems 6.1 and 6.2 hold on their stated parameter domains, which fix zero mean reversion and confine correlation to a narrow window around the public-data value. We report unresolved intervals, failed budgets and quote incompatibilities alongside successful certificates.

The [online paper](https://github.com/130U/certified-rough-heston-valuation/blob/paper/ARTICLE.md), scientific source and verification procedures are available in this repository; the source is under `science/`, and `python verify_source.py` checks the published source hashes. The complete numerical banks are retained in the author's local evidence archive. `python reproduce.py --full` requires those banks, so the public checkout alone does not provide a complete saved-bank replay.

Tables E.6, E.7 and E.10 list the generation commands, reading commands, recomputation scope and shared dependencies. `--full` reads the specified banks, reconstructs downstream prices and objectives, and also checks the original structural cover, while continuous residual regeneration has separate commands. Saved derivative bounds and common rigorous primitives remain inputs to the readers. The reported acceptance runs were performed by the author.

The supplement records software dependencies, evidence volume and mathematical work counts, in which closed cells, interval terms, history products and support terms count different operations. At a fixed parameter and maturity, further directions reuse one certified bank, but generating that bank remains part of the complete task.

Appendices A–E contain the main proofs and experiments. Appendices F–G give classical Heston common-state inclusion and the four-part identity for inexact trial functions, with a terminal certificate and a thirteen-dimensional diagnostic; annual monetary pricing needs the full coefficient bank in addition.

The construction certifies stored outputs and reuses a common Fourier bank across financial directions. If output replacement is allowed and a certified reference is available, returning the reference is a direct alternative. A comparison with true solver error requires a rigorous error interval, and when that interval crosses zero we report no finite upper ratio of certificate width to true error.

## Appendices and Supporting Material

This page includes the complete main text and references. Appendices, supplementary proofs, code, and verification material are available in the [GitHub repository](https://github.com/130U/certified-rough-heston-valuation) and the [full manuscript](https://github.com/130U/certified-rough-heston-valuation/blob/8d7264ce2f269a2e01f0b9dd80680bf70e50dcee/manuscript/merged-heston-en.md#appendix-a-probability-model-and-strip-transform).

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
