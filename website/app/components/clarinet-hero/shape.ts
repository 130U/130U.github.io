// Hand-traced in 1286 × 1223 space.
// Continuous geometry supplies the particle masks and SVG fallback.
export const VIEW_WIDTH = 1286;
export const VIEW_HEIGHT = 1223;

function ellipse(x: number, y: number, rx: number, ry: number, rotation = 0) {
  const k = 0.5522847498;
  const c = Math.cos(rotation);
  const s = Math.sin(rotation);
  const p = (u: number, v: number) => `${(x + u * c - v * s).toFixed(3)} ${(y + u * s + v * c).toFixed(3)}`;
  return `M${p(rx, 0)} C${p(rx, ry * k)} ${p(rx * k, ry)} ${p(0, ry)} C${p(-rx * k, ry)} ${p(-rx, ry * k)} ${p(-rx, 0)} C${p(-rx, -ry * k)} ${p(-rx * k, -ry)} ${p(0, -ry)} C${p(rx * k, -ry)} ${p(rx, -ry * k)} ${p(rx, 0)} Z`;
}

// Slender beak, rounded barrel, two straight joints and a restrained flared bell.
export const BODY = "M945 103 C927 102 906 125 891 152 L880 176 L873 197 L865 227 C854 244 848 268 846 286 L841 296 L753 603 L750 616 L672 923 C666 941 659 959 648 979 C638 999 623 1022 607.28 1036.41 C604.79 1050.55 639.80 1068.55 685.485 1076.605 C731.17 1084.66 770.23 1079.73 772.72 1065.59 C775 1052 765 1028 758 1005 C749 978 750 958 754 940 L757 927 L827 624 L831 610 L901 302 L906 289 C914 271 918 249 916 237 L921 219 L929 193 L937 163 C940 144 943 119 945 103 Z";

// Reflective mouthpiece face.
export const TIP_OPENING = "M944 104 C928 105 918 119 910 136 C906 145 903 156 899 164 C916 165 929 153 935 136 C939 123 943 110 944 104 Z";
export const BELL_OPENING = ellipse(690, 1051, 79, 20, Math.PI / 18);
export const BELL_RIM = `${ellipse(690, 1051, 84, 26, Math.PI / 18)} ${BELL_OPENING}`;

// Ring-key centers show the tube's dark particle texture.
const HOLES = [
  { x: 841, y: 389, rx: 10.5, ry: 12.5, rotation: .16 },
  { x: 827, y: 450, rx: 10.5, ry: 12.5, rotation: .16 },
  { x: 811, y: 511, rx: 10.5, ry: 12.5, rotation: .16 },
  { x: 764, y: 690, rx: 10.5, ry: 12.5, rotation: .16 },
  { x: 749, y: 755, rx: 10.5, ry: 12.5, rotation: .16 },
  { x: 735, y: 818, rx: 10.5, ry: 12.5, rotation: .16 },
] as const;

// Closed annuli: fill with the evenodd rule, leaving the dark tube visible inside.
export const RINGS = HOLES.map(hole =>
  `${ellipse(hole.x, hole.y, 15.5, 17.5, hole.rotation)} ${ellipse(hole.x, hole.y, hole.rx, hole.ry, hole.rotation)}`,
).join(" ");

// Joint-band sampling regions follow the projected cylindrical surface.
export const BANDS = [
  "M881 171 C898 174 919 180 934 185 L931 194 C915 188 895 183 878 180 Z",
  "M874 194 C891 196 912 203 927 208 L924 217 C909 211 890 204 871 203 Z",
  "M865 225 C879 223 901 230 918 235 L916 245 C899 239 880 232 863 234 Z",
  "M847 284 C865 283 890 290 905 296 L901 304 C887 299 864 291 845 293 Z",
  "M751 605 C773 604 807 611 830 618 L827 627 C804 619 774 613 749 613 Z",
  "M672 925 C696 918 730 925 755 936 L752 945 C731 934 696 928 671 934 Z",
].join(" ");

// The two prominent rods and their short key connections.
export const RODS = [
  "M881 332 L824 570 M801 650 L748 887",
  "M855 394 L866 397 M841 454 L852 457 M825 516 L837 518",
  "M778 695 L790 698 M763 760 L775 763 M749 823 L762 826",
  "M865 405 L880 409 M789 704 L809 707 M759 849 L775 852",
  "M930 185 L940 190 M925 208 L934 214",
].join(" ");

const PAD_POSITIONS = [
  { x: 887, y: 408, rx: 17, ry: 11.5 },
  { x: 815, y: 703, rx: 17, ry: 12 },
  { x: 780, y: 848, rx: 14, ry: 10 },
] as const;
export const PADS = PAD_POSITIONS.map(pad => ellipse(pad.x, pad.y, pad.rx, pad.ry, -.72)).join(" ");
export const PAD_SHADOWS = PAD_POSITIONS.map(pad => ellipse(pad.x, pad.y + 4, pad.rx, pad.ry, -.72)).join(" ");

// Sampling regions for rod-end pivots and the two ligature screws.
export const DETAILS = [
  ...[[881, 332], [824, 570], [801, 650], [748, 887]].map(([x, y]) => ellipse(x, y, 6.2, 6.5)),
  ellipse(940, 190, 5, 5.5), ellipse(934, 214, 5, 5.5),
].join(" ");
export const ARC = [333, 558, 358, 311, 603, 105, 895, 215] as const;
export const NODE = { x: 975, y: 322, rx: 14, ry: 7, rotation: -.8 } as const;
// Solid musical accents are intentionally distinct from the stippled instrument.
export const NOTE = "M2 12 C-1 10 -4 12 -4 14 C-4 17 2 16 2 13 L2 0 C3 3 8 3 6 8 C6 5 3 5 3 4 L3 12 Z";
export const BEAMED_NOTE = "M2 12 C-1 10 -4 12 -4 14 C-4 17 2 16 2 13 L2 1 L13 -1 L13 10 C10 8 7 10 7 12 C7 15 13 14 13 11 L13 2 L3 4 L3 12 Z";
export const TRAILS = [
  [844, 919, 848, 752, 1129, 640, 1099, 502],
  [852, 956, 861, 838, 954, 695, 1054, 721],
  [848, 919, 873, 857, 920, 821, 976, 808],
] as const;

export function cubicPoint(points: readonly number[], t: number) {
  const s = 1 - t;
  return {
    x: s * s * s * points[0] + 3 * s * s * t * points[2] + 3 * s * t * t * points[4] + t * t * t * points[6],
    y: s * s * s * points[1] + 3 * s * s * t * points[3] + 3 * s * t * t * points[5] + t * t * t * points[7],
  };
}

export function makeGeometry() {
  return {
    body: new Path2D(BODY),
    negative: new Path2D(TIP_OPENING),
    tip: new Path2D(TIP_OPENING),
    bands: new Path2D(BANDS),
    rings: new Path2D(RINGS),
    rods: new Path2D(RODS),
    pads: new Path2D(PADS),
    padShadows: new Path2D(PAD_SHADOWS),
    details: new Path2D(DETAILS),
    bellOpening: new Path2D(BELL_OPENING),
    bellRim: new Path2D(BELL_RIM),
  };
}
