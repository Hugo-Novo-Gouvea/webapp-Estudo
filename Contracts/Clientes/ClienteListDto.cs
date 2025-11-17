namespace WebAppEstudo.Contracts.Clientes;

/// <summary>
/// Data Transfer Object (DTO) para listagem de clientes.
/// Contém apenas os campos essenciais que devem ser exibidos em uma lista ou tabela.
/// Evita trafegar dados desnecessários pela rede, melhorando a performance.
/// Não inclui campos de controle do sistema (DataCadastro, DataUltimoRegistro, Deletado).
/// </summary>
public class ClienteListDto
{
    /// <summary>
    /// Identificador único do cliente.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Nome completo do cliente.
    /// </summary>
    public string Nome { get; set; } = "";

    /// <summary>
    /// Número de telefone do cliente.
    /// Pode ser nulo se não foi informado.
    /// </summary>
    public string? Telefone { get; set; }
}
