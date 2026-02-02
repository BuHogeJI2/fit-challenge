import { currentDayCardClasses } from "./current-day-card.styles";
import type { ICurrentDayCardProps } from "./current-day-card.types";

export function CurrentDayCard({
  label,
  dateLabel,
  title,
  description,
  exercises,
  count,
  emptyMessage,
}: ICurrentDayCardProps) {
  return (
    <div className={currentDayCardClasses.card}>
      <div className={currentDayCardClasses.header}>
        <span>{label}</span>
        <span>{dateLabel}</span>
      </div>
      <h2 className={currentDayCardClasses.title}>{title}</h2>
      <p className={currentDayCardClasses.description}>{description}</p>
      <div className={currentDayCardClasses.content}>
        {exercises.length ? (
          <ul className={currentDayCardClasses.list}>
            {exercises.map((exercise, index) => (
              <li
                key={`${exercise}-${index}`}
                className={currentDayCardClasses.listItem}
              >
                <span className={currentDayCardClasses.bullet} />
                <span>{exercise}</span>
                {count !== null && count !== undefined ? (
                  <span className={currentDayCardClasses.count}>× {count}</span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <div className={currentDayCardClasses.empty}>{emptyMessage}</div>
        )}
      </div>
    </div>
  );
}
