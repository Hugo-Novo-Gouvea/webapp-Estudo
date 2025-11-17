# Campos do Sistema - Tabela Clientes

Este documento descreve os campos de controle e auditoria gerenciados automaticamente pelo sistema na tabela `clientes`.

## Estrutura Completa da Tabela

A tabela `clientes` possui os seguintes campos:

### Campos de Dados do Cliente (Editáveis pelo Usuário)

| Campo      | Tipo           | Obrigatório | Descrição                                    |
|------------|----------------|-------------|----------------------------------------------|
| `id`       | INT            | Sim (PK)    | Identificador único (auto-incremento)        |
| `nome`     | NVARCHAR(200)  | Sim         | Nome completo do cliente                     |
| `endereco` | NVARCHAR(200)  | Não         | Endereço residencial ou comercial            |
| `idade`    | INT            | Não         | Idade do cliente (0-150)                     |
| `telefone` | NVARCHAR(30)   | Não         | Número de telefone com formatação            |

### Campos de Controle do Sistema (Gerenciados Automaticamente)

| Campo                  | Tipo          | Valor Padrão | Descrição                                              |
|------------------------|---------------|--------------|--------------------------------------------------------|
| `dataCadastro`         | DATETIME2(0)  | GETDATE()    | Data e hora de criação do registro                     |
| `dataUltimoRegistro`   | DATETIME2(0)  | GETDATE()    | Data e hora da última modificação                      |
| `deletado`             | BIT           | 0 (false)    | Indica se o registro foi excluído logicamente          |

## Comportamento dos Campos do Sistema

### 1. Campo `dataCadastro`

**Quando é definido:**
- Apenas no momento da **criação** do cliente
- Definido automaticamente pelo backend com `DateTime.UtcNow`

**Quando é atualizado:**
- **Nunca** - este campo é imutável após a criação

**Visibilidade:**
- ❌ **Não é exibido** no formulário de edição
- ✅ **É exibido** no modal de visualização de detalhes
- ❌ **Não é incluído** nos DTOs de criação e edição

### 2. Campo `dataUltimoRegistro`

**Quando é definido:**
- No momento da **criação** do cliente (igual a `dataCadastro`)

**Quando é atualizado:**
- Sempre que o cliente é **criado**
- Sempre que o cliente é **editado** (PUT)
- Sempre que o cliente é **deletado** (DELETE - soft delete)
- Atualizado automaticamente pelo backend com `DateTime.UtcNow`

**Visibilidade:**
- ❌ **Não é exibido** no formulário de edição
- ✅ **É exibido** no modal de visualização de detalhes
- ❌ **Não é incluído** nos DTOs de criação e edição

### 3. Campo `deletado`

**Quando é definido:**
- No momento da **criação** do cliente com valor `false`

**Quando é atualizado:**
- Passa de `false` para `true` quando o cliente é **excluído** (soft delete)
- Não retorna para `false` em operações normais (mas pode ser restaurado manualmente no banco)

**Visibilidade:**
- ❌ **Não é exibido** em nenhuma interface do usuário
- ❌ **Não é incluído** em nenhum DTO
- Usado internamente pelo filtro global do Entity Framework Core

**Comportamento:**
- Registros com `deletado = true` não aparecem nas listagens
- O filtro global no `AppDbContext` automaticamente exclui registros deletados
- Para incluir registros deletados em consultas, é necessário usar `.IgnoreQueryFilters()`

## Implementação no Backend

### Endpoint POST (Criar Cliente)

```csharp
var agora = DateTime.UtcNow;
var entity = new Cliente
{
    // ... campos do usuário ...
    DataCadastro = agora,
    DataUltimoRegistro = agora,
    Deletado = false
};
```

### Endpoint PUT (Atualizar Cliente)

```csharp
// Atualiza apenas campos editáveis
c.Nome = dto.Nome;
c.Endereco = dto.Endereco;
c.Idade = dto.Idade;
c.Telefone = dto.Telefone;
c.DataUltimoRegistro = DateTime.UtcNow; // ✅ Atualizado automaticamente
```

### Endpoint DELETE (Soft Delete)

```csharp
c.Deletado = true; // ✅ Marca como deletado
c.DataUltimoRegistro = DateTime.UtcNow; // ✅ Registra quando foi deletado
// Não remove fisicamente do banco
```

## Implementação no Frontend

### Modal de Visualização

Exibe **todos os campos**, incluindo os de controle:

- ID
- Nome
- Endereço
- Idade
- Telefone
- **Data de Cadastro** (formatada em pt-BR)
- **Último Registro** (formatada em pt-BR)

### Modal de Edição

Exibe **apenas campos editáveis**:

- Nome
- Endereço
- Idade
- Telefone

Os campos `dataCadastro`, `dataUltimoRegistro` e `deletado` **não são exibidos** e **não podem ser editados** pelo usuário.

### Modal de Novo Cliente

Exibe **apenas campos fornecidos pelo usuário**:

- Nome
- Endereço
- Idade
- Telefone

Os campos do sistema são criados automaticamente pelo backend.

## Benefícios desta Arquitetura

### Auditoria Automática
- Rastreamento completo de quando cada registro foi criado e modificado
- Útil para conformidade, debugging e análise de dados

### Soft Delete
- Registros nunca são perdidos permanentemente
- Possibilidade de recuperação de dados excluídos acidentalmente
- Mantém integridade referencial em sistemas maiores

### Segurança
- Usuários não podem manipular datas de auditoria
- Campos de controle são gerenciados exclusivamente pelo backend
- Previne adulteração de registros históricos

### Simplicidade
- Interface limpa sem campos técnicos desnecessários
- Usuários focam apenas nos dados de negócio
- Sistema cuida automaticamente dos metadados

## Consultas SQL Úteis

### Ver todos os clientes (incluindo deletados)

```sql
SELECT * FROM dbo.clientes WITH (NOLOCK);
```

### Ver apenas clientes ativos

```sql
SELECT * FROM dbo.clientes WHERE deletado = 0;
```

### Ver apenas clientes deletados

```sql
SELECT * FROM dbo.clientes WHERE deletado = 1;
```

### Restaurar um cliente deletado

```sql
UPDATE dbo.clientes 
SET deletado = 0, 
    dataUltimoRegistro = GETDATE() 
WHERE id = <ID_DO_CLIENTE>;
```

### Ver histórico de modificações (ordenado por última modificação)

```sql
SELECT 
    id, 
    nome, 
    dataCadastro AS 'Criado em', 
    dataUltimoRegistro AS 'Modificado em',
    DATEDIFF(SECOND, dataCadastro, dataUltimoRegistro) AS 'Tempo de vida (segundos)',
    deletado AS 'Deletado'
FROM dbo.clientes
ORDER BY dataUltimoRegistro DESC;
```
