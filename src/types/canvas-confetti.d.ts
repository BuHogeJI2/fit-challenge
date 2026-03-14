declare module "canvas-confetti" {
  export interface IConfettiOrigin {
    x?: number;
    y?: number;
  }

  export interface IConfettiOptions {
    angle?: number;
    colors?: string[];
    gravity?: number;
    origin?: IConfettiOrigin;
    particleCount?: number;
    scalar?: number;
    spread?: number;
    startVelocity?: number;
    ticks?: number;
  }

  type TConfettiFn = (options?: IConfettiOptions) => Promise<null> | null;

  const confetti: TConfettiFn;

  export default confetti;
}
