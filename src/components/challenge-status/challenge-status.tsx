import { challengeStatusClasses } from "./challenge-status.styles";
import type { IChallengeStatusProps } from "./challenge-status.types";

export function ChallengeStatus({
  tone,
  title,
  body,
}: IChallengeStatusProps) {
  return (
    <section className={challengeStatusClasses.wrapper}>
      <div className={challengeStatusClasses[tone]}>
        {tone === "loading"
          ? "Loading"
          : tone === "error"
            ? "Error"
            : "Empty"}
      </div>
      <h1 className={challengeStatusClasses.title}>{title}</h1>
      <p className={challengeStatusClasses.body}>{body}</p>
    </section>
  );
}
