import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const FORM_VAZIO = { numero: '', assunto: '', cliente: '', abertura: '', status: 'Aberto' };

export default function Protocolos() {
  const [itens, setItens] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    setLoading(true);
    try { setItens(await api.protocolos.listar()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) await api.protocolos.atualizar(editandoId, form);
      else await api.protocolos.criar(form);
      setForm(FORM_VAZIO); setEditandoId(null); setMostrarForm(false);
      carregar();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar protocolo.');
    }
  };

  const handleEditar = (i) => {
    setForm({
      numero: i.numero || '', assunto: i.assunto || '', cliente: i.cliente || '',
      abertura: i.abertura ? i.abertura.substring(0, 10) : '', status: i.status || 'Aberto'
    });
    setEditandoId(i.id); setMostrarForm(true);
  };

  const handleExcluir = async (id) => {
    if (!window.confirm('Excluir este protocolo?')) return;
    await api.protocolos.excluir(id);
    carregar();
  };

  const handleCancelar = () => { setForm(FORM_VAZIO); setEditandoId(null); setMostrarForm(false); };
  const formatarData = (d) => (d ? new Date(d).toLocaleDateString('pt-BR') : '-');
  const getPill = (s) => s === 'Concluído' ? 'status-normal' : s === 'Em Análise' ? 'status-atencao' : 'status-urgente';

  return (
    <div>
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Protocolos</h1>
          <p className="subtitulo">Acompanhe os protocolos abertos nos órgãos ambientais.</p>
        </div>
        <button className={mostrarForm ? 'btn btn-secondary' : 'btn btn-primary'} onClick={() => (mostrarForm ? handleCancelar() : setMostrarForm(true))}>
          {mostrarForm ? 'Cancelar' : '+ Novo protocolo'}
        </button>
      </div>

      {mostrarForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>{editandoId ? 'Editar Protocolo' : 'Novo Protocolo'}</h3>
          <div className="form-grid">
            <div className="form-group"><label>Número *</label><input name="numero" value={form.numero} onChange={handleChange} required /></div>
            <div className="form-group"><label>Assunto *</label><input name="assunto" value={form.assunto} onChange={handleChange} required /></div>
            <div className="form-group"><label>Cliente</label><input name="cliente" value={form.cliente} onChange={handleChange} /></div>
            <div className="form-group"><label>Data de Abertura</label><input type="date" name="abertura" value={form.abertura} onChange={handleChange} /></div>
            <div className="form-group"><label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option>Aberto</option><option>Em Análise</option><option>Concluído</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-success">{editandoId ? 'Atualizar' : 'Salvar'}</button>
            <button type="button" className="btn btn-secondary" onClick={handleCancelar}>Cancelar</button>
          </div>
        </form>
      )}

      {loading ? <div className="loading">Carregando...</div> : itens.length === 0 ? (
        <div className="empty-message">Nenhum protocolo cadastrado.</div>
      ) : (
        <div className="table-container">
          <table>
            <thead><tr><th>Número</th><th>Assunto</th><th>Cliente</th><th>Abertura</th><th>Status</th><th style={{ width: '100px' }}>Ações</th></tr></thead>
            <tbody>
              {itens.map(i => (
                <tr key={i.id}>
                  <td><strong>{i.numero}</strong></td>
                  <td>{i.assunto}</td>
                  <td>{i.cliente || '-'}</td>
                  <td>{formatarData(i.abertura)}</td>
                  <td><span className={`status-pill ${getPill(i.status)}`}>{i.status}</span></td>
                  <td>
                    <button className="btn-icon" onClick={() => handleEditar(i)}>✏️</button>
                    <button className="btn-icon" onClick={() => handleExcluir(i.id)}>🗑️</button>
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