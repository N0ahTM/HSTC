import { ForwardedRef, forwardRef, useRef } from 'react';

import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';

import styles from './StatsBadge.module.css';

interface StatsBadgeProps {
  onlineMembers: number | null;
  inVoice: number | null;
}

export const StatsBadge = forwardRef(function StatsBadge(
  { onlineMembers, inVoice }: StatsBadgeProps,
  ref: ForwardedRef<HTMLElement>
) {
  const onlineRef = useRef<HTMLSpanElement | null>(null);
  const voiceRef = useRef<HTMLSpanElement | null>(null);
  useAnimatedNumber(onlineMembers, onlineRef);
  useAnimatedNumber(inVoice, voiceRef);

  return (
    <aside ref={ref} className={styles.badge} aria-live="polite">
      <dl>
        <div>
          <dt>Online</dt>
          <dd>
            <span ref={onlineRef}>{onlineMembers ?? '—'}</span>
          </dd>
        </div>
        <div>
          <dt>In Voice</dt>
          <dd>
            <span ref={voiceRef}>{inVoice ?? '—'}</span>
          </dd>
        </div>
      </dl>
    </aside>
  );
});
