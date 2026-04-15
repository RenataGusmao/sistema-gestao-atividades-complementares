# KORE - API Node.js + MongoDB + Mongoose

Projeto backend adaptado da lógica do banco relacional enviado para o KORE, mas modelado para **MongoDB** com **Mongoose**, priorizando segurança, validação e rastreabilidade.

## O que foi preservado da lógica original

A estrutura considera as entidades e regras do script SQL original:
- usuários e perfis
- cursos
- alunos e vínculo com curso
- categorias de atividade
- regras de carga horária por curso/categoria
- status de atividade
- atividades complementares
- anexos
- histórico de status
- auditoria obrigatória
- configurações do sistema

## Principais decisões de modelagem MongoDB

### Coleções principais
- `usuarios`
- `cursos`
- `alunos`
- `categoriasatividades`
- `regrascargahorarias`
- `statusatividades`
- `atividades`
- `auditorias`
- `configuracaosistemas`

### Embedding e referências
- `anexos` e `historicoStatus` foram embutidos em `Atividade`
- `Usuario`, `Curso`, `Aluno`, `CategoriaAtividade`, `StatusAtividade` permanecem referenciados por `ObjectId`
- `Auditoria` ficou em coleção separada para trilha de auditoria e segurança

## Segurança implementada

- `helmet`
- `cors`
- `express-rate-limit`
- `express-mongo-sanitize`
- hash de senha com `bcryptjs`
- autenticação com `JWT`
- autorização por perfil (`aluno`, `coordenador`, `administrador`)
- validação de upload por extensão e tamanho
- trilha de auditoria para cadastro, login, atualização, aprovação e reprovação

## Como rodar

### 1. Instalar dependências
```bash
npm install
```

### 2. Criar arquivo `.env`
Copie `.env.example` para `.env` e ajuste:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/kore
JWT_SECRET=troque_esta_chave_por_uma_bem_forte
JWT_EXPIRES_IN=1d
BCRYPT_SALT_ROUNDS=12
MAX_FILE_SIZE_BYTES=5242880
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png
CORS_ORIGIN=http://localhost:5173
```

### 3. Executar seed inicial
```bash
npm run seed
```

### 4. Subir a API
```bash
npm run dev
```
ou
```bash
npm start
```

## Credenciais seed
- Admin: `admin@kore.local` / `Admin@123`
- Coordenador: `coordenador@kore.local` / `Coord@123`

## Rotas principais

### Autenticação
- `POST /api/auth/register`
- `POST /api/auth/login`

### Usuários
- `GET /api/usuarios`
- `GET /api/usuarios/:id`
- `PATCH /api/usuarios/:id`

### Cursos
- `GET /api/cursos`
- `POST /api/cursos`
- `PATCH /api/cursos/:id`

### Alunos
- `GET /api/alunos`
- `POST /api/alunos`
- `GET /api/alunos/:id`

### Atividades
- `GET /api/atividades`
- `POST /api/atividades`
- `PATCH /api/atividades/:id/status`

### Configurações
- `GET /api/configuracoes`
- `POST /api/configuracoes`

## Exemplo de login
```bash
curl --request POST \
  --url http://localhost:3000/api/auth/login \
  --header 'Content-Type: application/json' \
  --data '{
    "email": "admin@kore.local",
    "senha": "Admin@123"
  }'
```

## Exemplo de criação de atividade com anexos
Use `multipart/form-data`, campo `anexos`.

## Observações importantes
- O arquivo `Script_Create_SQL.sql` foi mantido no projeto para rastrear a lógica de origem.
- Como o destino final é MongoDB, o script SQL serve como base de domínio e não como mecanismo de persistência.
- O projeto foi preparado para crescer com novos módulos, validações e integração com frontend/PWA.
