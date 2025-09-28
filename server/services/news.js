import slugify from '../utils/slugify.js';
import { getDb } from '../lib/database.js';

export function listNews({ visibility, includeMembers = false }) {
  const db = getDb();
  if (visibility === 'public') {
    return db
      .prepare(
        `SELECT n.*, u.username
         FROM news n
         LEFT JOIN users u ON u.id = n.author_id
         WHERE visibility = 'public'
         ORDER BY datetime(n.created_at) DESC`
      )
      .all();
  }

  if (includeMembers) {
    return db
      .prepare(
        `SELECT n.*, u.username
         FROM news n
         LEFT JOIN users u ON u.id = n.author_id
         ORDER BY datetime(n.created_at) DESC`
      )
      .all();
  }

  return db
    .prepare(
      `SELECT n.*, u.username
       FROM news n
       LEFT JOIN users u ON u.id = n.author_id
       WHERE visibility = 'members'
       ORDER BY datetime(n.created_at) DESC`
    )
    .all();
}

export function getNewsBySlug(slug) {
  const db = getDb();
  return db
    .prepare(
      `SELECT n.*, u.username
       FROM news n
       LEFT JOIN users u ON u.id = n.author_id
       WHERE n.slug = ?`
    )
    .get(slug);
}

export function createNews({ title, contentMarkdown, visibility, authorId }) {
  const db = getDb();
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 1;
  while (
    db.prepare('SELECT 1 FROM news WHERE slug = ?').get(slug)
  ) {
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }

  const stmt = db.prepare(
    `INSERT INTO news (title, slug, content_markdown, visibility, author_id)
     VALUES (@title, @slug, @content, @visibility, @authorId)`
  );

  const info = stmt.run({
    title: title.trim(),
    slug,
    content: contentMarkdown.trim(),
    visibility,
    authorId: authorId || null,
  });

  return getNewsBySlug(slug) ?? db.prepare('SELECT * FROM news WHERE id = ?').get(info.lastInsertRowid);
}
