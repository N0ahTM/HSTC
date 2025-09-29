import styles from './StatsBadge.module.css';

interface StatsBadgeProps {
  onlineMembers: number | null;
  inVoice: number | null;
}

export function StatsBadge({ onlineMembers, inVoice }: StatsBadgeProps) {
  return (
    <aside className={styles.badge} aria-live="polite">
      <dl>
        <div>
          <dt>Online</dt>
          <dd>{onlineMembers ?? '—'}</dd>
        </div>
        <div>
          <dt>In Voice</dt>
          <dd>{inVoice ?? '—'}</dd>
        </div>
      </dl>
    </aside>
  );
}
