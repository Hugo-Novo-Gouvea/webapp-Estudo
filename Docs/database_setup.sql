-- ========================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS
-- ========================================
-- Este script cria o banco de dados WebAppEstudo e a tabela Clientes.
-- Execute este script no SQL Server Management Studio (SSMS) ou Azure Data Studio.

-- Cria o banco de dados se ele não existir
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'WebAppEstudo')
BEGIN
    CREATE DATABASE WebAppEstudo;
    PRINT 'Banco de dados WebAppEstudo criado com sucesso.';
END
ELSE
BEGIN
    PRINT 'Banco de dados WebAppEstudo já existe.';
END;
GO

-- Usa o banco de dados recém-criado
USE WebAppEstudo;
GO

-- Cria a tabela de Clientes se ela não existir
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Clientes' and xtype='U')
BEGIN
    CREATE TABLE Clientes (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Nome NVARCHAR(200) NOT NULL,
        Endereco NVARCHAR(200) NULL,
        Idade INT NULL CHECK (Idade >= 0 AND Idade <= 150),
        Telefone NVARCHAR(30) NULL,
        Ativo BIT NOT NULL DEFAULT 1,
        DataCadastro DATETIME NOT NULL DEFAULT GETDATE()
    );
    
    -- Cria índices para melhorar a performance de buscas
    CREATE INDEX IX_Clientes_Nome ON Clientes(Nome);
    CREATE INDEX IX_Clientes_Ativo ON Clientes(Ativo);
    
    PRINT 'Tabela Clientes criada com sucesso.';
END
ELSE
BEGIN
    PRINT 'Tabela Clientes já existe.';
END;
GO

-- Insere alguns dados de exemplo (opcional)
IF NOT EXISTS (SELECT * FROM Clientes)
BEGIN
    INSERT INTO Clientes (Nome, Endereco, Idade, Telefone, Ativo, DataCadastro)
    VALUES 
        ('João Silva', 'Rua das Flores, 123', 35, '(11) 98765-4321', 1, GETDATE()),
        ('Maria Santos', 'Av. Paulista, 1000', 28, '(11) 91234-5678', 1, GETDATE()),
        ('Pedro Oliveira', 'Rua Augusta, 500', 42, '(11) 99876-5432', 1, GETDATE());
    
    PRINT 'Dados de exemplo inseridos com sucesso.';
END;
GO

-- Exibe os dados da tabela
SELECT * FROM Clientes;
GO
