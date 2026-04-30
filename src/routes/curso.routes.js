const express = require('express');
const controller = require('../controllers/curso.controller');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.get('/', protect, controller.listar);
router.post('/', protect, authorize('administrador'), controller.criar);
router.patch('/:id', protect, authorize('administrador'), controller.atualizar);
router.delete('/:id', protect, authorize('administrador'), controller.remover);

module.exports = router;
