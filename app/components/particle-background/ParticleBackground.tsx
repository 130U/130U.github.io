"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./ParticleBackground.module.css";
import { particleModeForPathname } from "./particle-mode";
import type { ParticleMode } from "./particle-types";

type ParticleState = "checking" | "ready" | "fallback";

const REVEAL_SAFETY_DELAY_MS = 420;

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
    let revealTimer: number | undefined;
    let revealCanvas: HTMLCanvasElement | undefined;
    let revealListener: ((event: TransitionEvent) => void) | undefined;

    const clearRevealGate = () => {
      if (revealTimer !== undefined) {
        window.clearTimeout(revealTimer);
        revealTimer = undefined;
      }
      if (revealListener && revealCanvas) {
        revealCanvas.removeEventListener("transitionend", revealListener);
        revealListener = undefined;
        revealCanvas = undefined;
      }
    };

    const reveal = (
      canvas: HTMLCanvasElement,
      particleEngine: import("./particle-engine").ParticleEngine,
    ) => {
      let activated = false;
      const activate = () => {
        if (activated || cancelled) return;
        activated = true;
        clearRevealGate();
        particleEngine.activate();
      };

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setState("ready");
        activate();
        return;
      }

      revealListener = (event) => {
        if (event.target === canvas && event.propertyName === "opacity") activate();
      };
      revealCanvas = canvas;
      canvas.addEventListener("transitionend", revealListener);
      revealTimer = window.setTimeout(activate, REVEAL_SAFETY_DELAY_MS);
      setState("ready");
    };

    const initialize = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      try {
        const { ParticleEngine } = await import("./particle-engine");
        if (cancelled) return;
        engine = new ParticleEngine(canvas, {
          initialMode: modeRef.current,
          onUnavailable: () => {
            if (!cancelled) {
              clearRevealGate();
              setState("fallback");
            }
          },
        });
        engineRef.current = engine;
        const ready = await engine.initialize();
        if (cancelled) {
          engine.dispose();
          return;
        }
        if (ready) reveal(canvas, engine);
        else setState("fallback");
      } catch {
        engine?.dispose();
        if (!cancelled) setState("fallback");
      }
    };

    void initialize();
    return () => {
      cancelled = true;
      clearRevealGate();
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
