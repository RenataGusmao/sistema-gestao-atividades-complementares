const express = require('express');
const router = express.Router();

const controller = require('../controllers/certificado.controller');
const upload = require('../middlewares/upload');
const { protect, authorize } = require('../middlewares/auth');


router.post(
  '/:alunoId',
  protect,
  authorize('administrador', 'coordenador'),
  upload.single('arquivo'),
  controller.uploadCertificado
);


router.get(
  '/aluno/:alunoId',
  protect,
  authorize('administrador', 'coordenador'),
  controller.listarPorAluno
);


router.delete(
  '/:id',
  protect,
  authorize('administrador', 'coordenador'),
  controller.deletarCertificado
);

module.exports = router;