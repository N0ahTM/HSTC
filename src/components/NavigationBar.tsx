import { useState } from 'react';
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

  return (
    <header className={styles.navBar}>
      <div className="container">
        <div className={styles.inner}>
          <a href="#top" className={styles.logo}>
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
            <button className="btn" type="button" onClick={onJoin}>
              Jetzt beitreten
            </button>
            <button className="btn btn-outline" type="button" onClick={onDiscord}>
              Discord
            </button>
            <button
              className={styles.menuToggle}
              aria-label="Menü öffnen"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <nav className={clsx(styles.navLinks, styles.mobileMenu)}>
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
              {link.label}
            </a>
          ))}
          <button className="btn" type="button" onClick={() => { setMobileOpen(false); onJoin(); }}>
            Jetzt beitreten
          </button>
          <button
            className="btn btn-outline"
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onDiscord();
            }}
          >
            Discord
          </button>
        </nav>
      )}
    </header>
  );
}
