import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { fetchUserAttributes, getCurrentUser, signInWithRedirect, signOut } from 'aws-amplify/auth';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { amplifyClient } from './amplifyClient';

type AmplifyMember = {
  id: string;
  ownerId: string;
  discordId: string;
  discordUsername: string;
  discordAvatar?: string | null;
  ingameHandle: string;
  motto?: string | null;
  biography?: string | null;
  activities?: string[] | null;
  roles?: string[] | null;
  timezone?: string | null;
  isAdmin?: boolean | null;
  createdAt: string;
  updatedAt: string;
};
type AmplifyShip = {
  id: string;
  memberId: string;
  ownerId: string;
  name: string;
  manufacturer?: string | null;
  model?: string | null;
  focus?: string | null;
  availability?: 'MISSION' | 'ALWAYS' | 'SITUATIONAL' | null;
  roleTag?: string | null;
  crew?: number | null;
  hangarLocation?: string | null;
  notes?: string | null;
};
type AmplifyNews = {
  id: string;
  slug: string;
  title: string;
  summary?: string | null;
  content: string;
  visibility: 'PUBLIC' | 'MEMBERS';
  authorId: string;
  authorName?: string | null;
  publishedAt: string;
  updatedAt: string;
};
type AmplifyEvent = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  visibility: 'PUBLIC' | 'MEMBERS';
  location?: string | null;
  voiceChannel?: string | null;
  startsAt: string;
  endsAt?: string | null;
  createdById: string;
  createdByName?: string | null;
  createdAt: string;
  updatedAt: string;
};
type DiscordWidget = {
  name: string;
  presenceCount: number;
  voiceOnline: number;
  channelCount: number;
  instantInvite?: string;
};
type ProfileShipDraft = {
  localId: string;
  recordId?: string;
  name: string;
  focus: string;
  roleTag: string;
  availability: 'MISSION' | 'ALWAYS' | 'SITUATIONAL';
};

type ProfileFormState = {
  ingameHandle: string;
  motto: string;
  biography: string;
  activities: Record<string, boolean>;
};

const ACTIVITY_OPTIONS = [
  'Pilot',
  'PVP',
  'PVE',
  'FPS',
  'Support',
  'Handel',
  'Mining',
  'Salvaging',
  'Erkundung'
] as const;

const SHIP_AVAILABILITY_OPTIONS: Record<'MISSION' | 'ALWAYS' | 'SITUATIONAL', string> = {
  MISSION: 'Missionsbereit',
  ALWAYS: 'Immer verfügbar',
  SITUATIONAL: 'Situationsabhängig'
};

const DISCORD_GUILD_ID = '628996745837150211';
const ADMIN_DISCORD_IDS = (import.meta.env.VITE_ADMIN_DISCORD_IDS ?? '')
  .split(',')
  .map(id => id.trim())
  .filter(Boolean);

function createShipDraft(source?: Partial<ProfileShipDraft>): ProfileShipDraft {
  return {
    localId: crypto.randomUUID(),
    recordId: source?.recordId,
    name: source?.name ?? '',
    focus: source?.focus ?? '',
    roleTag: source?.roleTag ?? '',
    availability: source?.availability ?? 'MISSION'
  };
}

function createProfileState(
  member?: AmplifyMember,
  ships?: AmplifyShip[]
): [ProfileFormState, ProfileShipDraft[]] {
  const activities = ACTIVITY_OPTIONS.reduce<Record<string, boolean>>((acc, key) => {
    const activeList = member?.activities ?? [];
    acc[key] = activeList.includes(key);
    return acc;
  }, {});

  const form: ProfileFormState = {
    ingameHandle: member?.ingameHandle ?? '',
    motto: member?.motto ?? '',
    biography: member?.biography ?? '',
    activities
  };

  const shipDrafts = (ships ?? []).map(ship =>
    createShipDraft({
      recordId: ship.id,
      name: ship.name,
      focus: ship.focus ?? '',
      roleTag: ship.roleTag ?? '',
      availability: ship.availability ?? 'MISSION'
    })
  );

  return [form, shipDrafts.length ? shipDrafts : [createShipDraft()]];
}

function formatDateTime(value?: string | null) {
  if (!value) return '';
  try {
    const date = new Date(value);
    return new Intl.DateTimeFormat('de-CH', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  } catch (error) {
    return value ?? '';
  }
}

function gameYear() {
  const offset = 930;
  return new Date().getFullYear() + offset;
}

function sanitizeMarkdown(markdown: string) {
  const rawHtml = marked.parse(markdown, { breaks: true });
  return DOMPurify.sanitize(rawHtml);
}

function getAvatarUrl(member?: AmplifyMember | null): string | null {
  if (!member?.discordAvatar) return null;
function createSlug(input: string) {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '');
  return `${Date.now()}-${base || 'entry'}`;
}
  return `https://cdn.discordapp.com/avatars/${member.discordId}/${member.discordAvatar}.png?size=256`;
}

type CognitoUser = {
  username: string;
  attributes: Record<string, string>;
};

type FleetCard = {
  id: string;
  name: string;
  focus?: string;
  roleTag?: string;
  availability?: string;
  contributor: {
    ingameHandle: string;
    discordUsername: string;
  };
};

type MemberDirectoryCard = {
  id: string;
  ingameHandle: string;
  motto?: string;
  biography?: string;
  activities: string[];
  avatarUrl?: string | null;
};

async function loadCurrentUser(): Promise<CognitoUser | null> {
  try {
    const user = await getCurrentUser();
    const attributes = await fetchUserAttributes();
    return { username: user.username, attributes };
  } catch {
    return null;
  }
}

function App() {
  const [authUser, setAuthUser] = useState<CognitoUser | null>(null);
  const [memberRecord, setMemberRecord] = useState<AmplifyMember | null>(null);
  const [memberShips, setMemberShips] = useState<AmplifyShip[]>([]);
  const [profileForm, setProfileForm] = useState<ProfileFormState>(() => createProfileState()[0]);
  const [profileShips, setProfileShips] = useState<ProfileShipDraft[]>([createShipDraft()]);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<string>('');

  const [publicNews, setPublicNews] = useState<AmplifyNews[]>([]);
  const [memberNews, setMemberNews] = useState<AmplifyNews[]>([]);
  const [events, setEvents] = useState<AmplifyEvent[]>([]);
  const [fleet, setFleet] = useState<FleetCard[]>([]);
  const [members, setMembers] = useState<MemberDirectoryCard[]>([]);
  const [discordWidget, setDiscordWidget] = useState<DiscordWidget | null>(null);
  const [newsDraft, setNewsDraft] = useState({ title: '', visibility: 'PUBLIC', content: '' });
  const [eventDraft, setEventDraft] = useState({ title: '', startsAt: '', location: '', description: '', visibility: 'PUBLIC' });
  const [isPublishingNews, setIsPublishingNews] = useState(false);
  const [isPublishingEvent, setIsPublishingEvent] = useState(false);

  const isAuthenticated = Boolean(authUser);
  const isAdmin = Boolean(memberRecord?.isAdmin) || (memberRecord?.discordId ? ADMIN_DISCORD_IDS.includes(memberRecord.discordId) : false);

  useEffect(() => {
    async function bootstrap() {
      try {
        const user = (await Auth.currentAuthenticatedUser()) as CognitoUser;
        setAuthUser(user);
        await ensureMember(user);
      } catch {
        setAuthUser(null);
        setMemberRecord(null);
        setMemberShips([]);
        setProfileForm(createProfileState()[0]);
        setProfileShips([createShipDraft()]);
      }

      await Promise.all([
        loadPublicNews(),
        loadFleetOverview(),
        loadEvents(),
        loadMemberDirectory(),
        loadDiscordWidget()
      ]);
    }

    bootstrap();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setMemberNews([]);
      return;
    }
    loadMemberNews();
  }, [isAuthenticated]);

  useEffect(() => {
    const [form, ships] = createProfileState(memberRecord ?? undefined, memberShips);
    setProfileForm(form);
    setProfileShips(ships);
  }, [memberRecord, memberShips]);

  async function ensureMember(user: CognitoUser) {
    const attributes = user.attributes ?? {};
    const discordId = attributes['custom:discord_id'] ?? '';
    if (!discordId) {
      console.error('Discord-ID fehlt im Benutzerprofil.');
      return;
    }

    const ownerId = user.username;
    const username =
      attributes.preferred_username ??
      attributes.nickname ??
      attributes.name ??
      attributes['cognito:username'] ??
      ownerId;
    const avatar = attributes['custom:discord_avatar'] ?? attributes.picture ?? null;
    const now = new Date().toISOString();
    const ingameHandleDefault = attributes['custom:pilot_call_sign'] ?? username;

    try {
      const existing = await amplifyClient.models.Member.list({
        authMode: 'userPool',
        filter: {
          discordId: { eq: discordId }
        },
        limit: 1
      });

      let record: AmplifyMember | null = (existing.data ?? [])[0] as AmplifyMember | undefined ?? null;

      if (!record) {
        const created = await amplifyClient.models.Member.create({
          ownerId,
          discordId,
          discordUsername: username,
          discordAvatar: avatar,
          ingameHandle: ingameHandleDefault,
          motto: '',
          biography: '',
          activities: [],
          roles: [],
          timezone: null,
          createdAt: now,
          updatedAt: now,
          isAdmin: ADMIN_DISCORD_IDS.includes(discordId)
        }, { authMode: 'userPool' });
        record = created.data as AmplifyMember;
      } else {
        const shouldSync =
          record.discordUsername !== username ||
          record.discordAvatar !== avatar;
        if (shouldSync) {
          const updated = await amplifyClient.models.Member.update({
            id: record.id,
            discordUsername: username,
            discordAvatar: avatar,
            updatedAt: now,
            isAdmin: record.isAdmin ?? ADMIN_DISCORD_IDS.includes(discordId)
          }, { authMode: 'userPool' });
          record = updated.data as AmplifyMember;
        }
      }

      const shipsResponse = await amplifyClient.models.Ship.list({
        authMode: 'userPool',
        filter: {
          memberId: { eq: record.id }
        }
      });

      setMemberRecord(record);
      setMemberShips((shipsResponse.data ?? []) as AmplifyShip[]);
    } catch (error) {
      console.error('Member-Synchronisation fehlgeschlagen', error);
    }
  }

  async function loadPublicNews() {
    try {
      const response = await amplifyClient.models.NewsEntry.list({
        authMode: 'apiKey',
        filter: { visibility: { eq: 'PUBLIC' } },
        sortDirection: 'DESC',
        limit: 50
      });
      setPublicNews((response.data ?? []) as AmplifyNews[]);
    } catch (error) {
      console.error('Public news fetch failed', error);
      setPublicNews([]);
    }
  }

  async function loadMemberNews() {
    if (!isAuthenticated) return;
    try {
      const response = await amplifyClient.models.NewsEntry.list({
        authMode: 'userPool',
        filter: { visibility: { eq: 'MEMBERS' } },
        sortDirection: 'DESC',
        limit: 50
      });
      setMemberNews((response.data ?? []) as AmplifyNews[]);
    } catch (error) {
      console.error('Member news fetch failed', error);
      setMemberNews([]);
    }
  }

  async function loadEvents() {
    try {
      const response = await amplifyClient.models.Event.list({
        authMode: isAuthenticated ? 'userPool' : 'apiKey',
        sortDirection: 'ASC',
        filter: isAuthenticated ? undefined : { visibility: { eq: 'PUBLIC' } },
        limit: 100
      });
      setEvents((response.data ?? []) as AmplifyEvent[]);
    } catch (error) {
      console.error('Events fetch failed', error);
      setEvents([]);
    }
  }

  async function loadMemberDirectory() {
    try {
      const response = await amplifyClient.models.Member.list({
        authMode: 'apiKey',
        limit: 500
      });
      const data = (response.data ?? []) as AmplifyMember[];
      const mapped: MemberDirectoryCard[] = data.map(entry => ({
        id: entry.id,
        ingameHandle: entry.ingameHandle,
        motto: entry.motto ?? undefined,
        biography: entry.biography ?? undefined,
        activities: entry.activities ?? [],
        avatarUrl: getAvatarUrl(entry)
      }));
      setMembers(mapped);
    } catch (error) {
      console.error('Member directory fetch failed', error);
      setMembers([]);
    }
  }

  async function loadFleetOverview() {
    try {
      const [shipsRes, membersRes] = await Promise.all([
        amplifyClient.models.Ship.list({ authMode: 'apiKey', limit: 500 }),
        amplifyClient.models.Member.list({ authMode: 'apiKey', limit: 500 })
      ]);
      const memberIndex = new Map(
        ((membersRes.data ?? []) as AmplifyMember[]).map(member => [member.id, member])
      );
      const cards: FleetCard[] = ((shipsRes.data ?? []) as AmplifyShip[]).map(ship => {
        const owner = memberIndex.get(ship.memberId);
        return {
          id: ship.id,
          name: ship.name,
          focus: ship.focus ?? undefined,
          roleTag: ship.roleTag ?? undefined,
          availability: ship.availability ?? undefined,
          contributor: {
            ingameHandle: owner?.ingameHandle ?? 'Unbekannt',
            discordUsername: owner?.discordUsername ?? 'Mitglied'
          }
        };
      });
      setFleet(cards);
    } catch (error) {
      console.error('Fleet fetch failed', error);
      setFleet([]);
    }
  }

  async function loadDiscordWidget() {
    try {
      const response = await fetch(`https://discord.com/api/guilds/${DISCORD_GUILD_ID}/widget.json`);
      if (!response.ok) throw new Error('Discord API error');
      const payload = await response.json();
      const widget: DiscordWidget = {
        name: payload.name,
        presenceCount: payload.presence_count ?? 0,
        voiceOnline: Array.isArray(payload.members)
          ? payload.members.filter((m: any) => Boolean(m?.channel_id)).length
          : 0,
        channelCount: payload.channels?.length ?? 0,
        instantInvite: payload.instant_invite ?? undefined
      };
      setDiscordWidget(widget);
    } catch (error) {
      console.warn('Discord widget konnte nicht geladen werden', error);
      setDiscordWidget(null);
    }
  }

  async function handleLogin() {
    try {
      await signInWithRedirect({ provider: { custom: 'discord' } });
    } catch (error) {
      console.error('Discord Login fehlgeschlagen', error);
    }
  }

  async function handleLogout() {
    try {
      await signOut({ global: true });
      setAuthUser(null);
      setMemberRecord(null);
      setMemberShips([]);
      setProfileForm(createProfileState()[0]);
      setProfileShips([createShipDraft()]);
    } catch (error) {
      console.error('Logout fehlgeschlagen', error);
    }
  }

  function toggleActivity(activity: string) {
    setProfileForm(prev => ({
      ...prev,
      activities: {
        ...prev.activities,
        [activity]: !prev.activities[activity]
      }
    }));
  }

  function updateProfileField(field: keyof ProfileFormState, value: string) {
    setProfileForm(prev => ({ ...prev, [field]: value }));
  }

  function updateShip(localId: string, patch: Partial<ProfileShipDraft>) {
    setProfileShips(prev => prev.map(ship => (ship.localId === localId ? { ...ship, ...patch } : ship)));
  }

  function addShipRow() {
    setProfileShips(prev => [...prev, createShipDraft()]);
  }

  function removeShipRow(localId: string) {
    setProfileShips(prev => {
      const next = prev.filter(ship => ship.localId !== localId);
      return next.length ? next : [createShipDraft()];
    });
  }

  async function handleProfileSubmit(event: FormEvent) {
    event.preventDefault();
    if (!memberRecord || !authUser) return;
    if (!profileForm.ingameHandle.trim()) {
      setProfileFeedback('Bitte gib deinen Ingame Handle ein.');
      return;
    }

    const selectedActivities = ACTIVITY_OPTIONS.filter(option => profileForm.activities[option]);
    const now = new Date().toISOString();

    setIsSavingProfile(true);
    setProfileFeedback('');

    try {
      const updated = await amplifyClient.models.Member.update({
        id: memberRecord.id,
        ingameHandle: profileForm.ingameHandle.trim(),
        motto: profileForm.motto.trim() || null,
        biography: profileForm.biography.trim() || null,
        activities: selectedActivities,
        updatedAt: now
      }, { authMode: 'userPool' });

      const cleanedShips = profileShips
        .map(ship => ({
          ...ship,
          name: ship.name.trim()
        }))
        .filter(ship => ship.name.length > 0);

      const existingShips = memberShips;
      const shipsToDelete = existingShips.filter(oldShip => !cleanedShips.some(ship => ship.recordId === oldShip.id));
      const shipsToUpdate = cleanedShips.filter(ship => Boolean(ship.recordId));
      const shipsToCreate = cleanedShips.filter(ship => !ship.recordId);

      await Promise.all([
        ...shipsToDelete.map(ship =>
          amplifyClient.models.Ship.delete({ id: ship.id }, { authMode: 'userPool' })
        ),
        ...shipsToUpdate.map(ship =>
          amplifyClient.models.Ship.update({
            id: ship.recordId!,
            name: ship.name,
            focus: ship.focus || null,
            roleTag: ship.roleTag || null,
            availability: ship.availability
          }, { authMode: 'userPool' })
        ),
        ...shipsToCreate.map(ship =>
          amplifyClient.models.Ship.create({
            memberId: memberRecord.id,
            ownerId: authUser.username,
            name: ship.name,
            focus: ship.focus || null,
            roleTag: ship.roleTag || null,
            availability: ship.availability
          }, { authMode: 'userPool' })
        )
      ]);

      setMemberRecord(updated.data as AmplifyMember);
      const refreshedShips = await amplifyClient.models.Ship.list({
        authMode: 'userPool',
        filter: { memberId: { eq: memberRecord.id } }
      });
      setMemberShips((refreshedShips.data ?? []) as AmplifyShip[]);

      await Promise.all([loadFleetOverview(), loadMemberDirectory()]);
      setProfileFeedback('Profil gespeichert.');
    } catch (error: any) {
      console.error('Profil konnte nicht gespeichert werden', error);
      setProfileFeedback(error?.message ?? 'Profil konnte nicht gespeichert werden.');
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleNewsSubmit(event: FormEvent) {
    event.preventDefault();
    if (!isAdmin || !memberRecord) return;
    if (!newsDraft.title.trim() || !newsDraft.content.trim()) {
      return;
    }

    setIsPublishingNews(true);

    try {
      await amplifyClient.models.NewsEntry.create({
        slug: createSlug(newsDraft.title),
        title: newsDraft.title.trim(),
        content: newsDraft.content.trim(),
        visibility: newsDraft.visibility as 'PUBLIC' | 'MEMBERS',
        authorId: memberRecord.id,
        authorName: memberRecord.ingameHandle ?? memberRecord.discordUsername,
        summary: newsDraft.content.trim().slice(0, 140),
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { authMode: 'userPool' });

      setNewsDraft({ title: '', visibility: 'PUBLIC', content: '' });
      await Promise.all([loadPublicNews(), loadMemberNews()]);
    } catch (error) {
      console.error('News konnten nicht erstellt werden', error);
    } finally {
      setIsPublishingNews(false);
    }
  }

  async function handleEventSubmit(event: FormEvent) {
    event.preventDefault();
    if (!isAdmin || !memberRecord) return;
    if (!eventDraft.title.trim() || !eventDraft.startsAt || !eventDraft.location.trim()) {
      return;
    }

    setIsPublishingEvent(true);
    const now = new Date().toISOString();

    try {
      await amplifyClient.models.Event.create({
        slug: createSlug(eventDraft.title),
        title: eventDraft.title.trim(),
        description: eventDraft.description.trim() || null,
        visibility: eventDraft.visibility as 'PUBLIC' | 'MEMBERS',
        location: eventDraft.location.trim(),
        startsAt: new Date(eventDraft.startsAt).toISOString(),
        endsAt: null,
        voiceChannel: null,
        createdById: memberRecord.id,
        createdByName: memberRecord.ingameHandle ?? memberRecord.discordUsername,
        createdAt: now,
        updatedAt: now
      }, { authMode: 'userPool' });

      setEventDraft({ title: '', startsAt: '', location: '', description: '', visibility: 'PUBLIC' });
      await loadEvents();
    } catch (error) {
      console.error('Event konnte nicht gespeichert werden', error);
    } finally {
      setIsPublishingEvent(false);
    }
  }

  const fleetBadges = useMemo(() => {
    const totalShips = fleet.length;
    const missionReady = fleet.filter(entry => entry.availability === 'MISSION' || entry.availability === 'ALWAYS').length;
    return { totalShips, missionReady };
  }, [fleet]);

  return (
    <div>
      <div className="hexagon-grid" />
      <div className="space-bg" />

      <header className="topbar">
        <div className="container">
          <div className="logo">HSTC</div>
          <nav className="main-nav">
            <a href="#mission">Mission</a>
            <a href="#news">News</a>
            <a href="#fleet">Flotte</a>
            <a href="#events">Events</a>
            <a href="#community">Community</a>
            <a href="#join">Beitreten</a>
          </nav>
          <div className="auth-panel">
            {!isAuthenticated ? (
              <button type="button" className="btn btn-outline" onClick={handleLogin}>
                Discord Login
              </button>
            ) : (
              <div className="user-summary">
                {memberRecord && (
                  <img
                    src={getAvatarUrl(memberRecord) ?? 'https://hstc.space/wp-content/uploads/2025/03/HSTC-Logo.webp'}
                    alt="Avatar"
                  />
                )}
                <span>{memberRecord?.ingameHandle ?? memberRecord?.discordUsername ?? 'Mitglied'}</span>
                <button type="button" className="btn btn-ghost" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="hero" id="mission">
          <div className="year-badge">
            <img src="https://hstc.space/wp-content/uploads/2025/04/switzerland-flag-square-medium.webp" alt="CH" className="flag" />
            <img src="https://hstc.space/wp-content/uploads/2025/04/germany-flag-square-medium.webp" alt="DE" className="flag" />
            <img src="https://hstc.space/wp-content/uploads/2025/04/austria-flag-square-medium.webp" alt="AT" className="flag" />
          </div>
          <div className="stats-badge">
            <div>Gegründet: <span className="stat-value">2947</span></div>
            <div>Online: <span className="stat-value">{discordWidget?.presenceCount ?? '--'}</span></div>
            <div>Im Voice: <span className="stat-value">{discordWidget?.voiceOnline ?? '--'}</span></div>
          </div>
          <div className="hero-content">
            <img src="https://hstc.space/wp-content/uploads/2025/03/HSTC-Logo.webp" alt="HSTC Logo" className="hero-logo" />
            <h1 className="hero-title">Helvetic Security &amp; Transport Corporation</h1>
            <p className="hero-subtitle">D/A/CH Elite im Verse – Neutral. Präzise. Effizient.</p>
            <p className="hero-text">
              Mitglied der neutralsten deutschsprachigen Organisation im Verse. Wir sichern Konvois, führen Spezialeinsätze durch und bieten Schutz für Handel &amp; Diplomatie.
            </p>
            <div className="hero-cta">
              <a href="#join" className="btn">Jetzt beitreten</a>
              <a href="https://discord.gg/jV8rByuJ4G" target="_blank" rel="noreferrer" className="btn btn-outline">
                Discord
              </a>
            </div>
          </div>
        </section>

        <section className="glass-section" id="capabilities">
          <div className="container">
            <div className="glass-cards">
              <article className="glass-card background-one">
                <h3 className="card-title">Demokratische Führung</h3>
                <p className="card-text">
                  Jede Stimme zählt. Unser Verwaltungsrat trifft Entscheidungen gemeinsam mit der gesamten Orga – transparent und nachvollziehbar.
                </p>
              </article>
              <article className="glass-card background-two">
                <h3 className="card-title">D/A/CH-Community</h3>
                <p className="card-text">
                  Schweizer Präzision, deutsche Zuverlässigkeit und österreichische Gelassenheit. Wir operieren primär auf Deutsch und respektieren jede Spielweise.
                </p>
              </article>
              <article className="glass-card background-three">
                <h3 className="card-title">Elite Einsätze</h3>
                <p className="card-text">
                  Von Spezialeinsätzen bis zu Großflotten-Operationen: unsere WarBand-Leads sorgen für taktische Dominanz zu jeder Zeit.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="news-section" id="news">
          <div className="container">
            <header className="section-header">
              <h2>News &amp; Einsatzticker</h2>
              <p>Bleib auf dem Laufenden: Öffentliche Highlights und interne Einsatzbesprechungen.</p>
            </header>
            <div className="news-columns">
              <div className="news-column">
                <h3>Öffentliche News</h3>
                <NewsList items={publicNews} emptyLabel="Keine Einträge vorhanden." />
              </div>
              <div className="news-column members-only">
                <div className="members-only-label">Nur für Mitglieder</div>
                <h3>Mitglieder-News</h3>
                {isAuthenticated ? (
                  <NewsList items={memberNews} emptyLabel="Noch keine Einträge." />
                ) : (
                  <p className="empty">Melde dich mit Discord an, um Mitglieder-News zu sehen.</p>
                )}
              </div>
            </div>
            {isAdmin && (
              <div className="admin-panel">
                <h3>News veröffentlichen</h3>
                <form className="form-grid" onSubmit={handleNewsSubmit}>
                  <label>
                    Titel
                    <input
                      type="text"
                      value={newsDraft.title}
                      onChange={event => setNewsDraft(prev => ({ ...prev, title: event.target.value }))}
                      required
                      maxLength={160}
                    />
                  </label>
                  <label>
                    Sichtbarkeit
                    <select
                      value={newsDraft.visibility}
                      onChange={event => setNewsDraft(prev => ({ ...prev, visibility: event.target.value }))}
                    >
                      <option value="PUBLIC">Öffentlich</option>
                      <option value="MEMBERS">Nur Mitglieder</option>
                    </select>
                  </label>
                  <label className="full-width">
                    Inhalt (Markdown)
                    <textarea
                      rows={6}
                      value={newsDraft.content}
                      onChange={event => setNewsDraft(prev => ({ ...prev, content: event.target.value }))}
                      required
                    />
                  </label>
                  <button type="submit" className="btn" disabled={isPublishingNews}>
                    {isPublishingNews ? 'Speichern…' : 'News speichern'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </section>

        <section className="fleet-section" id="fleet">
          <div className="container">
            <header className="section-header">
              <h2>Flotte der Organisation</h2>
              <p>Gemeldete Schiffe unserer Mitglieder – einsatzbereit für gemeinsame Operationen.</p>
              <div className="fleet-badges">
                <span className="badge">{fleetBadges.totalShips} Schiffe gemeldet</span>
                <span className="badge">{fleetBadges.missionReady} einsatzbereit</span>
              </div>
            </header>
            <div className="fleet-grid">
              {fleet.length === 0 ? (
                <p className="empty">Noch keine Schiffe gemeldet.</p>
              ) : (
                fleet.map(entry => (
                  <article key={entry.id} className="fleet-card">
                    <h4>{entry.name}</h4>
                    <div className="meta">von {entry.contributor.ingameHandle}</div>
                    <div className="tag-list">
                      {entry.focus && <span className="tag">{entry.focus}</span>}
                      {entry.roleTag && <span className="tag">{entry.roleTag}</span>}
                      {entry.availability && <span className="tag">{entry.availability}</span>}
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="events-section" id="events">
          <div className="container">
            <header className="section-header">
              <h2>Missionen &amp; Events</h2>
              <p>Planung gemeinsamer Einsätze, Trainings und Community-Events.</p>
            </header>
            <div className="events-grid">
              {events.length === 0 ? (
                <p className="empty">Aktuell keine Events geplant.</p>
              ) : (
                events.map(item => (
                  <article key={item.id} className="event-card">
                    <h4>{item.title}</h4>
                    <div className="event-meta">
                      <span>{formatDateTime(item.startsAt)}</span>
                      {item.location && <span>{item.location}</span>}
                    </div>
                    {item.description && <p>{item.description}</p>}
                    <div className="event-footer">
                      <span>Leitung: {item.createdByName ?? 'HSTC Command'}</span>
                      <span className="tag">{item.visibility === 'PUBLIC' ? 'Öffentlich' : 'Mitglieder'}</span>
                    </div>
                  </article>
                ))
              )}
            </div>
            {isAdmin && (
              <div className="admin-panel">
                <h3>Event planen</h3>
                <form className="form-grid" onSubmit={handleEventSubmit}>
                  <label>
                    Titel
                    <input
                      type="text"
                      value={eventDraft.title}
                      onChange={event => setEventDraft(prev => ({ ...prev, title: event.target.value }))}
                      required
                      maxLength={160}
                    />
                  </label>
                  <label>
                    Startzeit
                    <input
                      type="datetime-local"
                      value={eventDraft.startsAt}
                      onChange={event => setEventDraft(prev => ({ ...prev, startsAt: event.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Ort / Treffpunkt
                    <input
                      type="text"
                      value={eventDraft.location}
                      onChange={event => setEventDraft(prev => ({ ...prev, location: event.target.value }))}
                      required
                      maxLength={120}
                    />
                  </label>
                  <label>
                    Sichtbarkeit
                    <select
                      value={eventDraft.visibility}
                      onChange={event => setEventDraft(prev => ({ ...prev, visibility: event.target.value }))}
                    >
                      <option value="PUBLIC">Öffentlich</option>
                      <option value="MEMBERS">Nur Mitglieder</option>
                    </select>
                  </label>
                  <label className="full-width">
                    Beschreibung
                    <textarea
                      rows={4}
                      value={eventDraft.description}
                      onChange={event => setEventDraft(prev => ({ ...prev, description: event.target.value }))}
                    />
                  </label>
                  <button type="submit" className="btn" disabled={isPublishingEvent}>
                    {isPublishingEvent ? 'Speichern…' : 'Event speichern'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </section>

        <section className="community-section" id="community">
          <div className="container">
            <header className="section-header">
              <h2>Community &amp; Memberbereich</h2>
              <p>Verwalte dein Profil, teile deine Flotte und finde Gleichgesinnte für gemeinsame Einsätze.</p>
            </header>
            <div className="community-grid">
              <div className="profile-card">
                <h3>Dein Profil</h3>
                {!isAuthenticated && <p className="login-hint">Melde dich mit Discord an, um deinen Ingame Handle und deine Einsatzpräferenzen zu hinterlegen.</p>}
                {isAuthenticated && memberRecord && (
                  <form className="profile-form" onSubmit={handleProfileSubmit}>
                    <div className="form-group">
                      <label htmlFor="profile-handle">Ingame Handle *</label>
                      <input
                        id="profile-handle"
                        type="text"
                        value={profileForm.ingameHandle}
                        onChange={event => updateProfileField('ingameHandle', event.target.value)}
                        maxLength={60}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="profile-motto">Motto / Callout</label>
                      <input
                        id="profile-motto"
                        type="text"
                        value={profileForm.motto}
                        onChange={event => updateProfileField('motto', event.target.value)}
                        maxLength={160}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="profile-bio">Kurzbiografie</label>
                      <textarea
                        id="profile-bio"
                        rows={4}
                        maxLength={1000}
                        value={profileForm.biography}
                        onChange={event => updateProfileField('biography', event.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Einsatzbereiche</label>
                      <div className="checkbox-grid">
                        {ACTIVITY_OPTIONS.map(option => (
                          <label key={option}>
                            <input
                              type="checkbox"
                              checked={profileForm.activities[option] ?? false}
                              onChange={() => toggleActivity(option)}
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Schiffe, die du für die Orga zur Verfügung stellst</label>
                      <div className="ships-container">
                        {profileShips.map(ship => (
                          <div key={ship.localId} className="ship-row">
                            <input
                              type="text"
                              placeholder="Schiffsname"
                              value={ship.name}
                              onChange={event => updateShip(ship.localId, { name: event.target.value })}
                              maxLength={80}
                            />
                            <input
                              type="text"
                              placeholder="Fokus (z. B. Kampf, Support)"
                              value={ship.focus}
                              onChange={event => updateShip(ship.localId, { focus: event.target.value })}
                              maxLength={60}
                            />
                            <input
                              type="text"
                              placeholder="Rolle / Tag"
                              value={ship.roleTag}
                              onChange={event => updateShip(ship.localId, { roleTag: event.target.value })}
                              maxLength={60}
                            />
                            <select
                              value={ship.availability}
                              onChange={event =>
                                updateShip(ship.localId, {
                                  availability: event.target.value as ProfileShipDraft['availability']
                                })
                              }
                            >
                              {Object.entries(SHIP_AVAILABILITY_OPTIONS).map(([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </select>
                            <button type="button" className="btn btn-ghost" onClick={() => removeShipRow(ship.localId)}>
                              Entfernen
                            </button>
                          </div>
                        ))}
                      </div>
                      <button type="button" className="btn btn-outline small" onClick={addShipRow}>
                        Schiff hinzufügen
                      </button>
                    </div>
                    <button type="submit" className="btn" disabled={isSavingProfile}>
                      {isSavingProfile ? 'Speichert…' : 'Profil speichern'}
                    </button>
                    {profileFeedback && <p className="form-feedback">{profileFeedback}</p>}
                  </form>
                )}
              </div>
              <div className="member-directory">
                <h3>Mitgliederübersicht</h3>
                <div className="member-list">
                  {members.length === 0 ? (
                    <p className="empty">Noch keine Profile.</p>
                  ) : (
                    members.map(entry => (
                      <article key={entry.id} className="member-card">
                        {entry.avatarUrl && (
                          <img src={entry.avatarUrl} alt={entry.ingameHandle} className="member-avatar" />
                        )}
                        <div>
                          <h4>{entry.ingameHandle}</h4>
                          {entry.motto && <p className="member-motto">{entry.motto}</p>}
                          {entry.activities.length > 0 && (
                            <div className="tag-list">
                              {entry.activities.map(activity => (
                                <span key={activity} className="tag">{activity}</span>
                              ))}
                            </div>
                          )}
                          {entry.biography && <p className="member-bio">{entry.biography}</p>}
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="join-section" id="join">
          <div className="container">
            <div className="join-content">
              <h2 className="join-title">Dein Platz im Universum</h2>
              <p className="join-text">
                Alleine im Verse ist gefährlich. Gemeinsam in der HSTC warten Schutz, Erfolge und gute Gesellschaft. Schließe dich unserem Discord an und starte heute.
              </p>
              <div className="join-actions">
                <a href="https://discord.gg/jV8rByuJ4G" target="_blank" rel="noreferrer" className="btn">
                  Discord beitreten
                </a>
                <a href="#community" className="btn btn-outline">
                  Mitgliedsprofil anlegen
                </a>
              </div>
              <div className="join-extra">
                <div className="discord-widget">
                  {discordWidget ? (
                    <>
                      <h4>{discordWidget.name}</h4>
                      <p>Mitglieder online: {discordWidget.presenceCount}</p>
                      <p>Channels: {discordWidget.channelCount}</p>
                      {discordWidget.instantInvite && (
                        <a
                          className="btn btn-outline small"
                          href={discordWidget.instantInvite}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Direkt beitreten
                        </a>
                      )}
                    </>
                  ) : (
                    <p className="empty">Discord Widget aktuell nicht verfügbar.</p>
                  )}
                </div>
                <div className="discord-qr">
                  <img src="https://hstc.space/wp-content/uploads/2025/04/hstc_discord_qr.webp" alt="Discord QR Code" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-logo">HSTC</div>
          <p className="footer-text">
            © 2947 – {gameYear()} Helvetic Security &amp; Transport Corporation – Die Elite im Verse
          </p>
        </div>
      </footer>
    </div>
  );
}

type NewsListProps = {
  items: AmplifyNews[];
  emptyLabel: string;
};

function NewsList({ items, emptyLabel }: NewsListProps) {
  if (!items.length) {
    return <p className="empty">{emptyLabel}</p>;
  }

  return (
    <div className="news-list">
      {items.map(item => (
        <article key={item.id} className="news-card">
          <h4>{item.title}</h4>
          <div className="meta">{formatDateTime(item.publishedAt)} – {item.authorName ?? 'HSTC Command'}</div>
          <div className="content" dangerouslySetInnerHTML={{ __html: sanitizeMarkdown(item.content) }} />
        </article>
      ))}
    </div>
  );
}

export default App;


