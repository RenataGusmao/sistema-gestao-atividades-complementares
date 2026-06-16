const express = require('express');
const router = express.Router();
const controller = require('../controllers/atividade.controller');
const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.get('/', protect, authorize('administrador', 'coordenador'), controller.listar);
router.get('/:id', protect, authorize('administrador', 'coordenador'), controller.buscarPorId);
router.get('/:id/anexos/:index/download', protect, authorize('administrador', 'coordenador'), controller.baixarAnexo);
router.post('/', protect, authorize('administrador', 'coordenador'),upload.array('anexos', 5),controller.criar);
router.put('/:id', protect, authorize('administrador', 'coordenador'),upload.array('anexos', 5),controller.atualizar);
router.delete('/:id', protect, authorize('administrador', 'coordenador'), controller.remover);
router.patch('/:id/status', protect, authorize('administrador', 'coordenador'), controller.atualizarStatus);


module.exports = router;
