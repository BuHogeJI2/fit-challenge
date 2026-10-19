import { useEffect, useId, useRef } from "react";
import type { MouseEvent } from "react";
import { sheetClasses } from "./sheet.styles";
import type { ISheetProps } from "./sheet.types";

export function Sheet({ open, title, onClose, children }: ISheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className={sheetClasses.dialog}
      onClose={onClose}
      onClick={handleClick}
    >
      {open ? (
        <div className={sheetClasses.panel}>
          <div className={sheetClasses.handle} aria-hidden="true" />
          <div className={sheetClasses.header}>
            <h2 id={titleId} className={sheetClasses.title}>
              {title}
            </h2>
            <button type="button" className={sheetClasses.close} onClick={onClose}>
              Close
            </button>
          </div>
          {children}
        </div>
      ) : null}
    </dialog>
  );
}
