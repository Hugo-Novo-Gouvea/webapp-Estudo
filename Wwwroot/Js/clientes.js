// ========================================
// TELA DE CLIENTES
// ========================================
// Este arquivo implementa a lógica específica da tela de gerenciamento de clientes.
// Ele utiliza o motor genérico CrudList (definido em crudList.js) para gerenciar
// a listagem, paginação e filtros, e implementa os modais de CRUD específicos para clientes.

(() => {
  // ========================================
  // VERIFICAÇÃO DE DEPENDÊNCIAS
  // ========================================
  // Verifica se o CrudList foi carregado antes deste script
  if (!window.CrudList) {
    console.error('CrudList não encontrado. Certifique-se de carregar /js/crudList.js antes de /js/clientes.js');
    return;
  }

  // ========================================
  // REFERÊNCIAS AOS ELEMENTOS DOM
  // ========================================
  // Armazena referências a todos os elementos DOM que serão manipulados
  const els = {
    // Modal de visualização
    viewBackdrop: document.getElementById('cliente-modal-backdrop'),
    viewCloseBtn: document.getElementById('modal-close-btn'),
    v: {
      id:       document.getElementById('m-id'),
      nome:     document.getElementById('m-nome'),
      endereco: document.getElementById('m-endereco'),
      idade:    document.getElementById('m-idade'),
      telefone: document.getElementById('m-telefone'),
      dataCadastro: document.getElementById('m-datacadastro'),
      dataUltimoRegistro: document.getElementById('m-dataultimoregistro'),
    },

    // Modal de edição
    editBackdrop: document.getElementById('cliente-edit-backdrop'),
    editCloseBtn: document.getElementById('edit-close-btn'),
    editCancelBtn: document.getElementById('edit-cancel-btn'),
    editForm: document.getElementById('edit-form'),
    e: {
      id:       document.getElementById('e-id'),
      nome:     document.getElementById('e-nome'),
      endereco: document.getElementById('e-endereco'),
      idade:    document.getElementById('e-idade'),
      telefone: document.getElementById('e-telefone'),
    },

    // Modal de novo cliente
    newBackdrop: document.getElementById('cliente-new-backdrop'),
    newCloseBtn: document.getElementById('new-close-btn'),
    newCancelBtn: document.getElementById('new-cancel-btn'),
    newForm: document.getElementById('new-form'),
    n: {
      nome:     document.getElementById('n-nome'),
      endereco: document.getElementById('n-endereco'),
      idade:    document.getElementById('n-idade'),
      telefone: document.getElementById('n-telefone'),
    },
  };

  // ========================================
  // FUNÇÕES AUXILIARES
  // ========================================

  /**
   * Faz uma requisição HTTP e retorna o JSON da resposta.
   * Lança um erro se a resposta não for bem-sucedida.
   * 
   * @param {string} url - URL da requisição
   * @param {Object} options - Opções do fetch (method, headers, body, etc.)
   * @returns {Promise<Object>} Objeto JSON da resposta
   * @throws {Error} Se a resposta não for bem-sucedida (status >= 400)
   */
  async function fetchJson(url, options) {
    const resp = await fetch(url, options);
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(txt || `Erro HTTP ${resp.status}`);
    }
    return await resp.json();
  }

  /**
   * Abre um modal adicionando a classe 'show'.
   * 
   * @param {HTMLElement} el - Elemento do modal (backdrop)
   */
  function openModal(el) {
    if (el) el.classList.add('show');
  }

  /**
   * Fecha um modal removendo a classe 'show'.
   * 
   * @param {HTMLElement} el - Elemento do modal (backdrop)
   */
  function closeModal(el) {
    if (el) el.classList.remove('show');
  }

  // ========================================
  // PREENCHIMENTO DOS MODAIS
  // ========================================

  /**
   * Preenche o modal de visualização com os dados do cliente.
   * Trata tanto propriedades em camelCase quanto PascalCase (retornadas pela API).
   * 
   * @param {Object} c - Objeto cliente retornado pela API
   */
  function fillViewModal(c) {
    if (!c) return;
    const v = els.v;

    // Extrai os valores, tratando ambas as convenções de nomenclatura
    const id       = c.id ?? c.Id ?? 0;
    const nome     = c.nome ?? c.Nome ?? '';
    const endereco = c.endereco ?? c.Endereco ?? '';
    const idade    = c.idade ?? c.Idade ?? null;
    const telefone = c.telefone ?? c.Telefone ?? '';
    const dataCadastro = c.dataCadastro ?? c.DataCadastro ?? '';
    const dataUltimoRegistro = c.dataUltimoRegistro ?? c.DataUltimoRegistro ?? '';

    // Função auxiliar para formatar data/hora
    function formatarData(dataStr) {
      if (!dataStr) return '';
      try {
        const data = new Date(dataStr);
        return data.toLocaleString('pt-BR', { 
          dateStyle: 'short', 
          timeStyle: 'short' 
        });
      } catch {
        return dataStr;
      }
    }

    // Preenche os campos do modal
    if (v.id)       v.id.textContent = id || '';
    if (v.nome)     v.nome.textContent = nome;
    if (v.endereco) v.endereco.textContent = endereco || '';
    if (v.idade)    v.idade.textContent = idade != null ? String(idade) : '';
    if (v.telefone) v.telefone.textContent = telefone || '';
    if (v.dataCadastro) v.dataCadastro.textContent = formatarData(dataCadastro);
    if (v.dataUltimoRegistro) v.dataUltimoRegistro.textContent = formatarData(dataUltimoRegistro);
  }

  /**
   * Preenche o modal de edição com os dados do cliente.
   * 
   * @param {Object} c - Objeto cliente retornado pela API
   */
  function fillEditModal(c) {
    if (!c) return;
    const e = els.e;

    // Extrai os valores, tratando ambas as convenções de nomenclatura
    const id       = c.id ?? c.Id ?? 0;
    const nome     = c.nome ?? c.Nome ?? '';
    const endereco = c.endereco ?? c.Endereco ?? '';
    const idade    = c.idade ?? c.Idade ?? null;
    const telefone = c.telefone ?? c.Telefone ?? '';

    // Preenche os campos do formulário
    if (e.id)       e.id.value = id || '';
    if (e.nome)     e.nome.value = nome;
    if (e.endereco) e.endereco.value = endereco || '';
    if (e.idade)    e.idade.value = idade != null ? String(idade) : '';
    if (e.telefone) e.telefone.value = telefone || '';
  }

  /**
   * Limpa todos os campos do formulário de novo cliente.
   */
  function clearNewForm() {
    const n = els.n;
    Object.keys(n).forEach(k => {
      if (n[k]) n[k].value = '';
    });
  }

  /**
   * Constrói o payload (corpo da requisição) para atualização de cliente.
   * Extrai os valores dos campos do formulário de edição.
   * 
   * @returns {Object} Objeto com os dados do cliente para enviar à API
   */
  function buildEditPayload() {
    const e = els.e;

    const nome     = (e.nome?.value ?? '').trim();
    const endereco = (e.endereco?.value ?? '').trim();
    const idadeRaw = e.idade?.value ?? '';
    const telefone = (e.telefone?.value ?? '').trim();

    return {
      Nome: nome,
      Endereco: endereco || null,
      Idade: idadeRaw ? parseInt(idadeRaw, 10) : null,
      Telefone: telefone || null
    };
  }

  /**
   * Constrói o payload (corpo da requisição) para criação de novo cliente.
   * Extrai os valores dos campos do formulário de novo cliente.
   * 
   * @returns {Object} Objeto com os dados do cliente para enviar à API
   */
  function buildNewPayload() {
    const n = els.n;

    const nome     = (n.nome?.value ?? '').trim();
    const endereco = (n.endereco?.value ?? '').trim();
    const idadeRaw = n.idade?.value ?? '';
    const telefone = (n.telefone?.value ?? '').trim();

    return {
      Nome: nome,
      Endereco: endereco || null,
      Idade: idadeRaw ? parseInt(idadeRaw, 10) : null,
      Telefone: telefone || null,
    };
  }

  // ========================================
  // CONFIGURAÇÃO DO CrudList
  // ========================================
  
  let list; // Variável que armazenará a instância do CrudList

  /**
   * Objeto de configuração para o CrudList.
   * Define os seletores dos elementos, callbacks e comportamentos específicos da tela de clientes.
   */
  const cfg = {
    // URL base da API de clientes
    endpoint: '/api/clientes',

    // Seletores dos elementos da tabela e paginação
    tableBodySelector: '#tb-clientes tbody',
    pagerInfoSelector: '#clientes-pg-info',
    pagerPrevSelector: '#clientes-pg-prev',
    pagerNextSelector: '#clientes-pg-next',

    // Seletores dos campos de filtro
    filterColumnSelector: '#filter-column',
    filterTextSelector: '#filter-text',

    // Seletores dos botões de ação
    btnViewSelector: '#btn-view',
    btnEditSelector: '#btn-edit',
    btnNewSelector: '#btn-new',
    btnDeleteSelector: '#btn-delete',

    // Configurações de paginação e filtro
    defaultColumn: 'nome', // Coluna padrão para filtro
    pageSize: 50,          // Número de itens por página
    columnsCount: 5,       // Número de colunas da tabela (ID, Nome, Endereço, Idade, Telefone)

    /**
     * Função que mapeia um objeto cliente (retornado pela API) para uma linha da tabela.
     * 
     * @param {Object} c - Objeto cliente
     * @returns {Object} Objeto com { id, cells } onde cells é um array de valores para cada coluna
     */
    mapRow: (c) => {
      // Extrai os valores, tratando ambas as convenções de nomenclatura
      const id       = c.id ?? c.Id ?? 0;
      const nome     = c.nome ?? c.Nome ?? '';
      const endereco = c.endereco ?? c.Endereco ?? '';
      const idade    = c.idade ?? c.Idade ?? '';
      const telefone = c.telefone ?? c.Telefone ?? '';

      return {
        id,
        cells: [
          id,
          nome,
          endereco,
          idade != null && idade !== '' ? idade : '',
          telefone,
        ],
      };
    },

    /**
     * Callback chamado ao clicar no botão "Visualizar" ou dar duplo clique em uma linha.
     * Busca os dados completos do cliente na API e abre o modal de visualização.
     * 
     * @param {number} id - ID do cliente selecionado
     */
    async onView(id) {
      try {
        const c = await fetchJson(`/api/clientes/${id}`);
        fillViewModal(c);
        openModal(els.viewBackdrop);
      } catch (err) {
        console.error(err);
        alert('Falha ao carregar detalhes do cliente.');
      }
    },

    /**
     * Callback chamado ao clicar no botão "Editar".
     * Busca os dados completos do cliente na API e abre o modal de edição.
     * 
     * @param {number} id - ID do cliente selecionado
     */
    async onEdit(id) {
      try {
        const c = await fetchJson(`/api/clientes/${id}`);
        fillEditModal(c);
        openModal(els.editBackdrop);
      } catch (err) {
        console.error(err);
        alert('Falha ao carregar cliente para edição.');
      }
    },

    /**
     * Callback chamado ao clicar no botão "Novo".
     * Limpa o formulário e abre o modal de novo cliente.
     */
    onNew() {
      clearNewForm();
      openModal(els.newBackdrop);
    },

    /**
     * Callback chamado ao clicar no botão "Excluir".
     * Solicita confirmação e, se confirmado, envia uma requisição DELETE para a API.
     * 
     * @param {number} id - ID do cliente a ser excluído
     */
    async onDelete(id) {
      if (!confirm('Deseja realmente excluir este cliente?')) return;
      try {
        const resp = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
        if (!resp.ok) {
          const txt = await resp.text();
          throw new Error(txt || 'Erro ao excluir cliente.');
        }
        // Recarrega a página atual após a exclusão
        await list.loadPage();
      } catch (err) {
        console.error(err);
        alert('Falha ao excluir cliente.');
      }
    },
  };

  // Cria a instância do CrudList com a configuração definida
  list = new CrudList(cfg);

  // ========================================
  // EVENTOS DOS MODAIS
  // ========================================

  // ----- Modal de Visualização -----
  
  // Fecha o modal ao clicar no botão de fechar (X)
  els.viewCloseBtn?.addEventListener('click', () => closeModal(els.viewBackdrop));
  
  // Fecha o modal ao clicar fora dele (no backdrop)
  els.viewBackdrop?.addEventListener('click', ev => {
    if (ev.target === els.viewBackdrop) closeModal(els.viewBackdrop);
  });

  // ----- Modal de Edição -----
  
  // Fecha o modal ao clicar no botão de fechar (X)
  els.editCloseBtn?.addEventListener('click', () => closeModal(els.editBackdrop));
  
  // Fecha o modal ao clicar no botão "Cancelar"
  els.editCancelBtn?.addEventListener('click', () => closeModal(els.editBackdrop));
  
  // Fecha o modal ao clicar fora dele (no backdrop)
  els.editBackdrop?.addEventListener('click', ev => {
    if (ev.target === els.editBackdrop) closeModal(els.editBackdrop);
  });

  /**
   * Evento de submit do formulário de edição.
   * Valida os dados, envia uma requisição PUT para a API e recarrega a lista.
   */
  els.editForm?.addEventListener('submit', async ev => {
    ev.preventDefault(); // Previne o comportamento padrão de submit

    // Extrai o ID do campo oculto
    const idRaw = els.e.id?.value ?? '';
    const id = parseInt(idRaw || '0', 10);
    if (!id) {
      alert('ID inválido para edição.');
      return;
    }

    // Constrói o payload com os dados do formulário
    const payload = buildEditPayload();
    if (!payload.Nome || !payload.Nome.trim()) {
      alert('Nome é obrigatório.');
      return;
    }

    try {
      // Envia a requisição PUT para a API
      const resp = await fetch(`/api/clientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || 'Erro ao salvar alterações.');
      }
      
      // Fecha o modal e recarrega a lista
      closeModal(els.editBackdrop);
      await list.loadPage();
    } catch (err) {
      console.error(err);
      alert('Falha ao salvar alterações.');
    }
  });

  // ----- Modal de Novo Cliente -----
  
  // Fecha o modal ao clicar no botão de fechar (X)
  els.newCloseBtn?.addEventListener('click', () => closeModal(els.newBackdrop));
  
  // Fecha o modal ao clicar no botão "Cancelar"
  els.newCancelBtn?.addEventListener('click', () => closeModal(els.newBackdrop));
  
  // Fecha o modal ao clicar fora dele (no backdrop)
  els.newBackdrop?.addEventListener('click', ev => {
    if (ev.target === els.newBackdrop) closeModal(els.newBackdrop);
  });

  /**
   * Evento de submit do formulário de novo cliente.
   * Valida os dados, envia uma requisição POST para a API e recarrega a lista.
   */
  els.newForm?.addEventListener('submit', async ev => {
    ev.preventDefault(); // Previne o comportamento padrão de submit

    // Constrói o payload com os dados do formulário
    const payload = buildNewPayload();
    if (!payload.Nome || !payload.Nome.trim()) {
      alert('Nome é obrigatório.');
      return;
    }

    try {
      // Envia a requisição POST para a API
      const resp = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || 'Erro ao criar cliente.');
      }
      
      // Fecha o modal, limpa o formulário e recarrega a primeira página
      closeModal(els.newBackdrop);
      clearNewForm();
      list.state.page = 1; // Volta para a primeira página
      await list.loadPage();
    } catch (err) {
      console.error(err);
      alert('Falha ao criar cliente.');
    }
  });
})();
