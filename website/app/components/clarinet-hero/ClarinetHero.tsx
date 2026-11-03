"use client";

import { useEffect, useRef } from "react";
import { ARC, BANDS, BEAMED_NOTE, BELL_OPENING, BELL_RIM, BODY, DETAILS, NODE, NOTE, PADS, PAD_SHADOWS, RINGS, RODS, TIP_OPENING, TRAILS, VIEW_HEIGHT, VIEW_WIDTH, cubicPoint } from "./shape";
import { mountClarinet } from "./renderer";
import styles from "./ClarinetHero.module.css";

export function ClarinetHero() {
  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !heroRef.current) return;
    const controller = mountClarinet(canvasRef.current, heroRef.current);
    return () => controller.destroy();
  }, []);

  return (
    <section ref={heroRef} className={styles.hero} aria-labelledby="hero-name">
      <div className={styles.frame}>
        <div className={styles.copy} data-hero-copy>
          <h1 id="hero-name"><span>Theodore</span>{" "}<span>Ouyang</span></h1>
          <ul className={styles.credentials}>
            <li><strong>Duke</strong>{" "}<span>alumnus</span></li>
            <li><strong>Sequoia</strong>{" "}<span>Fellow</span></li>
          </ul>
        </div>
        <div className={styles.visual}>
          <div className={styles.stage}>
            <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
            <svg className={styles.fallback} viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} aria-hidden="true">
              <defs>
                <pattern id="clarinet-fallback-ink" width="4" height="4" patternUnits="userSpaceOnUse">
                  <rect width="1.6" height="1.6" fill="currentColor" />
                </pattern>
                <pattern id="clarinet-fallback-dark" width="4" height="4" patternUnits="userSpaceOnUse">
                  <rect width="1.9" height="1.9" fill="currentColor" />
                </pattern>
                <pattern id="clarinet-fallback-gray" width="4" height="4" patternUnits="userSpaceOnUse">
                  <rect width="1.4" height="1.4" fill="#85867e" />
                </pattern>
                <pattern id="clarinet-fallback-blue" width="4" height="4" patternUnits="userSpaceOnUse">
                  <rect width="2.3" height="2.3" fill="#2200ff" />
                </pattern>
                <mask id="clarinet-fallback-mask">
                  <path d={BODY} fill="white" />
                  <path d={TIP_OPENING} fill="black" />
                  <path d={`${RINGS} ${BELL_RIM}`} fill="black" fillRule="evenodd" />
                  <path d={`${BANDS} ${PADS} ${DETAILS}`} fill="black" />
                  <path d={RODS} fill="none" stroke="black" strokeWidth="5.4" strokeLinecap="round" />
                </mask>
                <mask id="clarinet-fallback-arc">
                  <path d={`M${ARC[0]} ${ARC[1]} C${ARC.slice(2).join(" ")}`} fill="none" stroke="white" strokeWidth="5" />
                  <path d={BODY} fill="black" />
                </mask>
              </defs>
              <rect width={VIEW_WIDTH} height={VIEW_HEIGHT} fill="url(#clarinet-fallback-blue)" mask="url(#clarinet-fallback-arc)" />
              <path d={BODY} fill="url(#clarinet-fallback-ink)" mask="url(#clarinet-fallback-mask)" />
              <path d={BELL_OPENING} fill="url(#clarinet-fallback-dark)" />
              <path d={PAD_SHADOWS} fill="url(#clarinet-fallback-ink)" />
              <path d={`${RINGS} ${BELL_RIM}`} fill="url(#clarinet-fallback-gray)" fillRule="evenodd" />
              <path d={`${BANDS} ${PADS} ${DETAILS} ${TIP_OPENING}`} fill="url(#clarinet-fallback-gray)" />
              <path d={RODS} fill="none" stroke="url(#clarinet-fallback-gray)" strokeWidth="3.5" strokeLinecap="round" />
              <ellipse data-clarinet-accent="node" cx={NODE.x} cy={NODE.y} rx={NODE.rx} ry={NODE.ry} transform={`rotate(${NODE.rotation * 180 / Math.PI} ${NODE.x} ${NODE.y})`} fill="#2200ff" />
              {[0, 1, 2, 3].map(i => {
                const point = cubicPoint(TRAILS[0], .12 + i * .235);
                return <path key={i} data-clarinet-accent="note" d={i === 1 ? BEAMED_NOTE : NOTE} transform={`translate(${point.x + 26} ${point.y}) scale(1.85)`} fill={i % 2 ? "currentColor" : "#2200ff"} />;
              })}
            </svg>
            <div className={styles.markers} data-hero-markers aria-hidden="true">
              <i className={styles.cornerTL} aria-hidden="true" /><i className={styles.cornerTR} aria-hidden="true" /><i className={styles.cornerBL} aria-hidden="true" /><i className={styles.cornerBR} aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
