"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./ParticleBackground.module.css";
import { particleModeForPathname } from "./particle-mode";
import type { ParticleMode } from "./particle-types";

type ParticleState = "checking" | "ready" | "fallback";

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<import("./particle-engine").ParticleEngine | undefined>(
    undefined,
  );
  const pathname = usePathname();
  const mode = particleModeForPathname(pathname);
  const modeRef = useRef<ParticleMode>(mode);
  const [state, setState] = useState<ParticleState>("checking");

  useEffect(() => {
    let cancelled = false;
    let engine: import("./particle-engine").ParticleEngine | undefined;

    const initialize = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      try {
        const { ParticleEngine } = await import("./particle-engine");
        if (cancelled) return;
        engine = new ParticleEngine(canvas, {
          initialMode: modeRef.current,
          onUnavailable: () => {
            if (!cancelled) setState("fallback");
          },
        });
        engineRef.current = engine;
        const ready = await engine.initialize();
        if (cancelled) {
          engine.dispose();
          return;
        }
        setState(ready ? "ready" : "fallback");
      } catch {
        engine?.dispose();
        if (!cancelled) setState("fallback");
      }
    };

    void initialize();
    return () => {
      cancelled = true;
      engineRef.current = undefined;
      engine?.dispose();
    };
  }, []);

  useEffect(() => {
    modeRef.current = mode;
    engineRef.current?.setMode(mode);
  }, [mode]);

  return (
    <div className={styles.root} data-mode={mode} data-state={state}>
      <canvas className={styles.canvas} ref={canvasRef} aria-hidden="true" />
      <span className={styles.ambientFallback} aria-hidden="true" />
      <span className={styles.readingVeil} aria-hidden="true" />
      {mode === "hero" ? (
        <span className={styles.fallbackName} aria-hidden="true">
          Theodore
        </span>
      ) : null}
    </div>
  );
}
