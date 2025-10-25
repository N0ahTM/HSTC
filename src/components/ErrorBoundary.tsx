import React, { useEffect, useRef } from 'react';
import styles from './ErrorBoundary.module.css';
import ResponsiveImage from '@/components/ResponsiveImage';
import { selectBackgroundUrl } from '@/utils/imageManifest';

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
        <BackgroundSpace />
        <div className="background-grid" aria-hidden="true" />
        <div className={styles.shell}>
          <div className={`glass-panel ${styles.panel}`}>
            <header className={styles.header}>
              <ResponsiveImage className={styles.logo} src="/images/HSTC-Logo.webp" alt="HSTC" width={56} height={56} autoSize={false} sizes="56px" />
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

function BackgroundSpace() {
  const backdropRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const node = backdropRef.current;
    if (!node) {
      return;
    }

    let cancelled = false;
    let raf = 0;

    const update = async () => {
      try {
        const rect = node.getBoundingClientRect();
        const width = rect.width || window.innerWidth || 1280;
        const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
        const best = await selectBackgroundUrl('/images/backgrounds/Planet_4.webp', Math.ceil(width), dpr);
        if (!cancelled) {
          node.style.setProperty('--space-background-image', `url('${best}')`);
        }
      } catch {
        /* ignore */
      }
    };

    const scheduleUpdate = () => {
      if (raf) {
        cancelAnimationFrame(raf);
      }
      raf = window.requestAnimationFrame(() => {
        void update();
      });
    };

    scheduleUpdate();
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('orientationchange', scheduleUpdate);

    return () => {
      cancelled = true;
      if (raf) {
        cancelAnimationFrame(raf);
      }
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('orientationchange', scheduleUpdate);
    };
  }, []);

  return <div ref={backdropRef} className="background-space" aria-hidden="true" />;
}
