import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', '..', 'db', 'hstc.sqlite');

let db;

export function getDb() {
  if (!db) {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new Database(dbPath);
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function ensureDatabase() {
  const database = getDb();

  database
    .prepare(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        discord_id TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL,
        discriminator TEXT,
        avatar TEXT,
        ingame_handle TEXT,
        motto TEXT,
        activities TEXT DEFAULT '[]',
        biography TEXT,
        is_admin INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        last_login TEXT
      )`
    )
    .run();

  database
    .prepare(
      `CREATE TABLE IF NOT EXISTS ships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        focus TEXT,
        role_tag TEXT,
        availability TEXT DEFAULT 'mission',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    )
    .run();

  database
    .prepare(
      `CREATE TABLE IF NOT EXISTS news (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE,
        content_markdown TEXT NOT NULL,
        visibility TEXT NOT NULL CHECK (visibility IN ('public','members')),
        author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    )
    .run();

  database
    .prepare(
      `CREATE TABLE IF NOT EXISTS community_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        event_date TEXT NOT NULL,
        location TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    )
    .run();
}

export function serializeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    discordId: user.discord_id,
    username: user.username,
    discriminator: user.discriminator,
    avatar: user.avatar,
    ingameHandle: user.ingame_handle,
    motto: user.motto,
    activities: JSON.parse(user.activities || '[]'),
    biography: user.biography,
    isAdmin: Boolean(user.is_admin),
    lastLogin: user.last_login,
    createdAt: user.created_at,
  };
}
