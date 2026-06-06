require('dotenv').config();

const connectDB = require('../config/database');
const Curso = require('../models/Curso');
const CategoriaAtividade = require('../models/CategoriaAtividade');
const RegraCargaHoraria = require('../models/RegraCargaHoraria');
const Usuario = require('../models/Usuario');
const Aluno = require('../models/Aluno');
const ConfiguracaoSistema = require('../models/ConfiguracaoSistema');
const StatusAtividade = require('../models/StatusAtividade');
const Atividade = require('../models/Atividade');
const Auditoria = require('../models/Auditoria');

async function seed() {
  await connectDB();

  await Promise.all([
    Auditoria.deleteMany({}),
    Atividade.deleteMany({}),
    RegraCargaHoraria.deleteMany({}),
    Aluno.deleteMany({}),
    Usuario.deleteMany({}),
    Curso.deleteMany({}),
    CategoriaAtividade.deleteMany({}),
    ConfiguracaoSistema.deleteMany({}),
    StatusAtividade.deleteMany({})
  ]);

  const cursos = await Curso.insertMany([
    {
      codigo: 'ADS',
      nome: 'Análise e Desenvolvimento de Sistemas',
      descricao: 'Curso superior de tecnologia em ADS',
      cargaHorariaTotalComplementar: 200,
      ativo: true
    },
    {
      codigo: 'GTI',
      nome: 'Gestão da Tecnologia da Informação',
      descricao: 'Curso superior de tecnologia em GTI',
      cargaHorariaTotalComplementar: 180,
      ativo: true
    }
  ]);

  const [cursoADS, cursoGTI] = cursos;

  const categorias = await CategoriaAtividade.insertMany([
    {
      nome: 'Cursos Livres',
      codigo: 'CURSOS_LIVRES',
      descricao: 'Cursos extracurriculares e de formação complementar',
      areaParametro: 'Formação Complementar',
      ativa: true
    },
    {
      nome: 'Eventos Acadêmicos',
      codigo: 'EVENTOS_ACADEMICOS',
      descricao: 'Congressos, seminários, palestras e jornadas',
      areaParametro: 'Eventos',
      ativa: true
    }
  ]);

  const [categoriaCursosLivres, categoriaEventos] = categorias;

  await RegraCargaHoraria.insertMany([
    {
      cursoId: cursoADS._id,
      categoriaId: categoriaCursosLivres._id,
      cargaHorariaMaximaCategoria: 60,
      cargaHorariaMaximaSemestre: 100,
      observacao: 'Limite para cursos livres no curso de ADS',
      ativa: true
    },
    {
      cursoId: cursoADS._id,
      categoriaId: categoriaEventos._id,
      cargaHorariaMaximaCategoria: 40,
      cargaHorariaMaximaSemestre: 80,
      observacao: 'Limite para eventos acadêmicos no curso de ADS',
      ativa: true
    },
    {
      cursoId: cursoGTI._id,
      categoriaId: categoriaCursosLivres._id,
      cargaHorariaMaximaCategoria: 50,
      cargaHorariaMaximaSemestre: 90,
      observacao: 'Limite para cursos livres no curso de GTI',
      ativa: true
    }
  ]);

  const admin = new Usuario({
    codigoUsuario: 'ADM001',
    nome: 'Administrador Kore',
    email: 'admin@kore.com',
    senhaHash: '123456',
    perfis: ['administrador'],
    ativo: true
  });

  const coordenador = new Usuario({
    codigoUsuario: 'COORD001',
    nome: 'Coordenador ADS',
    email: 'coordenador.ads@kore.com',
    senhaHash: '123456',
    perfis: ['coordenador'],
    cursosCoordenados: [{ cursoId: cursoADS._id }],
    ativo: true
  });

  await admin.save();
  await coordenador.save();

  await Aluno.insertMany([
    {
      nome: 'Aluno Teste ADS',
      email: 'aluno.ads@kore.com',
      matricula: '2026ADS001',
      cursos: [{ cursoId: cursoADS._id }],
      matriculaAtiva: true,
      dataPrevistaColacao: new Date('2027-12-10')
    },
    {
      nome: 'Aluno Teste GTI',
      email: 'aluno.gti@kore.com',
      matricula: '2026GTI001',
      cursos: [{ cursoId: cursoGTI._id }],
      matriculaAtiva: true,
      dataPrevistaColacao: new Date('2027-12-10')
    }
  ]);

  await ConfiguracaoSistema.insertMany([
    {
      chave: 'LIMITE_UPLOAD_MB',
      valor: 10,
      descricao: 'Limite máximo de upload por arquivo em megabytes',
      tipo: 'NUMBER',
      categoria: 'UPLOAD',
      editavel: true,
      ativo: true
    },
    {
      chave: 'FORMATOS_PERMITIDOS_UPLOAD',
      valor: ['application/pdf', 'image/jpeg', 'image/png'],
      descricao: 'Formatos permitidos para anexos',
      tipo: 'ARRAY',
      categoria: 'UPLOAD',
      editavel: true,
      ativo: true
    },
    {
      chave: 'PRAZO_SUBMISSAO_MESES_ANTES_COLACAO',
      valor: 1,
      descricao: 'Prazo máximo de submissão antes da colação',
      tipo: 'NUMBER',
      categoria: 'VALIDACAO',
      editavel: true,
      ativo: true
    }
  ]);

  await StatusAtividade.insertMany([
    {
      nome: 'Enviada',
      descricao: 'Atividade enviada pelo usuário e aguardando análise',
      ordem: 1,
      ativo: true
    },
    {
      nome: 'Em análise',
      descricao: 'Atividade em processo de validação',
      ordem: 2,
      ativo: true
    },
    {
      nome: 'Aprovada',
      descricao: 'Atividade aprovada pelo coordenador',
      ordem: 3,
      ativo: true
    },
    {
      nome: 'Reprovada',
      descricao: 'Atividade reprovada pelo coordenador',
      ordem: 4,
      ativo: true
    }
  ]);

  console.log('Seed executado com sucesso.');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Erro ao executar seed:', error);
  process.exit(1);
});