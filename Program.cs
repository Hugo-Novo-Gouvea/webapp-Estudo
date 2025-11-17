using Microsoft.EntityFrameworkCore;
using WebAppEstudo.Data;
using WebAppEstudo.Endpoints;

// ========================================
// CONFIGURAÇÃO DO BUILDER
// ========================================

// O WebApplicationBuilder é usado para configurar os serviços e a aplicação antes de construí-la.
var builder = WebApplication.CreateBuilder(args);

// Obtém a connection string do arquivo de configuração (appsettings.json ou User Secrets).
// Se a connection string não for encontrada, uma exceção é lançada para evitar erros silenciosos.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' não encontrada.");

// Registra o AppDbContext no sistema de injeção de dependências do ASP.NET Core.
// O DbContext será criado automaticamente para cada requisição e injetado nos endpoints.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString)); // Configura o EF Core para usar SQL Server

// ========================================
// CONSTRUÇÃO DA APLICAÇÃO
// ========================================

// Constrói a aplicação com base nas configurações do builder.
var app = builder.Build();

// ========================================
// CONFIGURAÇÃO DO PIPELINE DE REQUISIÇÕES
// ========================================

// UseDefaultFiles: Configura o servidor para servir arquivos padrão (como index.html)
// quando o usuário acessa a raiz do site (ex: http://localhost:5000/).
app.UseDefaultFiles();

// UseStaticFiles: Habilita o servidor a servir arquivos estáticos da pasta wwwroot
// (HTML, CSS, JavaScript, imagens, etc.).
app.UseStaticFiles();

// ========================================
// MAPEAMENTO DOS ENDPOINTS DA API
// ========================================

// Chama o método de extensão que registra todos os endpoints relacionados a Clientes.
// Isso mantém o Program.cs limpo e organiza os endpoints em arquivos separados.
app.MapClientesEndpoints();

// ========================================
// INICIALIZAÇÃO DO SERVIDOR
// ========================================

// Inicia o servidor Kestrel e começa a escutar as requisições HTTP.
// A aplicação ficará em execução até ser interrompida (Ctrl+C).
app.Run();
