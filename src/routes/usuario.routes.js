const express = require('express');
const controller = require('../controllers/usuario.controller');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect, authorize('administrador'));
router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.patch('/:id', controller.atualizar);

module.exports = router;
