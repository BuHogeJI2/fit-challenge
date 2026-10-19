import { Component, useEffect, useState } from "react";
import type { ErrorInfo } from "react";
import { db } from "../../lib/db";
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

  return <StorageErrorBoundary>{children}</StorageErrorBoundary>;
}
