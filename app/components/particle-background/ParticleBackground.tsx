"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ParticleBackground.module.css";

type ParticleState = "checking" | "ready" | "fallback";

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
          onUnavailable: () => {
            if (!cancelled) setState("fallback");
          },
        });
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
      engine?.dispose();
    };
  }, []);

  return (
    <div className={styles.root} data-state={state}>
      <canvas className={styles.canvas} ref={canvasRef} aria-hidden="true" />
      <span className={styles.fallbackName} aria-hidden="true">
        Theodore
      </span>
    </div>
  );
}
