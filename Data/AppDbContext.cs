using Microsoft.EntityFrameworkCore;

namespace WebAppEstudo.Data
{
    /// <summary>
    /// Contexto do banco de dados da aplicação.
    /// Esta classe representa uma sessão com o banco de dados e permite realizar operações de CRUD
    /// nas entidades mapeadas (como Cliente).
    /// Implementa filtros globais para soft delete (não exibir registros deletados).
    /// </summary>
    public class AppDbContext : DbContext
    {
        /// <summary>
        /// Construtor do contexto que recebe as opções de configuração.
        /// As opções incluem a connection string e o provedor de banco de dados (SQL Server).
        /// </summary>
        /// <param name="options">Opções de configuração do DbContext injetadas pelo sistema de DI do ASP.NET Core.</param>
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        /// <summary>
        /// Representa a tabela de Clientes no banco de dados.
        /// Permite realizar consultas e operações de CRUD na entidade Cliente.
        /// </summary>
        public DbSet<Cliente> Clientes => Set<Cliente>();

        /// <summary>
        /// Configura o modelo de dados usando a Fluent API.
        /// Este método é chamado automaticamente pelo EF Core durante a inicialização.
        /// Aqui podemos definir índices, relacionamentos, restrições, filtros globais e outras configurações avançadas.
        /// </summary>
        /// <param name="modelBuilder">Construtor de modelo usado para configurar as entidades.</param>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuração da entidade Cliente
            modelBuilder.Entity<Cliente>(entity =>
            {
                // ========================================
                // ÍNDICES PARA OTIMIZAÇÃO DE CONSULTAS
                // ========================================
                
                // Cria um índice na coluna Nome para melhorar a performance de buscas por nome
                entity.HasIndex(c => c.Nome)
                    .HasDatabaseName("IX_Clientes_Nome");

                // Cria um índice na coluna Deletado para filtros de clientes ativos
                // Este índice é crucial para a performance do soft delete
                entity.HasIndex(c => c.Deletado)
                    .HasDatabaseName("IX_Clientes_Deletado");

                // Cria um índice composto (Nome + Deletado) para otimizar buscas por nome em clientes ativos
                entity.HasIndex(c => new { c.Nome, c.Deletado })
                    .HasDatabaseName("IX_Clientes_Nome_Deletado");

                // ========================================
                // VALORES PADRÃO
                // ========================================
                
                // Configura valor padrão para DataCadastro (data/hora atual do servidor)
                entity.Property(c => c.DataCadastro)
                    .HasDefaultValueSql("GETDATE()");

                // Configura valor padrão para DataUltimoRegistro (data/hora atual do servidor)
                entity.Property(c => c.DataUltimoRegistro)
                    .HasDefaultValueSql("GETDATE()");

                // Configura valor padrão para Deletado (false = não deletado)
                entity.Property(c => c.Deletado)
                    .HasDefaultValue(false);

                // ========================================
                // FILTRO GLOBAL: SOFT DELETE
                // ========================================
                
                // Aplica um filtro global que automaticamente exclui registros deletados de todas as consultas
                // Isso significa que todas as queries (ToList, Find, etc.) só retornarão registros onde Deletado = false
                // Para incluir registros deletados, é necessário usar .IgnoreQueryFilters() explicitamente
                entity.HasQueryFilter(c => !c.Deletado);
            });
        }
    }
}
