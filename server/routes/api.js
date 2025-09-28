import { Router } from 'express';
import { marked } from 'marked';
import { ensureAuthenticated, requireAdmin } from '../middleware/auth.js';
import { listMembers, updateMemberProfile, getFleetOverview, getMemberById } from '../services/members.js';
import { listNews, createNews } from '../services/news.js';
import { listEvents, createEvent } from '../services/events.js';

const router = Router();

router.get('/session', (req, res) => {
  res.json({ user: req.user ?? null });
});

router.get('/members', (_req, res) => {
  const members = listMembers().map(member => ({
    discordId: member.discordId,
    username: member.username,
    ingameHandle: member.ingameHandle,
    motto: member.motto,
    activities: member.activities,
    biography: member.biography,
    shipCount: member.shipCount,
  }));
  res.json(members);
});

router.get('/fleet', (_req, res) => {
  res.json(getFleetOverview());
});

router.get('/news/public', (_req, res) => {
  const items = listNews({ visibility: 'public' }).map(news => ({
    id: news.id,
    slug: news.slug,
    title: news.title,
    visibility: news.visibility,
    contentMarkdown: news.content_markdown,
    contentHtml: marked.parse(news.content_markdown),
    author: news.username,
    createdAt: news.created_at,
  }));
  res.json(items);
});

router.get('/news/members', ensureAuthenticated, (_req, res) => {
  const items = listNews({ includeMembers: true }).map(news => ({
    id: news.id,
    slug: news.slug,
    title: news.title,
    visibility: news.visibility,
    contentMarkdown: news.content_markdown,
    contentHtml: marked.parse(news.content_markdown),
    author: news.username,
    createdAt: news.created_at,
  }));
  res.json(items);
});

router.post('/news', requireAdmin, (req, res) => {
  const { title, contentMarkdown, visibility } = req.body;
  if (!title || !contentMarkdown || !visibility) {
    return res.status(400).json({ error: 'Titel, Inhalt und Sichtbarkeit sind erforderlich' });
  }
  const entry = createNews({
    title,
    contentMarkdown,
    visibility,
    authorId: req.user?.id,
  });
  res.status(201).json({
    id: entry.id,
    slug: entry.slug,
    title: entry.title,
    visibility: entry.visibility,
    contentMarkdown: entry.content_markdown,
    contentHtml: marked.parse(entry.content_markdown),
    author: req.user?.username ?? entry.username,
    createdAt: entry.created_at,
  });
});

router.get('/events', (_req, res) => {
  res.json(listEvents());
});

router.post('/events', requireAdmin, (req, res) => {
  const { title, description, eventDate, location } = req.body;
  if (!title || !description || !eventDate || !location) {
    return res.status(400).json({ error: 'Alle Felder sind erforderlich' });
  }
  const event = createEvent({ title, description, eventDate, location });
  res.status(201).json(event);
});

router.get('/profile', ensureAuthenticated, (req, res) => {
  const member = getMemberById(req.user.id);
  res.json(member);
});

router.post('/profile', ensureAuthenticated, (req, res) => {
  const { ingameHandle, motto, activities, biography, ships } = req.body;
  if (!ingameHandle || !String(ingameHandle).trim()) {
    return res.status(400).json({ error: 'Ingame Handle ist erforderlich.' });
  }
  const normalizedShips = Array.isArray(ships)
    ? ships
        .filter(ship => ship && ship.name)
        .map(ship => ({
          name: String(ship.name).slice(0, 80),
          focus: ship.focus ? String(ship.focus).slice(0, 60) : null,
          roleTag: ship.roleTag ? String(ship.roleTag).slice(0, 60) : null,
          availability: ship.availability ? String(ship.availability).slice(0, 30) : 'mission',
        }))
    : [];

  const updated = updateMemberProfile(req.user.id, {
    ingameHandle: ingameHandle ? String(ingameHandle).slice(0, 60) : null,
    motto: motto ? String(motto).slice(0, 160) : null,
    activities: Array.isArray(activities)
      ? activities.map(activity => String(activity).slice(0, 40))
      : [],
    biography: biography ? String(biography).slice(0, 1000) : null,
    ships: normalizedShips,
  });

  res.json(updated);
});

router.get('/discord/widget', async (_req, res) => {
  try {
    const guildId = process.env.DISCORD_WIDGET_GUILD || '628996745837150211';
    const response = await fetch(`https://discord.com/api/guilds/${guildId}/widget.json`);
    if (!response.ok) {
      throw new Error('Discord API Fehler');
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(503).json({ error: 'Discord Widget nicht erreichbar', details: error.message });
  }
});

export default router;
