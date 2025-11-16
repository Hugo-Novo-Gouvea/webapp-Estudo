using Microsoft.EntityFrameworkCore;
using WebAppEstudo.Data;

var builder = WebApplication.CreateBuilder(args);

// pega a connection string do appsettings
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// registra o DbContext usando SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

var app = builder.Build();

app.UseDefaultFiles(); // procura index.html
app.UseStaticFiles();  // permite servir arquivos de wwwroot

// ===== API ENDPOINTS =====

// GET /api/clientes - Listar todos os clientes
app.MapGet("/api/clientes", async (AppDbContext db) =>
    await db.Clientes.OrderBy(c => c.Id).ToListAsync());

// GET /api/clientes/{id} - Buscar cliente por ID
app.MapGet("/api/clientes/{id:int}", async (int id, AppDbContext db) =>
{
    var cliente = await db.Clientes.FindAsync(id);
    return cliente is not null ? Results.Ok(cliente) : Results.NotFound();
});

// POST /api/clientes - Criar novo cliente
app.MapPost("/api/clientes", async (Cliente cliente, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(cliente.Nome))
    {
        return Results.BadRequest("Nome é obrigatório.");
    }

    db.Clientes.Add(cliente);
    await db.SaveChangesAsync();
    return Results.Created($"/api/clientes/{cliente.Id}", cliente);
});

// PUT /api/clientes/{id} - Atualizar cliente existente
app.MapPut("/api/clientes/{id:int}", async (int id, Cliente clienteAtualizado, AppDbContext db) =>
{
    var cliente = await db.Clientes.FindAsync(id);
    if (cliente is null)
    {
        return Results.NotFound();
    }

    if (string.IsNullOrWhiteSpace(clienteAtualizado.Nome))
    {
        return Results.BadRequest("Nome é obrigatório.");
    }

    cliente.Nome = clienteAtualizado.Nome;
    cliente.Endereco = clienteAtualizado.Endereco;
    cliente.Idade = clienteAtualizado.Idade;
    cliente.Telefone = clienteAtualizado.Telefone;

    await db.SaveChangesAsync();
    return Results.Ok(cliente);
});

// DELETE /api/clientes/{id} - Deletar cliente
app.MapDelete("/api/clientes/{id:int}", async (int id, AppDbContext db) =>
{
    var cliente = await db.Clientes.FindAsync(id);
    if (cliente is null)
    {
        return Results.NotFound();
    }

    db.Clientes.Remove(cliente);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();
