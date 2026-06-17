# KORE - Backend API

Backend do Sistema de Gestao de Atividades Complementares KORE.

Esta API foi desenvolvida em Node.js, Express e MongoDB para centralizar o cadastro de cursos, alunos, coordenadores, categorias, regras de carga horaria, submissao de atividades complementares, validacao de certificados, auditoria e notificacoes por e-mail.

## Objetivo

O KORE ajuda uma instituicao de ensino a controlar atividades complementares submetidas por alunos. O aluno envia uma atividade com certificado, o coordenador analisa, aprova ou reprova, e o sistema registra todo o historico da decisao.

O backend atende tres perfis principais:

- Administrador: gerencia usuarios, cursos, categorias, regras, alunos, auditoria e configuracoes.
- Coordenador: acompanha alunos e atividades dos cursos que coordena.
- Aluno: acessa o app/mobile, consulta cursos vinculados, envia atividades e acompanha o status.

## Principais Recursos

- Autenticacao JWT para usuarios administrativos e coordenadores.
- Autenticacao JWT separada para alunos.
- Suporte a aluno com o mesmo e-mail em mais de uma matricula/curso.
- Suporte a coordenador com o mesmo e-mail coordenando mais de um curso.
- Controle de permissao por perfil.
- Filtro de dados por curso para coordenadores.
- Upload de certificados por Cloudinary.
- Download protegido de anexos de atividades.
- Notificacao por e-mail usando Brevo API.
- Auditoria de acoes relevantes no sistema.
- Logs HTTP com Morgan.
- Protecoes com Helmet, CORS, rate limit e sanitizacao contra NoSQL injection.

## Tecnologias

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- JWT
- Multer
- Cloudinary
- Brevo API
- Morgan
- Helmet
- express-rate-limit
- express-mongo-sanitize
- CORS

## Estrutura do Projeto

```bash
src/
  config/          # conexao com banco e configuracoes
  controllers/     # regras de entrada/saida das rotas
  middlewares/     # autenticacao, permissao, upload e erros
  models/          # schemas do MongoDB/Mongoose
  routes/          # definicao dos endpoints
  seeds/           # scripts auxiliares de carga/correcao
  services/        # Cloudinary, e-mail, auditoria e servicos externos
  utils/           # utilitarios compartilhados
  app.js           # configuracao do Express
  server.js        # conexao com banco e inicializacao do servidor
```

## Como Rodar Localmente

Instale as dependencias:

```bash
npm install
```

Crie um arquivo `.env` na raiz do backend:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://usuario:senha@cluster/database
JWT_SECRET=sua_chave_jwt
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://127.0.0.1:5501,http://localhost:5501

CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
CLOUDINARY_FOLDER=kore/certificados

BREVO_API_KEY=sua_chave_api_brevo
MAIL_FROM_EMAIL=no-reply@seudominio.com
MAIL_FROM_NAME=Kore - Atividade Complementar

ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png
MAX_FILE_SIZE_BYTES=10485760
BCRYPT_SALT_ROUNDS=12
```

Execute em desenvolvimento:

```bash
npm run dev
```

Execute em producao:

```bash
npm start
```

Endpoint de saude:

```http
GET /health
```

## Scripts Disponiveis

```bash
npm run dev     # inicia com nodemon
npm start       # inicia com node
npm run seed    # executa seed inicial
```

## Autenticacao

O backend usa JWT no header:

```http
Authorization: Bearer TOKEN
```

Existem dois fluxos de autenticacao.

### Usuarios administrativos e coordenadores

Usado pelo painel web.

```http
POST /api/auth/login
GET /api/auth/me
POST /api/auth/register
```

O login aceita e-mail, codigo de usuario ou matricula/codigo, conforme o payload enviado pelo frontend.

Quando um coordenador possui mais de um registro com o mesmo e-mail, o backend agrega os cursos coordenados desses registros ativos. Assim, o coordenador enxerga todos os cursos vinculados ao mesmo perfil operacional.

### Alunos

Usado pelo aplicativo/mobile.

```http
POST /api/alunos/auth/login
POST /api/alunos/auth/primeiro-acesso
```

Quando um aluno possui mais de uma matricula com o mesmo e-mail, o backend agrega os cursos dos registros ativos daquele e-mail. Assim, o aluno pode escolher no app qual curso deseja usar para submissao e acompanhamento do progresso.

## Permissoes

### Administrador

- Gerencia usuarios e coordenadores.
- Gerencia cursos.
- Gerencia categorias.
- Gerencia regras de carga horaria.
- Consulta auditoria.
- Acompanha atividades e alunos.

### Coordenador

- Consulta cursos que coordena.
- Consulta alunos dos cursos coordenados.
- Consulta atividades dos cursos coordenados.
- Aprova, reprova ou coloca atividades em analise.
- Baixa anexos das atividades.

### Aluno

- Consulta seus cursos.
- Consulta categorias disponiveis por curso.
- Submete atividade complementar.
- Envia certificado/anexo.
- Consulta atividades e certificados.
- Acompanha status.

## Regras de Negocio

### Atividades

Uma atividade possui:

- aluno;
- curso;
- categoria;
- titulo;
- descricao;
- data de realizacao;
- carga horaria informada;
- anexos;
- status;
- historico de validacoes.

Status possiveis:

- Enviada
- Em analise
- Aprovada
- Reprovada

### Validacao pelo Coordenador

O coordenador pode atualizar o status da atividade pela rota:

```http
PATCH /api/atividades/:id/status
```

Ao aprovar, o sistema considera a carga horaria validada. Quando existe regra de carga horaria para curso/categoria, o backend limita a carga aceita ao teto configurado.

Ao reprovar, a justificativa de reprovacao e obrigatoria.

### Cursos e Multiplas Matriculas

O sistema permite que um mesmo e-mail exista em mais de uma matricula, desde que a matricula seja diferente.

Isso foi tratado para:

- aluno com mais de um curso;
- coordenador com mais de um curso.

Na pratica, o banco pode ter registros separados, mas a API monta uma visao agregada para o usuario autenticado.

## Upload e Cloudinary

O envio de certificados usa Multer para receber arquivos e Cloudinary como storage externo.

Formatos aceitos:

- PDF
- JPG/JPEG
- PNG

O tamanho maximo e controlado por:

```env
MAX_FILE_SIZE_BYTES=10485760
```

Tipos permitidos:

```env
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png
```

O anexo salvo em atividade guarda metadados como:

- nome do arquivo;
- URL;
- tipo MIME;
- tamanho;
- storageProvider;
- storageKey;
- resourceType.

Download protegido:

```http
GET /api/atividades/:id/anexos/:index/download
```

Essa rota gera o acesso ao arquivo salvo no Cloudinary e so permite download para administradores/coordenadores autorizados.

## Notificacoes por E-mail

O backend envia e-mails usando a API transacional da Brevo.

Variaveis usadas:

```env
BREVO_API_KEY=
MAIL_FROM_EMAIL=
MAIL_FROM_NAME=
```

Notificacoes implementadas:

- quando o aluno submete uma nova atividade, responsaveis pelo curso podem ser notificados;
- quando uma atividade e aprovada ou reprovada, o aluno recebe e-mail com a atualizacao de status.

O envio de e-mail roda de forma assincrona e nao bloqueia a resposta principal da API. Se o e-mail falhar, a acao principal continua salva e o erro e registrado no log.

## Auditoria e Logs

O backend possui duas camadas de rastreabilidade.

### Logs HTTP

O `morgan` registra as requisicoes HTTP.

Em producao:

```js
morgan('combined')
```

Em desenvolvimento:

```js
morgan('dev')
```

### Auditoria de Negocio

A auditoria registra acoes importantes em colecao propria no MongoDB.

Exemplos:

- criacao;
- atualizacao;
- exclusao;
- login;
- aprovacao;
- reprovacao;
- alteracao de status.

Consulta:

```http
GET /api/auditoria
```

Essa rota e protegida para administrador.

## Seguranca

Medidas implementadas:

- JWT para rotas protegidas.
- Helmet para cabecalhos HTTP.
- CORS configuravel por ambiente.
- Rate limit geral em `/api`.
- Rate limit especifico em `/api/auth`.
- Sanitizacao contra NoSQL injection.
- Validacao de upload por extensao, MIME type e tamanho.
- Restricao de curso para coordenadores.

## Rotas Principais

### Health

| Metodo | Rota      | Descricao |
| ------ | --------- | --------- |
| GET    | /health   | Verifica se a API esta ativa |

### Auth

| Metodo | Rota               | Perfil |
| ------ | ------------------ | ------ |
| POST   | /api/auth/login    | Publica |
| GET    | /api/auth/me       | Autenticado |
| POST   | /api/auth/register | Admin/uso controlado |

### Auth de Aluno

| Metodo | Rota                            | Perfil |
| ------ | ------------------------------- | ------ |
| POST   | /api/alunos/auth/login          | Publica |
| POST   | /api/alunos/auth/primeiro-acesso| Publica |

### Usuarios

| Metodo | Rota              | Perfil |
| ------ | ----------------- | ------ |
| GET    | /api/usuarios     | Administrador |
| POST   | /api/usuarios     | Administrador |
| GET    | /api/usuarios/:id | Administrador |
| PATCH  | /api/usuarios/:id | Administrador |
| DELETE | /api/usuarios/:id | Administrador |

### Cursos

| Metodo | Rota            | Perfil |
| ------ | --------------- | ------ |
| GET    | /api/cursos     | Autenticado |
| POST   | /api/cursos     | Admin/Coordenador |
| PATCH  | /api/cursos/:id | Administrador |
| PUT    | /api/cursos/:id | Admin/Coordenador |
| DELETE | /api/cursos/:id | Administrador |

### Alunos

| Metodo | Rota                      | Perfil |
| ------ | ------------------------- | ------ |
| GET    | /api/alunos               | Admin/Coordenador |
| POST   | /api/alunos               | Admin/Coordenador |
| GET    | /api/alunos/:id           | Admin/Coordenador |
| PATCH  | /api/alunos/:id           | Admin/Coordenador |
| DELETE | /api/alunos/:id           | Admin/Coordenador |
| GET    | /api/alunos/dashboard     | Aluno |
| GET    | /api/alunos/meus-cursos   | Aluno |
| GET    | /api/alunos/atividades    | Aluno |
| POST   | /api/alunos/atividades    | Aluno |
| GET    | /api/alunos/categorias    | Aluno |
| GET    | /api/alunos/certificados  | Aluno |

### Atividades

| Metodo | Rota                                      | Perfil |
| ------ | ----------------------------------------- | ------ |
| GET    | /api/atividades                           | Admin/Coordenador |
| POST   | /api/atividades                           | Admin/Coordenador |
| GET    | /api/atividades/:id                       | Admin/Coordenador |
| PUT    | /api/atividades/:id                       | Admin/Coordenador |
| DELETE | /api/atividades/:id                       | Admin/Coordenador |
| PATCH  | /api/atividades/:id/status                | Admin/Coordenador |
| GET    | /api/atividades/:id/anexos/:index/download| Admin/Coordenador |

### Categorias

| Metodo | Rota                    | Perfil |
| ------ | ----------------------- | ------ |
| GET    | /api/categorias         | Admin/Coordenador |
| POST   | /api/categorias         | Administrador |
| GET    | /api/categorias/:id     | Admin/Coordenador |
| PUT    | /api/categorias/:id     | Administrador |
| DELETE | /api/categorias/:id     | Administrador |
| POST   | /api/categorias/seed-ads| Administrador |

### Regras de Carga Horaria

| Metodo | Rota                         | Perfil |
| ------ | ---------------------------- | ------ |
| GET    | /api/regras-carga-horaria    | Admin/Coordenador |
| POST   | /api/regras-carga-horaria    | Administrador |
| GET    | /api/regras-carga-horaria/:id| Admin/Coordenador |
| PUT    | /api/regras-carga-horaria/:id| Administrador |
| DELETE | /api/regras-carga-horaria/:id| Administrador |

### Configuracoes

| Metodo | Rota                    | Perfil |
| ------ | ----------------------- | ------ |
| GET    | /api/configuracoes      | Admin/Coordenador |
| GET    | /api/configuracoes/:chave| Admin/Coordenador |
| POST   | /api/configuracoes      | Administrador |

### Auditoria

| Metodo | Rota           | Perfil |
| ------ | -------------- | ------ |
| GET    | /api/auditoria | Administrador |

## Deploy no Render

Configuracao recomendada:

- Build command: `npm install`
- Start command: `npm start`
- Node environment: production

Variaveis obrigatorias no Render:

- `MONGODB_URI`
- `JWT_SECRET`
- `CORS_ORIGIN`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `BREVO_API_KEY`
- `MAIL_FROM_EMAIL`
- `MAIL_FROM_NAME`

## Observacoes de Go Live

Antes de publicar:

- confirmar variaveis de ambiente;
- confirmar permissao de entrega de PDF/raw no Cloudinary;
- confirmar remetente validado na Brevo;
- testar login de administrador/coordenador;
- testar login de aluno;
- testar aluno com dois cursos;
- testar coordenador com dois cursos;
- testar submissao de atividade;
- testar aprovacao/reprovacao;
- testar recebimento de e-mail;
- testar download de PDF.

## Finalidade

Projeto academico desenvolvido para a disciplina de Projeto Integrador.
