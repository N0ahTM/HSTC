import { SectionHeading } from '@/components/SectionHeading';
import { useDiscordStats } from '@/hooks/useDiscordStats';

import styles from './DiscordSection.module.css';

interface DiscordSectionProps {
  onJoinClick: () => void;
}

export function DiscordSection({ onJoinClick }: DiscordSectionProps) {
  const { presenceCount, inVoice, isLoading, error } = useDiscordStats();

  return (
    <section className={`section ${styles.section}`} id="discord">
      <div className="container">
        <SectionHeading
          eyebrow="Discord"
          title="Dein Platz im HSTC-HQ"
          description="Der Server ist das Herzstück unserer Organisation – Missionsplanung, Loadout-Sheets, Academy-Trainings und Social Events laufen hier zusammen."
        />
        <div className={styles.grid}>
          <article className={styles.card}>
            <h3>Live Community Status</h3>
            <div className={styles.stats}>
              <div className={styles.statsRow}>
                <span>Mitglieder online</span>
                <strong>{isLoading || presenceCount === null ? '—' : presenceCount}</strong>
              </div>
              <div className={styles.statsRow}>
                <span>In Voice Channels</span>
                <strong>{isLoading || inVoice === null ? '—' : inVoice}</strong>
              </div>
            </div>
            {error && <p role="status">{error}</p>}
            <button className="btn" type="button" onClick={onJoinClick}>
              Jetzt beitreten
            </button>
          </article>
          <article className={`${styles.card} ${styles.qrCard}`}>
            <h3>Scan &amp; connect</h3>
            <p>Direkt mit deinem Mobilgerät auf den Server kommen – der QR-Code führt zur aktuellen Einladung.</p>
            <img
              src="/images/hstc_discord_qr.webp"
              alt="Discord Einladung QR Code"
              className={styles.qrImage}
              loading="lazy"
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
