const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const cursoRoutes = require('./routes/curso.routes');
const alunoRoutes = require('./routes/aluno.routes');
const atividadeRoutes = require('./routes/atividade.routes');
const configuracaoRoutes = require('./routes/configuracao.routes');
const categoriaRoutes = require('./routes/categoria.routes');
const regraCargaHorariaRoutes = require('./routes/regraCargaHoraria.routes');
const statusAtividadeRoutes = require('./routes/statusAtividade.routes');

const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Muitas requisições. Tente novamente mais tarde.' }
});
app.use('/api', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Muitas tentativas de autenticação. Aguarde alguns minutos.' }
});
app.use('/api/auth', authLimiter);

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'kore-mongo-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/cursos', cursoRoutes);
app.use('/api/alunos', alunoRoutes);
app.use('/api/atividades', atividadeRoutes);
app.use('/api/configuracoes', configuracaoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/regras-carga-horaria', regraCargaHorariaRoutes);
app.use('/api/status-atividade', statusAtividadeRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada.' });
});

app.use(errorHandler);

module.exports = app;