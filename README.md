🚀 # KORE - API de Gestão de Atividades Complementares
<p align="center"> <img src="https://img.shields.io/badge/Node.js-18+-green?logo=node.js"> <img src="https://img.shields.io/badge/Express.js-Framework-lightgrey?logo=express"> <img src="https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb"> <img src="https://img.shields.io/badge/Mongoose-ODM-red"> <img src="https://img.shields.io/badge/JWT-Autenticação-blue"> <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow"> </p>
📌 Sobre o Projeto

O KORE é uma API backend desenvolvida em Node.js + Express + MongoDB, com foco na gestão de atividades complementares no ambiente acadêmico.

O sistema implementa o fluxo completo de submissão, validação e auditoria, garantindo controle, rastreabilidade e aplicação de regras de negócio.

🎯 Objetivo

Substituir processos manuais e descentralizados por uma solução estruturada que permita:

📥 Submissão de atividades
✅ Validação por coordenadores
📊 Controle de carga horária
🔎 Rastreamento de decisões
🔐 Segurança e integridade dos dados
🧠 Modelo de Domínio

Baseado em um modelo relacional (SQL), adaptado para MongoDB:

👤 Usuários (perfis: administrador, coordenador)
🎓 Cursos
👨‍🎓 Alunos
📂 Categorias de atividade
📏 Regras de carga horária
📄 Atividades complementares
📎 Anexos
📜 Histórico de validações
🔍 Auditoria
⚙️ Configurações
🗂️ Estrutura do Banco (MongoDB)
Coleção	Descrição
usuarios	Usuários do sistema
cursos	Cursos acadêmicos
alunos	Alunos vinculados a cursos
categoriaatividades	Tipos de atividades
regracargahorarias	Regras por curso/categoria
statusatividades	Status possíveis
atividades	Atividades submetidas
auditorias	Log de ações
configuracaosistemas	Parâmetros do sistema
⚙️ Decisões Técnicas
📌 Embedding
anexos dentro de Atividade
historicoValidacoes dentro de Atividade
🔗 Referências (ObjectId)
Usuário, Curso, Aluno, Categoria
🔍 Auditoria
Separada → rastreabilidade completa
🔐 Segurança
🛡️ Helmet
🌐 CORS
🚫 Rate Limit
🔒 Mongo Sanitize
🔑 JWT Authentication
🔐 Bcrypt (hash de senha)
👥 Controle por perfil
📎 Validação de arquivos
🧾 Auditoria obrigatória
🔄 Fluxo do Sistema
📊 Regras de Negócio

✔ Atividade deve conter:

título, descrição, data
categoria
carga horária
anexo obrigatório

✔ Validação obrigatória por coordenador
✔ Reprovação exige justificativa
✔ Limite de carga por:

categoria
semestre

✔ Auditoria obrigatória
✔ Controle por perfil

🚀 Como Executar
1. Instalar dependências
npm install
2. Configurar .env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/kore
JWT_SECRET=sua_chave_super_secreta
JWT_EXPIRES_IN=1d
BCRYPT_SALT_ROUNDS=12
MAX_FILE_SIZE_BYTES=5242880
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png
CORS_ORIGIN=http://localhost:5173
3. Rodar seed
npm run seed
4. Subir API
npm run dev
🔑 Credenciais
Perfil	Email	Senha
Admin	admin@kore.com
	123456
📡 Rotas Principais
🔐 Auth
POST /api/auth/login
🎓 Cursos
GET /api/cursos
POST /api/cursos
👨‍🎓 Alunos
GET /api/alunos
POST /api/alunos
📂 Categorias
GET /api/categorias
POST /api/categorias
📏 Regras
GET /api/regras-carga-horaria
POST /api/regras-carga-horaria
📄 Atividades
GET /api/atividades
POST /api/atividades
PATCH /api/atividades/:id/status
🧪 Exemplo de Login
curl --request POST \
  --url http://localhost:3000/api/auth/login \
  --header 'Content-Type: application/json' \
  --data '{
    "email": "admin@kore.com",
    "senha": "123456"
  }'
📌 Observações
Modelo baseado em SQL original (referência de domínio)
Adaptado para MongoDB
Preparado para:
📱 Mobile (aluno)
🌐 PWA (coordenação)
📊 Dashboards
🧠 Diferencial

O KORE implementa:

✔ regras de negócio reais
✔ fluxo acadêmico completo
✔ auditoria e rastreabilidade
✔ controle por perfil
✔ validação contextual

👉 Não é apenas CRUD — é um sistema orientado a domínio.
