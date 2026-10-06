// src/services/api.js

const API_URL = 'http://localhost:3001/api';

// Função que cria os métodos CRUD para qualquer recurso
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    atualizar: async (id, data) => {
      const res = await fetch(`${API_URL}/${nome}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    excluir: async (id) => {
      const res = await fetch(`${API_URL}/${nome}/${id}`, { method: 'DELETE' });
      return res.json();
    }
  };
}

export const api = {
  // ============ RECURSOS CRUD (padrão novo) ============
  clientes: criarRecurso('clientes'),
  licencas: criarRecurso('licencas'),
  protocolos: criarRecurso('protocolos'),
  oficios: criarRecurso('oficios'),
  analises: criarRecurso('analises'),
  especies: criarRecurso('especies'),
  agenda: criarRecurso('agenda'),
  financeiro: criarRecurso('financeiro'),

  // ============ COMPATIBILIDADE (formato antigo) ============
  // Mantido para o Dashboard e código que usa o formato antigo
  getClientes: async () => (await fetch(`${API_URL}/clientes`)).json(),
  getLicencas: async () => (await fetch(`${API_URL}/licencas`)).json(),
  getStatus: async () => (await fetch(`${API_URL}/status`)).json(),

  // Formato antigo — também funciona (chama os recursos novos por dentro)
  createCliente: (data) => api.clientes.criar(data),
  updateCliente: (id, data) => api.clientes.atualizar(id, data),
  deleteCliente: (id) => api.clientes.excluir(id),

  createLicenca: (data) => api.licencas.criar(data),
  updateLicenca: (id, data) => api.licencas.atualizar(id, data),
  deleteLicenca: (id) => api.licencas.excluir(id),
};