const API_URL = 'http://localhost:3001/api';

// Função para pegar o nome do usuário logado
function getHeaders() {
  const user = JSON.parse(localStorage.getItem('usuario_logado'));
  return {
    'Content-Type': 'application/json',
    'x-usuario-nome': user?.nome || 'Sistema',
    'x-usuario-id': user?.id || ''
  };
}

function criarRecurso(nome) {
  return {
    listar: async () => {
      const res = await fetch(`${API_URL}/${nome}`);
      if (!res.ok) throw new Error(`Erro ao buscar ${nome}`);
      return res.json();
    },
    criar: async (data) => {
      const res = await fetch(`${API_URL}/${nome}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return res.json();
    },
    atualizar: async (id, data) => {
      const res = await fetch(`${API_URL}/${nome}/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return res.json();
    },
    excluir: async (id) => {
      const res = await fetch(`${API_URL}/${nome}/${id}`, { 
        method: 'DELETE',
        headers: getHeaders()
      });
      return res.json();
    }
  };
}

export const api = {
  // ============ CRUDs ============
  clientes: criarRecurso('clientes'),
  licencas: criarRecurso('licencas'),
  protocolos: criarRecurso('protocolos'),
  oficios: criarRecurso('oficios'),
  analises: criarRecurso('analises'),
  especies: criarRecurso('especies'),
  agenda: criarRecurso('agenda'),
  financeiro: criarRecurso('financeiro'),

  // ============ CONFIGURAÇÕES ============
  configuracoes: {
    buscar: async () => {
      const res = await fetch(`${API_URL}/configuracoes`);
      if (!res.ok) throw new Error('Erro ao buscar configurações');
      return res.json();
    },
    salvar: async (dados) => {
      const res = await fetch(`${API_URL}/configuracoes`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(dados)
      });
      return res.json();
    }
  },

  // ============ USUÁRIOS ============
  usuarios: {
    listar: async () => {
      const res = await fetch(`${API_URL}/usuarios`);
      return res.json();
    },
    buscar: async (id) => {
      const res = await fetch(`${API_URL}/usuarios/${id}`);
      return res.json();
    },
    criar: async (data) => {
      const res = await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return res.json();
    },
    atualizar: async (id, data) => {
      const res = await fetch(`${API_URL}/usuarios/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return res.json();
    },
    excluir: async (id) => {
      const res = await fetch(`${API_URL}/usuarios/${id}`, { 
        method: 'DELETE',
        headers: getHeaders()
      });
      return res.json();
    },
    alterarSenha: async (id, senhaAtual, novaSenha) => {
      const res = await fetch(`${API_URL}/usuarios/${id}/senha`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senhaAtual, novaSenha })
      });
      return res.json();
    },
    permissoes: {
      buscar: async (id) => {
        const res = await fetch(`${API_URL}/usuarios/${id}/permissoes`);
        return res.json();
      },
      salvar: async (id, permissoes) => {
        const res = await fetch(`${API_URL}/usuarios/${id}/permissoes`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({ permissoes })
        });
        return res.json();
      }
    }
  },

  // ============ LOGS ============
  logs: {
    listar: async () => {
      const res = await fetch(`${API_URL}/logs`);
      return res.json();
    }
  },

  // ============ LOGIN ============
  login: async (email, senha) => {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });
    return res.json();
  },

  // ============ COMPATIBILIDADE (formato antigo) ============
  getClientes: async () => (await fetch(`${API_URL}/clientes`)).json(),
  getLicencas: async () => (await fetch(`${API_URL}/licencas`)).json(),
  getStatus: async () => (await fetch(`${API_URL}/status`)).json(),
  createCliente: (data) => api.clientes.criar(data),
  updateCliente: (id, data) => api.clientes.atualizar(id, data),
  deleteCliente: (id) => api.clientes.excluir(id),
  createLicenca: (data) => api.licencas.criar(data),
  updateLicenca: (id, data) => api.licencas.atualizar(id, data),
  deleteLicenca: (id) => api.licencas.excluir(id)
};