import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { exportarParaCSV } from '../utils/exportar';
import { exportarParaPDF } from '../utils/exportarPDF';

const FORM_VAZIO = { tipo: '', cliente: '', resultado: '', data: '' };

export default function Analises() {
  const { pode } = useAuth();
  const podeCriar = pode('Análises', 'criar');
  const podeEditar = pode('Análises', 'editar');
  const podeExcluir = pode('Análises', 'excluir');

  const [itens, setItens] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const [filtroBusca, setFiltroBusca] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');

  const carregar = async () => {
    setLoading(true);
    try { setItens(await api.analises.listar()); }
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

  const limparFiltros = () => { setFiltroBusca(''); setFiltroDataInicio(''); setFiltroDataFim(''); };
  const formatarData = (d) => (d ? new Date(d).toLocaleDateString('pt-BR') : '-');

  const itensFiltrados = itens.filter(i => {
    const matchBusca = !filtroBusca ||
      i.tipo?.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      i.cliente?.toLowerCase().includes(filtroBusca.toLowerCase());
    let matchPeriodo = true;
    if (filtroDataInicio || filtroDataFim) {
      const dataItem = i.data ? new Date(i.data) : null;
      if (!dataItem) matchPeriodo = false;
      else {
        if (filtroDataInicio && dataItem < new Date(filtroDataInicio)) matchPeriodo = false;
        if (filtroDataFim && dataItem > new Date(filtroDataFim)) matchPeriodo = false;
      }
    }
    return matchBusca && matchPeriodo;
  });

  const gerarPDF = () => {
    const colunas = ['Tipo', 'Cliente', 'Resultado', 'Data'];
    const dados = itensFiltrados.map(i => [
      i.tipo || '-', i.cliente || '-', i.resultado || '-', formatarData(i.data)
    ]);
    exportarParaPDF('Relatório de Análises', colunas, dados, 'analises');
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Análises</h1>
          <p className="subtitulo">Registre e acompanhe análises técnicas.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => exportarParaCSV(itensFiltrados, 'analises')}>📥 CSV</button>
          <button className="btn" onClick={gerarPDF} style={{ background: '#dc2626', color: '#fff', border: 'none' }}>📄 PDF</button>
          {podeCriar && (<button className={mostrarForm ? 'btn btn-secondary' : 'btn btn-primary'} onClick={() => (mostrarForm ? handleCancelar() : setMostrarForm(true))}>{mostrarForm ? 'Cancelar' : '+ Nova análise'}</button>)}
        </div>
      </div>

      {mostrarForm && podeCriar && (
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

      <div className="filtros-bar">
        <input className="filtro-input" placeholder="🔍 Buscar..." value={filtroBusca} onChange={(e) => setFiltroBusca(e.target.value)} />
        <input type="date" className="filtro-select" value={filtroDataInicio} onChange={(e) => setFiltroDataInicio(e.target.value)} title="De" />
        <span style={{ color: '#718096', fontSize: '0.9rem' }}>até</span>
        <input type="date" className="filtro-select" value={filtroDataFim} onChange={(e) => setFiltroDataFim(e.target.value)} title="Até" />
        <button className="btn btn-secondary" onClick={limparFiltros}>Limpar</button>
      </div>

      <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '15px' }}>
        Mostrando <strong>{itensFiltrados.length}</strong> de <strong>{itens.length}</strong> análise(s).
      </p>

      {loading ? <div className="loading">Carregando...</div> : itensFiltrados.length === 0 ? (
        <div className="empty-message">Nenhuma análise encontrada.</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tipo</th><th>Cliente</th><th>Resultado</th><th>Data</th>
                {(podeEditar || podeExcluir) && <th style={{ width: '110px' }}>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {itensFiltrados.map(i => (
                <tr key={i.id}>
                  <td><strong>{i.tipo}</strong></td><td>{i.cliente || '-'}</td><td>{i.resultado || '-'}</td><td>{formatarData(i.data)}</td>
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