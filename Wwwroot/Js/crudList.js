// ========================================
// MOTOR GENÉRICO PARA TELAS DE LISTA + CRUD
// ========================================
// Este arquivo contém uma classe reutilizável que gerencia a lógica de:
// - Listagem de dados em tabela
// - Paginação
// - Filtros por coluna e texto
// - Seleção de itens
// - Ações de CRUD (Visualizar, Editar, Novo, Excluir)
//
// Cada tela específica (clientes, produtos, etc.) só precisa fornecer uma configuração
// e implementar os callbacks para as ações.

(() => {
  // ========================================
  // UTILITÁRIO: DEBOUNCE
  // ========================================
  /**
   * Função de debounce para limitar a frequência de execução de uma função.
   * Útil para "buscar enquanto digita" sem sobrecarregar o servidor.
   * 
   * @param {Function} fn - Função a ser executada após o delay
   * @param {number} ms - Tempo de espera em milissegundos
   * @returns {Function} Função debounced
   */
  function debounce(fn, ms) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }

  // ========================================
  // CLASSE PRINCIPAL: CrudList
  // ========================================
  /**
   * Motor genérico para telas de lista com paginação, filtros e ações CRUD.
   * 
   * @class
   */
  class CrudList {
    /**
     * Construtor da classe CrudList.
     * 
     * @param {Object} cfg - Objeto de configuração
     * @param {string} cfg.endpoint - URL base da API (ex: '/api/produtos')
     * @param {string} cfg.tableBodySelector - Seletor CSS do tbody da tabela (ex: '#tb-produtos tbody')
     * @param {string} cfg.pagerInfoSelector - Seletor CSS do elemento de informação da paginação
     * @param {string} cfg.pagerPrevSelector - Seletor CSS do botão "Anterior"
     * @param {string} cfg.pagerNextSelector - Seletor CSS do botão "Próxima"
     * @param {string} [cfg.filterColumnSelector] - Seletor CSS do select de coluna de filtro (opcional)
     * @param {string} [cfg.filterTextSelector] - Seletor CSS do input de texto de filtro (opcional)
     * @param {string} [cfg.btnViewSelector] - Seletor CSS do botão "Visualizar" (opcional)
     * @param {string} [cfg.btnEditSelector] - Seletor CSS do botão "Editar" (opcional)
     * @param {string} [cfg.btnNewSelector] - Seletor CSS do botão "Novo" (opcional)
     * @param {string} [cfg.btnDeleteSelector] - Seletor CSS do botão "Excluir" (opcional)
     * @param {number} [cfg.pageSize=20] - Número de itens por página
     * @param {string} [cfg.defaultColumn] - Coluna padrão para filtro (ex: 'descricao')
     * @param {number} [cfg.columnsCount=1] - Número de colunas da tabela (para colspan em mensagens)
     * @param {string} [cfg.columnParamName='column'] - Nome do parâmetro de coluna na query string
     * @param {string} [cfg.searchParamName='search'] - Nome do parâmetro de busca na query string
     * @param {Function} cfg.mapRow - Função que mapeia um item da API para uma linha da tabela
     *   Deve retornar: { id: number, cells: (string|number)[] }
     * @param {Function} [cfg.onView] - Callback chamado ao clicar em "Visualizar"
     * @param {Function} [cfg.onEdit] - Callback chamado ao clicar em "Editar"
     * @param {Function} [cfg.onNew] - Callback chamado ao clicar em "Novo"
     * @param {Function} [cfg.onDelete] - Callback chamado ao clicar em "Excluir"
     */
    constructor(cfg) {
      this.cfg = cfg;

      // Armazena referências aos elementos DOM
      this.els = {
        tbody: document.querySelector(cfg.tableBodySelector),
        pagerInfo: document.querySelector(cfg.pagerInfoSelector),
        pagerPrev: document.querySelector(cfg.pagerPrevSelector),
        pagerNext: document.querySelector(cfg.pagerNextSelector),

        filterColumn: cfg.filterColumnSelector
          ? document.querySelector(cfg.filterColumnSelector)
          : null,
        filterText: cfg.filterTextSelector
          ? document.querySelector(cfg.filterTextSelector)
          : null,

        btnView: cfg.btnViewSelector
          ? document.querySelector(cfg.btnViewSelector)
          : null,
        btnEdit: cfg.btnEditSelector
          ? document.querySelector(cfg.btnEditSelector)
          : null,
        btnNew: cfg.btnNewSelector
          ? document.querySelector(cfg.btnNewSelector)
          : null,
        btnDelete: cfg.btnDeleteSelector
          ? document.querySelector(cfg.btnDeleteSelector)
          : null,
      };

      // Estado interno da lista
      this.state = {
        page: 1,                           // Página atual
        pageSize: cfg.pageSize ?? 20,      // Itens por página
        total: 0,                          // Total de itens (retornado pela API)
        selectedId: null,                  // ID do item selecionado
        column: cfg.defaultColumn ?? null, // Coluna de filtro atual
        search: '',                        // Texto de busca atual
        loading: false,                    // Indica se está carregando dados
      };

      // Inicializa a lista
      this.init();
    }

    // ========================================
    // INICIALIZAÇÃO
    // ========================================
    /**
     * Inicializa a lista: conecta eventos, desabilita botões e carrega a primeira página.
     */
    init() {
      if (!this.els.tbody) {
        console.warn('CrudList: tbody não encontrado para', this.cfg);
        return;
      }

      // Conecta os eventos de filtros, paginação e ações
      this.wireFilters();
      this.wirePager();
      this.wireActions();

      // Desabilita os botões de ação até que um item seja selecionado
      this.setActionsDisabled(true);

      // Carrega a primeira página de dados
      this.loadPage();
    }

    // ========================================
    // HELPERS DE UI
    // ========================================
    /**
     * Habilita ou desabilita os botões de ação (Visualizar, Editar, Excluir).
     * O botão "Novo" não é afetado, pois geralmente está sempre habilitado.
     * 
     * @param {boolean} disabled - true para desabilitar, false para habilitar
     */
    setActionsDisabled(disabled) {
      [this.els.btnView, this.els.btnEdit, this.els.btnDelete].forEach(b => {
        if (b) b.disabled = disabled;
      });
    }

    /**
     * Limpa a seleção atual da tabela.
     * Remove a classe 'selected' de todas as linhas e desabilita os botões de ação.
     */
    clearSelection() {
      if (!this.els.tbody) return;
      this.els.tbody
        .querySelectorAll('tr')
        .forEach(tr => tr.classList.remove('selected'));
      this.state.selectedId = null;
      this.setActionsDisabled(true);
    }

    /**
     * Constrói a query string para a requisição à API.
     * Inclui parâmetros de paginação e filtros (se houver).
     * 
     * @returns {string} Query string formatada (ex: "page=1&pageSize=20&column=nome&search=João")
     */
    buildQueryString() {
      const p = new URLSearchParams();
      p.set('page', this.state.page.toString());
      p.set('pageSize', this.state.pageSize.toString());

      // Adiciona filtros apenas se ambos (coluna e texto) estiverem preenchidos
      if (this.state.column && this.state.search) {
        const colParam = this.cfg.columnParamName ?? 'column';
        const searchParam = this.cfg.searchParamName ?? 'search';
        p.set(colParam, this.state.column);
        p.set(searchParam, this.state.search);
      }

      return p.toString();
    }

    /**
     * Atualiza a interface de paginação (texto informativo e estado dos botões).
     */
    updatePagerUi() {
      const { pagerInfo, pagerPrev, pagerNext } = this.els;
      const { page, pageSize, total } = this.state;

      // Calcula o intervalo de itens exibidos (ex: "Mostrando 1-20 de 100")
      const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
      const end = Math.min(page * pageSize, total);

      // Atualiza o texto informativo
      if (pagerInfo) {
        pagerInfo.textContent = `Mostrando ${start}-${end} de ${total}`;
      }

      // Desabilita o botão "Anterior" se estiver na primeira página
      if (pagerPrev) {
        if (page <= 1) pagerPrev.classList.add('is-disabled');
        else pagerPrev.classList.remove('is-disabled');
      }

      // Desabilita o botão "Próxima" se estiver na última página
      if (pagerNext) {
        if (end >= total) pagerNext.classList.add('is-disabled');
        else pagerNext.classList.remove('is-disabled');
      }
    }

    /**
     * Renderiza uma linha da tabela a partir de um item da API.
     * Usa a função cfg.mapRow fornecida pelo usuário para mapear os dados.
     * 
     * @param {Object} item - Item retornado pela API
     * @returns {string} HTML da linha (<tr>...</tr>)
     */
    renderRow(item) {
      if (!this.cfg.mapRow) {
        throw new Error('CrudList: cfg.mapRow(item) não foi definido.');
      }

      // Chama a função de mapeamento fornecida pelo usuário
      const row = this.cfg.mapRow(item);
      const id = row.id;
      const cells = row.cells ?? [];

      // Gera o HTML das células
      const tds = cells
        .map(val => `<td>${val ?? ''}</td>`)
        .join('');

      // Retorna a linha completa com o atributo data-id para identificação
      return `<tr data-id="${id}">${tds}</tr>`;
    }

    /**
     * Conecta os eventos de clique e duplo clique nas linhas da tabela.
     * - Clique simples: seleciona a linha e habilita os botões de ação
     * - Duplo clique: abre o modal de visualização (se configurado)
     */
    wireRowSelection() {
      if (!this.els.tbody) return;

      this.els.tbody.querySelectorAll('tr').forEach(tr => {
        // Evento de clique simples: seleciona a linha
        tr.addEventListener('click', () => {
          // Remove a seleção de todas as linhas
          this.els.tbody
            .querySelectorAll('tr')
            .forEach(x => x.classList.remove('selected'));

          // Adiciona a classe 'selected' à linha clicada
          tr.classList.add('selected');

          // Extrai o ID da linha e atualiza o estado
          const id = parseInt(tr.getAttribute('data-id') || '0', 10) || null;
          this.state.selectedId = id;

          // Habilita os botões de ação se um ID válido foi selecionado
          this.setActionsDisabled(!(id && id > 0));
        });

        // Evento de duplo clique: abre o modal de visualização
        tr.addEventListener('dblclick', () => {
          const id = parseInt(tr.getAttribute('data-id') || '0', 10) || null;
          if (id && this.cfg.onView) {
            this.cfg.onView(id);
          }
        });
      });
    }

    // ========================================
    // CARREGAMENTO DE PÁGINA
    // ========================================
    /**
     * Carrega uma página de dados da API e atualiza a tabela.
     * Esta é a função principal que orquestra a busca e renderização dos dados.
     */
    async loadPage() {
      const { tbody, pagerInfo, pagerPrev, pagerNext } = this.els;
      if (!tbody) return;
      if (this.state.loading) return; // Evita múltiplas requisições simultâneas

      this.state.loading = true;
      this.clearSelection(); // Limpa a seleção ao carregar nova página

      const colspan = this.cfg.columnsCount ?? 1;

      // Exibe mensagem de carregamento
      tbody.innerHTML = `
        <tr>
          <td colspan="${colspan}" class="text-center text-muted">Carregando...</td>
        </tr>
      `;
      if (pagerInfo) pagerInfo.textContent = 'Carregando...';
      pagerPrev?.classList.add('is-disabled');
      pagerNext?.classList.add('is-disabled');

      try {
        // Constrói a URL com os parâmetros de paginação e filtros
        const qs = this.buildQueryString();
        const url = `${this.cfg.endpoint}?${qs}`;

        // Faz a requisição à API
        const resp = await fetch(url);
        if (!resp.ok) {
          const txt = await resp.text();
          throw new Error(txt || `Erro HTTP ${resp.status}`);
        }

        const data = await resp.json();
        let items = [];
        let total = 0;

        // A API pode retornar um array simples ou um objeto com { items, total }
        if (Array.isArray(data)) {
          items = data;
          total = data.length;
        } else if (data && typeof data === 'object') {
          if (Array.isArray(data.items)) items = data.items;
          if (typeof data.total === 'number') total = data.total;
          else total = items.length;
        }

        this.state.total = total;

        // Se não houver itens, exibe mensagem
        if (!items.length) {
          tbody.innerHTML = `
            <tr>
              <td colspan="${colspan}" class="text-center text-muted">
                Nenhum registro encontrado.
              </td>
            </tr>
          `;
        } else {
          // Renderiza as linhas da tabela
          tbody.innerHTML = items.map(item => this.renderRow(item)).join('');
        }

        // Conecta os eventos de seleção nas novas linhas
        this.wireRowSelection();

        // Atualiza a interface de paginação
        this.updatePagerUi();

        // Habilita o botão "Novo" após o carregamento
        if (this.els.btnNew) this.els.btnNew.disabled = false;

      } catch (err) {
        console.error('CrudList loadPage error:', err);
        tbody.innerHTML = `
          <tr>
            <td colspan="${colspan}" class="text-center text-muted">
              Erro ao carregar dados.
            </td>
          </tr>
        `;
        if (pagerInfo) pagerInfo.textContent = 'Erro ao carregar';
      } finally {
        this.state.loading = false;
      }
    }

    // ========================================
    // FILTROS
    // ========================================
    /**
     * Conecta os eventos dos campos de filtro (select de coluna e input de texto).
     */
    wireFilters() {
      const { filterColumn, filterText } = this.els;

      // Filtro de coluna (select)
      if (filterColumn) {
        // Garante que o estado inicial da coluna está sincronizado com o select
        if (!this.state.column) {
          this.state.column = filterColumn.value || null;
        }

        // Evento de mudança de coluna: recarrega a primeira página
        filterColumn.addEventListener('change', () => {
          this.state.column = filterColumn.value || null;
          this.state.page = 1; // Volta para a primeira página ao filtrar
          this.loadPage();
        });
      }

      // Filtro de texto (input)
      if (filterText) {
        // Função que dispara a busca
        const shoot = () => {
          this.state.search = filterText.value || '';
          this.state.page = 1; // Volta para a primeira página ao filtrar
          this.loadPage();
        };

        // Evento de digitação com debounce (aguarda 250ms após parar de digitar)
        filterText.addEventListener('input', debounce(shoot, 250));

        // Evento de Enter: dispara a busca imediatamente
        filterText.addEventListener('keydown', ev => {
          if (ev.key === 'Enter') {
            ev.preventDefault();
            shoot();
          }
        });
      }
    }

    // ========================================
    // PAGINAÇÃO
    // ========================================
    /**
     * Conecta os eventos dos botões de paginação (Anterior e Próxima).
     */
    wirePager() {
      const { pagerPrev, pagerNext } = this.els;

      // Botão "Anterior"
      if (pagerPrev) {
        pagerPrev.addEventListener('click', () => {
          if (this.state.loading) return; // Ignora se já está carregando
          if (this.state.page <= 1) return; // Ignora se já está na primeira página
          this.state.page--;
          this.loadPage();
        });
      }

      // Botão "Próxima"
      if (pagerNext) {
        pagerNext.addEventListener('click', () => {
          if (this.state.loading) return; // Ignora se já está carregando
          const maxPage = Math.ceil(this.state.total / this.state.pageSize) || 1;
          if (this.state.page >= maxPage) return; // Ignora se já está na última página
          this.state.page++;
          this.loadPage();
        });
      }
    }

    // ========================================
    // AÇÕES (BOTÕES)
    // ========================================
    /**
     * Conecta os eventos dos botões de ação (Visualizar, Editar, Novo, Excluir).
     * Chama os callbacks fornecidos na configuração.
     */
    wireActions() {
      const { btnView, btnEdit, btnNew, btnDelete } = this.els;

      // Botão "Visualizar"
      if (btnView && this.cfg.onView) {
        btnView.addEventListener('click', () => {
          if (this.state.selectedId) this.cfg.onView(this.state.selectedId);
        });
      }

      // Botão "Editar"
      if (btnEdit && this.cfg.onEdit) {
        btnEdit.addEventListener('click', () => {
          if (this.state.selectedId) this.cfg.onEdit(this.state.selectedId);
        });
      }

      // Botão "Excluir"
      if (btnDelete && this.cfg.onDelete) {
        btnDelete.addEventListener('click', async () => {
          if (!this.state.selectedId) return;
          const id = this.state.selectedId;
          const result = this.cfg.onDelete(id);
          // Se o callback retornar uma Promise, aguarda sua conclusão
          if (result instanceof Promise) {
            await result;
          }
        });
      }

      // Botão "Novo"
      if (btnNew && this.cfg.onNew) {
        btnNew.addEventListener('click', () => {
          this.cfg.onNew();
        });
      }
    }
  }

  // ========================================
  // EXPORTAÇÃO GLOBAL
  // ========================================
  // Expõe a classe CrudList no escopo global para que outros scripts possam usá-la
  window.CrudList = CrudList;
})();
