import clsx from "clsx";
import { Button, Panel } from "../ui";
import { setSequenceClasses } from "./set-sequence.styles";
import type { ISetSequenceProps } from "./set-sequence.types";

export function SetSequence({
  className,
  emptyLabel,
  onRemoveSet,
  sets,
  title,
  ...props
}: ISetSequenceProps) {
  if (!sets.length && !emptyLabel) {
    return null;
  }

  return (
    <div
      className={clsx(setSequenceClasses.wrapper, className)}
      {...props}
    >
      {title ? <div className={setSequenceClasses.title}>{title}</div> : null}

      {sets.length ? (
        <div className={setSequenceClasses.list}>
          {sets.map((set, index) => (
            <Panel
              key={set.id}
              className={setSequenceClasses.item}
              variant="list"
            >
              <div className={setSequenceClasses.step}>{index + 1}</div>
              <div className={setSequenceClasses.meta}>
                <div className={setSequenceClasses.label}>Set</div>
                <div className={setSequenceClasses.value}>{set.reps} reps</div>
              </div>

              {onRemoveSet ? (
                <Button
                  className={setSequenceClasses.removeButton}
                  size="sm"
                  type="button"
                  variant="destructive"
                  onClick={() => onRemoveSet(set.id)}
                >
                  Remove
                </Button>
              ) : null}
            </Panel>
          ))}
        </div>
      ) : emptyLabel ? (
        <div className={setSequenceClasses.empty}>{emptyLabel}</div>
      ) : null}
    </div>
  );
}
