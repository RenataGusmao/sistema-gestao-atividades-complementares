const express = require('express');
const controller = require('../controllers/aluno.controller');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.get('/', protect, authorize('administrador', 'coordenador'), controller.listar);
router.post('/', protect, authorize('administrador', 'coordenador'), controller.criar);
router.get('/:id', protect, authorize('administrador', 'coordenador'), controller.buscarPorId);
router.patch('/:id', protect, authorize('administrador', 'coordenador'), controller.atualizar);
router.delete('/:id', protect, authorize('administrador', 'coordenador'), controller.remover);

module.exports = router;

module.exports = router;
