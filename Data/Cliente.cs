using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebAppEstudo.Data
{
    [Table("clientes", Schema = "dbo")]
    public class Cliente
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        [Column("nome")]
        public string Nome { get; set; } = "";

        [MaxLength(200)]
        [Column("endereco")]
        public string? Endereco { get; set; }

        [Column("idade")]
        public int? Idade { get; set; }

        [MaxLength(30)]
        [Column("telefone")]
        public string? Telefone { get; set; }
    }
}
