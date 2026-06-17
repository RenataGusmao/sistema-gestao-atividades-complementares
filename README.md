# KORE - Backend API

Backend do Sistema de Gestão de Atividades Complementares KORE.

Esta API foi desenvolvida em Node.js, Express e MongoDB para centralizar o cadastro de cursos, alunos, coordenadores, categorias, regras de carga horária, submissão de atividades complementares, validação de certificados, auditoria e notificações por e-mail.

## Objetivo

O KORE ajuda uma instituição de ensino a controlar atividades complementares submetidas por alunos. O aluno envia uma atividade com certificado, o coordenador analisa, aprova ou reprova, e o sistema registra todo o histórico da decisão.

O backend atende três perfis principais:

- Administrador: gerencia usuários, cursos, categorias, regras, alunos, auditoria e configurações.
- Coordenador: acompanha alunos e atividades dos cursos que coordena.
- Aluno: acessa o app/mobile, consulta cursos vinculados, envia atividades e acompanha o status.

## Principais Recursos

- Autenticação JWT para usuários administrativos e coordenadores.
- Autenticação JWT separada para alunos.
- Suporte a aluno com o mesmo e-mail em mais de uma matrícula/curso.
- Suporte a coordenador com o mesmo e-mail coordenando mais de um curso.
- Controle de permissão por perfil.
- Filtro de dados por curso para coordenadores.
- Upload de certificados por Cloudinary.
- Download protegido de anexos de atividades.
- Notificação por e-mail usando Brevo API.
- Auditoria de ações relevantes no sistema.
- Logs HTTP com Morgan.
- Proteções com Helmet, CORS, rate limit e sanitização contra NoSQL injection.

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
  config/          # conexão com banco e configurações
  controllers/     # regras de entrada/saída das rotas
  middlewares/     # autenticação, permissão, upload e erros
  models/          # schemas do MongoDB/Mongoose
  routes/          # definição dos endpoints
  seeds/           # scripts auxiliares de carga/correção
  services/        # Cloudinary, e-mail, auditoria e serviços externos
  utils/           # utilitários compartilhados
  app.js           # configuração do Express
  server.js        # conexão com banco e inicialização do servidor
```

## Como Rodar Localmente

Instale as dependências:

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

Execute em produção:

```bash
npm start
```

Endpoint de saúde:

```http
GET /health
```

## Scripts Disponíveis

```bash
npm run dev     # inicia com nodemon
npm start       # inicia com node
npm run seed    # executa seed inicial
```

## Autenticação

O backend usa JWT no header:

```http
Authorization: Bearer TOKEN
```

Existem dois fluxos de autenticação.

### Usuários administrativos e coordenadores

Usado pelo painel web.

```http
POST /api/auth/login
GET /api/auth/me
POST /api/auth/register
```

O login aceita e-mail, código de usuário ou matrícula/código, conforme o payload enviado pelo frontend.

Quando um coordenador possui mais de um registro com o mesmo e-mail, o backend agrega os cursos coordenados desses registros ativos. Assim, o coordenador enxerga todos os cursos vinculados ao mesmo perfil operacional.

### Alunos

Usado pelo aplicativo/mobile.

```http
POST /api/alunos/auth/login
POST /api/alunos/auth/primeiro-acesso
```

Quando um aluno possui mais de uma matrícula com o mesmo e-mail, o backend agrega os cursos dos registros ativos daquele e-mail. Assim, o aluno pode escolher no app qual curso deseja usar para submissão e acompanhamento do progresso.

## Permissões

### Administrador

- Gerencia usuários e coordenadores.
- Gerencia cursos.
- Gerencia categorias.
- Gerencia regras de carga horária.
- Consulta auditoria.
- Acompanha atividades e alunos.

### Coordenador

- Consulta cursos que coordena.
- Consulta alunos dos cursos coordenados.
- Consulta atividades dos cursos coordenados.
- Aprova, reprova ou coloca atividades em análise.
- Baixa anexos das atividades.

### Aluno

- Consulta seus cursos.
- Consulta categorias disponíveis por curso.
- Submete atividade complementar.
- Envia certificado/anexo.
- Consulta atividades e certificados.
- Acompanha status.

## Regras de Negócio

### Atividades

Uma atividade possui:

- aluno;
- curso;
- categoria;
- título;
- descrição;
- data de realização;
- carga horária informada;
- anexos;
- status;
- histórico de validações.

Status possíveis:

- Enviada
- Em análise
- Aprovada
- Reprovada

### Validação pelo Coordenador

O coordenador pode atualizar o status da atividade pela rota:

```http
PATCH /api/atividades/:id/status
```

Ao aprovar, o sistema considera a carga horária validada. Quando existe regra de carga horária para curso/categoria, o backend limita a carga aceita ao teto configurado.

Ao reprovar, a justificativa de reprovação é obrigatória.

### Cursos e Múltiplas Matrículas

O sistema permite que um mesmo e-mail exista em mais de uma matrícula, desde que a matrícula seja diferente.

Isso foi tratado para:

- aluno com mais de um curso;
- coordenador com mais de um curso.

Na prática, o banco pode ter registros separados, mas a API monta uma visão agregada para o usuário autenticado.

## Upload e Cloudinary

O envio de certificados usa Multer para receber arquivos e Cloudinary como storage externo.

Formatos aceitos:

- PDF
- JPG/JPEG
- PNG

O tamanho máximo é controlado por:

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

Essa rota gera o acesso ao arquivo salvo no Cloudinary e só permite download para administradores/coordenadores autorizados.

## Notificações por E-mail

O backend envia e-mails usando a API transacional da Brevo.

Variáveis usadas:

```env
BREVO_API_KEY=
MAIL_FROM_EMAIL=
MAIL_FROM_NAME=
```

Notificações implementadas:

- quando o aluno submete uma nova atividade, responsáveis pelo curso podem ser notificados;
- quando uma atividade é aprovada ou reprovada, o aluno recebe e-mail com a atualização de status.

O envio de e-mail roda de forma assíncrona e não bloqueia a resposta principal da API. Se o e-mail falhar, a ação principal continua salva e o erro é registrado no log.

## Auditoria e Logs

O backend possui duas camadas de rastreabilidade.

### Logs HTTP

O `morgan` registra as requisições HTTP.

Em produção:

```js
morgan('combined')
```

Em desenvolvimento:

```js
morgan('dev')
```

### Auditoria de Negócio

A auditoria registra ações importantes em coleção própria no MongoDB.

Exemplos:

- criação;
- atualização;
- exclusão;
- login;
- aprovação;
- reprovação;
- alteração de status.

Consulta:

```http
GET /api/auditoria
```

Essa rota é protegida para administrador.

## Segurança

Medidas implementadas:

- JWT para rotas protegidas.
- Helmet para cabeçalhos HTTP.
- CORS configurável por ambiente.
- Rate limit geral em `/api`.
- Rate limit específico em `/api/auth`.
- Sanitização contra NoSQL injection.
- Validação de upload por extensão, MIME type e tamanho.
- Restrição de curso para coordenadores.

## Rotas Principais

### Health

| Método | Rota    | Descrição |
| ------ | ------- | --------- |
| GET    | /health | Verifica se a API está ativa |

### Auth

| Método | Rota               | Perfil |
| ------ | ------------------ | ------ |
| POST   | /api/auth/login    | Pública |
| GET    | /api/auth/me       | Autenticado |
| POST   | /api/auth/register | Admin/uso controlado |

### Auth de Aluno

| Método | Rota                             | Perfil |
| ------ | -------------------------------- | ------ |
| POST   | /api/alunos/auth/login           | Pública |
| POST   | /api/alunos/auth/primeiro-acesso | Pública |

### Usuários

| Método | Rota              | Perfil |
| ------ | ----------------- | ------ |
| GET    | /api/usuarios     | Administrador |
| POST   | /api/usuarios     | Administrador |
| GET    | /api/usuarios/:id | Administrador |
| PATCH  | /api/usuarios/:id | Administrador |
| DELETE | /api/usuarios/:id | Administrador |

### Cursos

| Método | Rota            | Perfil |
| ------ | --------------- | ------ |
| GET    | /api/cursos     | Autenticado |
| POST   | /api/cursos     | Admin/Coordenador |
| PATCH  | /api/cursos/:id | Administrador |
| PUT    | /api/cursos/:id | Admin/Coordenador |
| DELETE | /api/cursos/:id | Administrador |

### Alunos

| Método | Rota                     | Perfil |
| ------ | ------------------------ | ------ |
| GET    | /api/alunos              | Admin/Coordenador |
| POST   | /api/alunos              | Admin/Coordenador |
| GET    | /api/alunos/:id          | Admin/Coordenador |
| PATCH  | /api/alunos/:id          | Admin/Coordenador |
| DELETE | /api/alunos/:id          | Admin/Coordenador |
| GET    | /api/alunos/dashboard    | Aluno |
| GET    | /api/alunos/meus-cursos  | Aluno |
| GET    | /api/alunos/atividades   | Aluno |
| POST   | /api/alunos/atividades   | Aluno |
| GET    | /api/alunos/categorias   | Aluno |
| GET    | /api/alunos/certificados | Aluno |

### Atividades

| Método | Rota                                       | Perfil |
| ------ | ------------------------------------------ | ------ |
| GET    | /api/atividades                            | Admin/Coordenador |
| POST   | /api/atividades                            | Admin/Coordenador |
| GET    | /api/atividades/:id                        | Admin/Coordenador |
| PUT    | /api/atividades/:id                        | Admin/Coordenador |
| DELETE | /api/atividades/:id                        | Admin/Coordenador |
| PATCH  | /api/atividades/:id/status                 | Admin/Coordenador |
| GET    | /api/atividades/:id/anexos/:index/download | Admin/Coordenador |

### Categorias

| Método | Rota                     | Perfil |
| ------ | ------------------------ | ------ |
| GET    | /api/categorias          | Admin/Coordenador |
| POST   | /api/categorias          | Administrador |
| GET    | /api/categorias/:id      | Admin/Coordenador |
| PUT    | /api/categorias/:id      | Administrador |
| DELETE | /api/categorias/:id      | Administrador |
| POST   | /api/categorias/seed-ads | Administrador |

### Regras de Carga Horária

| Método | Rota                          | Perfil |
| ------ | ----------------------------- | ------ |
| GET    | /api/regras-carga-horaria     | Admin/Coordenador |
| POST   | /api/regras-carga-horaria     | Administrador |
| GET    | /api/regras-carga-horaria/:id | Admin/Coordenador |
| PUT    | /api/regras-carga-horaria/:id | Administrador |
| DELETE | /api/regras-carga-horaria/:id | Administrador |

### Configurações

| Método | Rota                      | Perfil |
| ------ | ------------------------- | ------ |
| GET    | /api/configuracoes        | Admin/Coordenador |
| GET    | /api/configuracoes/:chave | Admin/Coordenador |
| POST   | /api/configuracoes        | Administrador |

### Auditoria

| Método | Rota           | Perfil |
| ------ | -------------- | ------ |
| GET    | /api/auditoria | Administrador |

## Deploy no Render

Configuração recomendada:

- Build command: `npm install`
- Start command: `npm start`
- Node environment: production

Variáveis obrigatórias no Render:

- `MONGODB_URI`
- `JWT_SECRET`
- `CORS_ORIGIN`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `BREVO_API_KEY`
- `MAIL_FROM_EMAIL`
- `MAIL_FROM_NAME`

## Observações de Go Live

Antes de publicar:

- confirmar variáveis de ambiente;
- confirmar permissão de entrega de PDF/raw no Cloudinary;
- confirmar remetente validado na Brevo;
- testar login de administrador/coordenador;
- testar login de aluno;
- testar aluno com dois cursos;
- testar coordenador com dois cursos;
- testar submissão de atividade;
- testar aprovação/reprovação;
- testar recebimento de e-mail;
- testar download de PDF.

## Finalidade

Projeto acadêmico desenvolvido para a disciplina de Projeto Integrador.
