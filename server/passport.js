import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import { getDb, serializeUser } from './lib/database.js';

const scopes = ['identify'];
const adminIds = (process.env.HSTC_ADMIN_IDS || '')
  .split(',')
  .map(id => id.trim())
  .filter(Boolean);

passport.serializeUser((user, done) => {
  done(null, user.discordId);
});

passport.deserializeUser((discordId, done) => {
  try {
    const user = getDb()
      .prepare('SELECT * FROM users WHERE discord_id = ?')
      .get(discordId);
    done(null, serializeUser(user));
  } catch (error) {
    done(error);
  }
});

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DISCORD_CALLBACK_URL || 'http://localhost:3000/auth/discord/callback',
      scope: scopes,
    },
    (accessToken, refreshToken, profile, done) => {
      try {
        const db = getDb();
        const existing = db
          .prepare('SELECT * FROM users WHERE discord_id = ?')
          .get(profile.id);

        const now = new Date().toISOString();
        const isAdmin = adminIds.includes(profile.id);

        if (existing) {
          db.prepare(
            `UPDATE users
             SET username = @username,
                 discriminator = @discriminator,
                 avatar = @avatar,
                 is_admin = @isAdmin,
                 updated_at = @now,
                 last_login = @now
             WHERE discord_id = @discordId`
          ).run({
            username: profile.username,
            discriminator: profile.discriminator,
            avatar: profile.avatar,
            isAdmin: isAdmin ? 1 : 0,
            now,
            discordId: profile.id,
          });

          const updated = db
            .prepare('SELECT * FROM users WHERE discord_id = ?')
            .get(profile.id);
          return done(null, serializeUser(updated));
        }

        const insert = db.prepare(
          `INSERT INTO users (discord_id, username, discriminator, avatar, last_login, is_admin)
           VALUES (@discordId, @username, @discriminator, @avatar, @now, @isAdmin)`
        );
        const info = insert.run({
          discordId: profile.id,
          username: profile.username,
          discriminator: profile.discriminator,
          avatar: profile.avatar,
          isAdmin: isAdmin ? 1 : 0,
          now,
        });

        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
        return done(null, serializeUser(user));
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default passport;
