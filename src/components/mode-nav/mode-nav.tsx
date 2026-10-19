import { Link, useRoute } from "wouter";
import { modeNavClasses } from "./mode-nav.styles";
import type { IModeNavLinkProps } from "./mode-nav.types";

function ModeNavLink({ href, children }: IModeNavLinkProps) {
  const [isActive] = useRoute(`${href}/*?`);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={isActive ? modeNavClasses.linkActive : modeNavClasses.link}
    >
      {children}
    </Link>
  );
}

export function ModeNav() {
  return (
    <nav aria-label="Mode" className={modeNavClasses.nav}>
      <ModeNavLink href="/weight">Weight</ModeNavLink>
      <ModeNavLink href="/exercises">Exercises</ModeNavLink>
    </nav>
  );
}
