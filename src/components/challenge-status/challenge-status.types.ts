export type TChallengeStatusTone = "loading" | "error" | "empty";

export interface IChallengeStatusProps {
  tone: TChallengeStatusTone;
  title: string;
  body: string;
}
