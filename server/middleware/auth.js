export function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Nicht angemeldet' });
}

export function requireAdmin(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated() && req.user?.isAdmin) {
    return next();
  }
  return res.status(403).json({ error: 'Administratorrechte erforderlich' });
}
