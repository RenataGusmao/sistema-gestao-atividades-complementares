const express = require('express');
const controller = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/me', protect, controller.me);

module.exports = router;
