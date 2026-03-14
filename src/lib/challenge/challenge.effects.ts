import confetti from "canvas-confetti";

const getConfettiOrigin = (element?: HTMLElement | null) => {
  if (!element || typeof window === "undefined") {
    return { x: 0.5, y: 0.72 };
  }

  const rect = element.getBoundingClientRect();

  return {
    x: (rect.left + rect.width / 2) / window.innerWidth,
    y: (rect.top + rect.height / 2) / window.innerHeight,
  };
};

export const prefersReducedMotion = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export const celebrateDayCompletion = (element?: HTMLElement | null) => {
  if (prefersReducedMotion()) {
    return false;
  }

  const origin = getConfettiOrigin(element);

  confetti({
    angle: 90,
    spread: 64,
    startVelocity: 28,
    particleCount: 32,
    scalar: 0.82,
    gravity: 1.08,
    ticks: 180,
    origin,
    colors: ["#b6ff4f", "#f8c95f", "#f2613f"],
  });

  return true;
};
