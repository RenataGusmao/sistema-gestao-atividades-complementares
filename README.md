# KORE — Backend API

Sistema de Gestão de Atividades Complementares desenvolvido em Node.js, Express e MongoDB.

O projeto foi construído com foco em:

* organização acadêmica;
* validação de atividades complementares;
* rastreabilidade;
* auditoria;
* autenticação segura;
* integração entre frontend e backend.

---

# 📌 Objetivo do Projeto

O KORE foi desenvolvido para auxiliar instituições de ensino no gerenciamento de atividades complementares realizadas pelos alunos.

O sistema permite:

* cadastro e gerenciamento de usuários;
* gerenciamento de cursos;
* gerenciamento de alunos;
* gerenciamento de categorias;
* envio de atividades complementares;
* upload de certificados;
* validação de atividades;
* auditoria de ações realizadas no sistema;
* controle de status das atividades.

---

# 🏗️ Arquitetura do Projeto

O backend segue uma arquitetura baseada em separação de responsabilidades.

## Estrutura principal

```bash
src/
 ├── config/
 ├── controllers/
 ├── middlewares/
 ├── models/
 ├── routes/
 ├── services/
 ├── utils/
 ├── uploads/
 ├── app.js
 └── server.js
```

---

# 📂 Explicação das Pastas

## 📁 config/

Responsável pelas configurações do sistema.

Exemplo:

* conexão com MongoDB;
* variáveis de ambiente;
* configurações globais.

---

## 📁 controllers/

Contém as regras de negócio da aplicação.

Os controllers:

* recebem a requisição;
* processam os dados;
* validam informações;
* chamam models;
* retornam respostas.

Exemplo:

```js
async function criarCurso(req, res) {
```

---

## 📁 middlewares/

Executam regras entre a requisição e a resposta.

Exemplos:

* autenticação JWT;
* validação de permissões;
* tratamento de erros;
* upload de arquivos;
* sanitização.

---

## 📁 models/

Representam as coleções do MongoDB.

Os models definem:

* estrutura dos dados;
* tipos;
* validações;
* relacionamentos.

Exemplo:

```js
const CursoSchema = new mongoose.Schema({
```

---

## 📁 routes/

Definem os endpoints da API.

Exemplo:

```js
router.post('/login', login)
```

As rotas apenas direcionam as requisições.

---

## 📁 uploads/

Pasta responsável por armazenar arquivos enviados.

Exemplos:

* certificados PDF;
* imagens;
* documentos.

---

# ⚙️ app.js e server.js

## 📌 app.js

Responsável pela configuração principal da aplicação.

Nele ficam:

* middlewares;
* rotas;
* CORS;
* Helmet;
* logs;
* tratamento de erros.

O app.js NÃO inicia o servidor.

---

## 📌 server.js

Responsável por:

* carregar variáveis de ambiente;
* conectar ao banco;
* iniciar o servidor.

Exemplo:

```js
app.listen(PORT)
```

---

# 🛠️ Tecnologias Utilizadas

## Backend

* Node.js
* Express
* MongoDB Atlas
* Mongoose

## Segurança

* JWT
* Helmet
* express-mongo-sanitize
* Rate Limit
* CORS

## Uploads

* Multer

## Utilitários

* dotenv
* morgan
* nodemon

---

# 🔐 Autenticação

O sistema utiliza autenticação JWT.

## Fluxo

1. Usuário realiza login;
2. Backend valida credenciais;
3. Backend gera token JWT;
4. Frontend armazena token;
5. Token é enviado nas rotas protegidas.

---

## Exemplo de Header

```http
Authorization: Bearer TOKEN
```

---

# 👥 Perfis do Sistema

## Administrador

Responsável por:

* gerenciar usuários;
* gerenciar cursos;
* gerenciar categorias;
* visualizar auditoria.

---

## Coordenador

Responsável por:

* validar atividades;
* aprovar atividades;
* reprovar atividades;
* acompanhar alunos.

---

## Aluno

Responsável por:

* enviar atividades;
* anexar certificados;
* acompanhar status.

---

# 📚 Regras de Negócio

## 📌 Atividades Complementares

Cada atividade deve possuir:

* título;
* descrição;
* categoria;
* carga horária;
* data;
* arquivo.

---

## 📌 Status possíveis

* Enviada
* Aprovada
* Reprovada

---

## 📌 Uploads

O sistema valida:

* tipo do arquivo;
* tamanho máximo;
* extensões permitidas.

Formatos aceitos:

* PDF
* JPG
* JPEG
* PNG

---

## 📌 Auditoria

O sistema registra ações importantes.

Exemplos:

* criação;
* edição;
* exclusão;
* aprovação;
* reprovação.

Objetivo:

* rastreabilidade;
* segurança;
* histórico.

---

# 🗄️ Banco de Dados

O projeto utiliza MongoDB Atlas.

A modelagem foi adaptada de um modelo relacional para MongoDB.

---

# 📌 Principais Coleções

## Usuários

Armazena:

* nome;
* email;
* senha criptografada;
* perfil.

---

## Cursos

Armazena:

* nome;
* código;
* carga horária.

---

## Alunos

Armazena:

* matrícula;
* vínculo com curso;
* dados pessoais.

---

## Categorias

Armazena:

* nome da categoria;
* limite de horas.

---

## Atividades

Armazena:

* atividade enviada;
* certificado;
* status;
* histórico.

---

# 📡 Rotas Principais

## 🔐 Auth

| Método | Rota            |
| ------ | --------------- |
| POST   | /api/auth/login |

---

## 📚 Cursos

| Método | Rota            |
| ------ | --------------- |
| GET    | /api/cursos     |
| POST   | /api/cursos     |
| PUT    | /api/cursos/:id |
| DELETE | /api/cursos/:id |

---

## 👨‍🎓 Alunos

| Método | Rota            |
| ------ | --------------- |
| GET    | /api/alunos     |
| POST   | /api/alunos     |
| PUT    | /api/alunos/:id |
| DELETE | /api/alunos/:id |

---

## 📝 Atividades

| Método | Rota                       |
| ------ | -------------------------- |
| POST   | /api/atividades            |
| GET    | /api/atividades            |
| PUT    | /api/atividades/:id/status |

---

# 📂 Upload de Arquivos

O upload é realizado utilizando Multer.

## Funcionamento

1. Usuário envia arquivo;
2. Backend valida tipo;
3. Backend valida tamanho;
4. Arquivo é salvo em `/uploads`;
5. Dados são registrados no banco.

---

# 🧪 Testes da API

Os testes podem ser realizados utilizando:

* Insomnia;
* Postman.

---

# ▶️ Como Executar o Projeto

## 1. Clonar repositório

```bash
git clone URL_DO_REPOSITORIO
```

---

## 2. Instalar dependências

```bash
npm install
```

---

## 3. Criar arquivo .env

```env
PORT=3000
MONGO_URI=URL_MONGODB
JWT_SECRET=SUA_CHAVE
```

---

## 4. Executar projeto

```bash
npm run dev
```

---

# 🌐 Deploy

O backend foi preparado para deploy em serviços como:

* Render;
* Railway;
* Vercel Serverless;
* Cyclic.

---

# 🔒 Segurança Implementada

## Helmet

Protege headers HTTP.

---

## Rate Limit

Evita excesso de requisições.

---

## Mongo Sanitize

Evita ataques NoSQL Injection.

---

## JWT

Protege rotas privadas.

---

# 📈 Melhorias Futuras

* envio automático de e-mails;
* dashboard analítico;
* notificações em tempo real;
* logs avançados;
* recuperação de senha;
* integração com sistema acadêmico.

---

# 👨‍💻 Equipe

Projeto desenvolvido para a disciplina de Projeto Integrador.

---

# 📄 Licença

Este projeto possui finalidade acadêmica.
