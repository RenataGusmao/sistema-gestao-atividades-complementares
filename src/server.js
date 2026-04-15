require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Servidor KORE rodando na porta ${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error('Falha ao iniciar a aplicação:', error);
  process.exit(1);
});
