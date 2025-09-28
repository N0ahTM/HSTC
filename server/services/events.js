import { getDb } from '../lib/database.js';

export function listEvents() {
  return getDb()
    .prepare(
      `SELECT * FROM community_events
       ORDER BY datetime(event_date) ASC`
    )
    .all();
}

export function createEvent({ title, description, eventDate, location }) {
  const stmt = getDb().prepare(
    `INSERT INTO community_events (title, description, event_date, location)
     VALUES (@title, @description, @eventDate, @location)`
  );
  const info = stmt.run({ title, description, eventDate, location });
  return getDb()
    .prepare('SELECT * FROM community_events WHERE id = ?')
    .get(info.lastInsertRowid);
}
