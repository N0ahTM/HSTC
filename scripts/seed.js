import 'dotenv/config';
import { ensureDatabase, getDb } from '../server/lib/database.js';
import slugify from '../server/utils/slugify.js';

ensureDatabase();
const db = getDb();

const sampleUsers = [
  {
    discord_id: '111111111111111111',
    username: 'Astra',
    discriminator: '0001',
    avatar: null,
    ingame_handle: 'HSTC-Astra',
    motto: 'Sicherheit durch Präzision.',
    activities: JSON.stringify(['Pilot', 'Logistik', 'PVE']),
    biography: 'Veteranin aus der Sol-Blockade, verantwortlich für taktische Planung und Einsatzkoordination.',
    is_admin: 1,
  },
  {
    discord_id: '222222222222222222',
    username: 'Nordlicht',
    discriminator: '0410',
    avatar: null,
    ingame_handle: 'HSTC-Nord',
    motto: 'Wo andere aufgeben, beginnen wir.',
    activities: JSON.stringify(['PVP', 'FPS', 'Pilot']),
    biography: 'Leitet die Speerspitze unserer WarBand, spezialisiert auf Boarding und Extraction.',
    is_admin: 0,
  },
  {
    discord_id: '333333333333333333',
    username: 'Aurora',
    discriminator: '1212',
    avatar: null,
    ingame_handle: 'HSTC-Aurora',
    motto: 'Handel schafft Frieden.',
    activities: JSON.stringify(['Handel', 'Mining', 'Support']),
    biography: 'Diplomatin mit Fokus auf Ressourcenbeschaffung und wirtschaftliche Stabilität.',
    is_admin: 0,
  },
];

const insertUser = db.prepare(
  `INSERT OR IGNORE INTO users (discord_id, username, discriminator, avatar, ingame_handle, motto, activities, biography, is_admin)
   VALUES (@discord_id, @username, @discriminator, @avatar, @ingame_handle, @motto, @activities, @biography, @is_admin)`
);

for (const user of sampleUsers) {
  insertUser.run(user);
}

const sampleShips = [
  {
    ownerId: '111111111111111111',
    name: 'Aegis Hammerhead',
    focus: 'Flottenverteidigung',
    role_tag: 'Escort',
    availability: 'Einsatzbereit',
  },
  {
    ownerId: '222222222222222222',
    name: 'Anvil F7C Hornet',
    focus: 'Dogfighting',
    role_tag: 'PVP',
    availability: 'Einsatzbereit',
  },
  {
    ownerId: '333333333333333333',
    name: 'MISC Hull B',
    focus: 'Logistik',
    role_tag: 'Transport',
    availability: 'Planbar',
  },
];

const getUserIdStmt = db.prepare('SELECT id FROM users WHERE discord_id = ?');
const insertShip = db.prepare(
  `INSERT OR IGNORE INTO ships (user_id, name, focus, role_tag, availability)
   VALUES (@user_id, @name, @focus, @role_tag, @availability)`
);

for (const ship of sampleShips) {
  const owner = getUserIdStmt.get(ship.ownerId);
  if (owner) {
    insertShip.run({
      user_id: owner.id,
      name: ship.name,
      focus: ship.focus,
      role_tag: ship.role_tag,
      availability: ship.availability,
    });
  }
}

const sampleNews = [
  {
    title: 'Operation Helvetia erfolgreich abgeschlossen',
    content_markdown: `Unsere WarBand sicherte die Handelsrouten rund um Crusader. **Keine Verluste**, volle Ausbeute. Danke an alle Piloten und Logistiker!`,
    visibility: 'public',
    authorId: '111111111111111111',
  },
  {
    title: 'Mitglieder-Briefing: Neue Jump-Point Route',
    content_markdown: `Nur für Mitglieder: Neue Route über Pyro entdeckt. Details im internen MobiGlas-Dokument. Melde dich bei Nordlicht für Flight-Assignments.`,
    visibility: 'members',
    authorId: '222222222222222222',
  },
];

const authorIdStmt = db.prepare('SELECT id FROM users WHERE discord_id = ?');
const insertNews = db.prepare(
  `INSERT OR IGNORE INTO news (title, slug, content_markdown, visibility, author_id)
   VALUES (@title, @slug, @content_markdown, @visibility, @author_id)`
);

for (const news of sampleNews) {
  const author = authorIdStmt.get(news.authorId);
  const slug = slugify(news.title);
  insertNews.run({
    title: news.title,
    slug,
    content_markdown: news.content_markdown,
    visibility: news.visibility,
    author_id: author?.id ?? null,
  });
}

const sampleEvents = [
  {
    title: 'Community Flight Night',
    description: 'Entspannter Abendflug durch MicroTech mit Fotos und Formationstraining.',
    event_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    location: 'Everus Harbor Pad B06',
  },
  {
    title: 'Industrial Ops: Mining Rush',
    description: 'Koordinierter Einsatz mit der Orga-Flotte zur Rohstoffbeschaffung.',
    event_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    location: 'Arcorp Area18, Gate 02',
  },
];

const insertEvent = db.prepare(
  `INSERT OR IGNORE INTO community_events (title, description, event_date, location)
   VALUES (@title, @description, @event_date, @location)`
);

for (const event of sampleEvents) {
  insertEvent.run(event);
}

console.log('Seed abgeschlossen: Beispielnutzer, Schiffe, News und Events erstellt.');
