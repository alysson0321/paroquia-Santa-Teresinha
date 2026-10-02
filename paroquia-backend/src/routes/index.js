const express = require('express');
const rateLimit = require('express-rate-limit');
const upload = require('../middleware/uploads');
const { authenticate, requireAdmin } = require('../middleware/auth');
const auth = require('../controllers/auth');
const content = require('../controllers/content');

const router = express.Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });

router.get('/health', (req, res) => res.json({ ok: true, service: 'paroquia-api' }));
router.post('/usuarios', authLimiter, auth.register);
router.post('/login', authLimiter, auth.login);
router.get('/eventos', content.listEvents);
router.get('/midias', content.listMedia);

router.use(authenticate);
router.get('/me', (req, res) => res.json({ usuario: req.user }));
router.post('/intencoes', content.createIntention);
router.get('/intencoes', content.listIntentions);
router.put('/intencoes/:id', content.updateIntention);
router.delete('/intencoes/:id', content.deleteIntention);
router.post('/pagamentos-dizimo', upload.single('comprovante'), content.createDonation);
router.get('/pagamentos_dizimo', content.listDonations);

router.use('/admin', requireAdmin);
router.post('/admin/eventos', upload.single('banner'), content.createEvent);
router.put('/admin/eventos/:id', upload.single('banner'), content.updateEvent);
router.delete('/admin/eventos/:id', content.deleteEvent);
router.post('/admin/midias', upload.single('banner'), content.createMedia);
router.put('/admin/midias/:id', upload.single('banner'), content.updateMedia);
router.delete('/admin/midias/:id', content.deleteMedia);
router.get('/admin/dizimos', content.adminDonations);
router.put('/admin/dizimos/:id', content.updateDonation);
router.get('/admin/intencoes', content.adminIntentions);

module.exports = router;
