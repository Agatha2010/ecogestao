import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const FORM_VAZIO = { nome: '', nome_popular: '', status: 'Comum', registro: '' };

export default function Especies() {
  const [itens, setItens] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    setLoading(true);
    try { setItens(await api.especies.listar()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { carregar(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editandoId) await api.especies.atualizar(editandoId, form);
    else await api.especies.criar(form);
    setForm(FORM_VAZIO); setEditandoId(null); setMostrarForm(false); carregar();
  };
  const handleEditar = (i) => {
    setForm({ nome: i.nome || '', nome_popular: i.nome_popular || '', status: i.status || 'Comum', registro: i.registro ? i.registro.substring(0, 10) : '' });
    setEditandoId(i.id); setMostrarForm(true);
  };
  const handleExcluir = async (id) => { if (window.confirm('Excluir?')) { await api.especies.excluir(id); carregar(); } };
  const handleCancelar = () => { setForm(FORM_VAZIO); setEditandoId(null); setMostrarForm(false); };
  const formatarData = (d) => (d ? new Date(d).toLocaleDateString('pt-BR') : '-');

  return (
    <div>
      <div className="page-header">
        <div className="page-header-titles"><h1>Espécies</h1><p className="subtitulo">Catálogo de espécies vegetais e animais monitoradas.</p></div>
        <button className={mostrarForm ? 'btn btn-secondary' : 'btn btn-primary'} onClick={() => (mostrarForm ? handleCancelar() : setMostrarForm(true))}>
          {mostrarForm ? 'Cancelar' : '+ Nova espécie'}
        </button>
      </div>

      {mostrarForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>{editandoId ? 'Editar Espécie' : 'Nova Espécie'}</h3>
          <div className="form-grid">
            <div className="form-group"><label>Nome científico *</label><input name="nome" value={form.nome} onChange={handleChange} required /></div>
            <div className="form-group"><label>Nome popular</label><input name="nome_popular" value={form.nome_popular} onChange={handleChange} /></div>
            <div className="form-group"><label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option>Comum</option><option>Ameaçada</option><option>Endêmica</option><option>Exótica</option>
              </select>
            </div>
            <div className="form-group"><label>Data de Registro</label><input type="date" name="registro" value={form.registro} onChange={handleChange} /></div>
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
            <thead><tr><th>Nome Científico</th><th>Nome Popular</th><th>Status</th><th>Registro</th><th style={{ width: '100px' }}>Ações</th></tr></thead>
            <tbody>
              {itens.map(i => (
                <tr key={i.id}>
                  <td><strong>{i.nome}</strong></td>
                  <td>{i.nome_popular || '-'}</td>
                  <td><span className={`status-pill ${i.status === 'Ameaçada' ? 'status-urgente' : i.status === 'Endêmica' ? 'status-atencao' : 'status-normal'}`}>{i.status}</span></td>
                  <td>{formatarData(i.registro)}</td>
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