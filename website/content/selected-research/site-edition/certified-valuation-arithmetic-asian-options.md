---
description: Certified bounds on the pricing error of arithmetic Asian options under projected Euler, built on common Gaussian smoothing, with weak expansions and a transfer result for posterior quantiles.
---

Common Gaussian Smoothing and Projected Euler Error Bounds

**Theodore Ouyang**

[theodore.oy2025@gmail.com](mailto:theodore.oy2025@gmail.com) · [10@alumni.duke.edu](mailto:10@alumni.duke.edu)

[English PDF](https://github.com/130U/certified-valuation-arithmetic-asian-options/blob/846bbe6acbaa4eaac07e20d5d2c566b3abc5456d/paper/paper.pdf) · [Project overview](https://github.com/130U/certified-valuation-arithmetic-asian-options/blob/846bbe6acbaa4eaac07e20d5d2c566b3abc5456d/README.md) · [Code and evidence](https://github.com/130U/certified-valuation-arithmetic-asian-options/blob/846bbe6acbaa4eaac07e20d5d2c566b3abc5456d/EVIDENCE.md)

**Keywords:** Arithmetic Asian options; Heston model; projected Euler; conditional Gaussian smoothing; computable error bounds; weak error expansions; posterior quantiles.

## Abstract

We develop finite error certificates for the bounded arithmetic Asian call spread $`\psi(A)=(A-95)^+-(A-110)^+`$, with twelve monthly fixings, in a specified Heston model and in its original Euler scheme, which takes the positive part of the variance update. A Gaussian factor common to all fixings leaves a nonnegative payoff remainder, which a weighted second moment controls. The validated transform arithmetic accounts for projection corrections, integration tails, inversion error, complex-logarithm branches and rounding. At $`\theta_*=(3,.045,.23,-.55,.045)`$ and $`h=1/768`$, the signed Euler-minus-continuous price difference lies in

```math
[-0.011024692273,\;0.010642371599],
```

and the continuous-model call-spread price lies in

```math
[6.508371733,\;6.518868974].
```

We also give a complete certificate at a second initial-variance point. Comparing step grids, we find that the certificate width reaches a plateau dominated by the remainder, and for the exact nonlinear contribution we derive the optimal common geometric scale. Two further results hold on separate domains. When $`\xi=0`$, a common first-order expansion formula with explicit remainder bounds covers nine puts and the Asian spread, and on a restricted continuous prior with $`\xi\in[10^{-7},10^{-6}]`$ we bound the displacement of posterior target quantiles. The paper contributes the weighted payoff structure and a complete finite error accounting for the specified original discrete kernel, supported by an executable numerical package.

## 1. Introduction

Computing a model price is one question, and proving how closely the discrete model behind the computation approximates the continuous model is another; numerical valuation of derivatives involves both. With arithmetic Asian options on fixed observation dates, the positive-part payoff, stochastic variance and the projection of the discrete variance all enter together. To be of practical use, a conclusion should state an error in price units at the specified step size, with payoff conversion, transform evaluation, infinite tails and rounding all accounted for in a single error budget.

We organize the theory around that requirement, studying the risk-neutral Heston model together with a precisely specified scheme, which applies a positive-part projection to the variance Euler update and uses the current variance in the log-price update. We want to control the difference between expectations of the actual arithmetic-average payoff. So we begin at the level of the payoff: we identify a Gaussian random factor shared by all observed prices, integrate it exactly, and bound the error using the structure of the remaining variables. The quantity that then governs the argument is not a negative moment of the variance at an individual time, but

```math
E\!\left[(A-cG)^2 I^{-1/2}\right],
```

where $`A`$ is the arithmetic average, $`G`$ is the geometric average, and $`I`$ is the integrated variance over the first observation interval.

The main result of this paper puts a weighted payoff remainder together with complete transform error control for the original projected Euler kernel. Our contributions are the following.

1. *A weighted payoff remainder.* Lemma 3.1 gives an exact linear-reference decomposition of the arithmetic payoff whose nonnegative remainder is controlled by a weighted second moment. Section 5 verifies the common Gaussian structure for a deterministic-variance class and for the specified Heston model and projected kernel. That pair has stochastic variance and a boundary atom induced by projection, so the theory strictly extends the deterministic-variance class.
2. *A complete certificate for the original kernel.* Theorem 4.1 gives a signed enclosure of the difference between the projected Euler and continuous prices. Ninety-one real loadings control the nonlinear term and thirteen complex loadings determine the linear term. At the parameters (4.3) and $`h=1/768`$, Corollary 4.2 gives the complete monetary bound $`.011025`$ and encloses the continuous-model price in an interval of width below $`.010498`$. Section 8 adds certificates at two further step sizes and at a second initial variance.
3. *An analysis of the certificate width.* Section 4.1 derives the optimal common geometric scale for the exact nonlinear contribution and attributes about 94.5 percent of the interval width at the main point to payoff conversion. The step-grid study in Section 8 identifies a remainder-dominated width plateau. Proposition I.1 gives a direct coupled-remainder inequality, which brings the nonlinear width in the deterministic example of Appendix I down to about 0.573 percent of the separate-law width.
4. *Two further results.* For $`\xi=0`$, Theorem 6.1 gives a common first-order expansion with explicit remainder bounds for nine puts and the Asian spread. Theorem 7.1 transfers price differences to posterior quantiles at every level, and Section 7 uses it to bound the displacement of posterior target quantiles on the restricted prior (7.5) with synthetic quotes.

Conditioning and geometric reference variables are well established in Asian option pricing [[1](#ref-1), [2](#ref-2), [3](#ref-3), [4](#ref-4)], and the framework of Fusai and Kyriakou in particular covers the Heston model and includes error upper bounds based on conditional variances [[4](#ref-4)]. The transform machinery comes from the affine structure of Heston's model [[5](#ref-5)], and discrete geometric Asian options admit recursive transform methods [[6](#ref-6)] and publicly available implementations [[7](#ref-7)]. The next subsection compares our results with those of Fusai and Kyriakou directly.

The logical structure of the paper is

```math
\begin{gathered}
\left.
\begin{array}{l}
\mathsf A:\ \text{deterministic positive integrated variance}\\
\mathsf C:\ \text{verifiable Heston/projected Euler conditions}
\end{array}
\right\}\Longrightarrow\mathsf H,\\[4pt]
\mathsf H\overset{\ \mathcal S\ }{\Longrightarrow}\mathsf M\Longrightarrow\mathsf B .
\end{gathered}
\tag{1.1}
```

Here $`\mathcal S`$ denotes conditional Gaussian smoothing and rigorous transform error accounting; $`\mathsf M`$ consists of the payoff decomposition with explicit constants and transform error bounds; and $`\mathsf B`$ is a rigorous enclosure of the actual price difference. Section 2 makes these objects precise and Sections 3–5 prove the main chain of implications. The weak expansion follows in Section 6 and the posterior transfer in Section 7. Section 8 presents the numerical certificates and their financial use, and Section 9 sets out the domain of validity.

### 1.1 Comparison with conditional Asian bounds

Fusai and Kyriakou [[4](#ref-4)] obtain optimized conditioning bounds for Heston Asian options (Sections 2.2–3), conditional-variance error bounds (Theorem 4, equations (51)–(54)), and experiments at several monitoring frequencies (Section 5.1, Table 5). The reviewed source reports no certificate for kernel (2.2), no outward-rounded error budget and no executable signed Euler-minus-continuous enclosure. We provide all three at the specified parameters and grid. Our principal result is the finite error enclosure for the original kernel (2.2), which we build from a payoff remainder weighted by first-period integrated variance and a validated computation of every stated error contribution. Table 1 sets out the mathematical and computational objects on each side.

Page references in Table 1 use the internal numbering of the accepted manuscript linked in [[4](#ref-4)], after its repository cover, rather than the journal pagination.

**Table 1. Comparison with the conditional Asian bounds of Fusai and Kyriakou.**

| Object | Fusai–Kyriakou (reviewed source) | Present result |
| --- | --- | --- |
| Payoff approximation | Optimized conditional lower bound and conditional-variance error (Theorem 4, p. 15). | Exact linear-reference decomposition with nonnegative remainder controlled by a weighted second moment (Lemma 3.1). |
| Discrete numerical law | QE simulation benchmark (Appendix B, p. 22); no certificate for kernel (2.2) is reported. | Projection correction between an algebraic transform recursion and the specified original positive-part variance Euler law, using current variance in the stock update (Appendix B). |
| Transform computation | Fourier conditional moments (equations (55)–(56), pp. 15–16) and FFT implementation (Section 5, pp. 16–17). | Finite real and complex loading catalogs, certified quadrature and infinite-tail bounds, and complex-logarithm branch checks (Appendices A–C). |
| Finite arithmetic | An outward-rounded error budget is not reported in the reviewed source. | Rational endpoint combination and ball-arithmetic enclosures include rounding with the other finite errors (Appendices A–C and G). |
| Certified output | Lower-bound approximation error (Theorem 4); no executable signed Euler-minus-continuous enclosure is reported. | Signed $`p_h-p_c`$ interval at the specified parameters and grid (Theorem 4.1 and Corollary 4.2), traceable to the accompanying executable package. |

Relative to the reviewed source, this paper adds the weighted remainder and its combination with error control for the original projected kernel. Section 4 analyzes the width of the certificate that results.

### 1.2 Three distinct domains of validity

Every monetary Asian conclusion concerns the same contract, the arithmetic call spread in (2.3), whose payoff is bounded by 15. The three results hold on different domains, which Table 2 keeps apart. In particular, the posterior example concerns a near-deterministic perturbation regime, not calibration stability at the main Heston point.

**Table 2. Domains of the three certified results.**

| Result | Domain and interpretation |
| --- | --- |
| Main price certificate | At (4.3), $`h=1/384,1/768,1/1536`$; at the separate $`v_0=.04`$ point in Section 8.3, only $`h=1/768`$. Both use $`\xi=.23`$, twelve monthly fixings and the original projected Euler kernel. |
| Ten-payoff weak expansion | Theorem 6.1 under (6.1); numerical family (6.10): $`\xi=0`$, $`\kappa=3`$, $`\bar v=.045`$, $`v_0\in[.03,.06]`$, twelve monthly fixings, aligned $`h\le1/768`$. |
| Posterior quantile transfer | Independent uniform prior (7.5), $`\xi\in[10^{-7},10^{-6}]`$, exact synthetic quotes in Appendix F. |

## 2. Models and structural conditions

### 2.1 The continuous model, discrete kernel, and payoff

Let $`W,B`$ be independent standard Brownian motions, and let $`\theta=(\kappa,\bar v,\xi,\rho,v_0)`$. Assume $`S_0,\kappa,\bar v,v_0\gt 0`$, $`\xi\ge0`$, $`|\rho|\lt 1`$, and $`r\in\mathbb R`$. The discrete model uses $`h\gt 0`$, with each $`t_i/h`$ a positive integer. The continuous model is

```math
\begin{aligned}
dV_t&=\kappa(\bar v-V_t)\,dt+\xi\sqrt{V_t}\,dW_t,\\
dZ_t&=(r-V_t/2)\,dt+
\sqrt{V_t}\bigl(\rho\,dW_t+\sqrt{1-\rho^2}\,dB_t\bigr),\\
S_t&=S_0e^{Z_t},\qquad Z_0=0,\quad V_0=v_0.
\end{aligned}
\tag{2.1}
```

On the aligned grid with step size $`h`$, define the original discrete kernel $`Q_h`$ by

```math
\begin{aligned}
V_{j+1}^h&=\left[(1-\kappa h)V_j^h+\kappa\bar v h+
\xi\sqrt{hV_j^h}\,G_j\right]^+,\\
Z_{j+1}^h&=Z_j^h+(r-V_j^h/2)h+
\sqrt{hV_j^h}\bigl(\rho G_j+\sqrt{1-\rho^2}H_j\bigr),
\end{aligned}
\tag{2.2}
```

where $`G_j,H_j`$ are independent standard normal variables, the two updates at the same step share $`G_j`$, and the initial conditions agree. In particular, the price update uses $`V_j^h`$.

Fix $`0\lt t_1\lt \cdots\lt t_n=T`$, and set

```math
\begin{gathered}
A=\frac1n\sum_{i=1}^nS_{t_i},\qquad
G=\left(\prod_{i=1}^nS_{t_i}\right)^{1/n},\qquad
\psi(x)=(x-K_1)^+-(x-K_2)^+,
\end{gathered}
\tag{2.3}
```

where $`0\lt K_1\lt K_2`$. Write

```math
\begin{gathered}
p_c=e^{-rT}E_P\psi(A),\qquad
p_h=e^{-rT}E_{Q_h}\psi(A),\qquad e_h=p_h-p_c.
\end{gathered}
\tag{2.4}
```

We use this sign convention for the error throughout, and when one step size is understood we write $`Q=Q_h`$. The numerical example uses $`n=12,t_i=i/12,T=1`$, and

```math
\begin{gathered}
S_0=100,\quad r=.01,\quad K_1=95,\quad K_2=110,\quad h=1/768.
\end{gathered}
\tag{2.5}
```

The calibration payoffs are the nine European puts with maturities $`1/4,1/2,1`$ and strikes $`90,100,110`$.

### 2.2 The common Gaussian structure $`\mathsf H_s`$

A pricing law $`\nu`$ is said to satisfy $`\mathsf H_s(c)`$ if there exist a sub-$`\sigma`$-algebra $`\mathcal G`$, positive $`\mathcal G`$-measurable random variables $`a_1,\ldots,a_n,\sigma`$, and a random variable $`U`$ such that

```math
\begin{gathered}
U\mid\mathcal G\sim N(0,\sigma^2),\qquad S_{t_i}=e^Ua_i.
\end{gathered}
\tag{2.6}
```

Set $`a=n^{-1}\sum_i a_i`$ and $`g=(\prod_i a_i)^{1/n}`$. We require

```math
\begin{gathered}
E_\nu(A+G)\lt \infty,\qquad
D_\nu(c):=E_\nu\!\left[\frac{(A-cG)^2}{\sigma}\right]\lt \infty.
\end{gathered}
\tag{2.7}
```

Here $`c\gt 0`$ is a constant chosen in advance. Condition (2.6) describes the stochastic structure of the model, and (2.7) is an integrability condition that one can check through moments or Laplace transforms, so neither condition already contains the price-difference conclusion we want to prove.

### 2.3 The finite verification condition $`\mathsf H_v`$

The structural condition still has to be connected to finite computation, and that is the job of the condition $`\mathsf H_v`$, which consists of the following inputs:

1. A computable upper bound for $`D_\nu(c)`$, obtained from enclosures at finitely many Laplace nodes, provable quadrature enclosures, and a bound on the infinite tail.
2. Outward enclosures for the finite set of transform loadings required in Section 3. For the discrete kernel, each loading also has a computable bound on the difference between the true kernel and its algebraic recursion.
3. Complete bounds on the infinite-frequency tail and periodization error in Fourier inversion, together with branch control for the continuous complex transform.

We define these inputs through specific transforms or moments, and it is the theorems below that connect them to the target price. We write $`\mathsf H=\mathsf H_s+\mathsf H_v`$. Appendices A–C specify the finite catalogs, precision, tail-bound constants and kernel error formulas.

### 2.4 The intermediate property and target conclusion

The property $`\mathsf M`$ has two components: an exact decomposition of the actual payoff into a linear term and a remainder, and signed enclosures for each remainder and each linear-transform error. The target conclusion $`\mathsf B`$ is a definite finite interval $`[\underline e,\overline e]`$ such that

```math
\begin{gathered}
e_h\in[\underline e,\overline e].
\end{gathered}
\tag{2.8}
```

Each endpoint is obtained by finitely many rational operations and validated enclosures of transcendental functions.

## 3. The core argument: from a common Gaussian factor to a weighted remainder

### 3.1 A conditional smoothing lemma

**Lemma 3.1.** Suppose that $`\mathsf H_s(c)`$ holds. For $`K\gt 0`$, define

```math
\begin{gathered}
R_{K,\nu}=E_\nu\!\left[(A-K)^+-(cG-K)^+
-(A-cG)\mathbf1_{\{cG\gt K\}}\right].
\end{gathered}
\tag{3.1}
```

Then

```math
\begin{gathered}
0\le R_{K,\nu}\le \frac{D_\nu(c)}{2K\sqrt{2\pi}}.
\end{gathered}
\tag{3.2}
```

*Proof.* Convexity of the positive-part function gives pathwise nonnegativity. Conditional on $`\mathcal G`$, let

```math
F_K(x)=E[(xe^U-K)^+\mid\mathcal G],\qquad x\gt 0.
```

Since $`\sigma\gt 0`$, this function is twice differentiable, with

```math
\begin{gathered}
F_K''(x)=\frac{K}{\sigma x^2}
\varphi\!\left(\frac{\log(x/K)}{\sigma}\right)
\le\frac{e^{2\sigma^2}}{K\sigma\sqrt{2\pi}},
\end{gathered}
\tag{3.3}
```

where $`\varphi`$ is the standard normal density. The final bound follows by maximizing at $`\log(x/K)=-2\sigma^2`$.

Applying Taylor's formula with integral remainder between the positive arguments $`a,cg`$ gives

```math
0\le F_K(a)-F_K(cg)-(a-cg)F_K'(cg)
\le \frac{e^{2\sigma^2}(a-cg)^2}{2K\sigma\sqrt{2\pi}}.
```

The conditional derivative satisfies

```math
(a-cg)F_K'(cg)
=E[(A-cG)\mathbf1_{\{cG\gt K\}}\mid\mathcal G].
```

Since

```math
E[(A-cG)^2\mid\mathcal G]=e^{2\sigma^2}(a-cg)^2,
```

taking expectations proves (3.2). The call and linear terms are integrable because $`E(A+G)\lt \infty`$. The conditional second-moment identity is used in the sense of nonnegative conditional expectations, and the weighted remainder is controlled by $`D_\nu(c)\lt \infty`$.  $`\square`$

The proof works because the two factors $`e^{2\sigma^2}`$ match exactly, which lets us write the curvature contribution from conditional smoothing directly as a weighted second moment under the true model. The residual $`A-cG`$ may have either sign.

### 3.2 The payoff decomposition

Define

```math
\begin{gathered}
\mathcal L=\psi(cG)+(A-cG)\mathbf1_{\{K_1\lt cG\le K_2\}}.
\end{gathered}
\tag{3.4}
```

The conditional normal variance is strictly positive, so $`G`$ has no atom at any positive threshold. By (3.1),

```math
\begin{gathered}
E_\nu\psi(A)=E_\nu\mathcal L+R_{K_1,\nu}-R_{K_2,\nu}.
\end{gathered}
\tag{3.5}
```

The identity keeps the original arithmetic payoff as the object of interest and splits off a linear part that a small number of transforms can compute.

Let $`Y=\log(G/S_0)`$ and $`y_K=\log(K/(cS_0))`$, and define the distribution functions of two positive measures by

```math
F_{0,\nu}(y)=\nu(Y\le y),\qquad
F_{A,\nu}(y)=E_\nu[A\mathbf1_{\{Y\le y\}}].
```

Expanding (3.4) on each of its intervals gives

```math
\begin{gathered}
E_\nu\mathcal L=(K_2-K_1)
+K_1F_{0,\nu}(y_{K_1})-K_2F_{0,\nu}(y_{K_2})
-F_{A,\nu}(y_{K_1})+F_{A,\nu}(y_{K_2}).
\end{gathered}
\tag{3.6}
```

The corresponding transforms are

```math
\begin{gathered}
\widehat\mu_0(z)=E_\nu e^{zY},\qquad
\widehat\mu_A(z)=\frac{S_0}{n}\sum_{i=1}^n
E_\nu e^{Z_{t_i}+zY}.
\end{gathered}
\tag{3.7}
```

Thus the linear part requires thirteen loadings when $`n=12`$.

## 4. The main theorem and the complete price certificate

**Theorem 4.1 (A signed enclosure of the price difference between two models).** Suppose that $`P,Q_h`$ each satisfy $`\mathsf H_s(c)`$, and that computable constants satisfy $`D_P(c)\le d_P,D_Q(c)\le d_Q`$. If $`\mathsf H_v`$ provides

```math
\begin{gathered}
e^{-rT}(E_Q\mathcal L-E_P\mathcal L)\in[\ell,u],
\end{gathered}
\tag{4.1}
```

then, with $`\gamma=e^{-rT}/(2\sqrt{2\pi})`$,

```math
\begin{gathered}
\boxed{
e_h\in
\left[
\ell-\gamma\!\left(\frac{d_Q}{K_2}+\frac{d_P}{K_1}\right),
\quad
u+\gamma\!\left(\frac{d_Q}{K_1}+\frac{d_P}{K_2}\right)
\right].}
\end{gathered}
\tag{4.2}
```

*Proof.* Apply (3.5) to each law and subtract. The lower-end contributions are $`-R_{K_2,Q}-R_{K_1,P}`$, and the upper-end contributions are $`R_{K_1,Q}+R_{K_2,P}`$. Lemma 3.1 and (4.1) give the result.  $`\square`$

The last step of the main theorem only combines intervals, so the mathematical substance lies elsewhere, in Lemma 3.1 and in the rigorous verification of $`\mathsf H_v`$. The interval that comes out is generally not symmetric about zero, and the computation retains its center.

**Corollary 4.2 (The specified Heston parameter point).** For (2.1)–(2.5), take

```math
\begin{gathered}
\theta_*=(3,\;9/200,\;23/100,\;-11/20,\;9/200),\qquad
c=\frac{1254433}{1250000}.
\end{gathered}
\tag{4.3}
```

Then

```math
\begin{gathered}
e_h\in[-.011024692273,\;.010642371599],\qquad |e_h|\lt .011025\lt .025.
\end{gathered}
\tag{4.4}
```

Furthermore,

```math
\begin{aligned}
p_c&\in[6.508371733,\;6.518868974],\\
p_h&\in[6.507844281,\;6.519014106].
\end{aligned}
\tag{4.5}
```

*Proof.* Section 5 establishes the common Gaussian structure. Appendices A–C specify all requirements for the validated arithmetic computation, which yields

```math
\begin{gathered}
W_P:=E_P[(A-cG)^2I^{-1/2}]\le2.172471592802,\qquad
W_Q\le2.242189951600.
\end{gathered}
\tag{4.6}
```

Here $`d_\nu=W_\nu/\sqrt{1-\rho^2}`$. The center of the finite linear difference is approximately $`-.000202992309237006`$, and its complete error radius is at most $`.000594238060`$. Combining the exact rational endpoints outward with (4.2) gives (4.4). Applying the corresponding error contributions to (3.5) separately for each law gives (4.5). The source code, exact endpoints, and the recomputation of the entire catalog by a second implementation together constitute the executable evidence specified in the appendices.  $`\square`$

### 4.1 Optimizing the weighted remainder and its width limitation

Since the nonlinear conversion bound depends on the common scale $`c`$, we ask which scale makes it smallest. Assume, in addition to the structural condition, that

```math
m_{AA,\nu}=E_\nu[A^2/\sigma_\nu],\qquad
m_{AG,\nu}=E_\nu[AG/\sigma_\nu],\qquad
m_{GG,\nu}=E_\nu[G^2/\sigma_\nu]
```

are finite for $`\nu=P,Q`$. Put

```math
\begin{aligned}
a&=m_{AA,P}+m_{AA,Q},\qquad b=m_{AG,P}+m_{AG,Q},\\
d&=m_{GG,P}+m_{GG,Q}\gt 0.
\end{aligned}
```

The nonlinear contribution to the width in (4.2), using exact moment inputs, is

```math
\gamma\left(K_1^{-1}+K_2^{-1}\right)J(c),\qquad
J(c)=a-2bc+dc^2.
```

Consequently its unique minimizer on $`c\gt 0`$ is

```math
\begin{gathered}
c_* = \frac{b}{d},\qquad
J(c)=J(c_*)+d(c-c_*)^2.
\end{gathered}
\tag{4.7}
```

The discount and strike factors are positive constants and therefore do not alter this minimizer. So $`c_*`$ minimizes the exact nonlinear contribution to the width. The final computed enclosure also carries quadrature slack and the linear-transform error allowances, which can depend on $`c`$ and lie outside this objective.

In the Heston construction $`\sigma_\nu=\sqrt{1-\rho^2}\sqrt{I_\nu}`$, so the common factor $`(1-\rho^2)^{-1/2}`$ cancels from (4.7). A numerically preferable representation uses the arithmetic–geometric mean inequality:

```math
\begin{gathered}
H_\nu=E_\nu[G^2I_\nu^{-1/2}],\qquad
E_\nu^+=E_\nu[(A-G)GI_\nu^{-1/2}]\ge0,
\qquad
c_* =1+\frac{E_P^++E_Q^+}{H_P+H_Q}.
\end{gathered}
\tag{4.8}
```

Both moments draw on profiles already present in the 91-profile catalog. The Laplace integrand $`E_\nu[(A-G)G\exp(-x^2I_\nu)]`$, for example, is nonnegative and nonincreasing, so the same Darboux construction as (A.5) encloses it, with the difference of the $`AG`$ and $`G^2`$ profiles evaluated at each node before integration. The positive $`AG`$ tail bounds its continuous tail. At $`S_0=100`$, each positive raw-moment catalog has coefficient sum $`10000`$ and the nodal projection allowance for $`(A-G)G`$ is $`20000\delta_Q`$. Working this way preserves cancellation at the nodal level and spares us from subtracting two wide integrated moment enclosures.

If validated positive endpoints give $`E_P^++E_Q^+\in[e_-,e_+]`$ and $`H_P+H_Q\in[d_-,d_+]`$, with $`d_-\gt 0`$, then

```math
c_*\in\left[1+\frac{e_-}{d_+},\;1+\frac{e_+}{d_-}\right]=[c_-,c_+].
```

Choosing the rational midpoint $`\widehat c=(c_-+c_+)/2`$ gives

```math
\begin{gathered}
0\le J(\widehat c)-J(c_*)
\le \frac{d_+(c_+-c_-)^2}{4\sqrt{1-\rho^2}},
\end{gathered}
\tag{4.9}
```

where $`d_+`$ encloses the sum of the two $`I^{-1/2}`$-weighted $`G^2`$ moments, as in (4.8). A ratio enclosure alone is not a new price certificate, because the selected rational scale still has to be substituted into the original square and linear calculations.

What optimizing $`c`$ does not do is recover cancellation between the two models. Even with $`Q=P`$, an exact linear difference of zero, and exact $`d_P=d_Q=D_P(c)`$, formula (4.2) has width

```math
2\gamma\left(K_1^{-1}+K_2^{-1}\right)D_P(c).
```

That width is positive unless $`A=cG`$ almost surely, so (4.2) is a fixed-step enclosure, and by itself it gives no proof that its width tends to zero as $`h`$ decreases.

For computed inputs the actual width in (4.2) is

```math
\begin{gathered}
(u-\ell)+\gamma(d_P+d_Q)(K_1^{-1}+K_2^{-1}).
\end{gathered}
\tag{4.10}
```

In the original interval the nonlinear width is approximately .02047859 and the linear width approximately .00118848, for a total of approximately .02166706, so about 94.5 percent of the width is due to payoff conversion. Increasing precision, or reducing an already small projection contribution, therefore has limited effect on the final width. Appendix I goes after the remainders directly, with a sufficient coupling inequality for their difference. In the deterministic example of Appendix I, where both calculations use the same conditioning and common geometric scale, the nonlinear width falls from approximately .01538363715 to .00008815020, about 0.573 percent of the separate-law width. The additional moments of that inequality remain to be computed at the main point, so Corollary 4.2 retains its separate-law remainder.

The positive-moment calculation at $`h=1/768`$ gives

```math
\begin{gathered}
c_*\in[1.003427394603466100946724,\;1.003669831096000915452372].
\end{gathered}
\tag{4.11}
```

Rounding a midpoint to the $`10^{-7}`$ grid selects the rational $`5017743/5000000=1.0035486`$, which is not the exact midpoint of the rational endpoints in (4.11). Formula (4.9) applies to an exact midpoint, so for the rounded choice the distance allowance also includes $`5\cdot10^{-8}`$.

**Table 3. Effect of the common geometric scale on the nonlinear width.**

| Common scale | Nonlinear width upper bound at $`h=1/768`$ |
| --- | --- |
| 1 | .040551110717 |
| 1.0035464 (original) | .020478587752 |
| 1.0035486 (rounded midpoint) | .020478592980 |

The original scale is already close to the optimizer, and the midpoint-based candidate slightly increases the computed upper width, so we retain the original rational scale. The retained scale is thus the best of the candidates in Table 3 by nonlinear width upper bound, a comparison that takes the new moment quadrature, projection and tail allowances into account, and Corollary 4.2 is stated at this scale.

## 5. Recovery of classical conditions and additional models covered

### 5.1 Deterministic positive integrated variance: $`\mathsf A\Rightarrow\mathsf H`$

Define $`\mathsf A`$ as follows: the model's variance coefficient itself is a deterministic function $`v(t)\ge0`$, the stock price follows the corresponding linear geometric diffusion, and

```math
\begin{gathered}
0\lt I_1=\int_0^{t_1}v(t)\,dt,\qquad \int_0^T v(t)\,dt\lt \infty.
\end{gathered}
\tag{5.1}
```

Computability conclusions also require the integrated variances over all fixing intervals to be supplied as effectively computable inputs.

Take the stock Brownian integral over the first interval as $`U`$. Then $`\sigma^2=I_1`$ is a positive constant; the remaining log increments and deterministic drift can all be included in $`\mathcal G`$. Every observed price has the common factor in (2.6). The finite positive moments of the joint lognormal distribution give

```math
D_\nu(c)=I_1^{-1/2}E_\nu(A-cG)^2\lt \infty.
```

The second moment is computed directly from

```math
\begin{gathered}
E(A-cG)^2=\frac1{n^2}\sum_{i,j}ES_iS_j
-\frac{2c}{n}\sum_iES_iG+c^2EG^2
\end{gathered}
\tag{5.2}
```

whose terms are all Gaussian exponential moments. The corresponding finite transforms and Gaussian tails likewise have explicit bounds. Thus, for a single law with effectively computable inputs, $`\mathsf A\Rightarrow\mathsf H`$; for two such laws, Theorem 4.1 further yields $`\mathsf B`$.

So the classical lognormal conditioning models fit within the framework. Once the common structure is identified, the same payoff-level argument applies to different variance mechanisms, and the particular constants and computational catalog come from the model itself.

### 5.2 Heston and the actual projected kernel: $`\mathsf C\Rightarrow\mathsf H`$

Condition $`\mathsf C`$ requires $`\kappa,\bar v,\xi,v_0\gt 0`$, $`|\rho|\lt 1`$, the model (2.1) or (2.2), observation dates aligned with the discrete grid, and the finite-transform, moment-growth, projection, and infinite-tail inequalities listed in Appendices A–C. The actual verification in this section uses $`S_0,r,T,h`$ from (2.5) and the parameters in (4.3); the common Gaussian construction below is valid under the structural parameter assumptions just stated.

Condition on the entire variance driver $`W`$ and on the later independent stock-driver increments $`B_t-B_{t_1}`$, $`t\ge t_1`$. The conditioning sigma-field does not include the future Brownian levels $`B_t`$, which contain the first-interval value. Let

```math
I_P=\int_0^{t_1}V_t\,dt,\qquad
I_Q=h\sum_{j=0}^{t_1/h-1}V_j^h.
```

The contribution of $`B`$ over the first interval is shared by every observation date. Hence

```math
\begin{gathered}
U\mid\mathcal G\sim N(0,(1-\rho^2)I_\nu),\qquad S_{t_i}=e^Ua_i.
\end{gathered}
\tag{5.3}
```

For the continuous model, $`v_0\gt 0`$ and continuity of the variance paths imply $`I_P\gt 0`$ almost surely. For the discrete model, there is the exact lower bound

```math
\begin{gathered}
I_Q\ge hv_0\gt 0.
\end{gathered}
\tag{5.4}
```

The transform and tail bounds in the appendices verify $`W_\nu\lt \infty`$ and supply an upper bound, while the exponential-moment growth bounds ensure integrability of the required price terms. Therefore $`\mathsf C\Rightarrow\mathsf H`$. At the parameters in (4.3), all these inequalities and finite-node checks hold.

### 5.3 A strict extension of the class of models covered

In the probability formulas below, $`\Phi`$ denotes the standard normal cumulative distribution function.

Let $`X_*`$ be the continuous/discrete model pair at (4.3). For the continuous model,

```math
\begin{gathered}
\mathop{\mathrm{Var}}\nolimits (V_t)=\xi^2\int_0^t e^{-2\kappa(t-s)}EV_s\,ds\gt 0
\quad(t\gt 0),
\end{gathered}
\tag{5.5}
```

so its variance is not a deterministic function. The first step of the discrete model also satisfies

```math
\begin{gathered}
Q_h(V_1^h=0)=
\Phi\!\left(
-\frac{(1-\kappa h)v_0+\kappa\bar v h}{\xi\sqrt{hv_0}}
\right)\in(0,1).
\end{gathered}
\tag{5.6}
```

Even so, (5.4) still holds. Thus $`X_*`$ satisfies $`\mathsf C`$ but not $`\mathsf A`$, and the main theorem yields (4.4). This additional model pair has both stochastic variance and a boundary atom induced by projection, yet the common Gaussian structure at the payoff level remains valid.

## 6. A common density perturbation and weak expansions for ten payoffs

For background on weak error expansions and distributional error analysis, see [[8](#ref-8), [9](#ref-9), [10](#ref-10)]. We work here directly with the differentiability of Gaussian densities, setting $`\xi=0`$ and retaining the original update (2.2). We assume

```math
\begin{gathered}
\kappa\gt 0,\quad \bar v,v_0\gt 0,\quad
t_j=j/12,\quad h=1/(12m)\le h_0\lt 1/\kappa,\quad m\in\mathbb N.
\end{gathered}
\tag{6.1}
```

Let $`D=v_0-\bar v`$. The continuous and discrete cumulative variances are

```math
\begin{gathered}
I(t)=\bar vt+\frac D\kappa(1-e^{-\kappa t}),\qquad
I_h(t)=\bar vt+\frac D\kappa[1-(1-\kappa h)^{t/h}].
\end{gathered}
\tag{6.2}
```

The twelve independent components of the log-increment vector $`Y`$ have distributions

```math
\begin{gathered}
N(r/12-s_j/2,s_j),\qquad s_j=I(t_j)-I(t_{j-1}),
\end{gathered}
\tag{6.3}
```

and the discrete law replaces $`s_j`$ by $`s_{h,j}`$. Both satisfy the lower bound $`s_j,s_{h,j}\ge u_*:=\min(v_0,\bar v)/12\gt 0`$.

Define

```math
\begin{gathered}
a(t)=\frac{D\kappa t e^{-\kappa t}}2,
\quad
B_I(t)=|D|e^{-\kappa t}
\left[
\frac{\kappa^2t}{3(1-\kappa h_0)}
+\frac{\kappa^3t^2}{8(1-\kappa h_0)^2}
\right].
\end{gathered}
\tag{6.4}
```

Set $`d_j=a(t_j)-a(t_{j-1})`$ and $`b_j=B_I(t_j)+B_I(t_{j-1})`$. Appendix D proves that

```math
\begin{gathered}
|s_{h,j}-s_j-hd_j|\le h^2b_j.
\end{gathered}
\tag{6.5}
```

**Theorem 6.1 (A common first-order expansion for bounded payoffs).** Under (6.1), let $`g(Y)`$ be any bounded Borel payoff with range contained in $`[l,l+L]`$, payable at time $`\tau`$. Then

```math
\begin{gathered}
p_h(g)-p_c(g)=h\beta_g+R_h(g),
\end{gathered}
\tag{6.6}
```

```math
\begin{aligned}
\beta_g&=e^{-r\tau}E_s\!\left[g(Y)\sum_jd_j\mathcal S_j(Y)\right],\\
|R_h(g)|&\le e^{-r\tau}\frac L2\,C_2h^2,
\end{aligned}
\tag{6.7}
```

where

```math
\mathcal S_j=\frac{G_j^2-1}{2s_j}-\frac{G_j}{2\sqrt{s_j}},
\quad
J(s)=\frac1{2s^2}+\frac1{4s},\quad
H_2(s)=\frac2{s^2}+\frac1{2s},
```

```math
\begin{gathered}
C_2=
\sqrt{\sum_jb_j^2J(u_*)}
+\frac12\sum_j(|d_j|+h_0b_j)^2H_2(u_*).
\end{gathered}
\tag{6.8}
```

Here $`G_j`$ denotes the standardized independent normal increments.

*Proof.* The Gaussian density is twice differentiable in $`L^1`$ with respect to its variance parameters. The norm of its first directional derivative is bounded by the corresponding square root of the Fisher information quadratic form, while its second directional derivative satisfies

```math
\|Dp_s[z]\|_1\le\sqrt{\sum_jz_j^2J(s_j)},\qquad
\|D^2p_s[z,z]\|_1\le\sum_jz_j^2H_2(s_j).
```

Substituting (6.5) into the $`L^1`$ Taylor formula for the density gives $`\|p_{s_h}-p_s-hDp_s[d]\|_1\le C_2h^2`$. The density remainder integrates to zero, so the payoff can be centered as $`g-l-L/2`$, yielding (6.7). Appendix D gives the derivative calculations and the full justification by dominated convergence.  $`\square`$

The theorem applies the same leading density perturbation to all ten payoffs. For a put,

```math
\begin{gathered}
\beta_{K,\tau}
=a(\tau)\frac{S_0\varphi(d_1)}{2\sqrt{I(\tau)}},
\quad
d_1=\frac{\log(S_0/K)+r\tau+I(\tau)/2}{\sqrt{I(\tau)}}.
\end{gathered}
\tag{6.9}
```

When $`v_0\ne\bar v`$, all nine put components are nonzero and have the same sign as $`v_0-\bar v`$.

On the family

```math
\begin{gathered}
\kappa=3,\quad\bar v=.045,\quad v_0\in[.03,.06],\quad h_0=1/768,
\end{gathered}
\tag{6.10}
```

the second-order remainder for the original Asian payoff has the uniform upper bound $`.000165217`$. A separate finite-step density comparison also gives

```math
\begin{gathered}
|p_h(\psi)-p_c(\psi)|\le .004990924.
\end{gathered}
\tag{6.11}
```

The leading Asian coefficient has the exact integral representation (6.7) and an effective absolute bound. This common expansion handles several nonsmooth payoffs through one integrable density perturbation, and every remainder constant stays explicit.

### 6.1 Asian coefficient bounds and numerical illustration

The score bound from (6.7) and the first derivative norm gives

```math
\begin{gathered}
|\beta_{\rm Asian}|
\le {15e^{-rT}\over2}\sqrt{\sum_{j=1}^{12}d_j^2J(s_j)}.
\end{gathered}
\tag{6.12}
```

Table 4 gives pointwise coefficient and remainder bounds for the numerical family (6.10), with the remainder bounds coming from (6.5)–(6.8) and each point's lower increment variance. This gives a common expansion formula and explicit remainder bounds. The coefficient enclosures contain zero, and the signed twelve-dimensional Asian coefficient integral remains to be evaluated.

**Table 4. Analytic Asian coefficient enclosures and remainder bounds.**

| Initial variance | Certified coefficient enclosure | Upper bound on $`\|e_h-h\beta\|`$, $`h=1/768`$ |
| --- | --- | --- |
| 0.03 | $`[-3.441491358,3.441491358]`$ | 0.000121667773 |
| 0.04 | $`[-0.928189505,0.928189505]`$ | 0.000036646884 |
| 0.05 | $`[-0.785853082,0.785853082]`$ | 0.000034532369 |
| 0.06 | $`[-2.057270822,2.057270822]`$ | 0.000099684585 |

For a Monte Carlo illustration we use 2,097,152 Gaussian increment vectors per point, with common samples across the four step sizes in Table 5. In increasing order of initial variance, the coefficient estimates are -0.041015 (SE 0.002079), -0.011364 (SE 0.000566), 0.008329 (SE 0.000483), and 0.019917 (SE 0.001274). They are sampling estimates and should be kept distinct from the analytic enclosures in Table 4.

**Table 5. Sampling estimates of the scaled Asian expansion residual.**

| Initial variance | $`h=1/192`$ | $`1/384`$ | $`1/768`$ | $`1/1536`$ |
| --- | --- | --- | --- | --- |
| 0.03 | -0.063243 | -0.062944 | -0.062796 | -0.062722 |
| 0.04 | -0.017226 | -0.017145 | -0.017105 | -0.017085 |
| 0.05 | 0.011698 | 0.011646 | 0.011620 | 0.011607 |
| 0.06 | 0.027912 | 0.027785 | 0.027722 | 0.027690 |

The entries estimate $`(e_h-h\beta_{\rm Asian})/h^2`$ through a Gaussian density-ratio calculation. At $`h=1/768`$ their estimated standard errors are .003733, .001000, .000863, and .002319, respectively, and estimates across step sizes at a point are correlated. The scales stay stable, which is consistent with the second-order expansion. The $`h=1/192`$ and $`1/384`$ columns are diagnostics, since they lie outside the fixed $`h_0=1/768`$ range used for the numerical constants in (6.10) and Table 4.

## 7. From a reference family to stochastic-volatility posterior quantiles

### 7.1 Price transfer for small positive volatility of volatility

Suppose that the deterministic reference variance and its Euler values lie in $`[m,M]`$, where $`0\lt m\le M\lt \infty`$ and $`\kappa\ge\kappa_-\gt 0`$, and assume

```math
\begin{gathered}
\kappa h\le1,\qquad
0\le\xi\le\sqrt{\kappa_-M/2}.
\end{gathered}
\tag{7.1}
```

Define

```math
C_P=\sqrt{M/(2\kappa_-)},\qquad C_Q=\sqrt{2M/\kappa_-}.
```

The Itô isometry for the continuous model and the 1-Lipschitz property of the discrete positive-part projection give, respectively,

```math
\begin{gathered}
E(V_t^\xi-v(t))^2\le\xi^2C_P^2,\qquad
E(V_j^{\xi,h}-v_j)^2\le\xi^2C_Q^2.
\end{gathered}
\tag{7.2}
```

Combining the deterministic reference lower bound $`m`$ with Doob's inequality yields

```math
\begin{gathered}
E\max|Z_\ell^\xi-Z_\ell^0|
\le\xi C_\ell\left(\frac T2+2\sqrt{T/m}\right),\quad \ell=P,Q.
\end{gathered}
\tag{7.3}
```

In log stock price the original put payoff is $`K`$-Lipschitz, and in the maximum norm of the fixing log-price vector the original spread payoff is $`K_2=110`$-Lipschitz. Thus (7.3) provides uniform radii from all true calibration prices, and from the true target price, to their reference-family counterparts. Appendix E gives the inductive proof, which retains the effect of projection on the mean.

Take, for example, the parameter box of positive five-dimensional volume

```math
\begin{gathered}
\kappa\in[2.999,3.001],\quad\bar v\in[.04499,.04501],\\
v_0\in[.03001,.05999],\quad \xi\in[10^{-5},4\cdot10^{-5}],
\quad\rho\in[-.8,-.3],
\end{gathered}
\tag{7.4}
```

where the parameter coordinates are ordered as $`(\kappa,\bar v,\xi,\rho,v_0)`$. On this box, finite verification gives an absolute bias bound of $`.020948`$ for the original Asian and $`.016702`$ for each of the nine puts.

### 7.2 The full joint posterior

Forward numerical error acts on the likelihood and on its normalizing constant, a basic issue in Bayesian approximation [[11](#ref-11)]. In this section, set $`\kappa=3,\bar v=.045`$, and let

```math
\begin{gathered}
u=v_0\sim U[.03,.06],\quad
\xi\sim U[10^{-7},10^{-6}],\quad
\rho\sim U[-.8,-.3]
\end{gathered}
\tag{7.5}
```

be mutually independent. Write $`\zeta=(\xi,\rho)`$ and denote its prior probability measure by $`\nu`$. Throughout this posterior calculation and Appendix F, $`m\in\{P,Q\}`$ indexes the pricing model; $`\nu`$ remains the nuisance-parameter prior. For model $`m=P,Q`$, let $`c_m(u,\zeta)`$ be the true calibration vector and $`J_m(u,\zeta)`$ the true Asian price. Given synthetic quotes $`y`$ and a positive-definite covariance matrix $`\Sigma_d`$, define

```math
w_m(u,\zeta)=
\exp\!\left[-\frac12(c_m-y)^T\Sigma_d^{-1}(c_m-y)\right],
\quad \bar w_m(u)=\int w_m(u,\zeta)\nu(d\zeta),
```

```math
\begin{gathered}
Z_m=\frac1{.03}\int_{.03}^{.06}\bar w_m(u)\,du,\qquad
\mu_m(du,d\zeta)=\frac{w_m(u,\zeta)}{.03Z_m}\,du\,\nu(d\zeta).
\end{gathered}
\tag{7.6}
```

Each model uses its own calibration prices, normalizing constant, and target price.

### 7.3 A transfer theorem for every quantile level

**Theorem 7.1.** Suppose that the two marginal posteriors of $`u`$ admit a coupling $`(U_P,U_Q)`$ such that $`|U_P-U_Q|\le\delta_u`$ almost surely. Assume that the reference targets satisfy

```math
|J_P^0(u)-J_P^0(v)|\le L_0|u-v|,
\quad
|J_Q^0(u)-J_P^0(u)|\le\varepsilon_0,
```

and that the true targets satisfy $`|J_m(u,\zeta)-J_m^0(u)|\le e_{m,J}`$. Then the left generalized quantiles of the true targets under their respective full joint posteriors satisfy

```math
\begin{gathered}
\boxed{\quad
|q_Q(p)-q_P(p)|
\le \varepsilon_0+e_{P,J}+e_{Q,J}+L_0\delta_u
\quad(0\lt p\lt 1).\quad}
\end{gathered}
\tag{7.7}
```

*Proof.* For each model, define the conditional probability kernel

```math
K_m(u,d\zeta)=\frac{w_m(u,\zeta)}{\bar w_m(u)}\nu(d\zeta).
```

Extend the marginal coupling above by drawing $`\zeta_P`$ and $`\zeta_Q`$ from $`K_P(U_P,\cdot)`$ and $`K_Q(U_Q,\cdot)`$, respectively. Fubini's theorem shows that the resulting full marginals are exactly $`\mu_P`$ and $`\mu_Q`$. The triangle inequality gives

```math
|J_Q(U_Q,\zeta_Q)-J_P(U_P,\zeta_P)|
\le\varepsilon_0+e_{P,J}+e_{Q,J}+L_0\delta_u=:E.
```

Consequently, $`F_P(z-E)\le F_Q(z)\le F_P(z+E)`$. Taking left generalized inverses yields (7.7). The argument also applies to target distributions with atoms.  $`\square`$

### 7.4 Effective inputs and numerical conclusions

We partition $`[.03,.06]`$ into 4096 equal intervals and, on each interval and over the entire $`\zeta`$-domain, enclose the true likelihood using (7.3) and the reference Black prices. The same bounds remain valid after integration against the normalized prior $`\nu`$, so we can construct enclosures of the marginal CDFs while retaining their shared denominators, and an inverse-CDF coupling driven by a common uniform variable then gives $`\delta_u`$. Appendix F gives all constants and the finite pairing algorithm.

The single-quote case uses the put with $`T=1,K=100`$, the nine-quote case uses the full calibration vector, and both use $`\Sigma_d=.75^2(.75I_d+.25\mathbf1\mathbf1^T)`$. Appendix F lists the exact quotes. The results are

```math
L_0\le213.792201829985,\quad
\varepsilon_0\le.004493504474,\quad
e_{P,J}+e_{Q,J}\le.000393595478,
```

```math
\begin{array}{c|c|c}
\text{Case}&\delta_u&\sup_{0\lt p\lt 1}|q_Q(p)-q_P(p)|\\ \hline
\text{Single quote}&3/204800&\le.008018821658\\
\text{Nine quotes}&3/81920&\le.012716404217
\end{array}
\tag{7.8}
```

The finite partition encloses the continuous posterior and retains the full normalizing mass of each model.

## 8. Numerical certificates and sensitivity

### 8.1 From formulas to certified monetary bounds

Table 6 assembles the price difference at the original parameter point, with displayed enclosures and upper bounds rounded outward. The exact endpoints, numerical constructions and reproduction instructions are in Appendix G.

**Table 6. Error budget for the principal Heston price certificate.**

| Quantity | Validated upper bound or enclosure |
| --- | --- |
| Nonlinear conversion interval | $`[-.010227461904,.010251125849]`$ |
| Q projection error per linear profile | $`.000000012711979137`$ |
| Q projection contribution over all linear profiles | $`.000004310413`$ |
| Omitted frequency tail for the continuous model | $`.000014095712`$ |
| Omitted frequency tail for the discrete model | $`.000184373301`$ |
| Periodization error for one model | $`.000195729318`$ |
| Total error bound for the linear difference between the two models | $`.000594238060`$ |
| **Absolute bound on the true arithmetic Asian bias** | $`\boldsymbol{.011025}`$ |

We compute reported widths from the exact ledger and round them outward, so subtracting displayed endpoints can differ in the final decimal place. For $`[\ell,u]`$, width means $`u-\ell`$, midpoint radius means $`(u-\ell)/2`$, and the absolute bias bound is $`\max(|\ell|,|u|)`$.

### 8.2 Step-grid certificates and the width plateau

Table 7 changes the Euler step and retains the main Heston parameters, payoff, fixing dates and transform catalogs. Every successful row includes the full error accounting and the alternative numerical checks described in Appendix G.

**Table 7. Signed Heston price-difference certificates at four Euler grids.**

| Step | Euler minus continuous enclosure | Width upper bound |
| --- | --- | --- |
| $`1/192`$ | No certificate: projection guard fails | Not available |
| $`1/384`$ | $`[-0.014169989568,0.013839530031]`$ | 0.028009519599 |
| $`1/768`$ | $`[-0.011024692273,0.010642371599]`$ | 0.021667063872 |
| $`1/1536`$ | $`[-0.010967952032,0.010766337995]`$ | 0.021734290027 |

The first row fails because of the fixed projection proof: at $`h=1/192`$ it gives $`\beta=184040303/23040000\lt 8`$, while its recurrence requires $`\beta\gt 8`$, so this sufficient condition does not certify that mesh. All three successful rows satisfy the absolute error tolerance .025. Table 8 separates their width contributions, and its exact unrounded entries sum to the interval widths.

**Table 8. Width contributions in price units for the three successful grids.**

| Width contribution | $`1/384`$ | $`1/768`$ | $`1/1536`$ |
| --- | --- | --- | --- |
| Payoff remainder | 0.026754977094 | 0.020478587752 | 0.020171631177 |
| Linear projection | 0.000265787793 | 0.000008620825 | 2.65628E-7 |
| P frequency tail | 0.000028191423 | 0.000028191423 | 0.000028191423 |
| Q frequency tail | 0.000177646019 | 0.000368746602 | 0.000751284529 |
| Periodization | 0.000782917272 | 0.000782917272 | 0.000782917272 |
| Rounding and endpoints | 1E-12 | 1E-12 | 1E-12 |

The entries of Table 8 are width contributions, not one-sided error radii, and rounding them separately can change their displayed sum. As the grid is refined the nonlinear shares are approximately 95.5, 94.5, and 92.8 percent. The total width no longer improves at the finest step, where the discrete frequency-tail contribution grows by more than the payoff remainder and projection contribution shrink. The frequency-tail bound in (C.7) uses the first-step lower bound $`i_0=hv_0`$, so refining the Euler grid alone does not tighten this fixed inversion design. The plateau describes the enclosure, not the true price error.

### 8.3 A second stochastic-variance parameter point

Keep the contract, twelve monthly fixings, $`h=1/768`$, and all parameters in (4.3) except the initial variance, which is now $`v_0=.04`$. We evaluate the weighted moments, projection prefixes, transforms, and continuous and discrete tails afresh at this point. The same growth estimate gives $`\exp(.6+4v_0)=\exp(.76)`$, so the retained $`\exp(.78)`$ moment allowance remains conservative. All real-loading, denominator, coefficient and complex branch conditions pass both numerical constructions.

**Table 9. Complete Heston certificate at initial variance .04.**

| Quantity | Certified enclosure or upper bound |
| --- | --- |
| Continuous price | $`[6.499318797594,6.509948941256]`$ |
| Projected-Euler price | $`[6.498150434416,6.510702536853]`$ |
| Euler minus continuous | $`[-0.011798506840,0.011383739259]`$ |
| Signed-interval width | 0.023182246099 |

The enclosure combines the nonlinear remainder with projection, both frequency tails, periodization and outward arithmetic, and Appendix G's package records its six exact width contributions and the complete alternative checks. Relative to $`v_0=.045`$ the signed-interval width increases by about 6.99 percent, and about 83.2 percent of that increase comes from the discrete frequency-tail contribution, which rises from approximately .0003687466014 to .0016298806683. The tail bound weakens for two reasons visible in (C.7): the smaller $`v_0`$ lowers the first-step floor $`i_0=hv_0`$, and the negative first-month Laplace coefficient also increases $`\overline L_Q(U)=\exp(A+bv_0)`$. The comparison measures enclosure tightness, not an increase in the true bias. This is a second pointwise certificate with the same Feller index.

### 8.4 Coverage and sensitivity design

The main point has Feller index $`2\kappa\bar v/\xi^2=2700/529`$, approximately 5.104. Testing sensitivity to the variance boundary, correlation, strikes, initial variance and fixing frequency takes new moment, projection and tail inputs for each case. Changing to 52 or 252 fixings, for instance, requires an aligned Euler grid, so $`h=1/768`$ cannot be retained, and the first fixing also changes the weight $`I_1^{-1/2}`$ in the payoff bound. The path comparisons below explore these sensitivities and leave the certified parameter domain where it was.

### 8.5 Independent path diagnostics for boundary and fixing sensitivity

The path study couples an Euler grid to one with twice as many steps, using 32,768 paths per case. Table 10 reports three of the fourteen cases, selected by Feller index; the full study also varies correlation, strikes, initial variance and step size. The coarse-minus-fine estimates have sampling error and retain the finer model's discretization bias.

**Table 10. Coupled path diagnostics at three Feller indices.**

| Case | Coarse minus fine, estimate and standard error | Projection fraction, coarse |
| --- | --- | --- |
| Feller 5.104 | -0.0000269; SE 0.0004717 | 0.0000000 |
| Feller 0.999 | 0.0001129; SE 0.0012453 | 0.0011268 |
| Feller 0.639 | 0.0009133; SE 0.0018375 | 0.0066991 |

All three price-difference estimates have magnitude below one estimated standard error, so Table 10 resolves neither their signs nor a systematic increase in pricing bias. The proposal frequencies support only the increased incidence of negative variance proposals near and below the boundary, and they should not be read as projection-error bounds.

The fixing comparison shows the sensitivity of the smoothing weight, though it also changes the time grid. For 12, 52, and 252 fixings, the sampled means of $`I_1^{-1/2}`$ are 16.489, 34.078, and 74.871, on aligned coarse grids of 768, 832, and 1008 steps, respectively, with twice as many fine steps.

### 8.6 Continuous-model valuation and numerical risk budgets

Suppose that a valuation system provides a price enclosure $`[q_L,q_U]`$ for the same discrete model. Theorem 4.1 gives $`e_h\in[\ell,u]`$, hence the continuous-model price satisfies

```math
\begin{gathered}
p_c\in[q_L-u,\ q_U-\ell].
\end{gathered}
\tag{8.1}
```

For (4.3), the direct continuous-price interval (4.5) has width below $`.010498`$. These two routes give enclosures in price units for valuation and implementation checks.

### 8.7 Stability of the price distribution after calibration

Changing the numerical implementation affects both the calibration likelihood and the target price, and Theorem 7.1 retains both effects: $`\varepsilon_0+e_{P,J}+e_{Q,J}`$ controls the target-price difference at fixed parameters, and $`L_0\delta_u`$ controls the target change caused by movement of the parameter posterior.

On the original 4096-cell grid, the transport contribution accounts for about 39 percent of the single-quote bound and 62 percent of the nine-quote bound, which is the reason for the grid refinement in the next subsection. The nine-quote enclosure is wider because of its conservative transport contribution, and that does not imply a larger true numerical bias.

### 8.8 Posterior grid refinement

Table 11 keeps the same prior (7.5), synthetic observations, likelihood covariance and target Lipschitz constant. Each row verifies the full-cell likelihood bounds and coupling inequalities and bounds the displacement of every Asian-price quantile.

**Table 11. Certified Asian-price quantile displacement under posterior grid refinement.**

| Cells | Single quote | Nine quotes | Coupling steps, single/nine |
| --- | --- | --- | --- |
| 4096 | 0.008018821658 | 0.012716404217 | 2 / 5 |
| 8192 | 0.006452960804 | 0.010367612938 | 2 / 7 |
| 16384 | 0.006061495591 | 0.009584682511 | 3 / 12 |

Refinement leaves the common nonmesh error contributions unchanged and increases the coupling step counts, so the final bound does not scale exactly as the cell width. With equal cells and the global target Lipschitz constant, the new bounds at 16384 cells are approximately 24.4 percent and 24.6 percent smaller than the original single- and nine-quote bounds.

The absolute 2.5, 50, and 97.5 percent quantile brackets concern the initial-variance marginal. For the continuous-model posterior with 4096 cells, the single-quote brackets are approximately [.0307690,.0307764], [.0444067,.0444141], and [.0590917,.0590992], and the nine-quote brackets are [.0308203,.0308350], [.0435131,.0435425], and [.0587182,.0587256]. These brackets describe parameter uncertainty. The displacement bounds are in price units, and measuring them against the target's posterior uncertainty scale requires absolute Asian-price target quantiles, which remain to be evaluated.

## 9. Domain of validity

The structural conditions are sufficient for certification. Section 5 verifies a deterministic-variance class and the specified Heston model and projected kernel, and Section 8 varies the step at the principal point and certifies a second initial variance. Extending these enclosures to a parameter neighborhood requires uniform moment, transform, projection and tail inequalities. The small-positive-$`\xi`$ box in Section 7 is a separate certified region.

Section 6 gives a common expansion formula and explicit remainder bounds for $`\xi=0`$. The nine put coefficients are nonzero when $`v_0\ne\bar v`$, whereas for the Asian coefficient we have a score integral and analytic bounds containing zero. An expansion for positive $`\xi`$ requires additional regularity and integrable remainders for the projection kernel and payoff kinks.

The posterior displacement bounds apply to the restricted prior (7.5) and synthetic quotes. Transfer on the five-dimensional parameter domain

```math
[2,4]\times[.03,.06]\times[.18,.28]\times[-.8,-.3]\times[.03,.06]
```

in coordinate order $`(\kappa,\bar v,\xi,\rho,v_0)`$ requires uniform forward-error and posterior-transport inputs. Absolute Asian-price target quantiles and the signed Asian leading-coefficient integral remain to be computed.

The width plateau in Section 8 comes from the separate-law remainder. Proposition I.1 provides a direct coupled-remainder inequality, and Appendix I certifies its additional coupled moments for a deterministic-variance example. Those moments remain to be established for the stochastic-variance Heston examples. Controlling them and tightening the discrete frequency tail are distinct mathematical requirements for a shrinking certificate width.

## 10. Conclusion

The common Gaussian structure connects classical lognormal conditioning with stochastic-variance models discretized by projected Euler. Building on it, the central lemma converts the kink remainder of the original arithmetic payoff into a second moment weighted by the inverse square root of integrated variance. The main theorem combines this quantity with a finite transform certificate to produce a signed price-difference enclosure. For the specified Heston instance the result is the complete monetary bound $`.011025`$, together with a validated interval for the continuous-model price.

The step-grid study shows that payoff conversion dominates the interval width and that the fixed discrete-tail bound can offset what a finer Euler grid gains. We also confirm a complete parameter-specific execution at a second stochastic-variance point, and the deterministic example in Appendix I gives a strictly narrower coupled nonlinear interval. On their stated parameter families, the common Gaussian expansion and the posterior coupling give additional formula-level and price-unit bounds.

## Appendices and Supporting Material

This page includes the complete main text and references. Appendices, supplementary proofs, code, and verification material are available in the [GitHub repository](https://github.com/130U/certified-valuation-arithmetic-asian-options) and the [full manuscript](https://github.com/130U/certified-valuation-arithmetic-asian-options/blob/846bbe6acbaa4eaac07e20d5d2c566b3abc5456d/manuscript/report.md#appendix-a-finite-certification-of-the-weighted-second-moment).

## References

<a id="ref-1"></a>

1. Curran, Michael. Valuing Asian and Portfolio Options by Conditioning on the Geometric Mean Price. *Management Science*, 40(12):1705–1711, 1994. [https://doi.org/10.1287/mnsc.40.12.1705](https://doi.org/10.1287/mnsc.40.12.1705).

<a id="ref-2"></a>

2. Rogers, L. C. G., Shi, Z. The value of an Asian option. *Journal of Applied Probability*, 32(4):1077–1088, 1995. [https://doi.org/10.2307/3215221](https://doi.org/10.2307/3215221).

<a id="ref-3"></a>

3. Thompson, G. W. P. Fast narrow bounds on the value of Asian options. Judge Institute of Management, University of Cambridge, WP09/2002, 2002. [https://www.jbs.cam.ac.uk/wp-content/uploads/2020/08/wp0209.pdf](https://www.jbs.cam.ac.uk/wp-content/uploads/2020/08/wp0209.pdf).

<a id="ref-4"></a>

4. Fusai, Gianluca, and Kyriakou, Ioannis. General Optimized Lower and Upper Bounds for Discrete and Continuous Arithmetic Asian Options. *Mathematics of Operations Research*, 41(2):531–559, 2016. [https://doi.org/10.1287/moor.2015.0739](https://doi.org/10.1287/moor.2015.0739). Accepted manuscript: [https://openaccess.city.ac.uk/id/eprint/13241/1/AsianBound_FK.pdf](https://openaccess.city.ac.uk/id/eprint/13241/1/AsianBound_FK.pdf).

<a id="ref-5"></a>

5. Heston, Steven L. A Closed-Form Solution for Options with Stochastic Volatility with Applications to Bond and Currency Options. *The Review of Financial Studies*, 6(2):327–343, 1993. [https://doi.org/10.1093/rfs/6.2.327](https://doi.org/10.1093/rfs/6.2.327).

<a id="ref-6"></a>

6. Kim, Bara, Kim, Jeongsim, Kim, Jerim, and Wee, In Suk. A recursive method for discretely monitored geometric Asian option prices. *Bulletin of the Korean Mathematical Society*, 53(3):733–749, 2016. [https://doi.org/10.4134/BKMS.b150283](https://doi.org/10.4134/BKMS.b150283).

<a id="ref-7"></a>

7. QuantLib contributors. AnalyticDiscreteGeometricAveragePriceAsianHestonEngine. Official source code; fixed revision. [https://github.com/lballabio/QuantLib/blob/966a4cc101049ca36a888b2ce223aa96d3f3b22d/ql/experimental/asian/analytic_discr_geom_av_price_heston.hpp](https://github.com/lballabio/QuantLib/blob/966a4cc101049ca36a888b2ce223aa96d3f3b22d/ql/experimental/asian/analytic_discr_geom_av_price_heston.hpp).

<a id="ref-8"></a>

8. Talay, Denis, Tubaro, Luciano. Expansion of the global error for numerical schemes solving stochastic differential equations. *Stochastic Analysis and Applications*, 8(4):483–509, 1990. [https://doi.org/10.1080/07362999008809220](https://doi.org/10.1080/07362999008809220).

<a id="ref-9"></a>

9. Mickel, Annalena, and Neuenkirch, Andreas. The weak convergence order of two Euler-type discretization schemes for the log-Heston model. *IMA Journal of Numerical Analysis*, 43(6):3326–3356, 2023. [https://doi.org/10.1093/imanum/drac069](https://doi.org/10.1093/imanum/drac069).

<a id="ref-10"></a>

10. Bally, Vlad, Talay, Denis. The law of the Euler scheme for stochastic differential equations: I. Convergence rate of the distribution function. *Probability Theory and Related Fields*, 104(1):43–60, 1996. [https://doi.org/10.1007/BF01303802](https://doi.org/10.1007/BF01303802).

<a id="ref-11"></a>

11. Cotter, S. L., Dashti, M., Stuart, A. M. Approximation of Bayesian Inverse Problems for PDEs. *SIAM Journal on Numerical Analysis*, 48(1):322–345, 2010. [https://doi.org/10.1137/090770734](https://doi.org/10.1137/090770734).

<a id="ref-12"></a>

12. Johansson, Fredrik. Arb: Efficient Arbitrary-Precision Midpoint-Radius Interval Arithmetic. *IEEE Transactions on Computers*, 66(8):1281–1292, 2017. [https://doi.org/10.1109/TC.2017.2690633](https://doi.org/10.1109/TC.2017.2690633).

<a id="ref-13"></a>

13. Lee, Roger W. Option Pricing by Transform Methods: Extensions, Unification, and Error Control. *The Journal of Computational Finance*, 7(3):51–86, 2004. [https://doi.org/10.21314/JCF.2004.121](https://doi.org/10.21314/JCF.2004.121).
