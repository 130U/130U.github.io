import compatibility from "./index.cjs";

export const {
  minimatch,
  Minimatch,
  GLOBSTAR,
  sep,
  escape,
  unescape,
  braceExpand,
  filter,
  makeRe,
  match,
  defaults,
} = compatibility;

export default compatibility;
