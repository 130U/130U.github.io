"use client";

import { useEffect, useId, useRef, useState, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import styles from "./LegalPaperReader.module.css";

type ReaderNote = {
  key: string;
  label: string;
  content: ReactNode;
};

function isPlainClick(event: MouseEvent<HTMLElement>) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

function isOutsideDialog(event: MouseEvent<HTMLDialogElement> | PointerEvent<HTMLDialogElement>) {
  const bounds = event.currentTarget.getBoundingClientRect();
  return event.clientX < bounds.left || event.clientX > bounds.right
    || event.clientY < bounds.top || event.clientY > bounds.bottom;
}

export function LegalPaperReader({
  notes,
  children,
}: {
  notes: Array<ReaderNote>;
  children: ReactNode;
}) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const activeNote = notes.find(({ key }) => key === activeKey);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const sourceLinkRef = useRef<HTMLAnchorElement | null>(null);
  const restoreSourceFocusRef = useRef(true);
  const footnoteTargetRef = useRef<string | null>(null);
  const backdropPressRef = useRef(false);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!activeNote || !dialog) return;
    const previousOverflow = document.documentElement.style.overflow;
    if (!dialog.open) dialog.showModal();
    document.documentElement.style.overflow = "hidden";
    closeButtonRef.current?.focus({ preventScroll: true });
    return () => {
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [activeNote]);

  function openPreview(event: MouseEvent<HTMLDivElement>) {
    if (event.defaultPrevented || !isPlainClick(event) || !(event.target instanceof Element)) return;
    const source = event.target.closest<HTMLAnchorElement>('a[role="doc-noteref"][href^="#fn-"]');
    const dialog = dialogRef.current;
    if (!source || !event.currentTarget.contains(source) || dialog?.contains(source)) return;
    if (!dialog || typeof dialog.showModal !== "function") return;
    const key = source.getAttribute("href")?.slice(4);
    if (!key || !notes.some((note) => note.key === key)) return;

    event.preventDefault();
    sourceLinkRef.current = source;
    restoreSourceFocusRef.current = true;
    footnoteTargetRef.current = null;
    setActiveKey(key);
  }

  function closePreview() {
    dialogRef.current?.close();
  }

  function finishClose() {
    setActiveKey(null);
    if (footnoteTargetRef.current) {
      document.getElementById(footnoteTargetRef.current)?.focus({ preventScroll: true });
    } else if (restoreSourceFocusRef.current && sourceLinkRef.current?.isConnected) {
      sourceLinkRef.current.focus({ preventScroll: true });
    }
    sourceLinkRef.current = null;
    footnoteTargetRef.current = null;
    backdropPressRef.current = false;
  }

  function viewInFootnotes(event: MouseEvent<HTMLAnchorElement>) {
    if (!isPlainClick(event)) return;
    restoreSourceFocusRef.current = false;
    footnoteTargetRef.current = event.currentTarget.getAttribute("href")?.slice(1) ?? null;
    closePreview();
  }

  return (
    <div className={styles.reader} onClick={openPreview}>
      {children}
      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby={titleId}
        onClose={finishClose}
        onCancel={(event) => {
          event.preventDefault();
          closePreview();
        }}
        onPointerDown={(event) => {
          backdropPressRef.current = event.target === event.currentTarget && isOutsideDialog(event);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget && backdropPressRef.current && isOutsideDialog(event)) {
            closePreview();
          }
        }}
      >
        {activeNote && (
          <>
            <header className={styles.header}>
              <h2 id={titleId}>{activeNote.label === "Author note" ? "Author note" : `Footnote ${activeNote.label}`}</h2>
              <button ref={closeButtonRef} className={styles.closeButton} type="button" onClick={closePreview} aria-label="Close note preview">
                Close
              </button>
            </header>
            <div className={styles.content}>{activeNote.content}</div>
            <footer className={styles.footer}>
              <a className={styles.footnotesLink} href={`#fn-${activeNote.key}`} onClick={viewInFootnotes}>View in footnotes</a>
            </footer>
          </>
        )}
      </dialog>
    </div>
  );
}
