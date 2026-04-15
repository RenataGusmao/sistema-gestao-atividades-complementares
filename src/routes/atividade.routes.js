const express = require('express');
const controller = require('../controllers/atividade.controller');
const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = express.Router();

router.get('/', protect, authorize('administrador', 'coordenador', 'aluno'), controller.listar);
router.post('/', protect, authorize('administrador', 'coordenador', 'aluno'), upload.array('anexos', 5), controller.criar);
router.patch('/:id/status', protect, authorize('administrador', 'coordenador'), controller.atualizarStatus);

module.exports = router;
