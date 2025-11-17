using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebAppEstudo.Data
{
    /// <summary>
    /// Representa um cliente do sistema.
    /// Esta classe é uma entidade do Entity Framework Core que mapeia para a tabela "clientes" no banco de dados.
    /// Utiliza soft delete: registros não são fisicamente excluídos, apenas marcados como deletados.
    /// </summary>
    [Table("clientes", Schema = "dbo")]
    public class Cliente
    {
        /// <summary>
        /// Identificador único do cliente.
        /// Este campo é a chave primária e é gerado automaticamente pelo banco de dados (IDENTITY).
        /// </summary>
        [Key]
        [Column("id")]
        public int Id { get; set; }

        /// <summary>
        /// Nome completo do cliente.
        /// Campo obrigatório com tamanho máximo de 200 caracteres.
        /// </summary>
        [Required(ErrorMessage = "O nome é obrigatório.")]
        [MaxLength(200, ErrorMessage = "O nome não pode ter mais de 200 caracteres.")]
        [Column("nome")]
        public string Nome { get; set; } = "";

        /// <summary>
        /// Endereço residencial ou comercial do cliente.
        /// Campo opcional com tamanho máximo de 200 caracteres.
        /// </summary>
        [MaxLength(200, ErrorMessage = "O endereço não pode ter mais de 200 caracteres.")]
        [Column("endereco")]
        public string? Endereco { get; set; }

        /// <summary>
        /// Idade do cliente em anos.
        /// Campo opcional, mas se fornecido, deve estar entre 0 e 150.
        /// </summary>
        [Range(0, 150, ErrorMessage = "A idade deve estar entre 0 e 150 anos.")]
        [Column("idade")]
        public int? Idade { get; set; }

        /// <summary>
        /// Número de telefone do cliente.
        /// Campo opcional com tamanho máximo de 30 caracteres.
        /// Pode incluir formatação como parênteses, hífens ou espaços.
        /// </summary>
        [MaxLength(30, ErrorMessage = "O telefone não pode ter mais de 30 caracteres.")]
        [Column("telefone")]
        public string? Telefone { get; set; }

        /// <summary>
        /// Data e hora de cadastro do cliente no sistema.
        /// Este campo é preenchido automaticamente no momento da criação.
        /// Armazenado em UTC para evitar problemas de fuso horário.
        /// Tipo: datetime2(0) - sem precisão de milissegundos.
        /// </summary>
        [Column("dataCadastro")]
        public DateTime DataCadastro { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Data e hora do último registro/atualização do cliente.
        /// Este campo é atualizado automaticamente sempre que o registro é modificado.
        /// Útil para auditoria e rastreamento de mudanças.
        /// Tipo: datetime2(0) - sem precisão de milissegundos.
        /// </summary>
        [Column("dataUltimoRegistro")]
        public DateTime DataUltimoRegistro { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Indica se o cliente foi excluído logicamente (soft delete).
        /// - false: Cliente ativo e visível no sistema
        /// - true: Cliente excluído (não aparece nas listagens)
        /// Este campo permite recuperação de dados excluídos acidentalmente.
        /// Valor padrão: false.
        /// </summary>
        [Column("deletado")]
        public bool Deletado { get; set; } = false;
    }
}
