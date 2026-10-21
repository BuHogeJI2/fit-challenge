import { useMemo, useRef } from "react";
import { Link, Redirect, Route, Router, Switch, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { useHorizontalSwipe, type TSwipeHandlers } from "../../lib/gestures";
import { DatabaseGate } from "../database-gate";
import { ExerciseDetailScreen } from "../exercise-detail-screen";
import { ExercisesScreen } from "../exercises-screen";
import { ModeNav } from "../mode-nav";
import { SettingsScreen } from "../settings-screen";
import { ToastProvider } from "../ui";
import { UpdateBanner } from "../update-banner";
import { WeightScreen } from "../weight-screen";
import { appClasses } from "./app.styles";

function AppShell() {
  const mainRef = useRef<HTMLElement>(null);
  const [location, navigate] = useLocation();
  const tabSwipe = useMemo<TSwipeHandlers>(() => {
    if (location === "/weight") return { onSwipeLeft: () => navigate("/exercises") };
    if (location === "/exercises") return { onSwipeRight: () => navigate("/weight") };
    return {};
  }, [location, navigate]);

  useHorizontalSwipe(mainRef, tabSwipe);

  return (
    <div className={appClasses.frame}>
      <header className={appClasses.header}>
        <ModeNav />
        <Link
          href="/settings"
          className={(isActive) => (isActive ? appClasses.settingsActive : appClasses.settings)}
        >
          Settings
        </Link>
      </header>
      <UpdateBanner />
      <main ref={mainRef} className={appClasses.main}>
        <Switch>
          <Route path="/weight">
            <DatabaseGate>
              <WeightScreen />
            </DatabaseGate>
          </Route>
          <Route path="/exercises/:id">
            {(params) => (
              <DatabaseGate>
                <ExerciseDetailScreen key={params.id} exerciseId={params.id} />
              </DatabaseGate>
            )}
          </Route>
          <Route path="/exercises">
            <DatabaseGate>
              <ExercisesScreen />
            </DatabaseGate>
          </Route>
          <Route path="/settings">
            <DatabaseGate>
              <SettingsScreen />
            </DatabaseGate>
          </Route>
          <Route>
            <Redirect to="/weight" replace />
          </Route>
        </Switch>
      </main>
    </div>
  );
}

export function App() {
  return (
    <Router hook={useHashLocation}>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </Router>
  );
}
