import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { exportarParaCSV } from '../utils/exportar';
import { exportarParaPDF } from '../utils/exportarPDF';

const FORM_VAZIO = { descricao: '', cliente: '', valor: '', tipo: 'Receita', data: '', status: 'Pendente' };

export default function Financeiro() {
  const { pode } = useAuth();
  const podeCriar = pode('Financeiro', 'criar');
  const podeEditar = pode('Financeiro', 'editar');
  const podeExcluir = pode('Financeiro', 'excluir');

  const [itens, setItens] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const [filtroBusca, setFiltroBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [filtroStatus, setFiltroStatus] = useState('Todos');

  const carregar = async () => {
    setLoading(true);
    try { setItens(await api.financeiro.listar()); }
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
    const dados = { ...form, valor: parseFloat(form.valor) || 0 };
    if (editandoId) await api.financeiro.atualizar(editandoId, dados);
    else await api.financeiro.criar(dados);
    setForm(FORM_VAZIO); setEditandoId(null); setMostrarForm(false); carregar();
  };
  const handleEditar = (i) => {
    setForm({
      descricao: i.descricao || '', cliente: i.cliente || '', valor: String(i.valor || ''),
      tipo: i.tipo || 'Receita', data: i.data ? i.data.substring(0, 10) : '', status: i.status || 'Pendente'
    });
    setEditandoId(i.id); setMostrarForm(true);
  };
  const handleExcluir = async (id) => { if (window.confirm('Excluir?')) { await api.financeiro.excluir(id); carregar(); } };
  const handleCancelar = () => { setForm(FORM_VAZIO); setEditandoId(null); setMostrarForm(false); };

  const limparFiltros = () => { setFiltroBusca(''); setFiltroTipo('Todos'); setFiltroStatus('Todos'); };
  const formatarMoeda = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatarData = (d) => (d ? new Date(d).toLocaleDateString('pt-BR') : '-');

  const itensFiltrados = itens.filter(i => {
    const matchBusca = !filtroBusca ||
      i.descricao?.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      i.cliente?.toLowerCase().includes(filtroBusca.toLowerCase());
    const matchTipo = filtroTipo === 'Todos' || i.tipo === filtroTipo;
    const matchStatus = filtroStatus === 'Todos' || i.status === filtroStatus;
    return matchBusca && matchTipo && matchStatus;
  });

  const totalReceitas = itensFiltrados.filter(i => i.tipo === 'Receita').reduce((s, i) => s + Number(i.valor), 0);
  const totalDespesas = itensFiltrados.filter(i => i.tipo === 'Despesa').reduce((s, i) => s + Number(i.valor), 0);
  const saldo = totalReceitas - totalDespesas;

  const gerarPDF = () => {
    const colunas = ['Descrição', 'Cliente', 'Tipo', 'Valor', 'Data', 'Status'];
    const dados = itensFiltrados.map(i => [
      i.descricao || '-',
      i.cliente || '-',
      i.tipo || '-',
      formatarMoeda(i.valor),
      formatarData(i.data),
      i.status || '-'
    ]);
    exportarParaPDF('Relatório Financeiro', colunas, dados, 'financeiro');
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-titles">
          <h1>Financeiro</h1>
          <p className="subtitulo">Controle receitas, despesas e pagamentos.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => exportarParaCSV(itensFiltrados, 'financeiro')}>📥 CSV</button>
          <button className="btn" onClick={gerarPDF} style={{ background: '#dc2626', color: '#fff', border: 'none' }}>📄 PDF</button>
          {podeCriar && (<button className={mostrarForm ? 'btn btn-secondary' : 'btn btn-primary'} onClick={() => (mostrarForm ? handleCancelar() : setMostrarForm(true))}>{mostrarForm ? 'Cancelar' : '+ Novo lançamento'}</button>)}
        </div>
      </div>

      <div className="cards-grid">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#d4edda' }}><span style={{ fontSize: '1.4rem' }}>💰</span></div>
          <div className="stat-card-content"><h3>Receitas (filtro)</h3><div className="value" style={{ color: '#16a34a', fontSize: '1.4rem' }}>{formatarMoeda(totalReceitas)}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#fee2e2' }}><span style={{ fontSize: '1.4rem' }}>📉</span></div>
          <div className="stat-card-content"><h3>Despesas (filtro)</h3><div className="value" style={{ color: '#dc2626', fontSize: '1.4rem' }}>{formatarMoeda(totalDespesas)}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#e0e7ff' }}><span style={{ fontSize: '1.4rem' }}>📊</span></div>
          <div className="stat-card-content"><h3>Saldo (filtro)</h3><div className="value" style={{ color: saldo >= 0 ? '#16a34a' : '#dc2626', fontSize: '1.4rem' }}>{formatarMoeda(saldo)}</div></div>
        </div>
      </div>

      {mostrarForm && podeCriar && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>{editandoId ? 'Editar Lançamento' : 'Novo Lançamento'}</h3>
          <div className="form-grid">
            <div className="form-group"><label>Descrição *</label><input name="descricao" value={form.descricao} onChange={handleChange} required /></div>
            <div className="form-group"><label>Cliente</label><input name="cliente" value={form.cliente} onChange={handleChange} /></div>
            <div className="form-group"><label>Valor (R$) *</label><input type="number" step="0.01" name="valor" value={form.valor} onChange={handleChange} required /></div>
            <div className="form-group"><label>Tipo</label><select name="tipo" value={form.tipo} onChange={handleChange}><option>Receita</option><option>Despesa</option></select></div>
            <div className="form-group"><label>Data</label><input type="date" name="data" value={form.data} onChange={handleChange} /></div>
            <div className="form-group"><label>Status</label><select name="status" value={form.status} onChange={handleChange}><option>Pendente</option><option>Pago</option><option>Atrasado</option></select></div>
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
          <option value="Receita">Receitas</option>
          <option value="Despesa">Despesas</option>
        </select>
        <select className="filtro-select" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
          <option value="Todos">Todos os status</option>
          <option value="Pago">Pago</option>
          <option value="Pendente">Pendente</option>
          <option value="Atrasado">Atrasado</option>
        </select>
        <button className="btn btn-secondary" onClick={limparFiltros}>Limpar</button>
      </div>

      <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '15px' }}>
        Mostrando <strong>{itensFiltrados.length}</strong> de <strong>{itens.length}</strong> lançamento(s).
      </p>

      {loading ? <div className="loading">Carregando...</div> : itensFiltrados.length === 0 ? (
        <div className="empty-message">Nenhum lançamento encontrado.</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Descrição</th><th>Cliente</th><th>Tipo</th><th>Valor</th><th>Data</th><th>Status</th>
                {(podeEditar || podeExcluir) && <th style={{ width: '110px' }}>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {itensFiltrados.map(i => (
                <tr key={i.id}>
                  <td><strong>{i.descricao}</strong></td><td>{i.cliente || '-'}</td>
                  <td><span className={`status-pill ${i.tipo === 'Receita' ? 'status-normal' : 'status-urgente'}`}>{i.tipo}</span></td>
                  <td style={{ fontWeight: 600 }}>{formatarMoeda(i.valor)}</td><td>{formatarData(i.data)}</td><td>{i.status}</td>
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