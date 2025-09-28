import { Router } from 'express';
import passport from '../passport.js';

const router = Router();

router.get('/discord', passport.authenticate('discord'));

router.get(
  '/discord/callback',
  passport.authenticate('discord', {
    failureRedirect: '/?login=failed',
  }),
  (req, res) => {
    res.redirect('/members');
  }
);

router.post('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.status(200).json({ success: true });
    });
  });
});

export default router;
