import { useEffect, useMemo, useRef, useState } from 'react';
import { clsx } from 'clsx';
import anime from 'animejs';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

import styles from './NavigationBar.module.css';

// Navigation bar no longer shows CTA buttons; therefore no props are required
interface NavigationBarProps {
  showCommunityLink?: boolean;
}

export function NavigationBar({ showCommunityLink = true }: NavigationBarProps) {
  const navLinks = useMemo(() => {
    const links: Array<{ href: string; label: string }> = [
      { href: '#top', label: 'Start' },
      { href: '#mission', label: 'Portfolio' }
    ];
    if (showCommunityLink) {
      links.push({ href: '#community', label: 'Community' });
    }
    links.push(
      { href: '#community-images', label: 'Bilder' },
      { href: '#join', label: 'Beitreten' }
    );
    return links;
  }, [showCommunityLink]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const navRef = useRef<HTMLElement | null>(null);
  const mobileMenuRef = useRef<HTMLElement | null>(null);

  const closeMobileMenu = () => setMobileOpen(false);
  const toggleMobileMenu = () => setMobileOpen((prev) => !prev);
  // No CTA handlers needed anymore

  useEffect(() => {
    const threshold = 600;
    const handleScroll = () => {
      setVisible(window.scrollY > threshold);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keep a CSS variable in sync with the nav height for spacer sizing
  useEffect(() => {
    const updateNavHeight = () => {
      const nav = navRef.current;
      if (!nav) return;
      const height = nav.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--nav-height', `${height}px`);
    };
    updateNavHeight();
    window.addEventListener('resize', updateNavHeight);
    return () => window.removeEventListener('resize', updateNavHeight);
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
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
            <a href="#top" className={styles.logo} onClick={closeMobileMenu}>
              <img src="/images/HSTC-Logo.webp" alt="HSTC" loading="lazy" />
              <span>HSTC</span>
            </a>

            <nav className={styles.navLinks} aria-label="Hauptnavigation">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} onClick={closeMobileMenu}>
                  {link.label}
                </a>
              ))}
            </nav>

            <div className={styles.actions}>
              <button
                className={styles.menuToggle}
                type="button"
                aria-label={mobileOpen ? 'Menü schliessen' : 'Menü öffnen'}
                aria-controls="primary-navigation"
                onClick={toggleMobileMenu}
              >
                <span aria-hidden="true">{mobileOpen ? '\u00D7' : '\u2261'}</span>
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <nav
            ref={mobileMenuRef}
            id="primary-navigation"
            className={clsx(styles.navLinks, styles.mobileMenu)}
            aria-label="Mobiles Hauptmenü"
          >
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={closeMobileMenu}>
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
