"use client";

import { useEffect } from "react";
import styles from "./Figure.module.css";

type Crosshair = {
  x: number[];
  heading: string[];
  series: Array<{ name: string; tone: string; y: number[]; value: string[] }>;
};

/**
 * Enhances the article's server-rendered figures and tables: view switches,
 * hover readouts, the proof-obligation graph, column highlighting and a single
 * entrance as each figure scrolls into view. Every figure is complete without it.
 */
export function FigureController() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];
    const listen = <K extends keyof HTMLElementEventMap>(target: HTMLElement, type: K, handler: (event: HTMLElementEventMap[K]) => void) => {
      target.addEventListener(type, handler as EventListener);
      cleanups.push(() => target.removeEventListener(type, handler as EventListener));
    };
    const figures = [...document.querySelectorAll<HTMLElement>("[data-figure]")];

    for (const figure of figures) {
      const frame = figure.firstElementChild as HTMLElement;

      // View switches.
      const switcher = figure.querySelector<HTMLElement>("[data-fig-switch]");
      if (switcher) {
        switcher.hidden = false;
        const buttons = [...switcher.querySelectorAll<HTMLButtonElement>("[data-fig-view]")];
        const show = (view: string) => {
          figure.dataset.view = view;
          for (const button of buttons) button.setAttribute("aria-pressed", String(button.dataset.figView === view));
          for (const panel of figure.querySelectorAll<HTMLElement>("[data-fig-panel]")) panel.hidden = panel.dataset.figPanel !== view;
        };
        for (const button of buttons) listen(button, "click", () => show(button.dataset.figView!));
      }

      // Tooltips for marks that carry data-tip.
      const tooltip = document.createElement("div");
      tooltip.className = styles.tooltip;
      tooltip.setAttribute("aria-hidden", "true");
      frame.append(tooltip);
      cleanups.push(() => tooltip.remove());
      let tipTarget: HTMLElement | null = null;
      const placeTip = (target: HTMLElement) => {
        const box = frame.getBoundingClientRect();
        const mark = target.getBoundingClientRect();
        tooltip.textContent = target.dataset.tip ?? "";
        tooltip.dataset.open = "";
        const width = tooltip.offsetWidth;
        const height = tooltip.offsetHeight;
        let left = mark.left + mark.width / 2 - box.left - width / 2;
        left = Math.max(8, Math.min(left, box.width - width - 8));
        let top = mark.top - box.top - height - 10;
        if (top < 4) top = mark.bottom - box.top + 10;
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
      };
      listen(frame, "pointerover", (event) => {
        const target = (event.target as HTMLElement).closest<HTMLElement>("[data-tip]");
        if (!target || target === tipTarget) return;
        tipTarget = target;
        placeTip(target);
      });
      listen(frame, "pointerout", (event) => {
        const next = (event.relatedTarget as HTMLElement | null)?.closest?.("[data-tip]");
        if (tipTarget && next !== tipTarget) {
          tipTarget = null;
          delete tooltip.dataset.open;
        }
      });
      listen(frame, "focusin", (event) => {
        const target = (event.target as HTMLElement).closest<HTMLElement>("[data-tip]");
        if (target) placeTip(target);
      });
      listen(frame, "focusout", () => delete tooltip.dataset.open);

      // Linked emphasis: hovering any [data-key] marks every element with that key.
      const keyed = [...figure.querySelectorAll<HTMLElement>("[data-key]")];
      if (keyed.length) {
        listen(frame, "pointerover", (event) => {
          const key = (event.target as HTMLElement).closest<HTMLElement>("[data-key]")?.dataset.key;
          if (key === figure.dataset.focus) return;
          if (key) figure.dataset.focus = key; else delete figure.dataset.focus;
          for (const node of keyed) node.toggleAttribute("data-key-active", node.dataset.key === key);
        });
        listen(frame, "pointerleave", () => {
          delete figure.dataset.focus;
          for (const node of keyed) node.removeAttribute("data-key-active");
        });
      }

      // Crosshair readouts on line charts.
      for (const area of figure.querySelectorAll<HTMLElement>("[data-crosshair]")) {
        const spec = JSON.parse(area.dataset.crosshair!) as Crosshair;
        const rule = document.createElement("span");
        rule.className = styles.crossRule;
        const dots = spec.series.map((series) => {
          const dot = document.createElement("span");
          dot.className = `${styles.crossDot} ${styles[series.tone] ?? ""}`;
          return dot;
        });
        const layer = [rule, ...dots];
        for (const node of layer) node.hidden = true;
        area.append(...layer);
        cleanups.push(() => layer.forEach((node) => node.remove()));
        const hide = () => {
          for (const node of layer) node.hidden = true;
          delete tooltip.dataset.open;
        };
        listen(area, "pointermove", (event) => {
          const box = area.getBoundingClientRect();
          const at = ((event.clientX - box.left) / box.width) * 100;
          let index = 0;
          for (let candidate = 1; candidate < spec.x.length; candidate += 1) {
            if (Math.abs(spec.x[candidate] - at) < Math.abs(spec.x[index] - at)) index = candidate;
          }
          rule.hidden = false;
          rule.style.left = `${spec.x[index]}%`;
          spec.series.forEach((series, position) => {
            const y = series.y[index];
            dots[position].hidden = !Number.isFinite(y);
            dots[position].style.left = `${spec.x[index]}%`;
            dots[position].style.top = `${100 - y}%`;
          });
          tooltip.textContent = [spec.heading[index], ...spec.series.map((series) => `${series.name}: ${series.value[index]}`)].join("\n");
          tooltip.dataset.open = "";
          const frameBox = frame.getBoundingClientRect();
          const width = tooltip.offsetWidth;
          const pointX = box.left - frameBox.left + (spec.x[index] / 100) * box.width;
          const left = pointX + 14 + width > frameBox.width - 8 ? pointX - width - 14 : pointX + 14;
          tooltip.style.left = `${Math.max(8, left)}px`;
          tooltip.style.top = `${box.top - frameBox.top}px`;
        });
        listen(area, "pointerleave", hide);
      }

      // Proof-obligation graph: choosing a node marks it as the first failed
      // obligation and its descendants as unverified.
      const nodes = [...figure.querySelectorAll<HTMLButtonElement>("[data-dag-node]")];
      if (nodes.length) {
        const readout = figure.querySelector<HTMLElement>("[data-dag-status]");
        const select = (id: string) => {
          const chosen = nodes.find((node) => node.dataset.dagNode === id)!;
          const unverified = new Set((chosen.dataset.dagDescendants ?? "").split(" ").filter(Boolean));
          for (const node of nodes) {
            const state = node === chosen ? "failed" : unverified.has(node.dataset.dagNode!) ? "unverified" : "verified";
            node.dataset.state = state;
            node.setAttribute("aria-pressed", String(node === chosen));
          }
          for (const edge of figure.querySelectorAll<SVGElement>("[data-dag-edge]")) {
            const [from] = edge.dataset.dagEdge!.split(" ");
            edge.dataset.state = from === id || unverified.has(from) ? "unverified" : "verified";
          }
          if (readout) readout.textContent = chosen.dataset.dagReadout ?? "";
        };
        for (const node of nodes) {
          node.disabled = false;
          listen(node, "click", () => select(node.dataset.dagNode!));
        }
      }
    }

    // Research tables: highlight the hovered column and its header, in the
    // article and on the zoomed stage alike.
    const tables = [...document.querySelectorAll<HTMLTableElement>("[data-research-table]")];
    let litTable: HTMLTableElement | null = null;
    let litColumn = -1;
    const lightColumn = (table: HTMLTableElement | null, column: number) => {
      if (table === litTable && column === litColumn) return;
      const paint = (target: HTMLTableElement | null, index: number) => {
        if (!target) return;
        for (const row of target.rows) {
          [...row.cells].forEach((cell, position) => cell.toggleAttribute("data-column-hover", position === index && position > 0));
        }
      };
      if (table !== litTable) paint(litTable, -1);
      paint(table, column);
      litTable = table;
      litColumn = column;
    };
    listen(document.documentElement, "pointerover", (event) => {
      const cell = (event.target as Element).closest<HTMLTableCellElement>("[data-research-table] td, [data-research-table] th");
      lightColumn(cell?.closest<HTMLTableElement>("[data-research-table]") ?? null, cell ? cell.cellIndex : -1);
    });
    listen(document.documentElement, "pointerleave", () => lightColumn(null, -1));

    // One entrance per figure or table, only for those that start below the fold.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced && "IntersectionObserver" in window) {
      const frames = tables.map((table) => table.closest<HTMLElement>("[data-table-frame]")).filter((frame): frame is HTMLElement => Boolean(frame));
      const pendingFrames = frames.filter((frame) => frame.getBoundingClientRect().top > window.innerHeight);
      const tableObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const frame = entry.target as HTMLElement;
          tableObserver.unobserve(frame);
          requestAnimationFrame(() => { frame.dataset.reveal = "in"; });
        }
      }, { rootMargin: "0px 0px -10% 0px" });
      for (const frame of pendingFrames) {
        [...frame.querySelectorAll<HTMLTableRowElement>("tbody tr")].forEach((row, index) => row.style.setProperty("--row", String(Math.min(index, 12))));
        frame.dataset.reveal = "pending";
        tableObserver.observe(frame);
      }
      cleanups.push(() => tableObserver.disconnect());

      const pending = figures.filter((figure) => figure.getBoundingClientRect().top > window.innerHeight);
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const figure = entry.target as HTMLElement;
          observer.unobserve(figure);
          requestAnimationFrame(() => { figure.dataset.reveal = "in"; });
        }
      }, { rootMargin: "0px 0px -15% 0px" });
      for (const figure of pending) {
        figure.dataset.reveal = "pending";
        observer.observe(figure);
      }
      cleanups.push(() => observer.disconnect());
    }

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return null;
}
