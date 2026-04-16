# 🚀 KORE - API de Gestão de Atividades Complementares

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-green?logo=node.js">
  <img src="https://img.shields.io/badge/Express.js-Framework-lightgrey?logo=express">
  <img src="https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb">
  <img src="https://img.shields.io/badge/Mongoose-ODM-red">
  <img src="https://img.shields.io/badge/JWT-Autenticação-blue">
  <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow">
</p>

---

## 📌 Sobre o Projeto

O KORE é uma API backend desenvolvida em **Node.js + Express + MongoDB**, com foco na gestão de atividades complementares no ambiente acadêmico.

O sistema implementa o fluxo completo de:
- submissão
- validação
- auditoria

Garantindo controle, rastreabilidade e aplicação de regras de negócio.

---

## 🎯 Objetivo

Substituir processos manuais por uma solução estruturada que permita:

- 📥 Submissão de atividades  
- ✅ Validação por coordenadores  
- 📊 Controle de carga horária  
- 🔎 Rastreamento de decisões  
- 🔐 Segurança e integridade dos dados  

---

## 🧠 Modelo de Domínio

Baseado em modelo relacional (SQL), adaptado para MongoDB:

- 👤 Usuários (administrador, coordenador)
- 🎓 Cursos
- 👨‍🎓 Alunos
- 📂 Categorias de atividade
- 📏 Regras de carga horária
- 📄 Atividades complementares
- 📎 Anexos
- 📜 Histórico de validações
- 🔍 Auditoria
- ⚙️ Configurações

---

## 🗂️ Estrutura do Banco (MongoDB)

| Coleção | Descrição |
|--------|----------|
| usuarios | Usuários do sistema |
| cursos | Cursos acadêmicos |
| alunos | Alunos vinculados |
| categoriaatividades | Tipos de atividade |
| regracargahorarias | Regras de carga |
| statusatividades | Status |
| atividades | Atividades |
| auditorias | Log |
| configuracaosistemas | Configurações |

---

## ⚙️ Decisões Técnicas

### 📌 Embedding
- anexos dentro de Atividade  
- historicoValidacoes dentro de Atividade  

### 🔗 Referências
- Usuário  
- Curso  
- Aluno  
- Categoria  

### 🔍 Auditoria
- coleção separada → rastreabilidade completa  

---

## 🔐 Segurança

- Helmet  
- CORS  
- Rate Limit  
- Mongo Sanitize  
- JWT Authentication  
- Bcrypt (hash de senha)  
- Controle por perfil  
- Validação de arquivos  
- Auditoria obrigatória  

---

## 🔄 Fluxo do Sistema

1. Cadastro de curso, categoria e regras  
2. Cadastro de aluno  
3. Submissão de atividade  
4. Validação (aprovação ou reprovação)  
5. Registro em histórico e auditoria  

---

## 📊 Regras de Negócio

✔ Atividade deve conter:
- título  
- descrição  
- data  
- categoria  
- carga horária  
- anexo obrigatório  

✔ Validação obrigatória por coordenador  
✔ Reprovação exige justificativa  
✔ Limite de carga por:
- categoria  
- semestre  

✔ Auditoria obrigatória  
✔ Controle por perfil  

---

## 🚀 Como Executar

### 1. Instalar dependências
```bash
npm install

### 2. Configurar .env

PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/kore
JWT_SECRET=sua_chave_super_secreta
JWT_EXPIRES_IN=1d
BCRYPT_SALT_ROUNDS=12
MAX_FILE_SIZE_BYTES=5242880
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png
CORS_ORIGIN=http://localhost:5173

### 3. Configurar .env
npm run seed

### 4. Subir API

🔑 Credenciais
| Perfil | Email                                   | Senha  |
| ------ | --------------------------------------- | ------ |
| Admin  | [admin@kore.com](mailto:admin@kore.com) | 123456 |

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

🧪 ### Exemplo de Login
curl --request POST \
  --url http://localhost:3000/api/auth/login \
  --header 'Content-Type: application/json' \
  --data '{
    "email": "admin@kore.com",
    "senha": "123456"
  }'

📌 ### Observações
Modelo baseado em SQL original
Adaptado para MongoDB
Preparado para:
Mobile (aluno)
PWA (coordenação)
Dashboards

### Diferencial
✔ Regras de negócio reais
✔ Fluxo acadêmico completo
✔ Auditoria e rastreabilidade
✔ Controle por perfil
✔ Validação contextual
