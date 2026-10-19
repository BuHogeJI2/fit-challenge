import { forwardRef, useId } from "react";
import clsx from "clsx";
import { fieldClasses } from "./field.styles";
import type { IFieldProps } from "./field.types";

export const Field = forwardRef<HTMLInputElement, IFieldProps>(
  ({ label, hint, error, className, id, ...inputProps }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const messageId = `${inputId}-message`;
    const message = error ?? hint;

    return (
      <div className={clsx(fieldClasses.wrapper, className)}>
        <label htmlFor={inputId} className={fieldClasses.label}>
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          className={fieldClasses.input}
          {...inputProps}
        />
        {message ? (
          <p id={messageId} className={error ? fieldClasses.error : fieldClasses.hint}>
            {message}
          </p>
        ) : null}
      </div>
    );
  },
);

Field.displayName = "Field";
