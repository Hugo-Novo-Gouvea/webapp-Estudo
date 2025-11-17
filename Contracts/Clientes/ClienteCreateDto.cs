namespace WebAppEstudo.Contracts.Clientes;

/// <summary>
/// Data Transfer Object (DTO) para criação de um novo cliente.
/// Contém apenas os campos que podem ser fornecidos pelo usuário ao criar um cliente.
/// Campos como Id, Ativo e DataCadastro são gerados automaticamente pelo sistema.
/// </summary>
public class ClienteCreateDto
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
