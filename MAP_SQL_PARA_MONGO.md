# Mapeamento da lógica SQL para MongoDB/Mongoose

## Relações traduzidas

### `perfil` + `usuario_perfil`
Viraram o campo `perfis: []` dentro de `Usuario`.

### `coordenador_curso`
Virou `cursosCoordenados: []` dentro de `Usuario`.

### `aluno_curso`
Virou `cursos: []` dentro de `Aluno`.

### `anexo_atividade`
Virou `anexos: []` embutido em `Atividade`.

### `historico_status_atividade`
Virou `historicoStatus: []` embutido em `Atividade`.

### `auditoria`
Permaneceu separada em coleção própria por motivo de segurança e rastreabilidade.

## Motivos dessa escolha
- evitar joins desnecessários
- manter atividade como agregado principal
- facilitar leitura de anexos e histórico junto com a atividade
- proteger a integridade da trilha de auditoria
