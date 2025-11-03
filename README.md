# WebAppEstudo

Projeto de estudo para criar um **web app local** (arquitetura híbrida) usando ASP.NET Core + SQL Server Express.  
A ideia é: o back-end roda na máquina (Kestrel) e serve páginas web (`wwwroot`) que consomem uma API (`/api/clientes`) ligada ao banco criado no SSMS.

## Objetivo atual

- Banco criado no **SQL Server Express**: `WebAppEstudo`
- Tabela: `Clientes (Id, Nome, Cpf, Telefone)`
- API mínima em .NET respondendo em: `GET /api/clientes`
- Front-end simples servido pelo próprio projeto em `wwwroot/` (acessível em `http://localhost:<porta>`)

## Pré-requisitos

- .NET SDK instalado (`dotnet --version`)
- SQL Server Express instalado e rodando
- SSMS para criar o banco

## Passos já feitos

### 1. Criar banco e tabela no SSMS

```sql
CREATE DATABASE WebAppEstudo;
GO

USE WebAppEstudo;
GO

CREATE TABLE Clientes (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nome NVARCHAR(150) NOT NULL,
    Cpf NVARCHAR(20) NULL,
    Telefone NVARCHAR(20) NULL
);
```

### 2. Criar banco e tabela no SSMS