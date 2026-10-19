import { Component, Fragment, useEffect, useRef, useState } from "react";
import type { ErrorInfo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, getDataGeneration } from "../../lib/db";
import { useToast } from "../ui";
import { databaseGateClasses } from "./database-gate.styles";
import type {
  IDatabaseGateProps,
  IStorageErrorBoundaryState,
  IStorageErrorProps,
  TDatabaseStatus,
} from "./database-gate.types";

const toMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

function StorageError({ message }: IStorageErrorProps) {
  return (
    <section className={databaseGateClasses.screen} role="alert">
      <h1 className={databaseGateClasses.title}>Storage is not available</h1>
      <p className={databaseGateClasses.body}>
        Fit keeps your data in this browser, but the browser did not let it use
        its storage. Private browsing and blocked site data can cause this.
        Nothing was saved or changed.
      </p>
      <p className={databaseGateClasses.detail}>{message}</p>
    </section>
  );
}

class StorageErrorBoundary extends Component<IDatabaseGateProps, IStorageErrorBoundaryState> {
  state: IStorageErrorBoundaryState = { message: null };

  static getDerivedStateFromError(error: unknown): IStorageErrorBoundaryState {
    return { message: toMessage(error) };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (this.state.message !== null) {
      return <StorageError message={this.state.message} />;
    }
    return this.props.children;
  }
}

// A restore or wipe bumps the generation: remounting the screens closes their
// sheets and edit state, and undo toasts that point at old data are dropped.
function GenerationScope({ children }: IDatabaseGateProps) {
  const generation = useLiveQuery(getDataGeneration, []);
  const { dismissActions } = useToast();
  const previous = useRef(generation);

  useEffect(() => {
    if (previous.current !== undefined && previous.current !== generation) {
      dismissActions();
    }
    previous.current = generation;
  }, [dismissActions, generation]);

  if (generation === undefined) {
    return null;
  }

  return <Fragment key={generation}>{children}</Fragment>;
}

export function DatabaseGate({ children }: IDatabaseGateProps) {
  const [status, setStatus] = useState<TDatabaseStatus>({ state: "opening" });

  useEffect(() => {
    let isActive = true;

    db.open()
      .then(() => {
        if (isActive) setStatus({ state: "ready" });
      })
      .catch((error: unknown) => {
        if (isActive) setStatus({ state: "failed", message: toMessage(error) });
      });

    return () => {
      isActive = false;
    };
  }, []);

  if (status.state === "opening") {
    return null;
  }

  if (status.state === "failed") {
    return <StorageError message={status.message} />;
  }

  return (
    <StorageErrorBoundary>
      <GenerationScope>{children}</GenerationScope>
    </StorageErrorBoundary>
  );
}
