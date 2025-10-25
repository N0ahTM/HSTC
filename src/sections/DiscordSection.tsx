import { useEffect, useRef, useState } from 'react';

import { SectionHeading } from '@/components/SectionHeading';
import { useDiscordStats } from '@/hooks/useDiscordStats';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useStaggerReveal } from '@/hooks/useAnimateOnIntersect';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';

import styles from './DiscordSection.module.css';

interface DiscordSectionProps {
  onJoinClick: () => void;
}

export function DiscordSection({ onJoinClick }: DiscordSectionProps) {
  const { presenceCount, inVoice, isLoading, error } = useDiscordStats();
  const prefersReducedMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const qrRef = useRef<HTMLImageElement | null>(null);
  const onlineRef = useRef<HTMLSpanElement | null>(null);
  const voiceRef = useRef<HTMLSpanElement | null>(null);
  const [allowGlow, setAllowGlow] = useState(() => typeof window === 'undefined');

  useStaggerReveal(sectionRef, { rootMargin: '0px 0px -12%' });

  const onlineValue = isLoading || presenceCount === null ? null : presenceCount;
  const voiceValue = isLoading || inVoice === null ? null : inVoice;

  useAnimatedNumber(onlineValue, onlineRef);
  useAnimatedNumber(voiceValue, voiceRef);

  useEffect(() => {
    if (prefersReducedMotion) {
      setAllowGlow(false);
      return;
    }
    const target = sectionRef.current;
    if (!target || typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      setAllowGlow(true);
      return;
    }
    let cancelled = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!cancelled && entries.some((entry) => entry.isIntersecting)) {
          setAllowGlow(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(target);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion || !allowGlow) {
      return;
    }

    const qr = qrRef.current;
    if (!qr) {
      return;
    }

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    void import('animejs').then(({ default: anime }) => {
      if (cancelled || !qrRef.current) {
        return;
      }
      const glow = anime({
        targets: qrRef.current,
        filter: ['drop-shadow(0 0 0px rgba(255,119,51,0))', 'drop-shadow(0 0 16px rgba(255,119,51,0.4))'],
        duration: 4000,
        direction: 'alternate',
        easing: 'easeInOutSine',
        loop: true
      });
      cleanup = () => glow.pause();
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [allowGlow, prefersReducedMotion]);

  return (
    <section ref={sectionRef} className={`section ${styles.section}`} id="discord">
      <div className="container">
        <SectionHeading
          eyebrow="Discord"
          title="Dein Platz im HSTC-HQ"
          description="Der Server ist das Herzstück unserer Organisation – Missionsplanung, Loadout-Sheets, Academy-Trainings und Social Events laufen hier zusammen."
        />
        <div className={styles.grid}>
          <article className={styles.card} data-reveal-item>
            <h3>Live Community Status</h3>
            <div className={styles.stats}>
              <div className={styles.statsRow}>
                <span>Mitglieder online</span>
                <strong><span ref={onlineRef}>{onlineValue ?? '—'}</span></strong>
              </div>
              <div className={styles.statsRow}>
                <span>In Voice Channels</span>
                <strong><span ref={voiceRef}>{voiceValue ?? '—'}</span></strong>
              </div>
            </div>
            {error && <p role="status">{error}</p>}
            <button className="btn" type="button" onClick={onJoinClick}>
              Jetzt beitreten
            </button>
          </article>
          <article className={`${styles.card} ${styles.qrCard}`} data-reveal-item>
            <h3>Scan &amp; connect</h3>
            <p>Direkt mit deinem Mobilgerät auf den Server kommen – der QR-Code führt zur aktuellen Einladung.</p>
            <img
              ref={qrRef}
              src="/images/hstc_discord_qr.webp"
              alt="Discord Einladung QR Code"
              className={styles.qrImage}
              loading="lazy"
              decoding="async"
              width={256}
              height={256}
            />
            <button className="btn btn-outline" type="button" onClick={onJoinClick}>
              Einladung öffnen
            </button>
          </article>
        </div>
      </div>
    </section>
  );
}
