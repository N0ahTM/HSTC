import React from 'react';
import styles from './ErrorBoundary.module.css';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught', error, errorInfo);
  }

  handleReload = () => {
    window.location.assign('/');
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className={styles.root}>
        <div className="background-space" aria-hidden="true" />
        <div className="background-grid" aria-hidden="true" />
        <div className={styles.shell}>
          <div className={`glass-panel ${styles.panel}`}>
            <header className={styles.header}>
              <img className={styles.logo} src="/images/HSTC-Logo.webp" alt="HSTC" width={56} height={56} />
              <h1 className={styles.title}>Fehler aufgetreten</h1>
            </header>
            <p className={styles.text}>
              Es ist ein unerwarteter Fehler aufgetreten. Bitte lade die Seite neu.
            </p>
            <div className={styles.actions}>
              <button className="btn" onClick={this.handleReload}>Zur Startseite</button>
              <a className="btn btn-outline" href="https://discord.gg/jV8rByuJ4G" target="_blank" rel="noreferrer noopener">Support auf Discord</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
