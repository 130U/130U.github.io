import type { CSSProperties, ReactNode } from "react";
import { Arrow, Dot, Figure, Mark, Plot, Schematic, Tx, linear, path, styles as kit, type Crosshair } from "./kit";
import styles from "./Figures.module.css";

/* The four figures of "Critical Dependence Stress", drawn natively from the
   formulas that produced the manuscript images: Figures 1 and 2 follow
   code/generate_mechanism_figures.py, Figures 3 and 4 follow
   new-computations/plot_profiles_and_flows.py (130U/Critical-Dependence-Stress
   at the pinned source commit). Captions stay the manuscript's own. */

export type ManuscriptFigureProps = {
  manuscript: { anchor?: string; captionId: string; attributes: Record<string, string | number> };
  caption: ReactNode;
};

const fmt = (value: number, digits = 2) => value.toFixed(digits);
const pct = (value: number, span: number) => (value / span) * 100;

/* ---------- Figure 1: local transport and full marginal compensation ---------- */

function TailLayerFigure({ manuscript, caption }: ManuscriptFigureProps) {
  // Panel (a): position u in [0, 1] across, normal coordinate B - v in [-0.5, 0.5] up.
  const [aw, ah] = [300, 230];
  const ax = (u: number) => u * aw;
  const ay = (v: number) => (0.5 - v) * ah;
  const moves = [[0.22, -0.07, 0.13, 0.2], [0.47, 0.07, 0.15, -0.23], [0.7, -0.02, 0.12, 0.18]] as const;

  // Panel (b): coordinate q from l_i (0) to r_i (2), discrepancy in [-1.9, 1.6].
  const [bw, bh] = [300, 230];
  const bx = (q: number) => (q / 2) * bw;
  const by = (d: number) => ((1.6 - d) / 3.5) * bh;
  const delta = (q: number) => Math.sin(2 * Math.PI * q) * Math.sin((Math.PI * q) / 2) ** 2;
  const qs = Array.from({ length: 241 }, (_, index) => (2 * index) / 240);
  const line = (sign: number) => qs.map((q, index) => `${index ? "L" : "M"}${fmt(bx(q))},${fmt(by(sign * delta(q)))}`).join(" ");
  const shade = `${line(1)} L${fmt(bx(2))},${fmt(by(0))} L${fmt(bx(0))},${fmt(by(0))} Z`;

  return (
    <Figure
      id="dependence-tail-layer"
      caption={caption}
      manuscript={manuscript}
      legend={[{ label: "Local discrepancy $\\Delta_i$", tone: "accent", shape: "line" }, { label: "Remaining plan: $-\\Delta_i$", tone: "ink", shape: "dash" }]}
    >
      <div className={styles.panels}>
        <div className={styles.panel}>
          <p className={styles.panelTitle}>(a) Local transport in a thin layer</p>
          <Schematic
            label="A thin layer around the tail surface B = v, of thickness of order epsilon; points of the layer move over distances of order epsilon, so the local transport cost is of order epsilon squared."
            size={[aw, ah]}
            inset={{ left: 18, bottom: 30 }}
            yTitle="Normal loss coordinate $B-v$"
            xTitle="Position along the tail surface"
            art={<>
              <rect className={styles.layerBand} x={0} y={ay(0.13)} width={aw} height={ay(-0.13) - ay(0.13)} />
              <line className={kit.accent} x1={0} y1={ay(0)} x2={aw} y2={ay(0)} />
              {moves.map(([u, v, du, dv]) => (
                <g key={u} className={kit.accent}>
                  <Arrow from={[ax(u), ay(v)]} to={[ax(u + du), ay(v + dv)]} head={8} />
                  <circle cx={ax(u)} cy={ay(v)} r={3.6} data-head="" />
                </g>
              ))}
              <Arrow className={kit.steel} from={[ax(0.93), ay(0.13)]} to={[ax(0.93), ay(-0.13)]} head={6} both />
              <line data-axis="" x1={0} y1={0} x2={0} y2={ah} />
              <line data-axis="" x1={0} y1={ah} x2={aw} y2={ah} />
            </>}
          >
            <Mark left={0} top={pct(ay(0), ah)} anchor="right" className={kit.muted}>0</Mark>
            <Mark left={2} top={pct(ay(0), ah)} anchor="above-right" tone="accent">$B=v$</Mark>
            <Mark left={93} top={pct(ay(0.13), ah)} anchor="bottom">$O(\varepsilon)$</Mark>
            <Mark left={3} top={pct(ay(0.47), ah)} anchor="top-left" className={styles.note}>
              <><Tx>{"Mass $O(\\varepsilon)$ × distance $O(\\varepsilon)$"}</Tx><br /><Tx>{"Local transport cost $O(\\varepsilon^2)$"}</Tx></>
            </Mark>
          </Schematic>
        </div>
        <div className={styles.panel}>
          <p className={styles.panelTitle}>(b) Cancellation of full marginal discrepancies</p>
          <Schematic
            label="A signed marginal CDF discrepancy along one coordinate from l_i to r_i, with the remaining plan supplying its negative; the compensation cost is gamma_i times the integral of its absolute value."
            size={[bw, bh]}
            inset={{ left: 18, bottom: 30 }}
            yTitle="Signed marginal CDF discrepancy"
            xTitle="Coordinate value $q$"
            art={<>
              <path className={styles.discrepancyShade} data-fill="" d={shade} />
              <line className={kit.steel} x1={0} y1={by(0)} x2={bw} y2={by(0)} />
              <path className={kit.ink} data-dash="" d={line(-1)} />
              <path className={kit.accent} d={line(1)} />
              <line data-axis="" x1={0} y1={0} x2={0} y2={bh} />
              <line data-axis="" x1={0} y1={bh} x2={bw} y2={bh} />
            </>}
          >
            <Mark left={0} top={pct(by(0), bh)} anchor="right" className={kit.muted}>0</Mark>
            <Mark left={0} top={100} anchor="top" className={kit.muted}>$\ell_i$</Mark>
            <Mark left={100} top={100} anchor="top" className={kit.muted}>$r_i$</Mark>
            <Mark left={4} top={0} anchor="top-left">{"Compensation cost $\\gamma_i\\int|\\Delta_i(q)|\\,dq$"}</Mark>
          </Schematic>
        </div>
      </div>
    </Figure>
  );
}

/* ---------- Figure 2: corner demand and return capacity ---------- */

function CornerCapacityFigure({ manuscript, caption }: ManuscriptFigureProps) {
  const delta = 0.35;
  // Coordinates from xi_- = 0 to xi_+ = 2, with a margin for the axes and labels.
  const [from, to] = [-0.1, 2.34];
  const side = 244;
  const X = (u: number) => ((u - from) / (to - from)) * side;
  const Y = (v: number) => ((to - v) / (to - from)) * side;
  const at = (u: number, v: number) => ({ left: pct(X(u), side), top: pct(Y(v), side) });
  const points = (list: ReadonlyArray<readonly [number, number]>) => list.map(([u, v]) => `${fmt(X(u))},${fmt(Y(v))}`).join(" ");
  const omega = [[0, 0.25], [0.25, 0], [2, 0], [2, 1.75], [1.75, 2], [0, 2]] as const;
  return (
    <Figure id="dependence-corner" className={styles.cornerFigure} caption={caption} manuscript={manuscript}>
      <div className={styles.corner}>
        <div className={styles.panel}>
          <p className={styles.panelTitle}>Projected source geometry</p>
          <Schematic
            label="The projected source region Omega on the square from xi minus to xi plus, with the corner region E delta at the upper left, away from the diagonal x = y, and two hatched return triangles R1 and R2 on the diagonal at the lower left and upper right."
            size={[side, side]}
            inset={{ top: 22, left: 18, right: 14, bottom: 28 }}
            art={<>
              <defs>
                <pattern id="corner-hatch" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="5" className={styles.hatchLine} />
                </pattern>
              </defs>
              <polygon className={styles.omega} points={points(omega)} />
              <line className={kit.steel} data-dash="" x1={X(0)} y1={Y(0)} x2={X(2)} y2={Y(2)} />
              <g data-key="capacity" className={styles.capacity}>
                <polygon points={points([[0, 0], [delta, 0], [delta, delta]])} fill="url(#corner-hatch)" />
                <polygon points={points([[2 - delta, 2 - delta], [2, 2 - delta], [2, 2]])} fill="url(#corner-hatch)" />
              </g>
              <rect data-key="demand" className={styles.demand} x={X(0)} y={Y(2)} width={X(delta) - X(0)} height={Y(2 - delta) - Y(2)} />
              <g className={kit.ink}><Arrow from={[X(0.62), Y(2.15)]} to={[X(0.24), Y(1.86)]} head={6} /></g>
              <g className={kit.ink}><Arrow from={[X(0.74), Y(0.2)]} to={[X(0.3), Y(0.13)]} head={6} /></g>
              <g className={kit.ink}><Arrow from={[X(2.14), Y(1.46)]} to={[X(1.93), Y(1.74)]} head={6} /></g>
              <line data-axis="" x1={0} y1={0} x2={0} y2={side} />
              <line data-axis="" x1={0} y1={side} x2={side} y2={side} />
            </>}
          >
            <Mark {...at(from, 0)} anchor="right" className={kit.muted}>$\xi_-$</Mark>
            <Mark {...at(from, 2)} anchor="right" className={kit.muted}>$\xi_+$</Mark>
            <Mark {...at(0, from)} anchor="top" className={kit.muted}>$\xi_-$</Mark>
            <Mark {...at(2, from)} anchor="top" className={kit.muted}>$\xi_+$</Mark>
            <Mark {...at(0.62, 1.3)} anchor="center" className={styles.omegaLabel}>$\Omega$</Mark>
            <Mark {...at(0.64, 2.16)} anchor="left">$E_\delta$</Mark>
            <Mark {...at(0.76, 0.2)} anchor="left">$R_1$</Mark>
            <Mark {...at(2.12, 1.4)} anchor="top">$R_2$</Mark>
            <Mark {...at(1.25, 0.97)} anchor="center" className={`${kit.muted} ${styles.diagonal}`}>$x=y$</Mark>
            <Mark left={0} top={0} anchor="right">$y$</Mark>
            <Mark left={100} top={100} anchor="left">$x$</Mark>
          </Schematic>
        </div>
        <dl className={styles.bounds}>
          <div data-key="demand">
            <dt><span className={`${kit.swatch} ${kit.accent}`} />Positive corner demand</dt>
            <dd><Tx>{"$|E_\\delta|\\geq\\delta^2/2,\\quad y-x\\geq\\Delta/2$"}</Tx></dd>
            <dd data-tone="accent"><Tx>{"$M_\\delta\\geq\\frac{\\lambda\\Delta^2}{16\\beta}\\,\\delta^2$"}</Tx></dd>
          </div>
          <div data-key="capacity">
            <dt><span className={kit.swatch} data-shape="hatch" />Available return capacity</dt>
            <dd><Tx>{"$|R_i|\\leq\\delta^2/2,\\quad |x-y|\\leq\\delta$"}</Tx></dd>
            <dd><Tx>{"$N_1+N_2\\leq\\frac{\\Lambda}{12\\beta}\\,\\delta^4$"}</Tx></dd>
          </div>
        </dl>
      </div>
    </Figure>
  );
}

/* ---------- Figure 3: proved risk envelopes in the uniform benchmark ---------- */

const J = 5 / 32;
const S_LIN = 1 / 96;
const LOW = 13 / 64;
const HIGH = 29 / 96;
const lowerEnvelope = (s: number) => (s <= S_LIN ? 2 * s - 5 / 16 : s - HIGH);
const upperEnvelope = (s: number) => Math.min(2 * s - 5 / 16, (4 / 3) * s - 13 / 48);
const signed = (value: number, digits = 4) => value.toFixed(digits).replace(/^-/u, "−");

function BudgetEnvelopesFigure({ manuscript, caption }: ManuscriptFigureProps) {
  const x = linear(0, 0.32);
  const y = linear(-0.34, 0.16);
  // Both envelopes are piecewise linear; their corners are exact.
  const upper = [[0, -5 / 16], [1 / 16, upperEnvelope(1 / 16)], [HIGH, upperEnvelope(HIGH)]] as const;
  const lower = [[0, -5 / 16], [S_LIN, lowerEnvelope(S_LIN)], [HIGH, 0]] as const;
  const band = [...upper, ...[...lower].reverse()];
  const reach = (0.16 + 5 / 16) / 2;
  const samples = Array.from({ length: 59 }, (_, index) => Math.min(index * 0.0052, HIGH));
  const crosshair: Crosshair = {
    x: samples.map((s) => x(s)),
    heading: samples.map((s) => `s = ${s.toFixed(4)}`),
    series: [
      { name: "Upper profile", tone: "ink", y: samples.map((s) => y(upperEnvelope(s))), value: samples.map((s) => signed(upperEnvelope(s))) },
      { name: "Attainable lower profile", tone: "accent", y: samples.map((s) => y(lowerEnvelope(s))), value: samples.map((s) => signed(lowerEnvelope(s))) },
    ],
  };
  // The inset: the exact initial interval and the first steps beyond it.
  const ix = linear(0, 0.02);
  const iy = linear(-0.316, -0.27);
  const insetUpper = [[0, -5 / 16], [0.02, upperEnvelope(0.02)]] as const;
  const insetLower = [[0, -5 / 16], [S_LIN, lowerEnvelope(S_LIN)], [0.02, lowerEnvelope(0.02)]] as const;
  const zoom = { left: `${x(0)}%`, width: `${x(0.02)}%`, top: `${100 - y(-0.27)}%`, height: `${y(-0.27) - y(-0.316)}%` };
  return (
    <Figure
      id="dependence-envelopes"
      caption={caption}
      manuscript={manuscript}
      legend={[
        { label: "Proved range for $F(s)$", tone: "accent", shape: "tint" },
        { label: "Attainable lower profile", tone: "accent", shape: "line" },
        { label: "Upper profile", tone: "ink", shape: "line" },
        { label: "Initial-slope extrapolation", tone: "steel", shape: "dash" },
        { label: "Exact initial segment", tone: "green", shape: "line" },
      ]}
    >
      <Plot
        label="Proved risk envelopes on the budget interval from 0 to 29/96: the lower profile is 2s minus 5/16 up to 1/96 and s minus 29/96 after; the upper profile is the minimum of 2s minus 5/16 and 4s/3 minus 13/48. The upper profile crosses zero at 13/64 and the lower at 29/96; the initial-slope line crosses zero at 5/32."
        x={x}
        y={y}
        height="clamp(290px, 62cqi, 360px)"
        inset={{ top: 40 }}
        xTicks={[0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3].map((at) => ({ at, label: at === 0 ? "0" : at.toFixed(2), edge: at === 0 ? "start" as const : undefined }))}
        yTicks={[-0.3, -0.2, -0.1, 0, 0.1].map((at) => ({ at, label: at === 0 ? "0" : signed(at, 1), solid: at === 0 }))}
        yTitle="Rescaled paired risk"
        xTitle="Rescaled stress budget $s$"
        crosshair={crosshair}
        curves={<>
          <path className={styles.rangeFill} data-fill="" d={path(band, x, y, true)} />
          <path className={kit.steel} data-dash="" d={path([[0, -5 / 16], [reach, 0.16]], x, y)} />
          <path className={kit.accent} d={path(lower, x, y)} />
          <path className={kit.ink} d={path(upper, x, y)} />
          <path className={kit.ink} data-thick="" d={path([[LOW, 0], [HIGH, 0]], x, y)} />
          <path className={kit.green} data-thick="" d={path([[0, -5 / 16], [S_LIN, lowerEnvelope(S_LIN)]], x, y)} />
        </>}
      >
        <span className={styles.criticalBand} style={{ left: `${x(LOW)}%`, width: `${x(HIGH) - x(LOW)}%` }} />
        <span className={styles.zoomWindow} style={zoom} />
        <Dot left={x(J)} top={100 - y(0)} tone="steel" tip={"Initial-slope extrapolation\nJ = 5/32 = 0.15625"} />
        <Dot left={x(LOW)} top={100 - y(0)} tone="ink" tip={"Upper profile reaches zero\ns = 13/64 = 0.203125"} />
        <Dot left={x(HIGH)} top={100 - y(0)} tone="ink" tip={"Lower profile reaches zero\ns = 29/96 = 0.302083…"} />
        <Mark left={x(J)} top={100 - y(0)} anchor="above-left" tag>$J=5/32$</Mark>
        <Mark left={(x(LOW) + x(HIGH)) / 2} top={0} anchor="bottom" className={styles.criticalLabel}>$13/64\leq s^*\leq 29/96$</Mark>
      </Plot>
      <div className={styles.inset}>
        <p className={styles.insetTitle}><Tx>{"Initial range: $s_{\\rm lin}=1/96$"}</Tx></p>
        <Plot
          label="Inset on budgets from 0 to 0.02: the two profiles coincide with the exact initial segment 2s minus 5/16 up to s = 1/96, then separate."
          x={ix}
          y={iy}
          height="clamp(170px, 34cqi, 200px)"
          inset={{ top: 10, left: 52, bottom: 34 }}
          xTicks={[0, 0.01, 0.02].map((at) => ({ at, label: at === 0 ? "0" : at.toFixed(2), edge: at === 0 ? "start" as const : at === 0.02 ? "end" as const : undefined }))}
          yTicks={[-0.31, -0.29, -0.27].map((at) => ({ at, label: signed(at, 2) }))}
          curves={<>
            <path className={styles.rangeFill} data-fill="" d={path([...insetUpper, ...[...insetLower].reverse()], ix, iy, true)} />
            <path className={kit.accent} d={path(insetLower, ix, iy)} />
            <path className={kit.ink} d={path(insetUpper, ix, iy)} />
            <path className={kit.green} data-thick="" d={path([[0, -5 / 16], [S_LIN, lowerEnvelope(S_LIN)]], ix, iy)} />
          </>}
        >
          <span className={`${styles.vline} ${styles.greenRule}`} style={{ left: `${ix(S_LIN)}%` }} />
        </Plot>
      </div>
    </Figure>
  );
}

/* ---------- Figure 4: optimal shares of normal displacement ---------- */

const GAUSS = [
  [0.1834346424956498, 0.362683783378362], [0.525532409916329, 0.3137066458778873],
  [0.7966664774136267, 0.2223810344533745], [0.9602898564975363, 0.1012285362903763],
] as const;

function demand(x: number, dependent: boolean) {
  const r = Math.max(2 * x - 1, 0);
  return dependent ? (r ** 3 * (30 + 5 * r - r * r)) / 1920 : r ** 3 / 48;
}

function density(x: number, y: number, dependent: boolean) {
  const q = (y - x) ** 2 / 16;
  return dependent ? q * (1 - (x + y - 2) ** 2 / 4) : q;
}

/** Return capacity of the section at x: the integral of the density over y in [2 - x, 2]. */
function capacity(x: number, dependent: boolean) {
  let sum = 0;
  for (const [node, weight] of GAUSS) {
    for (const sign of [-1, 1]) sum += weight * density(x, 2 - x / 2 + (x / 2) * sign * node, dependent);
  }
  return (sum * x) / 2;
}

/** The cross-region share: same-side demand over the available return capacity. */
function share(x: number, dependent: boolean) {
  const available = capacity(x, dependent);
  return available > 0 ? demand(x, dependent) / available : 0;
}

/* A sequential ramp from a pale tint to the accent, interpolated in OKLab. */
function toLinear(channel: number) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function toOklab([r, g, b]: readonly [number, number, number]) {
  const [lr, lg, lb] = [toLinear(r), toLinear(g), toLinear(b)];
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s] as const;
}

function fromOklab([L, A, B]: readonly [number, number, number]) {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const channels = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return `#${channels.map((c) => {
    const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
    return Math.round(Math.min(Math.max(v, 0), 1) * 255).toString(16).padStart(2, "0");
  }).join("")}`;
}

const RAMP_LOW = toOklab([229, 228, 240]);
const RAMP_HIGH = toOklab([34, 0, 255]);
function ramp(value: number) {
  const t = Math.min(Math.max(value, 0), 1);
  return fromOklab([0, 1, 2].map((index) => RAMP_LOW[index] + (RAMP_HIGH[index] - RAMP_LOW[index]) * t) as unknown as [number, number, number]);
}

const RAMP_STOPS = Array.from({ length: 11 }, (_, index) => ramp(index / 10));

function FlowSharesFigure({ manuscript, caption }: ManuscriptFigureProps) {
  const side = 120;
  const X = (u: number) => (u / 2) * side;
  const Y = (v: number) => ((2 - v) / 2) * side;
  const points = (list: ReadonlyArray<readonly [number, number]>) => list.map(([u, v]) => `${fmt(X(u))},${fmt(Y(v))}`).join(" ");
  // The tail surface D = {x < y, 1 < x + y < 3} and its four sections.
  const region = {
    minus: [[0, 1], [0.5, 0.5], [1, 1]],
    plus: [[1, 1], [1.5, 1.5], [1, 2]],
    ea: [[0, 2], [1, 1], [1, 2]],
    eb: [[0, 1], [1, 1], [0, 2]],
  } as const;
  const outline = points([[0, 1], [0.5, 0.5], [1.5, 1.5], [1, 2], [0, 2]]);
  const offsets = Array.from({ length: 65 }, (_, index) => index / 64);
  const rows = [
    { key: "U", dependent: false, label: "U", note: "$\\vartheta=0$" },
    { key: "D", dependent: true, label: "D", note: "$\\vartheta=1/4$" },
  ];
  const columns = [
    { key: "a", title: "First coordinate $a$" },
    { key: "b", title: "Second coordinate $b$" },
    { key: "c", title: "Background $1-a-b$" },
  ] as const;
  // The first coordinate's cross-region share runs along x in [0, 1]; the
  // second's along y in [1, 2], where it is evaluated at 2 - y.
  const gradient = (id: string, dependent: boolean, complement: boolean, vertical: boolean) => (
    <linearGradient
      id={id}
      gradientUnits="userSpaceOnUse"
      x1={vertical ? 0 : X(0)} y1={vertical ? Y(1) : 0}
      x2={vertical ? 0 : X(1)} y2={vertical ? Y(2) : 0}
    >
      {offsets.map((offset) => {
        const value = share(vertical ? 1 - offset : offset, dependent);
        return <stop key={offset} offset={fmt(offset, 4)} stopColor={ramp(complement ? 1 - value : value)} />;
      })}
    </linearGradient>
  );
  const fill = (row: (typeof rows)[number], column: (typeof columns)[number]["key"], section: keyof typeof region) => {
    const id = `flow-${row.key}`;
    if (column === "a") return section === "plus" ? ramp(1) : section === "ea" ? `url(#${id}-a)` : ramp(0);
    if (column === "b") return section === "minus" ? ramp(1) : section === "eb" ? `url(#${id}-b)` : ramp(0);
    return section === "ea" ? `url(#${id}-ca)` : section === "eb" ? `url(#${id}-cb)` : ramp(0);
  };
  return (
    <Figure id="dependence-flow-shares" className={styles.flowFigure} caption={caption} manuscript={manuscript}>
      <svg className={styles.defs} aria-hidden="true" focusable="false">
        <defs>
          {rows.map((row) => (
            <g key={row.key}>
              {gradient(`flow-${row.key}-a`, row.dependent, false, false)}
              {gradient(`flow-${row.key}-b`, row.dependent, false, true)}
              {gradient(`flow-${row.key}-ca`, row.dependent, true, false)}
              {gradient(`flow-${row.key}-cb`, row.dependent, true, true)}
            </g>
          ))}
        </defs>
      </svg>
      <div className={kit.scrollViewport} data-figure-scroll role="region" tabIndex={0} aria-label="Normal displacement shares, scroll horizontally to compare">
      <div className={styles.shares} role="img" aria-label="Six panels on the square from 0 to 2: for models U and D, the shares of normal displacement assigned to the first coordinate, the second coordinate and the background on the tail surface D, each on the same scale from zero to one.">
        <span aria-hidden="true" />
        {columns.map((column) => <span key={column.key} className={styles.shareHead} aria-hidden="true"><Tx>{column.title}</Tx></span>)}
        {rows.map((row, rowIndex) => (
          <div key={row.key} className={styles.shareRow} aria-hidden="true">
            <span className={styles.shareRowHead}><strong>{row.label}</strong><Tx>{row.note}</Tx></span>
            {columns.map((column, columnIndex) => (
              <span key={column.key} className={styles.sharePanel} data-last-row={rowIndex === rows.length - 1 ? "" : undefined}>
                <svg viewBox={`0 0 ${side} ${side}`} focusable="false">
                  {(Object.keys(region) as Array<keyof typeof region>).map((section) => {
                    // A hairline in the same paint closes the seams between sections.
                    const paint = fill(row, column.key, section);
                    return <polygon key={section} data-key={section} points={points(region[section])} fill={paint} stroke={paint} strokeWidth={0.6} />;
                  })}
                  <polygon className={styles.shareOutline} points={outline} />
                  <line data-axis="" x1={0} y1={0} x2={0} y2={side} />
                  <line data-axis="" x1={0} y1={side} x2={side} y2={side} />
                </svg>
                {columnIndex === 0 && [0, 1, 2].map((tick) => <span key={tick} className={styles.shareTickY} style={{ top: `${pct(Y(tick), side)}%` }}>{tick}</span>)}
                {rowIndex === rows.length - 1 && [0, 1, 2].map((tick) => <span key={tick} className={styles.shareTickX} style={{ left: `${pct(X(tick), side)}%` } as CSSProperties}>{tick}</span>)}
                {columnIndex === 0 && rowIndex === 0 && <span className={styles.shareAxisY}><Tx>$y$</Tx></span>}
                {columnIndex === columns.length - 1 && rowIndex === rows.length - 1 && <span className={styles.shareAxisX}><Tx>$x$</Tx></span>}
              </span>
            ))}
          </div>
        ))}
      </div>
      </div>
      <div className={styles.colorbar} aria-hidden="true">
        <span className={styles.colorbarLabel}>Share of normal displacement</span>
        <span className={styles.colorbarRamp} style={{ background: `linear-gradient(to right, ${RAMP_STOPS.join(", ")})` }} />
        <span className={styles.colorbarTicks}><span>0</span><span>0.5</span><span>1</span></span>
      </div>
    </Figure>
  );
}

export const dependenceManuscriptFigures = {
  "dependence-tail-layer": TailLayerFigure,
  "dependence-corner": CornerCapacityFigure,
  "dependence-envelopes": BudgetEnvelopesFigure,
  "dependence-flow-shares": FlowSharesFigure,
} as const;
