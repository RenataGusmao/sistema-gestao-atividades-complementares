const express = require('express');
const controller = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);

module.exports = router;

// lOGIN

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login do usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@kore.com
 *               senha:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 */

//Auth

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticação
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login do usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@kore.com
 *               senha:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */


//Cursos

/**
 * @swagger
 * tags:
 *   name: Cursos
 *   description: Gerenciamento de cursos
 */

/**
 * @swagger
 * /api/cursos:
 *   get:
 *     summary: Lista todos os cursos
 *     tags: [Cursos]
 *     responses:
 *       200:
 *         description: Lista de cursos
 */

/**
 * @swagger
 * /api/cursos:
 *   post:
 *     summary: Cria um curso
 *     tags: [Cursos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               codigo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Curso criado
 */

//Alunos

/**
 * @swagger
 * tags:
 *   name: Alunos
 *   description: Gerenciamento de alunos
 */

/**
 * @swagger
 * /api/alunos:
 *   get:
 *     summary: Lista alunos
 *     tags: [Alunos]
 *     responses:
 *       200:
 *         description: Lista de alunos
 */

/**
 * @swagger
 * /api/alunos:
 *   post:
 *     summary: Cria aluno
 *     tags: [Alunos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Aluno criado
 */

//Categorias

/**
 * @swagger
 * tags:
 *   name: Categorias
 *   description: Categorias de atividades
 */

/**
 * @swagger
 * /api/categorias:
 *   get:
 *     summary: Lista categorias
 *     tags: [Categorias]
 *     responses:
 *       200:
 *         description: Lista de categorias
 */

/**
 * @swagger
 * /api/categorias:
 *   post:
 *     summary: Cria categoria
 *     tags: [Categorias]
 */

//Atividades

/**
 * @swagger
 * tags:
 *   name: Atividades
 *   description: Atividades complementares
 */

/**
 * @swagger
 * /api/atividades:
 *   get:
 *     summary: Lista atividades
 *     tags: [Atividades]
 *     responses:
 *       200:
 *         description: Lista de atividades
 */

/**
 * @swagger
 * /api/atividades:
 *   post:
 *     summary: Cria atividade
 *     tags: [Atividades]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               descricao:
 *                 type: string
 *               cargaHoraria:
 *                 type: number
 *               anexo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Atividade criada
 */

/**
 * @swagger
 * /api/atividades/{id}/status:
 *   patch:
 *     summary: Atualiza status da atividade
 *     tags: [Atividades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status atualizado
 */



