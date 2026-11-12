import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { exportarParaCSV } from '../utils/exportar';
import { exportarParaPDF } from '../utils/exportarPDF';

const FORM_VAZIO = { numero: '', cliente: '', orgao: '', emissao: '', vencimento: '', descricao: '', status: 'Ativo' };

export default function Licencas() {
  const { pode } = useAuth();
  const podeCriar = pode('Licenças', 'criar');
  const podeEditar = pode('Licenças', 'editar');
  const podeExcluir = pode('Licenças', 'excluir');

  const [itens, setItens] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const [filtroBusca, setFiltroBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [filtroVencimento, setFiltroVencimento] = useState('Todos');

  const carregar = async () => {
    setLoading(true);
    try { setItens(await api.licencas.listar()); }
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
    if (editandoId) await api.licencas.atualizar(editandoId, form);
    else await api.licencas.criar(form);
    setForm(FORM_VAZIO); setEditandoId(null); setMostrarForm(false); carregar();
  };
  const handleEditar = (l) => {
    setForm({
      numero: l.numero || '', cliente: l.cliente || '', orgao: l.orgao || '',
      emissao: l.emissao ? l.emissao.substring(0, 10) : '',
      vencimento: l.vencimento ? l.vencimento.substring(0, 10) : '',
      descricao: l.descricao || '', status: l.status || 'Ativo'
    });
    setEditandoId(l.id); setMostrarForm(true);
  };
  const handleExcluir = async (id) => { if (window.confirm('Excluir?')) { await api.licencas.excluir(id); carregar(); } };
  const handleCancelar = () => { setForm(FORM_VAZIO); setEditandoId(null); setMostrarForm(false); };

  const limparFiltros = () => {
    setFiltroBusca('');
    setFiltroStatus('Todos');
    setFiltroVencimento('Todos');
  };

  const formatarData = (d) => (d ? new Date(d).toLocaleDateString('pt-BR') : '-');
  const diasRestantes = (v) => { if (!v) return null; return Math.ceil((new Date(v) - new Date()) / (1000 * 60 * 60 * 24)); };
  const getStatusPill = (v) => {
    const dias = diasRestantes(v);
    if (dias === null) return 'status-normal';
    if (dias < 0) return 'status-urgente';
    if (dias <= 30) return 'status-atencao';
    return 'status-normal';
  };

  const itensFiltrados = itens.filter(l => {
    const matchBusca = !filtroBusca ||
      l.numero?.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      l.cliente?.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      l.orgao?.toLowerCase().includes(filtroBusca.toLowerCase());
    const matchStatus = filtroStatus === 'Todos' || l.status === filtroStatus;
    
    let matchVencimento = true;
    if (filtroVencimento !== 'Todos') {
      const dias = diasRestantes(l.vencimento);
      if (dias === null) matchVencimento = false;
      else if (filtroVencimento === 'Vencidas') matchVencimento = dias < 0;
      else if (filtroVencimento === 'Vencendo 30 dias') matchVencimento = dias >= 0 && dias <= 30;
      else if (filtroVencimento === 'No prazo') matchVencimento = dias > 30;
    }
    return matchBusca && matchStatus && matchVencimento;
  });

  const gerarPDF = () => {
    const colunas = ['Número', 'Cliente', 'Órgão', 'Vencimento', 'Status'];
    const dados = itensFiltrados.map(l => [
      l.numero || '-',
      l.cliente || '-',
      l.orgao || '-',
      formatarData(l.vencimento),
      l.status || '-'
    ]);
    exportarParaPDF('Relatório de Licenças Ambientais', colunas, dados, 'licencas');
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Licenças Ambientais</h1>
          <p className="subtitulo">Gerencie todas as licenças dos seus clientes.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => exportarParaCSV(itensFiltrados, 'licencas')}>📥 CSV</button>
          <button className="btn" onClick={gerarPDF} style={{ background: '#dc2626', color: '#fff', border: 'none' }}>📄 PDF</button>
          {podeCriar && (
            <button className={mostrarForm ? 'btn btn-secondary' : 'btn btn-primary'} onClick={() => (mostrarForm ? handleCancelar() : setMostrarForm(true))}>
              {mostrarForm ? 'Cancelar' : '+ Nova licença'}
            </button>
          )}
        </div>
      </div>

      {mostrarForm && podeCriar && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>{editandoId ? 'Editar Licença' : 'Cadastrar Nova Licença'}</h3>
          <div className="form-grid">
            <div className="form-group"><label>Número *</label><input name="numero" value={form.numero} onChange={handleChange} required /></div>
            <div className="form-group"><label>Cliente</label><input name="cliente" value={form.cliente} onChange={handleChange} /></div>
            <div className="form-group"><label>Órgão Emissor</label><input name="orgao" value={form.orgao} onChange={handleChange} /></div>
            <div className="form-group"><label>Emissão</label><input type="date" name="emissao" value={form.emissao} onChange={handleChange} /></div>
            <div className="form-group"><label>Vencimento</label><input type="date" name="vencimento" value={form.vencimento} onChange={handleChange} /></div>
            <div className="form-group"><label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option>Ativo</option><option>Inativo</option><option>Em Renovação</option><option>Vencido</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-success">{editandoId ? 'Atualizar' : 'Salvar Licença'}</button>
            <button type="button" className="btn btn-secondary" onClick={handleCancelar}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="filtros-bar">
        <input className="filtro-input" placeholder="🔍 Buscar..." value={filtroBusca} onChange={(e) => setFiltroBusca(e.target.value)} />
        <select className="filtro-select" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
          <option value="Todos">Todos os status</option>
          <option value="Ativo">Ativo</option>
          <option value="Inativo">Inativo</option>
          <option value="Em Renovação">Em Renovação</option>
          <option value="Vencido">Vencido</option>
        </select>
        <select className="filtro-select" value={filtroVencimento} onChange={(e) => setFiltroVencimento(e.target.value)}>
          <option value="Todos">Todos os vencimentos</option>
          <option value="Vencidas">Vencidas</option>
          <option value="Vencendo 30 dias">Vencendo em 30 dias</option>
          <option value="No prazo">No prazo</option>
        </select>
        <button className="btn btn-secondary" onClick={limparFiltros}>Limpar</button>
      </div>

      <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '15px' }}>
        Mostrando <strong>{itensFiltrados.length}</strong> de <strong>{itens.length}</strong> licença(s).
      </p>

      {loading ? <div className="loading">Carregando...</div> : itensFiltrados.length === 0 ? (
        <div className="empty-message">Nenhuma licença encontrada.</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Número</th><th>Cliente</th><th>Órgão</th><th>Vencimento</th><th>Status</th>
                {(podeEditar || podeExcluir) && <th style={{ width: '110px' }}>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {itensFiltrados.map(l => (
                <tr key={l.id}>
                  <td><strong>{l.numero}</strong></td>
                  <td>{l.cliente || '-'}</td>
                  <td>{l.orgao || '-'}</td>
                  <td>{formatarData(l.vencimento)}</td>
                  <td><span className={`status-pill ${getStatusPill(l.vencimento)}`}>{l.status}</span></td>
                  {(podeEditar || podeExcluir) && (
                    <td>
                      <div className="acoes-cell">
                        {podeEditar && (<button className="btn-icon" onClick={() => handleEditar(l)} title="Editar"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>)}
                        {podeExcluir && (<button className="btn-icon danger" onClick={() => handleExcluir(l.id)} title="Excluir"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg></button>)}
                      </div>
                    </td>
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