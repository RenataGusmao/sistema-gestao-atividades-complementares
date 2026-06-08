const Curso = require('../models/Curso');
const CategoriaAtividade = require('../models/CategoriaAtividade');
const RegraCargaHoraria = require('../models/RegraCargaHoraria');

const categoriasManualADS = [
  {
    codigo: 'ENSINO_1_1',
    nome: 'Monitoria no curso',
    areaParametro: 'Ensino',
    descricao: '1.1 Participação em monitoria no curso | máximo: 20h por semestre | requisito: declaração e relatório das atividades',
    maximo: 20,
    observacao: 'Máximo de 20h por semestre. Requisito: declaração e relatório das atividades.'
  },
  {
    codigo: 'ENSINO_1_2',
    nome: 'Defesas de monografias',
    areaParametro: 'Ensino',
    descricao: '1.2 Comparecimento a defesas de monografias - temas pertinentes | máximo: 2h por participação | requisito: relatório do evento e lista de presença',
    maximo: 2,
    observacao: 'Máximo de 2h por participação. Requisito: relatório do evento e lista de presença.'
  },
  {
    codigo: 'ENSINO_1_3',
    nome: 'Disciplina no Senac',
    areaParametro: 'Ensino',
    descricao: '1.3 Disciplina cursada em outros cursos da Faculdade Senac | máximo: 20h por disciplina | requisito: histórico oficial',
    maximo: 20,
    observacao: 'Máximo de 20h por disciplina. Requisito: histórico oficial.'
  },
  {
    codigo: 'ENSINO_1_4',
    nome: 'Disciplina externa',
    areaParametro: 'Ensino',
    descricao: '1.4 Disciplinas cursadas fora da Faculdade Senac | máximo: 20h por disciplina | requisito: histórico escolar e programa da disciplina',
    maximo: 20,
    observacao: 'Máximo de 20h por disciplina. Requisito: histórico escolar e programa da disciplina.'
  },
  {
    codigo: 'ENSINO_1_5',
    nome: 'Cursos instrumentais',
    areaParametro: 'Ensino',
    descricao: '1.5 Cursos instrumentais – informática e/ou língua estrangeira | máximo: 10h por semestre | requisito: declaração do curso e aprovação no módulo ou semestre',
    maximo: 10,
    observacao: 'Máximo de 10h por semestre. Requisito: declaração do curso e aprovação no módulo ou semestre.'
  },
  {
    codigo: 'ENSINO_1_6',
    nome: 'Certificações da área',
    areaParametro: 'Ensino',
    descricao: '1.6 Certificações reconhecidas da área | máximo: 10h por semestre | requisito: declaração do curso',
    maximo: 10,
    observacao: 'Máximo de 10h por semestre. Requisito: declaração do curso.'
  },
  {
    codigo: 'ENSINO_1_7',
    nome: 'Material didático',
    areaParametro: 'Ensino',
    descricao: '1.7 Elaboração de material didático com supervisão do professor | máximo: 5h por material | requisito: cópia do material',
    maximo: 5,
    observacao: 'Máximo de 5h por material. Requisito: cópia do material.'
  },
  {
    codigo: 'ENSINO_1_8',
    nome: 'Atividade extraclasse',
    areaParametro: 'Ensino',
    descricao: '1.8 Atividade extraclasse promovida como parte da formação do aluno | máximo: 10h por participação | requisito: certificado de participação',
    maximo: 10,
    observacao: 'Máximo de 10h por participação. Requisito: certificado de participação.'
  },
  {
    codigo: 'ENSINO_1_9',
    nome: 'Visitas técnicas',
    areaParametro: 'Ensino',
    descricao: '1.9 Visitas técnicas | máximo: 4h por visita | requisito: documento do órgão/empresa e/ou comprovante de presença',
    maximo: 4,
    observacao: 'Máximo de 4h por visita. Requisito: documento do órgão/empresa e/ou comprovante de presença.'
  },
  {
    codigo: 'PESQUISA_2_1',
    nome: 'Atividades de pesquisa',
    areaParametro: 'Pesquisa',
    descricao: '2.1 Participação em pesquisas ou atividades de pesquisa | máximo: 10h por produto final publicado | requisito: relatório do professor orientador',
    maximo: 10,
    observacao: 'Máximo de 10h por produto final publicado. Requisito: relatório do professor orientador.'
  },
  {
    codigo: 'PESQUISA_2_2',
    nome: 'Iniciação Científica',
    areaParametro: 'Pesquisa',
    descricao: '2.2 Programas de bolsa de Iniciação Científica | máximo: 20h por bolsa | requisito: relatório do professor orientador',
    maximo: 20,
    observacao: 'Máximo de 20h por bolsa. Requisito: relatório do professor orientador.'
  },
  {
    codigo: 'PESQUISA_2_3',
    nome: 'Publicação de artigos',
    areaParametro: 'Pesquisa',
    descricao: '2.3 Publicações de artigos em revistas, periódicos, sites e congêneres | máximo: 10h por produto publicado | requisito: publicação',
    maximo: 10,
    observacao: 'Máximo de 10h por produto publicado. Requisito: publicação.'
  },
  {
    codigo: 'PESQUISA_2_4',
    nome: 'Publicação em livro',
    areaParametro: 'Pesquisa',
    descricao: '2.4 Publicação em livro na área | máximo: 40h por produto publicado | requisito: livro publicado',
    maximo: 40,
    observacao: 'Máximo de 40h por produto publicado. Requisito: livro publicado.'
  },
  {
    codigo: 'PESQUISA_2_5',
    nome: 'Treinamento especial',
    areaParametro: 'Pesquisa',
    descricao: '2.5 Participação em programa especial de treinamento | máximo: 10h por semestre | requisito: atestado ou certificado de participação',
    maximo: 10,
    observacao: 'Máximo de 10h por semestre. Requisito: atestado ou certificado de participação.'
  },
  {
    codigo: 'EXTENSAO_3_1',
    nome: 'Eventos acadêmicos',
    areaParametro: 'Extensão',
    descricao: '3.1 Participação em seminários, congressos, conferências e encontros | máximo: 10h por participação / 4h como público | requisito: atestado ou certificado de participação',
    maximo: 10,
    observacao: 'Máximo de 10h por participação ou 4h como público. Requisito: atestado ou certificado de participação.'
  },
  {
    codigo: 'EXTENSAO_3_2',
    nome: 'Atendimento comunitário',
    areaParametro: 'Extensão',
    descricao: '3.2 Atendimento comunitário de cunho social | máximo: 10h por semestre | requisito: atestado de participação',
    maximo: 10,
    observacao: 'Máximo de 10h por semestre. Requisito: atestado de participação.'
  },
  {
    codigo: 'EXTENSAO_3_3',
    nome: 'Apresentação de trabalhos',
    areaParametro: 'Extensão',
    descricao: '3.3 Apresentação de trabalhos, concursos, exposições, painéis, mostras e congêneres | máximo: 10h pela apresentação | requisito: trabalho apresentado',
    maximo: 10,
    observacao: 'Máximo de 10h pela apresentação. Requisito: trabalho apresentado.'
  },
  {
    codigo: 'EXTENSAO_3_4',
    nome: 'Estágio extracurricular',
    areaParametro: 'Extensão',
    descricao: '3.4 Estágio extracurricular em entidades públicas ou privadas conveniadas com a Faculdade Senac | máximo: 20h por semestre | requisito: declaração da instituição e relatório de atividades',
    maximo: 20,
    observacao: 'Máximo de 20h por semestre. Requisito: declaração da instituição e relatório de atividades.'
  },
  {
    codigo: 'EXTENSAO_3_5',
    nome: 'Órgãos colegiados',
    areaParametro: 'Extensão',
    descricao: '3.5 Participação em órgãos colegiados da Faculdade Senac | máximo: 5h por semestre | requisito: declaração da direção ou do presidente dos conselhos',
    maximo: 5,
    observacao: 'Máximo de 5h por semestre. Requisito: declaração da direção ou do presidente dos conselhos.'
  },
  {
    codigo: 'EXTENSAO_3_6',
    nome: 'Representação estudantil',
    areaParametro: 'Extensão',
    descricao: '3.6 Representação estudantil | máximo: 10h por semestre | requisito: declaração da representação estudantil',
    maximo: 10,
    observacao: 'Máximo de 10h por semestre. Requisito: declaração da representação estudantil.'
  },
  {
    codigo: 'EXTENSAO_3_7',
    nome: 'Cursos de Extensão',
    areaParametro: 'Extensão',
    descricao: '3.7 Cursos de extensão universitária, dentro ou fora da Faculdade Senac | máximo: 10h por curso | requisito: declaração da instituição atestando carga horária',
    maximo: 10,
    observacao: 'Máximo de 10h por curso. Requisito: declaração da instituição atestando carga horária.'
  }
];

async function executarSeedCategoriasADS() {
  const cursoADS = await Curso.findOneAndUpdate(
    { codigo: 'ADS' },
    {
      $set: {
        codigo: 'ADS',
        nome: 'Análise e Desenvolvimento de Sistemas',
        descricao: 'Curso superior de tecnologia em ADS',
        cargaHorariaTotalComplementar: 100,
        ativo: true
      }
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  const categorias = [];

  for (const item of categoriasManualADS) {
    const categoria = await CategoriaAtividade.findOneAndUpdate(
      { codigo: item.codigo },
      {
        $set: {
          codigo: item.codigo,
          nome: item.nome,
          descricao: item.descricao,
          areaParametro: item.areaParametro,
          ativa: true,
          curso: cursoADS._id
        }
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    categorias.push({ item, categoria });
  }

  for (const { item, categoria } of categorias) {
    await RegraCargaHoraria.findOneAndUpdate(
      {
        cursoId: cursoADS._id,
        categoriaId: categoria._id
      },
      {
        $set: {
          cursoId: cursoADS._id,
          categoriaId: categoria._id,
          cargaHorariaMaximaCategoria: item.maximo,
          cargaHorariaMaximaSemestre: item.maximo,
          observacao: item.observacao,
          ativa: true
        }
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
  }

  return {
    curso: cursoADS,
    categorias: categorias.length,
    regras: categorias.length
  };
}

module.exports = {
  executarSeedCategoriasADS
};
