namespace WebAppEstudo.Contracts.Clientes;

/// <summary>
/// Data Transfer Object (DTO) para atualização de um cliente existente.
/// Contém todos os campos editáveis de um cliente.
/// O Id não está incluído aqui pois é passado na URL da requisição.
/// Não inclui campos de controle (DataCadastro, DataUltimoRegistro, Deletado) pois são gerenciados pelo sistema.
/// </summary>
public class ClienteUpdateDto
{
    /// <summary>
    /// Nome completo do cliente.
    /// Campo obrigatório.
    /// </summary>
    public string Nome { get; set; } = "";

    /// <summary>
    /// Endereço residencial ou comercial do cliente.
    /// Campo opcional.
    /// </summary>
    public string? Endereco { get; set; }

    /// <summary>
    /// Idade do cliente em anos.
    /// Campo opcional. Se fornecido, deve estar entre 0 e 150.
    /// </summary>
    public int? Idade { get; set; }

    /// <summary>
    /// Número de telefone do cliente.
    /// Campo opcional. Pode incluir formatação.
    /// </summary>
    public string? Telefone { get; set; }
}
