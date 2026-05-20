const express = require('express');
const router = express.Router();
const alunoAuthController = require('../controllers/alunoAuth.controller');

router.post('/login', alunoAuthController.login);
router.post('/primeiro-acesso', alunoAuthController.primeiroAcesso);

module.exports = router;