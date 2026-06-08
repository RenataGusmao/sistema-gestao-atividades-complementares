const express = require('express');
const controller = require('../controllers/auditoria.controller');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect, authorize('administrador'));

router.get('/', controller.listar);

module.exports = router;
