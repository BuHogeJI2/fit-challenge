import { Redirect, Route, Router, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { DatabaseGate } from "../database-gate";
import { ModeNav } from "../mode-nav";
import { ToastProvider } from "../ui";
import { WeightScreen } from "../weight-screen";
import { appClasses } from "./app.styles";
import type { IPlaceholderScreenProps } from "./app.types";

function PlaceholderScreen({ title }: IPlaceholderScreenProps) {
  return (
    <section className={appClasses.screen}>
      <h1 className={appClasses.title}>{title}</h1>
    </section>
  );
}

export function App() {
  return (
    <Router hook={useHashLocation}>
      <ToastProvider>
        <div className={appClasses.frame}>
          <header className={appClasses.header}>
            <ModeNav />
          </header>
          <main className={appClasses.main}>
            <Switch>
              <Route path="/weight">
                <DatabaseGate>
                  <WeightScreen />
                </DatabaseGate>
              </Route>
              <Route path="/exercises">
                <DatabaseGate>
                  <PlaceholderScreen title="Training" />
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
