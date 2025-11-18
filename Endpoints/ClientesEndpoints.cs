using Microsoft.EntityFrameworkCore;
using WebAppEstudo.Contracts.Clientes;
using WebAppEstudo.Data;

namespace WebAppEstudo.Endpoints;

/// <summary>
/// Classe estática que contém os endpoints da API para o recurso Cliente.
/// Utiliza o padrão de Minimal APIs do ASP.NET Core para definir rotas de forma concisa.
/// </summary>
public static class ClientesEndpoints
{
    /// <summary>
    /// Método de extensão que registra todos os endpoints relacionados a Clientes.
    /// Agrupa todas as rotas sob o prefixo "/api/clientes".
    /// </summary>
    /// <param name="app">Instância da aplicação web.</param>
    public static void MapClientesEndpoints(this WebApplication app)
    {
        // Cria um grupo de rotas com o prefixo "/api/clientes"
        // Todas as rotas definidas neste grupo terão esse prefixo automaticamente
        var group = app.MapGroup("/api/clientes");

        // ========================================
        // ENDPOINT: LISTAR TODOS OS CLIENTES
        // ========================================
        // GET /api/clientes
        // Retorna uma lista de todos os clientes não deletados, ordenados por nome.
        group.MapGet("", async (AppDbContext db) =>
        {
            // Busca todos os clientes no banco de dados
            // O filtro global no DbContext já exclui registros onde Deletado = true
            var clientes = await db.Clientes
                .OrderBy(c => c.Nome) // Ordena por nome em ordem alfabética
                .Select(c => new ClienteListDto // Projeta apenas os campos necessários para a listagem
                {
                    Id = c.Id,
                    Nome = c.Nome,
                    Telefone = c.Telefone
                })
                .ToListAsync(); // Executa a query de forma assíncrona

            // Retorna HTTP 200 OK com a lista de clientes
            return Results.Ok(clientes);
        })
        .WithName("ListarClientes") // Nome do endpoint para geração de links
        .WithTags("Clientes") // Tag para agrupamento na documentação (Swagger)
        .Produces<List<ClienteListDto>>(StatusCodes.Status200OK); // Documenta o tipo de retorno

        // ========================================
        // ENDPOINT: BUSCAR CLIENTE POR ID
        // ========================================
        // GET /api/clientes/{id}
        // Retorna os detalhes completos de um cliente específico.
        group.MapGet("/{id:int}", async (int id, AppDbContext db) =>
        {
            // Busca o cliente pelo ID
            var c = await db.Clientes.FindAsync(id);

            // Se o cliente não for encontrado, retorna HTTP 404 Not Found
            if (c is null)
                return Results.NotFound(new { mensagem = "Cliente não encontrado." });

            // Mapeia a entidade para um DTO que inclui os campos de visualização
            var dto = new
            {
                Id = c.Id,
                Nome = c.Nome,
                Endereco = c.Endereco,
                Idade = c.Idade,
                Telefone = c.Telefone,
                DataCadastro = c.DataCadastro,
                DataUltimoRegistro = c.DataUltimoRegistro
            };

            // Retorna HTTP 200 OK com os dados do cliente
            return Results.Ok(dto);
        })
        .WithName("BuscarClientePorId")
        .WithTags("Clientes")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);

        // ========================================
        // ENDPOINT: CRIAR NOVO CLIENTE
        // ========================================
        // POST /api/clientes
        // Cria um novo cliente no banco de dados.
        group.MapPost("", async (ClienteCreateDto dto, AppDbContext db) =>
        {
            // Validação: verifica se o nome foi fornecido
            if (string.IsNullOrWhiteSpace(dto.Nome))
                return Results.BadRequest(new { mensagem = "Nome é obrigatório." });

            // Validação: verifica se a idade está dentro do intervalo válido
            if (dto.Idade.HasValue && (dto.Idade < 0 || dto.Idade > 150))
                return Results.BadRequest(new { mensagem = "A idade deve estar entre 0 e 150 anos." });

            // Obtém a data/hora atual em UTC
            var agora = DateTime.UtcNow;

            // Cria uma nova entidade Cliente com os dados do DTO
            var entity = new Cliente
            {
                Nome = dto.Nome.Trim(), // Remove espaços em branco no início e fim
                Endereco = dto.Endereco?.Trim(),
                Idade = dto.Idade,
                Telefone = dto.Telefone?.Trim(),
                DataCadastro = agora, // Define a data de cadastro como o momento atual
                DataUltimoRegistro = agora, // Define a data do último registro como o momento atual
                Deletado = false // Novos clientes não estão deletados
            };

            // Adiciona a entidade ao contexto (ainda não salva no banco)
            db.Clientes.Add(entity);

            // Salva as alterações no banco de dados de forma assíncrona
            await db.SaveChangesAsync();

            // Cria um DTO de retorno com os dados do cliente recém-criado
            var retorno = new ClienteListDto
            {
                Id = entity.Id, // O ID é gerado automaticamente pelo banco de dados
                Nome = entity.Nome,
                Telefone = entity.Telefone
            };

            // Retorna HTTP 201 Created com a localização do novo recurso e os dados do cliente
            return Results.Created($"/api/clientes/{entity.Id}", retorno);
        })
        .WithName("CriarCliente")
        .WithTags("Clientes")
        .Produces<ClienteListDto>(StatusCodes.Status201Created)
        .Produces(StatusCodes.Status400BadRequest);

        // ========================================
        // ENDPOINT: ATUALIZAR CLIENTE EXISTENTE
        // ========================================
        // PUT /api/clientes/{id}
        // Atualiza os dados de um cliente existente.
        group.MapPut("/{id:int}", async (int id, ClienteUpdateDto dto, AppDbContext db) =>
        {
            // Busca o cliente pelo ID
            var c = await db.Clientes.FindAsync(id);

            // Se o cliente não for encontrado, retorna HTTP 404 Not Found
            if (c is null)
                return Results.NotFound(new { mensagem = "Cliente não encontrado." });

            // Validação: verifica se o nome foi fornecido
            if (string.IsNullOrWhiteSpace(dto.Nome))
                return Results.BadRequest(new { mensagem = "Nome é obrigatório." });

            // Validação: verifica se a idade está dentro do intervalo válido
            if (dto.Idade.HasValue && (dto.Idade < 0 || dto.Idade > 150))
                return Results.BadRequest(new { mensagem = "A idade deve estar entre 0 e 150 anos." });

            // Atualiza os campos do cliente com os dados do DTO
            c.Nome = dto.Nome.Trim();
            c.Endereco = dto.Endereco?.Trim();
            c.Idade = dto.Idade;
            c.Telefone = dto.Telefone?.Trim();
            c.DataUltimoRegistro = DateTime.UtcNow; // Atualiza a data do último registro

            // Salva as alterações no banco de dados
            await db.SaveChangesAsync();

            // Retorna HTTP 204 No Content (sucesso sem corpo de resposta)
            return Results.NoContent();
        })
        .WithName("AtualizarCliente")
        .WithTags("Clientes")
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status404NotFound);

        // ========================================
        // ENDPOINT: DELETAR CLIENTE (SOFT DELETE)
        // ========================================
        // DELETE /api/clientes/{id}
        // Marca um cliente como deletado (soft delete).
        group.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
        {
            // Busca o cliente pelo ID, ignorando o filtro global de soft delete
            var c = await db.Clientes.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == id);

            // Se o cliente não for encontrado, retorna HTTP 404 Not Found
            if (c is null)
                return Results.NotFound(new { mensagem = "Cliente não encontrado." });

            // Marca o cliente como deletado (soft delete)
            c.Deletado = true;
            c.DataUltimoRegistro = DateTime.Now; // Atualiza a data do último registro

            // Salva as alterações no banco de dados
            await db.SaveChangesAsync();

            // Retorna HTTP 204 No Content (sucesso sem corpo de resposta)
            return Results.NoContent();
        })
        .WithName("DeletarCliente")
        .WithTags("Clientes")
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound);
    }
}
