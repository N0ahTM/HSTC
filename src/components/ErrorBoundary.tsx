import React from 'react';

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
      <div style={{ minHeight: '100vh' }}>
        <div className="background-space" aria-hidden="true" />
        <div className="background-grid" aria-hidden="true" />
        <div style={{ position: 'relative', zIndex: 1, display: 'grid', placeItems: 'center', padding: '4rem 1rem' }}>
          <div className="glass-panel" style={{ width: 'min(860px,92vw)', padding: '3rem 2.2rem' }}>
            <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '.75rem' }}>
              <img src="/images/HSTC-Logo.webp" alt="HSTC" width={56} height={56} style={{ filter: 'drop-shadow(0 0 24px rgba(255,119,51,.45))' }} />
              <h1 style={{ fontSize: 'clamp(2.3rem,5vw,3.2rem)', textTransform: 'uppercase', letterSpacing: '3px' }}>Fehler aufgetreten</h1>
            </header>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
              Es ist ein unerwarteter Fehler aufgetreten. Bitte lade die Seite neu.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button className="btn" onClick={this.handleReload}>Zur Startseite</button>
              <a className="btn btn-outline" href="https://discord.gg/jV8rByuJ4G" target="_blank" rel="noreferrer noopener">Support auf Discord</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
