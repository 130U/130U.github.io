# Certified Joint Pricing Errors in Rough Heston

## Abstract

Every option on one underlying and one expiry is priced from a single characteristic function, so a numerical error in that function is a common factor across strikes: a position hedged in strike space is hedged against it, and a position spread over many strikes diversifies it. We make this exact and build on it a deterministic certificate, a bound on the distance between a stored vector of prices and the exact model prices in any portfolio direction. Two results carry the construction. The first holds for every model priced by Fourier inversion: the exposure of a portfolio to the transform error at a given frequency is the Fourier transform of its payoff, so that low-frequency error cancels in spreads and butterflies while high-frequency error averages out across strikes at a rate set by the Herfindahl index of the position. The second bounds the transform error in the rough Heston model: a residual in the fractional Riccati equation moves the log-characteristic function by at most the residual integrated against a forward variance curve, the curve of the same model under the measure midway between the risk-neutral and share measures. The constant is one, the leverage effect supplies the damping, the hypothesis on the curve is the condition under which the model is known to exist, and the argument carries over to Volterra Heston models with completely monotone kernels. On S&P 500 quotes of 18 June 2021, the six-month 4400–4500 call spread, quoted about 2.5 index points wide, is certified to 0.115 points. At three months the same spread is certified to 0.233 points when its legs are netted and to 0.252 when they are not, with every input identical, and the two bounds fall on opposite sides of a quarter-point tolerance.

**Keywords:** rough volatility; Volterra Heston models; fractional Riccati equation; Fourier pricing; a posteriori error bounds; model risk; netting.

**JEL classification:** C63, G13, G12.

**MSC 2020:** 91G20, 91G60, 65G20, 45D05, 26A33.

## 1. Introduction

The characteristic function of the Heston model is known in closed form, and for more than a decade one of its two standard expressions carried a flaw that went largely unnoticed. Written as in Heston (1993), the formula crosses a branch cut of the complex logarithm at long maturities, and an implementation on the principal branch returns a discontinuous transform (Kahl and Jäckel 2005; Albrecher, Mayer, Schoutens and Tistaert 2007). The error entered every strike of a maturity together, because every strike is an integral of the same function. A second episode shows the other side of the same fact. The expansion of Hagan, Kumar, Lesniewski and Woodward (2002) for the SABR model tracks the exact implied volatility closely, strike by strike, yet at low strikes and long expiries the density it implies turns negative: a butterfly, which is a portfolio of three options, receives a negative price (Hagan, Kumar, Lesniewski and Woodward 2014). Accuracy in each price had not delivered accuracy in a direction.

Both episodes say that the accuracy of an option pricer is a property of directions in strike space. This paper makes that statement quantitative. Its portfolio results hold for every pricer built on a common transform. Its bound on the transform itself is proved for the rough Heston model of El Euch and Rosenbaum (2019), whose transform solves a fractional Riccati equation with no closed form, so that the prices used in practice come from approximations: the rational approximation of Gatheral and Radoičić (2019), fractional Adams schemes (Diethelm, Ford and Freed 2004), Markovian lifts (Abi Jaber and El Euch 2019b; Abi Jaber 2019) and neural-network surrogates (Horvath, Muguruza and Tomas 2021). Their accuracy is usually reported by comparison with a slower solver on a test set. Agreement between two solvers bounds neither.

We ask what can be proved after the fact. A vector \(c^{\rm fast}\) of rough Heston prices has been computed and stored. Let \(c^*\) be the exact model prices of the same contracts, normalised by the forward \(F_T\) and the discount factor \(D\). For a portfolio \(w\) and a monetary tolerance \(\tau\), the task is to prove
\[
DF_T\left|w^\top(c^*-c^{\rm fast})\right|\le\tau.
\tag{1.1}
\]
The stored output is taken as given. An independent reference \(\bar c\) is built with its own error bound, and the stored output is located relative to it:
\[
c^*-c^{\rm fast}=d+\operatorname{Re}(Az)+r,\qquad d=\bar c-c^{\rm fast}.
\tag{1.2}
\]
Here \(z_n\) is the error of the reference transform at the frequency \(u_n\), one complex number shared by all strikes; \(A\) is the matrix of known pricing coefficients; and \(r\) collects quadrature, the infinite tail and arithmetic. Two questions follow. How large can \(z_n\) be, and how should the bounds on the \(z_n\) be combined for a portfolio?

### 1.1. What a Riccati residual costs

A reference trajectory \(\widehat h\) fails to solve the Riccati equation by a residual \(r(t)\), which can be bounded on every time interval by exact arithmetic. The first result converts that residual into an error of the log-characteristic function \(L_T\). For a reference in the left half-plane and an admissible forward variance curve,
\[
\left|L_T-\widehat L_T\right|\le\int_0^T\xi^{\lambda}(T-t)\,|r(t)|\,dt\le\int_0^T\xi(T-t)\,|r(t)|\,dt,
\qquad \lambda=\tfrac12|\rho|\nu .
\tag{1.3}
\]
The weight \(\xi^\lambda\) is a forward variance curve: it is the expected variance of the same model under the measure whose Girsanov kernel is half that of the share measure, which is the measure the Lewis contour sees (Theorem 3.1 and Proposition 3.2). Three features of (1.3) deserve emphasis. The constant is one; there is no Grönwall exponential, although the equation is nonlinear and carries its whole history. The damping rate \(\lambda\) is the amount by which the leverage effect speeds up mean reversion under that measure, so the feature of the model that produces the equity skew is also the one that makes numerical errors contract. And the single hypothesis on the curve, nonnegativity of its Riemann–Liouville derivative, is the condition under which El Euch and Rosenbaum (2018) and Abi Jaber and El Euch (2019a) construct the model with nonnegative variance. The certificate asks nothing of the curve that the model does not already ask.

The bound is the rough counterpart of variation of constants for the Heston Riccati equation. A fractional equation has no semigroup to restart, and two classical tools take its place: convexity of the Caputo derivative on a modulus and positivity of the scalar fractional resolvent. On the six-month example of Section 7, replacing a uniform bound on the state by (1.3) lowers the complete error bound of a call spread from 1.398 to 0.379 index points, a reduction of 72.91 per cent, with the stored prices and the reference unchanged. The same proof covers every damped contour and Volterra Heston models with completely monotone kernels, the classical and the lifted Heston models among them (Remarks 3.5 and 3.6).

### 1.2. Transform error as a common factor

Once each \(z_n\) lies in a disk of radius \(\epsilon_n\), the set of price errors compatible with (1.2) is a sum of ellipses, one for each frequency, and its support in the direction \(w\) can be written down exactly (Theorem 5.1):
\[
\sup\,w^\top\operatorname{Re}(Az)=\frac{h_*}\pi\sum_n\omega_n\,\epsilon_n\,\frac{|\widehat w(u_n)|}{u_n^2+\frac14},
\qquad
\widehat w(u)=\sum_iw_i\sqrt{m_i}\,e^{-iuk_i},
\tag{1.4}
\]
where \(k_i=\log m_i\) is log-moneyness, \(h_*\) is the grid step and \(\omega_n\) are the trapezoidal weights. The function \(\widehat w\) is the Fourier transform of the payoff of the portfolio. A portfolio of options with a common expiry is one payoff, and (1.4) prices its error as one payoff. Bounding each leg separately replaces \(|\widehat w(u)|\) by \(\sum_i|w_i|\sqrt{m_i}\), and the ratio of the two, which we call the netting ratio, measures what is lost.

The netting ratio has a simple anatomy. For a vertical spread with log-strike gap \(\Delta\) it is \(|\sin(u\Delta/2)|\) up to terms of order \(\Delta\): the spread is hedged against transform error of wavelength longer than twice its strike spacing and fully exposed at the Nyquist frequency \(\pi/\Delta\). For a butterfly the ratio is squared. For any portfolio its mean square over a long band of frequencies is the Herfindahl index of the position (Propositions 5.2 and 5.3). Transform error therefore behaves like a factor model in frequency. Low-frequency error is systematic across strikes and is removed by hedging. High-frequency error is idiosyncratic across strikes and is removed by diversification. On the S&P 500 example the eleven adjacent call spreads keep on average 0.708 of their leg-by-leg node error, against a Herfindahl benchmark of \(1/\sqrt2\approx0.707\); an equal-weight basket of all twelve calls keeps 0.076.

This part of the paper is model-free. It applies to any pricer that obtains a strip of options from one transform, whatever the model and whatever the method that produced the transform.

### 1.3. Evidence and economic scale

Section 7 applies the certificate to S&P 500 index options quoted on 18 June 2021 (Jeng and Kiliçman 2021), with the index at 4221.86. An SPX option has a multiplier of 100 dollars per index point and a minimum tick of 0.05 points below a premium of 3.00 and 0.10 above (Cboe Global Markets 2024); in 2025 an average of 3.9 million contracts changed hands each day (Cboe Global Markets 2026). On the sample date the six-month calls between 3700 and 4800 were quoted between 0.8 and 2.5 points wide. A tolerance of a quarter point is 25 dollars a contract and about one fifth of the quoted width of the 4400 call. Our tolerances of 1, 1/2 and 1/4 point thus ask whether numerical error is safely inside the bid–ask spread.

The answers are as follows. The stored rational-approximation output for the six-month 4400–4500 call spread is certified to 0.115 points, against a quoted width of about 2.5. At three months the netted bound is 0.233 points and the leg-by-leg bound 0.252, from the same stored output, reference centre, 1,025 node radii and remainders; only netting certifies a quarter point. Across 28 spreads, butterflies and baskets at six months, a half-point tolerance is certified for all 28 with netting and for 13 without. Five neighbouring roughness candidates, from \(H=0.02\) to \(H=0.05\), are ranked by their least-squares distance to the quotes with certified separation in all ten pairs, against seven of ten without netting, so the ranking belongs to the model and the quotes. And at the best candidate the model price of the 4400 call lies at least 0.49 points above the quoted ask: a discrepancy between model and market that the certificate attributes to the model.

The setting is one that supervisors already describe in portfolio terms. European prudent-valuation rules require a model-risk valuation adjustment for each valuation model and aggregate the individual adjustments with a flat factor of 50 per cent (Commission Delegated Regulation (EU) 2016/101, Article 11 and Annex). The Basel market-risk framework tests, desk by desk, whether the prices of the risk engine track those of the front office, with the stated aim to "measure the materiality of simplifications" in the former (Basel Committee on Banking Supervision 2019, MAR32.20). United States guidance asks that model risk be assessed "both individually and in aggregate", where the aggregate reflects reliance on common methodologies (Board of Governors of the Federal Reserve System, Federal Deposit Insurance Corporation and Office of the Comptroller of the Currency 2026). A shared transform is a common methodology in the most literal sense. For the numerical component of valuation uncertainty, (1.4) replaces a flat diversification factor by the exact one.

### 1.4. Relation to the literature

The rough Heston model arises as the scaling limit of Hawkes-based microstructure models (El Euch, Fukasawa and Rosenbaum 2018) and belongs to the affine Volterra class (Abi Jaber, Larsson and Pulido 2019); its forward variance form is due to El Euch and Rosenbaum (2018) and Gatheral and Keller-Ressel (2019). The empirical case for rough volatility, and the debate around it, rests on precise pricing at the short end, where numerical methods are under most strain (Gatheral, Jaisson and Rosenbaum 2018; Bayer, Friz and Gatheral 2016; Rømer 2022; Cont and Das 2024).

Gatheral and Radoičić (2019, 2024) derive rational approximations by matching the short- and long-time behaviour of the fractional Riccati solution, and Jeng and Kiliçman (2020, 2021) study global Padé approximations and their calibration to SPX. The stored output we audit is the third-order approximation of Gatheral and Radoičić; Section 6 records a structural property of it on the parameter set we use. Bayer and Breneis (2023a, 2023b) study Markovian kernel approximations and weak simulation schemes. Boyarchenko, de Innocentis and Levendorskii (2025) study reliable rough Heston pricing and calibration, and their modified Adams method is one of our controls. Ben Hammouda, Ben Romdhane, Samet and Tempone (2026) allocate time-discretisation and quadrature errors in single- and multilevel methods, and Hager and Kreher (2026) expand the model in the Hurst parameter. These works bound or estimate the error of a method. Our object is the error of a given output, with every remainder charged, in a given portfolio direction.

The analytical tools are established. Caputo convexity is due to Li and Liu (2018), pointwise a posteriori control of fractional equations by positive resolvents to Kopteva (2022), complete monotonicity of Mittag-Leffler functions to Simon (2015), and the strip analysis of the trapezoidal rule to Trefethen and Weideman (2014). What we add is their composition along the valuation map, from the Riccati residual through the forward variance curve to the payoff transform, the identification of the resulting kernel as a forward variance curve under a tilted measure, and the frequency anatomy of portfolio error.

Section 2 states the pricing problem. Section 3 proves the residual bound and Section 4 turns it into transform disks and price bounds. Section 5 treats portfolios. Section 6 describes the stored output and Section 7 the evidence. Appendices A–E contain the model verification, the complete proofs and the experimental record.

## 2. The pricing problem

### 2.1. Model, transform and price

Fix a maturity \(T\) and let \(S\) be the forward price for delivery at \(T\), so that \(S_0=F_T\). Under the pricing measure \(\mathbb Q\),
\[
dS_t=S_t\sqrt{V_t}\,dB_t,\qquad
V_t=\xi(t)+\nu\int_0^tg_\alpha(t-s)\sqrt{V_s}\,dW_s,\qquad
d\langle B,W\rangle_t=\rho\,dt,
\tag{2.1}
\]
with \(g_\beta(t)=t^{\beta-1}/\Gamma(\beta)\), roughness index \(\alpha=H+\tfrac12\in(\tfrac12,1)\), volatility of variance \(\nu>0\) and correlation \(-1\le\rho\le0\). The function \(\xi(t)=\mathbb E V_t\) is the forward variance curve. In this form the model has no separate mean-reversion parameters: whatever drift the variance has is recorded in \(\xi\), which is in principle observable from variance swaps (El Euch and Rosenbaum 2018; Gatheral and Keller-Ressel 2019).

Throughout, convolutions start at zero, \((f*g)(t)=\int_0^tf(t-s)g(s)\,ds\), and
\[
I^\alpha f=g_\alpha*f,\qquad D^\alpha v=g_{1-\alpha}*v'\quad(v\in AC),
\tag{2.2}
\]
are the fractional integral and the Caputo derivative. We work on the contour of Lewis (2001), on which the transform is \(\phi_T(u-\tfrac i2)=\mathbb E[(S_T/F_T)^{1/2+iu}]\) for real \(u\). It is given by a fractional Riccati equation (El Euch and Rosenbaum 2019):
\[
D^\alpha h=F_u(h),\quad h(0)=0,\qquad
F_u(h)=-\tfrac12\left(u^2+\tfrac14\right)+\left(\tfrac12\rho\nu+i\rho\nu u\right)h+\tfrac12\nu^2h^2,
\tag{2.3}
\]
\[
\phi_T(u-\tfrac i2)=e^{L_T(u)},\qquad
L_T(u)=\int_0^T\xi(T-t)\,D^\alpha h(t,u)\,dt .
\tag{2.4}
\]
With \(m=K/F_T\), \(k=\log m\) and \(c=C/(DF_T)\), the normalised price of a call struck at \(K\) is
\[
c=1-\frac{\sqrt m}{\pi}\int_0^\infty\operatorname{Re}\frac{e^{-iuk}\,\phi_T(u-\tfrac i2)}{u^2+\frac14}\,du .
\tag{2.5}
\]

**Proposition 2.1 (the exact Riccati trajectory).** Let \(\alpha\in(\tfrac12,1)\), \(-1\le\rho\le0\) and \(u\in\mathbb R\). Equation (2.3) has a unique global solution. It is absolutely continuous on every finite interval, continuously differentiable at positive times, and satisfies \(\operatorname{Re}h(t)<0\) for \(t>0\). With \(b_u=\tfrac12(u^2+\tfrac14)\) and \(\lambda_*=\tfrac12|\rho|\nu\),
\[
|h(t)|\le\frac{b_u}{\lambda_*}\left\{1-E_\alpha(-\lambda_*t^\alpha)\right\}\le\frac{b_u\,t^\alpha}{\Gamma(1+\alpha)},
\tag{2.6}
\]
where \(E_\alpha\) is the Mittag-Leffler function and the last bound remains valid for \(\rho=0\).

**Proof.** Local Volterra contraction gives existence and uniqueness. On the imaginary axis the real part of \(F_u\) is at most \(-\tfrac18\) after completing a square, and the fractional maximum principle then prevents the trajectory from leaving the left half-plane. Convexity of a regularised modulus and comparison with the scalar linear equation give (2.6), which excludes blow-up, and the continuation keeps the preceding history. Appendix C.1 gives the details. \(\square\)

The proposition identifies the object to be approximated without reference to any numerical scheme. Its two conclusions, the invariant half-plane and the scale \(\lambda_*\), are the source of the stability used below.

### 2.2. Two faces of the exponent

The exponent \(L_T\) has a second expression, and the pair is what makes residual control possible.

**Proposition 2.2 (two faces).** Let \(\xi\in AC[0,T]\) and define
\[
q=\frac{d}{dt}\left(g_{1-\alpha}*\xi\right)=\xi(0)\,g_{1-\alpha}+g_{1-\alpha}*\xi' .
\tag{2.7}
\]
Then \(q\in L^1(0,T)\), \(g_\alpha*q=\xi\), and for every \(v\in AC[0,T]\) with \(v(0)=0\),
\[
\int_0^T\xi(T-t)\,D^\alpha v(t)\,dt=\int_0^Tq(T-t)\,v(t)\,dt .
\tag{2.8}
\]

**Proof.** By Fubini's theorem the left side is \(((g_{1-\alpha}*\xi)*v')(T)\). The function \(g_{1-\alpha}*\xi\) is absolutely continuous and vanishes at zero, as does \(v\), so integration by parts moves the derivative and gives \((q*v)(T)\). The identity \(g_\alpha*g_{1-\alpha}=1\) gives \(g_\alpha*q=\xi\). Appendix C.2 records the integrability bounds. \(\square\)

The function \(q\) is the Riemann–Liouville derivative of the curve, and it has a direct meaning. If the variance is written with an explicit drift, \(V_t=V_0+\int_0^tg_\alpha(t-s)\theta(s)\,ds+\nu\int_0^tg_\alpha(t-s)\sqrt{V_s}\,dW_s\), then \(\xi=V_0+g_\alpha*\theta\) and
\[
q(t)=\frac{V_0\,t^{-\alpha}}{\Gamma(1-\alpha)}+\theta(t).
\tag{2.9}
\]
Thus \(q\) is the rate at which variance is supplied: the drift \(\theta\), together with the term a power-law memory requires in order to hold the initial level \(V_0\) in place. Applied to the exact solution, (2.8) reads \(L_T=\int_0^T\xi(T-t)F_u(h(t))\,dt=\int_0^Tq(T-t)h(t)\,dt\), and both forms appear in El Euch and Rosenbaum (2018, Corollaries 3.2 and 3.3). The first face says what the exponent is, the Riccati polynomial accumulated against forward variance. The second says how the exponent responds to an error in the state: linearly, with weight \(q\).

**Assumption 2.3 (admissible curve).** \(\xi\in AC[0,T]\), \(\xi(0)\ge0\), and \(q\ge0\) almost everywhere on \((0,T)\).

Under this assumption \(\xi=g_\alpha*q\ge0\). The assumption is the model's own. In the notation of (2.9) it says that \(\theta(t)\,dt+V_0\,t^{-\alpha}dt/\Gamma(1-\alpha)\) is a nonnegative measure, which is the condition imposed by El Euch and Rosenbaum (2018, condition (4)) and by Abi Jaber and El Euch (2019a, Example 2.2) to construct the model with nonnegative variance. Every nondecreasing curve with \(\xi(0)\ge0\) is admissible. A decreasing curve is admissible as long as it does not fall faster than the memory of the kernel allows: \(\xi(t)=V_0(1-ct)\) is admissible on \([0,T]\) exactly when \(cT\le1-\alpha\) (Corollary C.4). Appendix A verifies the hypotheses of the existence and transform theorems for the curve used in Section 7.

## 3. What a Riccati residual costs

### 3.1. A martingale that fails to be one

Let \(\widehat h\in AC[0,T]\) with \(\widehat h(0)=0\) be an approximate solution of (2.3), and let
\[
r=D^\alpha\widehat h-F_u(\widehat h)
\tag{3.1}
\]
be its residual. A formal computation shows what \(r\) should cost. Write \(\xi_t(s)=\mathbb E[V_s\mid\mathcal F_t]\) for the forward variance curve seen at time \(t\), so that \(d\xi_t(s)=\nu g_\alpha(s-t)\sqrt{V_t}\,dW_t\), put \(X_t=\log(S_t/S_0)\), and consider
\[
\widehat M_t=\exp\left\{\left(\tfrac12+iu\right)X_t+\int_t^TD^\alpha\widehat h(T-s)\,\xi_t(s)\,ds\right\}.
\]
At \(t=T\) this is \((S_T/S_0)^{1/2+iu}\) and at \(t=0\) it is \(e^{\widehat L_T}\), where \(\widehat L_T=\int_0^T\xi(T-t)D^\alpha\widehat h(t)\,dt\). Itô's formula and the identity \(\int_t^TD^\alpha\widehat h(T-s)\,g_\alpha(s-t)\,ds=\widehat h(T-t)\) give
\[
d\widehat M_t=-\,r(T-t)\,V_t\,\widehat M_t\,dt+dN_t
\]
with \(N\) a local martingale, and taking expectations,
\[
\phi_T(u-\tfrac i2)-e^{\widehat L_T}=-\int_0^Tr(T-t)\,\mathbb E\left[V_t\widehat M_t\right]dt .
\tag{3.2}
\]
For the exact solution \(r=0\), and this is the usual verification of (2.4). For an approximation the would-be martingale drifts, and it drifts in proportion to variance, because per unit of variance the Riccati polynomial is the generator of the pair \((X,\xi)\) acting on exponentials. A residual at time to maturity \(T-t\) therefore costs the variance expected at calendar time \(t\), weighted by \(\widehat M_t\). Since \(|\widehat M_t|\) carries the factor \((S_t/S_0)^{1/2}\), the weighting is that of a measure tilted halfway towards the share measure.

Identity (3.2) is the heuristic behind the theorem that follows, which proves the same conclusion for the exponent by deterministic means and with a weight that depends only on the model.

### 3.2. The residual bound

For \(\lambda\ge0\) let \(k_\lambda(t)=t^{\alpha-1}E_{\alpha,\alpha}(-\lambda t^\alpha)\) be the resolvent kernel of the scalar fractional equation, the solution of \(k_\lambda+\lambda\,g_\alpha*k_\lambda=g_\alpha\), with \(k_0=g_\alpha\). For an admissible curve define
\[
\xi^\lambda=k_\lambda*q,\qquad\text{equivalently}\qquad\xi^\lambda+\lambda\,g_\alpha*\xi^\lambda=\xi .
\tag{3.3}
\]

**Theorem 3.1 (a residual is priced by forward variance).** Let \(\alpha\in(\tfrac12,1)\), \(-1\le\rho\le0\), \(u\in\mathbb R\), and let \(\xi\) satisfy Assumption 2.3. Let \(h\) be the solution of (2.3) and let \(\widehat h\in AC[0,T]\) satisfy \(\widehat h(0)=0\) and \(\operatorname{Re}\widehat h\le\varepsilon\) on \([0,T]\), with \(\lambda=\tfrac12|\rho|\nu-\tfrac12\nu^2\varepsilon\ge0\). Suppose the residual (3.1) satisfies \(|r|\le R\) almost everywhere for some \(R\in L^\infty(0,T)\). Then, for \(0\le t\le T\),
\[
|h(t)-\widehat h(t)|\le(k_\lambda*R)(t),
\tag{3.4}
\]
and the exponents \(L_T=\int_0^T\xi(T-t)D^\alpha h(t)\,dt\) and \(\widehat L_T=\int_0^T\xi(T-t)D^\alpha\widehat h(t)\,dt\) satisfy
\[
\left|L_T-\widehat L_T\right|\le\int_0^T\xi^\lambda(T-t)\,R(t)\,dt\le\int_0^T\xi(T-t)\,R(t)\,dt .
\tag{3.5}
\]
In particular, if \(R\le\delta\) then \(|L_T-\widehat L_T|\le\delta\int_0^T\xi(s)\,ds\).

**Proof.** Put \(e=h-\widehat h\). Because \(F_u\) is quadratic, subtraction gives an exact linear equation,
\[
D^\alpha e=\left\{\tfrac12\rho\nu+i\rho\nu u+\tfrac12\nu^2(h+\widehat h)\right\}e-r,\qquad e(0)=0,
\tag{3.6}
\]
and by Proposition 2.1 the coefficient has real part at most \(-\lambda\). The Caputo derivative of a convex function of a path is at most the gradient applied to the Caputo derivative of the path. Applied to a regularised modulus this gives \(D^\alpha|e|+\lambda|e|\le|r|\le R\), and positivity of the resolvent \(k_\lambda\) gives (3.4). By Proposition 2.2, \(L_T-\widehat L_T=\int_0^Tq(T-t)e(t)\,dt\). Since \(q\ge0\), (3.4) gives \(|L_T-\widehat L_T|\le(q*k_\lambda*R)(T)=(\xi^\lambda*R)(T)\). Finally \(g_\alpha-k_\lambda=\lambda\,g_\alpha*k_\lambda\ge0\), so \(\xi^\lambda\le g_\alpha*q=\xi\). Appendix C.2 supplies the regularity, including the passage to the terminal time. \(\square\)

The bound is global: it holds for residuals of any size and at every frequency. The exact solution enters through the sign of its real part alone, and the weight in (3.5) is fixed by the equation and the curve.

### 3.3. The weight is a forward variance curve

The kernel \(\xi^\lambda\) was defined by a Volterra equation. It is also an expectation.

**Proposition 3.2 (the kernel under a tilted measure).** Let \(\xi\) be admissible and, for \(\eta\in[0,1]\), let \(\mathbb Q^\eta\) be the measure with density \(\mathcal E(\eta\int_0^{\cdot}\sqrt{V_s}\,dB_s)_T\) with respect to \(\mathbb Q\). Under \(\mathbb Q^\eta\) the variance follows a rough Heston equation with the same supply \(q\), the same \(\nu\) and mean-reversion speed \(\eta|\rho|\nu\), and
\[
\mathbb E^{\mathbb Q^\eta}[V_t]=\xi^{\eta|\rho|\nu}(t),\qquad0\le t\le T .
\tag{3.7}
\]
In particular the weight of Theorem 3.1 for a reference in the left half-plane is \(\xi^{\lambda_*}(t)=\mathbb E^{\mathbb Q^{1/2}}[V_t]\).

**Proof.** The stochastic exponential is a true martingale (Abi Jaber, Larsson and Pulido 2019, Lemma 7.3, whose argument applies to an admissible input curve). By Girsanov's theorem \(W^\eta=W-\eta\rho\int_0^{\cdot}\sqrt{V_s}\,ds\) is a Brownian motion under \(\mathbb Q^\eta\), and (2.1) becomes
\[
V_t=\xi(t)-\eta|\rho|\nu\int_0^tg_\alpha(t-s)V_s\,ds+\nu\int_0^tg_\alpha(t-s)\sqrt{V_s}\,dW^\eta_s .
\]
The moment bounds for affine Volterra processes make the stochastic integral centred, so \(m(t)=\mathbb E^{\mathbb Q^\eta}[V_t]\) solves \(m+\eta|\rho|\nu\,g_\alpha*m=\xi\), whose unique solution is \(\xi^{\eta|\rho|\nu}\) by (3.3). \(\square\)

The measures \(\mathbb Q^\eta\) interpolate between the pricing measure at \(\eta=0\) and the share measure, whose numéraire is the underlying, at \(\eta=1\). Under the share measure the variance of an equity index reverts faster, by \(|\rho|\nu\): paths on which the index is high receive more weight, and on those paths the leverage effect makes variance low. This is the adjustment that separates the two probabilities in the formula of Heston (1993). The Lewis contour prices the claim \(S_T^{1/2+iu}\), whose modulus sits midway between the two numéraires, and it inherits half of the adjustment. Theorem 3.1 then reads as follows.

*On the Lewis contour, a Riccati residual at time to maturity \(s\) changes the log-characteristic function by at most the variance expected at time \(T-s\) under \(\mathbb Q^{1/2}\), per unit of residual.*

Four remarks place the statement.

**Remark 3.3 (the classical model).** At \(\alpha=1\) the resolvent is \(k_\lambda(t)=e^{-\lambda t}\) and \(\xi^\lambda(t)=V_0e^{-\lambda t}+\int_0^te^{-\lambda(t-s)}\theta(s)\,ds\). Inequality (3.5) is then variation of constants for the Heston Riccati equation, in which the error is transported by a flow that contracts at rate \(\lambda\). For \(\alpha<1\) there is no flow to transport it. Convexity of the Caputo derivative and positivity of \(k_\lambda\) recover the same conclusion with the same constant.

**Remark 3.4 (the constant).** The constant one in (3.5) is sharp. At \(a=0\), the point of zero frequency on the undamped contour, the exact solution vanishes, \(\lambda=0\), and a residual of constant sign produces \(\widehat L_T-L_T=\int_0^T\xi(T-t)r(t)\,dt\) up to terms of second order in \(r\). On the Lewis contour the exact solution adds damping of its own through \(\operatorname{Re}h<0\), growing with the frequency, and Theorem 3.1 uses the part that is uniform in the frequency.

**Remark 3.5 (other contours and positive correlation).** On a contour \(\operatorname{Im}a=-\eta\) with \(0<\eta<1\) the linear coefficient of the Riccati polynomial has real part \(\eta\rho\nu\), the left half-plane is again invariant, and the proof gives (3.5) with \(\lambda=\eta|\rho|\nu\) and the measure \(\mathbb Q^\eta\). The damping available to an error bound thus rises linearly from nothing at the pricing measure to \(|\rho|\nu\) at the share measure. For \(\rho>0\) the same argument gives (3.4) and the first inequality of (3.5) with a negative \(\lambda\), the resolvent being positive term by term; the kernel \(\xi^\lambda\) then lies above \(\xi\), and residuals compound at the rate at which variance runs away under the tilted measure.

**Remark 3.6 (other kernels).** The fractional kernel enters the proof through three facts: \(g_\alpha*g_{1-\alpha}=1\) with \(g_{1-\alpha}\) nonnegative and nonincreasing, which gives the convexity inequality; positivity of the resolvent \(k_\lambda\); and \(\xi=g_\alpha*q\) with \(q\ge0\), which is the second face. Every completely monotone kernel \(K\) has a resolvent of the first kind with the same monotonicity and a completely monotone resolvent (Gripenberg, Londen and Staffans 1990, Chapter 5), its admissible curves are again of the form \(\xi=K*q\) with \(q\) a nonnegative measure (Abi Jaber and El Euch 2019a, Example 2.2), and the left half-plane is invariant for its Riccati–Volterra equation (Abi Jaber, Larsson and Pulido 2019, Theorem 7.1). The argument therefore gives (3.5) for Volterra Heston models with completely monotone kernels, with \(\xi^\lambda\) defined by \(\xi^\lambda+\lambda K*\xi^\lambda=\xi\): the classical Heston model, where \(K\equiv1\) and the statement is Remark 3.3; the lifted Heston model of Abi Jaber (2019), where \(K\) is a finite sum of exponentials; and gamma kernels. Appendix C writes out the regularity for the fractional kernel.

Figure 1 shows the two weights for the curve calibrated in Section 7. At six months the half-share curve lies below the risk-neutral one by at most a few per cent, since \(\lambda_*T^\alpha\approx0.075\). The large gain in the experiments comes from the first inequality in (3.5), which weights each residual by the variance still to come, in place of a uniform bound on the state.

![Figure 1. The price of a unit Riccati residual as a function of time to maturity: the forward variance curve of the calibrated model under the pricing measure and under the half-share measure of Proposition 3.2. Six-month horizon, parameters of Section 7.](../figures/residual-kernel.png)

### 3.4. Cell weights

In computation the residual is bounded on closed time cells. If \(R\le R_j\) on \([a_j,b_j]\) and the cells cover \([0,T]\), then (3.5) gives
\[
\left|L_T-\widehat L_T\right|\le\sum_jR_j\int_{a_j}^{b_j}\xi^\lambda(T-s)\,ds\le\sum_jR_j\int_{a_j}^{b_j}\xi(T-s)\,ds .
\tag{3.8}
\]
Each weight is an amount of forward variance, and all of them refer to the history from time zero. For the curve of Section 7, \(\xi(t)=\theta+(V_0-\theta)E_{\alpha_0}(-\lambda_\xi t^{\alpha_0})\), the cumulative weight \(W_\lambda(t)=\int_0^t\xi^\lambda(s)\,ds\) has the expansion
\[
W_\lambda(t)=\sum_{n=0}^\infty(-\lambda)^n\,t^{1+n\alpha}
\left[\frac{\theta}{\Gamma(2+n\alpha)}+(V_0-\theta)\,E_{\alpha_0,\,2+n\alpha}\left(-\lambda_\xi t^{\alpha_0}\right)\right],
\tag{3.9}
\]
valid for \(\lambda T^\alpha<1\), and the cell \([a_j,b_j]\) has weight \(W_\lambda(T-a_j)-W_\lambda(T-b_j)\). Appendix C.5 bounds the tails of both series, and the implementation encloses every term by outward-rounded dyadic arithmetic.

## 4. From residuals to prices

### 4.1. A reference shaped by the startup expansion

Theorem 3.1 separates the choice of a reference from the validity of its certificate. A useful reference makes its residual accessible on whole time intervals and reproduces the singular start of the exact solution. Write \(g=D^\alpha h=F_u(h)\), so that \(h=I^\alpha g\). Substituting repeatedly into the Volterra form of (2.3) gives, as \(t\downarrow0\),
\[
g(t)=g_0+a_1t^\alpha+a_2t^{2\alpha}+O(t^{3\alpha}),\qquad g_0=-\tfrac12\left(u^2+\tfrac14\right),
\tag{4.1}
\]
with coefficients determined by the equation: writing \(\gamma_u=\tfrac12\rho\nu+i\rho\nu u\),
\[
b_1=\frac{g_0}{\Gamma(1+\alpha)},\quad a_1=\gamma_ub_1,\qquad
b_2=\frac{a_1\Gamma(1+\alpha)}{\Gamma(1+2\alpha)},\quad a_2=\gamma_ub_2+\tfrac12\nu^2b_1^2 .
\tag{4.2}
\]
The identity \(I^\alpha t^\beta=\Gamma(1+\beta)\,t^{\alpha+\beta}/\Gamma(1+\alpha+\beta)\) controls each step. We therefore take the reference to be \(\widehat h=I^\alpha\widehat g\), where \(\widehat g\) consists of the three startup powers in (4.1) and a continuous piecewise affine remainder. The powers come from the equation, and the affine part can be integrated against the fractional kernel in closed form. Its nodal values may come from any numerical solver, of any accuracy: Theorem 3.1 charges whatever residual results.

All stored nodes and coefficients are read as the exact dyadic numbers they are. The residual \(r=\widehat g-F_u(I^\alpha\widehat g)\) then includes every discrepancy between the stored coefficients and their ideal values. Appendix D.1 bounds it on the startup interval and on every later closed cell, and verifies \(\operatorname{Re}\widehat h\le0\) on the whole of \([0,T]\). The certificate belongs to the continuous trajectory: the residual is bounded on every closed cell, between the nodes as well as at them.

### 4.2. Transform disks and the price bound

Let \(\eta_n\) bound the exponent error at the frequency \(u_n\), obtained from (3.8). Since \(|\phi_T(u-\tfrac i2)|\le1\) on the Lewis contour, the reference transform \(\widehat\phi_n=e^{\widehat L_T(u_n)}\) satisfies
\[
\left|\phi_T(u_n-\tfrac i2)-\widehat\phi_n\right|\le\min\{1,|\widehat\phi_n|\}\left(e^{\eta_n}-1\right)=:\epsilon_n .
\tag{4.3}
\]
The passage from the integral (2.5) to a finite sum has three remainders. The first is the trapezoidal rule on the whole axis, which converges geometrically because the integrand is analytic in a strip.

**Theorem 4.1 (strip quadrature).** Let \(S\) be a positive martingale, \(0<a_*<\tfrac12\) and \(h_*>0\). Replacing the integral in (2.5) by the infinite trapezoidal sum with step \(h_*\) changes the normalised price by at most
\[
\epsilon_{\rm grid}=\frac{\sqrt m\,e^{a_*|k|}}{(\tfrac12-a_*)\left(e^{2\pi a_*/h_*}-1\right)} .
\tag{4.4}
\]

The second is the tail of the sum beyond the last node. Comparing \(-\operatorname{Re}h\) from below with the solution of a scalar equation gives an envelope \(|\phi_T(u-\tfrac i2)|\le e^{-c_Vu}\) for \(u\ge V\), with an explicit \(c_V>0\) built from the same forward variance weights, and hence a tail bound \(\epsilon_{\rm tail}\) for the exact transform (Appendix D.2). The third is arithmetic. With the finite sum
\[
\widehat c_N=1-\frac{h_*\sqrt m}{\pi}\left(2\operatorname{Re}\widehat\phi_0+\sum_{n=1}^N\frac{\operatorname{Re}(e^{-iu_nk}\widehat\phi_n)}{u_n^2+\frac14}\right),\qquad u_n=nh_*,
\tag{4.5}
\]
the complete price bound for one strike is
\[
|c-\widehat c_N|\le\frac{h_*\sqrt m}{\pi}\left(2\epsilon_0+\sum_{n=1}^N\frac{\epsilon_n}{u_n^2+\frac14}\right)+\epsilon_{\rm grid}+\epsilon_{\rm tail}+\epsilon_{\rm arithmetic} .
\tag{4.6}
\]
The coefficient at the origin is the trapezoidal half-weight times \(1/(\tfrac14)\). A node at which no reference value is computed is given the reference value zero and the radius supplied by the envelope of the exact transform, so every part of the frequency axis is charged exactly once.

## 5. Portfolios: transform error as a common factor

This section uses the model through formula (2.5) alone. Its statements hold for every positive martingale \(S\), every reference transform and every set of radii: for the Heston, Bates and Lévy models as for rough volatility, and for a transform that comes from a closed form, a differential-equation solver, a neural network or the residual bound of Section 3.

### 5.1. The joint error set

Fix the model, the maturity and the frequency grid, and consider \(p\) strikes with moneyness \(m_i\) and log-moneyness \(k_i\). From (4.5), the reference prices are \(\bar c_i=1+\operatorname{Re}\sum_na_{in}\bar\phi_n\) with
\[
a_{in}=-\frac{h_*\omega_n\sqrt{m_i}}{\pi}\,\frac{e^{-iu_nk_i}}{u_n^2+\frac14},\qquad\omega_0=\tfrac12,\quad\omega_n=1\ (n\ge1),
\tag{5.1}
\]
and the exact prices satisfy
\[
c^*-\bar c=\operatorname{Re}\sum_{n=0}^Na_{\cdot n}z_n+r,\qquad z_n=\phi_T(u_n-\tfrac i2)-\bar\phi_n,\quad r\in\mathcal R,
\tag{5.2}
\]
where \(\mathcal R\) contains the strip, tail and arithmetic remainders. The same complex number \(z_n\) enters every strike. The \(z_n\) are deterministic unknowns, each confined to a disk.

For a portfolio \(w\in\mathbb R^p\) define its payoff transform
\[
\widehat w(u)=\sum_{i=1}^pw_i\sqrt{m_i}\,e^{-iuk_i},\qquad\text{so that}\qquad
\sum_iw_ia_{in}=-\frac{h_*\omega_n}{\pi}\,\frac{\widehat w(u_n)}{u_n^2+\frac14} .
\tag{5.3}
\]
Up to normalisation, \(\widehat w(u)/(u^2+\tfrac14)\) is the Fourier transform on the Lewis contour of the payoff \(\sum_iw_i(S_T-K_i)^+\). A portfolio of options with one expiry is a single European payoff, and its transform is the sum of the transforms of its legs.

**Theorem 5.1 (joint error set).** Suppose (5.2) holds with \(|z_n|\le\epsilon_n\) and \(\mathcal R\) compact and convex. Let
\[
\mathcal E=\left\{\operatorname{Re}\sum_na_{\cdot n}z_n:\ |z_n|\le\epsilon_n\right\}+\mathcal R,\qquad d=\bar c-c^{\rm fast}.
\tag{5.4}
\]
Then \(c^*-c^{\rm fast}\in d+\mathcal E\), and for every \(w\in\mathbb R^p\) the support function of this set is
\[
h_{d+\mathcal E}(w)=w^\top d+\frac{h_*}\pi\sum_{n=0}^N\omega_n\,\epsilon_n\,\frac{|\widehat w(u_n)|}{u_n^2+\frac14}+h_{\mathcal R}(w).
\tag{5.5}
\]
Consequently \(DF_T\,|w^\top(c^*-c^{\rm fast})|\le DF_T\max\{h_{d+\mathcal E}(w),h_{d+\mathcal E}(-w)\}\).

**Proof.** Substituting the actual errors in (5.2) gives the inclusion. The image of the disk \(|z|\le\epsilon\) under the real-linear map \(z\mapsto\operatorname{Re}(bz)\) has support \(\epsilon|b|\), attained at \(z=\epsilon\bar b/|b|\). The disks are independent, supports add under Minkowski sums, and (5.3) identifies \(b=\sum_iw_ia_{in}\). Translation by \(d\) adds \(w^\top d\). \(\square\)

Geometrically, each frequency contributes an ellipse to \(\mathcal E\), the image of a disk under \(z\mapsto\operatorname{Re}(a_{\cdot n}z)\), and \(\mathcal E\) is the sum of these ellipses and the remainder. Bounding each price separately replaces this body by its bounding box, whose support is
\[
h_{\rm box}(w)=\frac{h_*}\pi\sum_{n=0}^N\omega_n\,\epsilon_n\,\frac{\sum_i|w_i|\sqrt{m_i}}{u_n^2+\frac14}+\sum_i|w_i|\rho_i
\tag{5.6}
\]
when \(\mathcal R=\prod_i[-\rho_i,\rho_i]\). We call (5.5) the joint bound and (5.6), with the same signed centre \(w^\top d\), the leg-by-leg bound. All numerical evaluations of either are outward enclosures.

Any separately proved interval for a price can be intersected with \(\bar c+\mathcal E\), since the exact vector lies in both sets. Every comparison of the two bounds in Section 7 uses one centre, one set of radii and one remainder, so that the aggregation is the only difference.

### 5.2. The netting ratio

The two bounds differ only through the factor multiplying each \(\epsilon_n\). Define the netting ratio of \(w\) at the frequency \(u\) by
\[
\chi_w(u)=\frac{|\widehat w(u)|}{\sum_i|w_i|\sqrt{m_i}}\in[0,1].
\tag{5.7}
\]
The node term of the joint bound is the node term of the leg-by-leg bound with each frequency multiplied by \(\chi_w(u_n)\). By the equality case of the triangle inequality, \(\chi_w(u)=1\) exactly when the numbers \(w_ie^{-iuk_i}\) with \(w_i\ne0\) share one argument, so the joint bound is strictly smaller as soon as one node of positive radius sees two legs out of phase.

**Proposition 5.2 (spreads and butterflies).** Let the strikes form a geometric ladder with log-moneyness \(k,k+\Delta,\dots,k+j\Delta\), and let \(w\) be the \(j\)-th difference, with weights \((-1)^i\binom ji\). Then
\[
\chi_w(u)=\left(\tanh^2\tfrac\Delta4+\operatorname{sech}^2\tfrac\Delta4\,\sin^2\tfrac{u\Delta}2\right)^{j/2}\le\left(\tfrac\Delta2\sqrt{u^2+\tfrac14}\right)^j .
\tag{5.8}
\]
For the vertical spread (\(j=1\)) the ratio equals \(\tanh(\Delta/4)\) at \(u=0\) and reaches one exactly at the odd multiples of \(\pi/\Delta\). The butterfly (\(j=2\)) has the square of the ratio of the spread.

**Proof.** With \(\zeta=e^{(1/2-iu)\Delta}\) the payoff transform is \(\sqrt m\,e^{-iuk}(1-\zeta)^j\) and the gross weight is \(\sqrt m\,(1+e^{\Delta/2})^j\). Then \(|1-\zeta|^2=(e^{\Delta/2}-1)^2+4e^{\Delta/2}\sin^2(u\Delta/2)\), and division by \((1+e^{\Delta/2})^2\) gives the equality. The inequality uses \(\tanh x\le x\), \(\operatorname{sech}x\le1\) and \(|\sin x|\le|x|\). \(\square\)

The proposition gives the hierarchy of exposures. A single call loads on the transform error at the frequency \(u\) with weight \((u^2+\tfrac14)^{-1}\). A vertical spread of width \(\Delta\) loads with weight at most \(\Delta\,(u^2+\tfrac14)^{-1/2}\), and a butterfly with weight at most \(\Delta^2\) at every frequency, in units of \(h_*\sqrt m\,(1+e^{\Delta/2})^j/(2^j\pi)\). Each difference in strike removes one power of the frequency from the decay of the payoff transform and returns one power of the strike spacing. This is the error form of the Breeden and Litzenberger (1978) relation: a butterfly reads off the state-price density, and its error is the unweighted sum of the transform errors.

The proposition also locates the frequencies that matter. A spread is hedged against transform error whose wavelength in log-strike, \(2\pi/u\), is long compared with its width, and it is fully exposed at the Nyquist frequency \(u=\pi/\Delta\), where the two legs respond in opposite phase. For strikes 100 points apart near 4400, \(\Delta\approx0.0225\) and \(\pi/\Delta\approx140\). For a five-point vertical, the finest spacing commonly listed near the money, \(\pi/\Delta\approx2800\). A narrow spread is protected over a band of frequencies that is inversely proportional to its width.

For portfolios that are not differences the ratio is governed by concentration.

**Proposition 5.3 (the Herfindahl law).** Let the log-strikes \(k_i\) be distinct and put \(\ell_i=w_i\sqrt{m_i}\). Then
\[
\lim_{U\to\infty}\frac1U\int_0^U\chi_w(u)^2\,du=\frac{\sum_i\ell_i^2}{\left(\sum_i|\ell_i|\right)^2} .
\tag{5.9}
\]

**Proof.** Expand \(|\widehat w(u)|^2=\sum_{i,j}\ell_i\ell_je^{-iu(k_i-k_j)}\). The diagonal terms sum to \(\sum_i\ell_i^2\) and each off-diagonal term has mean zero over long intervals. \(\square\)

The right side of (5.9) is the Herfindahl index of the position, the reciprocal of its effective number of strikes. Its square root is \(1/\sqrt2\approx0.707\) for a two-leg spread, \(\sqrt6/4\approx0.612\) for a butterfly with weights \((1,-2,1)\), and \(1/\sqrt p\) for an equal-weight basket of \(p\) strikes. At the origin, in contrast, \(\chi_w(0)=|\sum_i\ell_i|/\sum_i|\ell_i|\) measures the net position. The two regimes have familiar names. Error at low frequency moves all strikes together; it is systematic, and it is removed by hedging. Error at high frequency moves neighbouring strikes independently; it is idiosyncratic, and it is removed by diversification. A long-only basket is fully exposed to the first and almost immune to the second, and a tight spread is the reverse. Figure 2 shows the three profiles.

![Figure 2. Netting ratios of an adjacent call spread, an adjacent butterfly and an equal-weight basket of twelve calls on the strike ladder of Section 7, with the Herfindahl levels of Proposition 5.3. The shaded profile is the share of the leg-by-leg node charge carried by each frequency in the six-month certificate.](../figures/netting-ratio.png)

The centre \(w^\top d\) in (5.5) obeys the same logic from the other side. It is the known displacement of the stored output from the reference, and for a smooth approximation it is smooth in strike: it cancels in spreads and accumulates in baskets. Section 7.4 finds both effects in the data.

### 5.3. The calibration objective is a portfolio

Calibration compares model prices with quotes \(M_i\) through a least-squares objective
\[
J(c)=\frac1{2p}\sum_{i=1}^p(c_i-M_i)^2 .
\]
Its numerical error is a portfolio error. For the exact prices \(c^*=\bar c+e\) with \(e\in\mathcal E\),
\[
J(c^*)-J(\bar c)=g^\top e+\frac{|e|^2}{2p},\qquad g=\frac{\bar c-M}{p},
\]
so to first order the objective is exposed to the transform error as the portfolio whose weights are the pricing residuals.

**Proposition 5.4 (objective enclosure).** If \(e\in\mathcal E\) and \(|e_i|\le\beta_i\) for each \(i\), then
\[
J(\bar c)-h_{\mathcal E}(-g)\ \le\ J(c^*)\ \le\ J(\bar c)+h_{\mathcal E}(g)+\frac1{2p}\sum_i\beta_i^2 .
\tag{5.10}
\]

**Proof.** The lower bound drops the nonnegative quadratic term and uses \(g^\top e\ge-h_{\mathcal E}(-g)\); the upper bound uses \(g^\top e\le h_{\mathcal E}(g)\) and \(|e|^2\le\sum_i\beta_i^2\). \(\square\)

The residuals of a reasonable fit change sign across strikes, so the calibration portfolio is long some strikes and short others, and its support under (5.5) is smaller than under (5.6). For a finite set of candidate parameters, a candidate is the certified minimiser when the upper end of its enclosure lies below the lower ends of all the others; in general the candidates whose lower end lies below the smallest upper end form a set that contains every exact minimiser. Each candidate carries its own transform and its own error set.

## 6. The stored output

The certificate applies to any stored vector of prices once its displacement from the reference is enclosed. In the experiments the stored output is the third-order rational approximation of Gatheral and Radoičić (2019), which writes the Riccati solution as \(\widehat H(y)=P(y)/Q(y)\) in the variable \(y=\nu t^\alpha\), with cubic \(P\) and \(Q=1+q_1y+q_2y^2+q_3y^3\), and fixes the six coefficients by matching three terms of the expansion at \(t=0\) and three terms of the expansion at infinity. The formula costs a handful of operations per frequency. Its coefficients are complex, and on the parameter set of Section 7 the absence of poles on the positive axis is a theorem.

**Proposition 6.1 (structure of the rational output).** For \(\alpha\in[\tfrac{13}{25},\tfrac35]\), \(\rho=-0.7445\), \(\nu>0\) and every real \(u\), the matching system of Gatheral and Radoičić is nonsingular, and
\[
\operatorname{Re}q_j>0\ (j=1,2,3),\qquad\operatorname{Re}Q(y)\ge1\quad(y\ge0),\qquad\operatorname{Re}\widehat H(y)<0\quad(y>0).
\tag{6.1}
\]

The proof in Appendix B reduces (6.1) to the signs of nine real functions on a compact rectangle in \((\alpha,u/(1+u))\) and verifies them by interval arithmetic on a finite cover. The conclusion is stable under small changes of \(\rho\), since all nine inequalities are strict. The proposition shows that the stored output is well defined and shares the half-plane of the exact solution. Its accuracy is the business of the reference: one construction supplies the price, and an independent one bounds its error.

## 7. Evidence from S&P 500 options

### 7.1. Data and market scale

The quotes are the bid and ask implied volatilities of twelve SPX options with six months to expiry, strikes 3700 to 4800 in steps of 100, recorded on 18 June 2021 and published by Jeng and Kiliçman (2021). We use the index level 4221.86 of that data set as the forward, with zero carry, and convert each implied volatility to a call price by the Black–Scholes formula in exact arithmetic. Table 1 gives the result in index points. One point is 100 dollars per contract.

**Table 1. Six-month SPX call quotes of 18 June 2021 in index points: bid, ask and quoted width.**

| Strike | Bid | Ask | Width | Strike | Bid | Ask | Width |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 3700 | 586.40 | 588.70 | 2.30 | 4300 | 140.00 | 141.50 | 1.50 |
| 3800 | 502.10 | 504.50 | 2.40 | 4400 | 91.10 | 92.40 | 1.30 |
| 3900 | 420.20 | 422.60 | 2.40 | 4500 | 55.00 | 56.20 | 1.21 |
| 4000 | 341.70 | 344.20 | 2.50 | 4600 | 31.60 | 32.60 | 0.99 |
| 4100 | 267.79 | 270.19 | 2.40 | 4700 | 17.90 | 18.80 | 0.90 |
| 4200 | 199.69 | 202.20 | 2.51 | 4800 | 10.30 | 11.10 | 0.80 |

The 4400–4500 call spread is worth about 36.1 points at mid-market, and a trader who crosses both legs pays up to 2.5 points of spread. These are the magnitudes against which a numerical error should be judged. An error of a quarter point is a fifth of the quoted width of the 4400 call, and a tenth of the width of the spread.

The model parameters are those fitted to this surface by Jeng and Kiliçman (2021): \(\nu=0.2897\), \(\rho=-0.7445\), and the forward variance curve
\[
\xi(t)=\theta+(V_0-\theta)\,E_{\alpha_0}\left(-\lambda_\xi t^{\alpha_0}\right),\qquad(\alpha_0,V_0,\theta,\lambda_\xi)=(0.5286,\,0.0262,\,0.0721,\,0.5037).
\tag{7.1}
\]
The curve rises from an instantaneous volatility of about 16 per cent towards a long-run level of about 27 per cent. It is nondecreasing, hence admissible, and it is held fixed when the roughness index \(\alpha\) of the kernel in (2.1) is varied. The damping rate of Theorem 3.1 is \(\lambda_*=\tfrac12|\rho|\nu\approx0.108\).

The stored output is the rational approximation of Section 6 evaluated in binary64, with its own quadrature. The reference of Section 4 uses the Fourier step \(h_*=\tfrac18\), a grid through \(u=128\) (1,025 nodes) and 100-bit outward dyadic arithmetic. Three ingredients of the certificate vary across the experiments: the propagation of the residual, either a uniform bound on the state or Theorem 3.1 with one global residual maximum or with 128 time bins; the band on which the reference transform is computed, \(u\le64\) or \(u\le128\), nodes above the band receiving the envelope radius; and the maturity. Appendix E lists the configurations, which carry the labels H0–H4 at six months, Q0–Q2 at three months, and N1, N2 and N2L for the freshly generated nearby fields.

### 7.2. What the forward variance weight buys

Table 2 follows the complete bound for one position, long the 4400 call and short the 4500 call, as the certificate is refined. Every row keeps the stored output, the signed centre, all finite frequencies, the strip, the exact tail and the arithmetic.

**Table 2. Complete certificates for the unit 4400–4500 call spread, in index points.**

| Maturity and certificate | Joint bound | Leg-by-leg bound | Tolerance met |
|---|---:|---:|---|
| H0: six months, uniform state bound | 1.397612096 | 2.679930311 | none |
| H1: six months, Theorem 3.1, global residual | 0.378598956 | 0.476401716 | 1/2 point, both |
| H2: six months, Theorem 3.1, 128 time bins | 0.367258782 | — | 1/2 point |
| H3: six months, reference through 128, upper band global | 0.132245064 | 0.158585551 | 1/4 point, both |
| H4: six months, reference through 128, 128 bins | 0.115215934 | 0.137896018 | 1/4 point, both |
| Q0: three months, reference through 64, global | 1.207557898 | 1.545191542 | none |
| Q1: three months, reference through 128, global | 0.351318692 | 0.408293698 | 1/2 point, both |
| Q2: three months, reference through 128, 128 bins | 0.233318843 | 0.252393939 | 1/4 point, joint only |

The step from H0 to H1 changes one thing. Both rows use the same residuals of the same reference trajectories. H0 bounds the state error uniformly in time and multiplies by the total mass of the kernel \(q\); H1 applies (3.5), which weights each residual by the forward variance that remains. The complete bound falls by 72.91 per cent. Extending the reference from \(u\le64\) to \(u\le128\) (H2 to H3, Q0 to Q1) replaces envelope radii by certified ones and moves the centre, from about \(-0.167\) to \(-0.082\) points at six months, so that step combines a smaller uncertainty with a different displacement.

Table 3 isolates the propagation on a second bank, generated independently at \(N_t=2048\) time cells, with everything else held fixed. The last two rows use identical binwise residual envelopes and differ only in the kernel, \(\xi\) against \(\xi^{\lambda_*}\).

**Table 3. Matched propagation on bank N2L for the six-month 4400–4500 spread, in index points.**

| Propagation | Stored output, leg-by-leg | Stored output, joint | Reference returned, joint | Node radius of used nodes |
|---|---:|---:|---:|---:|
| Uniform state bound | 3.690877564 | 1.829428107 | 1.662665889 | 1.476801373 |
| (3.5) with \(\xi\), global residual | 0.589267065 | 0.428570987 | 0.261808769 | 0.075944253 |
| (3.8) with \(\xi\), 128 bins | 0.514096070 | 0.394999331 | 0.228237113 | 0.042372598 |
| (3.8) with \(\xi^{\lambda_*}\), 128 bins | 0.509733613 | 0.393082828 | 0.226320610 | 0.040456094 |

The forward variance weight accounts for almost all of the improvement: the node radius falls from 1.477 to 0.076 points. Time-local envelopes take it to 0.042. The leverage damping of Proposition 3.2 removes a further 4.5 per cent of the node radius, in line with \(\lambda_*T^\alpha\approx0.075\) at this horizon; its effect grows with maturity and with \(|\rho|\nu\). The complete bound for the stored output moves less, because the fixed terms dominate it: the centre, the omitted finite nodes and the remainders together exceed 0.352 points on this bank. The next gain therefore lies in the reference band, and extending it is what takes H2 to H4 in Table 2.

### 7.3. A decision that turns on netting

At three months a single global residual maximum certifies half a point (Q1). With 128 time bins (Q2) the bound reaches the quarter-point tolerance, and there the aggregation decides. Table 4 is the ledger of Q2. The two columns share the stored output, the reference centre, all 1,025 node radii and every remainder.

**Table 4. Ledger of the three-month 4400–4500 spread (Q2), in index points. Only the aggregation of the node errors differs.**

| Component | Joint | Leg-by-leg |
|---|---:|---:|
| Absolute centre \(|w^\top d|\) | 0.149775147 | 0.149775147 |
| Node support, 1,025 nodes | 0.045461793 | 0.064536890 |
| Strip remainder | 0.000026654 | 0.000026654 |
| Exact infinite tail | 0.038055248 | 0.038055248 |
| Reference arithmetic | \(4.1\times10^{-16}\) | \(4.1\times10^{-16}\) |
| Complete bound | 0.233318843 | 0.252393939 |

Netting lowers the node term by 30 per cent and the complete bound by 7.56 per cent, from above a quarter point to below it. Nothing else changed.

Proposition 5.2 predicts where the saving comes from. Here \(\Delta=\log(4500/4400)=0.02247\), and the stored ratio of the joint to the leg-by-leg coefficient at each of the 1,025 nodes agrees with (5.8) to fifteen digits. Table 5 splits the node term by frequency.

**Table 5. Node term of the three-month spread by frequency band, in index points.**

| Band of \(u\) | Nodes | Joint | Leg-by-leg | Ratio | Share of leg-by-leg charge |
|---|---:|---:|---:|---:|---:|
| 0 to 16 | 128 | 0.000074 | 0.000529 | 0.139 | 0.8% |
| 16 to 32 | 128 | 0.001158 | 0.004100 | 0.282 | 6.4% |
| 32 to 64 | 256 | 0.010559 | 0.020137 | 0.524 | 31.2% |
| 64 to 96 | 256 | 0.017651 | 0.022785 | 0.775 | 35.3% |
| 96 to 128 | 257 | 0.016020 | 0.016986 | 0.943 | 26.3% |

Below \(u=16\) the spread keeps 14 per cent of its leg-by-leg error, and near the top of the grid, which approaches the Nyquist frequency \(\pi/\Delta\approx140\), it keeps 94 per cent. The certified radii grow with the frequency, so nine tenths of the charge sits above \(u=32\), where a spread of this width is poorly hedged. The saving of 30 per cent is what a 100-point spread can extract from an error concentrated at short wavelengths.

A narrower spread extracts more. Table 6 evaluates the node term of (5.5) and (5.6) with the same 1,025 radii for verticals of other widths struck at 4400. The radii do not depend on the strike, so the table is a statement about the same certified transform.

**Table 6. Node term of a three-month vertical spread struck at 4400, by width, with the certified radii of Q2; index points.**

| Width in points | Nyquist frequency | Joint | Leg-by-leg | Ratio |
|---:|---:|---:|---:|---:|
| 5 | 2766 | 0.002711 | 0.064193 | 0.042 |
| 10 | 1384 | 0.005414 | 0.064211 | 0.084 |
| 25 | 555 | 0.013403 | 0.064265 | 0.209 |
| 50 | 278 | 0.025925 | 0.064356 | 0.403 |
| 100 | 140 | 0.045462 | 0.064537 | 0.704 |
| 200 | 71 | 0.052476 | 0.064895 | 0.809 |
| 400 | 36 | 0.044482 | 0.065601 | 0.678 |

For the five-point vertical the joint node term is about a twenty-fourth of the leg-by-leg term. The joint term grows in proportion to the width while the Nyquist frequency lies beyond the grid, and levels off once it enters. Figure 3 shows the geometry behind Table 4: the joint error set of the two prices and its bounding box.

![Figure 3. The node error set of the three-month 4400 and 4500 calls (Q2) and its bounding box, in index points. The width of the set in the direction of the spread is the joint node support of Table 4; the box gives the leg-by-leg support.](../figures/joint-error-set.png)

### 7.4. Twenty-eight positions

The six-month experiment fixes 28 portfolio directions on the twelve strikes before any bound is computed (Table 7), and keeps their weights as stated. Table 7 also reports, for bank H1 at \(\alpha=0.52\), how much of the leg-by-leg node term each family keeps and the mean absolute centre.

**Table 7. The 28 fixed positions, with node netting and centre on bank H1 at \(\alpha=0.52\). The netting ratio is the joint node term divided by the leg-by-leg node term.**

| Family | Weights | Count | Netting ratio, min–mean–max | Herfindahl level | Mean centre, points |
|---|---|---:|---:|---:|---:|
| Adjacent spreads | \(e_i-e_{i+1}\) | 11 | 0.649–0.708–0.771 | 0.707 | 0.108 |
| Adjacent butterflies | \(e_i-2e_{i+1}+e_{i+2}\) | 10 | 0.449–0.524–0.608 | 0.612 | 0.071 |
| Wide spreads | \(e_0-e_3,\ e_3-e_6,\ e_6-e_9,\ e_0-e_{11}\) | 4 | 0.474–0.570–0.651 | 0.707 | 0.235 |
| Equal-weight baskets | twelve, lower six, upper six strikes | 3 | 0.076–0.156–0.221 | 0.289, 0.408 | 0.344 |

The adjacent spreads keep 0.708 of their leg-by-leg node error on average, against the Herfindahl level 0.707 of a two-leg position. The butterflies keep 0.524. The baskets keep least of all: an equal-weight position in all twelve calls keeps 0.076 of its leg-by-leg node error, because three quarters of the node charge of this bank sits between \(u=64\) and \(u=96\), where twelve strikes spread over a quarter of a unit of log-moneyness respond out of phase. The centre runs the other way. The stored rational output lies above the reference at every strike, by 0.04 points at the ends of the ladder and by up to 0.65 points near the money. A displacement of one sign cancels in part in spreads and butterflies and accumulates in baskets, where it makes up 0.344 of a complete bound of 0.356 points. The approximation error of the stored formula is systematic across strikes and the uncertainty of the certificate is idiosyncratic, as Section 5.2 anticipated, and the joint bound accounts for each correctly.

Table 8 counts the positions certified at three tolerances. Within a row the two methods use identical radii.

**Table 8. Positions certified out of 28 on bank H1, by tolerance in index points.**

| Roughness \(\alpha\) | Tolerance | Leg-by-leg | Joint |
|---|---:|---:|---:|
| 0.52 | 1/4 | 0 | 2 |
| 0.52 | 1/2 | 13 | 28 |
| 0.52 | 1 | 28 | 28 |
| 0.60 | 1/4 | 1 | 10 |
| 0.60 | 1/2 | 22 | 28 |
| 0.60 | 1 | 28 | 28 |
| 0.90 | 1/4 | 13 | 20 |
| 0.90 | 1/2 | 25 | 25 |
| 0.90 | 1 | 27 | 28 |

At half a point and \(\alpha=0.52\) the joint bound certifies every position and the leg-by-leg bound certifies 13. Netting decides whenever the tolerance is of the order of the bound, which is the case for a tolerance set inside the bid–ask spread. All 28 positions are certified from one bank: once the transform disks exist, an additional position costs 1,025 support terms. Figure 4 shows the count as a function of the tolerance for the three candidates, and Appendix E.3 gives the exact thresholds.

![Figure 4. Number of the 28 fixed six-month positions certified as a function of the tolerance, on bank H1 for three roughness candidates, from exact endpoints. The shaded area between the joint and the leg-by-leg count is the gain from netting.](../figures/pass-counts.png)

### 7.5. Is the roughness ranking numerical?

The roughness fitted to this surface is \(H=0.0286\), and candidates a few thousandths apart in \(H\) produce prices that differ by fractions of an index point. Whether a calibration can tell them apart depends on the accuracy of the pricer. We test five candidates, \(\alpha\in\{0.520,0.525,0.530,0.540,0.550\}\), with the curve (7.1), the quotes and all other parameters fixed. The design was set in advance: every candidate receives a freshly generated reference field and a complete residual bank at \(N_t=1024\), and all five are regenerated at \(N_t=2048\) if any pair remains unresolved. The objective is the normalised least-squares distance to the mid prices, enclosed by Proposition 5.4.

**Table 9. Objective enclosures for five roughness candidates, as \(J\times10^8\), and the number of the ten pairs strictly separated.**

| \(\alpha\) | \(H\) | \(N_t=1024\), joint | \(N_t=2048\), joint |
|---:|---:|---:|---:|
| 0.520 | 0.020 | [4.825094, 6.778350] | [5.293449, 6.024095] |
| 0.525 | 0.025 | [5.645378, 7.501414] | [6.097920, 6.798485] |
| 0.530 | 0.030 | [6.748974, 8.517584] | [7.187004, 7.859529] |
| 0.540 | 0.040 | [9.807435, 11.422182] | [10.218707, 10.839486] |
| 0.550 | 0.050 | [14.000658, 15.482012] | [14.387007, 14.960680] |
| Pairs separated, joint | | 7 of 10 | 10 of 10 |
| Pairs separated, leg-by-leg | | 3 of 10 | 7 of 10 |

At the finer level the five enclosures are disjoint and ordered, and \(\alpha=0.520\) is the certified minimiser on this grid. The closest pair, 0.520 against 0.525, is separated by a gap of \(7.4\times10^{-10}\) in the normalised objective. The leg-by-leg enclosures leave three pairs unresolved at the same level, those among 0.520, 0.525 and 0.530. The ordering of roughness candidates half a hundredth apart in \(H\) is therefore a certified property of the model and the quotes.

### 7.6. Model misfit without solver doubt

A certificate also settles the opposite question. Each of the five candidates is inconsistent with at least one quoted bid–ask band, and for a certified price this is a statement about the model. At \(\alpha=0.52\), on the coarsest bank H0, the exact model price of the 4400 call lies in an interval whose lower end is 92.887 points, while the quoted ask is 92.396: the model is above the ask by at least 0.491 points. For the 4500 call the excess is at least 0.068 points. At the other ten strikes the certified interval meets the quoted band. A desk that sees its rough Heston calibration miss the 4400 and 4500 strikes on this date can rule out the pricer as the cause.

### 7.7. Auditing an output or replacing it

A stored-output certificate serves the audit of a pricing library or of a valuation that has already been reported. When the output may be replaced and the reference is available, returning the reference is the natural alternative. Table 10 compares the two on bank N2L, together with a reimplementation of the modified Adams scheme of Boyarchenko, de Innocentis and Levendorskii (2025). All rows share the model, the spread, the reference centre, the node radii and the remainders.

**Table 10. Stored and replaceable outputs for the six-month 4400–4500 spread on bank N2L, in index points.**

| Output | Joint bound | Leg-by-leg bound | Quarter point, joint |
|---|---:|---:|---|
| Stored rational output | 0.394999331 | 0.514096070 | not certified |
| Reference returned in binary64 | 0.228237113 | 0.347333852 | certified |
| Stored output plus stored correction | 0.228237113 | 0.347333852 | certified |
| Modified Adams, 512 steps | 0.229082759 | 0.348179497 | certified |
| Modified Adams, 1024 steps | 0.228534686 | 0.347631424 | certified |

The reference and the corrected output are certified to a quarter point by the joint bound, and the leg-by-leg bound certifies none of the five outputs. The Adams outputs lie within 0.001 points of the reference, so that more than 99.6 per cent of their bound is the uncertainty of the reference itself: at this resolution the scheme is as accurate as the reference can tell.

## 8. Conclusion

The construction follows the valuation map. The Riccati equation determines the state and, through its invariant half-plane, the stability of errors. The forward variance curve determines what a residual costs. The payoff determines which transform errors a position is exposed to. At each stage an absolute value taken too early would discard structure that the next stage can use, and the financial content of the paper lies in what that structure is: the weight on a residual is expected variance under a share-tilted measure, and the weight on a transform error is the Fourier transform of the payoff.

The results reach beyond the example. Section 5 is model-free: the payoff transform, the netting ratio and the Herfindahl law govern the numerical error of every pricer built on a common transform, whatever the model and whatever the method behind the transform. Theorem 3.1 holds on every damped contour and, by Remark 3.6, for Volterra Heston models with completely monotone kernels, the classical and the lifted Heston models included. The damping it uses is the frequency-independent part \(\tfrac12|\rho|\nu\); the exact solution supplies more, increasing with the frequency, which is where the radii of Table 5 are largest. For a trading desk, a validation team or a supervisor the consequence is practical: the numerical component of valuation uncertainty can be bounded, attributed to frequencies, and netted across a book exactly as the payoffs net.

The [online article](https://github.com/130U/certified-rough-heston-valuation/blob/main/ARTICLE.md), the scientific source and the verification commands accompany the paper. All 27 numerical banks are identified by size and SHA-256 in `SCIENTIFIC-MANIFEST.json`. `verify_source.py` checks the publication identities. `reproduce.py` reads the saved banks and reconstructs the prices, objectives and decisions downstream of them; `--full` also recomputes the structural-sign cover of Proposition 6.1. Appendix E and `COMMANDS.md` distinguish the generators, the readers and the arithmetic they share.

## Appendix A. Rescaled variables, model and transform

### A.1. Rescaled variables

The appendices use a rescaled state in which the quadratic coefficient of the Riccati equation is one half. With \(h\) the solution of (2.3), put
\[
x=\nu^{1/\alpha}t,\qquad y=x^\alpha=\nu t^\alpha,\qquad H(x)=\nu h(t),\qquad Z(t)=\nu h(t),
\tag{A.1}
\]
\[
b=\tfrac12\left(u^2+\tfrac14\right),\qquad s_0=\kappa-\tfrac\rho2,\qquad d=-s_0+i\rho u,\qquad F(z)=-b+dz+\tfrac12z^2 .
\tag{A.2}
\]
Here \(\kappa\ge0\) allows a mean-reversion term \(-\nu\kappa h\) in the Riccati polynomial; the model (2.1) has \(\kappa=0\), and then \(F(\nu h)=F_u(h)\), \(D^\alpha_xH=F(H)\) and \(D^\alpha_tZ=\nu F(Z)\). The exact trajectory is the solution of the Volterra equation
\[
H(x)=\frac1{\Gamma(\alpha)}\int_0^x(x-s)^{\alpha-1}F(H(s))\,ds .
\tag{A.3}
\]
A reference \(\widehat Z=\nu\widehat h\) has the residual \(r_Z=D^\alpha\widehat Z-\nu F(\widehat Z)=\nu r\), and \(\delta_F=\nu^{-1}\sup|r_Z|=\sup|r|\). The exponent is \(L_T=\nu^{-1}\int_0^T\xi(T-t)D^\alpha Z(t)\,dt\), and the damping rate of Theorem 3.1 is \(\lambda=\nu\sigma\) with \(\sigma=s_0-\epsilon_R/2\) when \(\operatorname{Re}\widehat Z\le\epsilon_R\). We write \(\xi_*\) for the curve (7.1) and \(q_\alpha\) for the function \(q\) of (2.7). The Caputo derivative is also written \(D_C^\alpha\), with a subscript \(x\) or \(t\) when the variable needs to be named.

### A.2. Admissibility and the affine transform

We verify the hypotheses of Abi Jaber and El Euch (2019a) for the fractional kernel and the curve (7.1). Theorem 2.1, Example 2.2 and Theorem 2.3 below are those of that paper, and condition H2 and Table 1 are those of its appendix.

For \(K_\alpha=t^{\alpha-1}/\Gamma(\alpha)\),
\[
\int_0^hK_\alpha^2dt=
\frac{h^{2\alpha-1}}{(2\alpha-1)\Gamma(\alpha)^2},\quad
\int_0^T(K_\alpha(t+h)-K_\alpha(t))^2dt
\le\frac{h^{2\alpha-1}}{\Gamma(\alpha)^2}
\int_0^\infty[(r+1)^{\alpha-1}-r^{\alpha-1}]^2dr.
\tag{A.4}
\]
The exponent in the latter integral is \(2\alpha-2>-1\) at zero and \(2\alpha-4<-1\) at infinity, so the integral is finite. The resolvent of the first kind,
\[
\mathcal L_\alpha(dt)=t^{-\alpha}dt/\Gamma(1-\alpha),\quad
K_\alpha*\mathcal L_\alpha=1
\tag{A.5}
\]
is verified by the Beta identity and is nonnegative and nonincreasing. The completely monotone spectral measure
\[
\mu_\alpha(dx)=x^{-\alpha}dx/
[\Gamma(\alpha)\Gamma(1-\alpha)]
\tag{A.6}
\]
gives \(K_\alpha(t)=\int e^{-xt}\mu_\alpha(dx)\). Under \(r=xh\), the two spectral integrals in H2 become constants times \(h^{\alpha-1}\) and \(h^{\alpha-1/2}\), respectively. The remaining constants
\(\int(1\wedge r^{-1/2})r^{-\alpha}dr\) and
\(\int r^{-\alpha-1/2}(1\wedge r)dr\) are finite for \(.5<\alpha<1\). Table 1 therefore covers the required shifted-kernel conditions.

The curve (7.1) is nondecreasing, has a nonnegative initial value, and is locally Hölder with exponent \(\alpha_0=.5286\). On \(\alpha\in[.52,.9]\), the kernel has \(\gamma/2=\alpha-.5\le.4<\alpha_0\). Hence the curve-class assumptions in Example 2.2(i) hold, and Theorem 2.1 gives a nonnegative continuous weak variance solution and moment bounds. The equivalent kernel input is
\[
b_\alpha(t)=D_C^\alpha\xi_*(t)=I^{1-\alpha}\xi_*'(t)\ge0,\quad
b_\alpha(t)=
\frac{(\theta-V_0)\lambda_\xi}{\Gamma(1+\alpha_0-\alpha)}
t^{\alpha_0-\alpha}+O(t^{2\alpha_0-\alpha})
\tag{A.7}
\]
Its worst exponent is \(-.3714>-.5\), so it belongs to \(L^2_{\rm loc}\); also \(\xi_*=V_0+K_\alpha*b_\alpha\). The nonnegative input measure meets Example 2.2(ii). This verifies the model specification with a varying kernel and fixed forward variance curve.

Theorem 2.3 requires \(\operatorname{Re}\psi_1\in[0,1]\), a second-state initial transform with nonpositive real part, and a variance forcing term with nonpositive real part. Taking \(\psi_1=ia=1/2+iu\) and zero for the other initial and forcing terms gives (2.3), (2.4) and uniqueness in law. With \(\psi_1=1\), the Riccati solution is zero and \(\mathbb E S_T=S_0\) follows. A positive local martingale with constant expectation is a true martingale. Thus the strip of analyticity used in Theorem 4.1 follows from the model.

## Appendix B. The rational output

### B.1. Matching algebra and proof of Proposition 6.1

Set \(S=s_0-i\rho u=-d\), take the principal square root in \(A=\sqrt{S^2+2b}\), and let \(R=A-S\). The three short-time and long-time coefficients are respectively
\[
b_1=-\frac b{\Gamma(1+\alpha)},\quad
b_2=\frac{Sb}{\Gamma(1+2\alpha)},\quad
b_3=\frac{\Gamma(1+2\alpha)}{\Gamma(1+3\alpha)}
       (d b_2+b_1^2/2),
\tag{B.1}
\]
\[
g_0=-R,\quad g_1=\frac R{A\Gamma(1-\alpha)},\quad
g_2=-\frac R{A^2\Gamma(1-2\alpha)}
       +\frac{R^2}{2A^3\Gamma(1-\alpha)^2}.
\tag{B.2}
\]
For \(1/2<\alpha<1\), \(\Gamma(1-2\alpha)\) is finite and negative. The two-endpoint construction of Gatheral and Radoičić (2019) requires
\[
\widehat H(y)=P(y)/Q(y),\quad
Q=1+q_1y+q_2y^2+q_3y^3,
\]
\[
\widehat H=b_1y+b_2y^2+b_3y^3+O(y^4),\quad
\widehat H=g_0+g_1y^{-1}+g_2y^{-2}+O(y^{-3}).
\tag{B.3}
\]
These six conditions give the linear system
\[
\begin{pmatrix}g_0&g_1&g_2\\b_1&-g_0&-g_1\\
b_2&b_1&-g_0\end{pmatrix}
\begin{pmatrix}q_1\\q_2\\q_3\end{pmatrix}
=\begin{pmatrix}b_1\\-b_2\\-b_3\end{pmatrix},
\quad p_1=b_1,\quad p_2=b_2+b_1q_1,\quad p_3=g_0q_3.
\tag{B.4}
\]
Equations (B.1)–(B.4) are the construction of Gatheral and Radoičić. We prove that the system is invertible, that the denominator has no zero on the positive axis and that the approximant stays in the left half-plane.

To avoid division by the matching determinant before proving its nonvanishing, define
\[
f=\Gamma(1+\alpha)^{-1},\quad p=\frac{\sin\pi\alpha}{\pi\alpha},
\quad v=-\cos\pi\alpha,\quad
m_\alpha=\frac{\Gamma(1+2\alpha)}{\Gamma(1+\alpha)^2},\quad
\zeta=\frac{\Gamma(1+2\alpha)\Gamma(1+\alpha)}{\Gamma(1+3\alpha)},
\]
\[
\mathsf M_2=Sb/m_\alpha,\quad
\mathsf c=\zeta(b^2/2-S^2b/m_\alpha),\quad
V=pR/A,\quad W=m_\alpha p v R/A^2+p^2R^2/(2A^3).
\tag{B.5}
\]
The reflection formula and recurrence relations give \(b_1=-fb,b_2=f^2\mathsf M_2,b_3=f^3\mathsf c\) and \(g_1=V/f,g_2=W/f^2\). In the latter two expressions, the factors \(f,f^2\) occur in the denominators. Direct expansion of the determinant and Cramer numerators of (B.4) gives
\[
\begin{aligned}
\Delta={}&b^2W+2bRV-\mathsf M_2RW-\mathsf M_2V^2-R^3,\\
F_1={}&b^2V+b\mathsf M_2W-bR^2+\mathsf M_2RV+\mathsf cRW+\mathsf cV^2,\\
F_2={}&-b^2R+b\mathsf M_2V+b\mathsf cW+\mathsf M_2^2W+\mathsf M_2R^2+\mathsf cRV,\\
F_3={}&-b^3+2b\mathsf M_2R-b\mathsf cV-\mathsf M_2^2V+\mathsf cR^2.
\end{aligned}
\tag{B.6}
\]
Here \(\Delta\) is exactly the determinant of the original system, and the numerators are \(N_j=f^jF_j\). After establishing \(\Delta\ne0\), we may define \(q_j=N_j/\Delta\), in which case
\[
\Delta P=-fb\Delta y+f^2(\mathsf M_2\Delta-bF_1)y^2-f^3RF_3y^3,\quad
\Delta Q=\Delta+fF_1y+f^2F_2y^2+f^3F_3y^3.
\tag{B.7}
\]
In physical time, the denominator coefficients are \(\nu^jq_j\); the normalised coefficients \(q_j\) retain their original definition.

**Proof of Proposition 6.1.** First take \(u\ge0\). Set
\[
\omega=\sqrt{u^2+1/4},\quad \eta=u/(1+u),\quad
j(\eta)=\sqrt{\eta^2+(1-\eta)^2/4},\quad s=-\rho/2,
\]
\[
\bar S=s(1-\eta+2i\eta)/j(\eta),\quad
\bar A=\sqrt{1+\bar S^2},\quad \bar R=(\bar A+\bar S)^{-1}.
\tag{B.8}
\]
Since \(j^2\ge1/5\), these functions are defined on the closed interval \(\eta\in[0,1]\). We have \(|\bar S|=|\rho|\) and
\[
\operatorname{Re}\bar A^2
=1-\rho^2+2(\operatorname{Re}\bar S)^2\ge1-\rho^2>0.
\]
The principal square root is continuous and lies in the first quadrant; \(\operatorname{Re}\bar A,|\bar A|>3/5\). The real part of the Hermitian product of two first-quadrant numbers is nonnegative. Hence
\[
|\bar A+\bar S|^2\ge|\bar A|^2+|\bar S|^2
\ge|\bar A^2-\bar S^2|=1,\quad
|\bar R|\le1,\quad\operatorname{Re}\bar R>0.
\]
Equation (B.8) expresses \(\bar A-\bar S\) in reciprocal form, with a denominator determined directly by the current parameters.

Substitute \(\bar b=1/2\) and (B.8) into (B.5)–(B.6) to obtain the barred original quantities. Homogeneity gives
\[
\Delta=\omega^3\bar\Delta,\qquad F_j=\omega^{3+j}\bar F_j.
\tag{B.9}
\]
Define three real functions
\[
\bar B_j=\operatorname{Re}(\bar F_j\overline{\bar\Delta}).
\tag{B.10}
\]
The interval cover of B.2 proves that, throughout the closed rectangle \([13/25,3/5]\times[0,1]\), \(\bar B_j>0\) and
\[
|\bar\Delta|^2\ge
\frac{88110801209184778874628745}{1267650600228229401496703205376}
>\frac1{14400}.
\tag{B.11}
\]
This first establishes \(\Delta\ne0\) and then yields
\(\operatorname{Re}q_j=(f\omega)^j\bar B_j/|\bar\Delta|^2>0\), proving the first assertion of (6.1). Since \(Q(y)=1+\sum_jq_jy^j\) with \(\operatorname{Re}q_j>0\), also \(\operatorname{Re}Q(y)\ge1\) for \(y\ge0\).

For the trajectory half-plane, the finite convolution in (B.7) gives
\[
|\Delta|^2\operatorname{Re}(P\overline Q)
=\sum_{n=1}^6 f^nD_ny^n,
\tag{B.12}
\]
\[
\begin{aligned}
D_1={}&-b|\Delta|^2,\\
D_2={}&\operatorname{Re}(\mathsf M_2)|\Delta|^2-2b\operatorname{Re}(F_1\overline\Delta),\\
D_3={}&\operatorname{Re}\{-RF_3\overline\Delta+
(\mathsf M_2\Delta-bF_1)\overline F_1-b\Delta\overline F_2\},\\
D_4={}&\operatorname{Re}\{-RF_3\overline F_1+
(\mathsf M_2\Delta-bF_1)\overline F_2-b\Delta\overline F_3\},\\
D_5={}&\operatorname{Re}\{-RF_3\overline F_2+
(\mathsf M_2\Delta-bF_1)\overline F_3\},\\
D_6={}&-\operatorname{Re}R\,|F_3|^2.
\end{aligned}
\tag{B.13}
\]
The same cover certifies the six compactified quantities \(\bar D_n<0\), with scaling \(D_n=\omega^{7+n}\bar D_n\). Set \(z=f\omega y\). The right-hand side of (B.12) is
\(\omega^7\sum_{n=1}^6\bar D_nz^n\) and is therefore strictly negative for every \(y>0\). Having proved that the denominator is nonzero, division by \(|Q|^2|\Delta|^2\) gives \(\operatorname{Re}\widehat H<0\). Negative frequencies follow by conjugate symmetry of the principal root and matching coefficients. The closed endpoint \(\eta=1\) represents the infinite-frequency limit, so the proof on the closed compactified domain covers every finite frequency. \(\square\)

### B.2. The interval cover

The certificate domain is \(\mathcal B=[13/25,3/5]\times[0,1]\). Every interval \(I=[\ell/2^{100},r/2^{100}]\) uses integer outward rounding. Rational inputs are rounded down and up; products take extrema over the four endpoint corners and are quantised. Reciprocals first exclude zero. Square roots use integer isqrt and an increment for the upper endpoint. Complex quantities use rectangular real–imaginary interval arithmetic. The analytic lower bounds in (B.8) fix the principal-root and reciprocal branches; no floating-point sign tolerance is used.

The four basic \(\alpha\)-dependent functions \(p,v,m_\alpha,\zeta\) satisfy
\[
p'<0,\quad v'>0,\quad
(\log m_\alpha)'=2[\psi(1+2\alpha)-\psi(1+\alpha)]>0,
\]
\[
(\log\zeta)'=2[\psi(1+2\alpha)-\psi(1+3\alpha)]
 +[\psi(1+\alpha)-\psi(1+3\alpha)]<0.
\tag{B.14}
\]
We have \(\psi'(x)=\sum_{n\ge0}(x+n)^{-2}>0\), and elementary trigonometric identities give the derivatives of \(p,v\). Strict endpoint values therefore enclose each continuous \(\alpha\) interval, without sampling \(\alpha\) at grid points.

The constant \(\pi\) is certified by Machin's identity and one hundred terms of each alternating arctangent series. The logarithm is reduced to \([1,2]\) and evaluated with one hundred positive atanh-series terms and a geometric tail. The exponential is reduced to \([0,1]\), evaluated with one hundred Taylor terms and a geometric tail, and restored by repeated rigorous squaring. For positive real Gamma arguments, recurrence first shifts to \(z\ge20\). Retaining \(B_2,\ldots,B_{20}\) in log Gamma gives the positive-real remainder bound
\[
0<R_{10}(z)<B_{22}/(22\cdot21z^{21}).
\tag{B.15}
\]
In Binet's positive integral, the ten-term geometric remainder of arctangent is positive and bounded by the first omitted power. Integration gives (B.15), consistent with the positive-real Stirling remainder in Olver et al. (2010). After exponentiation, divide successively by the recurrence factors. Sine and cosine retain thirty-two terms, with absolute Lagrange tails \(M^{65}/65!,M^{64}/64!\). Bernoulli numbers, factorials, and interval endpoints are exact rationals.

For each closed rectangle, substitute these enclosures successively into (B.8), (B.5), (B.6), (B.10), and (B.13). Accept only when the lower endpoints of all three \(\bar B_j\) are strictly positive and the upper endpoints of all six \(\bar D_n\) are strictly negative. Otherwise bisect one coordinate at its exact rational midpoint. The two closed children have the parent rectangle as their union, and strict enclosures also cover the shared boundary.

The finite covering contains 211241 leaf rectangles of total rational area exactly \(2/25\). An independent check reconstructs 422481 binary-tree nodes from the root, with maximum depth 19 and each recorded leaf occurring exactly once. In addition to the area check, this excludes missing subtrees, interior overlap, and endpoint gaps. The theorem uses the order interval covered by this complete closed tree.

The cover yields the following margins.

**Table B.1. Strict lower bounds on the compactified domain of the cover.**

| Quantity | Strict lower bound |
|---|---:|
| \(\bar B_1,\bar B_2,\bar B_3\) | \(1/6000,\ 1/8000,\ 1/20000000000\) |
| \(-\bar D_1,-\bar D_2,-\bar D_3\) | \(1/30000,\ 1/2000000000,\ 1/6000\) |
| \(-\bar D_4,-\bar D_5,-\bar D_6\) | \(1/8000,\ 1/15000000,\ 1/100000\) |
| \(|\bar\Delta|^2\) | \(1/14400\) |

The repository contains the interval implementation, all leaf rectangles and the check of the tree.

### B.3. Stability in the correlation

**Proposition B.1 (a neighbourhood of the calibrated correlation).** The conclusions of Proposition 6.1 hold for every \(\rho\in[-0.744501,-0.744499]\), at every real frequency and every positive time.

**Proof.** Retain the frequency compactification \(\eta=u/(1+u)\), \(0\le\eta\le1\), and the original unnormalized polynomials \(\Delta,F_j,B_j,D_j\). Write \(S_b=-\rho[(1-\eta)+2i\eta]/(2h)\), \(h^2=\eta^2+(1-\eta)^2/4\). Then \(|S_b|=|\rho|\), \(\operatorname{Re} S_b\ge0\) for negative \(\rho\), \(A^2=1+S_b^2\), and \(R=(A+S_b)^{-1}=A-S_b\). Throughout \(|\rho|\le3/4\), the square-root branch remains fixed because \(\operatorname{Re} A^2\ge1-\rho^2>0\). Consequently,

\[
|A|^{-1}\le8/5,\quad |A'|\le6/5,\quad
|(A^{-1})'|\le384/125,\quad |R|\le1,\quad |R'|\le11/5,
\tag{B.16}
\]

where primes denote real \(\rho\) derivatives. The identity \(|R|\le1\) follows from \(|A+S_b|^2\ge1\): the terms \(\operatorname{Re} A\,\operatorname{Re} S_b\) and \(\operatorname{Im} A\,\operatorname{Im} S_b\) are nonnegative, while \(|A|^2=|1+S_b^2|\ge1-|S_b|^2\). Also \(\operatorname{Re} R>0\), since \((\operatorname{Re} A)^2-(\operatorname{Re} S_b)^2=(|1+S_b^2|+1-|S_b|^2)/2>0\).

For the \(\alpha\)-dependent scalars of Proposition 6.1, exact outward endpoint enclosures give

\[
0<p\le2/3,\quad0\le v\le1/3,\quad
1\le m\le3/2,\quad0<\zeta\le2/3.
\tag{B.17}
\]

Here \(p\) decreases and \(v,m\) increase on the stated interval, while \(\zeta\) decreases. The gamma-ratio assertions follow from the increasing digamma function; \(m\ge1\) also follows from log convexity of \(\Gamma\). None depends on \(\rho\).

Apply product-rule modulus bounds to the original polynomial formulas. For every \((\alpha,\eta)\), the resulting exact rational constants \(L_{B,j},L_{D,j}\) satisfy

\[
|\partial_\rho B_j|\le L_{B,j},\qquad
|\partial_\rho D_j|\le L_{D,j}.
\tag{B.18}
\]

They are assembled using pairs \((M,N)\), meaning \(|f|\le M\), \(|f'|\le N\), with addition \((M_1+M_2,N_1+N_2)\) and multiplication \((M_1M_2,N_1M_2+M_1N_2)\). This yields a finite rational derivation.

Let \(m_{B,j}(C),m_{D,j}(C)\) be the exact original sign lower bounds on a continuous \((\alpha,\eta)\) cell \(C\) at \(\rho_0=-1489/2000\). A cell is certified throughout the target correlation interval whenever all bounds

\[
m_{B,j}(C)-10^{-6}L_{B,j}>0,\qquad
m_{D,j}(C)-10^{-6}L_{D,j}>0
\tag{B.19}
\]

hold. By the mean-value theorem the test is sufficient. It certifies 182002 original leaves and 79758 finer leaves. For the remaining cells, directly evaluate the original complex polynomial formulas with \(\rho\), \(\alpha\) and \(\eta\) all interval valued. Exact outward dyadic arithmetic certifies strict \(B_j>0\) and \(D_j<0\) on 19808 additional closed cells.

The original complete midpoint tree and the exact local splice trees verify that these 281568 cells cover the entire \((\alpha,\eta)\) rectangle without gaps or interior overlap. Their exact area is \(2/25\); each cell carries the entire correlation interval, giving exact three-dimensional volume \(1/6250000\). Hence the raw signs hold for every point of the stated domain. In particular \(\Delta\ne0\), the normalized denominator coefficients have positive real part, and all real numerator coefficients of the half-plane test are negative. The algebraic implication of B.1 gives the conclusions of Proposition 6.1, including \(\eta=1\), the infinite-frequency limit. Conjugacy supplies negative frequencies. \(\square\)

A separate reader checks every saved sign, the 422481-node partition tree, the local refinements, the derivative majorants and all 19808 direct cells through separately assembled Cramer matrices and numerator convolutions; it shares the dyadic primitives with the generator. The interval is the one covered by the stored computation, which confirms stability at the calibrated value.

## Appendix C. Propagation proofs

### C.1. Regularity, convexity and the uniform state bound

If \(H=I^\alpha F(H)\) is a bounded local continuous solution, then \(H,F(H)\) are \(\alpha\)-Hölder continuous. For \(\alpha>1/2\), write \(q=F(H)\). Cancellation gives the derivative formula
\[
H'(x)=\frac{q(x)x^{\alpha-1}}{\Gamma(\alpha)}
 +\frac{\alpha-1}{\Gamma(\alpha)}
\int_0^x(x-t)^{\alpha-2}[q(t)-q(x)]\,dt.
\tag{C.1}
\]
The bound 

\[
|H'(x)|\le\frac{\|q\|_\infty x^{\alpha-1}}{\Gamma(\alpha)}+\frac{(1-\alpha)[q]_{C^\alpha}x^{2\alpha-1}}{\Gamma(\alpha)(2\alpha-1)}.
\tag{C.2}
\]

is integrable at zero. Positive-time continuity and the limit from truncated intervals establish absolute continuity on the closed interval. The near-endpoint exponent satisfies \(2\alpha-2>-1\); the other endpoint and the first term are integrable. Thus \(H\in AC\) and it is locally \(C^1\) at positive times. Local existence follows from Volterra contraction on a bounded ball. For \(v\in AC\) that is locally Lipschitz at positive times, integration by parts gives
\[
D_C^\alpha v(x)=\frac1{\Gamma(1-\alpha)}
\left\{\frac{v(x)-v(0)}{x^\alpha}
 +\alpha\int_0^x\frac{v(x)-v(t)}{(x-t)^{1+\alpha}}\,dt\right\}.
\tag{C.3}
\]
At a positive maximum over the full history, with zero initial value, this derivative is strictly positive. Consequently, \(D_C^\alpha v+s v\le D_C^\alpha w+s w\), \(v(0)=w(0)\), and \(s\ge0\) imply \(v\le w\). For a convex \(C^1\) function \(\Phi\) on the real plane, apply the supporting-hyperplane inequality to both terms in (C.3) to obtain
\[
D_C^\alpha\Phi(v)\le\nabla\Phi(v)\cdot D_C^\alpha v.
\tag{C.4}
\]
This Caputo history-convexity inequality follows from the supporting-hyperplane inequality. Li and Liu (2018, Proposition 3.11) prove it under their regularity assumptions; Lemma C.3 below proves the form needed here.

**Lemma C.1.** Suppose \(\alpha\in(1/2,1),|\rho|\le1,s_0\ge0\). The normalised equation has a unique global solution, and \(\operatorname{Re}H(x)<0\) for \(x>0\). If \(s_0>0\), then
\[
|H(x)|\le\frac b{s_0}[1-E_\alpha(-s_0x^\alpha)]
\le\min\{b/s_0,bx^\alpha/\Gamma(1+\alpha)\}.
\tag{C.5}
\]
When \(s_0=0\), the latter time-dependent bound remains valid.

**Proof.** Write \(H=X+iY\). Completing the square gives
\[
\operatorname{Re}F(H)
=-\frac18-\frac{1-\rho^2}{2}u^2
-\frac12(Y+\rho u)^2-s_0X+\frac12X^2.
\tag{C.6}
\]
If \(X\) first reaches a small positive level \(\varepsilon<1/2\), the derivative in (C.3) is positive, whereas (C.6) is negative, a contradiction. Thus \(X\le0\). Reaching zero at a positive time gives the same contradiction, proving strict negativity.

Let \(\psi_\epsilon(z)=\sqrt{|z|^2+\epsilon^2}-\epsilon\). Equation (C.4), together with
\[
\operatorname{Re}(\overline H F(H))
=-bX-s_0|H|^2+\tfrac12X|H|^2,\quad
\frac{|H|^2}{\sqrt{|H|^2+\epsilon^2}}\ge\psi_\epsilon(H),
\]
gives \(D_C^\alpha\psi_\epsilon(H)+s_0\psi_\epsilon(H)\le b\). Compare with the zero-initial-value linear scalar equation and let \(\epsilon\downarrow0\) to obtain (C.5). The scalar solution is verified directly by the Mittag–Leffler series. If finite-time blow-up occurred, (C.5) would bound the trajectory, \(F(H)\), and a uniform Hölder constant. The history integral would have a finite limit at that endpoint, and local contraction with the previously accumulated history as forcing would extend the solution, a contradiction. Successive Volterra contractions give uniqueness. \(\square\)

In the variables of (2.3) this is Proposition 2.1.

**Theorem C.2 (dissipative residual bound).** Suppose \(s_0>0\), \(\widehat H(0)=0\), and \(\widehat H\in AC\), with local Lipschitz regularity at positive times. Assume, for every \(x\in(0,X]\), that
\[
\operatorname{Re}\widehat H\le\epsilon_R<2s_0,\qquad
|D_C^\alpha\widehat H-F(\widehat H)|\le\delta,
\]
Set \(\sigma=s_0-\epsilon_R/2>0\). Then
\[
|H-\widehat H|
\le\frac\delta\sigma[1-E_\alpha(-\sigma x^\alpha)]
\le\delta/\sigma.
\tag{C.7}
\]
In particular, for a trajectory in the left half-plane, one may take \(\epsilon_R=0,\sigma=s_0\). The bound holds for every \(\delta\) and every \(u\).

**Proof.** The error \(e=H-\widehat H\) satisfies
\[
D_C^\alpha e=\left(d+\frac{H+\widehat H}{2}\right)e-r,\quad e(0)=0,\quad
\operatorname{Re}\left(d+\frac{H+\widehat H}{2}\right)\le-\sigma.
\]
Apply (C.4) to \(\psi_\epsilon(e)\) to obtain
\(D_C^\alpha\psi_\epsilon(e)+\sigma\psi_\epsilon(e)\le|r|\le\delta\).
Comparison with the linear scalar solution, followed by \(\epsilon\downarrow0\), proves the claim. Convex regularisation includes points of zero error and applies to the complex error viewed as a vector in the real plane. \(\square\)

If \(\widehat H\) corresponds to the physical-time trajectory \(\widehat Z\) and \(|r_t|/\nu\le\delta_F\) has been certified, the same result gives
\[
\sup_{t\le T}|Z-\widehat Z|\le\delta_F/s_0
\quad\text{if }\operatorname{Re}\widehat Z\le0.
\tag{C.8}
\]
In the numerical example, \(s_0=1489/4000\). Appendix D.1 supplies the residual \(\delta_F\).

Li and Liu (2018, Proposition 3.11(ii)) give Caputo convexity by regularization and a distributional limit; their Proposition 4.12 treats specified vector gradient and Hamiltonian flows. Kopteva (2022, Lemma 2.8 and Theorem 2.2) uses norm convexity and a positive fractional inverse under positive-time Lipschitz hypotheses. The following lemma proves the vector \(AC\) form needed here, including the terminal-time conclusion.

**Lemma C.3 (AC convexity and the continuous endpoint).** Let \(0<\alpha<1\), \(T>0\), \(v\in AC([0,T];\mathbb R^d)\), and let \(\Phi\in C^1(\mathbb R^d)\) be convex. With \(D_C^\alpha v=g_{1-\alpha}*v'\),
\[
D_C^\alpha\Phi(v)\le \nabla\Phi(v)\cdot D_C^\alpha v
\quad\text{a.e. on }(0,T).
\tag{C.9}
\]
Let \(u\in AC[0,T]\), \(u(0)=0\), \(\lambda\ge0\), and \(R\in L^\infty(0,T)\) be nonnegative. If \(D_C^\alpha u+\lambda u\le R\) almost everywhere, then
\[
u(t)\le(k_\lambda*R)(t),\qquad 0\le t\le T,
\quad k_\lambda(t)=t^{\alpha-1}E_{\alpha,\alpha}(-\lambda t^\alpha).
\tag{C.10}
\]

**Proof.** Choose smooth \(f_n\to v'\) in \(L^1(0,T)\), and set \(v_n(t)=v(0)+\int_0^t f_n(s)\,ds\). Then \(v_n(0)=v(0)\), \(v_n\to v\) uniformly, and \(v_n'\to v'\) in \(L^1\). For a smooth path, integration by parts expresses the difference between the two sides of (C.9) as

\[
\frac{1}{\Gamma(1-\alpha)}\left[
\frac{B_\Phi(v_n(0),v_n(t))}{t^\alpha}
+\alpha\int_0^t\frac{B_\Phi(v_n(s),v_n(t))}{(t-s)^{1+\alpha}}\,ds
\right]\ge0,
\tag{C.11}
\]

where \(B_\Phi(a,b)=\Phi(a)-\Phi(b)-\nabla\Phi(b)\cdot(a-b)\ge0\). Smooth paths are locally Lipschitz. A gradient bound \(M\) on the compact path range and a local path Lipschitz constant \(L\) give \(B_\Phi(v_n(s),v_n(t))\le2ML|t-s|\). The endpoint kernel \((t-s)^{-\alpha}\) is therefore integrable. The supporting-hyperplane inequality may first be integrated with history truncated at \(t-\delta\), and the classical Caputo integrals converge as \(\delta\downarrow0\).

All path ranges lie in one compact set. Continuity of \(\nabla\Phi\) and the ordinary \(AC\) composition rule give

\[
\|\Phi(v_n)' - \Phi(v)'\|_1\to0,
\qquad
\|D_C^\alpha(v_n-v)\|_1
\le\frac{T^{1-\alpha}}{\Gamma(2-\alpha)}\|v_n'-v'\|_1\to0.
\tag{C.12}
\]

The same convolution estimate applies to \(\Phi(v_n)-\Phi(v)\). Moreover, the products \(\nabla\Phi(v_n)\cdot D_C^\alpha v_n\) converge in \(L^1\) to the corresponding product for \(v\). Passing to an almost-everywhere convergent subsequence proves (C.9). This uses the ordinary composition rule for the first derivative inside \(AC\).

For (C.10), put \(f=D_C^\alpha u+\lambda u\in L^1(0,T)\). The zero initial value gives \(u+\lambda g_\alpha*u=g_\alpha*f\). The locally convergent resolvent series, whose \(n\)-th term has \(L^1(0,T)\) norm bounded by \(\lambda^{n-1}T^{n\alpha}/\Gamma(1+n\alpha)\), gives \(u=k_\lambda*f\) almost everywhere. Complete monotonicity of \(E_{\alpha,\alpha}(-x)\) (Simon 2015) supplies \(k_\lambda\ge0\), so \(f\le R\) implies \(u\le k_\lambda*R\) almost everywhere. The convolution on the right is continuous: extend \(k_\lambda\) and \(R\) by zero, and use \(L^1\) translation continuity of the kernel with the \(L^\infty\) bound on \(R\). Its value at zero is zero. Since \(u\) is continuous, an almost-everywhere inequality extends to every point of \([0,T]\), including maturity. \(\square\)

### C.2. Proof of Proposition 2.2 and Theorem 3.1

In the variables of A.1 put \(Z=\nu h\) and \(\widehat Z=\nu\widehat h\). Then \(D^\alpha Z=\nu F(Z)\), the residual of \(\widehat Z\) is \(r_Z=\nu r\) with envelope \(R_Z=\nu R\), \(\operatorname{Re}\widehat Z\le\nu\varepsilon=\epsilon_R\), and \(\lambda=\nu(s_0-\epsilon_R/2)\). Write \(V_0=\xi(0)\). We prove
\[
|Z-\widehat Z|\le k_\lambda*R_Z,\qquad
|L_T-\widehat L_T|\le\nu^{-1}(q_\alpha*k_\lambda*R_Z)(T)\le\nu^{-1}(\xi*R_Z)(T),
\]
which are (3.4) and (3.5) after division by \(\nu\). The identities for \(q_\alpha\) established on the way are Proposition 2.2.

**Proof.** For \(e=Z-\widehat Z\), the divided difference gives \(D_C^\alpha e=\nu[d+(Z+\widehat Z)/2]e-r_Z\), with coefficient real part at most \(-\lambda\). Apply Lemma C.3 to \(v_\varepsilon=(|e|^2+\varepsilon^2)^{1/2}-\varepsilon\). Since \(\nabla v_\varepsilon\cdot e=|e|^2/(|e|^2+\varepsilon^2)^{1/2}\ge v_\varepsilon\) and \(|\nabla v_\varepsilon|\le1\),

\[
D_C^\alpha v_\varepsilon+\lambda v_\varepsilon\le R_Z\quad\text{a.e.}
\tag{C.13}
\]

Equation (C.10) and the limit \(\varepsilon\downarrow0\) yield the first state inequality at every time. Absolute Fubini gives \(I^{1-\alpha}\xi=V_0g_{2-\alpha}+g_{2-\alpha}*\xi'\), whose derivative is (2.7), and \(g_\alpha*q_\alpha=\xi\). In particular, \(q_\alpha\in L^1\) and \(\xi\ge0\). Writing \(A_\alpha=I^{1-\alpha}\xi\), another absolute Fubini step followed by \(AC\) integration by parts gives

\[
L_T-\widehat L_T
=\nu^{-1}\int_0^TA_\alpha(T-t)e'(t)\,dt
=\nu^{-1}(q_\alpha*e)(T).
\tag{C.14}
\]

The first Fubini integral is bounded by \(\|\xi\|_\infty T^{1-\alpha}\|e'\|_1/\Gamma(2-\alpha)\); the boundary terms vanish because \(A_\alpha(0)=e(0)=0\). Positivity now proves the first exponent estimate. Finally, \(g_\alpha-k_\lambda=\lambda g_\alpha*k_\lambda\ge0\), whence

\[
0\le q_\alpha*k_\lambda
=\xi-\lambda\xi*k_\lambda\le\xi.
\tag{C.15}
\]

Associativity and nonnegative integration yield the remaining conclusions. \(\square\)

The proof covers \(\lambda=0\), where the resolvent is \(g_\alpha\).

### C.3. Admissible curves and closed-form bounds

Assumption 2.3 asks for \(q_\alpha\ge0\) and leaves the sign of \(\xi'\) free. For a real curve \(\xi\in AC[0,T]\) with \(\xi(0)=V_0\ge0\) it reads

\[
q_\alpha=V_0g_{1-\alpha}+g_{1-\alpha}*\xi'\ge0
\quad\text{a.e.},\qquad g_\beta(t)=t^{\beta-1}/\Gamma(\beta).
\tag{C.16}
\]

The function \(A_\alpha=I^{1-\alpha}\xi=V_0g_{2-\alpha}+g_{2-\alpha}*\xi'\) is absolutely continuous with \(A_\alpha(0)=0\), and

\[
\|q_\alpha\|_1\le
\frac{T^{1-\alpha}}{\Gamma(2-\alpha)}(V_0+\|\xi'\|_1),
\qquad g_\alpha*q_\alpha=\xi.
\tag{C.17}
\]

The second identity holds for signed \(\xi'\) by Fubini's theorem and \(g_\alpha*g_{1-\alpha}=g_1\). For a curve whose \(q_\alpha\) changes sign, the proof of Theorem 3.1 gives

\[
|L_T-\widehat L_T|\le\nu^{-1}\left(|q_\alpha|*k_\lambda*R_Z\right)(T),
\tag{C.18}
\]

and for an admissible curve the kernel collapses to \(\xi^\lambda\le\xi\).

**Corollary C.4 (a decreasing curve).** Let \(V_0>0\), \(c>0\), and \(\xi(t)=V_0(1-ct)\). Then
\[
q_\alpha(t)=\frac{V_0t^{-\alpha}}{\Gamma(1-\alpha)}
\left(1-\frac{ct}{1-\alpha}\right).
\tag{C.19}
\]
Thus (C.16) holds on \((0,T)\) if and only if \(cT\le1-\alpha\), including equality. In that case \(\xi(T)\ge\alpha V_0>0\) despite \(\xi'<0\).

**Proof.** Convolving the constant derivative \(-V_0c\) with \(g_{1-\alpha}\) gives \(-V_0c\,t^{1-\alpha}/\Gamma(2-\alpha)\). Adding the initial term and using \(\Gamma(2-\alpha)=(1-\alpha)\Gamma(1-\alpha)\) proves (C.19). Its bracket is nonnegative exactly under the stated condition. \(\square\)

For \(1-\alpha<cT<1\) the curve stays positive while \(q_\alpha\) is negative near maturity, so positivity of the curve is weaker than (C.16).

**Corollary C.5 (constant curve).** Under the hypotheses of Theorem 3.1 with \(\sigma>0\), let \(\xi\equiv V_0\ge0\). Then
\[
q_\alpha*k_\lambda=V_0E_\alpha(-\lambda t^\alpha),\qquad
|L_T-\widehat L_T|\le
\frac{V_0}{\nu}\int_0^T
E_\alpha(-\lambda(T-s)^\alpha)R(s)\,ds.
\tag{C.20}
\]
If \(R\le\nu\delta_F\), a closed-form upper bound is
\[
\eta_{\rm ML}=V_0\delta_F T E_{\alpha,2}(-\nu\sigma T^\alpha)
\le\min\left\{
V_0\delta_F T,
\frac{V_0\delta_F T^{1-\alpha}}{\nu\sigma\Gamma(2-\alpha)}
\right\}.
\tag{C.21}
\]

**Proof.** Termwise convolution in the absolutely locally integrable Mittag–Leffler series gives \(g_{1-\alpha}*k_\lambda=E_\alpha(-\lambda t^\alpha)\); termwise integration gives \(\int_0^T E_\alpha(-\lambda t^\alpha)dt=T E_{\alpha,2}(-\lambda T^\alpha)\). Equation (C.15) gives \(0\le E_\alpha\le1\), proving the first comparison. Also \(\int_0^tk_\lambda=(1-E_\alpha(-\lambda t^\alpha))/\lambda\le1/\lambda\). The state envelope \(|e|\le\delta_F/\sigma\), followed by the positive \(q_\alpha\) integral, proves the second comparison. \(\square\)

**Proposition C.6 (an error radius without a half-plane for the reference).** Assume \(s_0>0\), \(0\le\delta_F<s_0^2/2\), \(D_C^\alpha Z=\nu F(Z)\), \(\operatorname{Re} Z\le0\), and \(|D_C^\alpha\widehat Z-\nu F(\widehat Z)|\le\nu\delta_F\) almost everywhere. The exact and approximate trajectories are AC, locally Lipschitz at positive times, and have the same zero initial value. Then
\[
|Z-\widehat Z|\le E_\delta
=s_0-\sqrt{s_0^2-2\delta_F}
=\frac{2\delta_F}{s_0+\sqrt{s_0^2-2\delta_F}}.
\tag{C.22}
\]

**Proof.** Rewrite the error terms as \((d+Z)e-e^2/2\). The exact-solution half-plane gives
\(D_t^\alpha|e|\le\nu(-s_0|e|+|e|^2/2+\delta_F)\), interpreted through the same convex regularisation of the modulus. Choose any \(E_\delta<\ell<s_0+\sqrt{s_0^2-2\delta_F}\). The right-hand side is strictly negative at \(|e|=\ell\); a first hitting time of \(\ell\) contradicts (C.3). Letting \(\ell\downarrow E_\delta\) proves the result. \(\square\)

The reference trajectories of Section 7 have a certified half-plane and use (C.8), which holds without the threshold of (C.22).

### C.4. The uniform-state exponent bound

For the curve (7.1), \(\xi_*\in AC\), \(\xi_*'\ge0\), and \(V_0\le\xi_*\le\theta\). Positivity of the scalar resolvent follows from the negative-minimum principle in (C.3), or from the completely monotone representation of Simon (2015). Define
\[
A_\alpha(t)=(I^{1-\alpha}\xi_*)(t),\quad
q_\alpha(t)=A_\alpha'(t)
=\frac{V_0t^{-\alpha}}{\Gamma(1-\alpha)}+I^{1-\alpha}\xi_*'(t)\ge0.
\tag{C.23}
\]
Both initial exponents \(-\alpha,\alpha_0-\alpha\) exceed \(-1\), so \(q_\alpha\in L^1(0,T)\). Explicitly,
\[
q_\alpha(t)=\frac{V_0t^{-\alpha}}{\Gamma(1-\alpha)}
 +(\theta-V_0)\lambda_\xi t^{\alpha_0-\alpha}
 E_{\alpha_0,1+\alpha_0-\alpha}(-\lambda_\xi t^{\alpha_0}),
\tag{C.24}
\]
\[
A_\alpha(t)=\frac{\theta t^{1-\alpha}}{\Gamma(2-\alpha)}
 +(V_0-\theta)t^{1-\alpha}
 E_{\alpha_0,2-\alpha}(-\lambda_\xi t^{\alpha_0}),\quad A_\alpha(0)=0.
\tag{C.25}
\]
where \(E_{a,b}(z)=\sum_{n=0}^\infty z^n/\Gamma(an+b)\).

**Theorem C.7 (uniform-state exponent bound).** For a zero-initial-value AC trajectory \(Z,\widehat Z\), use the derivative-based exponent
\[
L_T=\nu^{-1}\int_0^T\xi_*(T-t)D_t^\alpha Z(t)\,dt,\quad
\bar L_T=\nu^{-1}\int_0^T\xi_*(T-t)D_t^\alpha\widehat Z(t)\,dt,
\]
Then
\[
L_T-\bar L_T=\nu^{-1}\int_0^Tq_\alpha(T-t)(Z-\widehat Z)(t)\,dt.
\tag{C.26}
\]
In particular, if \(\sup|Z-\widehat Z|\le E\), then
\[
|L_T-\bar L_T|\le\eta=E A_\alpha(T)/\nu
\le\frac{E\theta T^{1-\alpha}}{\nu\Gamma(2-\alpha)}.
\tag{C.27}
\]

**Proof.** Since \(D_t^\alpha v=I^{1-\alpha}v'\), absolute Fubini changes the exponent integral into
\(\nu^{-1}\int_0^TA_\alpha(T-t)v'(t)\,dt\).
Integration by parts, using \(A_\alpha(0)=v(0)=0\), yields the positive-kernel representation. Absolute Fubini is justified by \(v'\in L^1\) and the continuous, finite curve. Then \(q_\alpha\ge0\) and \(\int q_\alpha=A_\alpha(T)\) give the estimate. \(\square\)

If \(\widehat Z=I^\alpha\bar G\), then \(\bar L=\nu^{-1}\int\xi_*\bar G\) is exactly this derivative-based exponent, and all exponents computed here are of this form.

Using \(\operatorname{Re}L_T\le0\) and the integral identity for the exponential, whenever (C.27) holds,
\[
|e^{L_T}-e^{\bar L_T}|
\le\min\{1,e^{\operatorname{Re}\bar L_T}\}(e^\eta-1).
\tag{C.28}
\]
The first estimate is based at the exact exponent; the second is based at the approximate exponent. Their minimum is a valid bound. The state error may increase with frequency, while decay of the approximate transform under the pricing weight can compensate for part of that increase.

If a model-transform envelope \(B(u)\) and an approximate-modulus bound \(\widehat B(u)\) are also available, then
\[
|e^{L_T}-e^{\bar L_T}|
\le\min\{B+\widehat B,\ \eta(B+\widehat B)/2\}.
\tag{C.29}
\]

The first bound is the triangle inequality. The second follows from
\((L_T-\bar L_T)\int_0^1e^{(1-\tau)\bar L_T+\tau L_T}d\tau\)
and the convexity bound \(e^{(1-\tau)a+\tau b}\le(1-\tau)e^a+\tau e^b\). Since (C.28) and (C.29) refer to the same approximate transform, the smaller of their radii is valid.

### C.5. The damped kernel and its cumulative weights

Write \(K_\lambda=q_\alpha*k_\lambda=\xi^\lambda\); at \(\lambda=0\) the resolvent is \(g_\alpha\) and \(K_0=\xi\).

**Proposition C.8 (cumulative-weight series).** Suppose
\(0<\alpha,A_0<1\), \(0\le V_0\le\theta\), and the fixed curve is
\(\xi(t)=\theta+(V_0-\theta)E_{A_0}(-\lambda_\xi t^{A_0})\), with \(\lambda_\xi\ge0\). Assume \(q_\alpha\ge0\). For \(\lambda\ge0\) and \(\lambda T^\alpha<1\), (3.9) holds on \([0,T]\). If it is truncated before index \(M\), the entire omitted outer series satisfies
\[
\left|W_\lambda(t)-\sum_{n=0}^{M-1}(-\lambda)^nW_n(t)\right|
\le
\frac{\theta t(\lambda t^\alpha)^M}{1-\lambda t^\alpha},
\quad
W_n(t)=\int_0^t(\xi*g_{n\alpha})(s)\,ds.
\tag{C.30}
\]
Here \(g_0\) denotes the identity convolution, so \(W_0(t)=\int_0^t\xi\).

**Proof.** The resolvent identity \(k_\lambda+\lambda g_\alpha*k_\lambda=g_\alpha\), together with \(q_\alpha*g_\alpha=\xi\), gives
\(K_\lambda+\lambda g_\alpha*K_\lambda=\xi\). The Neumann series has terms
\((- \lambda)^n(\xi*g_{n\alpha})\). Since \(0\le\xi\le\theta\),

\[
0\le W_n(t)\le
\frac{\theta t^{1+n\alpha}}{\Gamma(2+n\alpha)}
\le\theta t(t^\alpha)^n.
\tag{C.31}
\]

Log convexity and \(\Gamma(1)=\Gamma(2)=1\) imply that \(\Gamma\) is increasing and at least one on \([2,\infty)\). Every outer denominator argument is \(2+n\alpha\ge2\). Thus the sum of the \(L^1(0,T)\) norms of the absolute terms is bounded by the convergent geometric series in (C.31). This justifies convolution, integration and interchange, proves the Volterra identity and its unique resolvent solution, and gives (C.30) with the first omitted index exactly \(n=M\).

For uniqueness, the difference \(h\in L^1(0,T)\) of two solutions satisfies \(h=-\lambda g_\alpha*h\). Iterating gives \(\|h\|_1\le\lambda^nT^{n\alpha}\|h\|_1/\Gamma(1+n\alpha)\). For sufficiently large \(n\), the Gamma argument is at least two, and the right-hand factor is at most \((\lambda T^\alpha)^n\), which tends to zero. Thus \(h=0\).

Expanding the curve Mittag–Leffler function, and using the beta convolution identity, gives

\[
W_n(t)=t^{1+n\alpha}
\left[
\frac{\theta}{\Gamma(2+n\alpha)}
+(V_0-\theta)\sum_{m=0}^{\infty}
\frac{(-\lambda_\xi t^{A_0})^m}
{\Gamma(2+n\alpha+mA_0)}
\right].
\tag{C.32}
\]

When \(w=\lambda_\xi t^{A_0}<1\), every inner denominator also has argument at least two, and its tail before index \(L\) is bounded by

\[
\left|\sum_{m=L}^{\infty}
\frac{(-w)^m}{\Gamma(2+n\alpha+mA_0)}\right|
\le \frac{w^L}{1-w}.
\tag{C.33}
\]

The tails are absolute enclosures. The actual curve and damping satisfy the strict interval checks \(w<1\) and \(\lambda T^\alpha<1\). Signed coefficients, including \(V_0-\theta\), are multiplied by outward intervals before addition. Every power, Gamma value and exponential is enclosed by the identified dyadic primitives. \(\square\)

For a residual envelope \(R\le R_j\) on the complete cell \([a_j,b_j]\), evaluate strict cumulative intervals \([W^-(t),W^+(t)]\). Its exact weight lies in

\[
\left[
W^-(T-a_j)-W^+(T-b_j),\
W^+(T-a_j)-W^-(T-b_j)
\right].
\tag{C.34}
\]

Intersecting with nonnegativity and the independently proved upper curve weight is valid because \(0\le K_\lambda\le\xi\). The resulting upper endpoint \(\omega_j^+\) gives

\[
\eta_{\rm res}\le\nu^{-1}\sum_jR_j\omega_j^+.
\tag{C.35}
\]

Every bin envelope is the maximum over all intersecting closed source cells, including endpoint intersections. Source cells start at zero and cover the full interval.

The producer evaluates \(W_n\) through the strict power-field moment divided by \(\Gamma(1+n\alpha)\), retaining twelve outer terms. The separate reader evaluates (C.32) directly, retaining fourteen outer terms and sixty-four inner terms, with its own cumulative and moment functions. It checks that the reported residual-functional enclosure contains its tighter interval, then checks the transform-radius minima and complete prices. The two calculations share Gamma, logarithm, exponential and dyadic coefficient primitives and use the same upstream residual proof.

## Appendix D. The certified reference

### D.1. Reference trajectory, startup and arithmetic

This appendix works in the variables of A.1. The stored function \(\bar G\) approximates \(D^\alpha Z=\nu g\), so its coefficients are \(\nu\) times those of (4.1)–(4.2).

For each candidate \(\alpha=\beta\in\{.52,.6,.9\}\) and each \(u=n/8,\ n=0,\ldots,512\), we store
\[
\bar G(t)=\nu c_0+A_1t^\beta+A_2t^{2\beta}+\bar L(t),\quad
c_0=-(u^2+1/4)/2,\quad \widehat Z=I^\alpha\bar G,\quad T=1/2.
\tag{D.1}
\]
Here \(\bar L\) is the continuous piecewise-linear interpolation in physical time at nodes \((t_j,L_j)\), with \(L_0=0\). Nodes and complex coefficients are interpreted as the exact dyadic rationals represented by their binary64 values. The following independent residual controls the continuous-time error of this reference trajectory:
\[
r_t=\bar G-\nu F(\widehat Z),\quad
\delta_F=\nu^{-1}\sup_{0\le t\le T}|r_t|.
\tag{D.2}
\]
Equation (D.1) defines an entire absolutely continuous reference trajectory. Its independent residual gives the model-price intervals, which are then used to bound the output error of the selected [3/3] implementation.

Write
\[
\widehat Z=H_0+J,\quad J=I^\alpha\bar L,\quad
H_0=B_1t^\alpha+B_2t^{\alpha+\beta}+B_3t^{\alpha+2\beta},
\]
\[
B_1=\frac{\nu c_0}{\Gamma(1+\alpha)},\quad
B_2=\frac{A_1\Gamma(1+\beta)}{\Gamma(1+\alpha+\beta)},\quad
B_3=\frac{A_2\Gamma(1+2\beta)}{\Gamma(1+\alpha+2\beta)}.
\tag{D.3}
\]
The initial interval is \(J=L_1t^{\alpha+1}/[t_1\Gamma(2+\alpha)]\). Substitute all generalised powers into (D.2), first cancel \(\nu c_0\) exactly, combine equal powers, and then take \(\sum_p|r_p|t_1^p\). Since every \(p>0\), this bounds the full initial closed interval. The generalised-power expansion retains the fractional initial behaviour.

On a source interval \([a,b]\subset[0,q]\), set \(\tau=q-a,h=b-a\). The integral weights for the linear hat functions are
\[
I_0=\{\tau^\alpha-(\tau-h)^\alpha\}/\alpha,\quad
I_1=\{\tau^{\alpha+1}-(\tau-h)^{\alpha+1}\}/(\alpha+1),
\]
\[
w_R=(\tau I_0-I_1)/(h\Gamma(\alpha)),\quad
w_L=I_0/\Gamma(\alpha)-w_R.
\tag{D.4}
\]
These weights are nonnegative. For a truncated interval, recover the endpoints by affine interpolation within the original interval. On the final interval, \(b=q\) can be evaluated directly using
\(w_R=h^\alpha/[\alpha(\alpha+1)\Gamma(\alpha)],w_L=\alpha w_R\).
For \(h/\tau<.01\), retain eight positive-series terms, using respectively
\[
w_R=\frac{h\tau^{\alpha-1}}{\Gamma(\alpha)}
\sum_{k\ge0}\frac{(1-\alpha)_k(h/\tau)^k}{k!(k+2)},\quad
w_L=\frac{h\tau^{\alpha-1}}{\Gamma(\alpha)}
\sum_{k\ge0}\frac{(1-\alpha)_k(h/\tau)^k}{k!(k+1)(k+2)}.
\tag{D.5}
\]
The unscaled tails are each bounded by \(z^8/(1-z)\) because \(0<(1-\alpha)_k/k!\le1\). This reduces interval inflation from subtracting nearly equal endpoint quantities while retaining rigorous history integration.

Partition each nonstartup source interval into closed subintervals \([a,b]\): H/Q banks use four subintervals, and nearby-candidate banks use two. Choose the recorded dyadic centre \(m\) of each subinterval. Given a derivative bound on that full subinterval,
\[
\sup_{[a,b]}|r_t|\le|r_t(m)|+\max(m-a,b-m)\sup_{[a,b]}|r_t'|.
\tag{D.6}
\]
The ordinary residual derivative may be discontinuous at original nodes. The derivative bounds below hold almost everywhere; absolute continuity of the residual and the fundamental theorem of calculus still imply (D.6). Each of the following three identities provides a derivative bound, and we take their minimum:
\[
r_t'=\bar G'-\nu(d+\widehat Z)\widehat Z',
\]
\[
P_r=\nu c_0+A_1t^\beta+A_2t^{2\beta}-\nu F(H_0),\quad
r_t=P_r+\bar L-\nu(d+H_0)J-\nu J^2/2,
\]
\[
r_t'=P_r'+\bar L'-\nu[(d+H_0+J)J'+H_0'J],
\quad
\widehat Z'=\frac{\nu c_0\,t^{\alpha-1}}{\Gamma(\alpha)}+I^\alpha\bar G'.
\tag{D.7}
\]
The constant-kernel weight of a past source interval decreases with the integration endpoint, whereas the weight of the current source interval increases while that endpoint lies within it. Endpoint bounds therefore enclose both types of weight. In the third identity, first combine
\(\bar G'(s)=\beta A_1s^{\beta-1}+2\beta A_2s^{2\beta-1}+\bar L'(s)\) on each source interval and then integrate against the positive kernel, retaining cancellation in the original relation.

The singular terms from the initial source interval are handled directly by fractional-power integrals. For \(p>0,t_1\le a\le q\le b\), the positive weight satisfies
\[
\frac{t_1^pb^{\alpha-1}}{p\Gamma(\alpha)}
\le\frac1{\Gamma(\alpha)}\int_0^{t_1}s^{p-1}(q-s)^{\alpha-1}\,ds
\le\min\left\{
\frac{t_1^p(a-t_1)^{\alpha-1}}{p\Gamma(\alpha)},
\frac{\Gamma(p)}{\Gamma(\alpha+p)}
 \max_{q\in[a,b]}q^{\alpha+p-1}\right\}.
\tag{D.8}
\]
When \(a=t_1\), discard the first upper bound. The second follows from the full Euler Beta integral and is finite. Kernel monotonicity at the endpoints gives the lower bound and the first upper bound. Every \(p,\alpha>0\), so the hypotheses of the classical Beta formula hold.

Using the same \(\widehat Z'\) enclosure and rigorous point values, certify an upper bound for \(\operatorname{Re}\widehat Z\) on every subsequent subinterval. On the initial interval, factor out \(t^\alpha\), leaving a finite bracket; use its negative constant term and the endpoint contributions of the remaining positive parts. Bound (C.8) is applied where the upper bound on the real part is nonpositive on every closed interval, so that the condition holds on the whole of \([0,T]\).

The structural certificate and special functions use outward-rounded intervals with integer endpoints divided by \(2^{100}\). Batched residual weights use IEEE binary64; each basic operation is enlarged outward to adjacent representable numbers. After converting an exact rational Gamma enclosure, endpoint inclusion is checked with Fraction. The logarithm uses exact binary scaling and a twenty-two-term atanh series with \(z\in[0,1/3]\), whose tail is \(2z^{45}/[45(1-z^2)]\). After scaling, the exponential has \(|r|<1\) and a degree-24 Taylor tail bounded by \(3/25!\). These explicit remainders define the intervals for logarithms, exponentials, and noninteger powers.

For matrix multiplication with rigorous weight centres \(W_c\), radii \(W_r\), and recorded dyadic values \(X\), include
\[
\left(\gamma_{2n}\|W_c\|_{1,\mathrm{row}}+
\|W_r\|_{1,\mathrm{row}}\right)\|X\|_{\infty,\mathrm{column}},
\quad \gamma_{2n}=\frac{2n\,2^{-53}}{1-2n\,2^{-53}},
\tag{D.9}
\]
and an additional underflow-error allowance. Induction on products of basic rounding factors gives this estimate and permits different summation association orders. Norm sums are also rounded outward. The calculation assumes round-to-nearest IEEE basic operations, correctly rounded square roots, gradual underflow, and no overflow or NaNs. Appendix E identifies the implementation and arithmetic dependencies; interval inclusion uses these assumptions and the stated remainder bounds.

For the fixed curve, define
\[
J_0(z)=\theta z+(V_0-\theta)zE_{\alpha_0,2}(-\lambda_\xi z^{\alpha_0}),\quad
J_1(z)=\theta z^2/2+
(V_0-\theta)z^2(E_{\alpha_0,2}-E_{\alpha_0,3})(-\lambda_\xi z^{\alpha_0}).
\tag{D.10}
\]
These quantities are respectively \(\int_0^z\xi_*(s)ds,\int_0^zs\xi_*(s)ds\); termwise integration verifies the second formula. If a linear-trajectory interval is \([a,b]\) with \(A=T-b,B=T-a\), its rigorous nonnegative exponent weights are
\[
w_l=\frac{J_1(B)-J_1(A)-A[J_0(B)-J_0(A)]}{b-a},\quad
w_r=\frac{B[J_0(B)-J_0(A)]-J_1(B)+J_1(A)}{b-a}.
\tag{D.11}
\]
The curve moment for the power component \(t^\beta\) is
\[
\int_0^T\xi_*(T-t)t^\beta dt
=\frac{\theta T^{\beta+1}}{\beta+1}
 +(V_0-\theta)\Gamma(\beta+1)T^{\beta+1}
 E_{\alpha_0,\beta+2}(-\lambda_\xi T^{\alpha_0}).
\tag{D.12}
\]
This follows directly from the series and Beta integration. Together with (D.1), it makes \(\bar L\) a rigorous finite sum. Trigonometric phases and complex exponentials also use finite Taylor expansions with explicit tails. On the present horizon, if \(z=\lambda_\xi T^{\alpha_0}<1\), a Mittag–Leffler series tail may be bounded by \(3z^{64}/(1-z)\): all Gamma arguments exceed one, and Euler's integral gives \(\Gamma(\gamma)\ge e^{-1}>1/3\). Rigorous integration encloses the approximate exponent, while (C.27) controls the difference between the model and approximate exponents.

### D.2. Strip, exact high-frequency tail and reference field

**Proof of Theorem 4.1.** Jensen's inequality gives, within the strip,
\(|\phi_T(z-i/2)|\le\mathbb E M_T^{1/2-\operatorname{Im}z}\le1\).
On compact substrips, \(x^q|\log x|^j\le C(1+x)\), so the transform is analytic. The boundaries \(z=r\pm ia_*\) satisfy
\[
|z^2+1/4|\ge r^2+(1/2-a_*)^2,\quad
\int_{\mathbb R}|g(r\pm ia_*)|\,dr
\le M_*=\frac{\pi e^{a_*|k|}}{1/2-a_*}.
\]
Shift the real-axis Fourier integration contour to the upper and lower boundaries. The vertical integrals vanish by quadratic decay, giving
\(|\widetilde g(\omega)|\le M_*e^{-a_*|\omega|}\).
The absolutely and uniformly convergent periodisation \(\sum_{j\in\mathbb Z}g(x+jh_*)\) has Fourier coefficients
\(h_*^{-1}\widetilde g(2\pi n/h_*)\). Summing at zero and subtracting \(n=0\) gives a two-sided error of at most
\(2M_* /(e^{2\pi a_*/h_*}-1)\).
Conjugate symmetry halves both the two-sided integral and its sum. Multiplication by \(\sqrt m/\pi\) gives (4.4). \(\square\)

This is an application of the strip theory of Trefethen and Weideman (2014, Theorem 5.1). Each pricing node uses its own continuous-time residual bound; the analytic strip controls the quadrature error between nodes.

Fix \(\kappa=0,-1<\rho<0\). Set \(X=-\operatorname{Re}H\ge0\). Equation (C.6) gives
\[
D_x^\alpha X\ge\beta_u-s_0X-X^2/2,\quad
\beta_u=(1-\rho^2)u^2/2+1/8.
\tag{D.13}
\]
Let \(w\) be the scalar zero-initial-value solution satisfying equality. Comparison gives
\[
X\ge w,\quad 0\le w\le R_u,\quad
R_u=\sqrt{s_0^2+2\beta_u}-s_0,\quad
\ell_u=(s_0+\sqrt{s_0^2+2\beta_u})/2.
\]
Because the right-hand side satisfies \((R_u-w)(s_0+(R_u+w)/2)\ge\ell_u(R_u-w)\), linear comparison and the bound of Simon (2014),
\(E_\alpha(-z)\le(1+z/\Gamma(1+\alpha))^{-1}\), give
\[
-\operatorname{Re}Z(t,u)\ge
R_u\frac{\ell_u\nu t^\alpha}{\Gamma(1+\alpha)+\ell_u\nu t^\alpha}.
\tag{D.14}
\]
The comparison argument uses a positive maximum over the full history.

Take \(V>s_0/\sqrt{1-\rho^2}\) and define
\[
a_\rho=\sqrt{1-\rho^2},\quad b_V=a_\rho-s_0/V>0,\quad
f_\alpha(z)=z/(\Gamma(1+\alpha)+z).
\]
For \(u\ge V\), we have \(R_u/u\ge b_V,\ell_u\ge a_\rho u/2\). For any partition of \(J\ge2\), denoted \(0=t_0<\cdots<t_J=T\), the positive kernel in (C.26) and the monotonicity of \(f_\alpha\) give
\[
c_V=\frac{b_V}{\nu}\sum_{j=0}^{J-1}
 f_\alpha(a_\rho\nu Vt_j^\alpha/2)
 [A_\alpha(T-t_j)-A_\alpha(T-t_{j+1})]>0,
\]
\[
|\phi_T(u-i/2)|\le e^{-c_Vu}\quad(u\ge V).
\tag{D.15}
\]
This envelope holds at every continuous high frequency. The time partition constructs a lower sum for the positive-measure integral. The example uses \(J=64\) and rigorous intervals to obtain a positive rational lower bound for \(c_V\). The difference between bounds taken from the appropriate sides at distinct endpoints,
\([A_{\rm lo}(T-t_j)-A_{\rm hi}(T-t_{j+1})]_+\),
is a valid lower bound on the mass.

Using the right-endpoint sum of a positive decreasing function, for \(V=N_uh_*\) the exact discrete-tail contribution to the normalised price is bounded by
\[
\epsilon_{\rm tail}
\le\frac{\sqrt m}{\pi}\frac{e^{-c_VV}}{c_VV^2}.
\tag{D.16}
\]
The integral tail uses an envelope for the exact solution. Finite nodes assigned the value zero are charged according to the same envelope, so every part of the frequency range has an explicit error contribution.

For each candidate, a separately implemented product-integration procedure generates and fixes a physical-time reference function
\(\bar G=\nu c_0+A_1t^\beta+A_2t^{2\beta}+\bar L\), where \(\beta=\alpha_j\). Its nodes and coefficients are interpreted as their recorded exact dyadic values. The certified trajectory is \(\widehat Z=I^\alpha\bar G\). The initial time interval uses the full generalised-power residual expansion. The remaining closed intervals use rigorous convolution-derivative bounds and the mean value theorem, covering all \(t\in[0,1/2]\). At each Fourier node, division of the physical residual by exact \(\nu\) gives the input to the proved error barrier or certified half-plane linear error estimate.

The recorded exponent is derivative-based: \(\bar L_T=\nu^{-1}\int\xi_*(T-t)\bar G(t)dt\). The positive kernel \(q_\alpha=(I^{1-\alpha}\xi_*)'\ge0\) gives
\[
|L_T-\bar L_T|
\le E_{\rm state}(I^{1-\alpha}\xi_*)(T)/\nu
\le E_{\rm state}\theta T^{1-\alpha}/[\nu\Gamma(2-\alpha)].
\tag{D.17}
\]
Gamma and Mittag–Leffler curve moments, trajectory integrals, exponents, phases, and sums for the fixed curve use outward-rounded 100-bit rational intervals.

The positive-half-axis price rule has \(h=1/8\) and analytic-strip width \(a=9/20\). At the available nodes \(u=0:1/8:64\), the recorded trajectories use their actual residual certificates. For nodes above 64 through 128, the approximate transform is explicitly zero and each error is bounded by the exact-transform envelope. Above 128, the proved infinite discrete-rule tail bound obtained from the proved continuous-integral envelope is included. A comparison bound for the real part of the exact Riccati solution and a 64-cell lower sum over the entire positive-kernel curve give the high-frequency envelope. The analytic-strip trapezoidal error is estimated separately. Passage from the full-axis integral to the positive half-axis, including the half-weight at zero, is handled explicitly. The resulting enclosures cover all twelve model prices in Appendix E.

Here \(E_{\rm state}\) is a certified state radius: \(E_\delta\) in Proposition C.6 requires \(\delta_F<s_0^2/2\); at other nodes the half-plane bound gives \(E_{\rm state}=\delta_F/\sigma\). The finite-history experiments use Theorem 3.1 and retain the global alternative when valid and tighter. The nearby fields use the same construction with independently generated coefficients and continuous residual banks.

### D.3. Restriction to a shorter maturity

A continuous field certified on \([0,T_0]\) restricts to \([0,T]\) for every \(T\le T_0\) with its initial value and its full history, and its residual bounds restrict with it. The reference exponent, the forward variance weights, the reference centre, the modulus of the exact transform, the strip bound and the tail constants depend on the maturity and are computed afresh. The three-month certificates are obtained in this way from the six-month field.

## Appendix E. Experimental record

### E.1. Configurations

All experiments use \(\nu=0.2897\), \(\rho=-0.7445\), the curve (7.1), Fourier step \(1/8\), a finite reference and error grid through 128 (1025 nodes), 100-bit outward dyadic arithmetic and 64 forward-moment series terms. The stored rational output uses composite Gauss–Legendre order 8 through 200 (352 nodes) and Jacobi order 256. \(N_t\) counts source time cells.

**Table E.1. Fixed configurations: maturity in years; time cells, reference nodes, residual subcells and history bins are counts.**

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

H0 uses the uniform state bound and H1 the bound (3.5) with one global residual maximum, on the same field. H2 uses 128 time bins on the band \(u\le64\). H3 and H4 extend the reference through \(u=128\), with the upper band propagated globally in H3 and in 128 bins in H4. Q0, Q1 and Q2 restrict the six-month field to three months as in D.3, with 1430, 1353 and 550 time knots for the three candidates in Q0 and 1430 knots in Q1 and Q2; Q2 adds the 128 time bins and was specified after Q1. The field for \(\alpha=0.9\) has 1025 time knots and 641 stored frequencies through 80, of which 513 are reference nodes; the fields for 0.52 and 0.60 have 2049 knots and 1025 stored frequencies through 128.

N1 and N2 generate a field and a residual bank for each of the five nearby candidates, with two subcells per time cell (2047 and 4095 closed cells), and N2L applies 128 time bins to the N2 bank at \(\alpha=0.52\). The low and high banks of the H configurations each have 8189 closed cells, for 513 and 512 frequencies. H4 and N2L differ in reference centre, node coverage and residual bank as well as in propagation. The modified Adams outputs of Section 7.7 are certified against the reference bank of the N configurations.

The field generators use a uniform grid \(y_j\) from zero to \(\nu T^\alpha\), followed by \(x_j=y_j^{1/\alpha}\) and \(t_j=x_j/\nu^{1/\alpha}\), which is the graded rule \(t_j=T(j/N_t)^{1/\alpha}\). Generation is in binary64, and certification reads the saved nodes as exact dyadic numbers. For the restriction to three months every knot below \(T=1/4\) is kept, the exact endpoint is appended, and the linear interpolation of the bracketing field coefficients is enclosed in rational interval arithmetic.

### E.2. Three-candidate benchmark and interval objectives

The benchmark compares the candidates \(\alpha\in\{0.52,0.60,0.90\}\) on bank H0. The twelve quotes are those of Section 7.1, read from the data repository of Jeng and Kiliçman (2021) at commit `860049da2b7486fe8aa509061eff23cc28c2ef89`. Prices are normalised with \(D=1\) and \(F=4221.86\). The decimal implied volatilities and maturities are read as exact rationals, the Black–Scholes formula converts the bid and ask volatilities to prices \(B_i\) and \(A_i\), and the target is the price midpoint \(M_i=(B_i+A_i)/2\).

The parameters and the curve are those of Section 7.1, and the candidate set is
\[
\Theta_{\rm finite}=\{13/25,3/5,9/10\},\qquad
H=\alpha-\tfrac12\in\{.02,.1,.4\}.
\tag{E.1}
\]
With model prices \(c_i(\alpha)=C_i(\alpha)/(DF)\), the objectives are
\[
J(\alpha)=\frac1{24}\sum_{i=1}^{12}
 [c_i(\alpha)-M_i]^2,\qquad
J_{\rm band}(\alpha)=\frac1{24}\sum_{i=1}^{12}
 \operatorname{dist}(c_i(\alpha),[B_i,A_i])^2,
\tag{E.2}
\]
and the normalised price RMS is \(\sqrt{2J}\). On this bank the objective is enclosed by interval squares.

**Lemma E.1 (interval objectives on a finite candidate set).** For each \(\alpha_j\in\Theta_{\rm finite}\), suppose all model prices have certified enclosures
\[
c_i(\alpha_j)\in[p^-_{ij},p^+_{ij}],\quad
B_i\in[b_i^-,b_i^+],\quad
A_i\in[a_i^-,a_i^+],\quad
M_i\in[m_i^-,m_i^+].
\tag{E.3}
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
\tag{E.4}
\]
Then \(J(\alpha_j)\in[L_j,U_j]\). Writing \(L_*=\min_jL_j,U_*=\min_jU_j\), the exact finite-set optimum satisfies
\[
J_*=\min_{\Theta_{\rm finite}}J\in[L_*,U_*].
\tag{E.5}
\]
For \(\varepsilon\ge0\), every exact \(\varepsilon\)-near-optimal candidate belongs to
\[
\{\alpha_j:L_j\le U_*+\varepsilon\};
\tag{E.6}
\]
The condition \(U_j-L_*\le\varepsilon\) is sufficient for that candidate to be near-optimal for the exact objective. If
\[
g:=\min_{j\ne j_0}L_j-U_{j_0}>0,
\tag{E.7}
\]
then \(\alpha_{j_0}\) is the unique minimiser of the model objective on the finite set. If
\[
\min_{\alpha_j\ge.6}L_j>U_*+\varepsilon,
\tag{E.8}
\]
then every exact near-optimal candidate in the finite set satisfies \(\alpha_j<.6\).

A candidate is inconsistent with the quotes when some row has \(p^+_{ij}<b_i^-\) or \(p^-_{ij}>a_i^+\), and consistent when every row has \(p^-_{ij}\ge b_i^+\) and \(p^+_{ij}\le a_i^-\).

**Proof.** The exact difference \(c_i-M_i\) belongs to the closed interval used in (E.4). The minimum of its square is \(\ell\) and the maximum is \(v\), so the weighted sum encloses every \(J_j\). Each \(J_j\ge L_j\ge L_*\); a candidate attaining the smallest \(U_j\) gives \(J_*\le J_j\le U_*\), proving (E.5). If \(J_j\le J_*+\varepsilon\), then \(L_j\le J_j\le U_*+\varepsilon\), proving (E.6). Conversely, \(J_j-J_*\le U_j-L_*\) gives the stated sufficient inner condition. Under (E.7), every competitor satisfies \(J_j-J_{j_0}\ge L_j-U_{j_0}\ge g>0\), proving uniqueness. Condition (E.8) places the model objective of every selected higher-H candidate above \(J_*+\varepsilon\) and therefore excludes it.

If \(p^+<b^-\), then the exact price satisfies \(c<B\); if \(p^->a^+\), then \(c>A\). A single such row rules out simultaneous consistency. In the opposite direction, the inner-band conditions give \(B\le b^+\le c\le a^-\le A\). Applying these statements row by row proves the consistency assertions. \(\square\)

**Table E.2. H0 half-year three-candidate benchmark: normalized objective, price RMS and actual Padé-output objective enclosures.**

| α | H | Rigorous model J interval | Rigorous model-price RMS interval | Rigorous implemented Padé J interval |
|---|---|---|---|---|
| 0.52 | 0.02 | [0.0000000068962, 0.0000001833669] | [0.00011744, 0.00060559] | [0.0000000708602, 0.0000000708603] |
| 0.60 | 0.10 | [0.0000004535720, 0.0000006021720] | [0.00095244, 0.00109743] | [0.0000006127366, 0.0000006127367] |
| 0.90 | 0.40 | [0.0000082343900, 0.0000083484458] | [0.00405817, 0.00408619] | [0.0000081393603, 0.0000081393604] |

Displayed endpoints are outward decimal roundings of the exact rational bounds. The unique minimiser of the model objective is \(\alpha=0.52\), with a gap of at least 0.0000002702052 to its competitors, and the stored rational output has the same unique minimiser.

**Table E.3. Three-candidate quote-band objective and consistency decisions, using the original twelve quotes.**

| α | Rigorous model J_band interval | Rows strictly excluding quote consistency | All-row quote consistency certified |
|---|---|---|---|
| 0.52 | [0.0000000005732, 0.0000000877280] | [8, 9] | No |
| 0.60 | [0.0000003444775, 0.0000004648236] | [5, 6, 7, 8, 9, 10, 11] | No |
| 0.90 | [0.0000076345237, 0.0000077422463] | [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] | No |

The following tables give the prices behind these results.

#### α=0.52, H=0.02

**Table E.4. H0 alpha=0.52 price accounts: normalized quotes, model prices, actual output and its total error bound.**

| K | Rigorous quote-midpoint interval | Rigorous normalised model-price interval | Implemented Padé dyadic output (displayed value) | Total model-price error bound for this output |
|---|---|---|---|---|
| 3700 | [0.13916863, 0.13916864] | [0.13882872, 0.13937153] | 0.13910887 | 0.00028016 |
| 3800 | [0.11921230, 0.11921231] | [0.11858902, 0.11913912] | 0.11888921 | 0.00030019 |
| 3900 | [0.09981335, 0.09981336] | [0.09909480, 0.09965209] | 0.09943278 | 0.00033799 |
| 4000 | [0.08123198, 0.08123199] | [0.08055552, 0.08111992] | 0.08092667 | 0.00037115 |
| 4100 | [0.06371452, 0.06371453] | [0.06322696, 0.06379836] | 0.06361496 | 0.00038801 |
| 4200 | [0.04759685, 0.04759686] | [0.04740368, 0.04798201] | 0.04781654 | 0.00041287 |
| 4300 | [0.03333802, 0.03333803] | [0.03349166, 0.03407684] | 0.03393723 | 0.00044558 |
| 4400 | [0.02173166, 0.02173167] | [0.02200137, 0.02259332] | 0.02244498 | 0.00044361 |
| 4500 | [0.01316937, 0.01316938] | [0.01332823, 0.01392686] | 0.01373568 | 0.00040746 |
| 4600 | [0.00760335, 0.00760336] | [0.00746696, 0.00807221] | 0.00785225 | 0.00038529 |
| 4700 | [0.00434644, 0.00434645] | [0.00393703, 0.00454881] | 0.00430503 | 0.00036801 |
| 4800 | [0.00253419, 0.00253420] | [0.00199815, 0.00261641] | 0.00232396 | 0.00032582 |

#### α=0.60, H=0.10

**Table E.5. H0 alpha=0.60 price accounts, with the same normalization and column meanings as Table E.4.**

| K | Rigorous quote-midpoint interval | Rigorous normalised model-price interval | Implemented Padé dyadic output (displayed value) | Total model-price error bound for this output |
|---|---|---|---|---|
| 3700 | [0.13916863, 0.13916864] | [0.13908096, 0.13925890] | 0.13914793 | 0.00011096 |
| 3800 | [0.11921230, 0.11921231] | [0.11900101, 0.11918134] | 0.11908020 | 0.00010114 |
| 3900 | [0.09981335, 0.09981336] | [0.09970355, 0.09988623] | 0.09981101 | 0.00010746 |
| 4000 | [0.08123198, 0.08123199] | [0.08138513, 0.08157015] | 0.08152385 | 0.00013873 |
| 4100 | [0.06371452, 0.06371453] | [0.06429081, 0.06447812] | 0.06445106 | 0.00016025 |
| 4200 | [0.04759685, 0.04759686] | [0.04869874, 0.04888832] | 0.04888577 | 0.00018704 |
| 4300 | [0.03333802, 0.03333803] | [0.03496352, 0.03515534] | 0.03518748 | 0.00022397 |
| 4400 | [0.02173166, 0.02173167] | [0.02351737, 0.02371142] | 0.02375739 | 0.00024002 |
| 4500 | [0.01316937, 0.01316938] | [0.01471126, 0.01490749] | 0.01493438 | 0.00022313 |
| 4600 | [0.00760335, 0.00760336] | [0.00857862, 0.00877702] | 0.00878309 | 0.00020447 |
| 4700 | [0.00434644, 0.00434645] | [0.00474038, 0.00494092] | 0.00492883 | 0.00018845 |
| 4800 | [0.00253419, 0.00253420] | [0.00255071, 0.00275338] | 0.00270300 | 0.00015230 |

#### α=0.90, H=0.40

**Table E.6. H0 alpha=0.90 price accounts, with the same normalization and column meanings as Table E.4.**

| K | Rigorous quote-midpoint interval | Rigorous normalised model-price interval | Implemented Padé dyadic output (displayed value) | Total model-price error bound for this output |
|---|---|---|---|---|
| 3700 | [0.13916863, 0.13916864] | [0.13880016, 0.13883098] | 0.13876501 | 0.00006596 |
| 3800 | [0.11921230, 0.11921231] | [0.11929811, 0.11932934] | 0.11923074 | 0.00009859 |
| 3900 | [0.09981335, 0.09981336] | [0.10073709, 0.10076873] | 0.10063802 | 0.00013071 |
| 4000 | [0.08123198, 0.08123199] | [0.08327826, 0.08331031] | 0.08315433 | 0.00015597 |
| 4100 | [0.06371452, 0.06371453] | [0.06710772, 0.06714016] | 0.06696694 | 0.00017321 |
| 4200 | [0.04759685, 0.04759686] | [0.05242401, 0.05245684] | 0.05228161 | 0.00017523 |
| 4300 | [0.03333802, 0.03333803] | [0.03943228, 0.03946550] | 0.03931664 | 0.00014886 |
| 4400 | [0.02173166, 0.02173167] | [0.02834450, 0.02837811] | 0.02828552 | 0.00009258 |
| 4500 | [0.01316937, 0.01316938] | [0.01934300, 0.01937699] | 0.01935637 | 0.00002061 |
| 4600 | [0.00760335, 0.00760336] | [0.01249183, 0.01252619] | 0.01257890 | 0.00008707 |
| 4700 | [0.00434644, 0.00434645] | [0.00765389, 0.00768862] | 0.00780424 | 0.00015035 |
| 4800 | [0.00253419, 0.00253420] | [0.00449079, 0.00452590] | 0.00467714 | 0.00018635 |

The stored output uses the third-order rational approximation, a 256-point Jacobi rule for the exponent and an eighth-order composite Gauss–Legendre rule for Fourier inversion through 200. Each output \(c^P\) is saved as an exact dyadic rational, and the reference interval \([c^-,c^+]\) of the model price gives
\[
|c^P-c|\le\max\{|c^P-c^-|,|c^P-c^+|\}.
\tag{E.9}
\]
This bound includes the state, exponent, quadrature, truncation and floating-point errors of the implementation.

### E.3. Exact thresholds, pass counts and centre accounts

In the tables of this appendix, marginal denotes the leg-by-leg bound (5.6) with the signed centre. Exact endpoints, threshold breakpoints and pass counts for the 28 positions are in `portfolio-exact-thresholds.csv` and `portfolio-budget-counts.json`; a position is certified when its exact rational bound satisfies \(B\le\tau\), equality included.

**Table E.7. Complete-budget pass counts for all 28 fixed half-year directions; budgets are in index points and equality is included.**

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

For the five nearby candidates, the pairs separated at each level are as follows.

**Table E.8. Complete unresolved-pair lists for N1 and N2 under the fixed quotes, alongside strict separation counts.**

| N_t | Method | Separated pairs | Complete unresolved list |
| --- | --- | --- | --- |
| 1024 | joint | 7/10 | (0.520, 0.525), (0.520, 0.530), (0.525, 0.530) |
| 1024 | marginal | 3/10 | (0.520, 0.525), (0.520, 0.530), (0.520, 0.540), (0.525, 0.530), (0.525, 0.540), (0.530, 0.540), (0.540, 0.550) |
| 2048 | joint | 10/10 | none |
| 2048 | marginal | 7/10 | (0.520, 0.525), (0.520, 0.530), (0.525, 0.530) |

The closest pair at \(N_t=2048\), 0.520 against 0.525, is separated by \(7.382643478687\times10^{-10}\) in the normalised objective. Table E.10 decomposes this gap, and `nearby-pair-resolution.json` records it exactly.

The centre and radius of the six-month 4400–4500 certificate on each bank are as follows; radii and bounds are rounded upward.

**Table E.9. Half-year frozen-output centre accounting for H2–H4, N2 and N2L, in index points; upper-endpoint rounding is applied independently.**

| Bank | Signed centre points | Complete radius points | Complete bound points |
| --- | --- | --- | --- |
| H2 | -0.166762218 | 0.200496564 | 0.367258782 |
| H3 | -0.081698202 | 0.050546863 | 0.132245064 |
| H4 | -0.081698202 | 0.033517732 | 0.115215934 |
| N2 | -0.166762218 | 0.261808769 | 0.428570987 |
| N2L | -0.166762218 | 0.228237113 | 0.394999331 |

The step from H2 to H3 changes the centre and the radius, H3 to H4 keeps the centre, and N2 to N2L keeps the centre and the remainders. `frozen-output-centre-account.json` records these transitions exactly.

**Table E.10. Signed contributions to the closest-pair normalized objective gap; scientific notation displays the exact ledger.**

| Gap contribution | Normalized loss contribution |
| --- | --- |
| reference_midpoint_objective_difference | 7.939186982887e-09 |
| used_node_support_both_candidates | -4.690368762320e-09 |
| finite_zero_support_both_candidates | -1.217354923855e-09 |
| strip_both_candidates | -1.855578458131e-12 |
| true_infinite_tail_both_candidates | -9.568024410400e-11 |
| reference_arithmetic_both_candidates | -6.928606526135e-23 |
| midpoint_conversion_arithmetic_both_candidates | -4.770477111773e-27 |
| candidate_a_quadratic_remainder | -1.195663126282e-09 |
| box_intersection_endpoint_adjustment | 0.000000000000e+00 |

For the modified Adams outputs of Section 7.7, the share of the complete bound that is the uncertainty of the reference is as follows.

**Table E.11. Common strict-reference floor and output translation in BL-core certificates; price quantities are in index points.**

| Bank | Nominal output | Reference floor points | Translation points | Floor / complete bound |
| --- | --- | --- | --- | --- |
| N1 | BL modified-Adams core, 512 steps | 0.423484833 | 0.000853401 | 99.798887% |
| N1 | BL modified-Adams core, 1024 steps | 0.423484833 | 0.000305328 | 99.927953% |
| N2 | BL modified-Adams core, 512 steps | 0.261808768 | 0.000845646 | 99.678039% |
| N2 | BL modified-Adams core, 1024 steps | 0.261808768 | 0.000297572 | 99.886469% |
| N2L | BL modified-Adams core, 512 steps | 0.228237113 | 0.000845646 | 99.630856% |
| N2L | BL modified-Adams core, 1024 steps | 0.228237113 | 0.000297572 | 99.869791% |

Figure 4 plots exact-endpoint pass counts for the three candidates on bank H1, and Table E.7 lists the counts for every bank. Coordinates are converted to decimals after exact counting, and the CSV and JSON files hold every threshold.

The deterministic work of the output constructions compared in Section 7.7 is as follows.

**Table E.12. Deterministic work of the output constructions.**

| Additional output construction | Deterministic mathematical work |
|---|---|
| Stored Padé output | 352 Fourier values; 256 Jacobi samples per frequency |
| Direct returned reference | Return the already generated, fully charged centre with binary64 rounding |
| Corrected fast output | Store one correction and perform one binary64 addition per price |
| BL core, 512 steps | 67,371,264 history scalar-vector products; 2,626,560 transformed Riccati evaluations |
| BL core, 1024 steps | 269,222,400 history scalar-vector products; 5,253,120 transformed Riccati evaluations |

The quantities of Tables 1, 5, 6 and 7 and the model-above-ask gaps of Section 7.6 are produced by `science/analysis/market/market_scale.py` and stored in `market-scale.json`. The quote table, the gaps and the stored node supports are exact readings of the saved records; the netting ratios, the band shares and the width scan evaluate (5.5) and (5.6) in binary64 from the stored radii.

### E.4. Verification duties

Table E.13 lists the proof obligations, the reader of each, what it recomputes and what it shares with the generator. Obligation N2 covers the 128-bin refinement N2L, and `configuration-registry.json` fixes the configuration labels and dimensions.

**Table E.13. Proof obligations, reader locations, recomputation and shared dependencies.**

| ID | Obligation | Verification command | Recomputed | Inherited / shared |
| --- | --- | --- | --- | --- |
| S1 | Padé coefficient signs on the original parameter rectangle | `full_structure_verify.py` ([S1](https://github.com/130U/certified-rough-heston-valuation/blob/main/COMMANDS.md#s1)) | 211241 structural sign leaves and rectangle cover | model/parameter definitions; original strict interval algebra and generalized-power primitives |
| S2 | Startup Caputo residual and left-halfplane enclosure | `startup_independent.py` ([S2](https://github.com/130U/certified-rough-heston-valuation/blob/main/COMMANDS.md#s2)) | all 513 frequencies for each of the three original startup cells | stored field dyadics and later-time continuous residuals; Gamma/power/dyadic outward primitives |
| R1 | Full original alpha=.52 low-frequency continuous residual cover | `check-time-envelope.py` ([R1](https://github.com/130U/certified-rough-heston-valuation/blob/main/COMMANDS.md#r1)) | 8189 closed cells ×513 entries: cover, saved dyadic values and per-node maxima; startup audited separately | derivative inequalities in identified continuous generator; NumPy enclosure with proved dot-product error and strict scalar primitives |
| R2 | Full alpha=.52 high-frequency continuous residual cover | `omission-verify.py` ([R2](https://github.com/130U/certified-rough-heston-valuation/blob/main/COMMANDS.md#r2)) | 8189 closed cells ×512 entries: exact bank, startup/halfplane, saved-node maxima | identified Caputo derivative-generator inequalities; strict scalar primitives and original continuous generator |
| P1 | Global finite-history and low-frequency 128-bin price accounts | `verify-finite-history-independent.py`; `independent-time-local.py` ([P1](https://github.com/130U/certified-rough-heston-valuation/blob/main/COMMANDS.md#p1)) | forward masses, complete cell intersections, 513 tightened radii, all 1025 finite terms and complete spread remainder | continuous residual theorem/validity and identified stored field; strict forward-moment, exponent and true-tail primitives |
| P2 | Expanded-reference frozen half-year output account | `independent-omission.py` ([P2](https://github.com/130U/certified-rough-heston-valuation/blob/main/COMMANDS.md#p2)) | changed reference centre, all 1025 support terms, old/new complete interval intersection, global/local high-frequency accounts | same actual fast output and continuous residual banks; original strict moment/scalar primitives |
| Q1 | Quarter-maturity used 64 certificate and actual fast output | `independent-transfer.py` ([Q1](https://github.com/130U/certified-rough-heston-valuation/blob/main/COMMANDS.md#q1)) | all three exact terminal interpolations, 1539 restricted exponents, three original fast-output calculations, all 3075 true finite CF/tail/price terms | larger-horizon continuous residuals and halfplane certificate; strict moment/trig/dyadic/true-tail libraries; original fast implementation used only for output replay |
| Q2 | Quarter full 128 global and 128-bin complete certificate | `independent-transfer-supplement.py` ([Q2](https://github.com/130U/certified-rough-heston-valuation/blob/main/COMMANDS.md#q2)) | all 1025 restricted exponents, all 1025 CF/tail/coefficient/radius terms, all high bank entries, all 128 local weights and exact account | low/high continuous derivative validity; actual fast replay is separately performed by Q1; strict moment/trig/dyadic/true-tail libraries; path helpers of Q1 |
| N1 | Fresh fields/residuals at the five nearby alpha points | `nearby_independent.py` ([N1](https://github.com/130U/certified-rough-heston-valuation/blob/main/COMMANDS.md#n1)) | all cells, startup, halfplane, 513 exponents and 1025 CF/coefficient terms per point; all objective/pair decisions | strict proof of continuous residual generator and final propagation theorem; declared sdk outward primitives, stored reference data |
| N2 | Descriptive 128-bin reused-bank control, outside nearby objective grid | `local_output_independent.py` ([N2](https://github.com/130U/certified-rough-heston-valuation/blob/main/COMMANDS.md#n2)) | 128 exact positive weights, every intersecting closed-bank maximum, 513 tightened radii, all 12 prices and all actual output rounding | complete identity-matched N2048 point proof and continuous residual generator; same strict moment/trig/dyadic primitives |
| C1 | Same model and complete tolerance for frozen/direct/corrected/BL-core outputs | `workload_controls_independent.py` ([C1](https://github.com/130U/certified-rough-heston-valuation/blob/main/COMMANDS.md#c1)) | exact stored-output centre translation, all same-reference remainder and 28 portfolio supports; BL nominal-output metadata identity | reference certificate, BL nominal-output producer and its stored dyadics; same strict outward coefficient primitives |

The [command index](https://github.com/130U/certified-rough-heston-valuation/blob/main/COMMANDS.md) gives the commands and working directories, and `proof-obligation-matrix.json` records the source hashes. The entry points are as follows.

**Table E.14. Bank reading, complete structural checks and continuous-regeneration commands.**

| Entry point | Executed obligation | Run separately |
| --- | --- | --- |
| `reproduce.py` | saved-bank readers and downstream reconstruction; both quarter readers run with `--full` and nearby point caches are cleared | continuous residual generation and the complete structural sign cover |
| `reproduce.py --full` | the same readers plus all 211241 structural sign leaves and the supplementary checks in Table E.15 | fresh low/high/nearby continuous derivative generation |
| `run_evidence.py --regenerate-continuous` | alpha=.52 513-node low continuous generator and 8189-cell bank | five-alpha reference/residual generation |
| `run_frontier.py --regenerate-full` | separate-copy 512-node high continuous generator and fresh-bank audit | changing the fixed quarter inputs |
| `nearby_generate.py --N N` | missing field/residual/exponent components; matching existing components are reused | forced regeneration over existing scientific output |
| `verify_source.py` | published source hashes | bank replay, interval reconstruction and residual generation |

`reproduce.py --full` adds the structural cover of Proposition 6.1 to the saved-bank reconstruction. The continuous derivative bounds are regenerated by `run_evidence.py --regenerate-continuous` for the low band and by `run_frontier.py --regenerate-full` for the high band. The driver also runs the readers of the damped-kernel experiment and of the exact ledgers.

**Table E.15. Supplementary readers: recomputed obligations and shared inputs.**

| Obligation | Generate | Verify | Recomputed / shared inputs |
|---|---|---|---|
| Dissipative weights and complete prices | `generate.py` ([K1](https://github.com/130U/certified-rough-heston-valuation/blob/main/COMMANDS.md#k1)) | `independent.py` ([K1](https://github.com/130U/certified-rough-heston-valuation/blob/main/COMMANDS.md#k1)) | 14-layer direct series versus 12-layer moments; all 128 bins, 1025 nodes, 12 prices and 8 controls; strict primitives and upstream residual proof shared |
| Exact experiment ledgers and thresholds | `produce_audit.py` ([A1](https://github.com/130U/certified-rough-heston-valuation/blob/main/COMMANDS.md#a1)) | `read_audit_independent.py` ([A1](https://github.com/130U/certified-rough-heston-valuation/blob/main/COMMANDS.md#a1)) | Exact saved-bank accounts, pair gaps, 504 thresholds and 9 controls; inherited derivative validity |

For the matched propagation experiment of Table 3, the separate reader reads all 2,100,735 entries of the complete residual bank, checks closed-cell coverage from zero, and recomputes the maxima for all 128 propagation bins. It independently expands the cumulative resolvent by the direct double Gamma series with fourteen outer terms, while the producer uses twelve outer terms and a strict power-field moment. Both enclose all inner tails with sixty-four retained terms. The reader checks all 513 transform-radius minima in all four comparisons and rebuilds all twelve prices with all 1025 finite frequencies. At \(\sigma=0\), it replays all 129 cumulative endpoints and all 128 cell weights against the curve-kernel conclusion. The reader rejects eight negative controls: negative damping, an incorrect physical \(\nu\) scale, a missing initial closed cell, a removed finite omitted node, an erased true infinite tail, an altered signed centre, an understated resolvent exponent enclosure, and a zero-damping weight that does not reproduce the curve kernel.

The weighted sum of that experiment has \(513\times128=65{,}664\) terms and 129 cumulative endpoint enclosures, with twelve outer series terms for each endpoint and sixty-four inner terms.

## References

Abi Jaber, E. (2019). Lifting the Heston model. *Quantitative Finance* 19(12), 1995–2013.

Abi Jaber, E. and El Euch, O. (2019a). Markovian structure of the Volterra Heston model. *Statistics & Probability Letters* 149, 63–72. [doi:10.1016/j.spl.2019.01.024](https://doi.org/10.1016/j.spl.2019.01.024). Theorem and example numbers refer to arXiv:1803.00477.

Abi Jaber, E. and El Euch, O. (2019b). Multifactor approximation of rough volatility models. *SIAM Journal on Financial Mathematics* 10(2), 309–349.

Abi Jaber, E., Larsson, M. and Pulido, S. (2019). Affine Volterra processes. *Annals of Applied Probability* 29(5), 3155–3200.

Albrecher, H., Mayer, P., Schoutens, W. and Tistaert, J. (2007). The little Heston trap. *Wilmott Magazine*, January, 83–92.

Basel Committee on Banking Supervision (2019). *Minimum capital requirements for market risk*. Basel Framework, chapter MAR32, version effective 1 January 2023. Bank for International Settlements.

Bayer, C. and Breneis, S. (2023a). Weak Markovian approximations of rough Heston. [arXiv:2309.07023](https://arxiv.org/abs/2309.07023v1).

Bayer, C. and Breneis, S. (2023b). Efficient option pricing in the rough Heston model using weak simulation schemes. [arXiv:2310.04146](https://arxiv.org/abs/2310.04146v1).

Bayer, C., Friz, P. and Gatheral, J. (2016). Pricing under rough volatility. *Quantitative Finance* 16(6), 887–904.

Ben Hammouda, C., Ben Romdhane, A., Samet, M. and Tempone, R. F. (2026). Single- and multilevel quadrature with error control for Fourier pricing under the rough Heston model. [arXiv:2609.00438](https://arxiv.org/abs/2609.00438v1).

Board of Governors of the Federal Reserve System, Federal Deposit Insurance Corporation and Office of the Comptroller of the Currency (2026). *Supervisory Guidance on Model Risk Management*. SR Letter 26-2, 17 April 2026.

Boyarchenko, S., de Innocentis, M. and Levendorskii, S. (2025). Fast reliable pricing and calibration of the rough Heston model. [arXiv:2508.15080](https://arxiv.org/abs/2508.15080v1).

Breeden, D. T. and Litzenberger, R. H. (1978). Prices of state-contingent claims implicit in option prices. *Journal of Business* 51(4), 621–651.

Cboe Global Markets (2024). *S&P 500 Index Options: SPX product specifications*, as of 19 March 2024.

Cboe Global Markets (2026). Cboe Global Markets reports trading volume for December and full year 2025. Press release, 6 January 2026.

Commission Delegated Regulation (EU) 2016/101 of 26 October 2015 supplementing Regulation (EU) No 575/2013 with regard to regulatory technical standards for prudent valuation. *Official Journal of the European Union* L 21, 28 January 2016, 54–65.

Cont, R. and Das, P. (2024). Rough volatility: fact or artefact? *Sankhya B* 86, 191–223.

Diethelm, K., Ford, N. J. and Freed, A. D. (2004). Detailed error analysis for a fractional Adams method. *Numerical Algorithms* 36, 31–52.

El Euch, O., Fukasawa, M. and Rosenbaum, M. (2018). The microstructural foundations of leverage effect and rough volatility. *Finance and Stochastics* 22, 241–280.

El Euch, O. and Rosenbaum, M. (2018). Perfect hedging in rough Heston models. *Annals of Applied Probability* 28(6), 3813–3856. Statement numbers refer to arXiv:1703.05049.

El Euch, O. and Rosenbaum, M. (2019). The characteristic function of rough Heston models. *Mathematical Finance* 29(1), 3–38.

Gatheral, J., Jaisson, T. and Rosenbaum, M. (2018). Volatility is rough. *Quantitative Finance* 18(6), 933–949.

Gatheral, J. and Keller-Ressel, M. (2019). Affine forward variance models. *Finance and Stochastics* 23, 501–533.

Gatheral, J. and Radoičić, R. (2019). Rational approximation of the rough Heston solution. *International Journal of Theoretical and Applied Finance* 22(3), 1950010. [doi:10.1142/S0219024919500109](https://doi.org/10.1142/S0219024919500109).

Gatheral, J. and Radoičić, R. (2024). A generalization of the rational rough Heston approximation. *Quantitative Finance* 24(2), 329–335. [doi:10.1080/14697688.2024.2302055](https://doi.org/10.1080/14697688.2024.2302055).

Gripenberg, G., Londen, S.-O. and Staffans, O. (1990). *Volterra Integral and Functional Equations*. Cambridge University Press.

Hagan, P. S., Kumar, D., Lesniewski, A. S. and Woodward, D. E. (2002). Managing smile risk. *Wilmott Magazine*, September, 84–108.

Hagan, P. S., Kumar, D., Lesniewski, A. S. and Woodward, D. E. (2014). Arbitrage-free SABR. *Wilmott* 2014(69), 60–75.

Hager, P. P. and Kreher, D. (2026). Expanding the rough Heston model in H. [arXiv:2606.16619](https://arxiv.org/abs/2606.16619v1).

Heston, S. L. (1993). A closed-form solution for options with stochastic volatility with applications to bond and currency options. *Review of Financial Studies* 6(2), 327–343.

Horvath, B., Muguruza, A. and Tomas, M. (2021). Deep learning volatility: a deep neural network perspective on pricing and calibration in (rough) volatility models. *Quantitative Finance* 21(1), 11–27.

Jeng, S. W. and Kiliçman, A. (2020). Series expansion and fourth-order global Padé approximation for a rough Heston solution. *Mathematics* 8(11), 1968. [doi:10.3390/math8111968](https://doi.org/10.3390/math8111968).

Jeng, S. W. and Kiliçman, A. (2021). SPX calibration of option approximations under rough Heston model. *Mathematics* 9(21), 2675. [doi:10.3390/math9212675](https://doi.org/10.3390/math9212675).

Kahl, C. and Jäckel, P. (2005). Not-so-complex logarithms in the Heston model. *Wilmott Magazine*, September, 94–103.

Kopteva, N. (2022). Pointwise-in-time a posteriori error control for time-fractional parabolic equations. *Applied Mathematics Letters* 123, 107515. [doi:10.1016/j.aml.2021.107515](https://doi.org/10.1016/j.aml.2021.107515).

Lewis, A. L. (2001). A simple option formula for general jump-diffusion and other exponential Lévy processes. Working paper, Envision Financial Systems and OptionCity.net.

Li, L. and Liu, J.-G. (2018). A generalized definition of Caputo derivatives and its application to fractional ODEs. *SIAM Journal on Mathematical Analysis* 50(3), 2867–2900. [doi:10.1137/17M1160318](https://doi.org/10.1137/17M1160318).

Olver, F. W. J., Lozier, D. W., Boisvert, R. F. and Clark, C. W. (2010). *NIST Handbook of Mathematical Functions*. Cambridge University Press.

Rømer, S. E. (2022). Empirical analysis of rough and classical stochastic volatility models to the SPX and VIX markets. *Quantitative Finance* 22(10), 1805–1838.

Simon, T. (2014). Comparing Fréchet and positive stable laws. *Electronic Journal of Probability* 19, paper 16. [arXiv:1310.1888](https://arxiv.org/abs/1310.1888v2).

Simon, T. (2015). Mittag-Leffler functions and complete monotonicity. *Integral Transforms and Special Functions* 26(1), 36–50. [doi:10.1080/10652469.2014.965704](https://doi.org/10.1080/10652469.2014.965704).

Trefethen, L. N. and Weideman, J. A. C. (2014). The exponentially convergent trapezoidal rule. *SIAM Review* 56(3), 385–458. [doi:10.1137/130932132](https://doi.org/10.1137/130932132).
