import { Redirect, Route, Router, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { ModeNav } from "../mode-nav";
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
      <div className={appClasses.frame}>
        <header className={appClasses.header}>
          <ModeNav />
        </header>
        <main className={appClasses.main}>
          <Switch>
            <Route path="/weight">
              <PlaceholderScreen title="Weight" />
            </Route>
            <Route path="/exercises">
              <PlaceholderScreen title="Training" />
            </Route>
            <Route>
              <Redirect to="/weight" replace />
            </Route>
          </Switch>
        </main>
      </div>
    </Router>
  );
}
