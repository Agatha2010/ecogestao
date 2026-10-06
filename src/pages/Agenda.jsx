import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const FORM_VAZIO = { titulo: '', data: '', hora: '', local: '', tipo: 'Reunião' };

export default function Agenda() {
  const [itens, setItens] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    setLoading(true);
    try { setItens(await api.agenda.listar()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { carregar(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editandoId) await api.agenda.atualizar(editandoId, form);
    else await api.agenda.criar(form);
    setForm(FORM_VAZIO); setEditandoId(null); setMostrarForm(false); carregar();
  };
  const handleEditar = (i) => {
    setForm({
      titulo: i.titulo || '',
      data: i.data ? i.data.substring(0, 10) : '',
      hora: i.hora ? i.hora.substring(0, 5) : '',
      local: i.local || '',
      tipo: i.tipo || 'Reunião'
    });
    setEditandoId(i.id); setMostrarForm(true);
  };
  const handleExcluir = async (id) => { if (window.confirm('Excluir?')) { await api.agenda.excluir(id); carregar(); } };
  const handleCancelar = () => { setForm(FORM_VAZIO); setEditandoId(null); setMostrarForm(false); };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Agenda</h1>
          <p className="subtitulo">Gerencie compromissos, reuniões e visitas técnicas.</p>
        </div>
        <button className={mostrarForm ? 'btn btn-secondary' : 'btn btn-primary'} onClick={() => (mostrarForm ? handleCancelar() : setMostrarForm(true))}>
          {mostrarForm ? 'Cancelar' : '+ Novo agendamento'}
        </button>
      </div>

      {mostrarForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>{editandoId ? 'Editar Agendamento' : 'Novo Agendamento'}</h3>
          <div className="form-grid">
            <div className="form-group"><label>Título *</label><input name="titulo" value={form.titulo} onChange={handleChange} required /></div>
            <div className="form-group"><label>Data *</label><input type="date" name="data" value={form.data} onChange={handleChange} required /></div>
            <div className="form-group"><label>Hora</label><input type="time" name="hora" value={form.hora} onChange={handleChange} /></div>
            <div className="form-group"><label>Local</label><input name="local" value={form.local} onChange={handleChange} /></div>
            <div className="form-group"><label>Tipo</label>
              <select name="tipo" value={form.tipo} onChange={handleChange}>
                <option>Reunião</option><option>Visita</option><option>Interno</option><option>Prazo</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-success">{editandoId ? 'Atualizar' : 'Salvar'}</button>
            <button type="button" className="btn btn-secondary" onClick={handleCancelar}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="panel">
        <div className="panel-header"><h3>Compromissos agendados</h3></div>
        {loading ? <div className="loading">Carregando...</div> : itens.length === 0 ? (
          <div className="empty-message">Nenhum compromisso agendado.</div>
        ) : (
          itens.map(i => {
            const dia = i.data ? i.data.substring(8, 10) : '--';
            const mesNome = i.data
              ? new Date(i.data).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()
              : '---';
            return (
              <div className="list-item" key={i.id}>
                <div className="list-item-info">
                  <h4>{i.titulo}</h4>
                  <div className="subtitulo">
                    {i.hora && `${i.hora.substring(0, 5)} — `}{i.local || 'Sem local'}
                  </div>
                </div>
                <div className="list-item-right">
                  <div className="data-badge">
                    {dia}
                    <div className="mes">{mesNome}</div>
                  </div>
                  <button className="btn-icon" onClick={() => handleEditar(i)}>✏️</button>
                  <button className="btn-icon" onClick={() => handleExcluir(i.id)}>🗑️</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}