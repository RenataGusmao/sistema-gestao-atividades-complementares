CREATE DATABASE kore;
USE kore;

-- =========================================
-- TABELA DE PERFIS
-- =========================================
CREATE TABLE perfil (
    id_perfil INT AUTO_INCREMENT PRIMARY KEY,
    nome_perfil VARCHAR(50) NOT NULL UNIQUE
);

-- =========================================
-- TABELA DE USUÁRIOS
-- =========================================
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================
-- RELAÇÃO USUÁRIO X PERFIL
-- Um usuário pode ter um ou mais perfis
-- =========================================
CREATE TABLE usuario_perfil (
    id_usuario INT NOT NULL,
    id_perfil INT NOT NULL,
    PRIMARY KEY (id_usuario, id_perfil),
    CONSTRAINT fk_usuario_perfil_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    CONSTRAINT fk_usuario_perfil_perfil
        FOREIGN KEY (id_perfil) REFERENCES perfil(id_perfil)
);

-- =========================================
-- TABELA DE CURSOS
-- =========================================
CREATE TABLE curso (
    id_curso INT AUTO_INCREMENT PRIMARY KEY,
    nome_curso VARCHAR(150) NOT NULL,
    codigo_curso VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- RELAÇÃO COORDENADOR X CURSO
-- Um coordenador pode coordenar mais de um curso
-- Um curso pode ter mais de um coordenador
-- =========================================
CREATE TABLE coordenador_curso (
    id_usuario INT NOT NULL,
    id_curso INT NOT NULL,
    data_vinculo DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_usuario, id_curso),
    CONSTRAINT fk_coordenador_curso_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    CONSTRAINT fk_coordenador_curso_curso
        FOREIGN KEY (id_curso) REFERENCES curso(id_curso)
);

-- =========================================
-- TABELA DE ALUNOS
-- Separada da tabela usuário porque o aluno
-- pode existir no banco antes do acesso mobile
-- =========================================
CREATE TABLE aluno (
    id_aluno INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    matricula VARCHAR(50) NOT NULL UNIQUE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_colacao_prevista DATE NULL,
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- RELAÇÃO ALUNO X CURSO
-- Um aluno pode estar em mais de um curso
-- =========================================
CREATE TABLE aluno_curso (
    id_aluno INT NOT NULL,
    id_curso INT NOT NULL,
    matricula_ativa BOOLEAN NOT NULL DEFAULT TRUE,
    data_vinculo DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_aluno, id_curso),
    CONSTRAINT fk_aluno_curso_aluno
        FOREIGN KEY (id_aluno) REFERENCES aluno(id_aluno),
    CONSTRAINT fk_aluno_curso_curso
        FOREIGN KEY (id_curso) REFERENCES curso(id_curso)
);

-- =========================================
-- TABELA DE CATEGORIAS DE ATIVIDADES
-- =========================================
CREATE TABLE categoria_atividade (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nome_categoria VARCHAR(100) NOT NULL,
    descricao TEXT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

-- =========================================
-- REGRAS DE CARGA HORÁRIA POR CURSO E CATEGORIA
-- Configurável por curso
-- =========================================
CREATE TABLE regra_carga_horaria (
    id_regra INT AUTO_INCREMENT PRIMARY KEY,
    id_curso INT NOT NULL,
    id_categoria INT NOT NULL,
    carga_horaria_maxima DECIMAL(6,2) NOT NULL,
    observacao TEXT NULL,
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_regra_curso
        FOREIGN KEY (id_curso) REFERENCES curso(id_curso),
    CONSTRAINT fk_regra_categoria
        FOREIGN KEY (id_categoria) REFERENCES categoria_atividade(id_categoria),
    CONSTRAINT uq_regra_curso_categoria UNIQUE (id_curso, id_categoria)
);

-- =========================================
-- STATUS DAS ATIVIDADES
-- =========================================
CREATE TABLE status_atividade (
    id_status INT AUTO_INCREMENT PRIMARY KEY,
    nome_status VARCHAR(50) NOT NULL UNIQUE
);

-- =========================================
-- TABELA DE ATIVIDADES COMPLEMENTARES
-- =========================================
CREATE TABLE atividade (
    id_atividade INT AUTO_INCREMENT PRIMARY KEY,
    id_aluno INT NOT NULL,
    id_curso INT NOT NULL,
    id_categoria INT NOT NULL,
    id_status INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT NOT NULL,
    data_realizacao DATE NOT NULL,
    carga_horaria_informada DECIMAL(6,2) NOT NULL,
    carga_horaria_validada DECIMAL(6,2) NULL,
    justificativa_reprovacao TEXT NULL,
    observacao_coordenador TEXT NULL,
    data_submissao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_ultima_atualizacao DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    id_coordenador_avaliador INT NULL,
    CONSTRAINT fk_atividade_aluno
        FOREIGN KEY (id_aluno) REFERENCES aluno(id_aluno),
    CONSTRAINT fk_atividade_curso
        FOREIGN KEY (id_curso) REFERENCES curso(id_curso),
    CONSTRAINT fk_atividade_categoria
        FOREIGN KEY (id_categoria) REFERENCES categoria_atividade(id_categoria),
    CONSTRAINT fk_atividade_status
        FOREIGN KEY (id_status) REFERENCES status_atividade(id_status),
    CONSTRAINT fk_atividade_coordenador
        FOREIGN KEY (id_coordenador_avaliador) REFERENCES usuario(id_usuario)
);

-- =========================================
-- ANEXOS DAS ATIVIDADES
-- Aceita PDF, JPG, PNG
-- =========================================
CREATE TABLE anexo_atividade (
    id_anexo INT AUTO_INCREMENT PRIMARY KEY,
    id_atividade INT NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    caminho_arquivo VARCHAR(500) NOT NULL,
    tipo_arquivo VARCHAR(20) NOT NULL,
    tamanho_bytes BIGINT NOT NULL,
    data_upload DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_anexo_atividade
        FOREIGN KEY (id_atividade) REFERENCES atividade(id_atividade),
    CONSTRAINT chk_tipo_arquivo
        CHECK (tipo_arquivo IN ('pdf', 'jpg', 'jpeg', 'png'))
);

-- =========================================
-- HISTÓRICO DE STATUS DAS ATIVIDADES
-- =========================================
CREATE TABLE historico_status_atividade (
    id_historico INT AUTO_INCREMENT PRIMARY KEY,
    id_atividade INT NOT NULL,
    id_status_anterior INT NULL,
    id_status_novo INT NOT NULL,
    id_usuario_responsavel INT NULL,
    observacao TEXT NULL,
    data_alteracao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_hist_atividade
        FOREIGN KEY (id_atividade) REFERENCES atividade(id_atividade),
    CONSTRAINT fk_hist_status_anterior
        FOREIGN KEY (id_status_anterior) REFERENCES status_atividade(id_status),
    CONSTRAINT fk_hist_status_novo
        FOREIGN KEY (id_status_novo) REFERENCES status_atividade(id_status),
    CONSTRAINT fk_hist_usuario
        FOREIGN KEY (id_usuario_responsavel) REFERENCES usuario(id_usuario)
);

-- =========================================
-- LOG DE AUDITORIA OBRIGATÓRIO
-- =========================================
CREATE TABLE auditoria (
    id_auditoria BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NULL,
    tabela_afetada VARCHAR(100) NOT NULL,
    acao VARCHAR(20) NOT NULL,
    id_registro_afetado INT NOT NULL,
    descricao_acao TEXT NULL,
    data_evento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_origem VARCHAR(45) NULL,
    CONSTRAINT fk_auditoria_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    CONSTRAINT chk_acao_auditoria
        CHECK (acao IN ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APROVACAO', 'REPROVACAO'))
);

-- =========================================
-- CONFIGURAÇÕES GERAIS DO SISTEMA
-- Regras alteráveis sem mudar código
-- =========================================
CREATE TABLE configuracao_sistema (
    id_configuracao INT AUTO_INCREMENT PRIMARY KEY,
    chave_configuracao VARCHAR(100) NOT NULL UNIQUE,
    valor_configuracao VARCHAR(255) NOT NULL,
    descricao TEXT NULL,
    data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);