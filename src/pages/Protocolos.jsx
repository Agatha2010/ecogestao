import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { exportarParaCSV } from '../utils/exportar';
import { exportarParaPDF } from '../utils/exportarPDF';

const FORM_VAZIO = { numero: '', assunto: '', cliente: '', abertura: '', status: 'Aberto' };

export default function Protocolos() {
  const { pode } = useAuth();
  const podeCriar = pode('Protocolos', 'criar');
  const podeEditar = pode('Protocolos', 'editar');
  const podeExcluir = pode('Protocolos', 'excluir');

  const [itens, setItens] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const [filtroBusca, setFiltroBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');

  const carregar = async () => {
    setLoading(true);
    try { setItens(await api.protocolos.listar()); }
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
    if (editandoId) await api.protocolos.atualizar(editandoId, form);
    else await api.protocolos.criar(form);
    setForm(FORM_VAZIO); setEditandoId(null); setMostrarForm(false); carregar();
  };
  const handleEditar = (i) => {
    setForm({
      numero: i.numero || '', assunto: i.assunto || '', cliente: i.cliente || '',
      abertura: i.abertura ? i.abertura.substring(0, 10) : '', status: i.status || 'Aberto'
    });
    setEditandoId(i.id); setMostrarForm(true);
  };
  const handleExcluir = async (id) => { if (window.confirm('Excluir?')) { await api.protocolos.excluir(id); carregar(); } };
  const handleCancelar = () => { setForm(FORM_VAZIO); setEditandoId(null); setMostrarForm(false); };

  const limparFiltros = () => {
    setFiltroBusca(''); setFiltroStatus('Todos'); setFiltroDataInicio(''); setFiltroDataFim('');
  };

  const formatarData = (d) => (d ? new Date(d).toLocaleDateString('pt-BR') : '-');
  const getPill = (s) => s === 'Concluído' ? 'status-normal' : s === 'Em Análise' ? 'status-atencao' : 'status-urgente';

  const itensFiltrados = itens.filter(i => {
    const matchBusca = !filtroBusca ||
      i.numero?.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      i.assunto?.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      i.cliente?.toLowerCase().includes(filtroBusca.toLowerCase());
    const matchStatus = filtroStatus === 'Todos' || i.status === filtroStatus;
    let matchPeriodo = true;
    if (filtroDataInicio || filtroDataFim) {
      const dataAbertura = i.abertura ? new Date(i.abertura) : null;
      if (!dataAbertura) matchPeriodo = false;
      else {
        if (filtroDataInicio && dataAbertura < new Date(filtroDataInicio)) matchPeriodo = false;
        if (filtroDataFim && dataAbertura > new Date(filtroDataFim)) matchPeriodo = false;
      }
    }
    return matchBusca && matchStatus && matchPeriodo;
  });

  const gerarPDF = () => {
    const colunas = ['Número', 'Assunto', 'Cliente', 'Abertura', 'Status'];
    const dados = itensFiltrados.map(i => [
      i.numero || '-', i.assunto || '-', i.cliente || '-', formatarData(i.abertura), i.status || '-'
    ]);
    exportarParaPDF('Relatório de Protocolos', colunas, dados, 'protocolos');
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Protocolos</h1>
          <p className="subtitulo">Acompanhe os protocolos abertos nos órgãos ambientais.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => exportarParaCSV(itensFiltrados, 'protocolos')}>📥 CSV</button>
          <button className="btn" onClick={gerarPDF} style={{ background: '#dc2626', color: '#fff', border: 'none' }}>📄 PDF</button>
          {podeCriar && (<button className={mostrarForm ? 'btn btn-secondary' : 'btn btn-primary'} onClick={() => (mostrarForm ? handleCancelar() : setMostrarForm(true))}>{mostrarForm ? 'Cancelar' : '+ Novo protocolo'}</button>)}
        </div>
      </div>

      {mostrarForm && podeCriar && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>{editandoId ? 'Editar Protocolo' : 'Novo Protocolo'}</h3>
          <div className="form-grid">
            <div className="form-group"><label>Número *</label><input name="numero" value={form.numero} onChange={handleChange} required /></div>
            <div className="form-group"><label>Assunto *</label><input name="assunto" value={form.assunto} onChange={handleChange} required /></div>
            <div className="form-group"><label>Cliente</label><input name="cliente" value={form.cliente} onChange={handleChange} /></div>
            <div className="form-group"><label>Data de Abertura</label><input type="date" name="abertura" value={form.abertura} onChange={handleChange} /></div>
            <div className="form-group"><label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}><option>Aberto</option><option>Em Análise</option><option>Concluído</option></select>
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
        <select className="filtro-select" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
          <option value="Todos">Todos os status</option>
          <option value="Aberto">Aberto</option>
          <option value="Em Análise">Em Análise</option>
          <option value="Concluído">Concluído</option>
        </select>
        <input type="date" className="filtro-select" value={filtroDataInicio} onChange={(e) => setFiltroDataInicio(e.target.value)} title="De" />
        <span style={{ color: '#718096', fontSize: '0.9rem' }}>até</span>
        <input type="date" className="filtro-select" value={filtroDataFim} onChange={(e) => setFiltroDataFim(e.target.value)} title="Até" />
        <button className="btn btn-secondary" onClick={limparFiltros}>Limpar</button>
      </div>

      <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '15px' }}>
        Mostrando <strong>{itensFiltrados.length}</strong> de <strong>{itens.length}</strong> protocolo(s).
      </p>

      {loading ? <div className="loading">Carregando...</div> : itensFiltrados.length === 0 ? (
        <div className="empty-message">Nenhum protocolo encontrado.</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Número</th><th>Assunto</th><th>Cliente</th><th>Abertura</th><th>Status</th>
                {(podeEditar || podeExcluir) && <th style={{ width: '110px' }}>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {itensFiltrados.map(i => (
                <tr key={i.id}>
                  <td><strong>{i.numero}</strong></td><td>{i.assunto}</td><td>{i.cliente || '-'}</td><td>{formatarData(i.abertura)}</td>
                  <td><span className={`status-pill ${getPill(i.status)}`}>{i.status}</span></td>
                  {(podeEditar || podeExcluir) && (
                    <td><div className="acoes-cell">
                      {podeEditar && (<button className="btn-icon" onClick={() => handleEditar(i)} title="Editar"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>)}
                      {podeExcluir && (<button className="btn-icon danger" onClick={() => handleExcluir(i.id)} title="Excluir"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg></button>)}
                    </div></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}