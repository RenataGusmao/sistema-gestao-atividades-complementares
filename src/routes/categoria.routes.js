const express = require('express');
const router = express.Router();
const controller = require('../controllers/categoria.controller');
const { protect, authorize } = require('../middlewares/auth');

router.get('/', protect, authorize('administrador', 'coordenador'), controller.listar);
router.get('/:id', protect, authorize('administrador', 'coordenador'), controller.buscarPorId);
router.post('/', protect, authorize('administrador'), controller.criar);
router.put('/:id', protect, authorize('administrador'), controller.atualizar);
router.delete('/:id', protect, authorize('administrador'), controller.remover);


module.exports = router;