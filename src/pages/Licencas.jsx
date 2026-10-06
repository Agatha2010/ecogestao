import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Header from '../components/Header';

const FORM_VAZIO = {
  numero: '', cliente: '', orgao: '',
  emissao: '', vencimento: '', descricao: '', status: 'Ativo'
};

export default function Licencas() {
  const [licencas, setLicencas] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    setLoading(true);
    try {
      const data = await api.getLicencas();
      setLicencas(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) await api.updateLicenca(editandoId, form);
      else await api.createLicenca(form);
      setForm(FORM_VAZIO);
      setEditandoId(null);
      setMostrarForm(false);
      carregar();
    } catch (err) { console.error(err); }
  };

  const handleEditar = (l) => {
    setForm({
      numero: l.numero || '', cliente: l.cliente || '', orgao: l.orgao || '',
      emissao: l.emissao ? l.emissao.substring(0, 10) : '',
      vencimento: l.vencimento ? l.vencimento.substring(0, 10) : '',
      descricao: l.descricao || '', status: l.status || 'Ativo'
    });
    setEditandoId(l.id);
    setMostrarForm(true);
  };

  const handleExcluir = async (id) => {
    if (!window.confirm('Excluir esta licença?')) return;
    await api.deleteLicenca(id);
    carregar();
  };

  const handleCancelar = () => {
    setForm(FORM_VAZIO);
    setEditandoId(null);
    setMostrarForm(false);
  };

  const formatarData = (d) => (d ? new Date(d).toLocaleDateString('pt-BR') : '-');

  const diasRestantes = (v) => {
    if (!v) return null;
    return Math.ceil((new Date(v) - new Date()) / (1000 * 60 * 60 * 24));
  };

  const getStatusPill = (v) => {
    const dias = diasRestantes(v);
    if (dias === null) return 'status-normal';
    if (dias < 0) return 'status-urgente';
    if (dias <= 30) return 'status-atencao';
    return 'status-normal';
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Licenças Ambientais</h1>
          <p className="subtitulo">Gerencie todas as licenças dos seus clientes.</p>
        </div>
        <button
          className={mostrarForm ? 'btn btn-secondary' : 'btn btn-primary'}
          onClick={() => (mostrarForm ? handleCancelar() : setMostrarForm(true))}
        >
          {mostrarForm ? 'Cancelar' : '+ Nova licença'}
        </button>
      </div>

      {mostrarForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>{editandoId ? 'Editar Licença' : 'Cadastrar Nova Licença'}</h3>

          <div className="form-grid">
            <div className="form-group">
              <label>Número *</label>
              <input name="numero" value={form.numero} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Cliente</label>
              <input name="cliente" value={form.cliente} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Órgão Emissor</label>
              <input name="orgao" value={form.orgao} onChange={handleChange} placeholder="IBAMA, CETESB..." />
            </div>
            <div className="form-group">
              <label>Emissão</label>
              <input type="date" name="emissao" value={form.emissao} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Vencimento</label>
              <input type="date" name="vencimento" value={form.vencimento} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option>Ativo</option>
                <option>Inativo</option>
                <option>Em Renovação</option>
                <option>Vencido</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-success">
              {editandoId ? 'Atualizar' : 'Salvar Licença'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleCancelar}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="loading">Carregando licenças...</div>
      ) : licencas.length === 0 ? (
        <div className="empty-message">Nenhuma licença cadastrada ainda.</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Cliente</th>
                <th>Órgão</th>
                <th>Vencimento</th>
                <th>Status</th>
                <th style={{ width: '100px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {licencas.map(l => (
                <tr key={l.id}>
                  <td><strong>{l.numero}</strong></td>
                  <td>{l.cliente || '-'}</td>
                  <td>{l.orgao || '-'}</td>
                  <td>{formatarData(l.vencimento)}</td>
                  <td>
                    <span className={`status-pill ${getStatusPill(l.vencimento)}`}>
                      {l.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => handleEditar(l)}>✏️</button>
                    <button className="btn-icon" onClick={() => handleExcluir(l.id)}>🗑️</button>
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