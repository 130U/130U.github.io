"use client";

import { useEffect, useRef } from "react";
import { createBalancedDitherField } from "./dither-mask";
import {
  cubicFalloff,
  DITHER_MOTION,
  integrateSpringAxis,
} from "./dither-motion";
import type { DitherPointField, DitherRipple } from "./dither-types";
import styles from "./DitheredEntrance.module.css";

export function DitheredEntrance() {
  const entranceRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const entrance = entranceRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !entrance || !stage) return;
    const context = canvas.getContext("2d");
    if (!context) {
      entrance.dataset.state = "fallback";
      return;
    }

    let field: DitherPointField = createBalancedDitherField(1);
    let ripples: DitherRipple[] = [];
    let frame = 0;
    let resizeFrame = 0;
    let destroyed = false;
    let cssSize = 1;
    let fadeStartedAt = performance.now();
    let pointerActive = false;
    let pointerX = 0;
    let pointerY = 0;
    let touchOrigin: { x: number; y: number; moved: boolean } | null = null;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const draw = (now: number) => {
      frame = 0;
      if (destroyed) return;

      const reducedMotion = motionQuery.matches;
      const readyProgress = reducedMotion
        ? 1
        : Math.min(1, (now - fadeStartedAt) / DITHER_MOTION.readyDuration);
      let stillMoving = readyProgress < 1;
      ripples = ripples.filter(
        (ripple) => now - ripple.startedAt <= DITHER_MOTION.rippleDuration,
      );

      context.clearRect(0, 0, cssSize, cssSize);
      context.fillStyle = "#070707";
      context.globalAlpha = readyProgress;
      context.beginPath();

      for (let index = 0; index < field.count; index += 1) {
        const homeX = field.homeX[index];
        const homeY = field.homeY[index];
        let targetX = homeX;
        let targetY = homeY;

        if (!reducedMotion && pointerActive) {
          const dx = homeX - pointerX;
          const dy = homeY - pointerY;
          const distance = Math.hypot(dx, dy);
          if (distance > 0.001 && distance < DITHER_MOTION.repelRadius) {
            const displacement =
              DITHER_MOTION.maximumDisplacement *
              cubicFalloff(distance, DITHER_MOTION.repelRadius);
            targetX += (dx / distance) * displacement;
            targetY += (dy / distance) * displacement;
          }
        }

        if (!reducedMotion) {
          for (const ripple of ripples) {
            const elapsed = (now - ripple.startedAt) / 1000;
            const waveRadius = elapsed * DITHER_MOTION.rippleSpeed;
            const dx = homeX - ripple.x;
            const dy = homeY - ripple.y;
            const distance = Math.hypot(dx, dy);
            const delta = Math.abs(distance - waveRadius);
            if (distance > 0.001 && delta < DITHER_MOTION.rippleWidth) {
              const wave = 1 - delta / DITHER_MOTION.rippleWidth;
              const life =
                1 - Math.min(1, (now - ripple.startedAt) / DITHER_MOTION.rippleDuration);
              const displacement =
                DITHER_MOTION.rippleStrength * wave * wave * life;
              targetX += (dx / distance) * displacement;
              targetY += (dy / distance) * displacement;
            }
          }
        }

        if (reducedMotion) {
          field.x[index] = homeX;
          field.y[index] = homeY;
          field.velocityX[index] = 0;
          field.velocityY[index] = 0;
        } else {
          const [nextX, nextVelocityX] = integrateSpringAxis(
            field.x[index],
            field.velocityX[index],
            targetX,
          );
          const [nextY, nextVelocityY] = integrateSpringAxis(
            field.y[index],
            field.velocityY[index],
            targetY,
          );
          field.x[index] = nextX;
          field.y[index] = nextY;
          field.velocityX[index] = nextVelocityX;
          field.velocityY[index] = nextVelocityY;

          if (
            Math.abs(nextX - targetX) > 0.08 ||
            Math.abs(nextY - targetY) > 0.08 ||
            Math.abs(nextVelocityX) > 0.02 ||
            Math.abs(nextVelocityY) > 0.02
          ) {
            stillMoving = true;
          }
        }

        const radius = field.radius[index];
        context.moveTo(field.x[index] + radius, field.y[index]);
        context.arc(field.x[index], field.y[index], radius, 0, Math.PI * 2);
      }

      context.fill();
      context.globalAlpha = 1;

      if (
        !reducedMotion &&
        (ripples.length > 0 || stillMoving)
      ) {
        frame = requestAnimationFrame(draw);
      }
    };

    const requestDraw = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    const rebuild = () => {
      const bounds = canvas.getBoundingClientRect();
      cssSize = Math.max(1, Math.round(Math.min(bounds.width, bounds.height)));
      const pixelRatio = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(cssSize * pixelRatio);
      canvas.height = Math.round(cssSize * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      field = createBalancedDitherField(cssSize);
      canvas.dataset.pointCount = String(field.count);
      fadeStartedAt = performance.now();
      entrance.dataset.state = "ready";
      requestDraw();
    };

    const queueRebuild = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(rebuild);
    };

    const localPosition = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    };

    const onPointerDown = (event: PointerEvent) => {
      const position = localPosition(event);
      if (event.pointerType === "touch") {
        touchOrigin = { ...position, moved: false };
      }
      if (!motionQuery.matches) {
        pointerX = position.x;
        pointerY = position.y;
        pointerActive = event.pointerType !== "touch";
        requestDraw();
      }
      if (typeof stage.setPointerCapture === "function") {
        stage.setPointerCapture(event.pointerId);
      }
    };

    const onPointerEnter = (event: PointerEvent) => {
      if (event.pointerType === "touch" || motionQuery.matches) return;
      const position = localPosition(event);
      pointerX = position.x;
      pointerY = position.y;
      pointerActive = true;
      requestDraw();
    };

    const onPointerMove = (event: PointerEvent) => {
      const position = localPosition(event);
      if (event.pointerType === "touch") {
        if (touchOrigin && Math.hypot(position.x - touchOrigin.x, position.y - touchOrigin.y) > 8) {
          touchOrigin.moved = true;
        }
        return;
      }
      if (motionQuery.matches) return;
      pointerX = position.x;
      pointerY = position.y;
      pointerActive = true;
      requestDraw();
    };

    const onPointerLeave = () => {
      pointerActive = false;
      requestDraw();
    };

    const onPointerUp = (event: PointerEvent) => {
      if (
        typeof stage.hasPointerCapture === "function" &&
        stage.hasPointerCapture(event.pointerId)
      ) {
        stage.releasePointerCapture(event.pointerId);
      }
      if (motionQuery.matches) {
        touchOrigin = null;
        return;
      }
      if (event.pointerType === "touch" && touchOrigin?.moved) {
        touchOrigin = null;
        return;
      }
      const position = localPosition(event);
      ripples.push({ ...position, startedAt: performance.now() });
      if (event.pointerType === "touch") pointerActive = false;
      touchOrigin = null;
      requestDraw();
    };

    const onPointerCancel = (event: PointerEvent) => {
      if (
        typeof stage.hasPointerCapture === "function" &&
        stage.hasPointerCapture(event.pointerId)
      ) {
        stage.releasePointerCapture(event.pointerId);
      }
      touchOrigin = null;
      pointerActive = false;
      requestDraw();
    };

    const onKeyboardActivate = (event: MouseEvent) => {
      if (event.detail !== 0 || motionQuery.matches) return;
      ripples.push({
        x: cssSize / 2,
        y: cssSize / 2,
        startedAt: performance.now(),
      });
      requestDraw();
    };

    const onMotionPreferenceChange = () => {
      pointerActive = false;
      ripples = [];
      requestDraw();
    };

    const resizeObserver = "ResizeObserver" in window
      ? new ResizeObserver(queueRebuild)
      : undefined;
    if (resizeObserver) {
      resizeObserver.observe(canvas);
    } else {
      window.addEventListener("resize", queueRebuild, { passive: true });
    }
    if (typeof motionQuery.addEventListener === "function") {
      motionQuery.addEventListener("change", onMotionPreferenceChange);
    } else {
      motionQuery.addListener(onMotionPreferenceChange);
    }
    stage.addEventListener("pointerdown", onPointerDown, { passive: true });
    stage.addEventListener("pointerenter", onPointerEnter, { passive: true });
    stage.addEventListener("pointermove", onPointerMove, { passive: true });
    stage.addEventListener("pointerleave", onPointerLeave, { passive: true });
    stage.addEventListener("pointerup", onPointerUp, { passive: true });
    stage.addEventListener("pointercancel", onPointerCancel, { passive: true });
    stage.addEventListener("click", onKeyboardActivate);

    try {
      rebuild();
    } catch {
      entrance.dataset.state = "fallback";
    }

    return () => {
      destroyed = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resizeFrame);
      resizeObserver?.disconnect();
      if (!resizeObserver) window.removeEventListener("resize", queueRebuild);
      if (typeof motionQuery.removeEventListener === "function") {
        motionQuery.removeEventListener("change", onMotionPreferenceChange);
      } else {
        motionQuery.removeListener(onMotionPreferenceChange);
      }
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointerenter", onPointerEnter);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerleave", onPointerLeave);
      stage.removeEventListener("pointerup", onPointerUp);
      stage.removeEventListener("pointercancel", onPointerCancel);
      stage.removeEventListener("click", onKeyboardActivate);
    };
  }, []);

  return (
    <section className={styles.entrance} data-state="loading" ref={entranceRef}>
      <button className={styles.stage} ref={stageRef} type="button">
        <div className={styles.fallback} aria-hidden="true">
          <span>THEODORE</span>
          <span>OUYANG</span>
        </div>
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
        <span className={styles.srOnly} data-visible-copy-role="visual-identity">
          Theodore Ouyang
        </span>
      </button>
      <a className={styles.scrollCue} href="#home-profile">
        Scroll
      </a>
    </section>
  );
}
