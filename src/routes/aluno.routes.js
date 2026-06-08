const express = require('express');
const controller = require('../controllers/aluno.controller');
const { protect, authorize } = require('../middlewares/auth');

const upload = require('../middlewares/upload');

const authAluno = require('../middlewares/authAluno');

const router = express.Router();

router.get('/', protect, authorize('administrador', 'coordenador'), controller.listar);
router.post('/', protect, authorize('administrador', 'coordenador'), controller.criar);
router.get('/dashboard', authAluno, controller.dashboard);
router.get('/atividades', authAluno, controller.listarMinhasAtividades);
router.get('/categorias', authAluno, controller.listarCategoriasDisponiveis);
router.post('/atividades', authAluno, upload.fields([
  { name: 'anexos', maxCount: 5 },
  { name: 'certificado', maxCount: 1 }
]), controller.submeterAtividade);
router.get('/certificados', authAluno, controller.listarCertificados);
router.get('/:id', protect, authorize('administrador', 'coordenador'), controller.buscarPorId);
router.patch('/:id', protect, authorize('administrador', 'coordenador'), controller.atualizar);
router.delete('/:id', protect, authorize('administrador', 'coordenador'), controller.remover);

module.exports = router;

