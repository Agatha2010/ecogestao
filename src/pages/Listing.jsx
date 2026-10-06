import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Header from '../components/Header';

const FORM_VAZIO = {
  nome: '',
  tipo: 'Pessoa Física',
  cpf_cnpj: '',
  email: '',
  telefone: '',
  endereco: '',
  cidade: '',
  estado: '',
  observacoes: ''
};

export default function Listing() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  const carregar = async () => {
    setLoading(true);
    try {
      const data = await api.getClientes();
      setClientes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) await api.updateCliente(editandoId, form);
      else await api.createCliente(form);
      setForm(FORM_VAZIO);
      setEditandoId(null);
      setMostrarForm(false);
      carregar();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditar = (c) => {
    setForm({
      nome: c.nome || '', tipo: c.tipo || 'Pessoa Física',
      cpf_cnpj: c.cpf_cnpj || '', email: c.email || '',
      telefone: c.telefone || '', endereco: c.endereco || '',
      cidade: c.cidade || '', estado: c.estado || '',
      observacoes: c.observacoes || ''
    });
    setEditandoId(c.id);
    setMostrarForm(true);
  };

  const handleExcluir = async (id) => {
    if (!window.confirm('Excluir este cliente?')) return;
    await api.deleteCliente(id);
    carregar();
  };

  const handleCancelar = () => {
    setForm(FORM_VAZIO);
    setEditandoId(null);
    setMostrarForm(false);
  };

  const clientesFiltrados = clientes.filter(c =>
    c.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    c.email?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Clientes</h1>
          <p className="subtitulo">Aqui você encontra tudo sobre seus clientes.</p>
        </div>
        <button
          className={mostrarForm ? 'btn btn-secondary' : 'btn btn-primary'}
          onClick={() => (mostrarForm ? handleCancelar() : setMostrarForm(true))}
        >
          {mostrarForm ? 'Cancelar' : '+ Novo cliente'}
        </button>
      </div>

      {mostrarForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>{editandoId ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}</h3>

          <div className="form-grid">
            <div className="form-group">
              <label>Nome *</label>
              <input name="nome" value={form.nome} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Tipo *</label>
              <select name="tipo" value={form.tipo} onChange={handleChange}>
                <option>Pessoa Física</option>
                <option>Pessoa Jurídica</option>
              </select>
            </div>
            <div className="form-group">
              <label>CPF/CNPJ</label>
              <input name="cpf_cnpj" value={form.cpf_cnpj} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <input name="telefone" value={form.telefone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Endereço</label>
              <input name="endereco" value={form.endereco} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Cidade</label>
              <input name="cidade" value={form.cidade} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Estado</label>
              <input name="estado" value={form.estado} onChange={handleChange} maxLength={2} />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-success">
              {editandoId ? 'Atualizar' : 'Salvar Cliente'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleCancelar}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div style={{ marginBottom: '15px' }}>
        <input
          placeholder="🔍 Buscar cliente..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{
            padding: '11px 15px',
            width: '100%',
            border: '1px solid var(--cinza-borda)',
            borderRadius: '8px',
            fontSize: '0.9rem',
            background: '#fff'
          }}
        />
      </div>

      {loading ? (
        <div className="loading">Carregando clientes...</div>
      ) : clientesFiltrados.length === 0 ? (
        <div className="empty-message">
          {busca ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado ainda.'}
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nome / Razão Social</th>
                <th>Documento</th>
                <th>Endereço</th>
                <th style={{ width: '100px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.nome}</strong></td>
                  <td>{c.cpf_cnpj || '-'}</td>
                  <td>{c.endereco || 'Endereço não disponível'}</td>
                  <td>
                    <button className="btn-icon" onClick={() => handleEditar(c)} title="Editar">✏️</button>
                    <button className="btn-icon" onClick={() => handleExcluir(c.id)} title="Excluir">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}