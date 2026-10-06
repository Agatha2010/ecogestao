import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const FORM_VAZIO = { tipo: '', cliente: '', resultado: '', data: '' };

export default function Analises() {
  const [itens, setItens] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    setLoading(true);
    try { setItens(await api.analises.listar()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { carregar(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editandoId) await api.analises.atualizar(editandoId, form);
    else await api.analises.criar(form);
    setForm(FORM_VAZIO); setEditandoId(null); setMostrarForm(false); carregar();
  };
  const handleEditar = (i) => {
    setForm({ tipo: i.tipo || '', cliente: i.cliente || '', resultado: i.resultado || '', data: i.data ? i.data.substring(0, 10) : '' });
    setEditandoId(i.id); setMostrarForm(true);
  };
  const handleExcluir = async (id) => { if (window.confirm('Excluir?')) { await api.analises.excluir(id); carregar(); } };
  const handleCancelar = () => { setForm(FORM_VAZIO); setEditandoId(null); setMostrarForm(false); };
  const formatarData = (d) => (d ? new Date(d).toLocaleDateString('pt-BR') : '-');

  return (
    <div>
      <div className="page-header">
        <div className="page-header-titles"><h1>Análises</h1><p className="subtitulo">Registre e acompanhe análises técnicas.</p></div>
        <button className={mostrarForm ? 'btn btn-secondary' : 'btn btn-primary'} onClick={() => (mostrarForm ? handleCancelar() : setMostrarForm(true))}>
          {mostrarForm ? 'Cancelar' : '+ Nova análise'}
        </button>
      </div>

      {mostrarForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>{editandoId ? 'Editar Análise' : 'Nova Análise'}</h3>
          <div className="form-grid">
            <div className="form-group"><label>Tipo *</label><input name="tipo" value={form.tipo} onChange={handleChange} required /></div>
            <div className="form-group"><label>Cliente</label><input name="cliente" value={form.cliente} onChange={handleChange} /></div>
            <div className="form-group"><label>Data</label><input type="date" name="data" value={form.data} onChange={handleChange} /></div>
          </div>
          <div className="form-group" style={{ marginTop: '15px' }}>
            <label>Resultado</label>
            <textarea rows="3" name="resultado" value={form.resultado} onChange={handleChange} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-success">{editandoId ? 'Atualizar' : 'Salvar'}</button>
            <button type="button" className="btn btn-secondary" onClick={handleCancelar}>Cancelar</button>
          </div>
        </form>
      )}

      {loading ? <div className="loading">Carregando...</div> : (
        <div className="table-container">
          <table>
            <thead><tr><th>Tipo</th><th>Cliente</th><th>Resultado</th><th>Data</th><th style={{ width: '100px' }}>Ações</th></tr></thead>
            <tbody>
              {itens.map(i => (
                <tr key={i.id}>
                  <td><strong>{i.tipo}</strong></td>
                  <td>{i.cliente || '-'}</td>
                  <td>{i.resultado || '-'}</td>
                  <td>{formatarData(i.data)}</td>
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