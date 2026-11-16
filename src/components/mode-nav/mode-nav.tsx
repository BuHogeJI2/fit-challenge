import { Link, useRoute } from "wouter";
import { modeNavClasses } from "./mode-nav.styles";
import type { IModeNavLinkProps } from "./mode-nav.types";
import { getSectionPath, useAppSearch } from "../../lib/navigation";

function ModeNavLink({ href, children }: IModeNavLinkProps) {
  useAppSearch();
  const [isSection] = useRoute(`${href}/*?`);
  const [isTraining] = useRoute("/trainings/*?");
  const isActive = isSection || (href === "/exercises" && isTraining);

  return (
    <Link
      href={getSectionPath(href)}
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
