import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const FORM_VAZIO = { numero: '', destinatario: '', assunto: '', data: '', status: 'Enviado' };

export default function Oficios() {
  const [itens, setItens] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    setLoading(true);
    try { setItens(await api.oficios.listar()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { carregar(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editandoId) await api.oficios.atualizar(editandoId, form);
    else await api.oficios.criar(form);
    setForm(FORM_VAZIO); setEditandoId(null); setMostrarForm(false); carregar();
  };

  const handleEditar = (i) => {
    setForm({
      numero: i.numero || '', destinatario: i.destinatario || '',
      assunto: i.assunto || '', data: i.data ? i.data.substring(0, 10) : '',
      status: i.status || 'Enviado'
    });
    setEditandoId(i.id); setMostrarForm(true);
  };

  const handleExcluir = async (id) => {
    if (!window.confirm('Excluir?')) return;
    await api.oficios.excluir(id); carregar();
  };

  const handleCancelar = () => { setForm(FORM_VAZIO); setEditandoId(null); setMostrarForm(false); };
  const formatarData = (d) => (d ? new Date(d).toLocaleDateString('pt-BR') : '-');

  return (
    <div>
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Ofícios</h1>
          <p className="subtitulo">Gerencie ofícios enviados e recebidos dos órgãos ambientais.</p>
        </div>
        <button className={mostrarForm ? 'btn btn-secondary' : 'btn btn-primary'} onClick={() => (mostrarForm ? handleCancelar() : setMostrarForm(true))}>
          {mostrarForm ? 'Cancelar' : '+ Novo ofício'}
        </button>
      </div>

      {mostrarForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>{editandoId ? 'Editar Ofício' : 'Novo Ofício'}</h3>
          <div className="form-grid">
            <div className="form-group"><label>Número *</label><input name="numero" value={form.numero} onChange={handleChange} required /></div>
            <div className="form-group"><label>Destinatário *</label><input name="destinatario" value={form.destinatario} onChange={handleChange} required /></div>
            <div className="form-group"><label>Assunto</label><input name="assunto" value={form.assunto} onChange={handleChange} /></div>
            <div className="form-group"><label>Data</label><input type="date" name="data" value={form.data} onChange={handleChange} /></div>
            <div className="form-group"><label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option>Enviado</option><option>Respondido</option><option>Pendente</option>
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
        <div className="empty-message">Nenhum ofício cadastrado.</div>
      ) : (
        <div className="table-container">
          <table>
            <thead><tr><th>Número</th><th>Destinatário</th><th>Assunto</th><th>Data</th><th>Status</th><th style={{ width: '100px' }}>Ações</th></tr></thead>
            <tbody>
              {itens.map(i => (
                <tr key={i.id}>
                  <td><strong>{i.numero}</strong></td>
                  <td>{i.destinatario}</td>
                  <td>{i.assunto || '-'}</td>
                  <td>{formatarData(i.data)}</td>
                  <td><span className={`status-pill ${i.status === 'Respondido' ? 'status-normal' : 'status-atencao'}`}>{i.status}</span></td>
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