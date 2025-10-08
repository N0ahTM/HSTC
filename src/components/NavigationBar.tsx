import { useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';
import anime from 'animejs';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

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
  const prefersReducedMotion = usePrefersReducedMotion();
  const navRef = useRef<HTMLElement | null>(null);
  const mobileMenuRef = useRef<HTMLElement | null>(null);

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

  useEffect(() => {
    if (!visible || prefersReducedMotion) {
      return;
    }

    const nav = navRef.current;
    if (!nav) {
      return;
    }

    anime.remove(nav);
    anime({
      targets: nav,
      opacity: [0, 1],
      duration: 320,
      easing: 'easeOutCubic'
    });
  }, [visible, prefersReducedMotion]);

  useEffect(() => {
    if (!mobileOpen || prefersReducedMotion) {
      return;
    }

    const menu = mobileMenuRef.current;
    if (!menu) {
      return;
    }

    const items = menu.querySelectorAll('a, button');
    anime.remove(items);
    anime({
      targets: items,
      opacity: [0, 1],
      translateX: [16, 0],
      delay: anime.stagger(70),
      duration: 280,
      easing: 'easeOutCubic'
    });
  }, [mobileOpen, prefersReducedMotion]);

  return (
    <>
  <header ref={navRef} className={clsx(styles.navBar, !visible && styles.isHidden)}>
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
              <button
                className={styles.menuToggle}
                aria-label={mobileOpen ? 'Menü schließen' : 'Menü öffnen'}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((prev) => !prev)}
              >
                {mobileOpen ? '×' : '☰'}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <nav
            ref={mobileMenuRef}
            className={clsx(styles.navLinks, styles.mobileMenu)}
            aria-label="Mobiles Hauptmenü"
          >
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      {visible && <div aria-hidden="true" className={styles.navSpacer} />}
    </>
  );
}
