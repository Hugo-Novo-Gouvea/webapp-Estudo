-- ========================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS E DADOS INICIAIS
-- ========================================
-- Este script cria o banco de dados WebAppEstudo, a tabela Clientes
-- e insere 10 registros de exemplo para testes.
-- 
-- Execute este script no SQL Server Management Studio (SSMS) ou Azure Data Studio.
-- 
-- IMPORTANTE: Execute todo o script de uma vez (selecione tudo e pressione F5)
-- ========================================

USE master;
GO

-- ========================================
-- PASSO 1: CRIAR O BANCO DE DADOS
-- ========================================

-- Verifica se o banco de dados já existe
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'WebAppEstudo')
BEGIN
    CREATE DATABASE WebAppEstudo;
    PRINT '✓ Banco de dados WebAppEstudo criado com sucesso.';
END
ELSE
BEGIN
    PRINT '⚠ Banco de dados WebAppEstudo já existe.';
END;
GO

-- Usa o banco de dados recém-criado
USE WebAppEstudo;
GO

-- ========================================
-- PASSO 2: CRIAR A TABELA CLIENTES
-- ========================================

-- Verifica se a tabela já existe
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[clientes]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[clientes] (
        -- Chave primária: identificador único auto-incrementado
        [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        
        -- Dados do cliente
        [nome] NVARCHAR(200) NOT NULL,
        [endereco] NVARCHAR(200) NULL,
        [idade] INT NULL CHECK ([idade] >= 0 AND [idade] <= 150),
        [telefone] NVARCHAR(30) NULL,
        
        -- Campos de controle e auditoria
        [dataCadastro] DATETIME2(0) NOT NULL DEFAULT GETDATE(),
        [dataUltimoRegistro] DATETIME2(0) NOT NULL DEFAULT GETDATE(),
        
        -- Soft delete: permite exclusão lógica sem perder dados
        [deletado] BIT NOT NULL DEFAULT 0
    );
    
    PRINT '✓ Tabela [dbo].[clientes] criada com sucesso.';
END
ELSE
BEGIN
    PRINT '⚠ Tabela [dbo].[clientes] já existe.';
END;
GO

-- ========================================
-- PASSO 3: CRIAR ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índice na coluna 'nome' para otimizar buscas por nome
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Clientes_Nome' AND object_id = OBJECT_ID('dbo.clientes'))
BEGIN
    CREATE INDEX IX_Clientes_Nome ON [dbo].[clientes]([nome]);
    PRINT '✓ Índice IX_Clientes_Nome criado.';
END;

-- Índice na coluna 'deletado' para otimizar filtros de registros ativos
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Clientes_Deletado' AND object_id = OBJECT_ID('dbo.clientes'))
BEGIN
    CREATE INDEX IX_Clientes_Deletado ON [dbo].[clientes]([deletado]);
    PRINT '✓ Índice IX_Clientes_Deletado criado.';
END;

-- Índice composto (nome + deletado) para otimizar buscas por nome em registros ativos
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Clientes_Nome_Deletado' AND object_id = OBJECT_ID('dbo.clientes'))
BEGIN
    CREATE INDEX IX_Clientes_Nome_Deletado ON [dbo].[clientes]([nome], [deletado]);
    PRINT '✓ Índice IX_Clientes_Nome_Deletado criado.';
END;
GO

-- ========================================
-- PASSO 4: INSERIR DADOS INICIAIS (10 REGISTROS)
-- ========================================

-- Verifica se a tabela já possui dados
IF NOT EXISTS (SELECT * FROM [dbo].[clientes])
BEGIN
    -- Insere 10 clientes de exemplo com dados variados
    INSERT INTO [dbo].[clientes] 
        ([nome], [endereco], [idade], [telefone], [dataCadastro], [dataUltimoRegistro], [deletado])
    VALUES 
        -- Cliente 1: Dados completos
        (N'João Silva Santos', N'Rua das Flores, 123 - Centro', 35, N'(11) 98765-4321', GETDATE(), GETDATE(), 0),
        
        -- Cliente 2: Dados completos
        (N'Maria Oliveira Costa', N'Av. Paulista, 1000 - Bela Vista', 28, N'(11) 91234-5678', GETDATE(), GETDATE(), 0),
        
        -- Cliente 3: Sem endereço
        (N'Pedro Henrique Almeida', NULL, 42, N'(11) 99876-5432', GETDATE(), GETDATE(), 0),
        
        -- Cliente 4: Sem idade e telefone
        (N'Ana Paula Rodrigues', N'Rua Augusta, 500 - Consolação', NULL, NULL, GETDATE(), GETDATE(), 0),
        
        -- Cliente 5: Dados completos
        (N'Carlos Eduardo Ferreira', N'Rua dos Três Irmãos, 250 - Vila Progredior', 55, N'(11) 97654-3210', GETDATE(), GETDATE(), 0),
        
        -- Cliente 6: Jovem com dados completos
        (N'Juliana Martins Souza', N'Av. Brigadeiro Faria Lima, 3000 - Itaim Bibi', 22, N'(11) 96543-2109', GETDATE(), GETDATE(), 0),
        
        -- Cliente 7: Idoso sem telefone
        (N'Roberto Carlos Mendes', N'Rua da Consolação, 1500 - Consolação', 68, NULL, GETDATE(), GETDATE(), 0),
        
        -- Cliente 8: Sem endereço e idade
        (N'Fernanda Lima Barbosa', NULL, NULL, N'(11) 95432-1098', GETDATE(), GETDATE(), 0),
        
        -- Cliente 9: Dados completos
        (N'Ricardo Pereira Gomes', N'Rua Oscar Freire, 800 - Jardins', 31, N'(11) 94321-0987', GETDATE(), GETDATE(), 0),
        
        -- Cliente 10: Dados completos
        (N'Patrícia Santos Oliveira', N'Av. Rebouças, 2500 - Pinheiros', 45, N'(11) 93210-9876', GETDATE(), GETDATE(), 0);
    
    PRINT '✓ 10 clientes de exemplo inseridos com sucesso.';
END
ELSE
BEGIN
    PRINT '⚠ A tabela já contém dados. Nenhum registro foi inserido.';
END;
GO

-- ========================================
-- PASSO 5: VERIFICAR OS DADOS INSERIDOS
-- ========================================

-- Exibe todos os clientes não deletados
PRINT '';
PRINT '========================================';
PRINT 'CLIENTES CADASTRADOS (NÃO DELETADOS):';
PRINT '========================================';
SELECT 
    [id] AS 'ID',
    [nome] AS 'Nome',
    [endereco] AS 'Endereço',
    [idade] AS 'Idade',
    [telefone] AS 'Telefone',
    [dataCadastro] AS 'Data Cadastro',
    [dataUltimoRegistro] AS 'Último Registro',
    [deletado] AS 'Deletado'
FROM [dbo].[clientes]
WHERE [deletado] = 0
ORDER BY [nome];
GO

-- Exibe estatísticas da tabela
PRINT '';
PRINT '========================================';
PRINT 'ESTATÍSTICAS:';
PRINT '========================================';
SELECT 
    COUNT(*) AS 'Total de Clientes',
    SUM(CASE WHEN [deletado] = 0 THEN 1 ELSE 0 END) AS 'Clientes Ativos',
    SUM(CASE WHEN [deletado] = 1 THEN 1 ELSE 0 END) AS 'Clientes Deletados',
    AVG([idade]) AS 'Idade Média',
    MIN([idade]) AS 'Idade Mínima',
    MAX([idade]) AS 'Idade Máxima'
FROM [dbo].[clientes];
GO

PRINT '';
PRINT '========================================';
PRINT '✓ SCRIPT EXECUTADO COM SUCESSO!';
PRINT '========================================';
PRINT 'O banco de dados está pronto para uso.';
PRINT 'Você pode agora executar o projeto WebAppEstudo.';
PRINT '';
