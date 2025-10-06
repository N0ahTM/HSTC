import { useState, useEffect } from 'react';
import { clsx } from 'clsx';

import styles from './NavigationBar.module.css';

interface NavigationBarProps {
  onJoin: () => void;
  onDiscord: () => void;
}

const navLinks: Array<{ href: string; label: string }> = [
  { href: '#mission', label: 'Mission' },
  { href: '#operations', label: 'Operationen' },
  { href: '#community', label: 'Community' },
  { href: '#discord', label: 'Discord' },
  { href: '#join', label: 'Beitreten' }
];

export function NavigationBar({ onJoin, onDiscord }: NavigationBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [visible, setVisible] = useState(false); // sichtbar sobald man scrollt

  useEffect(() => {
    const threshold = 600; // Pixel ab wann sichtbar
    const handleScroll = () => {
      setVisible(window.scrollY > threshold);
    };
    handleScroll(); // Initialzustand
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Escape schließt das mobile Menü
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  return (
    <>
      <header className={clsx(styles.navBar, !visible && styles.isHidden)}>
        <div className="container">
          <div className={styles.inner}>
            <a href="#top" className={styles.logo} onClick={() => setMobileOpen(false)}>
              <img src="/images/HSTC-Logo.webp" alt="HSTC" loading="lazy" />
              <span>HSTC</span>
            </a>

            <nav className={styles.navLinks} aria-label="Hauptnavigation">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                  {link.label}
                </a>
              ))}
            </nav>

            <div className={styles.actions}>
              <button className="btn" type="button" onClick={onJoin}>Jetzt beitreten</button>
              <button className="btn btn-outline" type="button" onClick={onDiscord}>Discord</button>
              <button
                className={styles.menuToggle}
                aria-label={mobileOpen ? 'Menü schließen' : 'Menü öffnen'}
                aria-expanded={mobileOpen ? 'true' : 'false'}
                onClick={() => setMobileOpen((prev) => !prev)}
              >
                {mobileOpen ? '×' : '☰'}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <nav className={clsx(styles.navLinks, styles.mobileMenu)} aria-label="Mobiles Hauptmenü">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                {link.label}
              </a>
            ))}
            <button className="btn" type="button" onClick={() => { setMobileOpen(false); onJoin(); }}>Jetzt beitreten</button>
            <button className="btn btn-outline" type="button" onClick={() => { setMobileOpen(false); onDiscord(); }}>Discord</button>
          </nav>
        )}
      </header>

      {visible && <div aria-hidden="true" className={styles.navSpacer} />}
    </>
  );
}
