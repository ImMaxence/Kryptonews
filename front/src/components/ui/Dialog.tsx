'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';

/** Native <dialog>: focus trapping, Escape and focus restoration come from the browser. */
export function Dialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // Optional initial focus target, e.g. the primary action instead of the first field.
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className="dialog" aria-labelledby={titleId} onClose={onClose}>
      <div className="dialog__inner">
        <h2 id={titleId} className="dialog__title">
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  );
}
