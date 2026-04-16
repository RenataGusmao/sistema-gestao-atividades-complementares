const express = require('express');
const router = express.Router();
const controller = require('../controllers/configuracao.controller');
const { protect, authorize } = require('../middlewares/auth');

router.get('/', protect, authorize('administrador', 'coordenador'), controller.listar);
router.get('/:chave', protect, authorize('administrador', 'coordenador'), controller.buscarPorChave);
router.post('/', protect, authorize('administrador'), controller.criarOuAtualizar);

module.exports = router;
