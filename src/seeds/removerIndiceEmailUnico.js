require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');

async function removerIndiceEmailUnico(collectionName) {
  const collection = mongoose.connection.collection(collectionName);
  const indexes = await collection.indexes();

  const indiceEmailUnico = indexes.find((index) => (
    index.unique === true &&
    index.key &&
    Object.keys(index.key).length === 1 &&
    index.key.email === 1
  ));

  if (!indiceEmailUnico) {
    console.log(`${collectionName}: nenhum índice único de email encontrado.`);
    return;
  }

  await collection.dropIndex(indiceEmailUnico.name);
  console.log(`${collectionName}: índice único de email removido (${indiceEmailUnico.name}).`);
}

async function executar() {
  try {
    await connectDB();

    await removerIndiceEmailUnico('usuarios');
    await removerIndiceEmailUnico('alunos');

    console.log('Verificação de índices únicos de email concluída.');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Erro ao remover índice único de email:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

executar();
