import type { ParticleMode } from "./particle-types";

export function particleModeForPathname(pathname: string): ParticleMode {
  return pathname === "/" ? "hero" : "ambient";
}
