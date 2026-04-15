require('dotenv').config();
const connectDB = require('../config/database');
const Usuario = require('../models/Usuario');
const Curso = require('../models/Curso');
const Aluno = require('../models/Aluno');
const CategoriaAtividade = require('../models/CategoriaAtividade');
const RegraCargaHoraria = require('../models/RegraCargaHoraria');
const StatusAtividade = require('../models/StatusAtividade');
const ConfiguracaoSistema = require('../models/ConfiguracaoSistema');

async function seed() {
  await connectDB();

  await Promise.all([
    Usuario.deleteMany({}),
    Curso.deleteMany({}),
    Aluno.deleteMany({}),
    CategoriaAtividade.deleteMany({}),
    RegraCargaHoraria.deleteMany({}),
    StatusAtividade.deleteMany({}),
    ConfiguracaoSistema.deleteMany({})
  ]);

  const [ads, si] = await Curso.create([
    { nomeCurso: 'Análise e Desenvolvimento de Sistemas', codigoCurso: 'ADS', descricao: 'Curso de ADS do KORE' },
    { nomeCurso: 'Sistemas de Informação', codigoCurso: 'SI', descricao: 'Curso de SI do KORE' }
  ]);

  const [extensao, pesquisa] = await CategoriaAtividade.create([
    { nomeCategoria: 'Extensão', descricao: 'Atividades extensionistas' },
    { nomeCategoria: 'Pesquisa', descricao: 'Projetos e iniciação científica' }
  ]);

  const [pendente, aprovada, reprovada] = await StatusAtividade.create([
    { nomeStatus: 'Pendente' },
    { nomeStatus: 'Aprovada' },
    { nomeStatus: 'Reprovada' }
  ]);

  await RegraCargaHoraria.create([
    { cursoId: ads._id, categoriaId: extensao._id, cargaHorariaMaxima: 120, observacao: 'Limite por categoria para ADS' },
    { cursoId: si._id, categoriaId: pesquisa._id, cargaHorariaMaxima: 100, observacao: 'Limite por categoria para SI' }
  ]);

  const admin = await Usuario.create({
    nome: 'Administrador KORE',
    email: 'admin@kore.local',
    senhaHash: 'Admin@123',
    perfis: ['administrador']
  });

  const coordenador = await Usuario.create({
    nome: 'Coordenador ADS',
    email: 'coordenador@kore.local',
    senhaHash: 'Coord@123',
    perfis: ['coordenador'],
    cursosCoordenados: [{ cursoId: ads._id }]
  });

  await Aluno.create({
    nome: 'Aluno Exemplo',
    email: 'aluno@kore.local',
    matricula: '20260001',
    cursos: [{ cursoId: ads._id, matriculaAtiva: true }]
  });

  await ConfiguracaoSistema.create([
    {
      chaveConfiguracao: 'prazo_maximo_submissao_dias',
      valorConfiguracao: '30',
      descricao: 'Prazo máximo de submissão antes da colação de grau.'
    },
    {
      chaveConfiguracao: 'tamanho_maximo_upload_bytes',
      valorConfiguracao: process.env.MAX_FILE_SIZE_BYTES || '5242880',
      descricao: 'Tamanho máximo de upload aceito pela API.'
    }
  ]);

  console.log('Seed executado com sucesso.');
  console.log({
    admin: admin.email,
    coordenador: coordenador.email,
    statusDisponiveis: [pendente.nomeStatus, aprovada.nomeStatus, reprovada.nomeStatus]
  });

  process.exit(0);
}

seed().catch((error) => {
  console.error('Erro ao executar seed:', error);
  process.exit(1);
});
