import 'dotenv/config';
import path from 'node:path';
import express from 'express';
import session from 'express-session';
import SQLiteStoreFactory from 'connect-sqlite3';
import helmet from 'helmet';
import passport from './passport.js';
import { fileURLToPath } from 'node:url';
import apiRouter from './routes/api.js';
import authRouter from './routes/auth.js';
import { ensureDatabase } from './lib/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

ensureDatabase();

const app = express();

const SQLiteStore = SQLiteStoreFactory(session);
const sessionStore = new SQLiteStore({
  db: 'sessions.sqlite',
  dir: path.join(__dirname, '..', 'db'),
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", 'https://discord.com'],
        imgSrc: ["'self'", 'data:', 'https://hstc.space', 'https://cdn.discordapp.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
        scriptSrc: ["'self'", 'https://discord.com'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'change-this-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRouter);
app.use('/api', apiRouter);

const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

app.get('*', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`HSTC webplattform läuft auf Port ${port}`);
});
