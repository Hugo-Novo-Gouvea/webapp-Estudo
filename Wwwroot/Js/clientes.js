// wwwroot/js/clientes.js
// Tela de clientes usando o motor genérico CrudList.

(() => {
  if (!window.CrudList) {
    console.error('CrudList não encontrado. Certifique-se de carregar /js/crudList.js antes de /js/clientes.js');
    return;
  }

  // -------------------------
  // ELEMENTOS
  // -------------------------
  const els = {
    // modal visualizar
    viewBackdrop: document.getElementById('cliente-modal-backdrop'),
    viewCloseBtn: document.getElementById('modal-close-btn'),
    v: {
      id:       document.getElementById('m-id'),
      nome:     document.getElementById('m-nome'),
      endereco: document.getElementById('m-endereco'),
      idade:    document.getElementById('m-idade'),
      telefone: document.getElementById('m-telefone'),
    },

    // modal editar
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

    // modal novo
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

  // -------------------------
  // HELPERS
  // -------------------------
  async function fetchJson(url, options) {
    const resp = await fetch(url, options);
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(txt || `Erro HTTP ${resp.status}`);
    }
    return await resp.json();
  }

  function openModal(el) {
    if (el) el.classList.add('show');
  }

  function closeModal(el) {
    if (el) el.classList.remove('show');
  }

  // -------------------------
  // PREENCHER MODAIS
  // -------------------------
  function fillViewModal(c) {
    if (!c) return;
    const v = els.v;

    const id       = c.id ?? c.Id ?? 0;
    const nome     = c.nome ?? c.Nome ?? '';
    const endereco = c.endereco ?? c.Endereco ?? '';
    const idade    = c.idade ?? c.Idade ?? null;
    const telefone = c.telefone ?? c.Telefone ?? '';

    if (v.id)       v.id.textContent = id || '';
    if (v.nome)     v.nome.textContent = nome;
    if (v.endereco) v.endereco.textContent = endereco || '';
    if (v.idade)    v.idade.textContent = idade != null ? String(idade) : '';
    if (v.telefone) v.telefone.textContent = telefone || '';
  }

  function fillEditModal(c) {
    if (!c) return;
    const e = els.e;

    const id       = c.id ?? c.Id ?? 0;
    const nome     = c.nome ?? c.Nome ?? '';
    const endereco = c.endereco ?? c.Endereco ?? '';
    const idade    = c.idade ?? c.Idade ?? null;
    const telefone = c.telefone ?? c.Telefone ?? '';

    if (e.id)       e.id.value = id || '';
    if (e.nome)     e.nome.value = nome;
    if (e.endereco) e.endereco.value = endereco || '';
    if (e.idade)    e.idade.value = idade != null ? String(idade) : '';
    if (e.telefone) e.telefone.value = telefone || '';
  }

  function clearNewForm() {
    const n = els.n;
    Object.keys(n).forEach(k => {
      if (n[k]) n[k].value = '';
    });
  }

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
      Telefone: telefone || null,
    };
  }

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

  // -------------------------
  // INSTÂNCIA DO CrudList
  // -------------------------
  let list;

  const cfg = {
    endpoint: '/api/clientes',
    tableBodySelector: '#tb-clientes tbody',
    pagerInfoSelector: '#clientes-pg-info',
    pagerPrevSelector: '#clientes-pg-prev',
    pagerNextSelector: '#clientes-pg-next',
    filterColumnSelector: '#filter-column',
    filterTextSelector: '#filter-text',
    btnViewSelector: '#btn-view',
    btnEditSelector: '#btn-edit',
    btnNewSelector: '#btn-new',
    btnDeleteSelector: '#btn-delete',

    defaultColumn: 'nome',
    pageSize: 50,
    columnsCount: 5, // ID, Nome, Endereço, Idade, Telefone

    mapRow: (c) => {
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

    async onDelete(id) {
      if (!confirm('Deseja realmente excluir este cliente?')) return;
      try {
        const resp = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
        if (!resp.ok) {
          const txt = await resp.text();
          throw new Error(txt || 'Erro ao excluir cliente.');
        }
        await list.loadPage();
      } catch (err) {
        console.error(err);
        alert('Falha ao excluir cliente.');
      }
    },
  };

  list = new CrudList(cfg);

  // -------------------------
  // WIRE DOS MODAIS
  // -------------------------

  // modal visualizar
  els.viewCloseBtn?.addEventListener('click', () => closeModal(els.viewBackdrop));
  els.viewBackdrop?.addEventListener('click', ev => {
    if (ev.target === els.viewBackdrop) closeModal(els.viewBackdrop);
  });

  // modal editar
  els.editCloseBtn?.addEventListener('click', () => closeModal(els.editBackdrop));
  els.editCancelBtn?.addEventListener('click', () => closeModal(els.editBackdrop));
  els.editBackdrop?.addEventListener('click', ev => {
    if (ev.target === els.editBackdrop) closeModal(els.editBackdrop);
  });

  els.editForm?.addEventListener('submit', async ev => {
    ev.preventDefault();
    const idRaw = els.e.id?.value ?? '';
    const id = parseInt(idRaw || '0', 10);
    if (!id) {
      alert('ID inválido para edição.');
      return;
    }

    const payload = buildEditPayload();
    if (!payload.Nome || !payload.Nome.trim()) {
      alert('Nome é obrigatório.');
      return;
    }

    try {
      const resp = await fetch(`/api/clientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || 'Erro ao salvar alterações.');
      }
      closeModal(els.editBackdrop);
      await list.loadPage();
    } catch (err) {
      console.error(err);
      alert('Falha ao salvar alterações.');
    }
  });

  // modal novo
  els.newCloseBtn?.addEventListener('click', () => closeModal(els.newBackdrop));
  els.newCancelBtn?.addEventListener('click', () => closeModal(els.newBackdrop));
  els.newBackdrop?.addEventListener('click', ev => {
    if (ev.target === els.newBackdrop) closeModal(els.newBackdrop);
  });

  els.newForm?.addEventListener('submit', async ev => {
    ev.preventDefault();

    const payload = buildNewPayload();
    if (!payload.Nome || !payload.Nome.trim()) {
      alert('Nome é obrigatório.');
      return;
    }

    try {
      const resp = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || 'Erro ao criar cliente.');
      }
      closeModal(els.newBackdrop);
      list.state.page = 1;
      await list.loadPage();
    } catch (err) {
      console.error(err);
      alert('Falha ao criar cliente.');
    }
  });
})();
