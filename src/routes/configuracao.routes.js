const express = require('express');
const controller = require('../controllers/configuracao.controller');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.get('/', protect, authorize('administrador'), controller.listar);
router.post('/', protect, authorize('administrador'), controller.salvar);

module.exports = router;
