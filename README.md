# WebApp-Estudo

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

```bash
dotnet new web
```

### 3. Instalar pacotes do Entity Framework Core para SQL Server

```bash
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
```

### 4. Instalar pacotes do Entity Framework Core para SQL Server

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.\\SQLEXPRESS;Database=WebAppEstudo;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

### 5. Criar o DbContext e a entidade em Data/AppDbContext.cs

```csharp
using Microsoft.EntityFrameworkCore;

namespace WebAppEstudo.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Cliente> Clientes => Set<Cliente>();
    }

    public class Cliente
    {
        public int Id { get; set; }
        public string Nome { get; set; } = "";
        public string? Cpf { get; set; }
        public string? Telefone { get; set; }
    }
}
```

### 6. Registrar o DbContext e criar o endpoint em Program.cs

```csharp
using Microsoft.EntityFrameworkCore;
using WebAppEstudo.Data;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/api/clientes", async (AppDbContext db) =>
    await db.Clientes.ToListAsync());

app.Run();
```

### 7. Criar a pasta wwwroot e o index.html

```html
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Menu</title>
</head>
<body>
  <h1>Web App Estudo</h1>
  <a href="clientes.html">Ir para clientes</a>
</body>
</html>
```

### 8. Criar wwwroot/clientes.html para consumir a API

```html
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Clientes</title>
</head>
<body>
  <h1>Clientes</h1>
  <table border="1" id="tb">
    <thead>
      <tr>
        <th>ID</th>
        <th>Nome</th>
        <th>CPF</th>
        <th>Telefone</th>
      </tr>
    </thead>
    <tbody></tbody>
  </table>

  <script>
    fetch('/api/clientes')
      .then(r => r.json())
      .then(clientes => {
        const tbody = document.querySelector('#tb tbody');
        clientes.forEach(c => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${c.id}</td>
            <td>${c.nome}</td>
            <td>${c.cpf ?? ''}</td>
            <td>${c.telefone ?? ''}</td>
          `;
          tbody.appendChild(tr);
        });
      });
  </script>
</body>
</html>
```

### 9. Rodar o projeto

```bash
dotnet run
```

Acessar no navegador:

http://localhost:<porta>/

http://localhost:<porta>/clientes.html


http://localhost:<porta>/api/clientes
