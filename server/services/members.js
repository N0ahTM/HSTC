import { getDb, serializeUser } from '../lib/database.js';

export function getMemberByDiscordId(discordId) {
  const db = getDb();
  const record = db.prepare('SELECT * FROM users WHERE discord_id = ?').get(discordId);
  return serializeUser(record);
}

export function getMemberById(id) {
  const db = getDb();
  const record = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!record) return null;
  const ships = db
    .prepare('SELECT id, name, focus, role_tag, availability FROM ships WHERE user_id = ? ORDER BY name COLLATE NOCASE')
    .all(id)
    .map(ship => ({
      id: ship.id,
      name: ship.name,
      focus: ship.focus,
      roleTag: ship.role_tag,
      availability: ship.availability,
    }));
  return {
    ...serializeUser(record),
    ships,
  };
}

export function listMembers() {
  const db = getDb();
  const records = db
    .prepare(
      `SELECT u.*, COUNT(s.id) AS ship_count
       FROM users u
       LEFT JOIN ships s ON s.user_id = u.id
       GROUP BY u.id
       ORDER BY u.username COLLATE NOCASE`
    )
    .all();
  return records.map(record => ({
    ...serializeUser(record),
    shipCount: record.ship_count,
  }));
}

export function updateMemberProfile(userId, { ingameHandle, motto, activities, biography, ships }) {
  const db = getDb();
  const activitiesJson = JSON.stringify(activities ?? []);
  const now = new Date().toISOString();

  const update = db.prepare(
    `UPDATE users
     SET ingame_handle = @ingameHandle,
         motto = @motto,
         activities = @activities,
         biography = @biography,
         updated_at = @now
     WHERE id = @userId`
  );

  const insertShip = db.prepare(
    `INSERT INTO ships (user_id, name, focus, role_tag, availability)
     VALUES (@userId, @name, @focus, @roleTag, @availability)`
  );
  const deleteShips = db.prepare('DELETE FROM ships WHERE user_id = ?');

  const transaction = db.transaction(() => {
    update.run({
      ingameHandle: ingameHandle?.trim() || null,
      motto: motto?.trim() || null,
      activities: activitiesJson,
      biography: biography?.trim() || null,
      now,
      userId,
    });

    deleteShips.run(userId);
    (ships || []).forEach(ship => {
      if (!ship?.name) return;
      insertShip.run({
        userId,
        name: ship.name.trim(),
        focus: ship.focus?.trim() || null,
        roleTag: ship.roleTag?.trim() || null,
        availability: ship.availability?.trim() || 'mission',
      });
    });
  });

  transaction();

  return getMemberById(userId);
}

export function getFleetOverview() {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT s.id, s.name, s.focus, s.role_tag, s.availability,
              u.username, u.discord_id, u.ingame_handle
       FROM ships s
       JOIN users u ON s.user_id = u.id
       ORDER BY s.name COLLATE NOCASE`
    )
    .all();

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    focus: row.focus,
    roleTag: row.role_tag,
    availability: row.availability,
    contributor: {
      username: row.username,
      discordId: row.discord_id,
      ingameHandle: row.ingame_handle,
    },
  }));
}
