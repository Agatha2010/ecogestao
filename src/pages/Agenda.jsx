import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { exportarParaCSV } from '../utils/exportar';
import { exportarParaPDF } from '../utils/exportarPDF';

const FORM_VAZIO = { titulo: '', data: '', hora: '', local: '', tipo: 'Reunião' };

export default function Agenda() {
  const { pode } = useAuth();
  const podeCriar = pode('Agenda', 'criar');
  const podeEditar = pode('Agenda', 'editar');
  const podeExcluir = pode('Agenda', 'excluir');

  const [itens, setItens] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const [filtroBusca, setFiltroBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');

  const carregar = async () => {
    setLoading(true);
    try { setItens(await api.agenda.listar()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { carregar(); }, []);

  useEffect(() => {
    if (searchParams.get('novo') === 'true' && podeCriar) setMostrarForm(true);
  }, [searchParams, podeCriar]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editandoId) await api.agenda.atualizar(editandoId, form);
    else await api.agenda.criar(form);
    setForm(FORM_VAZIO); setEditandoId(null); setMostrarForm(false); carregar();
  };
  const handleEditar = (i) => {
    setForm({
      titulo: i.titulo || '', data: i.data ? i.data.substring(0, 10) : '',
      hora: i.hora ? i.hora.substring(0, 5) : '', local: i.local || '', tipo: i.tipo || 'Reunião'
    });
    setEditandoId(i.id); setMostrarForm(true);
  };
  const handleExcluir = async (id) => { if (window.confirm('Excluir?')) { await api.agenda.excluir(id); carregar(); } };
  const handleCancelar = () => { setForm(FORM_VAZIO); setEditandoId(null); setMostrarForm(false); };

  const limparFiltros = () => { setFiltroBusca(''); setFiltroTipo('Todos'); setFiltroDataInicio(''); setFiltroDataFim(''); };
  const formatarData = (d) => (d ? new Date(d).toLocaleDateString('pt-BR') : '-');

  const itensFiltrados = itens.filter(i => {
    const matchBusca = !filtroBusca ||
      i.titulo?.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      i.local?.toLowerCase().includes(filtroBusca.toLowerCase());
    const matchTipo = filtroTipo === 'Todos' || i.tipo === filtroTipo;
    let matchPeriodo = true;
    if (filtroDataInicio || filtroDataFim) {
      const dataItem = i.data ? new Date(i.data) : null;
      if (!dataItem) matchPeriodo = false;
      else {
        if (filtroDataInicio && dataItem < new Date(filtroDataInicio)) matchPeriodo = false;
        if (filtroDataFim && dataItem > new Date(filtroDataFim)) matchPeriodo = false;
      }
    }
    return matchBusca && matchTipo && matchPeriodo;
  });

  const gerarPDF = () => {
    const colunas = ['Título', 'Data', 'Hora', 'Local', 'Tipo'];
    const dados = itensFiltrados.map(i => [
      i.titulo || '-',
      formatarData(i.data),
      i.hora ? i.hora.substring(0, 5) : '-',
      i.local || '-',
      i.tipo || '-'
    ]);
    exportarParaPDF('Relatório de Agenda', colunas, dados, 'agenda');
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Agenda</h1>
          <p className="subtitulo">Compromissos, reuniões e visitas técnicas.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => exportarParaCSV(itensFiltrados, 'agenda')}>📥 CSV</button>
          <button className="btn" onClick={gerarPDF} style={{ background: '#dc2626', color: '#fff', border: 'none' }}>📄 PDF</button>
          {podeCriar && (<button className={mostrarForm ? 'btn btn-secondary' : 'btn btn-primary'} onClick={() => (mostrarForm ? handleCancelar() : setMostrarForm(true))}>{mostrarForm ? 'Cancelar' : '+ Novo agendamento'}</button>)}
        </div>
      </div>

      {mostrarForm && podeCriar && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>{editandoId ? 'Editar Agendamento' : 'Novo Agendamento'}</h3>
          <div className="form-grid">
            <div className="form-group"><label>Título *</label><input name="titulo" value={form.titulo} onChange={handleChange} required /></div>
            <div className="form-group"><label>Data *</label><input type="date" name="data" value={form.data} onChange={handleChange} required /></div>
            <div className="form-group"><label>Hora</label><input type="time" name="hora" value={form.hora} onChange={handleChange} /></div>
            <div className="form-group"><label>Local</label><input name="local" value={form.local} onChange={handleChange} /></div>
            <div className="form-group"><label>Tipo</label>
              <select name="tipo" value={form.tipo} onChange={handleChange}><option>Reunião</option><option>Visita</option><option>Interno</option><option>Prazo</option></select>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-success">{editandoId ? 'Atualizar' : 'Salvar'}</button>
            <button type="button" className="btn btn-secondary" onClick={handleCancelar}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="filtros-bar">
        <input className="filtro-input" placeholder="🔍 Buscar..." value={filtroBusca} onChange={(e) => setFiltroBusca(e.target.value)} />
        <select className="filtro-select" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
          <option value="Todos">Todos os tipos</option>
          <option value="Reunião">Reunião</option>
          <option value="Visita">Visita</option>
          <option value="Interno">Interno</option>
          <option value="Prazo">Prazo</option>
        </select>
        <input type="date" className="filtro-select" value={filtroDataInicio} onChange={(e) => setFiltroDataInicio(e.target.value)} title="De" />
        <span style={{ color: '#718096', fontSize: '0.9rem' }}>até</span>
        <input type="date" className="filtro-select" value={filtroDataFim} onChange={(e) => setFiltroDataFim(e.target.value)} title="Até" />
        <button className="btn btn-secondary" onClick={limparFiltros}>Limpar</button>
      </div>

      <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '15px' }}>
        Mostrando <strong>{itensFiltrados.length}</strong> de <strong>{itens.length}</strong> compromisso(s).
      </p>

      <div className="panel">
        <div className="panel-header"><h3>Compromissos agendados</h3></div>
        {loading ? <div className="loading">Carregando...</div> : itensFiltrados.length === 0 ? (
          <div className="empty-message">Nenhum compromisso encontrado.</div>
        ) : (
          itensFiltrados.map(i => {
            const dia = i.data ? i.data.substring(8, 10) : '--';
            const mesNome = i.data ? new Date(i.data).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase() : '---';
            return (
              <div className="list-item" key={i.id}>
                <div className="list-item-info">
                  <h4>{i.titulo}</h4>
                  <div className="subtitulo">{i.hora && `${i.hora.substring(0, 5)} — `}{i.local || 'Sem local'}</div>
                </div>
                <div className="list-item-right">
                  <div className="data-badge">{dia}<div className="mes">{mesNome}</div></div>
                  {(podeEditar || podeExcluir) && (
                    <div className="acoes-cell">
                      {podeEditar && (<button className="btn-icon" onClick={() => handleEditar(i)} title="Editar"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>)}
                      {podeExcluir && (<button className="btn-icon danger" onClick={() => handleExcluir(i.id)} title="Excluir"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg></button>)}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}