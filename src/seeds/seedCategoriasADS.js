require('dotenv').config();

const connectDB = require('../config/database');
const Curso = require('../models/Curso');
const CategoriaAtividade = require('../models/CategoriaAtividade');
const RegraCargaHoraria = require('../models/RegraCargaHoraria');

const categoriasManualADS = [
  ['ENSINO_1_1', 'Monitoria no curso', 'Ensino', 'Participação em monitoria no curso | máximo: 20h por semestre | requisito: declaração e relatório das atividades', 20, 'Máximo de 20h por semestre. Requisito: declaração e relatório das atividades.'],
  ['ENSINO_1_2', 'Defesas de monografias', 'Ensino', 'Comparecimento a defesas de monografias - temas pertinentes | máximo: 2h por participação | requisito: relatório do evento e lista de presença', 2, 'Máximo de 2h por participação. Requisito: relatório do evento e lista de presença.'],
  ['ENSINO_1_3', 'Disciplina no Senac', 'Ensino', 'Disciplina cursada em outros cursos da Faculdade Senac | máximo: 20h por disciplina | requisito: histórico oficial', 20, 'Máximo de 20h por disciplina. Requisito: histórico oficial.'],
  ['ENSINO_1_4', 'Disciplina externa', 'Ensino', 'Disciplinas cursadas fora da Faculdade Senac | máximo: 20h por disciplina | requisito: histórico escolar e programa da disciplina', 20, 'Máximo de 20h por disciplina. Requisito: histórico escolar e programa da disciplina.'],
  ['ENSINO_1_5', 'Cursos instrumentais', 'Ensino', 'Cursos instrumentais - informática e/ou língua estrangeira | máximo: 10h por semestre | requisito: declaração do curso e aprovação no módulo ou semestre', 10, 'Máximo de 10h por semestre. Requisito: declaração do curso e aprovação no módulo ou semestre.'],
  ['ENSINO_1_6', 'Certificações da área', 'Ensino', 'Certificações reconhecidas da área | máximo: 10h por semestre | requisito: declaração do curso', 10, 'Máximo de 10h por semestre. Requisito: declaração do curso.'],
  ['ENSINO_1_7', 'Material didático', 'Ensino', 'Elaboração de material didático com supervisão do professor | máximo: 5h por material | requisito: cópia do material', 5, 'Máximo de 5h por material. Requisito: cópia do material.'],
  ['ENSINO_1_8', 'Atividade extraclasse', 'Ensino', 'Atividade extraclasse promovida como parte da formação do aluno | máximo: 10h por participação | requisito: certificado de participação', 10, 'Máximo de 10h por participação. Requisito: certificado de participação.'],
  ['ENSINO_1_9', 'Visitas técnicas', 'Ensino', 'Visitas técnicas | máximo: 4h por visita | requisito: documento do órgão/empresa e/ou comprovante de presença', 4, 'Máximo de 4h por visita. Requisito: documento do órgão/empresa e/ou comprovante de presença.'],
  ['PESQUISA_2_1', 'Atividades de pesquisa', 'Pesquisa', 'Participação em pesquisas ou atividades de pesquisa | máximo: 10h por produto final publicado | requisito: relatório do professor orientador', 10, 'Máximo de 10h por produto final publicado. Requisito: relatório do professor orientador.'],
  ['PESQUISA_2_2', 'Iniciação Científica', 'Pesquisa', 'Programas de bolsa de Iniciação Científica | máximo: 20h por bolsa | requisito: relatório do professor orientador', 20, 'Máximo de 20h por bolsa. Requisito: relatório do professor orientador.'],
  ['PESQUISA_2_3', 'Publicação de artigos', 'Pesquisa', 'Publicações de artigos em revistas, periódicos, sites e congêneres | máximo: 10h por produto publicado | requisito: publicação', 10, 'Máximo de 10h por produto publicado. Requisito: publicação.'],
  ['PESQUISA_2_4', 'Publicação em livro', 'Pesquisa', 'Publicação em livro na área | máximo: 40h por produto publicado | requisito: livro publicado', 40, 'Máximo de 40h por produto publicado. Requisito: livro publicado.'],
  ['PESQUISA_2_5', 'Treinamento especial', 'Pesquisa', 'Participação em programa especial de treinamento | máximo: 10h por semestre | requisito: atestado ou certificado de participação', 10, 'Máximo de 10h por semestre. Requisito: atestado ou certificado de participação.'],
  ['EXTENSAO_3_1', 'Eventos acadêmicos', 'Extensão', 'Participação em seminários, congressos, conferências e encontros | máximo: 10h por participação / 4h como público | requisito: atestado ou certificado de participação', 10, 'Máximo de 10h por participação ou 4h como público. Requisito: atestado ou certificado de participação.'],
  ['EXTENSAO_3_2', 'Atendimento comunitário', 'Extensão', 'Atendimento comunitário de cunho social | máximo: 10h por semestre | requisito: atestado de participação', 10, 'Máximo de 10h por semestre. Requisito: atestado de participação.'],
  ['EXTENSAO_3_3', 'Apresentação de trabalhos', 'Extensão', 'Apresentação de trabalhos, concursos, exposições, painéis, mostras e congêneres | máximo: 10h pela apresentação | requisito: trabalho apresentado', 10, 'Máximo de 10h pela apresentação. Requisito: trabalho apresentado.'],
  ['EXTENSAO_3_4', 'Estágio extracurricular', 'Extensão', 'Estágio extracurricular em entidades públicas ou privadas conveniadas com a Faculdade Senac | máximo: 20h por semestre | requisito: declaração da instituição e relatório de atividades', 20, 'Máximo de 20h por semestre. Requisito: declaração da instituição e relatório de atividades.'],
  ['EXTENSAO_3_5', 'Órgãos colegiados', 'Extensão', 'Participação em órgãos colegiados da Faculdade Senac | máximo: 5h por semestre | requisito: declaração da direção ou do presidente dos conselhos', 5, 'Máximo de 5h por semestre. Requisito: declaração da direção ou do presidente dos conselhos.'],
  ['EXTENSAO_3_6', 'Representação estudantil', 'Extensão', 'Representação estudantil | máximo: 10h por semestre | requisito: declaração da representação estudantil', 10, 'Máximo de 10h por semestre. Requisito: declaração da representação estudantil.'],
  ['EXTENSAO_3_7', 'Extensão universitária', 'Extensão', 'Cursos de extensão universitária, dentro ou fora da Faculdade Senac | máximo: 10h por curso | requisito: declaração da instituição atestando carga horária', 10, 'Máximo de 10h por curso. Requisito: declaração da instituição atestando carga horária.']
];

async function seedCategoriasADS() {
  await connectDB();

  const cursoADS = await Curso.findOne({ codigo: 'ADS' });

  if (!cursoADS) {
    throw new Error('Curso ADS não encontrado. Cadastre o curso ADS antes de executar este script.');
  }

  if (cursoADS.cargaHorariaTotalComplementar !== 100) {
    cursoADS.cargaHorariaTotalComplementar = 100;
    await cursoADS.save();
  }

  let criadasOuAtualizadas = 0;
  let regrasCriadasOuAtualizadas = 0;

  for (const [codigo, nome, areaParametro, descricao, limite, observacao] of categoriasManualADS) {
    const categoria = await CategoriaAtividade.findOneAndUpdate(
      { codigo, curso: cursoADS._id },
      {
        nome,
        codigo,
        descricao,
        areaParametro,
        curso: cursoADS._id,
        ativa: true
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    criadasOuAtualizadas += 1;

    await RegraCargaHoraria.findOneAndUpdate(
      { cursoId: cursoADS._id, categoriaId: categoria._id },
      {
        cursoId: cursoADS._id,
        categoriaId: categoria._id,
        cargaHorariaMaximaCategoria: limite,
        cargaHorariaMaximaSemestre: limite,
        observacao,
        ativa: true
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    regrasCriadasOuAtualizadas += 1;
  }

  console.log(`Categorias ADS criadas/atualizadas: ${criadasOuAtualizadas}`);
  console.log(`Regras ADS criadas/atualizadas: ${regrasCriadasOuAtualizadas}`);
  console.log('Seed seguro de categorias ADS concluído.');
  process.exit(0);
}

seedCategoriasADS().catch((error) => {
  console.error('Erro ao executar seed de categorias ADS:', error);
  process.exit(1);
});
