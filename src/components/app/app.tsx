import { Link, Redirect, Route, Router, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { DatabaseGate } from "../database-gate";
import { ExerciseDetailScreen } from "../exercise-detail-screen";
import { ExercisesScreen } from "../exercises-screen";
import { ModeNav } from "../mode-nav";
import { SettingsScreen } from "../settings-screen";
import { ToastProvider } from "../ui";
import { WeightScreen } from "../weight-screen";
import { appClasses } from "./app.styles";

export function App() {
  return (
    <Router hook={useHashLocation}>
      <ToastProvider>
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
          <main className={appClasses.main}>
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
      </ToastProvider>
    </Router>
  );
}
